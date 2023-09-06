import { AfterViewInit, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, CacheService, DialogData, DialogRef, FormModel, NotificationsService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { firstValueFrom } from 'rxjs';
import { tmpInstancesStepsRoles } from '../../models/tmpModel';
import { CM_Permissions } from '../../models/cm_model';

@Component({
  selector: 'lib-popup-assgin-deal',
  templateUrl: './popup-assgin-deal.component.html',
  styleUrls: ['./popup-assgin-deal.component.scss']
})
export class PopupAssginDealComponent extends UIComponent
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

recID: any;
stepID: any;
refID: any;
processID: any;
owner: any;
ownerOld: any;
ownerStep: any;
step: any;
buid: any;
user:any;
groupUserID:any;
startControl: string = '';
applyFor: string = '';
orgUnitName: string = '';
positionName: string = '';

listParticipants = [];

listUser: any[] = [];
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
  if (this.applyProcess) {
    this.refID = dialogData?.data?.refID;
    (this.stepID = dialogData?.data?.stepID),
      (this.processID = dialogData?.data.processID);
  }
  this.recID = dialogData?.data?.recID;
  this.buid = dialogData?.data?.buid;
  this.applyFor = dialogData?.data.applyFor;
  this.owner = dialogData?.data?.owner;
  this.gridViewSetup = dialogData?.data.gridViewSetup;
  this.formModel = dialogData?.data.formModel;
  this.startControl = dialogData?.data.startControl;
  this.applyProcess && this.promiseAll();
}

ngAfterViewInit(): void {}

onInit(): void {}
loadTabView() {
  this.detectorRef.detectChanges();
}

click(event: any) {
  switch (event) {
  }
}
clickMenu(item) {
  this.detectorRef.detectChanges();
}
cancel() {
  this.dialogRef.close();
}
async promiseAll() {
  await this.getListPermission(this.processID, this.applyFor, this.stepID);
}
async getListPermission(processId, applyFor, stepID) {
  var data = [processId, applyFor, stepID];
  this.codxCmService.getListPermissionOwner(data).subscribe(async (res) => {
    if (res) {
      this.listParticipants = await this.getListPermissionInGroup(res[0]);
    }
  });
}
async getListPermissionInGroup(permissions) {
  return permissions != null && permissions.length > 0
    ? await this.codxCmService.getListUserByOrg(permissions)
    : permissions;
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
      this.buid = '';
    } else if (view === this.viewBUID) {
      this.buid = evt.data;
    //  var datas = [this.buid];
      // this.codxCmService.getListUserByBUID(datas).subscribe((res) => {
      //   if (res) {
      //     this.listUser = res;
      //   }
      // });
      this.owner = evt.component.itemsSelected[0].Owner;
    }

   //this.searchOwner('1', 'O', '0', this.owner, ownerName);
  }
}
searchOwner(objectType:any,roleType:any, memberType: any,owner:any, ownerName:any, dataPermission: any ){
  let index  = -1;
  if(dataPermission?.length > 0 && dataPermission) {
    index = dataPermission.findIndex(
      (x) => x.objectType == objectType && x.roleType === roleType&& x.memberType == memberType
    );
    if (index != -1 ) {
      dataPermission[index].objectID = owner;
      dataPermission[index].objectName = ownerName;
      dataPermission[index].modifiedBy = this.user.userID;
      dataPermission[index].modifiedOn = new Date();
    }
  }
  if(index == -1) {
    this.addOwner(owner,ownerName,roleType,objectType,dataPermission);
  }
}
addOwner(owner,ownerName,roleType,objectType,dataPermission) {
  var permission = new CM_Permissions();
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
  permission.full =  roleType === 'O';
  permission.assign =  roleType === 'O';
  permission.delete = roleType === 'O';
  permission.allowPermit = roleType === 'O';

  dataPermission.push(permission);
}

cbxEmpChange(evt: any) {
  if (evt?.data != null && evt?.data != '') {
    this.objectID = evt.data;
    this.owner = evt?.data;
    this.codxCmService
      .getEmployeesByDomainID(this.objectID)
      .subscribe((user) => {
        if (user) {
          this.assignTo(user);
        }
      });
    this.detectorRef.detectChanges();
  } else {
    this.owner = evt;
  }
}
assignTo(user: any) {
  this.employeeName = user?.employeeName;
  this.orgUnitName = user?.orgUnitName;
  this.positionName = user?.positionName;
}
deleteOrg($event) {
  if ($event) {
    let index = this.listUser.findIndex((x) => x.userID === $event);
    this.listUser.splice(index, 1);

    if (this.listUser.length < 0 && !this.listUser) {
      this.owner = '';
      this.buid = '';
    }
  }
}

onSaveForm() {
  if (!this.owner?.trim() && !this.owner && this.applyFor == '1') {
    this.notificationsService.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['Owner']?.headerText + '"'
    );
    return;
  }
  this.saveOwner();
}

saveOwner() {
  var datas = [this.recID, this.owner, this.startControl, this.buid];
  if (this.applyFor == '1') {
    this.codxCmService.updateOwnerDeal(datas).subscribe((res) => {
      if (res) {
        this.dialogRef.close(res[0]);
      }
    });
  } else if (this.applyFor == '5') {
    this.codxCmService.updateOwnerLead(datas).subscribe((res) => {
      if (res) {
        this.dialogRef.close(res[0]);
      }
    });
  }
}
}
