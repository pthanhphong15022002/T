import { Component, Injector, Optional } from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';
import { IJournalPermission } from '../interfaces/IJournalPermission.interface';

@Component({
  selector: 'lib-popup-permission',
  templateUrl: './popup-permission.component.html',
  styleUrls: ['./popup-permission.component.scss'],
})
export class PopupPermissionComponent extends UIComponent {
  //#region Constructor
  objects: any[] = [];
  selectedIndex: number;
  journalPermissions: IJournalPermission[] = [];

  constructor(
    injector: Injector,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.journalPermissions = dialogData.data?.journalPermissions;
  }
  //#endregion

  //#region Init
  override onInit(): void {}
  //#endregion

  //#region Event
  onChange(e): void {
    console.log(e);

    this.objects = e.data;
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
