import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-view-detail-popup',
  templateUrl: './view-detail-popup.component.html',
  styleUrls: ['./view-detail-popup.component.css']
})
export class ViewDetailPopupComponent {
  dialog:any;
  recID:any;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.recID = dt?.data;
  }
}
