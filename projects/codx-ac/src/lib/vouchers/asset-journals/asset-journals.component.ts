import { fmAssetJournal } from './../../codx-ac.service';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  CRUDService,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { AssetJournalsAddComponent } from './asset-journals-add/asset-journals-add.component';

@Component({
  selector: 'lib-asset-journals',
  templateUrl: './asset-journals.component.html',
  styleUrls: ['./asset-journals.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetJournalsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = []; // model view
  @ViewChild('templateDetailLeft') templateDetailLeft?: TemplateRef<any>;
  @ViewChild('templateDetailRight') templateDetailRight: TemplateRef<any>;
  @ViewChild('listTemplate') listTemplate?: TemplateRef<any>;
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  headerText: any;
  runmode: any;
  journalNo: string;
  itemSelected: any;
  userID: any;
  dataCategory: any;
  journal: any;
  baseCurr: any;
  legalName: any;
  dataDefault: any;
  hideFields: Array<any> = [];
  button: ButtonModel[] = [
    {
      //? nút thêm phiếu
      id: 'btnAdd',
      icon: 'icon-i-file-earmark-plus',
    },
  ];
  bhLogin: boolean = false;
  bankPayID: any;
  bankNamePay: any;
  bankReceiveName: any;
  viewActive: number = ViewType.listdetail;
  ViewType = ViewType;
  private destroy$ = new Subject<void>();
  fmAssetJournal = fmAssetJournal;
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private codxCommonService: CodxCommonService,
    private shareService: CodxShareService,
    private notification: NotificationsService
  ) {
    super(inject);
    this.cache
      .companySetting()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.baseCurr = res[0].baseCurr;
          this.legalName = res[0].legalName;
        }
      });
    this.router.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.journalNo = params?.journalNo;
    });
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    if (!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
    this.cache
      .functionList(this.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.headerText = res?.defaultName || res?.customName;
          this.runmode = res?.runMode;
        }
      });
    this.getJournal();
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngAfterViewInit() {
    this.views = [
      // {
      //   type: ViewType.listdetail,
      //   active: true,
      //   sameData: true,
      //   model: {
      //     template: this.templateDetailLeft,
      //     panelRightRef: this.templateDetailRight,
      //     collapsed: true,
      //     widthLeft: '23%',
      //     //separatorSize:3
      //   },
      // },
      // {
      //   type: ViewType.list,
      //   active: false,
      //   sameData: true,
      //   model: {
      //     template: this.listTemplate,
      //   },
      // },
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateGrid,
        },
      },
      // {
      //   type: ViewType.grid_detail,
      //   active: false,
      //   sameData: true,
      //   model: {
      //     template2: this.templateGrid,

      //   },

      //   request:{service:'AC'},
      //   subModel:{
      //     entityName:'AC_CashPaymentsLines',
      //     formName:'CashPaymentsLines',
      //     gridviewName:'grvCashPaymentsLines',
      //     parentField:'TransID',
      //     parentNameField:'VoucherNo',
      //     hideMoreFunc:true,
      //     request:{
      //       service: 'AC',
      //     },
      //     idField:'recID'
      //   }
      // },
    ];
    this.acService.setChildLinks();
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  /**
   * *Hàm hủy các obsevable subcrible
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion Init

  //#region Event

  /**
   * * Hàm xử lí click toolbar
   * @param event
   */
  toolbarClick(event) {
    switch (event.id) {
      case 'btnAdd':
        this.addNewVoucher();
        break;
    }
  }

  /**
   * *Hàm click các morefunction
   * @param event
   * @param data
   */
  clickMoreFunction(e, data) {
    this.itemSelected = data;
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        // this.delete(data);
        break;
    }
  }

  /**
   * * Hàm get data và get dữ liệu chi tiết của chứng từ khi được chọn
   * @param event
   * @returns
   */
  onSelectedItem(event) {
    this.itemSelected = event;
    this.detectorRef.detectChanges();
  }

  viewChanged(view) {
    if (view && view?.view?.type == this.viewActive) return;
    this.viewActive = view?.view?.type;
    this.detectorRef.detectChanges();
  }

  //#endregion Event

  //#region Function

  /**
   * *Hàm thêm mới chứng từ
   */
  addNewVoucher() {
    this.view.dataService
      .addNew((o) => this.setDefault(this.dataDefault))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res != null) {
          res.isAdd = true;
          if (this.dataDefault == null) this.dataDefault = JSON.parse(JSON.stringify({ ...res }));
          let data = {
            headerText: this.headerText,
            journal: { ...this.journal },
            oData: { ...res },
            hideFields: [...this.hideFields],
            baseCurr: this.baseCurr,
          };
          let optionSidebar = new SidebarModel();
          optionSidebar.DataService = this.view?.dataService;
          optionSidebar.FormModel = this.fmAssetJournal;
          let dialog = this.callfc.openSide(
            AssetJournalsAddComponent,
            data,
            optionSidebar,
            this.view.funcID
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              this.detectorRef.detectChanges();
            }
          });
        }
      });
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        res.isEdit = true;
        if (this.dataDefault == null) this.dataDefault = { ...res };
        let data = {
          headerText: this.headerText,
          journal: { ...this.journal },
          oData: { ...res },
          hideFields: [...this.hideFields],
          baseCurr: this.baseCurr,
        };
        let optionSidebar = new SidebarModel();
        optionSidebar.DataService = this.view?.dataService;
        optionSidebar.FormModel = this.fmAssetJournal;
        let dialog = this.callfc.openSide(
          AssetJournalsAddComponent,
          data,
          optionSidebar,
          this.view.funcID
        );
        dialog.closed.subscribe((res) => {
          if (res && res?.event) {
            this.itemSelected = JSON.parse(JSON.stringify(res?.event));
            this.view.dataService.update(this.itemSelected, true).subscribe((ele)=>{});
            this.detectorRef.detectChanges();

          }
        });
      });
  }
  /**
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view danh sách và danh sách chi tiết)
   * @param event : danh sách morefunction
   * @param data
   * @returns
   */
  changeMFDetail(event: any, type: any = '') {}

  /**
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data: any, action: any = '') {
    return this.api.exec('AM', 'AssetJournalsBusiness', 'SetDefaultAsync', [
      data,
      this.journal,
      action,
    ]);
  }

  /**
   * *Hàm get data mặc định của chứng từ
   */
  getJournal() {
    this.api
      .exec('AC', 'ACBusiness', 'GetJournalAsync', [this.journalNo])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          console.log(res);
          this.journal = res[0]; // data journal
          this.hideFields = res[1]; // array field ẩn từ sổ nhật kí
        }
      });
  }

  //#endregion
}
