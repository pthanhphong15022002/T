import { Component, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CM_ContractsPayments } from '../../../models/cm_model';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'lib-popup-add-payment',
  templateUrl: './popup-add-payment.component.html',
  styleUrls: ['./popup-add-payment.component.scss']
})
export class PopupAddPaymentComponent {
  action = '';
  payment: CM_ContractsPayments;
  listPayment: CM_ContractsPayments[];
  contractID = null;

  title = "Lịch thanh toán";
  dialog: DialogRef;
  constructor(
    private cmService: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.action = dt?.data?.action;
    this.contractID = dt?.data?.contractID;
    this.payment = dt?.data?.payment;
    this.listPayment = dt?.data?.listPayment;
  }

  ngOnInit(): void {
    this.setDataInput();
  }

  setPayment(){
    let rowNo = this.listPayment?.length || 0;
    this.payment = new CM_ContractsPayments();
    this.payment.rowNo = rowNo + 1;
    this.payment.refNo = this.contractID;
    this.payment.status = '1';
    this.payment.paidAmt = 0;
  }

  setDataInput(){
    if(this.action == 'add'){
      this.setPayment();
    }
    if(this.action == 'edit'){
      this.payment = JSON.parse(JSON.stringify(this.payment));
    }
    if(this.action == 'copy'){

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

  saveAndClose(){
    if(this.action == 'add' || this.action == 'copy'){
      this.addPayment(true);
    }
    if(this.action == 'edit'){
      this.editPayment(true);
    }
  }

  saveAndContinue(){
    if(this.action == 'add' || this.action == 'copy'){
      this.addPayment(false);
    }
    if(this.action == 'edit'){
      this.editPayment(false);
    }
  }

  addPayment(isClose) {
    this.listPayment.push(this.payment);
    if(isClose){
      this.dialog.close(true);
    }else{
      this.action = "add";
      this.setPayment();
    }
    // this.cmService.addPayments(this.payment).subscribe( res => {
    //   if(res){
    //       this.dialog.close({ payment: res, action: this.action });
    //     }
    //   })
  }
  editPayment(isClose) {
    let paymentIndex = this.listPayment.findIndex(payment => payment.recID == this.payment?.recID);
    if(paymentIndex >= 0){
      this.listPayment.splice(paymentIndex,1,this.payment);
    }
    if(isClose){
      this.dialog.close(true);
    }else{
      this.action = "add";
      this.setPayment();
    }

    // this.cmService.editPayments(this.payment).subscribe( res => {
    //   if(res){
    //       ({ payment: res, action: this.action });
    //     }
    //   })
  }
}
