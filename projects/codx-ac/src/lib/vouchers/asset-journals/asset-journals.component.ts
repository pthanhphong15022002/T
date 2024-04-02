import {
  fmAssetAcquisitionsJournal,
  fmAssetRevaluationsJournal,
  fmAssetLiquidationsJournal,
  fmCountingMembers,
  fmAssetTransfersJournal,
  fmAssetDepreciationsJournal,
  fmAssetCountingsJournal,
} from './../../codx-ac.service';
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
  DialogModel,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  Util,
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
  fmAssetJournal: FormModel;
  fmCountingMembers = fmCountingMembers;
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
    if (!this.funcID) {
      this.funcID = this.router.snapshot.params['funcID'];
      switch (this.funcID) {
        case 'ACT811':
          this.fmAssetJournal = fmAssetAcquisitionsJournal;
          break;
        case 'ACT821':
          this.fmAssetJournal = fmAssetRevaluationsJournal;
          break;
        case 'ACT871':
          this.fmAssetJournal = fmAssetLiquidationsJournal;
          break;
        case 'ACT831':
          this.fmAssetJournal = fmAssetTransfersJournal;
          break;
        case 'ACT841':
          this.fmAssetJournal = fmAssetDepreciationsJournal;
          break;
        case 'ACT881':
          this.fmAssetJournal = fmAssetCountingsJournal;
          break;
      }
    }
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
        this.delete(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS05':
        this.viewData(data);
        break;
      case 'ACT81101': //Kiểm tra hợp lệ - thay morore sau
      case 'ACT82101':
      case 'ACT87101':
        this.validateVourcher(e.text, data); //? kiểm tra tính hợp lệ chứng từ
        break;
      case 'ACT81106':
      case 'ACT82106':
      case 'ACT87106':
        this.postVoucher(e.text, data); //? ghi sổ chứng từ
        break;
      case 'ACT81107':
      case 'ACT82107':
      case 'ACT87107':
        this.unPostVoucher(e.text, data); //? khôi phục chứng từ
        break;
      case 'ACT81108': //Hủy phiếu
      case 'ACT82108':
      case 'ACT87108':
        break;
      case 'ACT81102': //In phiếu
      case 'ACT82102':
      case 'ACT87102':
        this.printVoucher(data, e.functionID);
        break;
    }
  }
  /**
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view danh sách và danh sách chi tiết)
   * @param event : danh sách morefunction
   * @param data
   * @returns
   */
  changeMFDetail(e: any, dataSelectd, type = '') {
    let data = dataSelectd ?? this.view?.dataService?.dataSelected;
    if (e != null) {
      e.forEach((res) => {
        if (type === 'grid') res.isbookmark = false;
        if (
          ['SYS03', 'SYS02'].includes(res.functionID) &&
          data?.status != '0' &&
          data?.status != '1' &&
          data?.status != '2'
        )
          res.disabled = true;

        switch (data?.status) {
          case '0':
            if (
              ![
                'ACT81101', //Kiểm tra hợp lệ
                'ACT82101',
                'ACT87101',
                'ACT82102',
                'ACT87102',
                'ACT81102', // In phiếu
              ].includes(res.functionID)
            )
              res.disabled = true;
            break;
          case '1':
            if (
              ![
                'ACT81106', //Ghi sổ
                'ACT82106',
                'ACT87106',
                'ACT87102',
                'ACT82102',
                'ACT81102', // In phiếu
              ].includes(res.functionID)
            )
              res.disabled = true;

            break;

          case '2':
            if (
              ![
                'ACT81101', // Kiểm tra hợp lệ
                'ACT82101',
                'ACT87101',
                'ACT82102',
                'ACT87102',
                'ACT81102', // In phiếu
              ].includes(res.functionID)
            )
              res.disabled = true;
            break;

          case '3':
            if (!['ACT81102', 'ACT82102', 'ACT87102'].includes(res.functionID))
              res.disabled = true;
            break;

          case '5':
          case '9':
            if (
              ![
                'ACT81106',
                'ACT82106',
                'ACT87106',
                'ACT81102',
                'ACT87102',
                'ACT82102',
              ].includes(res.functionID)
            )
              res.disabled = true;
            break;

          case '6':
            if (
              ![
                'ACT81107',
                'ACT82107',
                'ACT87107',
                'ACT81102',
                'ACT82102',
                'ACT87102',
              ].includes(res.functionID)
            )
              res.disabled = true;
            break;

          case '10':
            if (!['ACT81106', 'ACT82106', 'ACT87106'].includes(res.functionID))
              res.disabled = true;
            break;

          // case '8':
          // case '11':
          //   if (
          //     ![MorfuncCash.InUNC, MorfuncCash.KiemTraTrangThai].includes(
          //       element.functionID
          //     )
          //   )
          //     element.disabled = true;
          //   break;

          default:
            res.disabled = true;
            break;
        }
        if (['SYS05'].includes(res.functionID)) res.disabled = false;
      });
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
          if (this.dataDefault == null)
            this.dataDefault = JSON.parse(JSON.stringify({ ...res }));
          let data = {
            headerText: this.headerText,
            journal: { ...this.journal },
            oData: { ...res },
            hideFields: [...this.hideFields],
            baseCurr: this.baseCurr,
          };
          let dialogModel = new DialogModel();
          dialogModel.IsFull = true;
          dialogModel.zIndex = 999;
          dialogModel.DataService = this.view?.dataService;
          dialogModel.FormModel = this.fmAssetJournal;
          dialogModel.FormModel.funcID = this.view.funcID;

          let dialog = this.callfc.openForm(
            AssetJournalsAddComponent,
            '',
            Util.getViewPort().width - 100,
            Util.getViewPort().height - 100,
            '',
            data,
            '',
            dialogModel
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
        let data = {
          headerText: this.headerText,
          journal: { ...this.journal },
          oData: { ...res },
          hideFields: [...this.hideFields],
          baseCurr: this.baseCurr,
        };
        let dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        dialogModel.zIndex = 999;
        dialogModel.DataService = this.view?.dataService;
        dialogModel.FormModel = this.fmAssetJournal;
        dialogModel.FormModel.funcID = this.view.funcID;

        let dialog = this.callfc.openForm(
          AssetJournalsAddComponent,
          '',
          Util.getViewPort().width - 100,
          Util.getViewPort().height - 100,
          '',
          data,
          '',
          dialogModel
        );
        dialog.closed.subscribe((res) => {
          if (res && res?.event) {
            this.itemSelected = JSON.parse(JSON.stringify(res?.event));
            this.view.dataService
              .update(this.itemSelected, true)
              .subscribe((ele) => {});
            this.detectorRef.detectChanges();
          }
        });
      });
  }

  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res != null) {
          res.isCopy = true;
          if (this.dataDefault == null)
            this.dataDefault = JSON.parse(JSON.stringify({ ...res }));
          let data = {
            headerText: this.headerText,
            journal: { ...this.journal },
            oData: { ...res },
            hideFields: [...this.hideFields],
            baseCurr: this.baseCurr,
          };
          let dialogModel = new DialogModel();
          dialogModel.IsFull = true;
          dialogModel.zIndex = 999;
          dialogModel.DataService = this.view?.dataService;
          dialogModel.FormModel = this.fmAssetJournal;
          dialogModel.FormModel.funcID = this.view.funcID;
          let dialog = this.callfc.openForm(
            AssetJournalsAddComponent,
            '',
            Util.getViewPort().width - 100,
            Util.getViewPort().height - 100,
            '',
            data,
            '',
            dialogModel
          );
          dialog.closed.subscribe((res) => {
            if (res && res.event != null) {
              this.itemSelected = JSON.parse(JSON.stringify(res.event));
              this.view.dataService.update(this.itemSelected, true).subscribe();
              this.detectorRef.detectChanges();
            }
          });
        }
      });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .delete([data], true, (option: RequestOption) =>
        this.beforeDelete(option, data)
      )
      .subscribe((res: any) => {
        if (res) {
          this.view.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
        }
      });
  }

  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAssetJournalsAsync';
    opt.className = 'AssetJournalsBusiness';
    opt.assemblyName = 'AM';
    opt.service = 'AM';
    opt.data = data.recID;
    return true;
  }

  viewData(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        res.isReadOnly = true;
        let data = {
          headerText: this.headerText,
          journal: { ...this.journal },
          oData: { ...res },
          hideFields: [...this.hideFields],
          baseCurr: this.baseCurr,
        };
        let dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        dialogModel.zIndex = 999;
        dialogModel.DataService = this.view?.dataService;
        dialogModel.FormModel = this.fmAssetJournal;
        dialogModel.FormModel.funcID = this.view.funcID;
        let dialog = this.callfc.openForm(
          AssetJournalsAddComponent,
          '',
          Util.getViewPort().width - 100,
          Util.getViewPort().height - 100,
          '',
          data,
          '',
          dialogModel
        );
        dialog.closed.subscribe((res) => {
          if (res && res?.event) {
            this.itemSelected = JSON.parse(JSON.stringify(res?.event));
            this.view.dataService
              .update(this.itemSelected, true)
              .subscribe((ele) => {});
            this.detectorRef.detectChanges();
          }
        });
      });
  }

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

  //#region more
  validateVourcher(text: any, data: any) {
    this.api
      .exec('AM', 'AssetJournalsBusiness', 'ValidateVourcherAsync', [
        data,
        text,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res[1]) {
          this.itemSelected = res[0];
          this.view.dataService.update(this.itemSelected, true).subscribe();
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
        this.onDestroy();
      });
  }
  /**
   * *Hàm ghi sổ chứng từ (xử lí cho MF ghi sổ)
   * @param data
   */
  postVoucher(text: any, data: any) {
    this.api
      .exec('AM', 'AssetJournalsBusiness', 'PostVourcherAsync', [data, text])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res[1]) {
          this.itemSelected = res[0];
          this.view.dataService.update(this.itemSelected, true).subscribe();
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
        this.onDestroy();
      });
  }

  /**
   * *Hàm khôi phục chứng từ (xử lí cho MF khôi phục)
   * @param data
   */
  unPostVoucher(text: any, data: any) {
    this.api
      .exec('AM', 'AssetJournalsBusiness', 'UnPostVourcherAsync', [data, text])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res[1]) {
          this.itemSelected = res[0];
          this.view.dataService.update(this.itemSelected, true).subscribe();
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
        this.onDestroy();
      });
  }

  /**
   * *Hàm in chứng từ (xử lí cho MF In)
   * @param data
   * @param reportID
   * @param reportType
   */
  printVoucher(data: any, reportID: any, reportType: string = 'V') {
    let params = {
      Recs: data?.recID,
    };
    this.shareService.printReport(
      reportID,
      reportType,
      params,
      this.view?.formModel
    );
  }
  //#endregion
}
