import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-servicetag',
  templateUrl: './popup-add-servicetag.component.html',
  styleUrls: ['./popup-add-servicetag.component.css'],
})
export class PopupAddServicetagComponent {
  data: any;
  dialog: DialogRef;
  title = '';

  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    this.title = dt?.data?.title
  }

   //#region onSave
   onSave(){

   }
   //#endregion

  valueChange(e) {}
}
