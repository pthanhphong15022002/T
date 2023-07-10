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
  permissions: IJournalPermission[] = [];
  selectedIndex: number;

  constructor(
    injector: Injector,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.permissions = dialogData.data?.journalPermissions;
    this.permissions.map((p) => {
      p.add = p.add == '1';
      p.post = p.post == '1';
    });
    this.selectedIndex = this.permissions.length > 0 ? 0 : -1;
  }
  //#endregion

  //#region Init
  override onInit(): void {}
  //#endregion

  //#region Event
  onObjectListChange(e): void {
    console.log(e);

    this.permissions = e.data.map(
      (d) =>
        ({
          journalNo: this.dialogData.data?.journalNo,
          objectType: d.objectType,
          objectName: d.text,
          objectID: d.id,
          add: true,
          read: '1',
          edit: '1',
          delete: '1',
          post: true,
        } as IJournalPermission)
    );
    this.selectedIndex = this.permissions.length > 0 ? 0 : -1;
  }

  onClickRemove(index: number): void {
    this.permissions.splice(index, 1);
  }

  onInputChange(e): void {
    console.log('onInputChange', e);

    this.permissions[this.selectedIndex][e.field] = e.data;
  }

  onClickSave(): void {
    this.dialogRef.close()
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
