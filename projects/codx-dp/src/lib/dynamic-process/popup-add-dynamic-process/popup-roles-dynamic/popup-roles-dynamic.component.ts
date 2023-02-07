import { DP_Processes_Permission } from './../../../models/models';
import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-roles-dynamic',
  templateUrl: './popup-roles-dynamic.component.html',
  styleUrls: ['./popup-roles-dynamic.component.css'],
})
export class PopupRolesDynamicComponent implements OnInit {
  dialog: any;
  title = '';
  lstPermissions: DP_Processes_Permission[] = [];
  type = '';
  currentPemission = 0;
  //Role
  full: boolean = false;
  create: boolean;
  read: boolean;
  update: boolean;
  assign: boolean;
  delete: boolean;
  share: boolean;
  upload: boolean;
  download: boolean;
  //Date
  startDate: Date;
  endDate: Date;

  constructor( private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData, @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    this.lstPermissions = dt.data[0];
    this.title = dt.data[1];
  }

  ngOnInit(): void {
    if (this.lstPermissions != null && this.lstPermissions.length > 0)
      this.changePermission(0);
  }

  //#region changePermissions click current
  changePermission(index) {
    if (this.currentPemission > -1) {
      let oldIndex = this.currentPemission;
      if (
        oldIndex != index &&
        oldIndex > -1 &&
        this.lstPermissions[oldIndex] != null
      ) {
        this.lstPermissions[oldIndex].full = this.full;
        this.lstPermissions[oldIndex].read = this.read;
        this.lstPermissions[oldIndex].share = this.share;
        this.lstPermissions[oldIndex].create = this.create;
        this.lstPermissions[oldIndex].download = this.download;
        this.lstPermissions[oldIndex].delete = this.delete;
        this.lstPermissions[oldIndex].assign = this.assign;
        this.lstPermissions[oldIndex].upload = this.upload;
        // this.permissions[oldIndex].startDate = this.startDate;
        // this.process.permissions[oldIndex].endDate = this.endDate;
      }
    }

    if (this.lstPermissions[index] != null) {
      this.full =
        this.lstPermissions[index].read &&
        this.lstPermissions[index].share &&
        this.lstPermissions[index].create &&
        this.lstPermissions[index].download &&
        this.lstPermissions[index].delete &&
        this.lstPermissions[index].assign &&
        this.lstPermissions[index].upload;
      this.read = this.lstPermissions[index].read;
      this.share = this.lstPermissions[index].share;
      this.create = this.lstPermissions[index].create;
      this.delete = this.lstPermissions[index].delete;
      this.download = this.lstPermissions[index].download;
      this.upload = this.lstPermissions[index].upload;
      this.assign = this.lstPermissions[index].assign;
      this.currentPemission = index;
    } else {
      this.full = false;
      this.read = false;
      this.create = false;
      this.upload = false;
      this.share = false;
      this.delete = false;
      this.assign = false;
      this.download = false;
      this.currentPemission = index;
    }
    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  //#region Event user
  valueChange(e, type) {}
  //#endregion

  //#region check role
  controlFocus(focus) {}

  checkAdminUpdate() {
    return true;
  }
  //#endregion
}
