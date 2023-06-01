import { Component, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CM_ContractsPayments } from '../../../models/cm_model';
import { CodxCmService } from '../../../codx-cm.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-popup-add-payment',
  templateUrl: './popup-add-payment.component.html',
  styleUrls: ['./popup-add-payment.component.scss'],
})
export class PopupAddPaymentComponent {
  isSave = false;
  action = '';
  payment: CM_ContractsPayments;
  listPayment: CM_ContractsPayments[];
  listPaymentAdd: CM_ContractsPayments[];
  listPaymentEdit: CM_ContractsPayments[];
  listPaymentDelete: CM_ContractsPayments[];
  contractID = null;

  title = 'Lịch thanh toán';
  dialog: DialogRef;
  constructor(
    private cmService: CodxCmService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.isSave = dt?.data?.isSave || false;
    this.action = dt?.data?.action;
    this.contractID = dt?.data?.contractID;
    this.payment = dt?.data?.payment;
    this.listPayment = dt?.data?.listPayment  || [];
    this.listPaymentAdd = dt?.data?.listPaymentAdd  || [];
    this.listPaymentEdit = dt?.data?.listPaymentEdit  || [];
    this.listPaymentDelete = dt?.data?.listPaymentDelete  || [];
  }

  ngOnInit(): void {
    this.setDataInput();
  }

  setPayment() {
    let rowNo = this.listPayment?.length || 0;
    this.payment = new CM_ContractsPayments();
    this.payment.rowNo = rowNo + 1;
    this.payment.refNo = this.contractID;
    this.payment.status = '1';
    this.payment.paidAmt = 0;
    this.payment.lineType = '0';
  }

  setDataInput() {
    if (this.action == 'add') {
      this.setPayment();
    }
    if (this.action == 'edit') {
      this.payment = JSON.parse(JSON.stringify(this.payment));
    }
    if (this.action == 'copy') {
    }
  }

  valueChangeText(event) {
    try {
      this.payment[event?.field] = event?.data;
    } catch (error) {
      console.log(error);
    }
  }

  valueChangeCombobox(event) {
    this.payment[event?.field] = event?.data;
  }

  valueChangeAlert(event) {
    this.payment[event?.field] = event?.data;
  }

  changeValueDate(event) {
    this.payment[event?.field] = new Date(event?.data?.fromDate);
  }

  saveAndClose() {
    if (this.action == 'add' || this.action == 'copy') {
      this.addPayment(true);
    }
    if (this.action == 'edit') {
      this.editPayment(true);
    }
  }

  saveAndContinue() {
    if (this.action == 'add' || this.action == 'copy') {
      this.addPayment(false);
    }
    if (this.action == 'edit') {
      this.editPayment(false);
    }
  }

  async addPayment(isClose) {
    this.payment.remainAmt = this.payment?.scheduleAmt || 0;
    if (this.isSave) {
      let paymentOut = await firstValueFrom(this.cmService.addPayments(this.payment)) 
        this.listPayment.push(paymentOut);
        this.notiService.notifyCode('SYS006');     
    } else {
      this.listPayment.push(this.payment);
      this.listPaymentAdd.push(this.payment);
    }
    if (isClose) {
      this.dialog.close(true);
    } else {
      this.action = 'add';
      this.setPayment();
    }
  }
  async editPayment(isClose) {
    if (this.isSave) {
      let paymentOut = await firstValueFrom(this.cmService.editPayments(this.payment)); 
        if (paymentOut) {
          let paymentIndex = this.listPayment.findIndex(
            (payment) => payment.recID == this.payment?.recID
          );
          if (paymentIndex >= 0) {
            this.listPayment.splice(paymentIndex, 1, paymentOut);
          }
          this.notiService.notifyCode('SYS007');
        } 
    } else {
      let paymentIndex = this.listPayment.findIndex(
        (payment) => payment.recID == this.payment?.recID
      );
      if (paymentIndex >= 0) {
        this.listPayment.splice(paymentIndex, 1, this.payment);
      }
      let paymentIndexAdd = this.listPaymentAdd.findIndex(
        (payment) => payment.recID == this.payment?.recID
      );
      if (paymentIndexAdd >= 0) {
        this.listPaymentAdd.splice(paymentIndexAdd, 1, this.payment);
      } else {
        let paymentIndexEdit = this.listPaymentEdit.findIndex(
          (payment) => payment.recID == this.payment?.recID
        );
        if (paymentIndexEdit >= 0) {
          this.listPaymentEdit.splice(paymentIndexAdd, 1, this.payment);
        } else {
          this.listPaymentEdit.push(this.payment);
        }
      }
    }
    if (isClose) {
      this.dialog.close(true);
    } else {
      this.action = 'add';
      this.setPayment();
    }
  }
}
