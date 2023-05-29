import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CM_Contacts,
  CM_Contracts,
  CM_ContractsPayments,
  CM_Customers,
  CM_Quotations,
  CM_QuotationsLines,
} from '../../models/cm_model';
import {
  ApiHttpService,
  AuthStore,
  CRUDService,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  Util,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { Observable, map, tap, firstValueFrom } from 'rxjs';
import { ContractsService } from '../service-contracts.service';
import { PopupViewPaymentHistoryComponent } from '../payment/popup-view-payment-history/popup-view-payment-history.component';
import { PopupAddPaymentComponent } from '../payment/popup-add-payment/popup-add-payment.component';
import { PopupAddPaymentHistoryComponent } from '../payment/popup-add-payment-history/popup-add-payment-history.component';

@Component({
  selector: 'add-contracts',
  templateUrl: './add-contracts.component.html',
  styleUrls: ['./add-contracts.component.scss'],
})
export class AddContractsComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('more') more: TemplateRef<any>;
  @ViewChild('test') test: any;
  contracts: CM_Contracts;
  contractsInput: CM_Contracts;
  dialog!: DialogRef;
  isLoadDate: any;
  action = 'add';
  projectID: string;
  tabClicked = '';
  listClicked = [];
  account: any;
  type: 'view' | 'list';
  customer: CM_Customers;
  listQuotationsLine: CM_QuotationsLines[];
  quotations: CM_Quotations;

  fmQuotations: FormModel = {
    formName: 'CMQuotations',
    gridViewName: 'grvCMQuotations',
    entityName: 'CM_Quotations',
    funcID: 'CM02021',
  };

  fmQuotationLines: FormModel = {
    formName: 'CMQuotationsLines',
    gridViewName: 'grvCMQuotationsLines',
    entityName: 'CM_QuotationsLines',
    funcID: 'CM02021',
  };
  fmContractsPayments: FormModel = {
    formName: 'CMContractsPayments',
    gridViewName: 'grvCMContractsPayments',
    entityName: 'CM_ContractsPayments',
    funcID: 'CM02041 ',
  };
  fmContractsPaymentsHistory: FormModel = {
    formName: 'CMContractsPaymentsHistory',
    gridViewName: 'grvCMContractsPaymentsHistory',
    entityName: 'CM_ContractsPayments',
    funcID: 'CM02042  ',
  };

  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  listPayment: CM_ContractsPayments[] = [];
  listPaymentHistory: CM_ContractsPayments[] = [];

  listPaymentAdd: CM_ContractsPayments[] = [];
  listPaymentEdit: CM_ContractsPayments[] = [];
  listPaymentDelete: CM_ContractsPayments[] = [];
  columns: any;
  grvPayments: any;

  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private authStore: AuthStore,
    private cmService: CodxCmService,
    private contractService: ContractsService,
    private changeDetector: ChangeDetectorRef,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.projectID = dt?.data?.projectID;
    this.action = dt?.data?.action;
    this.contractsInput = dt?.data?.contract;
    this.account = dt?.data?.account;
    this.type = dt?.data?.type;
    this.getFormModel();
  }
  ngOnInit() {
    this.setDataContract(this.contractsInput);
    this.listClicked = [
      {
        name: 'general',
        textDefault: 'Thông tin chung',
        icon: 'icon-info',
        isActive: true,
      },
      {
        name: 'detailItem',
        textDefault: 'Chi tiết mặt hàng',
        icon: 'icon-link',
        isActive: false,
      },
      {
        name: 'pay',
        textDefault: 'Phương thức và tiến độ thanh toán',
        icon: 'icon-tune',
        isActive: false,
      },
      {
        name: 'termsAndRelated',
        textDefault: 'Điều khoản và hồ sơ liên quan',
        icon: 'icon-tune',
        isActive: false,
      },
    ];

    this.columns = [
      {
        field: 'rowNo',
        headerText: this.grvPayments?.ItemID?.RowNo ?? 'STT',
        width: 50,
      },
      {
        field: 'scheduleDate',
        headerText:
          this.grvPayments?.ScheduleDate?.headerText ?? 'Ngày hẹn thanh toán',
        width: 150,
      },
      {
        field: 'scheduleAmt',
        headerText:
          this.grvPayments?.ScheduleAmt?.headerText ?? 'Số tiền hẹn thanh toán',
        width: 150,
      },
      {
        field: 'paidAmt',
        headerText: this.grvPayments?.PaidAmt?.headerText ?? 'Đã thanh toán',
        width: 150,
      },
      {
        field: 'remainAmt',
        headerText: this.grvPayments?.RemainAmt?.headerText ?? 'Dư nợ còn lại',
        width: 150,
      },
      {
        field: 'status',
        headerText: this.grvPayments?.Status?.headerText ?? 'Trạng thái',
        width: 90,
      },
      {
        field: 'note',
        headerText: this.grvPayments?.Note?.headerText ?? 'Ghi chú',
        width: 90,
      },
      // textAlign: 'left',
      // /template: this.columnVatid,
    ];
  }

  valueChangeText(event) {
    this.contracts[event?.field] = event?.data;
  }

  valueChangeCombobox(event) {
    this.contracts[event?.field] = event?.data;
    if (event?.field == 'dealID' && event?.data) {
      this.getCustomerByDealID(event?.data);
    }
    if (event?.field == 'customerID' && event?.data) {
      this.getCustomerByrecID(event?.data);
    }
    if (event?.field == 'quotationID' && event?.data) {
      this.getDataByQuotationID(event?.data);
    }
  }

  valueChangeAlert(event) {
    this.contracts[event?.field] = event?.data;
  }

  changeValueDate(event) {
    this.contracts[event?.field] = new Date(event?.data?.fromDate);
  }

  // async loadSetting() {
  //   this.grvSetup = await firstValueFrom(
  //     this.cache.gridViewSetup('CMQuotations', 'grvCMQuotations')
  //   );
  //   this.vllStatus = this.grvSetup['Status'].referedValue;
  //   //lay grid view
  //   let arrField = Object.values(this.grvSetup).filter((x: any) => x.isVisible);
  //   if (Array.isArray(arrField)) {
  //     this.arrFieldIsVisible = arrField
  //       .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
  //       .map((x: any) => x.fieldName);
  //     this.getColumsGrid(this.grvSetup);
  //   }
  // }

  // getColumsGrid(grvSetup) {
  //   this.columnGrids = [];
  //   this.arrFieldIsVisible.forEach((key) => {
  //     let field = Util.camelize(key);
  //     let template: any;
  //     let colums: any;
  //     switch (key) {
  //       case 'Status':
  //         template = this.templateStatus;
  //         break;
  //       case 'CustomerID':
  //         template = this.templateCustomer;
  //         break;
  //       case 'CreatedBy':
  //         template = this.templateCreatedBy;
  //         break;
  //       case 'TotalTaxAmt':
  //         template = this.templateTotalTaxAmt;
  //         break;
  //       case 'TotalAmt':
  //         template = this.templateTotalAmt;
  //         break;
  //       case 'TotalSalesAmt':
  //         template = this.templateTotalSalesAmt;
  //         break;
  //       default:
  //         break;
  //     }
  //     if (template) {
  //       colums = {
  //         field: field,
  //         headerText: grvSetup[key].headerText,
  //         width: grvSetup[key].width,
  //         template: template,
  //         // textAlign: 'center',
  //       };
  //     } else {
  //       colums = {
  //         field: field,
  //         headerText: grvSetup[key].headerText,
  //         width: grvSetup[key].width,
  //       };
  //     }

  //     this.columnGrids.push(colums);
  //   });

  getFormModel() {
    this.cache
      .gridViewSetup(
        this.fmContractsPayments?.formName,
        this.fmContractsPayments?.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.grvPayments = res;
        }
      });
  }

  loadComboboxData(comboboxName: string, service: string): Observable<any> {
    const dataRequest = new DataRequest();
    dataRequest.comboboxName = comboboxName;
    dataRequest.pageLoading = false;
    return this.api
      .execSv(
        service,
        'ERM.Business.Core',
        'DataBusiness',
        'LoadDataCbxAsync',
        [dataRequest]
      )
      .pipe(
        tap((p) => console.log(p)),
        map((p) => JSON.parse(p[0])),
        tap((p) => console.log(p))
      );
  }

  setDataContract(data) {
    if (this.action == 'add') {
      this.contracts = data;
      this.contracts.recID = Util.uid();
      this.contracts.projectID = this.projectID;
    }
    if (this.action == 'edit') {
      this.contracts = data;
      this.getQuotationsAndQuotationsLinesByTransID(this.contracts.quotationID);
      this.getPayMentByContractID(this.contracts?.recID);
    }
    if (this.action == 'copy') {
      this.contracts = data;
      this.contracts.recID = Util.uid();
      delete this.contracts['id'];
      this.getQuotationsAndQuotationsLinesByTransID(this.contracts.quotationID);
      this.getPayMentByContractID(this.contracts?.recID);
    }
  }

  getCustomerByDealID(dealID) {
    this.contractService.getCustomerBydealID(dealID).subscribe((res) => {
      if (res) {
        this.setDataContractCombobox(res);
      }
    });
  }

  getCustomerByrecID(recID) {
    this.contractService.getCustomerByRecID(recID).subscribe((res) => {
      if (res) {
        this.setDataContractCombobox(res);
      }
    });
  }

  getQuotationsAndQuotationsLinesByTransID(recID) {
    this.contractService.getQuotationsLinesByTransID(recID).subscribe((res) => {
      if (res) {
        this.quotations = res[0];
        this.listQuotationsLine = res[1];
      }
    });
  }

  getDataByQuotationID(recID) {
    this.contractService.getDataByTransID(recID).subscribe((res) => {
      if (res) {
        let quotation = res[0];
        let quotationsLine = res[1];
        let customer = res[2];
        this.listQuotationsLine = quotationsLine;
        this.quotations = quotation;
        this.setDataContractCombobox(customer);
        this.contracts.dealID = quotation?.refID;
        this.contracts.contractAmt = quotation.totalAmt; // giá trị hợp đồng
        this.contracts.paidAmt = this.contracts.paidAmt || 0; // số tiền đã thanh toán
        this.contracts.remainAmt = Number(this.contracts.contractAmt) - Number(this.contracts.paidAmt); // số tiền còn lại 
        this.contracts.currencyID = quotation.currencyID; // tiền tệ
        this.contracts.exchangeRate = quotation.exchangeRate; // tỷ giá
      }
    });
  }

  getPayMentByContractID(contractID) {
    this.cmService.getPaymentsByContractID(contractID).subscribe((res) => {
      if (res) {
        this.listPayment = res;
      }
    });
  }

  setDataContractCombobox(dataContract) {
    this.contracts.customerID = dataContract?.recID;
    this.contracts.taxCode = dataContract?.taxCode;
    this.contracts.address = dataContract?.address;
    this.contracts.phone = dataContract?.phone;
    this.contracts.faxNo = dataContract?.faxNo;
    this.contracts.representative = null;
    this.contracts.jobTitle = null;
    this.contracts.bankAccount = dataContract?.bankAccount;
    this.contracts.bankID = dataContract?.bankID;
  }

  handleSaveContract() {
    switch (this.action) {
      case 'add':
      case 'copy':
        this.addContracts();
        break;
      case 'edit':
        this.editContract();
        break;
    }
  }

  beforeSave(op: RequestOption) {
    let data = [];
    if (this.action == 'add' || this.action == 'copy') {
      op.methodName = 'AddContractsAsync';
      data = [this.contracts];
    }
    if (this.action == 'edit') {
      op.methodName = 'UpdateContractAsync';
      data = [
        this.contracts,
        this.listPaymentAdd,
        this.listPaymentEdit,
        this.listPaymentDelete,
      ];
    }
    op.data = data;
    return true;
  }

  addContracts() {
    if (this.type == 'view') {
      this.dialog.dataService
        .save((opt: any) => this.beforeSave(opt), 0)
        .subscribe((res) => {
          if (res.save) {
            (this.dialog.dataService as CRUDService)
              .update(res.save)
              .subscribe();
            this.dialog.close(res.save);
          } else {
            this.dialog.close();
          }
          // this.changeDetector.detectChanges();
        });
    } else {
      this.cmService.addContracts(this.contracts).subscribe((res) => {
        if (res) {
          this.dialog.close({ contract: res, action: this.action });
        }
      });
    }
    // console.log(this.contracts);
  }

  editContract() {
    if (this.type == 'view') {
      this.dialog.dataService
        .save((opt: any) => this.beforeSave(opt))
        .subscribe((res) => {
          this.dialog.close({ contract: res, action: this.action });
        });
    } else {
      this.cmService.editContracts(this.contracts).subscribe((res) => {
        if (res) {
          this.dialog.close({ contract: res, action: this.action });
        }
      });
    }
  }
  // chuyển tab
  changeTab(e) {
    this.tabClicked = e;
  }

  addFile(evt: any) {
    this.attachment.uploadFile();
  }

  onClickMFPayment(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deletePayment(data);
        break;
      case 'SYS03':
        this.editPayment(data);
        break;
      case 'SYS04':
        console.log(data);
        // this.copyContract(data);
        break;
      case 'CM02041_1': //xem lịch sử
        this.viewPayHistory(data, 1200, 500);
        break;
      case 'CM02041_2': // thêm lịch sử
        this.addPayHistory(data);
        break;
    }
  }

  addPayment() {
    let payment = new CM_ContractsPayments();
    this.openPopupPayment('add', payment);
  }
  editPayment(payment) {
    this.openPopupPayment('edit', payment);
  }

  deletePayment(payment) {
    this.notiService.alertCode('SYS030').subscribe((res) => {
      if (res.event.status === 'Y') {
        let indexPayDelete = this.listPayment.findIndex(
          (payFind) => payFind.recID == payment.recID
        );
        if (indexPayDelete >= 0) {
          this.listPayment.splice(indexPayDelete, 1);
          this.listPaymentDelete.push(payment);
          for (let index = indexPayDelete; index < this.listPayment.length; index++){
            this.listPayment[index].rowNo = index + 1;
          }
          this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
        }
      }
    });
  }

  async openPopupPayment(action, payment) {
    let dataInput = {
      action,
      payment,
      listPayment: this.listPayment,
      listPaymentAdd: this.listPaymentAdd,
      listPaymentEdit: this.listPaymentEdit,
      listPaymentDelet: this.listPaymentDelete,
      contractID: this.contracts?.recID,
    };

    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1001;
    option.FormModel = this.fmContractsPayments;
    let popupPayment = this.callfunc.openForm(
      PopupAddPaymentComponent,
      '',
      600,
      400,
      '',
      dataInput,
      '',
      option
    );

    popupPayment.closed.subscribe((res) => {
      this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
    });
  }

  addPayHistory(payment) {
    let payMentHistory = new CM_ContractsPayments();
    let countPayMent = this.listPayment.length;
    payMentHistory.rowNo = countPayMent + 1;
    payMentHistory.refNo = this.contracts?.recID;
    this.openPopupPaymentHistory('add', payment, payMentHistory);
  }

  viewPayHistory(payment, width: number, height: number) {
    let dataInput = {
      payment,
      listPaymentHistory: this.listPaymentHistory,
      listPaymentAdd: this.listPaymentAdd,
      listPaymentEdit: this.listPaymentEdit,
      listPaymentDelet: this.listPaymentDelete,
    };

    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1001;
    option.FormModel = this.fmContractsPaymentsHistory;
    let popupPayHistory = this.callfunc.openForm(
      PopupViewPaymentHistoryComponent,
      '',
      width,
      height,
      '',
      dataInput,
      '',
      option
    );
  }

  async openPopupPaymentHistory(action, payment, paymentHistory) {
    let dataInput = {
      action,
      payment,
      paymentHistory,
      contract: this.contracts,
      listPayment: this.listPayment,
      listPaymentHistory: this.listPaymentHistory,
      listPaymentAdd: this.listPaymentAdd,
      listPaymentEdit: this.listPaymentEdit,
      listPaymentDelet: this.listPaymentDelete,
    };

    let formModel = new FormModel();
    formModel.entityName = 'CM_ContractsPayments';
    formModel.formName = 'CMContractsPayments';
    formModel.gridViewName = 'grvCMContractsPayments';

    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1001;
    option.FormModel = formModel;

    let popupPaymentHistory = this.callfunc.openForm(
      PopupAddPaymentHistoryComponent,
      '',
      600,
      400,
      '',
      dataInput,
      '',
      option
    );

    popupPaymentHistory.closed.subscribe((res) => {
      this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
    });
  }
}
