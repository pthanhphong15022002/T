import { Component, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CM_ContractsPayments } from '../../../models/cm_model';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'lib-popup-add-payment-history',
  templateUrl: './popup-add-payment-history.component.html',
  styleUrls: ['./popup-add-payment-history.component.scss']
})
export class PopupAddPaymentHistoryComponent {
  action = '';
  payment: CM_ContractsPayments;
  paymentHistory: CM_ContractsPayments;
  contractID = null;

  title = "Lịch sử thanh toán";
  dialog: DialogRef;
  constructor(
    private cmService: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.action = dt?.data?.action;
    this.contractID = dt?.data?.contractID;
    this.payment = dt?.data?.data;
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

  getPaymentBy
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
