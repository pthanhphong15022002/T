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
@ViewChild('imageUploadLead') imageUploadLead: ImageViewerComponent;
@ViewChild('imageUploadContact') imageUploadContact: ImageViewerComponent;
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
menuInputInfo = {
  icon: 'icon-reorder',
  text: 'Thông tin mở rộng',
  name: 'InputInfo',
  subName: 'Input information',
  subText: 'Input information',
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
leadId:string = '';
contactId:string = '';
isCopyAvtLead: boolean = false;
isCopyAvtContact: boolean = false;
listIndustries:any[]=[];

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
  this.lead.processID = '5d4ed88c-0e41-11ee-bec7-988d46c4cbe1';
  this.executeApiCalls();
  if (this.action !== this.actionAdd) {
    this.lead = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.customerIDOld = this.lead?.customerID;
  }
  if(this.action === this.actionCopy) {
    this.leadId = dt?.data?.leadIdOld;
    this.contactId =  dt?.data?.contactIdOld;
  }
  else {
    this.leadId = this.lead.recID;
    this.contactId =  this.lead.contactID;
  }
}

onInit(): void {
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
      '"' + this.gridViewSetup['LeadName']?.headerText + '"'
    );
    return;
  }

  this.promiseSaveFile();



}
cbxChange($event, field) {
  if ($event  && $event.data ) {
    this.lead[field] = $event;
  }
}
valueChangeOwner($event) {
  if ($event  && $event.data ) {
    this.owner = $event;
    this.lead.owner = this.owner;
  }
}
valueChangeIndustries($event){
  if ($event  && $event.data ) {
     this.listIndustries.push($event.data);
  }
}
onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res?.save[0] && res?.save) {

          this.dialog.close(res.save[0]);
         }
      });

}
onEdit() {
    this.dialog.dataService
    .save((option: any) => this.beforeSave(option))
    .subscribe((res) => {
      if (res?.update[0] && res?.update) {
        (this.dialog.dataService as CRUDService)
        .update(res.update[0])
        .subscribe();
        this.dialog.close(res.update[0]);
      }
    });
}

async promiseSaveFile() {
  try {
    if(this.avatarChangeLead){
      await  this.saveFileLead(this.leadId)
    }
    if(this.avatarChangeContact) {
      await this.saveFileContact(this.contactId);
    }
    if(this.action !== this.actionEdit) {
      this.onAdd();
    }
    else {
      this.onEdit();
    }

  } catch (error) {
    if(this.action !== this.actionEdit) {
      this.onAdd();
    }
    else {
      this.onEdit();
    }
  }
}
async saveFileLead(leadID) {
  this.imageUploadLead
  .updateFileDirectReload(leadID)
  .subscribe((result) => {
    if (result) {

    }
  });
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
  this.checkCopyAvatar();
  var data = this.action !== this.actionEdit? [this.lead,this.leadId, this.contactId] :[this.lead];
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

async getListInstanceSteps(processId: any){
//   processId =
//   this.action === this.actionCopy ? this.lead.processID : processId;
// var data = [processId, this.lead?.refID, this.action, '1'];
// this.codxCmService.getInstanceSteps(data).subscribe(async (res) => {
//   if (res && res.length > 0) {
//     var obj = {
//       id: processId,
//       steps: res[0],
//       permissions: await this.getListPermission(res[1]),
//       dealId: this.action !== this.actionEdit ? res[2] : this.lead.dealID,
//     };
//     var isExist = this.listMemorySteps.some((x) => x.id === processId);
//     if (!isExist) {
//       this.listMemorySteps.push(obj);
//     }
//     this.listInstanceSteps = res[0];
//     this.removeItemInTab(this.ischeckFields(this.listInstanceSteps));
//     this.listParticipants = obj.permissions;
//     if (this.action === this.actionEdit) {
//       this.owner = this.deal.owner;
//     } else {
//       this.deal.endDate = this.HandleEndDate(
//         this.listInstanceSteps,
//         this.action,
//         null
//       );
//       this.deal.dealID = res[2];
//     }
//     this.dateMax = this.HandleEndDate(
//       this.listInstanceSteps,
//       this.action,
//       this.action != this.actionEdit ? null : this.deal.createdOn
//     );
//     this.changeDetectorRef.detectChanges();
//   }
// });
}

removeItemInTab(isRemove: boolean): void {
  if (isRemove) {
    if (this.tabInfo.findIndex((x) => x == this.menuInputInfo) == -1) {
      this.tabInfo.push(this.menuInputInfo);
    }
  } else {
    if (this.tabInfo.findIndex((x) => x == this.menuInputInfo) != -1) {
      this.tabInfo.pop();
    }
  }
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

  if(this.action === this.actionCopy && !this.isCopyAvtLead) {
    this.lead.recID = Util.uid(); ;
    this.leadId = this.lead.recID;

    this.isCopyAvtLead = true;
  }
}
changeAvatarContact() {
  this.avatarChangeContact = true;

  if(this.action === this.actionCopy && !this.isCopyAvtContact) {
    this.lead.contactID = Util.uid();
    this.contactId = this.lead.contactID;
    this.isCopyAvtContact = true;
  }
}

checkCopyAvatar(){
  if(this.isCopyAvtContact) {
    this.contactId = null;
  }
  if(this.isCopyAvtLead) {
    this.leadId = null;
  }
}
}

