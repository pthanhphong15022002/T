import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import {
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { CodxDpService } from '../../codx-dp.service';
import { DP_Processes, DP_Processes_Permission } from '../../models/models';

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
  // publish: boolean;
  create: boolean;
  //Date
  startDate: Date;
  endDate: Date;
  isSetFull = false;
  isCheck = false;
  listRoles = [];
  lstPerm = [];
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private noti: NotificationsService,
    private cache: CacheService,
    private dpSv: CodxDpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dt?.data[0]));
    this.process = this.data;
    this.lstPerm = Object.values(
      this.groupBy(this.process.permissions, 'roleType')
    ).flat();
    this.process.permissions = this.lstPerm.filter(x=> x.roleType != 'R');
    this.title = dt.data[1];
    this.type = dt.data[2];
    this.cache.valueList('DP010').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  ngOnInit(): void {
    if (this.process.permissions != null && this.process.permissions.length > 0)
      this.changePermission(0);
  }

  groupBy(arr, key) {
    return arr.reduce((acc, obj) => {
      const groupKey = obj[key];
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(obj);
      return acc;
    }, {});
  }

  //#region changePermissions click current
  async changePermission(index) {
    if (this.currentPemission > -1) {
      let oldIndex = this.currentPemission;
      if (
        oldIndex != index &&
        oldIndex > -1 &&
        this.process.permissions[oldIndex] != null
      ) {
        this.process.permissions[oldIndex].full = this.full;
        this.process.permissions[oldIndex].read = this.read;
        this.process.permissions[oldIndex].create = this.create;
        this.process.permissions[oldIndex].edit = this.edit;
        // this.process.permissions[oldIndex].publish = this.publish;
        this.process.permissions[oldIndex].delete = this.delete;
        this.process.permissions[oldIndex].assign = this.assign;
        // this.permissions[oldIndex].startDate = this.startDate;
        // this.process.permissions[oldIndex].endDate = this.endDate;
      }
    }

    if (this.process.permissions[index] != null) {
      this.full =
        this.process.permissions[index].read &&
        this.process.permissions[index].create &&
        this.process.permissions[index].edit &&
        this.process.permissions[index].delete &&
        this.process.permissions[index].assign;
      // this.process.permissions[index].publish;
      this.read = this.process.permissions[index].read;
      this.create = this.process.permissions[index].create;
      this.edit = this.process.permissions[index].edit;
      // this.publish = this.process.permissions[index].publish;
      this.delete = this.process.permissions[index].delete;
      this.assign = this.process.permissions[index].assign;

      this.currentPemission = index;
    } else {
      this.full = false;
      this.read = false;
      this.create = false;
      this.edit = false;
      // this.publish = false;
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
    switch (type) {
      case 'full':
        this.full = data;
        if (this.isSetFull) {
          this.read = data;
          this.create = data;
          this.edit = data;
          // this.publish = data;
          this.delete = data;
          this.assign = data;
        }
        break;
      default:
        this.isSetFull = false;
        this[type] = data;
        break;
    }

    if (type != 'full' && data == false) this.full = false;

    if (
      this.read &&
      this.create &&
      this.edit &&
      // this.publish &&
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
    if (
      this.process.permissions[this.currentPemission].objectType == '1'
    )
      return true;
    return false;
  }

  onSave() {
    if (
      this.currentPemission > -1 &&
      this.process.permissions[this.currentPemission] != null &&
      this.process.permissions[this.currentPemission].objectType != '7'
    ) {
      this.process.permissions[this.currentPemission].full = this.full;
      this.process.permissions[this.currentPemission].read = this.read;
      this.process.permissions[this.currentPemission].create = this.create;
      this.process.permissions[this.currentPemission].assign = this.assign;
      this.process.permissions[this.currentPemission].delete = this.delete;
      this.process.permissions[this.currentPemission].edit = this.edit;
      // this.process.permissions[this.currentPemission].publish = this.publish;
    }
    if (this.type == 'add') {
      this.dialog.close(this.process.permissions);
    } else {
      this.dpSv.updatePermissionProcess(this.process).subscribe((res) => {
        if (res.permissions.length > 0) {
          // this.notifi.notifyCode('SYS034');
          this.noti.notifyCode('SYS034');
          this.dialog.close(res);
        }
      });
    }
  }
}
