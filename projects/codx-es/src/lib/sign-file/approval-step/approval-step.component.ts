import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-approval-step',
  templateUrl: './approval-step.component.html',
  styleUrls: ['./approval-step.component.css']
})
export class ApprovalStepSignComponent {
  transID:any = '';
  approveStatus = '';
  dialog:any;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.dialog = dialog;
    if(dt?.data?.transID) this.transID = dt?.data?.transID;
    if(dt?.data?.approveStatus) this.approveStatus = dt?.data?.approveStatus
    
  }
}
