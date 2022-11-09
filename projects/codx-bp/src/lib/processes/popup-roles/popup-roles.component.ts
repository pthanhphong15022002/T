import {
  BP_Processes,
  BP_ProcessPermissions,
} from './../../models/BP_Processes.model';
import { AuthStore, DialogData, DialogRef } from 'codx-core';
import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'lib-popup-roles',
  templateUrl: './popup-roles.component.html',
  styleUrls: ['./popup-roles.component.css'],
})
export class PopupRolesComponent implements OnInit {
  process = new BP_Processes();
  permissions: BP_ProcessPermissions[];
  dialog: any;
  data: any;
  title = 'Chia sẻ';
  //#region permissions
  full: boolean = true;
  create: boolean;
  read: boolean;
  updatePerm: boolean;
  deletePerm: boolean;
  share: boolean;
  assign: boolean;
  upload: boolean;
  download: boolean;
  //#endregion
  user: any;
  userID: any;
  isSetFull = false;
  currentPemission = 0;
  constructor(
    private auth: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.user = this.auth.get();
    this.data = JSON.parse(JSON.stringify(dt?.data[1]));
    console.log(dt.data[1]);
    this.process = this.data;
    this.permissions = this.process?.permissions;
  }

  ngOnInit(): void {
    this.changePermission(0);
    if (this.permissions && this.permissions.length > 0) {
      this.permissions.forEach((e) => {
        console.log(e);
      });
    }
  }

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
          this.updatePerm = data;
          this.deletePerm = data;
          this.share = data;
          this.assign = data;
          this.upload = data;
          this.download = data;
        }
        break;
      case 'assign':
        this.assign = data;
        break;
      default:
        this.isSetFull = false;
        this[type] = data;
        break;
    }
    if (type != 'full' && data == false) this.full = false;

    if (
      this.assign &&
      this.create &&
      this.read &&
      this.deletePerm &&
      this.updatePerm &&
      this.upload &&
      this.share &&
      this.download
    )
      this.full = true;

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

  changePermission(index) {
    if (this.currentPemission > -1) {
      let oldIndex = this.currentPemission;
      if (
        oldIndex != index &&
        oldIndex > -1 &&
        this.process.permissions[oldIndex] != null
      ) {
        this.process.permissions[oldIndex].full = this.full;
        this.process.permissions[oldIndex].create = this.create;
        this.process.permissions[oldIndex].read = this.read;
        this.process.permissions[oldIndex].update = this.updatePerm;
        this.process.permissions[oldIndex].delete = this.deletePerm;
        this.process.permissions[oldIndex].share = this.share;
        this.process.permissions[oldIndex].assign = this.assign;
        this.process.permissions[oldIndex].upload = this.upload;
        this.process.permissions[oldIndex].download = this.download;
      }
    }

    if (this.process.permissions[index] != null) {
      this.full =
        this.process.permissions[index].create &&
        this.process.permissions[index].read &&
        this.process.permissions[index].update &&
        this.process.permissions[index].delete &&
        this.process.permissions[index].share &&
        this.process.permissions[index].assign &&
        this.process.permissions[index].upload &&
        this.process.permissions[index].download;
      this.create = this.process.permissions[index].create;
      this.read = this.process.permissions[index].read;
      this.updatePerm = this.process.permissions[index].update;
      this.deletePerm = this.process.permissions[index].delete;
      this.share = this.process.permissions[index].share;
      this.assign = this.process.permissions[index].assign;
      this.upload = this.process.permissions[index].upload;
      this.download = this.process.permissions[index].download;
      this.currentPemission = index;
      this.userID = this.process.permissions[index].objectID;
    } else {
      this.full = false;
      this.create = false;
      this.read = false;
      this.updatePerm = false;
      this.deletePerm = false;
      this.share = false;
      this.assign = false;
      this.upload = false;
      this.download = false;
      this.currentPemission = index;
    }

    this.changeDetectorRef.detectChanges();
  }

  //#endregion

  //#region delete
  removeUserRight(index, list: BP_ProcessPermissions[] = null) {}

  //#endregion
}
