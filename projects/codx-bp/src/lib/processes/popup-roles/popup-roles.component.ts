import { CodxBpService } from './../../codx-bp.service';
import {
  BP_Processes,
  BP_ProcessPermissions,
} from './../../models/BP_Processes.model';
import {
  AlertConfirmInputConfig,
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
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
    private notifi: NotificationsService,
    private bpSv: CodxBpService,
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
  //#region save
  onSave() {
    if (
      this.currentPemission > -1 &&
      this.process.permissions[this.currentPemission] != null
    ) {
      this.process.permissions[this.currentPemission].full = this.full;
      this.process.permissions[this.currentPemission].create = this.create;
      this.process.permissions[this.currentPemission].read = this.read;
      this.process.permissions[this.currentPemission].update = this.updatePerm;
      this.process.permissions[this.currentPemission].delete = this.deletePerm;
      this.process.permissions[this.currentPemission].download = this.download;
      this.process.permissions[this.currentPemission].share = this.share;
      this.process.permissions[this.currentPemission].upload = this.upload;
      this.process.permissions[this.currentPemission].assign = this.assign;
    }

    this.bpSv.bpProcesses.next(this.process);
    this.changeDetectorRef.detectChanges();

    if (
      this.process.permissions != null &&
      this.process.permissions.length > 0
    ) {
      this.bpSv.updatePermissionProcess(this.process).subscribe((res) => {
        if (res.permissions != null) {
          this.notifi.notify('Phân quyền thành công');
        } else {
          this.notifi.notify('Phân quyền không thành công');
        }
      });
    }
    this.dialog.close();
  }
  //#endregion

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
      case 'delete':
        this.deletePerm = data;
        break;
      case 'update':
        this.updatePerm = data;
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

  changUsers(e) {
    if (e.data != undefined) {
      var value = e.data;
      for (var i = 0; i < value.length; i++) {
        var data = value[i];
        var perm = new BP_ProcessPermissions();
        perm.objectName = data.text != null ? data.text : data.objectName;
        perm.objectID = data.id;
        perm.objectType = data.objectType;
        this.process.permissions = this.checkUserPermission(
          this.process.permissions,
          perm
        );
      }
      this.changePermission(this.currentPemission);
    }
  }

  checkUserPermission(
    list: BP_ProcessPermissions[],
    perm: BP_ProcessPermissions
  ) {
    var index = -1;
    if (list != null) {
      if (perm != null && list.length > 0) {
        index = list.findIndex(
          (x) =>
            (x.objectID != null && x.objectID === perm.objectID) ||
            (x.objectID == null && x.objectType == perm.objectType)
        );
      }
    } else {
      list = [];
    }
    if (index == -1) {
      perm.read = true;
      perm.download = false;
      perm.full = false;
      perm.share = false;
      perm.update = false;
      perm.create = false;
      perm.delete = false;
      perm.upload = false;
      perm.assign = false;

      if (perm.objectType.toLowerCase() == '9') {
        perm.download = true;
      }

      if (perm.objectType.toLowerCase() == '7') {
        perm.download = true;
        perm.full = true;
        perm.share = true;
        perm.update = true;
        perm.create = true;
        perm.delete = true;
        perm.upload = true;
      }

      list.push(Object.assign({}, perm));
      this.currentPemission = list.length - 1;
    }
    return list;
  }
  //#endregion

  //#region delete
  removeUser(index, list: BP_ProcessPermissions[] = null) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notifi
      .alert('Thông báo', 'Bạn muốn xóa đối tượng này', config)
      .closed.subscribe((x) => {
        if (x.event.status == 'Y') {
          if (list == null) {
            if (
              this.process &&
              this.process.permissions &&
              this.process.permissions.length > 0
            ) {
              this.process.permissions.splice(index, 1);
              this.currentPemission = 0;
              this.changePermission(0);
            }
          } else {
            if (list && list.length > 0) {
              list.splice(index, 1); //remove element from array
              this.changeDetectorRef.detectChanges();
            }
          }
        }
      });
  }

  //#endregion
}
