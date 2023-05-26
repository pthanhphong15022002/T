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

  setDataInput(){
    if(this.action == 'add'){
    }
    if(this.action == 'edit'){

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

  save(){
    if(this.action == 'add' || this.action == 'copy'){
      this.addPayment();
    }
    if(this.action == 'edit'){
      this.editPayment();
    }
  }

  saveAndContinue(){

  }

  addPayment() {
    this.cmService.addPayments(this.payment).subscribe( res => {
      if(res){
          this.dialog.close({ payment: res, action: this.action });
        }
      })
  }
  editPayment() {
    this.cmService.editPayments(this.payment).subscribe( res => {
      if(res){
          this.dialog.close({ payment: res, action: this.action });
        }
      })
  }
}
