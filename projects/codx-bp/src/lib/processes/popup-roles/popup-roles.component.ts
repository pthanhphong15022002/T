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
  checkRoles = true;
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
    console.log(dt.data[1]);
    this.process = this.data;
    if (this.process.permissions.length > 0 && this.process.permissions != null)
      this.permissions = this.process?.permissions.sort(
        (a, b) => parseInt(a.memberType) - parseInt(b.memberType)
      );
    this.cache.valueList('BP019').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        console.log(res.datas);
        this.listRoles = res.datas;
      }
    });
    this.startDate = null;
    this.endDate = null;
  }

  ngOnInit(): void {
    if (this.process.permissions.length > 0) {
      this.changePermission(0);
    }
  }

  ngAfterViewInit(): void {
    //Tạo sẵn check quyền, vì db quyền của module này chưa có
    this.api
      .callSv('SYS', 'AD', 'UserRolesBusiness', 'CheckUserRolesAsync', [
        this.user.userID,
        'BP',
      ])
      .subscribe((res) => {
        this.checkRoles = res.msgBodyData[0];
      });
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
  //   //Add '${implements OnChanges}' to the class.
  //   this.permissions = this.process?.permissions.sort(
  //     (a, b) => parseInt(a.memberType) - parseInt(b.memberType)
  //   );
  // }

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
      this.process.permissions[this.currentPemission].assign = this.assign;
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
      this.bpSv.updatePermissionProcess(this.process).subscribe((res) => {
        if (res.permissions.length > 0) {
          this.notifi.notifyCode('SYS034');
          this.dialog.close(res);
        } else {
          this.notifi.notify('Phân quyền không thành công');
          return;
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
          this.assign = data;
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
      this.assign &&
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
        this.process.permissions[oldIndex].assign = this.assign;
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
        this.process.permissions[index].assign &&
        this.process.permissions[index].download &&
        this.process.permissions[index].edit &&
        this.process.permissions[index].delete &&
        this.process.permissions[index].publish;
      this.read = this.process.permissions[index].read;
      this.share = this.process.permissions[index].share;
      this.assign = this.process.permissions[index].assign;
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
      this.assign = false;
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
        perm.startDate = this.startDate;
        perm.endDate = this.endDate;
        perm.objectName = data.text != null ? data.text : data.objectName;
        perm.objectID = data.id;
        perm.memberType = '2';
        perm.autoCreate = false;
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
        perm.assign = true;
        perm.edit = true;
        perm.publish = true;
        perm.delete = true;
      }

      list.push(Object.assign({}, perm));
      var i = list
        .sort((a, b) => parseInt(a.memberType) - parseInt(b.memberType))
        .findIndex((x) => x.objectID == perm.objectID);
      this.currentPemission = i;
    }
    return list.sort((a, b) => parseInt(a.memberType) - parseInt(b.memberType));
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
    if (
      this.user.administrator ||
      this.user.userID == this.process.owner ||
      this.process.permissions[this.currentPemission].objectType == '1' ||
      this.process.permissions[this.currentPemission].objectType == '7'
    ) {
      if (this.isAssign) return false;
      else return true;
    } else return false;
  }

  checkAssignRemove(i) {
    if (this.user.administrator || this.user.userID == this.process.owner) {
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
  showPopover(p, data) {
    if (data.objectType !== '7' || data.memberType != '0') {
      if (this.popover) this.popover.close();
      if (data.objectID) this.idUserSelected = data.objectID;

      p.open();
      this.popover = p;
    }
  }

  selectRoseType(idUserSelected, value) {
    this.process.permissions.forEach((res) => {
      if (res.objectID != null && res.objectID != '') {
        if (res.objectID == idUserSelected && value != '0')
          res.memberType = value;
      }
    });
    this.changeDetectorRef.detectChanges();

    this.popover.close();
  }
  //#endregion
}
