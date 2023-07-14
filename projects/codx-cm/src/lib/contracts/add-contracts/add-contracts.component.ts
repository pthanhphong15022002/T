import {
  OnInit,
  Optional,
  ViewChild,
  Component,
  TemplateRef,
} from '@angular/core';
import {
  CM_Contracts,
  CM_Customers,
  CM_Quotations,
  CM_QuotationsLines,
  CM_ContractsPayments,
} from '../../models/cm_model';
import {
  Util,
  DialogRef,
  FormModel,
  DialogData,
  CRUDService,
  DialogModel,
  DataRequest,
  CacheService,
  RequestOption,
  ApiHttpService,
  CallFuncService,
  CodxInputComponent,
  NotificationsService,
} from 'codx-core';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { CodxCmService } from '../../codx-cm.service';
import { ContractsService } from '../service-contracts.service';
import { StepService } from 'projects/codx-share/src/lib/components/codx-step/step.service';
import { PopupAddPaymentComponent } from '../payment/popup-add-payment/popup-add-payment.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { PopupAddPaymentHistoryComponent } from '../payment/popup-add-payment-history/popup-add-payment-history.component';
import { PopupViewPaymentHistoryComponent } from '../payment/popup-view-payment-history/popup-view-payment-history.component';

@Component({
  selector: 'add-contracts',
  templateUrl: './add-contracts.component.html',
  styleUrls: ['./add-contracts.component.scss'],
})
export class AddContractsComponent implements OnInit {
  @ViewChild('more') more: TemplateRef<any>;
  @ViewChild('inputDeal') inputDeal: CodxInputComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('inputQuotation') inputQuotation: CodxInputComponent;
  REQUIRE = [
    'contractName',
    'contractID',
    'useType',
    'contractType',
    'pmtMethodID',
    'pmtStatus',
    'delModeID',
    'delStatus',
    'customerID',
    'currencyID',
  ];
  customer: CM_Customers;
  contracts: CM_Contracts;
  quotations: CM_Quotations;
  contractsInput: CM_Contracts;
  listQuotationsLine: CM_QuotationsLines[] = [];
  quotationLinesEdit: CM_QuotationsLines[] = [];
  listQLineOfContract: CM_QuotationsLines[] = [];
  quotationLinesAddNew: CM_QuotationsLines[] = [];
  quotationLinesDeleted: CM_QuotationsLines[] = [];
  listQLineOfContractAdd: CM_QuotationsLines[] = [];

  listPayment: CM_ContractsPayments[] = [];
  listPaymentAdd: CM_ContractsPayments[] = [];
  listPaymentEdit: CM_ContractsPayments[] = [];
  listPaymentDelete: CM_ContractsPayments[] = [];
  listPaymentHistory: CM_ContractsPayments[] = [];

  account: any;
  columns: any;
  grvPayments: any;
  projectID: string;
  dialog!: DialogRef;

  view = [];
  isLoadDate = true;
  checkPhone = true;
  isErorrDate = true;
  customerIdOld = null;
  disabledDelActualDate = false;

  action = 'add';
  tabClicked = '';
  customerID = {};
  headerTest = '';
  listTypeContract = [];
  type: 'view' | 'deal' | 'quotation' | 'customer';

  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };

  fmQuotations: FormModel = {
    funcID: 'CM02021',
    formName: 'CMQuotations',
    entityName: 'CM_Quotations',
    gridViewName: 'grvCMQuotations',
  };

  fmQuotationLines: FormModel = {
    funcID: 'CM02021',
    formName: 'CMQuotationsLines',
    entityName: 'CM_QuotationsLines',
    gridViewName: 'grvCMQuotationsLines',
  };
  fmContractsPayments: FormModel = {
    funcID: 'CM0204 ',
    formName: 'CMContractsPayments',
    entityName: 'CM_ContractsPayments',
    gridViewName: 'grvCMContractsPayments',
  };
  disabledShowInput: boolean = false;
  planceHolderAutoNumber: any = '';
  grvSetup: any;
  isExitAutoNum: any = false;

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private cmService: CodxCmService,
    private stepService: StepService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private contractService: ContractsService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.dialog = dialog;
    this.type = dt?.data?.type;
    this.action = dt?.data?.action;
    this.account = dt?.data?.account;
    this.projectID = dt?.data?.projectID;
    this.headerTest = dt?.data?.actionName;
    this.contractsInput = dt?.data?.contract;

    this.getFormModel();
    this.listTypeContract = contractService.listTypeContract;
    this.cache.functionList(this.dialog?.formModel.funcID).subscribe((f) => {
      if (f) {
        if (this.headerTest) {
          this.headerTest =
            this.headerTest + ' ' + f?.defaultName.toString().toLowerCase();
        } else {
          this.headerTest = f?.defaultName.toString().toLowerCase();
        }
      }
    });
    this.cache
      .gridViewSetup(
        this.dialog?.formModel.formName,
        this.dialog?.formModel.gridViewName
      )
      .subscribe((grv) => {
        this.grvSetup = grv;
      });
    if (this.action != 'edit') {
      this.cmService
        .getFieldAutoNoDefault('CM0204', 'CM_Contracts')
        .subscribe((res) => {
          if (res && !res.stop) {
            this.disabledShowInput = true;
            this.cache.message('AD019').subscribe((mes) => {
              if (mes)
                this.planceHolderAutoNumber =
                  mes?.customName || mes?.description;
            });
          } else {
            this.disabledShowInput = false;
            // if (this.action == 'add' || this.action == 'copy')
            //   this.cmService
            //     .genAutoNumberDefault('CM0204', 'CM_Contracts', 'contractID')
            //     .subscribe((autoNum) => {
            //       this.contracts.contractID = autoNum;
            //     });
          }
        });
    } else this.disabledShowInput = true;
  }
  ngOnInit() {
    this.setDataContract(this.contractsInput);
    this.disabledDelActualDate =
      !this.contracts?.delStatus ||
      this.contracts?.delStatus == '0' ||
      this.contracts?.delStatus == '1'
        ? true
        : false;
  }

  //#region setData
  async setDataContract(data) {
    if (this.action == 'add') {
      this.contracts = data ? data : new CM_Contracts();
      this.contracts.recID = Util.uid();
      this.contracts.projectID = this.projectID;
      this.contracts.contractDate = new Date();
      this.contracts.effectiveFrom = new Date();
      this.contracts.paidAmt = 0;
      this.contracts.status = '0';
      this.contracts.remainAmt = 0;
      this.contracts.useType = '1';
      this.contracts.pmtStatus = '1';
      this.contracts.delStatus = '1';
      this.contracts.pmtMethodID = 'ATM';

      // this.contracts.contractID = 'HD-' + (Math.random() * 10000000000).toFixed(0);
      this.contracts.pmtStatus = this.contracts.pmtStatus
        ? this.contracts.pmtStatus
        : '0';
      this.contracts.contractType = this.contracts.contractType
        ? this.contracts.contractType
        : '1';
      this.setContractByDataOutput();
    }

    if (this.action == 'edit') {
      this.contracts = data;
      this.getQuotationsLinesInContract(
        this.contracts?.recID,
        this.contracts?.quotationID
      );
      this.getPayMentByContractID(this.contracts?.recID);
      this.getCustomersDefaults(this.contracts?.customerID);
    }
    if (this.action == 'copy') {
      this.contracts = data;
      delete this.contracts['id'];
      this.contracts.recID = Util.uid();

      // this.contracts.contractID = await firstValueFrom(
      //   this.cmService.genAutoNumberDefault(
      //     'CM0204',
      //     'CM_Contracts',
      //     'contractID'
      //   )
      // );
      // this.contracts.contractID =
      //   'HD-' + (Math.random() * 10000000000).toFixed(0);
      this.getQuotationsLinesInContract(
        this.contracts?.recID,
        this.contracts?.quotationID
      );
      this.getPayMentByContractID(this.contracts?.recID);
    }
  }
  setContractByDataOutput() {
    if (this.contracts.dealID) {
      this.getCustomerByDealID(this.contracts.dealID);
    }
    if (this.contracts.customerID) {
      this.getCustomerByrecID(this.contracts.customerID);
    }
    if (this.contracts.quotationID) {
      this.getDataByQuotationID(this.contracts.quotationID);
    }
  }

  setDataContractCombobox(customer) {
    this.customerIdOld = this.contracts.customerID;
    this.customer = customer;
    this.customerID = { customerID: customer?.recID };
    this.contracts.customerID = customer?.recID;
    this.contracts.taxCode = customer?.taxCode;
    this.contracts.address = customer?.address;
    this.contracts.phone = customer?.phone;
    this.contracts.faxNo = customer?.faxNo;
    this.contracts.representative = null;
    this.contracts.jobTitle = null;
    this.contracts.bankAccount = customer?.bankAccount;
    this.contracts.bankID = customer?.bankID;
  }
  //#endregion
  //#region Quotation
  getQuotationsLinesInContract(contractID, quotationID) {
    this.contractService
      .getQuotationsLinesInContract([contractID || null, quotationID || null])
      .subscribe((res) => {
        if (res) {
          if (res?.length > 0) {
            this.listQuotationsLine = res;
            this.contracts.contractAmt = this.sumNetAmtQuotations();
            this.listQuotationsLine = this.listQuotationsLine.sort(
              (a, b) => a.rowNo - b.rowNo
            );
            this.listQLineOfContract = this.listQuotationsLine.filter(
              (quotationsLine) => quotationsLine?.contractID
            );
            if (this.action == 'copy' && this.listQLineOfContract?.length > 0) {
              this.listQLineOfContract = this.listQLineOfContract.map(
                (item) => {
                  return { ...item, contractID: this.contracts?.recID };
                }
              );
            }
          }
        } else {
          this.listQuotationsLine = [];
          this.contracts.contractAmt = null;
        }
        this.listQuotationsLine = res?.length > 0 ? res : [];
      });
  }

  getDataByQuotationID(recID) {
    // quotation, quotationsLine, customer
    this.listQLineOfContract = this.listQuotationsLine.filter(
      (quotationsLine) => quotationsLine?.contractID
    );
    this.contractService.getDataByTransID(recID).subscribe((res) => {
      if (res) {
        let quotation = res[0];
        let quotationsLine = res[1];
        let customer = res[2];
        let countQuotation = quotationsLine?.length || 0;
        this.listQLineOfContract = this.listQLineOfContract.map(
          (item, index) => ({ ...item, rowNo: index + countQuotation + 1 })
        );
        let qLinesNotEdit = this.listQLineOfContract.filter(
          (qLine) =>
            !this.quotationLinesEdit.some(
              (qLinesEdit) => qLinesEdit.recID === qLine.recID
            )
        );
        this.quotationLinesEdit = [
          ...this.quotationLinesEdit,
          ...qLinesNotEdit,
        ];
        this.listQuotationsLine = [
          ...this.listQLineOfContract,
          ...quotationsLine,
        ];
        this.listQuotationsLine = this.listQuotationsLine.sort(
          (a, b) => a.rowNo - b.rowNo
        );
        this.quotations = quotation;
        this.setDataContractCombobox(customer);
        this.contracts.dealID = quotation?.refID;
        this.contracts.contractAmt = this.sumNetAmtQuotations(); // giá trị hợp đồng
        this.contracts.paidAmt = this.contracts.paidAmt || 0; // số tiền đã thanh toán
        this.contracts.remainAmt =
          Number(this.contracts.contractAmt) - Number(this.contracts.paidAmt); // số tiền còn lại
        this.contracts.currencyID = quotation.currencyID; // tiền tệ
        this.contracts.exchangeRate = quotation.exchangeRate; // tỷ giá
      }
    });
  }

  eventQuotationLines(e) {
    this.listQuotationsLine = e?.listQuotationLines;
    this.quotationLinesAddNew = e?.quotationLinesAddNew;
    this.quotationLinesEdit = e?.quotationLinesEdit;
    this.quotationLinesDeleted = e?.quotationLinesDeleted;
    let quotationLine = this.quotationLinesAddNew.find(
      (quotationLine) => quotationLine.recID == e?.quotationLineIdNew
    );
    if (quotationLine) {
      quotationLine.transID = null;
      quotationLine.contractID = this.contracts?.recID;
      this.listQLineOfContractAdd.push(quotationLine);
    }
    this.loadTotal();
  }

  loadTotal() {
    let totals = 0;
    let totalVAT = 0;
    let totalDis = 0;
    let totalSales = 0;
    if (this.listQuotationsLine?.length > 0) {
      this.listQuotationsLine.forEach((element) => {
        totalSales += element['salesAmt'] ?? 0;
        totals += element['netAmt'] ?? 0;
        totalVAT += element['vatAmt'] ?? 0;
        totalDis += element['discAmt'] ?? 0;
      });
    }
    this.contracts.contractAmt = totals;
    this.contracts.remainAmt =
      Number(this.contracts.contractAmt) - Number(this.contracts.paidAmt);

    this.quotations['totalSalesAmt'] = totalSales;
    this.quotations['totalAmt'] = totals;
    this.quotations['totalTaxAmt'] = totalVAT;
    this.quotations['discAmt'] = totalDis;
  }

  sumNetAmtQuotations() {
    // tính tổng giá trị của mặt hàng
    if (this.listQuotationsLine?.length > 0) {
      let contractAmt = this.listQuotationsLine.reduce((sum, item) => {
        return sum + item?.netAmt || 0;
      }, 0);
      return contractAmt;
    }
    return 0;
  }
  //#endregion
  //#region CRUD
  beforeSave(op: RequestOption) {
    let data = [];
    if (this.action == 'add' || this.action == 'copy') {
      op.methodName = 'AddContractsAsync';
      data = [this.contracts, this.listPaymentAdd, this.listQLineOfContractAdd];
    }
    if (this.action == 'edit') {
      op.methodName = 'UpdateContractAsync';
      data = [
        this.contracts,
        this.listPaymentAdd,
        this.listPaymentEdit,
        this.listPaymentDelete,
        this.listQLineOfContractAdd,
        this.quotationLinesEdit,
        this.quotationLinesDeleted,
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
      this.cmService
        .addContracts([this.contracts, this.listPaymentAdd])
        .subscribe((res) => {
          if (res) {
            this.dialog.close({ contract: res, action: this.action });
          }
        });
    }
  }

  editContract() {
    if (this.type == 'view') {
      this.dialog.dataService
        .save((opt: any) => this.beforeSave(opt))
        .subscribe((res) => {
          this.dialog.close({ contract: res, action: this.action });
        });
    } else {
      let data = [
        this.contracts,
        this.listPaymentAdd,
        this.listPaymentEdit,
        this.listPaymentDelete,
      ];
      this.cmService.editContracts(data).subscribe((res) => {
        if (res) {
          this.dialog.close({ contract: res, action: this.action });
        }
      });
    }
  }
  //#endregion
  //#region Save
  handleSaveContract() {
    if (
      this.stepService.checkRequire(this.REQUIRE, this.contracts, this.view)
    ) {
      return;
    }
    if (
      this.contracts?.delPhone &&
      !this.stepService.isValidPhoneNumber(this.contracts?.delPhone)
    ) {
      this.notiService.notifyCode('RS030');
      return;
    }

    if (this.contracts.contractID && this.contracts.contractID.includes(' ')) {
      this.notiService.notifyCode(
        'CM026',
        0,
        '"' + this.grvSetup['ContractID'].headerText + '"'
      );
      return;
    }

    if (this.isExitAutoNum) {
      this.notiService.notifyCode(
        'CM003',
        0,
        '"' + this.grvSetup['ContractID'].headerText + '"'
      );
      return;
    }
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
  //#endregion
  //#region change Input
  valueChangeText(event) {
    this.contracts[event?.field] = event?.data;
    if (event?.field == 'contractName') {
      this.contracts[event?.field] = this.stepService.capitalizeFirstLetter(
        event?.data
      );
    }
    if (event?.field == 'delPhone') {
      let isPhone = this.stepService.isValidPhoneNumber(event?.data);
      if (!isPhone && this.checkPhone) {
        this.notiService.notifyCode('RS030');
      }
      this.checkPhone = !this.checkPhone;
    }
    if (event?.field == 'currencyID' && this.checkPhone) {
      this.loadExchangeRate(event?.data);
    }
  }

  valueChangeCombobox(event) {
    this.contracts[event?.field] = event?.data;
    if (event?.field == 'dealID' && event?.data) {
      if (!this.contracts.customerID) {
        this.getCustomerByDealID(event?.data);
        this.setValueComboboxQuotation();
      }
    }
    if (event?.field == 'quotationID' && event?.data) {
      if (!this.contracts.customerID) {
        this.getDataByQuotationID(event?.data);
        this.setValueComboboxDeal();
      }
    }
    if (event?.field == 'customerID' && event?.data) {
      this.setValueComboboxQuotation();
      this.setValueComboboxDeal();
      this.getCustomerByrecID(event?.data);
      this.getCustomersDefaults(event?.data);
    }
    if (event?.field == 'delStatus') {
      this.disabledDelActualDate =
        event?.data == '0' || event?.data == '1' ? true : false;
    }
  }

  setValueComboboxDeal() {
    let listDeal = this.inputDeal.ComponentCurrent.dataService.data;
    if (listDeal) {
      if (this.customerIdOld != this.contracts.customerID) {
        this.contracts.dealID = null;
        this.inputDeal.ComponentCurrent.dataService.data = [];
      }
    }
  }

  setValueComboboxQuotation() {
    let listQuotation = this.inputQuotation.ComponentCurrent.dataService.data;
    if (listQuotation) {
      if (this.customerIdOld != this.contracts.customerID) {
        this.contracts.quotationID = null;
        this.inputQuotation.ComponentCurrent.dataService.data = [];
      }
    }
  }

  changeValueDate(event) {
    this.contracts[event?.field] = new Date(event?.data?.fromDate);
    if (event?.field == 'effectiveTo' && this.isLoadDate) {
      const startDate = new Date(this.contracts['effectiveFrom']);
      const endDate = new Date(this.contracts['effectiveTo']);
      if (endDate && startDate > endDate) {
        // this.isSaveTimeTask = false;
        this.isLoadDate = !this.isLoadDate;
        this.notiService.notifyCode(
          'CM010',
          0,
          this.view['effectiveTo'],
          this.view['effectiveFrom']
        );
        return;
      } else {
        // this.isSaveTimeTask = true;
      }
    } else {
      this.isLoadDate = !this.isLoadDate;
    }
  }
  //#endregion
  //#region get data
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
      }
    });
  }

  getPayMentByContractID(contractID) {
    this.contractService
      .getPaymentsByContractID(contractID)
      .subscribe((res) => {
        if (res) {
          let listPayAll = res as CM_ContractsPayments[];
          this.listPayment = listPayAll.filter((pay) => pay.lineType == '0');
          this.listPaymentHistory = listPayAll.filter(
            (pay) => pay.lineType == '1'
          );
        }
      });
  }
  getFormModel() {
    this.cache
      .gridViewSetup(
        this.dialog?.formModel?.formName,
        this.dialog?.formModel?.gridViewName
      )
      .subscribe((res) => {
        for (let key in res) {
          if (res[key]) {
            let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
            this.view[keyConvert] = res[key]['headerText'];
          }
        }
      });
  }
  //#endregion
  //#region payment
  addPayment() {
    let payment = new CM_ContractsPayments();
    payment.lineType = '0';
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
          for (
            let index = indexPayDelete;
            index < this.listPayment.length;
            index++
          ) {
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
      contract: this.contracts,
    };

    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1021;
    option.FormModel = this.fmContractsPayments;
    let popupPayment = this.callfunc.openForm(
      PopupAddPaymentComponent,
      '',
      550,
      400,
      '',
      dataInput,
      '',
      option
    );

    popupPayment.closed.subscribe((res) => {
      if (res) {
        this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
      }
    });
  }

  addPayHistory(payment) {
    let payMentHistory = new CM_ContractsPayments();
    let countPayMent = this.listPayment.length;
    payMentHistory.rowNo = countPayMent + 1;
    payMentHistory.refNo = this.contracts?.recID;
    payMentHistory.lineType = '1';
    this.openPopupPaymentHistory('add', payment, payMentHistory);
  }

  viewPayHistory(payment, width: number, height: number) {
    let dataInput = {
      isSave: false,
      payment,
      listPaymentHistory: this.listPaymentHistory,
      listPaymentAdd: this.listPaymentAdd,
      listPaymentEdit: this.listPaymentEdit,
      listPaymentDelete: this.listPaymentDelete,
      contracts: this.contracts,
      listPayment: this.listPayment,
    };

    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1021;
    option.FormModel = this.fmContractsPayments;
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
    option.zIndex = 1021;
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
      if (res) {
        this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
      }
    });
  }
  //#endregion
  //#region click
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
  //#endregion
  //#region Customners
  getCustomersDefaults(customerID) {
    this.cmService.getContactByObjectID(customerID).subscribe((res) => {
      if (res) {
        this.contracts.representative = res?.contactName;
        this.contracts.jobTitle = res?.jobTitle;
      }
    });
  }
  //#endregion

  loadExchangeRate(currencyID) {
    let day = this.contracts.createdOn ?? new Date();
    this.cmService.getExchangeRate(currencyID, day).subscribe((res) => {
      let exchangeRateNew = res?.exchRate ?? 0;
      if (exchangeRateNew == 0) {
        this.notiService.notify(
          'Tỷ giá tiền tệ "' +
            this.quotations.currencyID +
            '" chưa thiết lập xin hay chọn lại !',
          '3'
        );

        return;
      } else {
        this.contracts.exchangeRate = exchangeRateNew;
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

  //check auto
  changeAutoNum(e) {
    if (!this.disabledShowInput && e) {
      this.contracts.contractID = e?.crrValue;
      if (
        this.contracts.contractID &&
        this.contracts.contractID.includes(' ')
      ) {
        this.notiService.notifyCode(
          'CM026',
          0,
          '"' + this.grvSetup['ContractID'].headerText + '"'
        );
        return;
      }
      this.cmService
        .isExitsAutoCodeNumber('ContractsBusiness', this.contracts.contractID)
        .subscribe((res) => {
          this.isExitAutoNum = res;
          if (this.isExitAutoNum)
            this.notiService.notifyCode(
              'CM003',
              0,
              '"' + this.grvSetup['ContractID'].headerText + '"'
            );
        });
    }
  }

  checkSpace(text: string) {
    return text.includes(' ');
  }
}
