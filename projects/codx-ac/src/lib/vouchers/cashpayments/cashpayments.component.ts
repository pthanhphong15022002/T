import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  CallFuncService,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  TenantStore,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CashPaymentAdd } from './cashpayments-add/cashpayments-add.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { CodxAcService } from '../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import {
  AnimationModel,
  ProgressBar,
} from '@syncfusion/ej2-angular-progressbar';
import { CodxListReportsComponent } from 'projects/codx-share/src/lib/components/codx-list-reports/codx-list-reports.component';
import { Subject, interval, takeUntil } from 'rxjs';
import { RoundService } from '../../round.service';
@Component({
  selector: 'lib-cashpayments',
  templateUrl: './cashpayments.component.html',
  styleUrls: ['./cashpayments.component.css', '../../codx-ac.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashPaymentsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = []; // model view
  @ViewChild('templateDetailLeft') templateDetailLeft?: TemplateRef<any>; //? template view danh sách chi tiết (trái)
  @ViewChild('templateDetailRight') templateDetailRight: TemplateRef<any>; //? template view danh sách chi tiết (phải)
  @ViewChild('listTemplate') listTemplate?: TemplateRef<any>; //? template view danh sách
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>; //? template view lưới
  @ViewChild('elementTabDetail') elementTabDetail: TabComponent; //? element object các tab detail (hạch toán,thông tin hóa đơn,hóa đơn GTGT)
  @ViewChild('progressbarTable') progressbarTable: ProgressBar; //? progressBar của table
  headerText: any; //? tên tiêu đề truyền cho form thêm mới
  journalNo: string; //? số của sổ nhật kí
  itemSelected: any; //? data của view danh sách chi tiết khi được chọn
  userID: any; //?  tên user đăng nhập
  dataCategory: any; //? data của category
  journal: IJournal; //? data sổ nhật kí
  totaltransAmt1: any = 0; //? tổng tiền nợ tab hạch toán
  totaltransAmt2: any = 0; //? tông tiền có tab hạch toán
  totalsettledAmt: any = 0; //? tổng tiền thanh toán tab thông tin hóa đơn
  totalbalAmt: any = 0; //? tổng tiền số dư tab thông tin hóa đơn
  totalVatBase: any = 0; //? tổng tiền số tiền tab hóa đơn GTGT
  totalVatAtm: any = 0; //? tổng tiền thuế tab hóa đơn GTGT
  settledInvoices: any; //? data của tab thông tin hóa đơn
  vatInvoices: any; //? data của tab hóa đợn GTGT
  acctTrans: any; //? data của tab hạch toán
  baseCurr: any; //? đồng tiền hạch toán
  dataDefaultCashpayment: any; //? data default của phiếu
  isLoadData: any = true; //? trạng thái load data
  hideFields: Array<any> = []; //? array field được ẩn lấy từ journal
  fmCashPaymentsLines: FormModel = { //? formModel của cashpaymentlines
    formName: 'CashPaymentsLines',
    gridViewName: 'grvCashPaymentsLines',
    entityName: 'AC_CashPaymentsLines',
  };
  fmAcctTrans: FormModel = { //? formModel của acctTrans
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityName: 'AC_AcctTrans',
  };
  fmSettledInvoices: FormModel = { //? formModel của settledInvoices
    formName: 'SettledInvoices',
    gridViewName: 'grvSettledInvoices',
    entityName: 'AC_SettledInvoices',
  };
  fmVatInvoices: FormModel = { //? formModel của vatInvoices
    formName: 'VATInvoices',
    gridViewName: 'grvVATInvoices',
    entityName: 'AC_VATInvoices',
  };
  tabInfo: TabModel[] = [ //? danh sách các tab footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  button: ButtonModel = { //? nút thêm phiếu
    id: 'btnAdd',
    icon: 'icon-i-file-earmark-plus',
  };
  optionSidebar: SidebarModel = new SidebarModel;
  public animation: AnimationModel = { enable: true, duration: 1000, delay: 0 }; //? animation của progressbar table
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private authStore: AuthStore,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    private tenant: TenantStore
  ) {
    super(inject);
    this.authStore = inject.get(AuthStore);
    this.userID = this.authStore.get().userID; //? get tên user đăng nhập
    this.cache
      .companySetting()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.baseCurr = res[0].baseCurr; //? get đồng tiền hạch toán
      });
    this.router.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.journalNo = params?.journalNo; //? get số journal từ router
      });
  }
  //#endregion

  //#region Init

  onInit(): void {
    this.getDataDefaultVoucher(); //? lấy data mặc định truyền vào form thêm
  }

  ngAfterViewInit() {
    this.cache
      .functionList(this.view.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) this.headerText = res.defaultName; //? lấy tên chứng từ (Phiếu chi)
      });

    this.views = [
      {
        type: ViewType.listdetail, //? thiết lập view danh sách chi tiết
        active: true,
        sameData: true,

        model: {
          template: this.templateDetailLeft,
          panelRightRef: this.templateDetailRight,
        },
      },
      {
        type: ViewType.list, //? thiết lập view danh sách
        active: true,
        sameData: true,

        model: {
          template: this.listTemplate,
        },
      },
      {
        type: ViewType.grid, //? thiết lập view lưới
        active: true,
        sameData: true,
        model: {
          template2: this.templateGrid,
        },
      },
    ];

    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.view.dataService;
    this.optionSidebar.FormModel = this.view.formModel;
    this.optionSidebar.isFull = true;
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  //#endregion

  //#region Event

  /**
   * * Hàm click button thêm mới
   * @param event 
   */
  btnAddClick(event) {
    switch (event.id) {
      case 'btnAdd':
        let ins = setInterval(() => {
          if (this.dataDefaultCashpayment) {
            clearInterval(ins);
            this.addNewVoucher(); //? thêm mới chứng từ
          }
        }, 200);
        setTimeout(() => {
          if (ins) clearInterval(ins);
        }, 10000);
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
        this.copyVoucher(data); //? sao chép chứng từ
        break;
      case 'SYS002':
        this.exportVoucher(data); //? xuất dữ liệu chứng từ
        break;
      case 'ACT041002':
        this.releaseVoucher(data); //? gửi duyệt chứng từ
        break;
      case 'ACT041004':
        this.cancelReleaseVoucher(data); //? hủy yêu cầu duyệt chứng từ
        break;
      case 'ACT041009':
        this.validateVourcher(data); //? kiểm tra tính hợp lệ chứng từ
        break;
      case 'ACT041003':
        this.postVoucher(data); //? ghi sổ chứng từ
        break;
      case 'ACT041010':
        this.printVoucher(data, e.functionID); //? in chứng từ
        break;
    }
  }

  //#endregion

  //#region Function

  /**
   * *Hàm thêm mới chứng từ
   */
  addNewVoucher() {
    this.dataDefaultCashpayment.recID = Util.uid(); //? tạo recID mới
    let data = {
      action: 'add', //? trạng thái của form (thêm mới)
      headerText: this.headerText, //? tiêu đề voucher
      journal: { ...this.journal }, //?  data journal
      dataCashpayment: {...this.dataDefaultCashpayment}, //?  data của cashpayment
      hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
      baseCurr: this.baseCurr, //?  đồng tiền hạch toán
    };
    this.callfc.openSide(
      CashPaymentAdd,
      data,
      this.optionSidebar,
      this.view.funcID
    );
  }

  /**
   * *Hàm chỉnh sửa chứng từ
   * @param dataEdit : data chứng từ chỉnh sửa
   */
  editVoucher(dataEdit) {
    let data = {
      action: 'edit', //? trạng thái của form (chỉnh sửa)
      headerText: this.headerText, //? tiêu đề voucher
      journal: { ...this.journal }, //?  data journal
      dataCashpayment: {...dataEdit}, //?  data của cashpayment
      hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
      baseCurr: this.baseCurr, //?  đồng tiền hạch toán
    };
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.callfc.openSide(CashPaymentAdd, data, this.optionSidebar, this.view.funcID);
      });
  }

  /**
   * *Hàm sao chép chứng từ
   * @param event 
   * @param dataCopy : data chứng từ sao chép
   */
  copyVoucher(dataCopy) {
    let data = {
      action: 'copy', //? trạng thái của form (chỉnh sửa)
      headerText: this.headerText, //? tiêu đề voucher
      journal: { ...this.journal }, //?  data journal
      dataCashpayment: {...dataCopy}, //?  data của cashpayment
      hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
      baseCurr: this.baseCurr, //?  đồng tiền hạch toán
    };
    this.view.dataService.copy().subscribe((res: any) => {
      this.callfc.openSide(CashPaymentAdd, data, this.optionSidebar, this.view.funcID);
    });
  }

  /**
   * *Hàm xóa chứng từ
   * @param dataDelete : data xóa
   */
  deleteVoucher(dataDelete) {
    this.view.dataService.delete([dataDelete], true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {});
  }

  /**
   * *Xuất file theo template(Excel,PDF,...)
   * @param data 
   */
  exportVoucher(data) {
    var gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
    //Chưa có group
    gridModel.groupFields = 'createdBy';
    this.callfc.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [gridModel, data.recID],
      null
    );
  }

  /**
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view danh sách và danh sách chi tiết)
   * @param event : danh sách morefunction 
   * @param data
   * @returns 
   */
  changeTmpDetailMF(event: any, data: any) {
    let arrBookmark = event.filter( // danh sách các morefunction
      (x: { functionID: string }) =>
        x.functionID == 'ACT041003' || // MF ghi sổ
        x.functionID == 'ACT041002' || // MF gửi duyệt
        x.functionID == 'ACT041004' || // MF hủy yêu cầu duyệt
        x.functionID == 'ACT041008' || // Mf khôi phục
        x.functionID == 'ACT042901' || // Mf chuyển tiền điện tử
        x.functionID == 'ACT041010' || // Mf in
        x.functionID == 'ACT041009'    // MF kiểm tra tính hợp lệ
    );
    if (arrBookmark.length > 0) {
      switch (data?.status) {
        case '0':
          arrBookmark.forEach((element) => {
            if (
              element.functionID == 'ACT041009' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '1':
          if (this.journal.approvalControl == '0') {
            arrBookmark.forEach((element) => {
              if (
                element.functionID == 'ACT041003' ||
                element.functionID == 'ACT041010'
              ) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          } else {
            arrBookmark.forEach((element) => {
              if (
                element.functionID == 'ACT041002' ||
                element.functionID == 'ACT041010'
              ) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          }
          break;
        case '2':
        case '4':
          arrBookmark.forEach((element) => {
            element.disabled = true;
          });
          break;
        case '3':
          arrBookmark.forEach((element) => {
            if (
              element.functionID == 'ACT041004' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '5':
          arrBookmark.forEach((element) => {
            if (
              element.functionID == 'ACT041003' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '6':
          arrBookmark.forEach((element) => {
            if (
              element.functionID == 'ACT041008' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '9':
          arrBookmark.forEach((element) => {
            if (
              element.functionID == 'ACT041003' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
      }
    }
    return;
  }

  /**
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view lưới)
   * @param event : danh sách morefunction  
   * @param data 
   */
  changeTmpGridMF(event: any, data: any) {
    let arrBookmark = event.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ACT041003' || //? MF ghi sổ
        x.functionID == 'ACT041002' || //? MF gửi duyệt
        x.functionID == 'ACT041004' || //? MF hủy yêu cầu duyệt
        x.functionID == 'ACT041008' || //? MF khôi phục
        x.functionID == 'ACT042901' || //? MF chuyển tiền điện tử
        x.functionID == 'ACT041010' || //? MF in
        x.functionID == 'ACT041009' //? MF kiểm tra tính hợp lệ
    );
    if (arrBookmark.length > 0) {
      arrBookmark.forEach((element) => {
        element.isbookmark = false;
      });
      switch (data?.status) {
        case '0':
          arrBookmark.forEach((element) => {
            if (
              element.functionID == 'ACT041009' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '1':
          if (this.journal.approvalControl == '0') {
            arrBookmark.forEach((element) => {
              if (
                element.functionID == 'ACT041003' ||
                element.functionID == 'ACT041010'
              ) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          } else {
            arrBookmark.forEach((element) => {
              if (
                element.functionID == 'ACT041002' ||
                element.functionID == 'ACT041010'
              ) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          }
          break;
        case '2':
        case '4':
          arrBookmark.forEach((element) => {
            element.disabled = true;
          });
          break;
        case '3':
          arrBookmark.forEach((element) => {
            if (
              element.functionID == 'ACT041004' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '5':
          arrBookmark.forEach((element) => {
            if (
              element.functionID == 'ACT041003' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '6':
          arrBookmark.forEach((element) => {
            if (
              element.functionID == 'ACT041008' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '9':
          arrBookmark.forEach((element) => {
            if (
              element.functionID == 'ACT041003' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
      }
    }
  }

  /**
   * * Hàm get data và get dữ liệu chi tiết của chứng từ khi được chọn
   * @param event 
   * @returns 
   */
  changeItemSelected(event) {
    if (typeof event.data !== 'undefined') {
      if (event?.data.data || event?.data.error) {
        return;
      } else {
        this.itemSelected = event?.data;
        this.getDatadetail(this.itemSelected);
        if (this.itemSelected && this.itemSelected.recID == event?.data.recID) {
          return;
        } 
      }
    }
  }

  /**
   * *Hàm get data chi tiết của các tab (hạch toán,thông tin hóa đơn,hóa đơn GTGT)
   * @param data 
   */
  getDatadetail(data) {
    this.isLoadData = true; // bật progressbar của tab
    this.acctTrans = [];
    this.settledInvoices = [];
    this.vatInvoices = [];
    this.api.exec('AC', 'AcctTransBusiness', 'GetListDataDetailAsync', [
        data.subType,
        data.recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res:any) => {
        if (res) {
          this.acctTrans = res?.lsAcctrants;
          this.settledInvoices = res?.lsSettledInvoices;
          this.vatInvoices = res?.lsVATInvoices;
          this.isLoadData = false; // tắt progressbar của tab
          this.detectorRef.detectChanges();
        }
      });     
    this.showHideTab(data.subType); // ẩn hiện các tab detail
  }

  /**
   * *Hàm gửi duyệt chứng từ (xử lí cho MF gửi duyệt)
   * @param data 
   */
  releaseVoucher(data: any) {
    this.acService
      .getCategoryByEntityName(this.view.formModel.entityName)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.dataCategory = res;
        this.shareService
          .codxRelease(
            'AC',
            data.recID,
            this.dataCategory.processID,
            this.view.formModel.entityName,
            this.view.formModel.funcID,
            '',
            '',
            ''
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe((result) => {
            if (result?.msgCodeError == null && result?.rowCount) {
              this.notification.notifyCode('ES007');
              data.status = '3';
              this.itemSelected = { ...data };
              this.getDatadetail(this.itemSelected);
              this.view.dataService.update(data).subscribe((res) => {});
              this.detectorRef.detectChanges();
            } else this.notification.notifyCode(result?.msgCodeError);
          });
      });
  }

  /**
   * *Hàm hủy gửi duyệt chứng từ (xử lí cho MF hủy yêu cầu duyệt)
   * @param data 
   */
  cancelReleaseVoucher(data: any) {
    this.shareService
      .codxCancel('AC', data?.recID, this.view.formModel.entityName, null, null)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        if (result && result?.msgCodeError == null) {
          this.notification.notifyCode('SYS034');
          this.acService
            .loadData('AC', 'CashPaymentsBusiness', 'UpdateStatusAsync', [
              data,
              '1',
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res) {
                this.itemSelected = res;
                this.getDatadetail(this.itemSelected);
                this.view.dataService
                  .update(this.itemSelected)
                  .subscribe((res) => {});
                this.detectorRef.detectChanges();
              }
            });
        } else this.notification.notifyCode(result?.msgCodeError);
      });
  }

  /**
   * *Hàm kiểm tra tính hợp lệ của chứng từ (xử lí cho MF kiểm tra tính hợp lệ)
   * @param data 
   */
  validateVourcher(data: any) {
    this.acService
      .execApi('AC', 'CashPaymentsBusiness', 'ValidateVourcherAsync', [data])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          data.status = '1';
          this.itemSelected = data;
          this.getDatadetail(this.itemSelected);
          this.view.dataService.update(this.itemSelected).subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * *Hàm ghi sổ chứng từ (xử lí cho MF ghi sổ)
   * @param data 
   */
  postVoucher(data: any) {
    // chưa xử lí
  }

  /**
   * *Hàm get data mặc định của chứng từ
   */
  getDataDefaultVoucher() {
    this.api.exec('AC', 'CommonBusiness', 'GetDataDefaultVoucherAsync', [
        this.journalNo,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.journal = res.journal; // data journal
          this.dataDefaultCashpayment = res.dataDefault.data; // data cashpayment mặc định
          this.hideFields = res.hideFields; // array field ẩn từ sổ nhật kí
          this.setTotalRecord()
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * Hàm tính tổng các số tiền của các tab detail(hạch toán,thông tin hóa đơn,hóa đơn GTGT)
   */
  setTotalRecord() {
    this.totaltransAmt1 = 0;
    this.totaltransAmt2 = 0;
    this.totalbalAmt = 0;
    this.totalsettledAmt = 0;
    this.totalVatAtm = 0;
    this.totalVatBase = 0;
    if (this.acctTrans && this.acctTrans.length > 0) {
      this.acctTrans.forEach(item => {
        if (!item.crediting) {
          this.totaltransAmt1 += item.transAmt;
        }else{
          this.totaltransAmt2 += item.transAmt;
        }
      });
    }

    if (this.settledInvoices && this.settledInvoices.length > 0) {
      this.settledInvoices.forEach(item => {
        this.totalbalAmt += item.balAmt;
        this.totalsettledAmt += item.settledAmt;
      });
    }

    if (this.vatInvoices && this.vatInvoices.length > 0) {
      this.vatInvoices.forEach(item => {
        this.totalVatAtm += item.vatAmt;
        this.totalVatBase += item.vatBase;
      });
    }
  }

  /**
   * *Hàm khởi tạo các tab detail 
   * @param e 
   * @param ele 
   */
  createTab(e: any, ele: TabComponent) {
    this.showHideTab(this.itemSelected.subType, ele);
  }

  /**
   * *Hàm ẩn hiện các tab khi thay đổi chứng từ theo loại chứng từ
   * @param event 
   * @param ele 
   */
  showHideTab(type: any, ele?: TabComponent) {
    ele = this.elementTabDetail;
    if (ele) {
      ele.hideTab(0, false);
      switch (type) {
        case '1':
        case '3':
        case '4':
          ele.hideTab(1, true);
          ele.hideTab(2, true);
          break;
        case '2':
          ele.hideTab(1, false);
          ele.hideTab(2, true);
          break;
        case '9':
          ele.hideTab(1, false);
          ele.hideTab(2, false);
          break;
      }
    }
  }

  /**
   * *Hàm in chứng từ (xử lí cho MF In)
   * @param data 
   * @param reportID 
   * @param reportType 
   */
  printVoucher(data: any, reportID: any, reportType: string = 'V') {
    this.api
      .execSv(
        'rptrp',
        'Codx.RptBusiness.RP',
        'ReportListBusiness',
        'GetListReportByIDandType',
        [reportID, reportType]
      )
      .subscribe((res: any) => {
        if (res != null) {
          if (res.length > 1) {
            this.openFormReportVoucher(data, res);
          } else if (res.length == 1) {
            window.open(
              '/' +
                this.tenant.getName() +
                '/' +
                'ac/report/detail/' +
                `${res[0].recID}`
            );
          }
        }
      });
  }

  /**
   * *Hàm mở form báo cáo
   */
  openFormReportVoucher(data: any, reportList: any) {
    var obj = {
      data: data,
      reportList: reportList,
      url: 'ac/report/detail/',
    };
    let opt = new DialogModel();
    var dialog = this.callfc.openForm(
      CodxListReportsComponent,
      '',
      400,
      600,
      '',
      obj,
      '',
      opt
    );
  }

  /**
   * *Hàm hỗ trợ ngFor không render lại toàn bộ data
   */
  trackByFn(index, item) {
    return item.recID;
  }

  /**
   * *Hàm hủy các obsevable subcrible
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion
}
