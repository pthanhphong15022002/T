import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, DialogRef, FormModel, NotificationsService, AuthStore, DialogData, RequestOption, ImageViewerComponent, Util, CRUDService } from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Deals, CM_Leads } from '../../models/cm_model';
import { tmpInstances } from '../../models/tmpModel';
import { recordEdited } from '@syncfusion/ej2-pivotview';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-popup-add-lead',
  templateUrl: './popup-add-lead.component.html',
  styleUrls: ['./popup-add-lead.component.scss']
})
export class PopupAddLeadComponent  extends UIComponent
implements OnInit, AfterViewInit
{
// view child
@ViewChild('tabGeneralInfoDetail') tabGeneralInfoDetail: TemplateRef<any>;
@ViewChild('tabGeneralSystemDetail') tabGeneralSystemDetail: TemplateRef<any>;
@ViewChild('tabGeneralContactDetail') tabGeneralContactDetail: TemplateRef<any>;
@ViewChild('imageUpload') imageUploadLead: ImageViewerComponent;
@ViewChild('imageUpload') imageUploadContact: ImageViewerComponent;
// setting values in system
dialog: DialogRef;
//type any
formModel: FormModel;
addFieldsControl: any = '1';
// type string
titleAction: string = '';
action: string = '';
autoName: string = '';
title: string = '';

// Data struct Opportunity
lead: CM_Leads = new CM_Leads();

// array is null
tabInfo: any[] = [];
tabContent: any[] = [];
listCbxProcess: any[] = [];
listCbxCampaigns: any[] = [];
listCbxChannels: any[] = [];
listMemorySteps: any[] = [];
listMemoryProcess: any[] = [];
listCustomFile: any[] = [];
listParticipants: any[] = [];
listOrgs: any[] = [];

// const
readonly actionAdd: string = 'add';
readonly actionCopy: string = 'copy';
readonly actionEdit: string = 'edit';
readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE

// Tab control
menuGeneralInfo = {
  icon: 'icon-info',
  text: 'Thông tin chung',
  name: 'GeneralInfo',
  subName: 'General information',
  subText: 'General information',
};
menuGeneralSystem = {
  icon: 'icon-info',
  text: 'Thông tin hệ thống',
  name: 'GeneralSystem',
  subName: 'General system',
  subText: 'General system',
};
menuGeneralContact = {
  icon: 'icon-contact_phone',
  text: 'Người liên hệ',
  name: 'GeneralContact',
  subName: 'General contact',
  subText: 'General contact',
};

//type any
gridViewSetup: any;
listProcess: any;
owner: any;
dateMessage:any;
dateMax:any;
customerIDOld: any;
funcID:any;
// model of DP
instance: tmpInstances = new tmpInstances();
instanceSteps: any;
listInstanceSteps: any[] = [];
avatarChangeLead: boolean = false;
avatarChangeContact: boolean = false;
lstContact:  any[] = [];
lstContactDeletes:  any[] = [];
linkAvatar: string;

constructor(
  private inject: Injector,
  private changeDetectorRef: ChangeDetectorRef,
  private notificationsService: NotificationsService,
  private authStore: AuthStore,
  private codxCmService: CodxCmService,
  @Optional() dt?: DialogData,
  @Optional() dialog?: DialogRef
) {
  super(inject);
  this.dialog = dialog;
  this.formModel = dialog.formModel;
  this.funcID = this.formModel?.funcID;
  this.titleAction = dt?.data?.titleAction;
  this.action = dt?.data?.action;
  this.executeApiCalls();
  if (this.action != this.actionAdd) {
    this.lead = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.customerIDOld = this.lead?.customerID;
  }
}

onInit(): void {
  if(this.action == this.actionAdd || this.action == this.actionCopy){
    this.lead.recID = Util.uid();
  }
}

valueChange($event) {
  if ($event) {
    this.lead[$event.field] = $event.data;
  }
}
valueChangeDate($event) {
  if ($event) {
    this.lead[$event.field] = $event.data.fromDate;
  }
}

saveLead() {

  if (!this.lead?.leadName?.trim()) {
    this.notificationsService.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['DealName']?.headerText + '"'
    );
    return;
  }
  if(this.action !== this.actionEdit) {
    this.onAdd();
  }
  else {
    this.onEdit();
  }


}
cbxChange($event, field) {
  if ($event) {
    this.lead[field] = $event;
  }
}
valueChangeOwner($event) {
  if ($event != null) {
    this.owner = $event;
    this.lead.owner = this.owner;
  }
}
onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res?.save[0] && res?.save) {
         this.dialog.close(res.save[0]);
          // if(this.changeAvatarLead){
          //   this.imageUploadLead
          //   .updateFileDirectReload(res.save[0].recID)
          //   .subscribe((result) => {
          //     if (result) {

          //         if(this.changeAvatarContact) {
          //         this.imageUploadContact
          //         .updateFileDirectReload(res.save[0].contactID)
          //         .subscribe((result) => {
          //           if (result) {
          //             this.dialog.close(res.save[0]);
          //           }
          //         });
          //       }
          //       else {
          //         this.dialog.close(res.save[0]);
          //       }
          //     }
          //   });
          // }
        }
      });

}
onEdit() {
    this.dialog.dataService
    .save((option: any) => this.beforeSave(option))
    .subscribe((res) => {
      if (res.update[0] && res.update) {
        (this.dialog.dataService as CRUDService)
        .update(res.update[0])
        .subscribe();
        this.dialog.close(res.update[0]);
      }
    });
}

async promiseSaveFile(leadID, contactID) {
  try {
    if(this.changeAvatarContact) {
      await this.saveFileContact(contactID);
    }
    if(this.changeAvatarLead){
      await  this.saveFileLead(leadID)
    }
  } catch (error) {

  }
}
async saveFileLead(leadID) {

}
async saveFileContact(contactID){
  this.imageUploadContact
  .updateFileDirectReload(contactID)
  .subscribe((result) => {
    if (result) {

    }
  });
}

beforeSave(option: RequestOption) {
  if(this.action !== this.actionEdit) {
    var data = [this.lead, this.lstContact, this.formModel.funcID, this.formModel.entityName];
  }
  else {
     var data = [this.lead, this.lstContact,this.lstContactDeletes,this.formModel.entityName];
  }

  option.methodName = this.action !== this.actionEdit ? 'AddLeadAsync' : 'EditLeadAsync';
  option.className = 'LeadsBusiness';
  option.data = data;
  return true;
}

ngAfterViewInit(): void {
  this.tabInfo = [this.menuGeneralInfo,this.menuGeneralSystem,this.menuGeneralContact];
  this.tabContent = [this.tabGeneralInfoDetail, this.tabGeneralSystemDetail, this.tabGeneralContactDetail];
}
async executeApiCalls() {
  try {
    await this.getGridView(this.formModel);
    this.action != this.actionEdit && await this.getAutoNumber(this.formModel);
  } catch (error) {
    console.error('Error executing API calls:', error);
  }
}
async getGridView(formModel) {
  this.cache
    .gridViewSetup(formModel.formName, formModel.gridViewName)
    .subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
}
async getAutoNumber(formModel){
  this.codxCmService
  .getAutonumber(
    formModel.funcID,
    formModel.entityName,'DealID'
  )
  .subscribe((leadID) => {

    if(leadID) {
      this.lead.leadID = leadID;
    }
  });
}

// covnert data CM -> data DP


//#endregion

isRequired(field:string){
  return this.gridViewSetup[field]?.h
}

setTitle(e: any) {
  this.title = this.titleAction;
  this.changeDetectorRef.detectChanges();
}

changeAvatarLead() {
  this.avatarChangeLead = true;
}
changeAvatarContact() {
  this.avatarChangeContact = true;
}
}

