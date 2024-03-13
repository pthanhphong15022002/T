import { CM_Deals, CM_Cases } from './../models/cm_model';
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
import { CM_Permissions } from '../models/cm_model';
import { CodxCmService } from '../codx-cm.service';

@Component({
  selector: 'lib-popup-permissions',
  templateUrl: './popup-permissions.component.html',
  styleUrls: ['./popup-permissions.component.css'],
})
export class PopupPermissionsComponent implements OnInit {
  dialog!: DialogRef;
  data: any;
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
  upload: boolean;
  download: boolean;
  delete: boolean;
  allowPermit: boolean;
  allowUpdateStatus: boolean;
  config = "";
  //#endregion
  showInput = false;
  isAdd = true;
  popover: any;
  objectIDSelect: any;
  user: any;
  isAdmin: boolean = false;
  tabDefault = {
    CM_Contracts: "1,5,7,8,9",
    CM_Customers: "1,2,3,4,5",
    CM_Deals: "1,2,5,6,7",
    CM_Cases: "1,4,6"
  }
  listDataTabView;

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
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.title = dt?.data?.title;
    this.user = this.auth.get();
    this.entityName = dt?.data?.entityName;
    if (this.data?.permissions != null && this.data?.permissions?.length > 0) {
      this.lstPermissions = this.sortOrGroup(this.data?.permissions);
    }
  }

  async ngOnInit(): Promise<void> {
    this.checkAdminUpdate();
    this.checkAddUser();
    this.cache.valueList('CRM051').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
    if (
      this.lstPermissions.filter((x) => x.memberType == '1') != null &&
      this.lstPermissions.filter((x) => x.memberType == '1').length > 0
    ) {
      this.currentPemission = this.lstPermissions.findIndex(
        (inline) => inline.memberType === '1'
      );
      this.changePermissions(this.currentPemission);
    }
    let tabEntity = this.tabDefault[this.entityName];
    let vllData = await this.cmService.getValueList("CRM086");
    if(vllData){
      let listDataTabView = vllData.filter(x => tabEntity.includes(x?.value));
      if(listDataTabView){
        this.listDataTabView = listDataTabView.map((x) => {return {...x, isCheck: false}});
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
  changePermissions(index) {
    if (this.currentPemission > -1) {
      let oldIndex = this.currentPemission;
      if (
        oldIndex != index &&
        oldIndex > -1 &&
        this.lstPermissions[oldIndex] != null
      ) {
        this.lstPermissions[oldIndex].full = this.full;
        this.lstPermissions[oldIndex].read = this.read;
        this.lstPermissions[oldIndex].update = this.update;
        this.lstPermissions[oldIndex].assign = this.assign;
        this.lstPermissions[oldIndex].delete = this.delete;
        this.lstPermissions[oldIndex].upload = this.upload;
        this.lstPermissions[oldIndex].download = this.download;
        this.lstPermissions[oldIndex].allowPermit = this.allowPermit;
        this.lstPermissions[oldIndex].allowUpdateStatus = this.allowUpdateStatus
          ? '1'
          : '0';
        this.lstPermissions[oldIndex].config = this.getConfig();
      }
    }
    if (this.lstPermissions[index] != null) {
      this.full = this.lstPermissions[index].full;
      this.read = this.lstPermissions[index].read;
      this.update = this.lstPermissions[index].update;
      this.assign = this.lstPermissions[index].assign;
      this.delete = this.lstPermissions[index].delete;
      this.upload = this.lstPermissions[index].upload;
      this.download = this.lstPermissions[index].download;
      this.allowPermit = this.lstPermissions[index].allowPermit;
      this.allowUpdateStatus =
        this.lstPermissions[index].allowUpdateStatus == '1' ? true : false;
      this.currentPemission = index;
      this.config = this.lstPermissions[index]?.config;
      this.setConfig(this.config);
    } else {
      this.full = false;
      this.read = true;
      this.update = false;
      this.assign = false;
      this.delete = false;
      this.upload = false;
      this.download = false;
      this.allowPermit = false;
      this.allowUpdateStatus = false;
      this.setConfig('');
      this.currentPemission = index;
    }
    this.changeDetectorRef.detectChanges();
  }

  changUsers(e) {
    if (e.data) {
      var value = e.data;
      let lst = [];
      for (var i = 0; i < value.length; i++) {
        var data = value[i];
        var perm = new CM_Permissions();
        perm.recID = Util.uid();
        perm.objectName = data.text != null ? data.text : data.objectName;
        perm.objectID = data.id != null ? data.id : null;
        perm.roleType = 'S';
        perm.isActive = true;
        perm.objectType = data.objectType;
        perm.memberType = '1';
        lst = this.checkUserPermission(this.lstPermissions, perm);

        // this.groupBy(this.process.permissions);
      }
      this.lstPermissions = this.sortOrGroup(lst);
      this.currentPemission = this.lstPermissions.length - 1;
      this.changePermissions(this.currentPemission);
      this.changeDetectorRef.detectChanges();
    }
  }

  checkUserPermission(list: CM_Permissions[], perm: CM_Permissions) {
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
    var data = $event.data;
    switch (type) {
      case 'full':
        this.full = data;
        if (this.isSetFull) {
          this.read = data;
          this.update = data;
          this.assign = data;
          this.delete = data;
          this.upload = data;
          this.download = data;
          this.allowPermit = data;
          this.allowUpdateStatus = data;
          this.config = data ? this.tabDefault[this.entityName] : "";
          this.setConfig(this.config);
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
      this.update &&
      this.assign &&
      this.delete &&
      this.upload &&
      this.download &&
      this.allowPermit &&
      this.allowUpdateStatus
    )
      this.full = true;

    this.changeDetectorRef.detectChanges();
  }

  controlFocus(isFull) {
    this.isSetFull = isFull;
    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  valueChangeTab(event,tab) {
    if(event?.data){
      tab.isCheck = event?.data;
    }
  }

  getConfig(){
    let tabCheck = this.listDataTabView?.filter(x => x.isCheck)?.map(x => x.value);
    this.config = tabCheck.join(";");
    return this.config;
  }
  setConfig(config:string){
    if(config){
      this.listDataTabView?.forEach(element => {
        if(config.includes(element?.value)){
          element.isCheck = true;
        }else{
          element.isCheck = false;
        }
      });
    }else{
      this.listDataTabView = this.listDataTabView?.map(element => {return {...element, isCheck: false}});
    }
  }

  //#region  check Permission
  checkAdminUpdate() {
    if (!this.isAdmin && this.user?.userID != this.data.owner) {
      if (this.lstPermissions != null && this.lstPermissions.length > 0) {
        if (
          (this.lstPermissions[this.currentPemission]?.roleType == 'O' &&
            this.lstPermissions[this.currentPemission]?.objectID ==
              this.data?.owner) ||
          (!this.data?.allowPermit && this.entityName != 'CM_Customers') ||
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
      this.data?.assign ||
      this.isAdmin ||
      this.user?.userID == this.data?.owner
    ) {
      this.isAdd = true;
    } else {
      this.isAdd = false;
    }
  }

  checkRemove(index) {
    if (!this.isAdmin && this.user?.userID != this.data.owner) {
      if (this.lstPermissions != null && this.lstPermissions.length > 0) {
        if (
          (this.lstPermissions[index]?.roleType == 'O' &&
            this.lstPermissions[index]?.objectID == this.data?.owner) ||
          !this.data?.assign ||
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
    var tmps = [];
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x?.event?.status == 'Y') {
        if (this.lstPermissions && this.lstPermissions.length > 0) {
          var tmp = this.lstPermissions[index];
          var check = this.lstDeletePermissions?.some(
            (x) => x.objectID == tmp.objectID
          );
          if (!check) {
            this.lstDeletePermissions.push(tmp);
          }
          this.lstPermissions.splice(index, 1);
          if (this.lstPermissions != null && this.lstPermissions.length > 0)
            this.currentPemission = this.lstPermissions.findIndex(
              (inline) => inline.memberType === '1'
            );
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
        this.data?.permissions != null &&
        this.data?.permissions?.length > 0
      ) {
        var lst = [];
        for (var item of this.data?.permissions) {
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
        this.data.permissions = this.lstPermissions;
      }
    }
  }

  onSave() {
    this.data.permissions = this.lstPermissions ?? [];
    if (
      this.currentPemission > -1 &&
      this.lstPermissions[this.currentPemission] != null &&
      this.lstPermissions[this.currentPemission].objectType != '7'
    ) {
      this.lstPermissions[this.currentPemission].full = this.full;
      this.lstPermissions[this.currentPemission].read = this.read;
      this.lstPermissions[this.currentPemission].update = this.update;
      this.lstPermissions[this.currentPemission].assign = this.assign;
      this.lstPermissions[this.currentPemission].delete = this.delete;
      this.lstPermissions[this.currentPemission].upload = this.upload;
      this.lstPermissions[this.currentPemission].download = this.download;
      this.lstPermissions[this.currentPemission].allowPermit = this.allowPermit;
      this.lstPermissions[this.currentPemission].allowUpdateStatus = this
        .allowUpdateStatus
        ? '1'
        : '0';
      this.lstPermissions[this.currentPemission].config = this.getConfig();
    }
    this.api
      .execSv<any>(
        'CM',
        'ERM.Business.CM',
        'LeadsBusiness',
        'UpdatePermissionsAsync',
        [this.data, this.entityName]
      )
      .subscribe((res) => {
        if (res) {
          this.data.full = res.full;
          this.data.write = res.write;
          this.data.assign = res.assign;
          this.data.delete = res.delete;
          this.data.upload = res.upload;
          this.data.download =
            res.download =
            this.data.allowPermit =
              res.allowPermit;
          this.data.alloweStatus = res.alloweStatus;
          this.notiService.notifyCode('SYS034');
          this.dialog.close(this.data);
        }
      });
  }
  //#endregion
}
