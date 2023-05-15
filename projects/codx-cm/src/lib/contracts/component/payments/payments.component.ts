import { Component, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CM_ContractsPayments } from '../../../models/cm_model';

@Component({
  selector: 'lib-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent  implements OnInit {
  type: 'pay' | 'payHistory';
  action = '';
  payment: any;

  title: string;
  dialog: DialogRef;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.type = dt?.data?.type;
    this.action = dt?.data?.action;
    this.payment = dt?.data?.data;
  }

  ngOnInit(): void {
    this.title = this.type === 'pay' ? "Lịch thanh toán" : "Lịch sử thanh toán"
  }

  setDataInput(){
    if(this.action == 'add'){
      this.payment = new CM_ContractsPayments();
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

}
