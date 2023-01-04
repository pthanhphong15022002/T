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
  ApiHttpService,
} from 'codx-core';
import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'lib-popup-roles',
  templateUrl: './popup-roles.component.html',
  styleUrls: ['./popup-roles.component.css'],
})
export class PopupRolesComponent implements OnInit {
  process = new BP_Processes();
  permissions: BP_ProcessPermissions[];
  lstTmp: BP_ProcessPermissions[] = [];
  dialog: any;
  data: any;
  title = '';
  //#region permissions
  full: boolean = false;
  create: boolean;
  read: boolean;
  edit: boolean;
  publish: boolean;
  share: boolean;
  assign: boolean;
  upload: boolean;
  download: boolean;
  deletePerm: boolean;
  allowPermit: boolean;
  //#endregion
  user: any;
  userID: any;
  listRoles: any;
  startDate: Date;
  endDate: Date;
  isSetFull = false;
  currentPemission = 0;
  idUserSelected: any;
  popover: any;
  autoName: any;
  isAssign: any;
  autoCreate: any;
  nemberType = '';
  approveStatus = '';
  checkRoles = false;
  adminRoles = false;
  lstTest = [];
  constructor(
    private auth: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    private notifi: NotificationsService,
    private bpSv: CodxBpService,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.user = this.auth.get();
    this.data = JSON.parse(JSON.stringify(dt?.data[1]));
    this.title = dt.data[0];
    this.process = this.data;
    this.process.permissions = this.groupBy1(
      this.process.permissions,
      'objectType',
      'objectID'
    ).sort((a, b) =>
      ('' + a.objectID).localeCompare(this.process.owner)
        ? 1
        : a.memberType > b.memberType
        ? 0
        : -1
    );

    // this.groupBy(this.process.permissions);
    // this.process.permissions = this.process.permissions.groupBy1();
    // this.process.permissions = this.groupBy1(this.process.permissions, 'objectID');
    this.cache.valueList('BP019').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
    this.startDate = null;
    this.endDate = null;
    // this.groupBy1();
  }

  ngOnInit(): void {
    if (this.process.permissions.length > 0) {
      this.changePermission(0);
    }
  }

  ngAfterViewInit(): void {
    //Tạo sẵn check quyền, vì db quyền của module này chưa có
    if (!this.user.administrator) {
      this.api
        .callSv('SYS', 'AD', 'UserRolesBusiness', 'CheckUserRolesAsync', [
          this.user.userID,
          'BP',
        ])
        .subscribe((res) => {
          this.checkRoles = res.msgBodyData[0];
        });
    }
  }

  groupBy(list) {
    this.api
      .execSv<any>(
        'BP',
        'BP',
        'ProcessesBusiness',
        'SortListPermissionsOfRolesAsync',
        [list]
      )
      .subscribe((res) => {
        if (res != null) {
          this.process.permissions = res.sort((a, b) =>
            ('' + a.objectID).localeCompare(this.process.owner) ? 1 : -1
          );
        }
      });
  }

  groupBy1(arr, key1, key2) {
    var lstGroup = [];
    var group = arr.reduce(function (rv, x) {
      (rv[x[key1] + ',' + x[key2]] = rv[x[key1] + ',' + x[key2]] || []).push(x);
      return rv;
    }, {});
    for (var key of Object.keys(group)) {
      var tmp = group[key];
      for (var item in Object.keys(tmp)) {
        lstGroup.push(tmp[item]);
      }
    }
    return lstGroup.sort((a, b) =>
      a.objectID > b.objectID ? 1 : a.memberType > b.memberType ? 0 : -1
    );
  }
  //#region save
  onSave() {
    if (this.startDate != null && this.endDate != null) {
      if (this.startDate >= this.endDate) {
        this.notifi.notify('Vui lòng chọn ngày bắt đầu nhỏ hơn ngày kết thúc!');
        return;
      }
      //Chưa có mssg code
      if (!this.isCheckFromToDate(this.startDate)) {
        this.notifi.notify('Vui lòng chọn ngày bắt đầu lớn hơn ngày hiện tại!');
        return;
      }
    }
    if (
      this.currentPemission > -1 &&
      this.process.permissions[this.currentPemission] != null &&
      this.process.permissions[this.currentPemission].objectType != '7'
    ) {
      this.process.permissions[this.currentPemission].full = this.full;
      this.process.permissions[this.currentPemission].startDate =
        this.startDate;
      this.process.permissions[this.currentPemission].endDate = this.endDate;
      this.process.permissions[this.currentPemission].read = this.read;
      this.process.permissions[this.currentPemission].download = this.download;
      this.process.permissions[this.currentPemission].share = this.share;
      this.process.permissions[this.currentPemission].allowPermit =
        this.allowPermit;
      this.process.permissions[this.currentPemission].delete = this.deletePerm;
      this.process.permissions[this.currentPemission].edit = this.edit;
      this.process.permissions[this.currentPemission].publish = this.publish;
    }

    this.bpSv.bpProcesses.next(this.process);
    this.changeDetectorRef.detectChanges();

    if (
      this.process.permissions != null &&
      this.process.permissions.length > 0
    ) {
      this.bpSv
        .updatePermissionProcess(this.process, this.lstTmp)
        .subscribe((res) => {
          if (res.permissions.length > 0) {
            this.notifi.notifyCode('SYS034');
            this.dialog.close(res);
          }
        });
    }
  }

  //#endregion

  //#region event

  isCheckFromToDate(toDate) {
    var to = new Date(toDate);
    if (to >= new Date()) return true;
    else return false;
  }
  valueChange($event, type) {
    var data = $event.data;
    // this.isSetFull = data;
    switch (type) {
      case 'full':
        this.full = data;
        if (this.isSetFull) {
          this.read = data;
          this.share = data;
          this.allowPermit = data;
          this.download = data;
          this.edit = data;
          this.publish = data;
          this.deletePerm = data;
        }

        break;
      case 'startDate':
        if (data != null) this.startDate = data.fromDate;
        break;
      case 'endDate':
        if (data != null) this.endDate = data.fromDate;
        break;
      case 'delete':
        if (data != null) this.deletePerm = data;
        break;
      default:
        this.isSetFull = false;
        this[type] = data;
        break;
    }
    if (type != 'full' && data == false) this.full = false;

    if (
      this.allowPermit &&
      this.read &&
      this.share &&
      this.download &&
      this.edit &&
      this.publish &&
      this.deletePerm
    )
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
        this.process.permissions[oldIndex].allowPermit = this.allowPermit;
        this.process.permissions[oldIndex].download = this.download;
        this.process.permissions[oldIndex].delete = this.deletePerm;
        this.process.permissions[oldIndex].edit = this.edit;
        this.process.permissions[oldIndex].publish = this.publish;
        this.process.permissions[oldIndex].startDate = this.startDate;
        this.process.permissions[oldIndex].endDate = this.endDate;
      }
    }

    if (this.process.permissions[index] != null) {
      this.full =
        this.process.permissions[index].read &&
        this.process.permissions[index].share &&
        this.process.permissions[index].allowPermit &&
        this.process.permissions[index].download &&
        this.process.permissions[index].edit &&
        this.process.permissions[index].delete &&
        this.process.permissions[index].publish;
      this.read = this.process.permissions[index].read;
      this.share = this.process.permissions[index].share;
      this.allowPermit = this.process.permissions[index].allowPermit;
      this.deletePerm = this.process.permissions[index].delete;
      this.download = this.process.permissions[index].download;
      this.edit = this.process.permissions[index].edit;
      this.publish = this.process.permissions[index].publish;
      this.startDate = this.process.permissions[index].startDate;
      this.endDate = this.process.permissions[index].endDate;
      this.currentPemission = index;
      this.approveStatus = this.process.permissions[index].approveStatus;
      this.autoCreate = this.process.permissions[index].autoCreate;
      this.nemberType = this.process.permissions[index].memberType;
      this.userID = this.process.permissions[index].objectID;
    } else {
      this.full = false;
      this.read = false;
      this.edit = false;
      this.publish = false;
      this.share = false;
      this.deletePerm = false;
      this.allowPermit = false;
      this.download = false;
      this.currentPemission = index;
    }

    if (this.process.owner == this.process.permissions[index].objectID) {
      this.isAssign = false;
    } else if (
      (this.autoCreate && this.nemberType == '1') ||
      (!this.autoCreate && this.nemberType == '2') ||
      (!this.autoCreate && this.nemberType == '3') ||
      (!this.autoCreate && this.nemberType == '4' && this.approveStatus == '5')
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
        if (data.id != this.process.owner) {
          perm.startDate = this.startDate;
          perm.endDate = this.endDate;
          perm.objectName = data.text != null ? data.text : data.objectName;
          perm.objectID = data.id != null ? data.id : null;
          perm.memberType = '2';
          perm.autoCreate = false;
          perm.objectType = data.objectType;
          this.process.permissions = this.checkUserPermission(
            this.process.permissions,
            perm
          );

          // this.groupBy(this.process.permissions);
        }
      }
      this.changePermission(0);
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
            (x.objectID != null &&
              x.objectID === perm.objectID &&
              x.memberType == '2') ||
            (x.objectID == null &&
              x.objectType == perm.objectType &&
              x.memberType == '2')
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
      perm.allowPermit = false;
      perm.edit = false;
      perm.publish = false;
      perm.delete = false;

      // if (perm.objectType.toLowerCase() == '9') {
      //   perm.download = true;
      // }

      if (perm.objectType.toLowerCase() == '7') {
        perm.read = true;
        perm.download = true;
        perm.full = true;
        perm.share = true;
        perm.allowPermit = true;
        perm.edit = true;
        perm.publish = true;
        perm.delete = true;
      }

      list.push(Object.assign({}, perm));
    }
    return this.groupBy1(list, 'objectType', 'objectID');
  }
  //#endregion

  //#region delete
  removeUser(index, list: BP_ProcessPermissions[] = null) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    var tmps = [];
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
              var tmp = this.process.permissions[index];
              var check = this.lstTmp?.some((x) => x.objectID == tmp.objectID);

              if (!check) {
                this.lstTmp.push(tmp);
              }

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
    if (
      this.user.administrator ||
      this.checkRoles ||
      this.user.userID == this.process.owner ||
      this.process.permissions[this.currentPemission].objectType == '1' ||
      this.process.permissions[this.currentPemission].objectType == '7'
    ) {
      if (this.isAssign) return false;
      else return true;
    } else return false;
  }

  checkAssignRemove(i) {
    if (
      this.user.administrator ||
      this.checkRoles ||
      this.user.userID == this.process.owner
    ) {
      if (
        !this.process.permissions[i].autoCreate &&
        this.process.permissions[i].memberType == '2'
      )
        //  (this.permissions[i].objectID == '' && this.permissions[i].objectID == null)

        return true;
      else return false;
    } else return false;
  }

  //#endregion

  //#region roles
  // showPopover(p, data) {
  //   if (data.objectType !== '7' || data.memberType != '0') {
  //     if (this.popover) this.popover.close();
  //     if (data.objectID) this.idUserSelected = data.objectID;

  //     p.open();
  //     this.popover = p;
  //   }
  // }

  // selectRoseType(idUserSelected, value) {
  //   this.process.permissions.forEach((res) => {
  //     if (res.objectID != null && res.objectID != '') {
  //       if (res.objectID == idUserSelected && res.objectType != '7' && res.objectType != '1' && value != '0' )
  //         res.memberType = value;
  //     }
  //   });
  //   this.changeDetectorRef.detectChanges();

  //   this.popover.close();
  // }
  //#endregion
}
