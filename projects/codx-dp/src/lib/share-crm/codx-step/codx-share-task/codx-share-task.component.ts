import { ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, Optional } from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { CM_Permissions } from 'projects/codx-cm/src/lib/models/cm_model';
import { CodxCmService } from 'projects/codx-cm/src/projects';
import { Observable } from 'rxjs';
import {
  DP_Instances_Steps_Tasks,
  DP_Instances_Steps_Tasks_Roles,
} from '../../../models/models';

@Component({
  selector: 'codx-share-task',
  templateUrl: './codx-share-task.component.html',
  styleUrls: ['./codx-share-task.component.scss'],
})
export class CodxShareTaskComponent implements OnInit {
  dialog!: DialogRef;
  task: any;
  title = '';
  entityName: string;
  lstPermissions: CM_Permissions[] = [];
  lstDeletePermissions: CM_Permissions[] = [];
  listRoles = [];
  currentPemission: number;
  //#region quyền
  isSetFull = false;
  full: boolean = false;
  read: boolean = true;
  update: boolean;
  assign: boolean;
  updateProgress: boolean;
  upload: boolean;
  download: boolean;
  delete: boolean;
  allowPermit: boolean;
  allowUpdateStatus: boolean;
  config = '';
  //#endregion
  showInput = false;
  isAdd = true;
  popover: any;
  objectIDSelect: any;
  user: any;
  isAdmin: boolean = false;

  listDataTabView;
  vllData;

  listRoleShare: DP_Instances_Steps_Tasks_Roles[];
  roleSelect = new DP_Instances_Steps_Tasks_Roles;
  typeChange = "";
  constructor(
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private auth: AuthStore,
    private cmService: CodxCmService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.task = JSON.parse(JSON.stringify(dt?.data?.data));
    this.title = dt?.data?.title;
    this.user = this.auth.get();
    this.entityName = dt?.data?.entityName;
    this.vllData = dt?.data?.vllData;
    if (this.task?.permissions != null && this.task?.permissions?.length > 0) {
      this.lstPermissions = this.sortOrGroup(this.task?.permissions);
    }
  }

  async ngOnInit(): Promise<void> {
    if (this.task && this.task?.roles?.length > 0) {
      let roles = this.task?.roles as DP_Instances_Steps_Tasks_Roles[];
      this.listRoleShare = roles.filter((x) => x.roleType == 'S') || [];
      if(this.listRoleShare?.length > 0){
        this.roleSelect = this.listRoleShare[0];
      }
    }
  }

  ngAfterViewInit(): void {
    this.isAdmin = !this.user?.administrator;
    if (!this.user?.administrator) {
      this.api
        .execSv<any>('SYS', 'AD', 'UserRolesBusiness', 'CheckUserRolesAsync', [
          this.user?.userID,
          'CM',
        ])
        .subscribe((res) => {
          this.isAdmin = res;
        });
    }
  }

  //#region sort
  sortOrGroup(permissions = []) {
    return permissions.sort((a, b) => {
      if (a.roleType === 'O') {
        return -1;
      } else if (b.roleType === 'O') {
        return 1;
      } else {
        return a.roleType.localeCompare(b.roleType);
      }
    });
  }

  //#endregion

  //#region ChangePermisson
  changePermissions(role) {
    if(role){
      this.roleSelect = role;
      this.changeDetectorRef.markForCheck();
    }
  }

  changUsers(e) {
    if (e.data) {
      var value = e.data;
      let lst = [];
      for (var i = 0; i < value.length; i++) {
        var data = value[i];
        if(data && this.listRoleShare.some(x => x.objectID == data.id)) continue;
        var role = new DP_Instances_Steps_Tasks_Roles();
        role.recID = Util.uid();
        role.taskID = this.task?.recID;
        role.roleType = "S";
        role.objectName = data.text != null ? data.text : data.objectName;
        role.objectID = data.id != null ? data.id : null;
        role.roleType = 'S';
        role.objectType = data.objectType;
        role.read = true;
        role.update = false;
        role.assign = false;
        role.delete = false;
        role.upload = false;
        role.download = false;
        role.updateProgress = false;
        role.share = false;
        this.listRoleShare.push(role);
        if(i== 0){
          this.roleSelect = role;
        }
      }
      this.changeDetectorRef.markForCheck();
    }
  }

  checkUserPermission(list, perm) {
    var index = -1;
    if (list != null) {
      if (perm != null && list.length > 0) {
        index = list.findIndex(
          (x) =>
            (x.objectID != null &&
              x.objectID === perm.objectID &&
              x.memberType == '1') ||
            (x.objectID == null &&
              x.objectType == perm.objectType &&
              x.memberType == '1')
        );
      }
    } else {
      list = [];
    }
    if (index == -1) {
      perm.full = false;
      perm.read = true;
      perm.update = true;
      perm.assign = false;
      perm.delete = false;
      perm.upload = true;
      perm.download = true;
      perm.allowPermit = false;
      perm.allowUpdateStatus = '1';

      list.push(Object.assign({}, perm));
    }

    if (perm.objectType == '7') {
      perm.full = true;
      perm.read = true;
      perm.update = true;
      perm.assign = true;
      perm.delete = true;
      perm.upload = true;
      perm.download = true;
      perm.allowPermit = true;
      perm.allowUpdateStatus = '1';
    }
    return list;
  }
  //#endregion

  //#region popover

  showPopover(p, userID) {
    if (this.popover) this.popover.close();
    if (userID) this.objectIDSelect = userID;
    p.open();
    this.popover = p;
  }

  selectRoleType(objectIDSelect, value) {
    if (objectIDSelect) {
      let index = this.lstPermissions.findIndex(
        (x) => x.objectID == objectIDSelect && value != x.roleType
      );
      if (index != -1) {
        this.lstPermissions[index].roleType = value;
        this.lstPermissions = this.sortOrGroup(this.lstPermissions);
      }
    }

    this.changeDetectorRef.detectChanges();
    this.popover.close();
  }
  //#endregion

  //#region value change permissons
  valueChange($event, type) {
    if(type != this.typeChange) return;
    var data = $event.data;
    this.roleSelect[type] = data;
    this.setFull(type,data);
    this.changeDetectorRef.markForCheck();
  }

  setFull(type, data) {
    if (type == 'full') {
      this.roleSelect.read = data;
      this.roleSelect.update = data;
      this.roleSelect.assign = data;
      this.roleSelect.delete = data;
      this.roleSelect.upload = data;
      this.roleSelect.download = data;
      this.roleSelect.updateProgress = data;
      this.roleSelect.share = data;
    }else{
      this.roleSelect.full =
      this.roleSelect?.read &&
      this.roleSelect?.update &&
      this.roleSelect?.assign &&
      this.roleSelect?.delete &&
      this.roleSelect?.upload &&
      this.roleSelect?.download &&
      this.roleSelect?.updateProgress
    }
  }

  controlFocus(type) {
    this.typeChange = type;
  }
  //#endregion

  valueChangeTab(event, tab) {
    tab.isCheck = event?.data;
  }

  getConfig() {
    let tabCheck = this.listDataTabView
      ?.filter((x) => x.isCheck)
      ?.map((x) => x.value);
    this.config = tabCheck?.join(';') ?? '';
    return this.config;
  }
  setConfig(config: string) {
    if (config) {
      this.listDataTabView?.forEach((element) => {
        if (config.includes(element?.value)) {
          element.isCheck = true;
        } else {
          element.isCheck = false;
        }
      });
    } else {
      this.listDataTabView = this.listDataTabView?.map((element) => {
        return { ...element, isCheck: false };
      });
    }
  }

  //#region  check Permission
  checkAdminUpdate() {
    if (!this.isAdmin && this.user?.userID != this.task.owner) {
      if (this.lstPermissions != null && this.lstPermissions.length > 0) {
        if (
          (this.lstPermissions[this.currentPemission]?.roleType == 'O' &&
            this.lstPermissions[this.currentPemission]?.objectID ==
              this.task?.owner) ||
          (!this.task?.allowPermit && this.entityName != 'CM_Customers') ||
          this.lstPermissions[this.currentPemission]?.memberType == '0'
        ) {
          return true;
        }
      }
    }

    return false;
  }

  checkAddUser() {
    if (
      this.task?.assign ||
      this.isAdmin ||
      this.user?.userID == this.task?.owner
    ) {
      this.isAdd = true;
    } else {
      this.isAdd = false;
    }
  }

  checkRemove(index) {
    if (!this.isAdmin && this.user?.userID != this.task.owner) {
      if (this.lstPermissions != null && this.lstPermissions.length > 0) {
        if (
          (this.lstPermissions[index]?.roleType == 'O' &&
            this.lstPermissions[index]?.objectID == this.task?.owner) ||
          !this.task?.assign ||
          this.lstPermissions[index]?.memberType == '0' ||
          this.lstPermissions[index]?.memberType == '2'
        )
          return true;
      }
    }
    return false;
  }
  //#endregion
  //#region remove
  removeUser(index) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x?.event?.status == 'Y') {
        if (this.listRoleShare?.length > 0 && index >= 0) {
          this.listRoleShare.splice(index,1);
          this.changePermissions(this.currentPemission);
        }
      }
    });
  }
  //#endregion

  //#region save

  setPermissionsToData() {
    if (this.lstPermissions != null && this.lstPermissions.length > 0) {
      if (
        this.task?.permissions != null &&
        this.task?.permissions?.length > 0
      ) {
        var lst = [];
        for (var item of this.task?.permissions) {
          for (var inline of this.lstPermissions) {
            if (
              inline.memberType == '1' &&
              inline.objectID == item?.objectID &&
              inline.objectType == item?.objectType
            ) {
              var newItem = new CM_Permissions();
              newItem = inline;
            }
          }
        }
      } else {
        this.task.permissions = this.lstPermissions;
      }
    }
  }

  onSave() {

    const service = this.entityName == 'DP_Instances' ? 'DP' : 'CM';
    const assemply = this.entityName == 'DP_Instances' ? 'ERM.Business.DP' : 'ERM.Business.CM';
    const className = this.entityName == 'DP_Instances' ? 'InstancesBusiness' : 'LeadsBusiness';
    this.api
      .execSv<any>("DP", "ERM.Business.DP", "InstancesStepsTasksBusiness", 'UpdataRoleShareAsync', [
        this.task.stepID,
        this.task.recID,
        this.listRoleShare,
      ])
      .subscribe((res) => {
        if (res) {
         
          this.notiService.notifyCode('SYS034');
          this.dialog.close(this.task);
        }
      });
  }
  //#endregion
}
