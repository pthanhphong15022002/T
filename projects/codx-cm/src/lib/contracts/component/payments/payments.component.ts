import { Component, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

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

}
