import { CodxBpService } from './../../codx-bp.service';
import {
  BP_Processes,
  BP_ProcessPermissions,
} from './../../models/BP_Processes.model';
import {
  AlertConfirmInputConfig,
  AuthStore,
  CacheService,
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
  title = '';
  //#region permissions
  full: boolean;
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
  listRoles: any;
  isSetFull = false;
  currentPemission = 0;
  idUserSelected: any;
  popover: any;
  autoName: any;
  isAssign: any;
  autoCreate: any;
  nemberType = '';
  constructor(
    private auth: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    private notifi: NotificationsService,
    private bpSv: CodxBpService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.user = this.auth.get();
    this.data = JSON.parse(JSON.stringify(dt?.data[1]));
    this.title = dt.data[0];
    console.log(dt.data[1]);
    this.process = this.data;
    if (this.process.permissions.length > 0 && this.process.permissions != null)
      this.permissions = this.process?.permissions;
    this.cache.valueList('BP019').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        console.log(res.datas);
        this.listRoles = res.datas;
      }
    });
    this.cache.valueList('BP020').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        console.log(res.datas);
        this.autoName = res.datas[0].text;
      }
    });
  }

  ngOnInit(): void {
    if (this.process.permissions.length > 0) {
      this.changePermission(0);
    }
  }
  //#region save
  onSave() {
    if (
      this.currentPemission > -1 &&
      this.process.permissions[this.currentPemission] != null
    ) {
      this.process.permissions[this.currentPemission].full = this.full;
      this.process.permissions[this.currentPemission].read = this.read;
      this.process.permissions[this.currentPemission].download = this.download;
      this.process.permissions[this.currentPemission].share = this.share;
      this.process.permissions[this.currentPemission].assign = this.assign;
    }

    this.bpSv.bpProcesses.next(this.process);
    this.changeDetectorRef.detectChanges();

    if (
      this.process.permissions != null &&
      this.process.permissions.length > 0
    ) {
      this.bpSv.updatePermissionProcess(this.process).subscribe((res) => {
        if (res.permissions.length > 0) {
          this.notifi.notify('Phân quyền thành công');
          this.dialog.close(res);
        } else {
          this.notifi.notify('Phân quyền không thành công');
          this.dialog.close();
        }
      });
    }
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
          this.read = data;
          this.share = data;
          this.assign = data;
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

    if (this.assign && this.read && this.share && this.download)
      this.full = true;

    this.changeDetectorRef.detectChanges();
  }

  controlFocus(isFull) {
    this.isSetFull = isFull;
    this.changeDetectorRef.detectChanges();
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
        this.process.permissions[oldIndex].read = this.read;
        this.process.permissions[oldIndex].share = this.share;
        this.process.permissions[oldIndex].assign = this.assign;
        this.process.permissions[oldIndex].download = this.download;
      }
    }

    if (this.process.permissions[index] != null) {
      this.full =
        this.process.permissions[index].read &&
        this.process.permissions[index].share &&
        this.process.permissions[index].assign &&
        this.process.permissions[index].download;
      this.read = this.process.permissions[index].read;
      this.share = this.process.permissions[index].share;
      this.assign = this.process.permissions[index].assign;
      this.download = this.process.permissions[index].download;
      this.currentPemission = index;
      this.autoCreate = this.process.permissions[index].autoCreate;
      this.nemberType = this.process.permissions[index].nemberType;
      this.userID = this.process.permissions[index].objectID;
    } else {
      this.full = false;
      this.read = false;
      this.share = false;
      this.assign = false;
      this.download = false;
      this.currentPemission = index;
    }

    if (
      (this.autoCreate &&
        this.nemberType == '1') ||
      (!this.autoCreate &&
        this.nemberType == '1') ||
      (!this.autoCreate &&
        this.nemberType == '2') ||
      (!this.autoCreate &&
        this.nemberType == '3')
    )
      this.isAssign = true;
    else this.isAssign = false;

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
        perm.nemberType = '1';
        perm.autoCreate = false;
        perm.isActive = true;
        perm.update = true;
        perm.delete = true;
        perm.read = true;
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

  //#region assign
  checkAdminUpdate() {
    if (this.isAssign) return false;
    else return true;
  }

  checkAssignRemove(i) {
    if (
      (!this.autoCreate &&
        this.nemberType == '1')

    )
    //  (this.permissions[i].objectID == '' && this.permissions[i].objectID == null)

      return true;
    else return false;
  }
  //#endregion

  //#region roles
  showPopover(p, userID) {
    if (this.popover) this.popover.close();
    if (userID) this.idUserSelected = userID;
    p.open();
    this.popover = p;
  }

  selectRoseType(idUserSelected, value) {
    this.process.permissions.forEach((res) => {
      if (res.objectID != null && res.objectID != '') {
        if (res.objectID == idUserSelected) res.nemberType = value;
      }
    });
    this.changeDetectorRef.detectChanges();

    this.popover.close();
  }
  //#endregion
}
