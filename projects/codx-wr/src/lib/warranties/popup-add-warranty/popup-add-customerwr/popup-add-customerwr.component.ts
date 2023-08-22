import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-customerwr',
  templateUrl: './popup-add-customerwr.component.html',
  styleUrls: ['./popup-add-customerwr.component.css']
})
export class PopupAddCustomerWrComponent {

  data: any;
  dialog: DialogRef;
  title = '';
  radioChecked = true;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef) {

    this.dialog = dialog;
    this.title = dt?.data?.title
  }

  //#region
  onSave(){

  }
  //#endregion

  changeRadio(e){
    if (e.field === 'yes' && e.component.checked === true) {
      this.radioChecked = true;
    } else if (e.field === 'no' && e.component.checked === true) {
      this.radioChecked = false;
    }
  }

  valueChange(e){

  }
}
