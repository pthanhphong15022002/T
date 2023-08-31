import { Contact } from '../../../../../codx-sm/src/lib/models/Contact.model';
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
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Cases, CM_Deals } from '../../models/cm_model';
import { tmpInstances } from '../../models/tmpModel';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { ActivatedRoute } from '@angular/router';
import { Observable, firstValueFrom, map, tap } from 'rxjs';

@Component({
  selector: 'lib-popup-add-cases',
  templateUrl: './popup-add-cases.component.html',
  styleUrls: ['./popup-add-cases.component.scss'],
})
export class PopupAddCasesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  // view child
  @ViewChild('tabGeneralInfoDetail') tabGeneralInfoDetail: TemplateRef<any>;
  @ViewChild('tabCustomFieldDetail') tabCustomFieldDetail: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;

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

  // Data struct cases
  cases: CM_Cases = new CM_Cases();

  test: CM_Cases = new CM_Cases();

  // array is null
  tabInfo: any[] = [];
  tabContent: any[] = [];
  listCbxProcess: any[] = [];
  listCbxCampaigns: any[] = [];
  listCbxChannels: any[] = [];
  listMemorySteps: any[] = [];
  listMemoryContact: any[] = [];
  listCustomFile: any[] = [];
  listParticipants: any[] = [];
  listOrgs: any[] = [];

  listTypeCases: any[] = [];
  listCbxContacts: any[] = [];

  // const
  readonly actionAdd: string = 'add';
  readonly actionCopy: string = 'copy';
  readonly actionEdit: string = 'edit';
  readonly fieldCbxProcess = { text: 'processName', value: 'recID' };
  readonly fieldCbxCampaigns = { text: 'campaignName', value: 'recID' };
  readonly fieldCbxParticipants = { text: 'userName', value: 'userID' };
  readonly fieldCbxChannels = { text: 'channelName', value: 'recID' };

  readonly fieldCbxContacts = { text: 'contactName', value: 'recID' };
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
  dateMessage: any;
  dateMax: any;
  contactID: string = '';

  // model of DP
  instance: tmpInstances = new tmpInstances();
  instanceSteps: any;
  listInstanceSteps: any[] = [];
  caseType: string = '';
  applyFor: string = '';
  isHaveFile: boolean;
  showLabelAttachment: boolean;
  formModelCrr: FormModel = new FormModel();

  // load data form DP
  isLoading: boolean = false;
  processID: string = '';
  funcID = '';
  applyProcess = false;
  idxCrr: any = -1;

  constructor(
    private inject: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private codxCmService: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.formModel = dialog.formModel;
    this.titleAction = dt?.data?.titleAction;
    this.action = dt?.data?.action;
    this.applyFor = dt?.data?.applyFor;
    this.caseType = dt?.data?.caseType;
    this.isLoading = dt?.data?.isLoad;
    this.processID = dt?.data?.processID;
    this.funcID = dt?.data?.funcID;
    this.cases.status = '1';

    if (this.isLoading) {
      this.formModel = dt?.data?.formMD;
      this.caseType = this.applyFor == '2' ? '1' : '2';
      if (this.action != this.actionAdd) {
        this.cases = dt?.data?.dataCM;
      }
    } else {
      this.cases =
        this.action != this.actionAdd
          ? JSON.parse(JSON.stringify(dialog.dataService.dataSelected))
          : this.cases;
    }

    if (this.action != this.actionAdd) {
      this.processID = this.cases.processID;
      this.getListContacts(this.cases?.customerID);
    }
    this.cases.caseType = this.caseType;
    if (dt?.data.processID) {
      this.cases.processID = this.processID;
    }
    // this.executeApiCalls();
  }

  async onInit(): Promise<void> {
    await this.getCurrentSetting();
    // this.tabInfo = this.applyProcess
    //   ? [this.menuGeneralInfo, this.menuInputInfo]
    //   : [this.menuGeneralInfo];
  }
  ngAfterViewInit(): void {
    this.executeApiCalls();

    // this.tabInfo = this.applyProcess ? [this.menuGeneralInfo, this.menuInputInfo] : [this.menuGeneralInfo];
    // this.tabContent = [this.tabGeneralInfoDetail, this.tabCustomFieldDetail];
  }
  valueChange($event) {
    if ($event) {
      this.cases[$event.field] = $event.data;
    }
  }
  valueChangeDate($event) {
    if ($event) {
      this.cases[$event.field] = $event.data.fromDate;
    }
  }
  saveCases() {
    if (!this.cases?.processID && this.applyProcess) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ProcessID']?.headerText + '"'
      );
      return;
    }
    if (!this.cases?.caseName?.trim()) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CaseName']?.headerText + '"'
      );
      return;
    }
    if (!this.cases?.customerID) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CustomerID']?.headerText + '"'
      );
      return;
    }
    if (!this.cases?.owner && this.applyProcess) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Owner']?.headerText + '"'
      );
      return;
    }
    if (this.checkEndDayInstance(this.cases?.endDate, this.dateMax)) {
      this.notificationsService.notifyCode(
        'DP032',
        0,
        '"' + this.gridViewSetup['EndDate']?.headerText + '"',
        '"' + this.dateMessage + '"'
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
    if (this.applyProcess) {
      this.updateDataCases(this.instance, this.cases);
      this.convertDataInstance(this.cases, this.instance);
    }

    // if (this.action !== this.actionEdit) {
    //   this.insertInstance();
    // } else {
    //   this.editInstance();
    // }
    this.executeSaveData();
  }
  cbxChange($event, field) {
    if ($event) {
      this.cases[field] = $event;
    }
  }
  cbxProcessChange($event) {
    if ($event) {
      this.cases[$event.field] = $event.data;
      if ($event.data) {
        var result = this.checkProcessInList($event.data);
        if (result) {
          this.listInstanceSteps = result?.steps;
          this.listParticipants = result?.permissions;
          this.cases.caseNo = result?.caseId;
          this.cases.endDate = this.HandleEndDate(
            this.listInstanceSteps,
            this.action,
            null
          );
          this.changeDetectorRef.detectChanges();
        } else {
          this.getListInstanceSteps($event.data);
        }
      }
    }
  }
  valueChangeCustom(event) {
    //bo event.e vì nhan dc gia trị null
    if (event && event.data) {
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
    if ($event) {
      this.owner = $event;
      this.cases.owner = this.owner;
    }
  }
  valueChangeCustomer($event) {
    if ($event) {
      var result = this.checkContactInList($event.data);
      if (result) {
        this.listCbxContacts = result?.contacts;
        this.changeDetectorRef.detectChanges();
      } else {
        this.getListContacts($event.data);
      }
    }
  }
  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        this.attachment?.clearData();
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
    var data = this.cases;
    option.methodName =
      this.action !== this.actionEdit ? 'AddCasesAsync' : 'EditCasesAsync';
    option.className = 'CasesBusiness';
    option.data = data;
    return true;
  }

  async executeApiCalls() {
    await this.getGridView(this.formModel);
    if (this.action == 'add') {
      this.itemTabs(false);
      return;
    }

    if (this.processID) {
      await this.getListInstanceSteps(this.cases.processID);
    } else {
      this.itemTabs(false);
    }
  }

  async executeSaveData() {
    try {
      if (this.isLoading) {
        if (this.action !== this.actionEdit) {
          await this.addCasesForDP();
          this.applyProcess && (await this.insertInstance());
        } else {
          //    await this.editDealForDP();
          this.applyProcess && (await this.editInstance());
        }
      } else {
        if (this.action !== this.actionEdit) {
          this.applyProcess && (await this.insertInstance());
          await this.onAdd();
        } else {
          this.applyProcess && (await this.editInstance());
          await this.onEdit();
        }
      }
    } catch (error) {}
  }

  async addCasesForDP() {
    var datas = [this.cases];
    this.codxCmService.addCases(datas).subscribe((cases) => {
      if (cases) {
      }
    });
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
      this.action === this.actionCopy ? this.cases.processID : processId;
    var data = [processId, this.cases.refID, this.action, this.applyFor];
    this.codxCmService.getInstanceSteps(data).subscribe(async (res) => {
      if (res && res.length > 0) {
        var obj = {
          id: processId,
          steps: res[0],
          permissions: await this.getListPermission(res[1]),
          caseNO: this.action !== this.actionEdit ? this.cases.caseNo : res[2],
        };
        var isExist = this.listMemorySteps.some((x) => x.id === processId);
        if (!isExist) {
          this.listMemorySteps.push(obj);
        }
        this.listInstanceSteps = res[0];
        this.itemTabs(this.ischeckFields(this.listInstanceSteps));

        this.listParticipants = obj.permissions;
        if (this.action === this.actionEdit) {
          this.owner = this.cases.owner;
        } else {
          this.cases.endDate = this.HandleEndDate(
            this.listInstanceSteps,
            this.action,
            null
          );
          this.cases.caseNo = res[2];
        }
        this.dateMax = this.HandleEndDate(
          this.listInstanceSteps,
          this.action,
          this.action != this.actionEdit ? null : this.cases.createdOn
        );
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  async getListContacts(customerID: any) {
    customerID =
      this.action === this.actionCopy ? this.cases.customerID : customerID;
    var data = [customerID];
    this.codxCmService.getListContactByCustomerID(data).subscribe((res) => {
      if (res && res.length > 0) {
        var obj = {
          id: customerID,
          contacts: res[0],
        };
        var isExist = this.listMemoryContact.some((x) => x.id === customerID);
        if (!isExist) {
          this.listMemoryContact.push(obj);
        }
        this.listCbxContacts = res[0];
        if (this.action != this.actionAdd) {
          this.contactID = this.cases.contactID;
        }
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  insertInstance() {
    var data = [this.instance, this.listInstanceSteps, null];
    this.codxCmService.addInstance(data).subscribe((instance) => {
      if (instance) {
        this.isLoading && this.dialog.close(instance);
      }
    });
  }
  editInstance() {
    var data = [this.instance, this.listCustomFile];
    this.codxCmService.editInstance(data).subscribe((instance) => {
      if (instance) {
        ///this.onEdit();
        this.isLoading && this.dialog.close(instance);
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
  checkContactInList(customerID) {
    var result = this.listMemoryContact.filter((x) => x.id === customerID)[0];
    if (result) {
      return result;
    }
    return null;
  }

  // covnert data CM -> data DP

  convertDataInstance(cases: CM_Cases, instance: tmpInstances) {
    if (this.action === this.actionEdit) {
      instance.recID = cases.refID;
    }
    instance.title = cases.caseName;
    instance.memo = cases.memo;
    instance.endDate = cases.endDate;
    instance.instanceNo = cases.caseNo;
    instance.owner = this.owner;
    instance.processID = cases.processID;
    instance.stepID = cases.stepID;
  }
  updateDataCases(instance: tmpInstances, cases: CM_Cases) {
    if (this.action !== this.actionEdit) {
      cases.stepID = this.listInstanceSteps[0].stepID;
      cases.nextStep = this.listInstanceSteps[1].stepID;
      cases.status = '1';
      cases.refID = instance.recID;
    }
    if (this.action === this.actionAdd) {
      cases.caseType = this.caseType;
    }
    cases.owner = this.owner;
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

  // //#region  check RequiredDeal
  checkEndDayInstance(endDate, endDateCondition) {
    var date1 = new Date(endDate);
    var date2 = new Date(endDateCondition);
    this.dateMessage = new Date(date2).toLocaleDateString('en-AU');
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);

    return date1 < date2;
  }

  // //#endregion

  // isRequired(field:string){
  //   return this.gridViewSetup[field]?.h
  // }

  // setTitle(e: any) {
  //     // if (this.autoName) {
  //     //   this.title = this.titleAction + ' ' + this.autoName;
  //     // } else {
  //     //   this.title = this.titleAction + ' ' + e;
  //     //   this.autoName = e;
  //     // }
  //     this.title = this.titleAction;
  //   this.changeDetectorRef.detectChanges();
  // }

  // setTitle(e: any) {
  //     // if (this.autoName) {
  //     //   this.title = this.titleAction + ' ' + this.autoName;
  //     // } else {
  //     //   this.title = this.titleAction + ' ' + e;
  //     //   this.autoName = e;
  //     // }
  //     this.title = this.titleAction;
  //   this.changeDetectorRef.detectChanges();
  // }

  addFile(e) {
    this.attachment.uploadFile();
  }
  fileAdded(e) {}
  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }
  // onSave(){

  // }

  // async actionSaveBeforeSaveAttachment() {
  //   if (this.attachment?.fileUploadList?.length > 0) {
  //     (await this.attachment.saveFilesObservable()).subscribe((res) => {
  //       if (res) {
  //         var countAttack = 0;
  //         countAttack = Array.isArray(res) ? res.length : 1;
  //         this.cases.attachments =
  //           this.action === this.actionEdit
  //             ? this.cases.attachments + countAttack
  //             : countAttack;
  //    //     this.selectedAction();
  //       }
  //     });
  //   } else {
  //   //  this.selectedAction();
  //   }
  // }

  //#region setDefault
  async getCurrentSetting() {
    let res = await firstValueFrom(
      this.codxCmService.getParam('CMParameters', '1')
    );
    if (res?.dataValue) {
      let dataValue = JSON.parse(res?.dataValue);
      if (this.funcID == 'CM0401') {
        this.applyProcess = dataValue?.ProcessCase == '1';
        this.cases.applyProcess = this.applyProcess;
      } else if (this.funcID == 'CM0402') {
        this.applyProcess = dataValue?.ProcessRequest == '1';
        this.cases.applyProcess = this.applyProcess;
      }
    }
  }

  async getAutoNumber() {
    // kiểm tra có thiết lập tư động ko
    this.codxCmService
      .getFieldAutoNoDefault(
        this.dialog.formModel.funcID,
        this.dialog.formModel.entityName
      )
      .subscribe((res) => {
        if (res && !res.stop) {
          this.cache.message('AD019').subscribe((mes) => {
            if (mes) {
              // this.planceHolderAutoNumber = mes?.customName || mes?.description;
            }
          });
          this.getAutoNumberSetting();
        } else {
          // this.planceHolderAutoNumber = '';
          this.cases.caseNo = null;
          // this.disabledShowInput = false;
        }
      });
  }
  async getAutoNumberSetting() {
    // lấy mã tự động
    this.codxCmService
      .genAutoNumberDefault(
        this.dialog.formModel.funcID,
        this.dialog.formModel.entityName,
        'LeadID'
      )
      .subscribe((autoNum) => {
        // this.leadNoSetting = autoNum;
        this.cases.caseNo = autoNum;
        // this.disabledShowInput = true;
        // this.lead.leadID = this.leadNoSetting;
      });
  }

  // changeAutoNum(e) { // check trùm mã khi nhạp tay
  //   if (!this.disabledShowInput && e) {
  //     this.contracts.contractID = e?.crrValue;
  //     if (
  //       this.contracts.contractID &&
  //       this.contracts.contractID.includes(' ')
  //     ) {
  //       this.notiService.notifyCode(
  //         'CM026',
  //         0,
  //         '"' + this.grvSetup['ContractID'].headerText + '"'
  //       );
  //       return;
  //     }
  //     this.cmService
  //       .isExitsAutoCodeNumber('ContractsBusiness', this.contracts.contractID)
  //       .subscribe((res) => {
  //         this.isExitAutoNum = res;
  //         if (this.isExitAutoNum)
  //           this.notiService.notifyCode(
  //             'CM003',
  //             0,
  //             '"' + this.grvSetup['ContractID'].headerText + '"'
  //           );
  //       });
  //   }
  // }
  //#endregion

  // --------------------------lOad Tabs ----------------------- //
  itemTabs(check: boolean): void {
    if (check) {
      this.tabInfo = [this.menuGeneralInfo, this.menuInputInfo];
      this.tabContent = [this.tabGeneralInfoDetail, this.tabCustomFieldDetail];
    } else {
      this.tabInfo = [this.menuGeneralInfo];
      this.tabContent = [this.tabGeneralInfoDetail];
    }
  }
  ischeckFields(steps: any): boolean {
    if (steps?.length > 0) {
      if (this.action != 'edit') {
        if (steps[0].fields?.length > 0) return true;
        return false;
      }
      let check = false;
      this.idxCrr = steps.findIndex((x) => x.stepID == this.cases.stepID);
      if (this.idxCrr != -1) {
        for (let i = 0; i <= this.idxCrr; i++) {
          if (steps[i]?.fields?.length > 0) {
            check = true;
            break;
          }
        }
      }
      return check;
    }
    return false;
  }

  checkAddField(stepCrr, idx) {
    if (stepCrr) {
      if (this.action == 'edit' && this.idxCrr != -1 && this.idxCrr >= idx) {
        return true;
      }
      if (idx == 0) return true;
      return false;
    }
    return false;
  }
  //----------------------------end---------------------------//
}
