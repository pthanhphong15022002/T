import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  CacheService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { firstValueFrom } from 'rxjs';
import { tmpInstances, tmpInstancesStepsRoles } from '../../models/tmpModel';
import { CM_Permissions } from '../../models/cm_model';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'lib-popup-assgin-deal',
  templateUrl: './popup-assgin-deal.component.html',
  styleUrls: ['./popup-assgin-deal.component.scss'],
})
export class PopupAssginDealComponent
  extends UIComponent
  implements AfterViewInit
{
  dialogRef: DialogRef;
  formModel: FormModel;
  title = '';
  employee: any;
  activeTab: string;
  subHeaderText: string = '';

  objectID: string = '';
  employeeName: any;
  gridViewSetup: any;
  applyProcess: boolean = false;
  isLockStep: boolean = false;

  isViewUser: boolean = false;
  isViewBuild: boolean = true;
  isViewGroup: boolean = true;

  @ViewChild('cbxOwner') cbxOwner: CodxInputComponent;
  @ViewChild('form') form: CodxFormComponent;

  recID: any;
  stepID: any;
  refID: any;
  processID: any;
  owner: any;
  ownerOld: any;
  ownerStep: any;
  step: any;
  buid: any;
  user: any;
  groupUserID: any;
  // startControl: string = '';
  applyFor: string = '';
  orgUnitName: string = '';
  positionName: string = '';

  listParticipants = [];
  data: any;
  animation: object = {
    previous: { effect: '', duration: 0, easing: '' },
    next: { effect: '', duration: 0, easing: '' },
  };
  instance: tmpInstances;
  listUser: any[] = [];
  isCallInstance: boolean = false;
  isCloseCM: boolean = true;
  readonly fieldCbxParticipants = { text: 'userName', value: 'userID' };
  readonly viewBUID: string = 'ViewBUID';
  readonly viewDefault: string = 'ViewDefault';
  readonly viewGroupUser: string = 'viewGroupUser';

  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private codxCmService: CodxCmService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dialogRef = dialogRef;
    this.user = this.authStore.get();
    this.title = dialogData?.data.titleAction;
    this.applyProcess = dialogData?.data.applyProcess;
    this.isCallInstance = dialogData?.data?.isCallInstance;
    this.data = JSON.parse(JSON.stringify(dialogData?.data?.data));
    if (this.applyProcess) {
      this.refID = dialogData?.data?.refID;
      (this.stepID = dialogData?.data?.stepID),
        (this.processID = dialogData?.data.processID);
    }
    this.recID = dialogData?.data?.recID;
    this.applyFor = dialogData?.data.applyFor;
    this.isCallInstance && this.getDataCM();
    this.owner = JSON.parse(JSON.stringify(this.data?.owner));
    this.gridViewSetup = dialogData?.data.gridViewSetup;
    this.formModel = dialogData?.data.formModel;
    // this.startControl = dialogData?.data.startControl;
    //this.disableViewTab(this.owner,'');
    this.promiseAll();
  }

  ngAfterViewInit(): void {}

  onInit(): void {}
  loadTabView() {}

  click(event: any) {
    switch (event) {
    }
  }
  clickMenu(item) {}
  cancel() {
    this.dialogRef.close();
  }
  async getDataCM() {
    let datas = [this.recID, this.applyFor];
    let dataCM = await firstValueFrom(this.codxCmService.getOneDataCM(datas));
    this.data = dataCM[0];
  }
  async promiseAll() {
    (this.applyProcess || this.isCallInstance ) && await this.getListPermission( this.processID, this.applyFor,  this.stepID  );
    this.owner && (await this.getInformationUser(this.owner));
  }
  async getListPermission(processId, applyFor, stepID) {
    var data = [processId, applyFor, stepID];
    this.codxCmService.getListPermissionOwner(data).subscribe(async (res) => {
      if (res) {
        this.listParticipants = res[0];
        if (this.data?.owner) {
          let user = this.listParticipants.filter(
            (x) => x.userID == this.data?.owner
          )[0];
          this.employeeName = user?.userName;
        }
      }
    });
  }
  // async getListPermissionInGroup(permissions) {
  //   return permissions != null && permissions.length > 0
  //     ? await this.codxCmService.getListUserByOrg(permissions)
  //     : permissions;
  // }
  async getInformationUser(objectID) {
    this.codxCmService.getEmployeesByDomainID(objectID).subscribe((user) => {
      if (user) {
        this.assignToSetting(user);
        this.searchOwner(
          '1',
          'O',
          '0',
          objectID,
          this.employeeName,
          this.data?.permissions
        );
      } else {
        this.notificationsService.notifyCode('Nhân viên không còn tồn tại');
      }
    });
  }

  async getListUserByOrg(lstRoles, objectType) {
    var owner = '';
    if (lstRoles != null && lstRoles.length > 0) {
      switch (objectType) {
        case 'O':
          var o = await firstValueFrom(
            this.codxCmService.getListUserByListOrgUnitIDAsync(lstRoles, 'O')
          );
          if (o != null && o.length > 0) {
            owner = o[0]?.userID;
          }
          break;
        case 'D':
          var d = await firstValueFrom(
            this.codxCmService.getListUserByListOrgUnitIDAsync(lstRoles, 'D')
          );
          if (d != null && d.length > 0) {
            owner = d[0]?.userID;
          }
          break;
        case 'P':
          var p = await firstValueFrom(
            this.codxCmService.getListUserByListOrgUnitIDAsync(lstRoles, 'P')
          );
          if (p != null && p.length > 0) {
            owner = d[0]?.userID;
          }
          break;
        case 'R':
          var r = await firstValueFrom(
            this.codxCmService.getListUserByRoleID(lstRoles)
          );
          if (r != null && r.length > 0) {
            owner = r[0]?.userID;
          }
          break;
      }
    }
    return owner;
  }

  changeOwner(evt: any, view: any) {
    if (evt?.data) {
      if (view === this.viewDefault) {
        this.owner = evt.data;
        //this.buid = '';
      } else if (view === this.viewBUID) {
        //   this.buid = evt.data;
        //  var datas = [this.buid];
        // this.codxCmService.getListUserByBUID(datas).subscribe((res) => {
        //   if (res) {
        //     this.listUser = res;
        //   }
        // });
        this.owner = evt.component.itemsSelected[0].Owner;
      }
      // this.codxCmService
      // .getEmployeesByDomainID(this.owner)
      // .subscribe((user) => {
      //   if (user) {
      //     this.assignTo(user);
      //   }
      // });
      this.getInformationUser(this.owner);

      //this.searchOwner('1', 'O', '0', this.owner, ownerName);
    } else if (evt?.data == null || evt?.data == '' || !evt?.data) {
      this.deleteOwner('1', 'O', '0', 'owner', this.data);
    }
    // this.disableViewTab(evt?.data,view);
  }
  searchOwner(
    objectType: any,
    roleType: any,
    memberType: any,
    owner: any,
    ownerName: any,
    dataPermission: any
  ) {
    let index = -1;
    if (dataPermission?.length > 0 && dataPermission) {
      index = dataPermission.findIndex(
        (x) =>
          x.objectType == objectType &&
          x.roleType === roleType &&
          x.memberType == memberType
      );
      if (index != -1) {
        dataPermission[index].objectID = owner;
        dataPermission[index].objectName = ownerName;
        dataPermission[index].modifiedBy = this.user.userID;
        dataPermission[index].modifiedOn = new Date();
      }
    }
    if (index == -1) {
      this.addOwner(owner, ownerName, roleType, objectType, dataPermission);
    }
  }
  addOwner(owner, ownerName, roleType, objectType, dataPermission) {
    let permission = new CM_Permissions();
    permission.objectID = owner;
    permission.objectName = ownerName;
    permission.objectType = objectType;
    permission.roleType = roleType;
    permission.memberType = '0';
    permission.full = true;
    permission.read = true;
    permission.update = true;
    permission.upload = true;
    permission.download = true;
    permission.allowUpdateStatus = '1';
    permission.full = roleType === 'O';
    permission.assign = roleType === 'O';
    permission.delete = roleType === 'O';
    permission.allowPermit = roleType === 'O';
    permission.isActive = true;
    dataPermission = !dataPermission ? [] : dataPermission;
    dataPermission.push(permission);
  }

  cbxEmpChange($event: any) {
    // if (evt?.data && !this.applyProcess) {
    //   this.objectID = evt.data;
    //   this.owner = evt?.data;
    //   this.data.owner = this.owner;
    //     this.codxCmService
    //       .getEmployeesByDomainID(this.objectID)
    //       .subscribe((user) => {
    //         if (user) {
    //           this.assignToSetting(user);
    //         }
    //       });

    //   this.detectorRef.detectChanges();
    // } else if(evt && this.applyProcess) {
    //   this.owner = evt;
    //   this.assignToProcess(this.owner);
    // }

    if ($event) {
      this.owner = $event;

      let ownerName = '';
      if (this.listParticipants.length > 0 && this.listParticipants) {
        ownerName = this.listParticipants.filter(
          (x) => x.userID === this.owner
        )[0]?.userName;
        this.employeeName = ownerName;

        this.employeeName &&
          this.searchOwner(
            '1',
            'O',
            '0',
            this.owner,
            ownerName,
            this.data?.permissions
          );
      }
    } else if ($event == null || $event == '') {
      this.deleteOwner('1', 'O', '0', 'owner', this.data);
    }
  }
  deleteOwner(
    objectType: any,
    roleType: any,
    memberType: any,
    field: any,
    data: any
  ) {
    if (data?.permissions && data?.permissions.length > 0) {
      let index = data?.permissions.findIndex(
        (x) =>
          x.objectType == objectType &&
          x.roleType === roleType &&
          x.memberType == memberType &&
          x.allowUpdateStatus == '1'
      );
      if (index != -1) {
        if (field === 'owner') {
          data.owner = null;
          this.owner = null;
          if (this.applyFor == '1') {
            data.salespersonID = null;
          }
        }
        data.permissions.splice(index, 1);
      }
    }
  }

  assignToSetting(user: any) {
    this.employeeName = user?.employeeName;
    // this.orgUnitName = user?.orgUnitName;
    // this.positionName = user?.positionName;
    // this.owner = user;
    // this.data.owner = this.owner;
  }
  deleteOrg() {
    // this.employeeName = null;
    // this.orgUnitName = null;
    // this.positionName = null;

    this.owner = null;
    this.data.owner = this.owner;
    if (!this.applyProcess) {
      (
        this.cbxOwner.ComponentCurrent as CodxComboboxComponent
      ).dataService.data = [];
      this.cbxOwner.crrValue = this.owner;
    }
    // if (this.cbxOwner) {
    //   (
    //     this.cbxOwner.ComponentCurrent as CodxComboboxComponent
    //   ).dataService.data = [];
    //   this.cbxOwner.crrValue = this.owner;
    // }

    this.form.formGroup.patchValue(this.data);
    //  this.disableViewTab(this.owner,'');
    this.detectorRef.detectChanges();
  }

  onSaveForm() {
    // if (!this.owner?.trim() && !this.owner && this.applyFor == '1') {
    //   this.notificationsService.notifyCode(
    //     'SYS009',
    //     0,
    //     '"' + this.gridViewSetup['Owner']?.headerText + '"'
    //   );
    //   return;
    // }
    if (this.isLockStep) return;
    this.saveOwner();
  }

  async saveOwner() {
    this.isLockStep = true;
    if (this.applyProcess) {
      let obj = new tmpInstances();
      obj.recID = this.data?.refID || this.data?.recID;
      obj.owner = this.owner;
      this.codxCmService.editInstance([obj]).subscribe((res) => {
        if (res) {
          this.updatePermssion(res);
          if (this.isCallInstance) {
            this.isCloseCM = false;
            this.dialogRef.close(res);
          }
        }
      });
    } else {
      this.data.owner = this.owner;
      this.saveDataCM();
    }
    //    }
  }
  updatePermssion(instance) {
    this.data.owner = instance?.owner;
    this.data.status = instance?.status;
    this.data.permissions = this.data.permissions.filter(
      (x) => x.memberType != '2'
    );
    this.addPermission(instance?.permissions, this.data);
    this.saveDataCM();
  }
  saveDataCM() {
    if (this.applyFor == '1') {
      this.codxCmService.editDeal([this.data]).subscribe((res) => {
        if (res) {
          this.isCloseCM && this.dialogRef.close(res);
        }
      });
    } else if (this.applyFor == '5') {
      this.codxCmService.editLead([this.data]).subscribe((res) => {
        if (res) {
          this.isCloseCM && this.dialogRef.close(res);
        }
      });
    } else if (this.applyFor == '4') {
      this.codxCmService.editContracts([this.data]).subscribe((res) => {
        if (res) {
          this.isCloseCM && this.dialogRef.close(res);
        }
      });
    }
    else if (this.applyFor == '2' || this.applyFor == '3') {
      this.codxCmService.editCases([this.data]).subscribe((res) => {
        if (res) {
          this.isCloseCM && this.dialogRef.close(res);
        }
      });
    }
  }
  addPermission(permissionDP, data) {
    if (permissionDP && permissionDP?.length > 0) {
      data.permissions = data?.permissions ? data.permissions : [];
      for (let item of permissionDP) {
        data.permissions.push(this.copyPermission(item));
      }
    }
  }
  copyPermission(permissionDP: any) {
    let permission = new CM_Permissions();
    permission.objectID = permissionDP.objectID;
    permission.objectName = permissionDP.objectName;
    permission.objectType = permissionDP.objectType;
    permission.roleType = permissionDP.roleType;
    // permission.full =  permissionDP.full;
    permission.read = permissionDP.read;
    permission.update = permissionDP.update;
    permission.assign = permissionDP.assign;
    permission.delete = permissionDP.delete;
    permission.upload = permissionDP.upload;
    permission.download = permissionDP.download;
    permission.isActive = permissionDP.isActive;
    permission.create = permissionDP.create;
    permission.memberType = '2'; // Data from DP
    permission.allowPermit = permissionDP.allowPermit;
    permission.allowUpdateStatus = permissionDP.allowUpdateStatus;
    permission.createdOn = new Date();
    permission.createdBy = this.user.userID;
    permission.isActive = true;
    return permission;
  }
  disableViewTab(owner: any, isViewTab: any) {
    if (!owner) {
      this.isViewBuild = false;
      this.isViewGroup = false;
      this.isViewUser = false;
      return;
    }
    this.isViewBuild = isViewTab === this.viewBUID;
    this.isViewGroup = isViewTab === this.viewGroupUser;
    this.isViewUser = isViewTab === this.viewDefault;
  }
}
