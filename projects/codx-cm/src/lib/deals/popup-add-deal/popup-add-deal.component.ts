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
  RequestOption,
} from 'codx-core';
import { CM_Deals } from '../../models/cm_model';
import { CodxCmService } from '../../codx-cm.service';
import { tmpInstances } from '../../models/tmpModel';
import { debug } from 'console';

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
  readonly typeForDeal: string = '1';
  readonly fieldCbxProcess = { text: 'processName', value: 'recID' };
  readonly fieldCbxCampaigns = { text: 'campaignName', value: 'recID' };
  readonly fieldCbxParticipants = { text: 'userName', value: 'userID' };
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
  owner: any;
  dateMessage:any;
  dateMax:any;

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
    if (this.action != this.actionAdd) {
      this.deal = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    }
  }

  onInit(): void {}

  valueChange($event) {
    if ($event) {
      this.deal[$event.field] = $event.data;
    }
  }
  valueChangeDate($event) {
    if ($event) {
      this.deal[$event.field] = $event.data.fromDate;
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
    if (!this.deal?.customerID) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CustomerID']?.headerText + '"'
      );
      return;
    }
    if (!this.deal?.category) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Category']?.headerText + '"'
      );
      return;
    }
    if(!this.deal?.owner){
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Owner']?.headerText + '"'
      );
      return;
    }
    if (this.checkEndDayInstance(this.deal?.endDate, this.dateMax)) {
      this.notificationsService.notifyCode(
        'DP032',
        0,
        '"' + this.gridViewSetup['EndDate']?.headerText + '"', '"' + this.dateMessage + '"'
      );
      return;
    }
    var ischeck = true;
    var ischeckFormat = true;
    var title = '';
    var messageCheckFormat = '';

    for (let items of this.listInstanceSteps) {
      for (let item of items.fields) {
        if (item) {
          messageCheckFormat = this.checkFormat(item);
          if (messageCheckFormat) {
            ischeckFormat = false;
            break;
          }
        }
      }
      if (!ischeck || !ischeckFormat) {
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
    this.convertDataInstance(this.deal, this.instance);
    this.updateDateDeal(this.instance, this.deal);
    if (this.action !== this.actionEdit) {
      this.insertInstance();
      this.onAdd();
    } else {
      this.editInstance();
      this.onEdit();
    }
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
        if (result) {
          this.listInstanceSteps = result?.steps;
          this.listParticipants = result?.permissions;
          this.deal.dealID = result?.dealId;
          this.deal.endDate =this.HandleEndDate(this.listInstanceSteps, this.action, null);
          this.changeDetectorRef.detectChanges();
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
      var index = this.listInstanceSteps.findIndex(
        (x) => x.recID == field.stepID
      );
      if (index != -1) {
        if (this.listInstanceSteps[index].fields?.length > 0) {
          let idxField = this.listInstanceSteps[index].fields.findIndex(
            (x) => x.recID == event.data.recID
          );
          if (idxField != -1) {
            this.listInstanceSteps[index].fields[idxField].dataValue = result;
            let idxEdit = this.listCustomFile.findIndex(
              (x) =>
                x.recID == this.listInstanceSteps[index].fields[idxField].recID
            );
            if (idxEdit != -1) {
              this.listCustomFile[idxEdit] =
                this.listInstanceSteps[index].fields[idxField];
            } else
              this.listCustomFile.push(
                this.listInstanceSteps[index].fields[idxField]
              );
          }
        }
      }
    }
  }
  valueChangeOwner($event) {
    if ($event != null) {
      this.owner = $event;
      this.deal.owner = this.owner;
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
    var data = this.deal;
    option.methodName =
      this.action !== this.actionEdit ? 'AddDealAsync' : 'EditDealAsync';
    option.className = 'DealsBusiness';
    option.data = data;
    return true;
  }

  ngAfterViewInit(): void {
    this.tabInfo = [this.menuGeneralInfo, this.menuInputInfo];
    this.tabContent = [this.tabGeneralInfoDetail, this.tabCustomFieldDetail];
  }
  async executeApiCalls() {
    try {
      await this.getGridView(this.formModel);
      await this.getListProcess(this.typeForDeal);
      // await this.getListCampaigns();
      // await this.getListChannels();
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
          console.table(res);
        }
      });
  }
  async getListProcess(applyFor) {
    var processID = this.action !== this.actionEdit ? '' : this.deal.processID;
    var data = [applyFor, processID];
    this.codxCmService.getListCbxProcess(data).subscribe((res) => {
      if (res && res.length > 0) {
        this.listCbxProcess = res[0];
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  // Đợi chị khanh thiết lập xong
  // async getListCampaigns() {
  //   this.codxCmService.getListCbxCampaigns().subscribe((res) => {
  //     if (res && res.length > 0) {
  //       this.listCbxCampaigns = res[0];
  //       this.changeDetectorRef.detectChanges();
  //     }
  //   });
  // }
  // async getListChannels() {
  //   this.codxCmService.getListChannels().subscribe((res) => {
  //     if (res && res.length > 0) {
  //       this.listCbxChannels = res[0];
  //       this.changeDetectorRef.detectChanges();
  //     }
  //   });
  // }

  async getListInstanceSteps(processId: any) {
    processId =
      this.action === this.actionCopy ? this.deal.processID : processId;
    var data = [processId, this.deal.refID, this.action];
    this.codxCmService.getInstanceSteps(data).subscribe(async (res) => {
      if (res && res.length > 0) {
        var obj = {
          id: processId,
          steps: res[0],
          permissions: await this.getListPermission(res[1]),
          dealId: this.action !== this.actionEdit ? this.deal.dealID : res[2],
        };
        var isExist = this.listMemorySteps.some((x) => x.id === processId);
        if (!isExist) {
          this.listMemorySteps.push(obj);
        }
        this.listInstanceSteps = res[0];
        this.listParticipants = obj.permissions;
        if (this.action === this.actionEdit) {
          this.owner = this.deal.owner;
        } else {
          this.deal.endDate = this.HandleEndDate(
            this.listInstanceSteps,
            this.action,
            null
          );
          this.deal.dealID = res[2];
        }
        this.dateMax = this.HandleEndDate(this.listInstanceSteps, this.action, this.action != this.actionEdit ? null: this.deal.createdOn );
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  insertInstance() {
    var data = [this.instance, this.listInstanceSteps, null];
    this.codxCmService.addInstance(data).subscribe((instance) => {
      if (instance) {
      }
    });
  }
  editInstance() {
    var data = [this.instance, this.listCustomFile];
    this.codxCmService.editInstance(data).subscribe((instance) => {
      if (instance) {
      }
    });
  }

  // check valid
  checkProcessInList(processId) {
    var result = this.listMemorySteps.filter((x) => x.id === processId)[0];
    if (result) {
      return result;
    }
    return null;
  }

  // covnert data CM -> data DP

  convertDataInstance(deal: CM_Deals, instance: tmpInstances) {
    if (this.action === this.actionEdit) {
      instance.recID = this.deal.refID;
    }
    instance.title = deal.dealName;
    instance.memo = deal.memo;
    instance.endDate = deal.endDate;
    instance.instanceNo = deal.dealID;
    instance.owner = this.owner;
    instance.processID = deal.processID;
    instance.stepID = deal.stepID;
  }
  updateDateDeal(instance: tmpInstances, deal: CM_Deals) {
    if (this.action !== this.actionEdit) {
      deal.stepID = this.listInstanceSteps[0].stepID;
      deal.nextStep = this.listInstanceSteps[1].stepID;
      deal.status = '1';
      deal.refID = instance.recID;
    }
    deal.owner = this.owner;
  }
  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (
          !field?.dataValue?.toLowerCase().match(validEmail) &&
          field?.dataValue
        ) {
          return 'SYS037';
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (
          !field?.dataValue?.toLowerCase().match(validPhone) &&
          field?.dataValue
        ) {
          return 'RS030';
        }
      }
    }
    return '';
  }

  HandleEndDate(listSteps: any, action: string, endDateValue: any) {
    var dateNow =
      action == 'add' || action == 'copy' ? new Date() : new Date(endDateValue);
    var endDate =
      action == 'add' || action == 'copy' ? new Date() : new Date(endDateValue);
    for (let i = 0; i < listSteps.length; i++) {
      endDate.setDate(endDate.getDate() + listSteps[i].durationDay);
      endDate.setHours(endDate.getHours() + listSteps[i].durationHour);
      endDate = this.setTimeHoliday(
        dateNow,
        endDate,
        listSteps[i]?.excludeDayoff
      );
      dateNow = endDate;
    }
    return endDate;
  }
  setTimeHoliday(startDay: Date, endDay: Date, dayOff: string) {
    if (!dayOff || (dayOff && (dayOff.includes('7') || dayOff.includes('8')))) {
      const isSaturday = dayOff.includes('7');
      const isSunday = dayOff.includes('8');
      let day = 0;

      for (
        let currentDate = new Date(startDay);
        currentDate <= endDay;
        currentDate.setDate(currentDate.getDate() + 1)
      ) {
        day += currentDate.getDay() === 6 && isSaturday ? 1 : 0;
        day += currentDate.getDay() === 0 && isSunday ? 1 : 0;
      }
      endDay.setDate(endDay.getDate() + day);

      if (endDay.getDay() === 6 && isSaturday) {
        endDay.setDate(endDay.getDate() + 1);
      }

      if (endDay.getDay() === 0 && isSunday) {
        endDay.setDate(endDay.getDate() + (isSaturday ? 1 : 0));
      }
    }
    return endDay;
  }

  async getListPermission(permissions) {
    this.listParticipants = permissions.filter((x) => x.roleType === 'P');
    return this.listParticipants != null && this.listParticipants.length > 0
      ? await this.codxCmService.getListUserByOrg(this.listParticipants)
      : this.listParticipants;
  }

  //#region  check RequiredDeal
  checkEndDayInstance(endDate, endDateCondition) {
    var date1 = new Date(endDate);
    var date2 = new Date(endDateCondition);
    this.dateMessage = new Date(date2).toLocaleDateString('en-AU');
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);

    return date1 < date2;
  }

  //#endregion

  isRequired(field:string){
    return this.gridViewSetup[field]?.h
  }

}
