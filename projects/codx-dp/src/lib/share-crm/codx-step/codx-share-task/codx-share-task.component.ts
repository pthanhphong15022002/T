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
import { Observable, concat, filter } from 'rxjs';
import {
  DP_Instances_Steps_Tasks,
  DP_Instances_Steps_Tasks_Roles,
} from '../../../models/models';
import { log } from 'node:console';

@Component({
  selector: 'codx-share-task',
  templateUrl: './codx-share-task.component.html',
  styleUrls: ['./codx-share-task.component.scss'],
})
export class CodxShareTaskComponent implements OnInit {
  dialog!: DialogRef;
  taskCopy: any;
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
  roleSelect = new DP_Instances_Steps_Tasks_Roles();
  typeChange = '';
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
    this.task = dt?.data?.data;
    this.taskCopy = JSON.parse(JSON.stringify(this.task));
    this.title = dt?.data?.title;
    this.user = this.auth.get();
    this.entityName = dt?.data?.entityName;
    this.vllData = dt?.data?.vllData;
  }

  async ngOnInit(): Promise<void> {
    if (this.taskCopy && this.taskCopy?.roles?.length > 0) {
      let roles = this.taskCopy?.roles as DP_Instances_Steps_Tasks_Roles[];
      this.listRoleShare = roles.filter((x) => x.roleType == 'S') || [];
      if (this.listRoleShare?.length > 0) {
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

  //#region ChangePermisson
  changeRole(role) {
    if (role) {
      this.roleSelect = role;
      this.changeDetectorRef.markForCheck();
    }
  }

  changUsers(e) {
    let roles = e?.data as [any];
    if(roles?.length <= 0) return;
    switch (roles[0]?.objectType){
      case 'U':
        this.setRoleShareTypeU(roles);
        break;
      case 'D':
      case 'O':
      case 'P':
        this.setRoleShareTypeEmployees(roles);
        break;
      case 'R':
        this.setRoleShareTypeR(roles);
        break;
    }
    this.changeDetectorRef.markForCheck();
  }

  setRoleShareTypeU(datas: any[]){
    let isSelect = true;
    datas?.forEach((data, i) => {
      if(!this.listRoleShare?.some(x => x.objectID == data.id)){
        var role = new DP_Instances_Steps_Tasks_Roles();
        role.recID = Util.uid();
        role.taskID = this.taskCopy?.recID;
        role.roleType = 'S';
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
        if(isSelect){
          this.roleSelect = role;
          isSelect = false;
        } 
        this.listRoleShare.push(role);
      }
    });
  }
  setRoleShareTypeR(datas: [any]){
    let listID = datas?.map(data => data?.id)
    this.api
    .exec<any>(
      'AD',
      'UsersBusiness',
      'GetListUserByRoleIDAsync',
      [listID]
    )
    .subscribe((res: any[]) => {
      if(res && res?.length > 0){
        let isSelect = true;
        res.forEach((data,i) => {
          if(!this.listRoleShare?.some(x => x.objectID == data.id)){
            var role = new DP_Instances_Steps_Tasks_Roles();
            role.recID = Util.uid();
            role.taskID = this.taskCopy?.recID;
            role.roleType = 'S';
            role.objectName = data.userName;
            role.objectID = data.userID;
            role.roleType = 'S';
            role.objectType = data.userType;
            role.read = true;
            role.update = false;
            role.assign = false;
            role.delete = false;
            role.upload = false;
            role.download = false;
            role.updateProgress = false;
            role.share = false;
            if(isSelect){
              this.roleSelect = role;
              isSelect = false;
            } 
            this.listRoleShare.push(role);
          }
         });
      }else{
        this.notiService.notify("Vai trò này không có nhân viên","3")
      }
    })
  }
  setRoleShareTypeEmployees(datas: [any]){
    let employees: tmpOrganizationStep[];
    employees = datas?.map(data => {
      return {organizationID: data.id, organizationType: data.objectType,  userOrgID: "",userOrgName: "", userOrgType: "", BUID: ""}
    });
    this.api
    .exec<any>(
      'HR',
      'EmployeesBusiness_Old',
      'GetUserManagerByOrgUnitIDAsync',
      [employees]
    )
    .subscribe((res) => {
      if(res && res?.length > 0){
        let isSelect = true;
        res.forEach((data) => {
          if(!this.listRoleShare?.some(x => x.objectID == data.id)){
            var role = new DP_Instances_Steps_Tasks_Roles();
            role.recID = Util.uid();
            role.taskID = this.taskCopy?.recID;
            role.roleType = 'S';
            role.objectName = data.userOrgName;
            role.objectID = data.userOrgID;
            role.roleType = 'S';
            role.objectType = data.userOrgType;
            role.read = true;
            role.update = false;
            role.assign = false;
            role.delete = false;
            role.upload = false;
            role.download = false;
            role.updateProgress = false;
            role.share = false;
            if(isSelect){
              this.roleSelect = role;
              isSelect = false;
            } 
            this.listRoleShare.push(role);
          }
        });
      }else{
        this.notiService.notify("Vai trò này không có nhân viên","3")
      }
    })
  }
  //#endregion

  //#region value change permissons
  valueChange($event, type) {
    if (type != this.typeChange) return;
    var data = $event.data;
    this.roleSelect[type] = data;
    this.setFull(type, data);
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
    } else {
      this.roleSelect.full =
        this.roleSelect?.read &&
        this.roleSelect?.update &&
        this.roleSelect?.assign &&
        this.roleSelect?.delete &&
        this.roleSelect?.upload &&
        this.roleSelect?.download &&
        this.roleSelect?.updateProgress;
    }
  }

  controlFocus(type) {
    this.typeChange = type;
  }
  //#endregion

  //#region remove
  removeUser(index) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x?.event?.status == 'Y') {
        if (this.listRoleShare?.length > 0 && index >= 0) {
          this.listRoleShare.splice(index, 1);
        }
      }
    });
  }
  //#endregion

  //#region save
  onSave() {
    const service = this.entityName == 'DP_Instances' ? 'DP' : 'CM';
    const assemply =
      this.entityName == 'DP_Instances' ? 'ERM.Business.DP' : 'ERM.Business.CM';
    const className =
      this.entityName == 'DP_Instances' ? 'InstancesBusiness' : 'LeadsBusiness';
    this.api
      .execSv<any>(
        'DP',
        'ERM.Business.DP',
        'InstancesStepsTasksBusiness',
        'UpdataRoleShareAsync',
        [this.taskCopy.stepID, this.taskCopy.recID, this.listRoleShare]
      )
      .subscribe((res) => {
        if (res) {
          if (this.task?.roles?.length <= 0) {
            this.task.roles = this.listRoleShare;
          } else {
            let roleNoShare =
              this.task?.roles.filter((x) => x.roleType != 'S') || [];
            this.task.roles = [...roleNoShare, ...this.listRoleShare];
          }
          this.notiService.notifyCode('SYS034');
          this.dialog.close(this.task);
        }
      });
  }
  //#endregion
}

export class  tmpOrganizationStep {
  organizationID: string;
  organizationType: string;
  userOrgID: string;
  userOrgName: string;
  userOrgType: string;
  BUID: string;
}
