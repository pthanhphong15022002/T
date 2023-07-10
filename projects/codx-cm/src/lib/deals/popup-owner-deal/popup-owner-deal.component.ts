import { Component, Input, Optional } from '@angular/core';
import { CodxCmService } from '../../codx-cm.service';
import { CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';

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
  titleAction = '';
  gridViewInstanceStep: any;
  applyFor: string = '';
  recID:any;
  stepID:any;
  processID:any;
  owner:any;
  ownerOld:any;
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
    this.stepID =  dt?.data?.stepID,
    this.processID = dt?.data.processID;
    this.ownerOld = dt?.data?.owner;
    this.promiseAll();
  }

  ngOnInit(): void {

  }

  async promiseAll(){
    await this.getListPermission(this.processID,this.applyFor,this.stepID);
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
    var data = [this.recID, this.owner];
    this.codxCmService.updateOwnerLead(data).subscribe((res)=> {
        if(res) {
          this.dialog.close(res[0]);
        }
    })
  }

  valueChangeOwner($event){
    if($event) {
      this.owner = $event;
    }
  }
}
