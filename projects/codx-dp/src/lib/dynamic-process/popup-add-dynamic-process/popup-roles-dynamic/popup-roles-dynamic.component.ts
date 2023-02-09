import { DP_Processes, DP_Processes_Permission } from './../../../models/models';
import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-roles-dynamic',
  templateUrl: './popup-roles-dynamic.component.html',
  styleUrls: ['./popup-roles-dynamic.component.css'],
})
export class PopupRolesDynamicComponent implements OnInit {
  dialog: any;
  title = '';
  process = new DP_Processes();
  lstPermissions: DP_Processes_Permission[] = [];
  type = '';
  currentPemission = 0;
  //Role
  full: boolean = false;
  read: boolean;
  update: boolean;
  allowPermit: boolean;
  edit: boolean;
  delete: boolean;
  share: boolean;
  upload: boolean;
  download: boolean;
  //Date
  startDate: Date;
  endDate: Date;
  isSetFull = false;
  listRoles = [];
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.process = dt.data[0]
    this.lstPermissions = this.process?.permissions;
    this.title = dt.data[1];
    this.cache.valueList('DP010').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
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
        this.lstPermissions[oldIndex].edit = this.edit;
        this.lstPermissions[oldIndex].share = this.share;
        this.lstPermissions[oldIndex].download = this.download;
        this.lstPermissions[oldIndex].delete = this.delete;
        this.lstPermissions[oldIndex].allowPermit = this.allowPermit;
        this.lstPermissions[oldIndex].upload = this.upload;
        // this.permissions[oldIndex].startDate = this.startDate;
        // this.process.permissions[oldIndex].endDate = this.endDate;
      }
    }

    if (this.lstPermissions[index] != null) {
      this.full =
        this.lstPermissions[index].read &&
        this.lstPermissions[index].share &&
        this.lstPermissions[index].edit &&
        this.lstPermissions[index].download &&
        this.lstPermissions[index].delete &&
        this.lstPermissions[index].allowPermit &&
        this.lstPermissions[index].upload;
      this.read = this.lstPermissions[index].read;
      this.edit = this.lstPermissions[index].edit;
      this.share = this.lstPermissions[index].share;
      this.delete = this.lstPermissions[index].delete;
      this.download = this.lstPermissions[index].download;
      this.upload = this.lstPermissions[index].upload;
      this.allowPermit = this.lstPermissions[index].allowPermit;
      this.currentPemission = index;
    } else {
      this.full = false;
      this.read = false;
      this.edit = false;
      this.upload = false;
      this.share = false;
      this.delete = false;
      this.allowPermit = false;
      this.download = false;
      this.currentPemission = index;
    }
    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  //#region Event user
  valueChange(e, type) {
    var data = e.data;
    // this.isSetFull = data;
    switch (type) {
      case 'full':
        this.full = data;
        if (this.isSetFull) {
          this.read = data;
          this.edit = data;
          this.share = data;
          this.upload = data;
          this.download = data;
          this.delete = data;
          this.allowPermit = data;
        }

        break;
      case 'delete':
        if (data != null) this.delete = data;
        break;
      default:
        this.isSetFull = false;
        this[type] = data;
        break;
    }
    if (type != 'full' && data == false) this.full = false;

    if (
      this.read &&
      this.edit &&
      this.share &&
      this.upload &&
      this.download &&
      this.delete &&
      this.allowPermit
    )
      this.full = true;

    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  //#region check role
  controlFocus(isFull) {
    this.isSetFull = isFull;
    this.changeDetectorRef.detectChanges();
  }

  checkAdminUpdate() {
    return false;
  }

  onSave(){

  }
  //#endregion
}
