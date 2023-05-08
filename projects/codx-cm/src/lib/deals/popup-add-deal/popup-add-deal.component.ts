import { update } from '@syncfusion/ej2-angular-inplace-editor';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  DialogRef,
  DialogData,
  FormModel,
  CacheService,
  NotificationsService,
  AuthStore,
  UIComponent,
} from 'codx-core';
import { CM_Deals } from '../../models/cm_model';
import { CodxCmService } from '../../codx-cm.service';
import { tmpInstances } from '../../models/tmpModel';

@Component({
  selector: 'lib-popup-add-deal',
  templateUrl: './popup-add-deal.component.html',
  styleUrls: ['./popup-add-deal.component.scss'],
})
export class PopupAddDealComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  // view child
  @ViewChild('tabGeneralInfoDetail') tabGeneralInfoDetail: TemplateRef<any>;
  @ViewChild('tabCustomFieldDetail') tabCustomFieldDetail: TemplateRef<any>;

  // setting values in system
  dialog: DialogRef;
  //type any
  formModel: FormModel;
  addFieldsControl: any = '1';
  // type string
  titleAction: string = '';
  action: string = '';

  // Data struct Opportunity
  deal: CM_Deals = new CM_Deals();

  // array is null
  tabInfo: any[] = [];
  tabContent: any[] = [];
  listCbxProcess: any[] = [];
  listCbxCampaigns: any[] = [];
  listCbxCustomers: any[] = [];
  listCbxChannels: any[] = [];
  listMemorySteps: any[] = [];
  listCustomFile: any[] = [];
  lstParticipants:any[] = [];
  // const
  readonly actionAdd: string = 'add';
  readonly actionCopy: string = 'copy';
  readonly actionEdit: string = 'edit';
  readonly typeForDeal: string = '1';
  readonly fieldCbxProcess = { text: 'processName', value: 'recID' };
  readonly fieldCbxCampaigns = { text: 'campaignName', value: 'recID' };
  readonly fieldCbxCustomers = { text: 'customerName', value: 'recID' };
  readonly fieldCbxChannels = { text: 'channelName', value: 'recID' };
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE

  // Tab control
  menuGeneralInfo = {
    icon: 'icon-info',
    text: 'Thông tin chung',
    name: 'GeneralInfo',
    subName: 'General information',
    subText: 'General information',
  };

  menuInputInfo = {
    icon: 'icon-reorder',
    text: 'Thông tin nhập liệu',
    name: 'InputInfo',
    subName: 'Input information',
    subText: 'Input information',
  };

  //type any
  gridViewSetup: any;
  listProcess: any;
  owner:any;

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
    this.deal.status = '1';
  }

  onInit(): void {}

  valueChange($event) {
    if ($event) {
      this.deal[$event.field] = $event.data;
    }
  }
  eventUser(e) {
    if (e != null) {
      this.owner = e?.id; // thêm check null cái
      this.deal.owner = this.owner;
    }
  }

  saveOpportunity() {
    if (!this.deal?.processID) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ProcessID']?.headerText + '"'
      );
      return;
    }
    if (!this.deal?.dealName?.trim()) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['DealName']?.headerText + '"'
      );
      return;
    }
      var ischeck = true;
      var ischeckFormat = true;
      var title = '';
      var messageCheckFormat = '';

      for(let items of this.listInstanceSteps) {
        for (let item of items.fields) {
          if (
            item.isRequired &&
            (!item.dataValue || item.dataValue?.toString().trim() == '')
          ) {
            title = item.title;
            ischeck = false;
            break;
          }
          if (item) {
            messageCheckFormat = this.checkFormat(item);
            if (messageCheckFormat) {
              ischeckFormat = false;
              break;
            }
          }
        }
        if(!ischeck ||!ischeckFormat ) {
          break;
        }
      }
      if (!ischeck) {
        this.notificationsService.notifyCode('SYS009', 0, '"' + title + '"');
        return;
      }
      if (!ischeckFormat) {
        this.notificationsService.notifyCode(messageCheckFormat);
        return;
      }
    this.convertDataInstance(this.deal,this.instance);
    this.insertInstance();
    this.insertDeal();
   // this.onAdd();


  }
  cbxChange($event, field) {
    if ($event) {
      this.deal[field] = $event;
    }
  }
  cbxProcessChange($event, field) {
    if ($event) {
      this.deal[field] = $event;
      if ($event) {
        var result = this.checkProcessInList($event);
        if (result && result.length > 0) {
          this.listInstanceSteps = result;
        } else {
          this.getListInstanceSteps($event);
        }
      }
    }
  }
  valueChangeCustom(event) {
    if (event && event.e && event.data) {
      var result = event.e?.data;
      var field = event.data;
      switch (field.dataType) {
        case 'D':
          result = event.e?.data.fromDate;
          break;
        case 'P':
        case 'R':
        case 'A':
          result = event.e;
          break;
      }
      var index = this.listInstanceSteps.findIndex((x) => x.recID == field.stepID);
      if (index != -1) {
        if (this.listInstanceSteps[index].fields?.length > 0) {
          let idxField = this.listInstanceSteps[index].fields.findIndex(
            (x) => x.recID == event.data.recID
          );
          if (idxField != -1) {
            this.listInstanceSteps[index].fields[idxField].dataValue = result;
            let idxEdit = this.listCustomFile.findIndex(
              (x) => x.recID == this.listInstanceSteps[index].fields[idxField].recID
            );
            if (idxEdit != -1) {
              this.listCustomFile[idxEdit] =
                this.listInstanceSteps[index].fields[idxField];
            } else
              this.listCustomFile.push(this.listInstanceSteps[index].fields[idxField]);
          }
        }
      }
    }
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option),0)
      .subscribe((res) => {
        if (res) {
          this.dialog.close(res.save);
        } else this.dialog.close();
      });
  }
  beforeSave(op) {
    op.service = 'CM';
    op.entityName = 'CM_Deals';
    var data = this.deal;
    if (this.action == this.actionAdd || this.action == this.actionCopy) {
      op.method = 'AddDealAsync';
      op.className = 'DealsBusiness';
      op.data = data;
      return true;
    }
    return false;
  }

  ngAfterViewInit(): void {
    this.tabInfo = [this.menuGeneralInfo, this.menuInputInfo];
    this.tabContent = [this.tabGeneralInfoDetail, this.tabCustomFieldDetail];
  }
  async executeApiCalls() {
    try {
      await this.getGridView(this.formModel);
      await this.getListProcess(this.typeForDeal);
      await this.getListCampaigns();
      await this.getListCustomers();
      await this.getListChannels();
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
  async getListProcess(applyFor) {
    var data = [applyFor];
    this.codxCmService.getListCbxProcess(data).subscribe((res) => {
      if (res && res.length > 0) {
        this.listCbxProcess = res[0];
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  async getListCampaigns() {
    this.codxCmService.getListCbxCampaigns().subscribe((res) => {
      if (res && res.length > 0) {
        this.listCbxCampaigns = res[0];
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  async getListCustomers() {
    this.codxCmService.getListCustomer().subscribe((res) => {
      if (res && res.length > 0) {
        this.listCbxCustomers = res[0];
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  async getListChannels() {
    this.codxCmService.getListChannels().subscribe((res) => {
      if (res && res.length > 0) {
        this.listCbxChannels = res[0];
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  async getListInstanceSteps(processId: any) {
    this.codxCmService.getInstanceSteps(processId).subscribe((res) => {
      if (res && res.length > 0) {
        var obj = {
          id: processId,
          steps: res,
        };
        var isExist = this.listMemorySteps.some((x) => x.id === processId);
        if (!isExist) {
          this.listMemorySteps.push(obj);
        }
        this.listInstanceSteps = res;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

   insertInstance() {
    var data = [this.instance, this.listInstanceSteps,null];
    this.codxCmService.addInstance(data).subscribe((instance)=> {
      if(instance){
      }
    });
  }
  insertDeal() {
    this.updateDateDeal(this.instance,this.deal);
    //  this.onAdd();
    this.codxCmService.AddDeal(this.deal).subscribe((res) => {
      if (res) {
        this.deal = res;
        this.dialog.dataService.update(res).subscribe();
        this.dialog.close(res);
      }
    });
  }




  // check valid
  checkProcessInList(processId) {
    var result = this.listMemorySteps.filter((x) => x.id === processId)[0]
      ?.steps;
    if (result) {
      return result;
    }
    return null;
  }


  // covnert data CM -> data DP

  convertDataInstance(deal:CM_Deals, instance:tmpInstances){

    instance.title = deal.dealName;
    instance.memo = deal.memo;
    instance.endDate = deal.endDate;
    instance.instanceNo = deal.dealID;
    instance.owner = deal.owner;
    instance.processID = deal.processID;
    instance.stepID = deal.stepID;
  }
  updateDateDeal(instance:tmpInstances,deal:CM_Deals){
    deal.stepID = this.listInstanceSteps[0].stepID;
    deal.nextStep = this.listInstanceSteps[1].stepID;
    deal.status = "1";
    deal.refID = instance.recID;
  }
  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!field?.dataValue?.toLowerCase().match(validEmail) && field?.dataValue) {
          return 'SYS037';
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (!field?.dataValue?.toLowerCase().match(validPhone) && field?.dataValue) {
          return 'RS030';
        }
      }
    }
    return '';
  }

}
