import { CodxDpService } from './../../../codx-dp.service';
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
  data: any;
  currentPemission = 0;
  //Role
  full: boolean = false;
  read: boolean;
  assign: boolean;
  edit: boolean;
  delete: boolean;
  publish: boolean;
  create: boolean;
  //Date
  startDate: Date;
  endDate: Date;
  isSetFull = false;
  listRoles = [];
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private dpSv: CodxDpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.process = JSON.parse(JSON.stringify(dt?.data[0]));
    this.lstPermissions = this.process?.permissions;
    this.title = dt.data[1];
    this.type = dt.data[2];
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
        this.lstPermissions[oldIndex].create = this.create;
        this.lstPermissions[oldIndex].edit = this.edit;
        this.lstPermissions[oldIndex].publish = this.publish;
        this.lstPermissions[oldIndex].delete = this.delete;
        this.lstPermissions[oldIndex].assign = this.assign;
        // this.permissions[oldIndex].startDate = this.startDate;
        // this.process.permissions[oldIndex].endDate = this.endDate;
      }
    }

    if (this.lstPermissions[index] != null) {
      this.full =
        this.lstPermissions[index].read &&
        this.lstPermissions[index].create &&
        this.lstPermissions[index].edit &&
        this.lstPermissions[index].delete &&
        this.lstPermissions[index].assign &&
        this.lstPermissions[index].publish;
      this.read = this.lstPermissions[index].read;
      this.create = this.lstPermissions[index].create;
      this.edit = this.lstPermissions[index].edit;
      this.publish = this.lstPermissions[index].publish;
      this.delete = this.lstPermissions[index].delete;
      this.assign = this.lstPermissions[index].assign;
      this.currentPemission = index;
    } else {
      this.full = false;
      this.read = false;
      this.create = false;
      this.edit = false;
      this.publish = false;
      this.delete = false;
      this.assign = false;
      this.currentPemission = index;
    }
    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  //#region Event user
  valueChange($event, type) {
    var data = $event.data;
    // this.isSetFull = data;
    switch (type) {
      case 'full':
        this.full = data;
        if (this.isSetFull) {
          this.read = data;
          this.create = data;
          this.edit = data;
          this.publish = data;
          this.delete = data;
          this.assign = data;
        }

        break;
      default:
        this.isSetFull = false;
        this[type] = data;
        this.create = this.read;
        break;
    }
    if (type != 'full' && data == false) this.full = false;
    if (
      this.read &&
      this.create &&
      this.edit &&
      this.publish &&
      this.delete &&
      this.assign
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
    if (
      this.currentPemission > -1 &&
      this.process.permissions[this.currentPemission] != null &&
      this.process.permissions[this.currentPemission].objectType != '7'
    ) {
      this.process.permissions[this.currentPemission].full = this.full;
      this.process.permissions[this.currentPemission].read = this.read;
      this.process.permissions[this.currentPemission].create = this.create;
      this.process.permissions[this.currentPemission].assign =
        this.assign;
      this.process.permissions[this.currentPemission].delete = this.delete;
      this.process.permissions[this.currentPemission].edit = this.edit;
      this.process.permissions[this.currentPemission].publish = this.publish;
    }
    if(this.type == 'add'){
      this.dialog.close(this.process.permissions);
    }else{
      this.dpSv
        .updatePermissionProcess(this.process)
        .subscribe((res) => {
          if (res.permissions.length > 0) {
            // this.notifi.notifyCode('SYS034');
            this.dialog.close(res);
          }
        });
    }
  }
  //#endregion
}
