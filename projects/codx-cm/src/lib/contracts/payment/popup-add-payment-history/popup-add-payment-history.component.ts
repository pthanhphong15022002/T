import { Component, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CM_Contracts, CM_ContractsPayments } from '../../../models/cm_model';
import { CodxCmService } from '../../../codx-cm.service';
import { firstValueFrom } from 'rxjs';
import { StepService } from 'projects/codx-share/src/lib/components/codx-step/step.service';

@Component({
  selector: 'lib-popup-add-payment-history',
  templateUrl: './popup-add-payment-history.component.html',
  styleUrls: ['./popup-add-payment-history.component.scss']
})
export class PopupAddPaymentHistoryComponent {
  REQUIRE = ['scheduleDate', 'scheduleAmt','paidDate','paidAmt'];
  isSave = false;
  action = '';
  payment: CM_ContractsPayments;
  listPayment: CM_ContractsPayments[];
  paymentHistory: CM_ContractsPayments;
  listPaymentHistory: CM_ContractsPayments[];

  listPaymentAdd: CM_ContractsPayments[];
  listPaymentEdit: CM_ContractsPayments[];
  listPaymentDelete: CM_ContractsPayments[];
  contract: CM_Contracts;

  listPaymentHistoryOfPayment: CM_ContractsPayments[]; //
  view;
  percent = 0;
  remainAmt = 0;
  checkDate = 0;
  isErorrDate = true;
  title = "Lịch sử thanh toán";
  dialog: DialogRef;
  constructor(
    private cmService: CodxCmService,
    private notiService: NotificationsService,
    private stepService: StepService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.action = dt?.data?.action;
    this.contract = dt?.data?.contract;
    this.payment = dt?.data?.payment;
    this.listPayment = dt?.data?.listPayment || [];
    this.paymentHistory = dt?.data?.paymentHistory;
    this.listPaymentAdd = dt?.data?.listPaymentAdd  || [];
    this.listPaymentEdit = dt?.data?.listPaymentEdit  || [];
    this.listPaymentDelete = dt?.data?.listPaymentDelete  || [];
    this.listPaymentHistory = dt?.data?.listPaymentHistory  || [];
    this.isSave = dt?.data?.isSave || false;
  }

  async ngOnInit(): Promise<void> {
    this.listPaymentHistoryOfPayment = this.listPaymentHistory.filter(paymentHistory => paymentHistory.refLineID == this.payment?.recID)
    this.setDataInput();
    this.remainAmt = this.payment?.remainAmt || 0;
    this.view = await this.stepService.getFormModel(this.dialog.formModel);
  }

  setDataInput() {
    if (this.action == 'add') {
      this.setPaymentHistory();
    }
    if (this.action == 'edit') {

    }
    if (this.action == 'copy') {

    }
  }

  setPaymentHistory() {
    let rowNo = this.listPaymentHistoryOfPayment?.length || 0;
    this.paymentHistory = new CM_ContractsPayments();
    this.paymentHistory.rowNo = rowNo + 1;
    this.paymentHistory.refNo = this.contract?.recID;
    this.paymentHistory.lineType = '1';
    this.paymentHistory.refLineID = this.payment?.recID;
    this.paymentHistory.scheduleDate = this.payment?.scheduleDate;
    this.paymentHistory.scheduleAmt = this.payment?.scheduleAmt;
    this.paymentHistory.remainAmt = this.payment?.remainAmt;
    this.paymentHistory.paidDate = new Date();
    this.paymentHistory.transID = (Math.random() * 10000000000).toFixed(0);
  }

  valueChangeText(event) {
    this.paymentHistory[event?.field] = event?.data;
    if(event?.field == 'paidAmt'){
      this.payment.remainAmt = this.remainAmt - (event?.data || 0);
      this.paymentHistory.remainAmt = this.payment?.remainAmt;
    }
  }

  valueChangeCombobox(event) {
    this.paymentHistory[event?.field] = event?.data;
  }

  valueChangeAlert(event) {
    this.paymentHistory[event?.field] = event?.data;
  }

  changeValueDate(event) {
    this.paymentHistory[event?.field] = new Date(event?.data?.fromDate);
    if (this.action == 'add') {
      this.checkDate = this.stepService.compareDates( this.paymentHistory?.paidDate,  new Date(),'h');
      if (this.checkDate > 0 && this.isErorrDate) {
        this.notiService.notifyCode('CM019',0,[this.view?.paidDate]);
      }
      this.isErorrDate = !this.isErorrDate;
    }
  }

  valueChangePercent(e) {
    this.percent = e?.value;
    this.paymentHistory.paidAmt = Number(
      ((this.percent * this.paymentHistory?.scheduleAmt) / 100).toFixed(0)
    );
  }

  save() {
    if (this.stepService.checkRequire(this.REQUIRE, this.paymentHistory, this.view)) {
      return
    }
    if (this.checkDate > 0) {
      this.notiService.notifyCode('CM019',0,[this.view?.scheduleDate]);
      return;
    }
    if (this.action == 'add' || this.action == 'copy') {
      this.addPaymentHistory(false);
    }
    if (this.action == 'edit') {
      this.editPayment(false);
    }
  }

  saveAndClose() {
    if (this.stepService.checkRequire(this.REQUIRE, this.paymentHistory, this.view)) {
      return
    }
    if (this.checkDate > 0) {
      this.notiService.notifyCode('CM019',0,[this.view?.scheduleDate]);
      return;
    }
    if (this.action == 'add' || this.action == 'copy') {
      this.addPaymentHistory(true);
    }
    if (this.action == 'edit') {
      this.editPayment(true);
    }
  }

  //Dư nợ còn lại: remainAmt remainAmt
  // số tiền đã thanh toán: paidAmt

  async addPaymentHistory(isClose) {
    this.paymentHistory.remainAmt = this.payment.remainAmt;
    if (this.isSave) {
      let paymentOut = await firstValueFrom(this.cmService.addPaymentsHistory(this.paymentHistory))
      this.listPaymentHistory.push(this.paymentHistory);
      // this.listPaymentHistory.push(paymentOut);
      this.listPaymentHistoryOfPayment.push(paymentOut);
      this.updateContractAndPaymentByPaymentHistory();
      this.notiService.notifyCode('SYS006');
    } else {
      this.listPaymentHistory.push(this.paymentHistory);
      this.listPaymentAdd.push(this.paymentHistory);
      this.listPaymentHistoryOfPayment.push(this.paymentHistory);
      this.updateContractAndPaymentByPaymentHistory();
    }
    if (isClose) {
      this.dialog.close()
    } else {
      this.action = 'add';
      this.setPaymentHistory();
    }
    // this.cmService.addPayments(this.payment).subscribe( res => {
    //   if(res){
    //       this.dialog.close({ payment: res, action: this.action });
    //     }
    //   })
  }

  updateContractAndPaymentByPaymentHistory() {
    this.payment.paidAmt += Number(this.paymentHistory.paidAmt || 0);
    // this.payment.remainAmt = this.payment?.scheduleAmt - this.payment?.paidAmt || this.payment.scheduleAmt;
    let paymentFind = this.listPayment?.find(payment => payment.recID == this.payment?.recID);
    let paymentAddFind = this.listPaymentAdd?.find(payment => payment.recID == this.payment?.recID);
    if (paymentFind) {
      paymentFind.paidAmt += Number(this.paymentHistory.paidAmt || 0);
      paymentFind.remainAmt = this.payment?.remainAmt
    }
    if (paymentAddFind) {
      paymentAddFind.paidAmt += Number(this.paymentHistory.paidAmt || 0);
      paymentAddFind.remainAmt = this.payment?.remainAmt
    }

    this.contract.paidAmt += Number(this.paymentHistory.paidAmt);
    this.contract.remainAmt = Number(this.contract.contractAmt) - Number(this.contract.paidAmt);
  }

  async editPayment(isClose) {
    if (this.isSave) {
      let paymentOut = await firstValueFrom(this.cmService.editPayments(this.payment));
      if (paymentOut) {
        let payHistoryIndex = this.listPaymentHistory.findIndex(payment => payment.recID == this.paymentHistory?.recID);
        if (payHistoryIndex >= 0) {
          this.listPaymentHistory.splice(payHistoryIndex, 1, this.paymentHistory);
        }
        this.notiService.notifyCode('SYS007');
      }
    } else {
      let payHistoryIndex = this.listPaymentHistory.findIndex(payment => payment.recID == this.paymentHistory?.recID);
      if (payHistoryIndex >= 0) {
        this.listPaymentHistory.splice(payHistoryIndex, 1, this.paymentHistory);
      }

      let paymentIndexAdd = this.listPaymentAdd.findIndex(payment => payment.recID == this.paymentHistory?.recID);
      if (paymentIndexAdd >= 0) {
        this.listPaymentAdd.splice(paymentIndexAdd, 1, this.paymentHistory);
      } else {
        let paymentIndexEdit = this.listPaymentEdit.findIndex(payment => payment.recID == this.paymentHistory?.recID);
        if (paymentIndexEdit >= 0) {
          this.listPaymentEdit.splice(paymentIndexAdd, 1, this.paymentHistory);
        } else {
          this.listPaymentEdit.push(this.paymentHistory);
        }
      }
    }
    if (isClose) {
      this.dialog.close(true);
    } else {
      this.action = "add";
      this.setPaymentHistory();
    }
  }
}
