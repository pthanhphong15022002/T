import { Component, Optional } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CodxDpService } from '../../codx-dp.service';
import { CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { DP_Instances_Steps_Roles } from '../../models/models';

@Component({
  selector: 'lib-popup-edit-ownerstep',
  templateUrl: './popup-edit-ownerstep.component.html',
  styleUrls: ['./popup-edit-ownerstep.component.css'],
})
export class PopupEditOwnerstepComponent {
  dialog: any;
  lstParticipants = [];
  titleAction = '';
  owner = '';
  data: any;
  step: any;
  gridViewInstanceStep: any;
  constructor(
    private codxDpService: CodxDpService,
    private cache: CacheService,
    private notificationsService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.lstParticipants = dt?.data[0];
    this.titleAction = dt?.data[1];
    this.data = dt?.data[2];
    this.getStepByStepIDAndInID(this.data?.recID, this.data?.stepID);
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getGrvInstanceStep();

  }

  getGrvInstanceStep() {
    this.cache
      .gridViewSetup(this.dialog.formModel.formName, this.dialog.formModel.gridViewName)
      .subscribe((res) => {
        if (res) {
          this.gridViewInstanceStep = res;
        }
      });
  }

  onSaveOwnerStep() {
    if(this.owner == null || this.owner.trim() == ''){
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewInstanceStep['Owner']?.headerText + '"'
      );
      return;
    }
    this.setRoles();
    this.step.owner = this.owner;
    this.codxDpService.updateOwnerStepAsync(this.step).subscribe(res =>{
      this.dialog.close(res);
    })
  }

  getStepByStepIDAndInID(insID, stepID) {
    this.codxDpService
      .getStepByStepIDAndInID(insID, stepID)
      .subscribe(async (res) => {
        if (res) {
          this.step = res;
          if(this.step.roles != null && this.step.roles.length > 0){
            var tmpOwner = this.step.roles.filter(x => x.roleType == "S" && x.objectType != "U" && x.objectType != "1");
            if(tmpOwner != null && tmpOwner.length > 0){
              this.owner = await this.getListUserByOrg(tmpOwner.map(x => x.objectID), tmpOwner[0].objectType);
            }else{
              this.owner = this.step?.owner;
            }
          }else{
            this.owner = '';
          }
        }
      });
  }


  setRoles() {
    var tmp = this.lstParticipants.find((x) => x.userID == this.owner);
    if (
      this.step.roles != null &&
      this.step.roles.length > 0
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
        var u = new DP_Instances_Steps_Roles();
        u['objectID'] = this.owner;
        u['objectName'] = tmp?.userName;
        u['objectType'] = 'U';
        u['roleType'] = 'S';
        this.step.roles.push(u);
      }
    } else {
      this.step.roles = [];
      var u = new DP_Instances_Steps_Roles();
      u['objectID'] = this.owner;
      u['objectName'] = tmp?.userName;
      u['objectType'] = 'U';
      u['roleType'] = 'S';
      this.step.roles.push(u);
    }
  }

  eventUser(e) {
    this.owner = e?.id;
  }

  async getListUserByOrg(lstRoles, objectType) {
    var owner = '';
    if (lstRoles != null && lstRoles.length > 0) {
      switch (objectType) {
        case 'O':
          var o = await firstValueFrom(
            this.codxDpService.getListUserByListOrgUnitIDAsync(lstRoles, 'O')
          );
          if (o != null && o.length > 0) {
            owner = o[0]?.userID;
          }
          break;
        case 'D':
          var d = await firstValueFrom(
            this.codxDpService.getListUserByListOrgUnitIDAsync(lstRoles, 'D')
          );
          if (d != null && d.length > 0) {
            owner = d[0]?.userID;
          }
          break;
        case 'P':
          var p = await firstValueFrom(
            this.codxDpService.getListUserByListOrgUnitIDAsync(lstRoles, 'P')
          );
          if (p != null && p.length > 0) {
            owner = d[0]?.userID;
          }
          break;
        case 'R':
          var r = await firstValueFrom(
            this.codxDpService.getListUserByRoleID(lstRoles)
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
