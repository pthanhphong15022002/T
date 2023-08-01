import { AfterViewInit, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, CacheService, DialogData, DialogRef, FormModel, NotificationsService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { firstValueFrom } from 'rxjs';
import { tmpInstancesStepsRoles } from '../../models/tmpModel';

@Component({
  selector: 'lib-popup-assgin-deal',
  templateUrl: './popup-assgin-deal.component.html',
  styleUrls: ['./popup-assgin-deal.component.scss']
})
export class PopupAssginDealComponent extends UIComponent
implements AfterViewInit
{
dialogRef: DialogRef;
formModel:FormModel
title = '';
employee:any;
activeTab: string;
subHeaderText:string = '';

objectID:string = '';
employeeName: any;
gridViewSetup: any;
applyProcess: boolean = false;

recID:any;
stepID:any;
refID:any;
processID:any;
owner:any;
ownerOld:any;
ownerStep:any;
step:any;
startControl:string = '';
applyFor: string = '';
orgUnitName: string = '';
positionName: string = '';

listParticipants = [];

readonly fieldCbxParticipants = { text: 'userName', value: 'userID' };
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
  this.title = dialogData?.data.titleAction;
  this.applyProcess = dialogData?.data.applyProcess;
  if(this.applyProcess) {
    this.applyFor = dialogData?.data.applyFor;
    this.recID = dialogData?.data?.recID;
    this.refID = dialogData?.data?.refID;
    this.stepID =  dialogData?.data?.stepID,
    this.processID = dialogData?.data.processID;
  }
  this.owner = dialogData?.data?.owner;
  this.gridViewSetup = dialogData?.data.gridViewSetup;
  this.formModel = dialogData?.data.formModel;
  this.startControl=  dialogData?.data.startControl
  this.subHeaderText = 'Công tác quản lý các mảng Dịch vụ hạ tầng, Dịch vụ tiện tích, Dịch vụ Điện nước';
  this.applyProcess && this.promiseAll();
}

ngAfterViewInit(): void {
}

onInit(): void {

}
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
async promiseAll(){
  await this.getListPermission(this.processID,this.applyFor,this.stepID);
  await this.getStepByStepIDAndInID(this.refID, this.stepID);
}
async getListPermission(processId, applyFor,stepID) {
var data = [processId,applyFor,stepID]
  this.codxCmService.getListPermissionOwner(data).subscribe(async res =>{
    if(res){
      this.listParticipants = await this.getListPermissionInGroup(res[0]);
    }
  })
}
async getListPermissionInGroup(permissions) {
  return permissions != null && permissions.length > 0
    ? await this.codxCmService.getListUserByOrg(permissions)
    : permissions;
}

getStepByStepIDAndInID(insID, stepID) {
  this.codxCmService
    .getStepByStepIDAndInID(insID, stepID)
    .subscribe(async (res) => {
      if (res) {
        this.step = res;
        if(this.step.roles != null && this.step.roles.length > 0){
          var tmpOwner = this.step.roles.filter(x => x.roleType == "S" && x.objectType != "U" && x.objectType != "1");
          if(tmpOwner != null && tmpOwner.length > 0){
            this.ownerStep = await this.getListUserByOrg(tmpOwner.map(x => x.objectID), tmpOwner[0].objectType);
          }else{
            this.ownerStep = this.step?.owner;
          }
        }else{
          this.ownerStep = '';
        }
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

changeOwner(evt: any) {
  if (evt?.data) {
   this.owner = evt.data;
  }
}

cbxEmpChange(evt: any) {
  if (evt?.data != null && evt?.data != '') {
    this.objectID = evt.data;
    this.owner= evt?.data;
    this.codxCmService.getEmployeesByDomainID(this.objectID).subscribe((user) => {
        if (user) {
         this.assignTo(user);
        }
      });
    this.detectorRef.detectChanges();
  }
  else {
    this.owner = evt;
  }
}
assignTo(user:any){
  this.employeeName = user?.employeeName;
  this.orgUnitName = user?.orgUnitName;
  this.positionName = user?.positionName;
}
deleteOrg() {
  this.employeeName ='';
  this.orgUnitName ='';
  this.positionName ='';
  this.objectID ='';
  this.detectorRef.detectChanges();
}



onSaveForm() {
  if(!this.owner?.trim() && !this.owner) {
    this.notificationsService.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['Owner']?.headerText + '"'
    );
    return;
  }
  this.saveOwner();
}

saveOwner(){
 this.applyProcess && this.setRoles();
  var datas = [this.recID, this.owner,this.ownerStep, this.startControl];
  if(this.applyFor == "1"){
    this.codxCmService.updateOwnerDeal(datas).subscribe((res)=> {
      if(res) {
        this.dialogRef.close(res[0]);
      }
  })
  }
  else if (this.applyFor == "5") {
    this.codxCmService.updateOwnerLead(datas).subscribe((res)=> {
      if(res) {
        this.dialogRef.close(res[0]);
      }
  })
}

}
setRoles() {
  var tmp = this.listParticipants.find((x) => x.userID == this.owner);
  if (
    this.step?.roles != null &&
    this.step?.roles?.length > 0
  ) {
    var index = this.step.roles.findIndex(
      (x) => x.roleType == 'S'
    );
    if (index != -1) {
      if (this.step.roles[index].objectID != this.owner) {
        this.step.roles[index].objectID = this.owner;
        this.step.roles[index].objectName = tmp?.userName;
        this.step.roles[index].objectType = 'U';
      }
    } else {
      var u = new tmpInstancesStepsRoles();
      u['objectID'] = this.owner;
      u['objectName'] = tmp?.userName;
      u['objectType'] = 'U';
      u['roleType'] = 'S';
      this.step.roles.push(u);
    }
  } else {
    this.step.roles = [];
    var u = new tmpInstancesStepsRoles();
    u['objectID'] = this.owner;
    u['objectName'] = tmp?.userName;
    u['objectType'] = 'U';
    u['roleType'] = 'S';
    this.step.roles.push(u);
  }
}




}
