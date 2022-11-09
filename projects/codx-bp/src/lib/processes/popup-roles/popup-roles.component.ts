import { BP_Processes, BP_ProcessPermissions } from './../../models/BP_Processes.model';
import { AuthStore, DialogData, DialogRef } from 'codx-core';
import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'lib-popup-roles',
  templateUrl: './popup-roles.component.html',
  styleUrls: ['./popup-roles.component.css'],
})
export class PopupRolesComponent implements OnInit {
  process = new BP_Processes();
  permissions : BP_ProcessPermissions[];
  dialog: any;
  data: any;
  titleDialog = 'Chia sẻ';
  //#region permissions
  full: boolean = true;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  share: boolean;
  assign: boolean;
  upload: boolean;
  download: boolean;
  //#endregion
  user: any;
  isSetFull = false;
  constructor(
    private auth: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.user = this.auth.get();
    this.process = dt?.data[1];
    this.permissions = this.process?.permissions;
  }

  ngOnInit(): void {}

  onSave() {}

  //#region event
  valueChange(e: any, type: string) {
    console.log(e, type);
    var data = e.data;
    switch (type) {
      case 'full':
        this.full = data;
        if (this.isSetFull) {
          this.create = data;
          this.read = data;
          this.update = data;
          this.delete = data;
          this.share = data;
          this.assign = data;
          this.upload = data;
          this.download = data;
        }
        break;
      default:
        this.isSetFull = false;
        this[type] = data;
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  controlFocus(isFull) {
    this.isSetFull = isFull;
    this.changeDetectorRef.detectChanges();
  }

  checkAdminUpdate() {
    if (this.user.administrator) return false;
    else return true;
  }
  //#endregion
}
