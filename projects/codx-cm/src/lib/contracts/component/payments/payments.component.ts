import { Component, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CM_ContractsPayments } from '../../../models/cm_model';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'lib-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent  implements OnInit {
  type: 'pay' | 'payHistory';
  action = '';
  payment: CM_ContractsPayments;
  contractID = null;

  title: string;
  dialog: DialogRef;
  constructor(
    private cmService: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.type = dt?.data?.type;
    this.action = dt?.data?.action;
    this.contractID = dt?.data?.contractID;
  }

  ngOnInit(): void {
    this.title = this.type === 'pay' ? "Lịch thanh toán" : "Lịch sử thanh toán"
    this.setDataInput();
  }

  setDataInput(){
    if(this.action == 'add'){
      this.payment = new CM_ContractsPayments();
      this.payment.refNo = this.contractID;
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
