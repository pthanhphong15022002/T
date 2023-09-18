import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange, ViewChild } from '@angular/core';
import { CodxAcService } from '../../codx-ac.service';
import { AuthStore, DataRequest, DialogModel, FormModel, NotificationsService, PageTitleService, SidebarModel, TenantStore, UIComponent, Util } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subject, takeUntil } from 'rxjs';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { CashPaymentAddComponent } from './cashpayments-add/cashpayments-add.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxListReportsComponent } from 'projects/codx-share/src/lib/components/codx-list-reports/codx-list-reports.component';
declare var jsBh: any;
@Component({
  selector: 'cashpayment-detail',
  templateUrl: './cashpayment-detail.component.html',
  styleUrls: ['./cashpayment-detail.component.css', '../../codx-ac.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashpaymentDetailComponent extends UIComponent {
  //#region Constructor
  @Input() recID: any;
  @Input() dataItem: any;
  @Input() dataService: any;
  @Input() formModel: any;
  @Input() baseCurr: any;
  @Input() journal: any;
  @Input() headerText: any;
  @Input() hideFields: any;
  @Input() legalName: any;
  @Input() dataDefault: any;
  @ViewChild('elementTabDetail') elementTabDetail: TabComponent; //? element object các tab detail (hạch toán,thông tin hóa đơn,hóa đơn GTGT)
  itemSelected : any;
  totalAcctDR: any = 0; //? tổng tiền nợ tab hạch toán
  totalAcctCR: any = 0; //? tông tiền có tab hạch toán
  totalTransAmt: any = 0; //? tổng tiền số tiền,NT tab hạch toán
  totalsettledAmt: any = 0; //? tổng tiền thanh toán tab thông tin hóa đơn
  totalbalAmt: any = 0; //? tổng tiền số dư tab thông tin hóa đơn
  totalsettledAmt2: any = 0; //? tổng tiền thanh toán tab thông tin hóa đơn,HT
  totalbalAmt2: any = 0; //? tổng tiền số dư tab thông tin hóa đơn,HT
  totalVatBase: any = 0; //? tổng tiền số tiền tab hóa đơn GTGT
  totalVatAtm: any = 0; //? tổng tiền thuế tab hóa đơn GTGT
  dataCategory: any; //? data của category
  optionSidebar: SidebarModel = new SidebarModel();
  bhLogin: boolean = false;
  tabInfo: TabModel[] = [
    //? danh sách các tab footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  fmCashPaymentsLines: FormModel = {
    //? formModel của cashpaymentlines
    formName: 'CashPaymentsLines',
    gridViewName: 'grvCashPaymentsLines',
    entityName: 'AC_CashPaymentsLines',
  };
  fmAcctTrans: FormModel = {
    //? formModel của acctTrans
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityName: 'AC_AcctTrans',
  };
  fmSettledInvoices: FormModel = {
    //? formModel của settledInvoices
    formName: 'SettledInvoices',
    gridViewName: 'grvSettledInvoices',
    entityName: 'AC_SettledInvoices',
  };
  fmVatInvoices: FormModel = {
    //? formModel của vatInvoices
    formName: 'VATInvoices',
    gridViewName: 'grvVATInvoices',
    entityName: 'AC_VATInvoices',
  };
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private authStore: AuthStore,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    private tenant: TenantStore,
    private pageTitle: PageTitleService
  ) {
    super(inject);
    this.authStore = inject.get(AuthStore);
    //this.userID = this.authStore.get().userID; //? get tên user đăng nhập
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngAfterViewInit() {
    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.dataService;
    this.optionSidebar.FormModel = this.formModel;
    this.optionSidebar.isFull = true;
  }

  ngOnChanges(value: SimpleChange) {
    this.getDataDetail(this.dataItem,this.recID);
  }   

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * *Hàm khởi tạo các tab detail
   * @param e
   * @param ele
   */
  createTab(e: any, ele: TabComponent) {
    this.showHideTab(this.itemSelected?.subType, ele);
  }

  //#endregion

  //#region Event
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
      case 'ACT042903':
        this.releaseVoucher(e.text, data); //? gửi duyệt chứng từ
        break;
      case 'ACT041004':
      case 'ACT042904':
        this.cancelReleaseVoucher(e.text, data); //? hủy yêu cầu duyệt chứng từ
        break;
      case 'ACT041009':
      case 'ACT042902':
        this.validateVourcher(e.text, data); //? kiểm tra tính hợp lệ chứng từ
        break;
      case 'ACT041003':
      case 'ACT042905':
        this.postVoucher(e.text, data); //? ghi sổ chứng từ
        break;
      case 'ACT041008':
      case 'ACT042906':
        this.unPostVoucher(e.text, data); //? khôi phục chứng từ
        break;
      case 'ACT042901':
        this.call();
        break;
      case 'ACT041010':
      case 'ACT042907':
        this.printVoucher(data, e.functionID); //? in chứng từ
        break;
    }
  }
  //#endregion Event

  //#region Function
  
  /**
   * *Hàm get data chi tiết 
   * @param data
   */
  getDataDetail(dataItem,recID) {
    this.api
      .exec('AC', 'CashPaymentsBusiness', 'GetDataDetailAsync', [dataItem,recID])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.itemSelected = res;
        this.setTotalRecord();
        this.showHideTab(this.itemSelected?.subType); // ẩn hiện các tab detail
        this.detectorRef.detectChanges();
      });
    
  }

  /**
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view danh sách và danh sách chi tiết)
   * @param event : danh sách morefunction
   * @param data
   * @returns
   */
  changeMFDetail(event: any, data: any,type:any = '') {
    let arrBookmark = event.filter(
      // danh sách các morefunction
      (x: { functionID: string }) =>
        x.functionID == 'ACT041003' || // MF ghi sổ (PC)
        x.functionID == 'ACT042905' || // MF ghi sổ (UNC)
        x.functionID == 'ACT041002' || // MF gửi duyệt (PC)
        x.functionID == 'ACT042903' || // MF gửi duyệt (UNC)
        x.functionID == 'ACT041004' || // MF hủy yêu cầu duyệt (PC)
        x.functionID == 'ACT042904' || // MF hủy yêu cầu duyệt (UNC)
        x.functionID == 'ACT041008' || // Mf khôi phục (PC)
        x.functionID == 'ACT042906' || // Mf khôi phục (UNC)
        x.functionID == 'ACT042901' || // Mf chuyển tiền điện tử
        x.functionID == 'ACT041010' || // Mf in (PC)
        x.functionID == 'ACT042907' || // Mf in (UNC)
        x.functionID == 'ACT041009' || // MF kiểm tra tính hợp lệ (PC)
        x.functionID == 'ACT042902' || // MF kiểm tra tính hợp lệ (UNC)
        x.functionID == 'ACT042901' // MF chuyển tiền điện tử
    );
    if (arrBookmark.length > 0) {
      if (type == 'viewgrid') {
        arrBookmark.forEach((element) => {
          element.isbookmark = false;
        });
      }
      switch (data?.status) {
        case '7':
          arrBookmark.forEach((element) => {
            if ((element.functionID == 'ACT041009' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042902' || element.functionID == 'ACT042907')) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '1':
          if (this.journal.approvalControl == '0') {
            arrBookmark.forEach((element) => {
              if ((element.functionID == 'ACT041003' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042905' || element.functionID == 'ACT042907')) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          } else {
            arrBookmark.forEach((element) => {
              if ((element.functionID == 'ACT041002' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042903' || element.functionID == 'ACT042907') || (element.functionID == 'ACT042901' && this.formModel.funcID == 'ACT0429')) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          }
          break;
        case '3':
          arrBookmark.forEach((element) => {
            if ((element.functionID == 'ACT041004' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042904' || element.functionID == 'ACT042907')) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '5':
          arrBookmark.forEach((element) => {
            if ((element.functionID == 'ACT041003' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042905' || element.functionID == 'ACT042907')) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '6':
          arrBookmark.forEach((element) => {
            if ((element.functionID == 'ACT041008' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042906' || element.functionID == 'ACT042907')) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '9':
          arrBookmark.forEach((element) => {
            if ((element.functionID == 'ACT041003' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042905' || element.functionID == 'ACT042907')) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        default:
          arrBookmark.forEach((element) => {
            element.disabled = true;
          });
          break;
      }
    }
    return;
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
   * Hàm tính tổng các số tiền của các tab detail(hạch toán,thông tin hóa đơn,hóa đơn GTGT)
   */
  setTotalRecord() {
    this.totalAcctDR = 0;
    this.totalAcctCR = 0;
    this.totalTransAmt = 0;
    this.totalbalAmt = 0;
    this.totalbalAmt2 = 0;
    this.totalsettledAmt = 0;
    this.totalsettledAmt2 = 0;
    this.totalVatAtm = 0;
    this.totalVatBase = 0;

    if (this.itemSelected?.listAcctrants && this.itemSelected?.listAcctrants.length > 0) {
      this.itemSelected?.listAcctrants.forEach((item) => {
        if (this.itemSelected.currencyID == this.baseCurr) {
          if (!item.crediting) {
            this.totalAcctDR += item.transAmt;
          } else {
            this.totalAcctCR += item.transAmt;
          }
        }else{
          if (!item.crediting) {
            this.totalAcctDR += item.transAmt2;
            this.totalTransAmt += item.transAmt;
          } else {
            this.totalAcctCR += item.transAmt2;
          }
        }
      });
    }

    if (this.itemSelected?.listSettledInvoices && this.itemSelected?.listSettledInvoices.length > 0) {
      this.itemSelected?.listSettledInvoices.forEach((item) => {
        this.totalbalAmt += item.balAmt;
        this.totalsettledAmt += item.settledAmt;
        if (this.itemSelected.currencyID != this.baseCurr) {
          this.totalbalAmt2 += item.balAmt2;
          this.totalsettledAmt2 += item.settledAmt2;
        }
      });
    }

    if (this.itemSelected?.listVATInvoices && this.itemSelected?.listVATInvoices.length > 0) {
      this.itemSelected?.listVATInvoices.forEach((item) => {
        this.totalVatAtm += item.vatAmt;
        this.totalVatBase += item.vatBase;
      });
    }
  }

  /**
   * *Hàm chỉnh sửa chứng từ
   * @param dataEdit : data chứng từ chỉnh sửa
   */
  editVoucher(dataEdit) {
    this.dataService
      .edit(dataEdit)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        let data = {
          headerText: this.headerText, //? tiêu đề voucher
          journal: { ...this.journal }, //?  data journal
          oData: { ...res }, //?  data của cashpayment
          hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
          baseCurr: this.baseCurr, //?  đồng tiền hạch toán
          legalName: this.legalName, //? tên company
        };
        let dialog = this.callfc.openSide(
          CashPaymentAddComponent,
          data,
          this.optionSidebar,
          this.formModel.funcID
        );
      });
  }

  /**
   * *Hàm sao chép chứng từ
   * @param event
   * @param dataCopy : data chứng từ sao chép
   */
  copyVoucher(dataCopy) {
    this.dataService
      .copy((o) => this.setDefault(dataCopy))
      .subscribe((res: any) => {
        if (res != null) {
          let data = {
            headerText: this.headerText, //? tiêu đề voucher
            journal: { ...this.journal }, //?  data journal
            oData: { ...res }, //?  data của cashpayment
            hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
            baseCurr: this.baseCurr, //?  đồng tiền hạch toán
            legalName: this.legalName, //? tên company
          };
          let dialog = this.callfc.openSide(
            CashPaymentAddComponent,
            data,
            this.optionSidebar,
            this.formModel.funcID
          );
        }
      });
  }

  /**
   * *Hàm xóa chứng từ
   * @param dataDelete : data xóa
   */
  deleteVoucher(dataDelete) {
    this.dataService
      .delete([dataDelete], true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {});
  }

  /**
   * *Hàm gửi duyệt chứng từ (xử lí cho MF gửi duyệt)
   * @param data
   */
  releaseVoucher(text: any, data: any) {
    this.acService
      .getCategoryByEntityName(this.formModel.entityName)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.dataCategory = res;
        this.shareService
          .codxRelease(
            'AC',
            data.recID,
            this.dataCategory.processID,
            this.formModel.entityName,
            this.formModel.funcID,
            '',
            '',
            ''
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe((result: any) => {
            if (result?.msgCodeError == null && result?.rowCount) {
              data.status = result?.returnStatus;
              this.dataService.updateDatas.set(data['_uuid'], data);
              this.dataService
                .save(null, 0, '', '', false)
                .pipe(takeUntil(this.destroy$))
                .subscribe((res: any) => {
                  if (res && !res.update.error) {
                    this.notification.notifyCode('AC0029', 0, text);
                  }
                });
            } else this.notification.notifyCode(result?.msgCodeError);
          });
      });
  }

  /**
   * *Hàm hủy gửi duyệt chứng từ (xử lí cho MF hủy yêu cầu duyệt)
   * @param data
   */
  cancelReleaseVoucher(text: any, data: any) {
    this.shareService
      .codxCancel('AC', data?.recID, this.formModel.entityName, null, null)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        if (result && result?.msgCodeError == null) {
          data.status = result?.returnStatus;
          this.dataService.updateDatas.set(data['_uuid'], data);
          this.dataService
            .save(null, 0, '', '', false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res && !res.update.error) {
                this.notification.notifyCode('AC0029', 0, text);
              }
            });
        } else this.notification.notifyCode(result?.msgCodeError);
      });
  }

  /**
   * *Hàm kiểm tra tính hợp lệ của chứng từ (xử lí cho MF kiểm tra tính hợp lệ)
   * @param data
   */
  validateVourcher(text: any, data: any) {
    this.api
      .exec('AC', 'CashPaymentsBusiness', 'ValidateVourcherAsync', [data.recID])
      .subscribe((res: any) => {
        if (res?.update) {
          this.dataService.update(res?.data).subscribe();
          //this.getDatadetail(this.itemSelected);
          this.notification.notifyCode(
            'AC0029',
            0,
            text
          );
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * *Hàm ghi sổ chứng từ (xử lí cho MF ghi sổ)
   * @param data
   */
  postVoucher(text: any, data: any) {
    this.api
      .exec('AC', 'CashPaymentsBusiness', 'PostVourcherAsync', [data.recID])
      .subscribe((res: any) => {
        if (res?.update) {
          this.dataService.update(res?.data).subscribe();
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * *Hàm khôi phục chứng từ (xử lí cho MF khôi phục)
   * @param data
   */
  unPostVoucher(text: any, data: any) {
    this.api
      .exec('AC', 'CashPaymentsBusiness', 'UnPostVourcherAsync', [data.recID])
      .subscribe((res: any) => {
        if (res?.update) {
          this.dataService.update(res?.data).subscribe();
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * *Xuất file theo template(Excel,PDF,...)
   * @param data
   */
  exportVoucher(data) {
    var gridModel = new DataRequest();
    gridModel.formName = this.formModel.formName;
    gridModel.entityName = this.formModel.entityName;
    gridModel.funcID = this.formModel.funcID;
    gridModel.gridViewName = this.formModel.gridViewName;
    gridModel.page = this.dataService.request.page;
    gridModel.pageSize = this.dataService.request.pageSize;
    gridModel.predicate = this.dataService.request.predicates;
    gridModel.dataValue = this.dataService.request.dataValues;
    gridModel.entityPermission = this.formModel.entityPer;
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
      formModel:this.view.formModel
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
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data) {
    return this.api.exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
      data,
      this.journal,
    ]);
  }

  /**
   * *Hàm hỗ trợ ngFor không render lại toàn bộ data
   */
  trackByFn(index, item) {
    return item.recID;
  }
  //#endregion Function

  //#region Bankhub
  call() {
    jsBh.login('accNet', (o) => this.callback(o));
  }

  callback(o: any) {
    if (o) {
      this.bhLogin = true;
      localStorage.setItem('bh_tk', o);
      this.getbank();
    }
  }

  getbank() {
    this.acService
      .call_bank('banks', { bankId: '970448', requestId: Util.uid() })
      .subscribe((res) => {
        console.log(res);
      });
  }
  //#endregion
}
