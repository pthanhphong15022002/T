import { Component, Injector, OnInit, Optional } from '@angular/core';
import { DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-popup-confirm-save-label',
  templateUrl: './popup-confirm-save-label.component.html',
  styleUrls: ['./popup-confirm-save-label.component.scss'],
})
export class PopupConfirmSaveLabelComponent extends UIComponent {
  dialog;
  constructor(private inject: Injector, @Optional() dialog?: DialogRef) {
    super(inject);
    this.dialog = dialog;
  }

  onInit(): void {}

  closePopUp(isConfirm) {
    this.dialog.close(isConfirm);
  }
}
