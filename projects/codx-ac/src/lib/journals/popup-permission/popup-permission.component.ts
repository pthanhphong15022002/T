import { Component, Injector, Optional } from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';
import { IJournalPermission } from '../interfaces/IJournalPermission.interface';
import { JournalService } from '../journals.service';
import { JournalPermission } from '../models/JournalPermission.model';

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
    private journalService: JournalService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.permissions = [...dialogData.data?.permissions];
    this.permissions?.map((p) => {
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
      (m) =>
        new JournalPermission(
          this.journalService.getRoleType(e.field),
          m.objectType,
          m.id,
          m.text
        )
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
    this.dialogRef.close(
      this.permissions.map((p) => ({
        ...p,
        add: p.add === true ? '1' : '0',
        post: p.post === true ? '1' : '0',
      }))
    );
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
