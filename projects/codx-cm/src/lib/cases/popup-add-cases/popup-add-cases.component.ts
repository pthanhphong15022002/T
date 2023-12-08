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
import { CM_Cases, CM_Deals, CM_Permissions } from '../../models/cm_model';
import { tmpInstances } from '../../models/tmpModel';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
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
  placeHolderAutoNumber: any = '';
  // type string
  titleAction: string = '';
  action: string = '';
  autoName: string = '';
  title: string = '';

  // Data struct cases
  cases: CM_Cases = new CM_Cases();

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
  listFields:any[]=[];

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
  user: any;
  instanceRes: any;

  contactID: string = '';
  oldIdInstance: string = '';

  // model of DP
  instance: tmpInstances = new tmpInstances();
  instanceSteps: any;
  listInstanceSteps: any[] = [];
  caseType: string = '';
  applyFor: string = '';
  disabledShowInput: boolean = true;
  isExist: boolean = false;
  isHaveFile: boolean;
  showLabelAttachment: boolean;
  formModelCrr: FormModel = new FormModel();

  // load data form DP
  isLoading: boolean = false;
  processID: string = '';
  applyProcess = false;
  isBlock: boolean = true;
  caseNoSetting: any;
  idxCrr: any = -1;

  constructor(
    private inject: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private codxCmService: CodxCmService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.formModel = dialog.formModel;
    this.titleAction = dt?.data?.titleAction;
    this.action = dt?.data?.action;
    this.applyFor = dt?.data?.applyFor;
    // this.caseType = dt?.data?.caseType;
    this.isLoading = dt?.data?.isLoad;
    this.processID = dt?.data?.processID;
    this.funcID = dt?.data?.funcID;
    this.cases.status = '1';

    if (this.isLoading) {
      this.formModel = dt?.data?.formMD;
      // this.caseType = this.applyFor == '2' ? '1' : '2';
      if (this.action != this.actionAdd) {
        this.cases = dt?.data?.dataCM;
      }
    } else {
      this.cases =
        this.action != this.actionAdd
          ? JSON.parse(JSON.stringify(dialog.dataService?.dataSelected))
          : this.cases;
    }

    if (this.action != this.actionAdd) {
      this.applyProcess = this.cases.applyProcess;
      this.processID = this.cases.processID;
      this.getListContacts(this.cases?.customerID);
    } else {
      this.cases.caseType = this.funcID == 'CM0401' ? '1' : '2';
    }
    if (dt?.data.processID) {
      this.cases.processID = this.processID;
    }
    if (this.action === this.actionCopy) {
      this.cases.owner = null;
      // this.cases.salespersonID = null;
      this.oldIdInstance = this.cases.refID;
    }
    // this.executeApiCalls();
  }

  async onInit(): Promise<void> {
    this.action != this.actionEdit && (await this.getCurrentSetting());
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
    if (!this.isBlock) return;
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
    this.cases.owner = this.owner;
    if (this.applyProcess) {
      this.updateDataCases(this.instance, this.cases);
      this.convertDataInstance(this.cases, this.instance);
    }

    // if (this.action !== this.actionEdit) {
    //   this.insertInstance();
    // } else {
    //   this.editInstance();
    // }
    this.actionSaveBeforeSaveAttachment();
  }
  async actionSaveBeforeSaveAttachment() {
    if (this.attachment?.fileUploadList?.length > 0) {
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          var countAttack = 0;
          countAttack = Array.isArray(res) ? res.length : 1;
          this.executeSaveData();
        }
      });
    } else {
      this.executeSaveData();
    }
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
          this.setAutoNameTabFields(result?.autoNameTabFields);
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
        // case 'C':case ko có
        case 'L':
        case 'TA':
        case 'PA':
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
    // if ($event) {
    //   this.owner = this.cases.applyProcess ? $event : $event.data;
    //   this.cases.owner = this.owner;
    // }
    if ($event) {
      this.owner = this.cases.applyProcess ? $event : $event.data;
      let ownerName = '';
      if (this.listParticipants.length > 0 && this.listParticipants) {
        ownerName = this.listParticipants.filter(
          (x) => x.userID === this.owner
        )[0]?.userName;
      }
      this.searchOwner('1', 'O', '0', this.owner, ownerName);
    } else if ($event == null || $event == '') {
      this.deleteOwner('1', 'O', '0', this.owner, 'owner');
    }
  }
  searchOwner(
    objectType: any,
    roleType: any,
    memberType: any,
    owner: any,
    ownerName: any
  ) {
    let index = -1;
    if (this.cases?.permissions?.length > 0 && this.cases?.permissions) {
      index = this.cases?.permissions.findIndex(
        (x) =>
          x.objectType == objectType &&
          x.roleType === roleType &&
          x.memberType == memberType
      );
      if (index != -1) {
        this.cases.permissions[index].objectID = owner;
        this.cases.permissions[index].objectName = ownerName;
        if (this.action == this.actionEdit) {
          this.cases.permissions[index].modifiedBy = this.user.userID;
          this.cases.permissions[index].modifiedOn = new Date();
        }
      }
    }
    if (index == -1) {
      if (owner) {
        this.addOwner(owner, ownerName, roleType, objectType);
      }
    }
  }
  addOwner(owner, ownerName, roleType, objectType) {
    let permission = new CM_Permissions();
    permission.objectID = owner;
    permission.objectName = ownerName;
    permission.objectType = objectType;
    permission.roleType = roleType;
    permission.memberType = '0';
    permission.full = true;
    permission.read = true;
    permission.update = true;
    permission.upload = true;
    permission.download = true;
    permission.allowUpdateStatus = '1';
    permission.full = roleType === 'O';
    permission.assign = roleType === 'O';
    permission.delete = roleType === 'O';
    permission.allowPermit = roleType === 'O';
    permission.isActive = true;
    this.cases.permissions = this.cases?.permissions
      ? this.cases.permissions
      : [];
    this.cases.permissions.push(permission);
  }
  deleteOwner(
    objectType: any,
    roleType: any,
    memberType: any,
    owner: any,
    field: any
  ) {
    let index = this.cases?.permissions.findIndex(
      (x) =>
        x.objectType == objectType &&
        x.roleType === roleType &&
        x.memberType == memberType &&
        x.objectID === owner
    );
    if (index != -1) {
      if (field === 'owner') {
        this.cases.owner = null;
        this.owner = null;
      }
      this.cases.permissions.splice(index, 1);
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
      .subscribe(async (res) => {
        if (res) {
          this.attachment?.clearData();
          this.dialog.close(res.save);
        } else this.dialog.close();
      });
  }
  onEdit() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.update) {
          this.dialog.close(res.update);
        }
      });
  }
  onAddInstance() {
    this.dialog.dataService
      .save((option: any) => this.beforeSaveInstance(option))
      .subscribe((res) => {
        if (res && res.save) {
          this.cases.status = res.save.status;
          this.cases.datas = res.save.datas;
          this.addPermission(res.save.permissions);
          this.codxCmService.addCases(this.cases).subscribe((res) => {
            if (res) {
            }
          });
          this.dialog.close(res.save);
          this.changeDetectorRef.detectChanges();
        }
      });
  }
  onUpdateInstance() {
    this.dialog.dataService
      .save((option: any) => this.beforeSaveInstance(option))
      .subscribe((res) => {
        if (res.update) {
          this.cases.status = res.update?.status;
          this.cases.datas = res.update?.datas;
          this.codxCmService.editCases(this.cases).subscribe((res) => {
            if (res) {
            }
          });
          this.dialog.close(res.update);
        }
      });
  }
  beforeSave(option: RequestOption) {
    var data = this.cases;
    option.methodName =
      this.action !== this.actionEdit ? 'AddCasesAsync' : 'EditCasesAsync';
    option.className = 'CasesBusiness';
    option.data = data;
    option.service = 'CM';
    return true;
  }
  beforeSaveInstance(option: RequestOption) {
    option.service = 'DP';
    option.className = 'InstancesBusiness';
    option.assemblyName = 'ERM.Business.DP';
    if (this.action === 'add' || this.action === 'copy') {
      option.methodName = 'AddInstanceAsync';
      option.data = [this.instance, this.listInstanceSteps, this.oldIdInstance];
    } else if (this.action === 'edit') {
      option.methodName = 'EditInstanceAsync';
      option.data = [this.instance, this.listCustomFile];
    }
    return true;
  }

  async executeApiCalls() {
    await this.getGridView(this.formModel);
    if (this.action == 'add') {
      this.itemTabs(false);

      let res = await firstValueFrom(
        this.codxCmService.getParam('CMParameters', '1')
      );
      if (res?.dataValue) {
        let dataValue = JSON.parse(res?.dataValue);
        console.log(dataValue);
        this.applyProcess = dataValue?.ProcessCase == '1';
      }
      this.cases.applyProcess = this.applyProcess;
      this.checkApplyProcess(this.cases.applyProcess);

      return;
    }

    if (this.processID) {
      await this.getListInstanceSteps(this.cases.processID);
    } else {
      this.itemTabs(false);
    }
  }

  async executeSaveData() {
    if (this.action !== this.actionEdit) {
      this.cases.applyProcess && (await this.insertInstance());
      !this.cases.applyProcess && this.onAdd();
    } else {
      this.cases.applyProcess && (await this.editInstance());
      !this.cases.applyProcess && this.onEdit();
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
      this.action === this.actionCopy ? this.cases.processID : processId;
    var data = [processId, this.cases.refID, this.action, this.applyFor];
    this.codxCmService.getInstanceSteps(data).subscribe(async (res) => {
      if (res && res.length > 0) {
        var obj = {
          id: processId,
          steps: res[0],
          permissions: res[1],
          caseNO: this.action !== this.actionEdit ? this.cases.caseNo : res[2],
          autoNameTabFields: res[3]?.autoNameTabFields,
        };
        var isExist = this.listMemorySteps.some((x) => x.id === processId);
        if (!isExist) {
          this.listMemorySteps.push(obj);
        }
        this.listInstanceSteps = res[0];
        this.setAutoNameTabFields(obj?.autoNameTabFields);
        this.itemTabs(this.ischeckFields(this.listInstanceSteps));

        this.listParticipants = obj.permissions;
        if (this.action === this.actionEdit) {
          this.owner = this.cases.owner;
        } else {
          this.cases.caseNo = res[2];
        }
        this.dateMax = this.HandleEndDate(
          this.listInstanceSteps,
          this.action,
          this.action !== this.actionEdit ||
            (this.action === this.actionEdit &&
              (this.cases.status == '1' || this.cases.status == '15'))
            ? null
            : this.cases.createdOn
        );
        this.cases.endDate =
          this.action === this.actionEdit ? this.cases?.endDate : this.dateMax;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  //get autoname tab fields
  setAutoNameTabFields(autoNameTabFields) {
    autoNameTabFields = autoNameTabFields;
    if (this.menuInputInfo) {
      this.menuInputInfo.text =
        autoNameTabFields && autoNameTabFields.trim() != ''
          ? autoNameTabFields
          : 'Thông tin nhập liệu';
      this.menuInputInfo.subName =
        autoNameTabFields && autoNameTabFields.trim() != ''
          ? autoNameTabFields
          : 'Input information';
      this.menuInputInfo.subText =
        autoNameTabFields && autoNameTabFields.trim() != ''
          ? autoNameTabFields
          : 'Input information';
      const menuInput = this.tabInfo.findIndex(
        (item) => item?.name === this.menuInputInfo?.name
      );
      if (menuInput != -1) {
        this.tabInfo[menuInput] = JSON.parse(
          JSON.stringify(this.menuInputInfo)
        );
      }
    }
    this.detectorRef.detectChanges();
  }
  //end

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
    if (!this.isLoading) {
      let data = [this.instance, this.listInstanceSteps, this.oldIdInstance];
      this.codxCmService.addInstance(data).subscribe((instance) => {
        if (instance) {
          this.instanceRes = instance;
          this.cases.status = instance.status;
          this.cases.datas = instance.datas;
          this.addPermission(instance.permissions);
          this.onAdd();
        }
      });
    } else {
      this.onAddInstance();
    }
  }
  async editInstance() {
    if (!this.isLoading) {
      let data = [this.instance, this.listCustomFile];
      this.codxCmService.editInstance(data).subscribe((instance) => {
        if (instance) {
          this.instanceRes = instance;
          this.cases.status = instance.status;
          this.cases.datas = instance.datas;
          this.onEdit();
        }
      });
    } else {
      this.onUpdateInstance();
    }
  }
  addPermission(permissionDP) {
    if (permissionDP && permissionDP?.length > 0) {
      this.cases.permissions = this.cases?.permissions
        ? this.cases.permissions
        : [];
      for (let item of permissionDP) {
        this.cases.permissions.push(this.copyPermission(item));
      }
    }
  }
  copyPermission(permissionDP: any) {
    let permission = new CM_Permissions();
    permission.objectID = permissionDP.objectID;
    permission.objectName = permissionDP.objectName;
    permission.objectType = permissionDP.objectType;
    permission.roleType = permissionDP.roleType;
    // permission.full =  permissionDP.full;
    permission.read = permissionDP.read;
    permission.update = permissionDP.update;
    permission.assign = permissionDP.assign;
    permission.delete = permissionDP.delete;
    permission.upload = permissionDP.upload;
    permission.download = permissionDP.download;
    permission.isActive = true;
    permission.create = permissionDP.create;
    permission.memberType = '2'; // Data from DP
    permission.allowPermit = permissionDP.allowPermit;
    permission.allowUpdateStatus = permissionDP.allowUpdateStatus;
    permission.createdOn = new Date();
    permission.createdBy = this.user.userID;
    return permission;
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
    if (this.action !== this.actionEdit) {
      instance.startDate = null;
      instance.status = '1';
    }
    instance.title = cases?.caseName?.trim();
    instance.memo = cases?.memo?.trim();
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
      cases.startDate = null;
    }
    if (this.action === this.actionAdd) {
      cases.caseType = this.funcID == 'CM0401' ? '1' : '2';
    }
    cases.owner = this.owner;
    //  cases.salespersonID = this.owner;
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
      if(!listSteps[i].isSuccessStep && !listSteps[i].isFailStep) {
        endDate.setDate(endDate.getDate() + listSteps[i].durationDay);
        endDate.setHours(endDate.getHours() + listSteps[i].durationHour);
        endDate = this.setTimeHoliday(
          dateNow,
          endDate,
          listSteps[i]?.excludeDayoff
        );
        dateNow = endDate;
      }
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
      let isEndSaturday = endDay.getDay() === 6;
      endDay.setDate(endDay.getDate() + day);

      if (endDay.getDay() === 6 && isSaturday) {
        endDay.setDate(endDay.getDate() + 1);
      }

      if (endDay.getDay() === 0 && isSunday) {
        if (!isEndSaturday) {
          endDay.setDate(endDay.getDate() + (isSaturday ? 1 : 0));
        }
        endDay.setDate(endDay.getDate() + (isSunday ? 1 : 0));
      }
    }
    return endDay;
  }

  // async getListPermission(permissions) {
  //   this.listParticipants = permissions;
  //   return this.listParticipants != null && this.listParticipants.length > 0
  //     ? await this.codxCmService.getListUserByOrg(this.listParticipants)
  //     : this.listParticipants;
  // }

  // //#region  check RequiredDeal
  checkEndDayInstance(endDate, endDateCondition) {
    var date1 = new Date(endDate);
    var date2 = new Date(endDateCondition);
    this.dateMessage = new Date(date2).toLocaleDateString('en-AU');
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);

    return date1 < date2;
  }

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
      this.applyProcess =
        this.funcID == 'CM0401'
          ? dataValue?.ProcessCase == '1'
          : dataValue?.ProcessRequest == '1';
      this.cases.applyProcess = this.applyProcess;
    }
  }

  checkApplyProcess(check: boolean) {
    if (check) {
      // this.placeHolderAutoNumber = this.leadNoProcess;
      this.disabledShowInput = true;
      // this.itemTabsInput(true);
    } else {
      this.getAutoNumber();
      // this.itemTabsInput(false);
    }

    this.cases.applyProcess = check;
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
              this.placeHolderAutoNumber = mes?.customName || mes?.description;
            }
          });
          !this.caseNoSetting && this.getAutoNumberSetting();
          this.cases.caseNo = this.caseNoSetting;
          this.disabledShowInput = true;
        } else {
          this.placeHolderAutoNumber = '';
          this.cases.caseNo = null;
          this.disabledShowInput = false;
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
        this.caseNoSetting = autoNum;
        this.cases.caseNo = this.caseNoSetting;
      });
  }

  changeAutoNum(e) {
    if (!this.disabledShowInput && e) {
      this.cases.caseNo = e?.crrValue;
      if (this.cases.caseNo && this.cases.caseNo.includes(' ')) {
        this.notificationsService.notifyCode(
          'CM026',
          0,
          '"' + this.gridViewSetup['CaseNo'].headerText + '"'
        );
        return;
      } else if (this.cases.caseNo) {
        if (this.isExistCaseNo(this.cases.caseNo)) {
          return;
        }
      }
    }
  }
  async isExistCaseNo(caseNo) {
    this.codxCmService.isExistCaseNo([caseNo]).subscribe((res) => {
      if (res) {
        this.notificationsService.notifyCode(
          'CM003',
          0,
          '"' + this.gridViewSetup['CaseNo'].headerText + '"'
        );
        this.isExist = res;
      }
      this.isExist = res;
    });
  }
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
  ischeckFields(liststeps: any): boolean {
    this.listFields = [];
    if(this.action !== 'edit') {
      let stepCurrent = liststeps[0];
      if(stepCurrent && stepCurrent.fields?.length > 0 ) {
        let filteredTasks = stepCurrent.tasks.filter(task => task?.fieldID !== null && task?.fieldID?.trim() !== '')
        .map(task => task.fieldID)
        .flatMap(item => item.split(';').filter(item => item !== ''));
        let listFields = stepCurrent.fields.filter(field => !filteredTasks.includes(this.action === 'copy'? field?.reCID: field?.refID));
        this.listFields = [...this.listFields, ...listFields];
      }
     }
     else {
      let idxCrr = liststeps.findIndex((x) => x.stepID == this.instance?.stepID);
      if (idxCrr != -1) {
        for (let i = 0; i <= idxCrr; i++) {
          let stepCurrent = liststeps[i];
          if(stepCurrent && stepCurrent.fields?.length > 0 ) {
            let filteredTasks = stepCurrent?.tasks.filter(task => task?.fieldID !== null && task?.fieldID?.trim() !== '')
            .map(task => task?.fieldID)
            .flatMap(item => item.split(';').filter(item => item !== ''));
            let listFields = stepCurrent?.fields.filter(field => !filteredTasks.includes(field?.recID));
            this.listFields = [...this.listFields, ...listFields];
          }
        }
      }
    }
    return this.listFields != null && this.listFields?.length > 0;
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
  addFileCompleted(e) {
    this.isBlock = e;
  }
  //----------------------------end---------------------------//
}
