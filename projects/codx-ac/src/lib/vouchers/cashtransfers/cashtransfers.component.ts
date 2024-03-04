import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, ButtonModel, CRUDService, FormModel, NotificationsService, SidebarModel, TenantStore, UIComponent, ViewModel, ViewType } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService, fmVATInvoices } from '../../codx-ac.service';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CashtransfersAddComponent } from './cashtransfers-add/cashtransfers-add.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-cashtransfers',
  templateUrl: './cashtransfers.component.html',
  styleUrls: ['./cashtransfers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashtransfersComponent extends UIComponent {
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
  dataDefault: any;
  hideFields: Array<any> = [];
  button: ButtonModel[] = [{
    id: 'btnAdd',
    icon: 'icon-i-file-earmark-plus',
  }];
  viewActive:number = ViewType.listdetail;
  ViewType = ViewType;
  fgVATInvoice: FormGroup;
  fmVATInvoice : FormModel = fmVATInvoices;
  VATInvoiceSV:CRUDService;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private authStore: AuthStore,
    private codxCommonService: CodxCommonService,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    private tenant: TenantStore,
  ) {
    super(inject);
    this.cache
      .companySetting()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.baseCurr = res[0].baseCurr;
        }
      });
    this.router.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.journalNo = params?.journalNo;
      });
    this.VATInvoiceSV = this.acService.createCRUDService(
      inject,
      this.fmVATInvoice,
      'AC'
    );
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    if(!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
    this.cache
    .functionList(this.funcID)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      if (res) {
        this.headerText = res?.defaultName || res?.customName;
        this.runmode = res?.runMode;
      }
    });
    this.fgVATInvoice = this.codxService.buildFormGroup(
      this.fmVATInvoice.formName,
      this.fmVATInvoice.gridViewName,
      this.fmVATInvoice.entityName
    );
    this.getJournal();
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngAfterViewInit() {
    this.views = [
      // {
      //   type: ViewType.listdetail, //? thiết lập view danh sách chi tiết
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
      //   type: ViewType.list, //? thiết lập view danh sách
      //   active: false,
      //   sameData: true,
      //   model: {
      //     template: this.listTemplate,
      //   },
      // },
      {
        type: ViewType.grid, //? thiết lập view lưới
        active: false,
        sameData: true,
        model: {
          template2: this.templateGrid,
        },
      },
      // {
      //   type: ViewType.grid_detail, //? thiết lập view lưới
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
      //     parentNameField:'Memo',
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
        this.addNewVoucher(); //? thêm mới chứng từ
        break;
    }
  }

  /**
   * *Hàm click các morefunction
   * @param event
   * @param data
   */
  clickMoreFunction(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteVoucher(data); //? xóa chứng từ
        break;
      case 'SYS03':
        this.editVoucher(data); //? sửa chứng từ
        break;
      case 'SYS04':
        //this.copyVoucher(data); //? sao chép chứng từ
        break;
      case 'SYS002':
        //this.exportVoucher(data); //? xuất dữ liệu chứng từ
        break;
      case 'ACT041002':
      case 'ACT042903':
        //this.releaseVoucher(e.text, data); //? gửi duyệt chứng từ
        break;
      case 'ACT041004':
      case 'ACT042904':
        //this.cancelReleaseVoucher(e.text, data); //? hủy yêu cầu duyệt chứng từ
        break;
      case 'ACT041009':
      case 'ACT042902':
       // this.validateVourcher(e.text, data); //? kiểm tra tính hợp lệ chứng từ
        break;
      case 'ACT041003':
      case 'ACT042905':
        //this.postVoucher(e.text, data); //? ghi sổ chứng từ
        break;
      case 'ACT041008':
      case 'ACT042906':
        //this.unPostVoucher(e.text, data); //? khôi phục chứng từ
        break;
      case 'ACT042901':
        //this.transferToBank(e.text, data); //? chuyển tiền ngân hàng điện tử
        break;
      case 'ACT041010':
      case 'ACT042907':
        //this.printVoucher(data, e.functionID); //? in chứng từ
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
    if(view && view?.view?.type == this.viewActive) return;
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
          if (this.dataDefault == null) this.dataDefault = { ...res };
          this.VATInvoiceSV.addNew().subscribe((res: any) => {
            if (res) {
              this.fgVATInvoice.patchValue(res);
              this.fmVATInvoice.currentData = res;
              let data = {
                headerText: this.headerText,
                journal: { ...this.journal },
                oData: { ...this.dataDefault }, 
                hideFields: [...this.hideFields],
                baseCurr: this.baseCurr,
                fgVATInvoice : this.fgVATInvoice,
                fmVATInvoice : this.fmVATInvoice,
                VATInvoiceSV: this.VATInvoiceSV
              };
              let optionSidebar = new SidebarModel();
              optionSidebar.DataService = this.view?.dataService;
              optionSidebar.FormModel = this.view?.formModel;
              let dialog = this.callfc.openSide(
                CashtransfersAddComponent,
                data,
                optionSidebar,
                this.view.funcID
              );
              dialog.closed.subscribe((res) => {
                if (res && res?.event) {
                  if (res?.event?.type === 'discard') {
                    if(this.view.dataService.data.length == 0){
                      this.itemSelected = undefined;
                      this.detectorRef.detectChanges();
                    } 
                  }
                }
              })
            }
          })
        }
      });
  }

  /**
   * *Hàm chỉnh sửa chứng từ
   * @param dataEdit : data chứng từ chỉnh sửa
   */
  editVoucher(dataEdit) {
    this.view.dataService.dataSelected = dataEdit;
    this.view.dataService
      .edit(dataEdit)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        res.isEdit = true;
        let data = {
          headerText: this.headerText,
          journal: { ...this.journal },
          oData: { ...res },
          hideFields: [...this.hideFields],
          baseCurr: this.baseCurr,
          fgVATInvoice: this.fgVATInvoice,
          fmVATInvoices: this.fmVATInvoice,
          VATInvoiceSV: this.VATInvoiceSV
        };
        let optionSidebar = new SidebarModel();
        optionSidebar.DataService = this.view?.dataService;
        optionSidebar.FormModel = this.view?.formModel;
        let dialog = this.callfc.openSide(
          CashtransfersAddComponent,
          data,
          optionSidebar,
          this.view.funcID
        );
        dialog.closed.subscribe((res) => {
          if (res && res?.event) {
            if (res?.event?.type === 'discard') {
              if(this.view.dataService.data.length == 0){
                this.itemSelected = undefined;
                this.detectorRef.detectChanges();
              } 
            }
          }
        })
      });
  }

  /**
   * *Hàm xóa chứng từ
   * @param dataDelete : data xóa
   */
  deleteVoucher(dataDelete) {
    this.view.dataService
      .delete([dataDelete], true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res && !res?.error) {
          if(this.view.dataService.data.length == 0){
            this.itemSelected = undefined;
            this.detectorRef.detectChanges();
          } 
        }
      });
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
          this.journal = res[0]; // data journal
          this.hideFields = res[1]; // array field ẩn từ sổ nhật kí
        }
      });
  }

  /**
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view danh sách và danh sách chi tiết)
   * @param event : danh sách morefunction
   * @param data
   * @returns
   */
  changeMFDetail(event: any,type: any = '') {
    let data = this.view.dataService.dataSelected;
    if (data) {
      //this.acService.changeMFCashPayment(event,data,type,this.journal,this.view.formModel);
    }
  }

  /**
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data: any, action: any = '') {
    return this.api.exec('AC', 'CashTranfersBusiness', 'SetDefaultAsync', [
      data,
      this.journal,
      this.journalNo,
      action,
    ]);
  }
  //#endregion Function
}
