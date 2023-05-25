import { Component, OnInit, Optional } from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';
import { DialogData, DialogRef } from 'codx-core';
import { CM_ContractsPayments } from '../../../models/cm_model';

@Component({
  selector: 'lib-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {
  dialog: DialogRef;
  listPaymentHistory:CM_ContractsPayments[];
  payment:CM_ContractsPayments;
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  constructor(
    private cmService: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
  }
  ngOnInit(): void {
    
  }

  onClickMFPayment(e, data){
    switch (e.functionID) {
      case 'SYS02':
        console.log(data);
        
        // this.deleteContract(data);
        break;
      case 'SYS03':
        console.log(data);
        // this.editContract(data);
        break;
      case 'SYS04':
        console.log(data);
        // this.copyContract(data);
        break;
    }
  }
}
