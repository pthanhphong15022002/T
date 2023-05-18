import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, DialogRef, FormModel, NotificationsService, AuthStore, DialogData, RequestOption } from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Deals, CM_Leads } from '../../models/cm_model';
import { tmpInstances } from '../../models/tmpModel';

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
@ViewChild('tabGeneralAddressDetail') tabGeneralAddressDetail: TemplateRef<any>;
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
  icon: 'icon-info',
  text: 'Người liên hệ',
  name: 'GeneralContact',
  subName: 'General contact',
  subText: 'General contact',
};
menuGeneralAddress = {
  icon: 'icon-info',
  text: 'Danh sách địa chỉ',
  name: 'GeneralAddress',
  subName: 'General address',
  subText: 'General address',
};

//type any
gridViewSetup: any;
listProcess: any;
owner: any;
dateMessage:any;
dateMax:any;
customerIDOld: any;
// model of DP
instance: tmpInstances = new tmpInstances();
instanceSteps: any;
listInstanceSteps: any[] = [];

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
  this.titleAction = dt?.data?.titleAction;
  this.action = dt?.data?.action;
  this.executeApiCalls();
  if (this.action != this.actionAdd) {
    this.lead = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.customerIDOld = this.lead?.customerID;
  }
}

onInit(): void {}

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

saveOpportunity() {

  if (!this.lead?.leadName?.trim()) {
    this.notificationsService.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['DealName']?.headerText + '"'
    );
    return;
  }
  if (!this.lead?.customerID) {
    this.notificationsService.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['CustomerID']?.headerText + '"'
    );
    return;
  }
  if(!this.lead?.owner){
    this.notificationsService.notifyCode(
      'SYS009',
      0,
      '"' + this.gridViewSetup['Owner']?.headerText + '"'
    );
    return;
  }
  var ischeck = true;
  var ischeckFormat = true;
  var title = '';
  var messageCheckFormat = '';

  if (!ischeck) {
    this.notificationsService.notifyCode('SYS009', 0, '"' + title + '"');
    return;
  }
  if (!ischeckFormat) {
    this.notificationsService.notifyCode(messageCheckFormat);
    return;
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
      if (res) {
        this.dialog.close(res.save[0]);
      } else this.dialog.close();
    });
}
onEdit() {
  this.dialog.dataService
    .save((option: any) => this.beforeSave(option))
    .subscribe((res) => {
      if (res.update) {
        this.dialog.close(res.update[0]);
      }
    });
}
beforeSave(option: RequestOption) {
  var data = this.lead;
  option.methodName =
    this.action !== this.actionEdit ? 'AddDealAsync' : 'EditDealAsync';
  option.className = 'DealsBusiness';
  option.data = this.action != this.actionEdit ? data : [data, this.customerIDOld];
  return true;
}

ngAfterViewInit(): void {
  this.tabInfo = [this.menuGeneralInfo,this.menuGeneralSystem,this.menuGeneralContact,this.menuGeneralAddress];
  this.tabContent = [this.tabGeneralInfoDetail, this.tabGeneralSystemDetail, this.tabGeneralContactDetail, this.tabGeneralAddressDetail];
}
async executeApiCalls() {
  try {
    await this.getGridView(this.formModel);
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

// Đợi chị khanh thiết lập xong
// async getListChannels() {
//   this.codxCmService.getListChannels().subscribe((res) => {
//     if (res && res.length > 0) {
//       this.listCbxChannels = res[0];
//       this.changeDetectorRef.detectChanges();
//     }
//   });
// }



// covnert data CM -> data DP


//#endregion

isRequired(field:string){
  return this.gridViewSetup[field]?.h
}

setTitle(e: any) {
    // if (this.autoName) {
    //   this.title = this.titleAction + ' ' + this.autoName;
    // } else {
    //   this.title = this.titleAction + ' ' + e;
    //   this.autoName = e;
    // }
    this.title = this.titleAction;
  this.changeDetectorRef.detectChanges();
}

changeAvatar(){

}
lstAddressEmit($event) {}
lstAddressDeleteEmit($event) {}


lstContactDeleteEmit($event){}
lstContactEmit($event){}
}

