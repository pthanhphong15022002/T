import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-info-transfer',
  templateUrl: './popup-info-transfer.component.html',
  styleUrls: ['./popup-info-transfer.component.css'],
})
export class PopupInfoTransferComponent {
  dialog!: DialogRef;
  data?: any;
  constructor(
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
    this.data = dialogData?.data?.data;
  }
}
