import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-form-advanced-settings',
  templateUrl: './form-advanced-settings.component.html',
  styleUrls: ['./form-advanced-settings.component.scss']
})
export class FormAdvancedSettingsComponent {

  dialog: DialogRef;
  title = 'Thiết lập nâng cao';
  data: any;
  constructor(
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ){
    this.dialog = dialog;
    this.data = dt?.data?.process ? JSON.parse(JSON.stringify(dt?.data?.process)) : {};
  }

  valueChange(e){

  }
}
