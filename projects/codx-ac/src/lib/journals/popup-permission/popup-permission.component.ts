import { Component, Injector, Optional } from '@angular/core';
import { DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-popup-permission',
  templateUrl: './popup-permission.component.html',
  styleUrls: ['./popup-permission.component.scss'],
})
export class PopupPermissionComponent extends UIComponent {
  //#region Constructor
  users: any[];

  constructor(injector: Injector, @Optional() public dialogRef: DialogRef) {
    super(injector);
  }
  //#endregion

  //#region Init
  override onInit(): void {}
  //#endregion

  //#region Event
  onChange(e): void {
    console.log(e);

    this.users = e.data;
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
