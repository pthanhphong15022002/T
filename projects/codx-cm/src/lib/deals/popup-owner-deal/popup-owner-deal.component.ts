import { Component, Input, Optional } from '@angular/core';
import { CodxCmService } from '../../codx-cm.service';
import { CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { firstValueFrom } from 'rxjs';
import { tmpInstancesStepsRoles } from '../../models/tmpModel';

@Component({
  selector: 'lib-popup-owner-deal',
  templateUrl: './popup-owner-deal.component.html',
  styleUrls: ['./popup-owner-deal.component.scss']
})
export class PopupOwnerDealComponent {
  dialog: any;
  listParticipants = [];
  formModel: any;
  gridViewSetup: any;
  gridViewInstanceStep: any;
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
  titleAction = '';
  readonly fieldCbxParticipants = { text: 'userName', value: 'userID' };

  constructor(
    private codxCmService: CodxCmService,
    private cache: CacheService,
    private notificationsService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.titleAction = dt?.data.titleAction;
    this.formModel = dt?.data.formModel;
    this.applyFor = dt?.data.applyFor;
    this.gridViewSetup = dt?.data.gridViewSetup;
    this.recID = dt?.data?.recID;
    this.refID = dt?.data?.refID;
    this.stepID =  dt?.data?.stepID,
    this.processID = dt?.data.processID;
    this.ownerOld = dt?.data?.owner;
    this.startControl=  dt?.data.startControl
    this.promiseAll();
  }

  ngOnInit(): void {

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
        this.owner = this.ownerOld;
      }
    })
  }
  async getListPermissionInGroup(permissions) {
    return permissions != null && permissions.length > 0
      ? await this.codxCmService.getListUserByOrg(permissions)
      : permissions;
  }

  onSaveOwner() {
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
    this.setRoles();
    var datas = [this.recID, this.owner,this.ownerStep, this.startControl];
    if(this.applyFor == "1"){
      this.codxCmService.updateOwnerDeal(datas).subscribe((res)=> {
        if(res) {
          this.dialog.close(res[0]);
        }
    })
    }
    else if (this.applyFor == "5") {
      this.codxCmService.updateOwnerLead(datas).subscribe((res)=> {
        if(res) {
          this.dialog.close(res[0]);
        }
    })
  }

  }
  valueChangeOwner($event){
    if($event) {
      this.owner = $event;
    }
  }
  valueChangeOwnerStep($event){
    if($event) {
      this.ownerStep = $event;
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





}
