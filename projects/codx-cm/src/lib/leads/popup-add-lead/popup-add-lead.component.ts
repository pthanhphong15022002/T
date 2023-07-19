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
  UIComponent,
  DialogRef,
  FormModel,
  NotificationsService,
  AuthStore,
  DialogData,
  RequestOption,
  ImageViewerComponent,
  Util,
  CRUDService,
  CodxFormComponent,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Deals, CM_Leads } from '../../models/cm_model';
import { tmpInstances } from '../../models/tmpModel';
import { recordEdited } from '@syncfusion/ej2-pivotview';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-popup-add-lead',
  templateUrl: './popup-add-lead.component.html',
  styleUrls: ['./popup-add-lead.component.scss'],
})
export class PopupAddLeadComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  // view child
  @ViewChild('tabGeneralInfoDetail') tabGeneralInfoDetail: TemplateRef<any>;
  @ViewChild('tabGeneralSystemDetail') tabGeneralSystemDetail: TemplateRef<any>;
  @ViewChild('tabGeneralContactDetail')
  tabGeneralContactDetail: TemplateRef<any>;
  @ViewChild('tabCustomFieldDetail') tabCustomFieldDetail: TemplateRef<any>;
  @ViewChild('imageUploadLead') imageUploadLead: ImageViewerComponent;
  @ViewChild('imageUploadContact') imageUploadContact: ImageViewerComponent;
  @ViewChild('form') form: CodxFormComponent;
  // setting values in system
  dialog: DialogRef;
  //type any
  formModel: FormModel;

  // type string
  titleAction: string = '';
  action: string = '';
  autoName: string = '';
  title: string = '';
  linkAvatar: string;
  leadId: string = '';
  contactId: string = '';
  applyFor: string = '';
  oldIdInstance: string = '';

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
  listInstanceSteps: any[] = [];
  lstContact: any[] = [];
  lstContactDeletes: any[] = [];
  listIndustries: any[] = [];

  // const
  readonly actionAdd: string = 'add';
  readonly actionCopy: string = 'copy';
  readonly actionEdit: string = 'edit';
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000';
  readonly radioCategory: string = 'radioCategory';
  readonly fieldCbxParticipants = { text: 'userName', value: 'userID' };
  readonly radioCompany: string = 'company';
  readonly radioCustomer: string = 'customer';
  // Tab control
  menuGeneralInfo = {
    icon: 'icon-info',
    text: 'Thông tin chung',
    name: 'GeneralInfo',
    subName: 'General information',
    subText: 'General information',
  };
  menuGeneralSystem = {
    icon: 'icon-read_more',
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
  dateMessage: any;
  dateMax: any;
  customerIDOld: any;
  funcID: any;
  instanceSteps: any;
  addFieldsControl: any = '1';

  // model of DP
  instance: tmpInstances = new tmpInstances();

  // boolean
  isLoading: boolean = false;
  isCopyAvtLead: boolean = false;
  isCopyAvtContact: boolean = false;
  avatarChangeLead: boolean = false;
  avatarChangeContact: boolean = false;
  isCategory: boolean = true;

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
    this.lead.processID = dt?.data?.processId;
    this.applyFor = dt?.data?.applyFor;
    this.executeApiCalls();
    if (this.action !== this.actionAdd) {
      this.lead = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
      this.customerIDOld = this.lead?.customerID;
    }
    if (this.action === this.actionCopy) {
      this.leadId = dt?.data?.leadIdOld;
      this.contactId = dt?.data?.contactIdOld;
      this.oldIdInstance = this.lead.refID;
    } else {
      this.leadId = this.lead.recID;
      this.contactId = this.lead.contactID;
    }
  }

  onInit(): void {}

  valueChange($event) {
    if ($event && $event.data) {
      this.lead[$event.field] = $event.data;
      if ($event.field == 'currencyID') {
        this.loadExchangeRate();
      }
    }
  }
  loadExchangeRate() {
    let day = this.lead.createdOn ?? new Date();
    if(this.lead.currencyID) {
      this.codxCmService
      .getExchangeRate(this.lead.currencyID, day)
      .subscribe((res) => {
        let exchangeRateNew = res?.exchRate ?? 0;
        if (exchangeRateNew == 0) {
          this.notificationsService.notify(
            'Tỷ giá tiền tệ "' +
              this.lead.currencyID +
              '" chưa thiết lập xin hay chọn lại !',
            '3'
          );
          this.form.formGroup.patchValue(this.lead);
          return;
        }
        else {
          this.lead.exchangeRate = exchangeRateNew;
        }
      });
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

    this.convertDataInstance(this.lead, this.instance);
    this.updateDateDeal(this.instance, this.lead);

    this.promiseSaveFile();
  }
  cbxChange($event, field) {
    if ($event && $event.data) {
      this.lead[field] = $event;
    }
  }
  valueChangeOwner($event) {
    if ($event) {
      this.owner = $event;
      this.lead.owner = this.owner;
    }
  }
  valueChangeIndustries($event) {
    if ($event && $event.data) {
      this.listIndustries.push($event.data);
    }
  }
  valueChangeCategory($event,field) {
    if ($event) {
      let checked = $event.component.checked;
        if ($event.field === this.radioCompany && checked) {
          this.isCategory = true;
        } else if ($event.field === this.radioCustomer && checked) {
          this.isCategory = false;
        }
    }
    this.changeDetectorRef.detectChanges();
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
  convertDataInstance(lead: CM_Leads, instance: tmpInstances) {
    if (this.action === this.actionEdit) {
      instance.recID = this.lead.refID;
    }
    if (this.action !== this.actionEdit) {
      instance.startDate = null;
      instance.status = '1';
    }
    instance.title = lead.leadName;
    instance.memo = lead.memo;
    instance.endDate = lead.endDate;
    instance.instanceNo = lead.leadID;
    instance.owner = this.owner;
    instance.processID = lead.processID;
    instance.stepID = lead.stepID;
  }
  updateDateDeal(instance: tmpInstances, lead: CM_Leads) {
    if (this.action !== this.actionEdit) {
      lead.stepID = this.listInstanceSteps[0]?.stepID;
      lead.nextStep = this.listInstanceSteps[1]?.stepID;
      lead.status = this.owner? '1':'0';
      lead.refID = instance.recID;
      lead.startDate = null;
    }
    lead.owner = this.owner;
  }

  async promiseSaveFile() {
    try {
      if (this.avatarChangeLead) {
        await this.saveFileLead(this.leadId);
      }
      if (this.avatarChangeContact) {
        await this.saveFileContact(this.contactId);
      }

      if (this.isLoading) {
      } else {
        if (this.action !== this.actionEdit) {
          await this.insertInstance();
          await this.onAdd();
        } else {
          await this.editInstance();
          await this.onEdit();
        }
      }
    } catch (error) {
      if (this.action !== this.actionEdit) {
        this.onAdd();
      } else {
        this.onEdit();
      }
    }
  }

  async insertInstance() {
    var data = [this.instance, this.listInstanceSteps, this.oldIdInstance];
    this.codxCmService.addInstance(data).subscribe((instance) => {
      if (instance) {
        this.isLoading && this.dialog.close(instance);
      }
    });
  }
  async editInstance() {
    var data = [this.instance, this.listCustomFile];
    this.codxCmService.editInstance(data).subscribe((instance) => {
      if (instance) {
        this.isLoading && this.dialog.close(instance);
      }
    });
  }

  async saveFileLead(leadID) {
    this.imageUploadLead.updateFileDirectReload(leadID).subscribe((result) => {
      if (result) {
      }
    });
  }
  async saveFileContact(contactID) {
    this.imageUploadContact
      .updateFileDirectReload(contactID)
      .subscribe((result) => {
        if (result) {
        }
      });
  }

  beforeSave(option: RequestOption) {
    this.checkCopyAvatar();
    var data =
      this.action !== this.actionEdit
        ? [this.lead, this.leadId, this.contactId]
        : [this.lead];
    option.methodName =
      this.action !== this.actionEdit ? 'AddLeadAsync' : 'EditLeadAsync';
    option.className = 'LeadsBusiness';
    option.data = data;
    return true;
  }

  ngAfterViewInit(): void {
    this.tabInfo = [
      this.menuGeneralInfo,
      this.menuGeneralSystem,
      this.menuGeneralContact,
    ];
    this.tabContent = [
      this.tabGeneralInfoDetail,
      this.tabGeneralSystemDetail,
      this.tabGeneralContactDetail,
      this.tabCustomFieldDetail,
    ];
  }
  async executeApiCalls() {
    try {
      await this.getGridView(this.formModel);
      await this.getListInstanceSteps(this.lead.processID);
      // this.action != this.actionEdit && await this.getAutoNumber(this.formModel);
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


  async getListInstanceSteps(processId: any) {
    processId =
      this.action === this.actionCopy ? this.lead.processID : processId;
    var data = [processId, this.lead?.refID, this.action, '5'];
    this.codxCmService.getInstanceSteps(data).subscribe(async (res) => {
      if (res && res.length > 0) {
        var obj = {
          id: processId,
          steps: res[0],
          permissions: await this.getListPermission(res[1]),
          leadID: this.action !== this.actionEdit ? res[2] : this.lead.leadID,
        };
        var isExist = this.listMemorySteps.some((x) => x.id === processId);
        if (!isExist) {
          this.listMemorySteps.push(obj);
        }
        this.listInstanceSteps = res[0];
        this.removeItemInTab(this.ischeckFields(this.listInstanceSteps));
        this.listParticipants = obj.permissions;
        if (this.action === this.actionEdit) {
          this.owner = this.lead.owner;
        } else {
          this.lead.endDate = this.HandleEndDate(
            this.listInstanceSteps,
            this.action,
            null
          );
          this.lead.leadID = res[2];
        }
        this.dateMax = this.HandleEndDate(
          this.listInstanceSteps,
          this.action,
          this.action != this.actionEdit ? null : this.lead.createdOn
        );
        this.changeDetectorRef.detectChanges();
      }
    });
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

  async getListPermission(permissions) {
    this.listParticipants = permissions.filter((x) => x.roleType === 'P');
    return this.listParticipants != null && this.listParticipants.length > 0
      ? await this.codxCmService.getListUserByOrg(this.listParticipants)
      : this.listParticipants;
  }

  ischeckFields(steps: any): boolean {
    if (steps?.length > 0 && steps != null) {
      for (let i = 0; i < steps.length; i++) {
        if (steps[i]?.fields.length > 0 && steps[i].fields != null) {
          return true;
        }
      }
    }
    return false;
  }

  // covnert data CM -> data DP

  //#endregion

  isRequired(field: string) {
    return this.gridViewSetup[field]?.h;
  }

  setTitle(e: any) {
    this.title = this.titleAction;
    this.changeDetectorRef.detectChanges();
  }

  changeAvatarLead() {
    this.avatarChangeLead = true;

    if (this.action === this.actionCopy && !this.isCopyAvtLead) {
      this.lead.recID = Util.uid();
      this.leadId = this.lead.recID;

      this.isCopyAvtLead = true;
    }
  }
  changeAvatarContact() {
    this.avatarChangeContact = true;
    if (this.action === this.actionCopy && !this.isCopyAvtContact) {
      this.lead.contactID = Util.uid();
      this.contactId = this.lead.contactID;
      this.isCopyAvtContact = true;
    }
  }

  checkCopyAvatar() {
    if (this.isCopyAvtContact) {
      this.contactId = null;
    }
    if (this.isCopyAvtLead) {
      this.leadId = null;
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
  valueTagChange(e) {
    this.lead.tags = e.data;
  }
}
