import { async } from '@angular/core/testing';
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
  CacheService,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Deals, CM_Leads, CM_Permissions } from '../../models/cm_model';
import { tmpInstances } from '../../models/tmpModel';
import { recordEdited } from '@syncfusion/ej2-pivotview';
import { environment } from 'src/environments/environment';
import { T } from '@angular/cdk/keycodes';
import { filter, firstValueFrom } from 'rxjs';
import moment from 'moment';
import { CustomFieldService } from 'projects/codx-share/src/lib/components/codx-input-custom-field/custom-field.service';

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
  @ViewChild('body') body: TemplateRef<any>;
  @ViewChild('footer') footer: TemplateRef<any>;

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
  currencyIDDefault: string;

  companyNo: string = '';
  customerNo: string = '';
  companyPhone: string = '';
  customerPhone: string = '';
  companyName: string = '';
  customerName: string = '';
  company: string = '';
  customer: string = '';

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
  listCategory: any[] = [];
  listFields: any[] = [];
  // const
  readonly actionAdd: string = 'add';
  readonly actionCopy: string = 'copy';
  readonly actionEdit: string = 'edit';
  readonly radioCategory: string = 'radioCategory';
  readonly fieldCbxParticipants = { text: 'userName', value: 'userID' };
  readonly radioCompany: string = 'company';
  readonly radioCustomer: string = 'customer';
  readonly viewOwnerProcess: string = 'viewOwnerProcess';
  readonly viewOwnerDefault: string = 'viewOwnerDefault';

  // Tab control
  menuGeneralInfo = {
    icon: 'icon-info',
    text: 'Thông tin chung',
    name: 'GeneralInfo',
    subName: 'General information',
    subText: 'General information',
  };
  menuGeneralSystem = {
    icon: 'icon-reorder',
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
  instanceSteps: any;
  addFieldsControl: any = '1';
  planceHolderAutoNumber: any = '';
  leadNoProcess: any;
  leadNoSetting: any;
  leadNoSystem: any;
  user: any;
  idxCrr: any = -1;

  // model of DP
  instance: tmpInstances = new tmpInstances();

  // boolean
  isLoading: boolean = false;
  isCopyAvtLead: boolean = false;
  isCopyAvtContact: boolean = false;
  avatarChangeLead: boolean = false;
  avatarChangeContact: boolean = false;
  isCategory: boolean = true;
  disabledShowInput: boolean = true;
  isExist: boolean = false;
  applyProcess: boolean = true;
  isBlock: boolean = true;
  isShowField: boolean = false;

  // number
  leverSetting: number;

  convertCustomerToLead: boolean = false; //Phúc bổ sung chỗ này để convert customer qua lead
  transIDCamp: any;
  autoNameTabFields: string;
  arrCaculateField: any[] = [];
  isLoadedCF = false;
  isView: boolean = false;
  constructor(
    private inject: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private codxCmService: CodxCmService,
    private customFieldSV: CustomFieldService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.formModel = dialog.formModel;
    this.funcID = this.formModel?.funcID;
    this.titleAction = dt?.data?.titleAction;
    this.action = dt?.data?.action;
    // this.lead.processID = dt?.data?.processId;
    this.applyFor = dt?.data?.applyFor;
    this.gridViewSetup = dt?.data?.gridViewSetup;
    this.currencyIDDefault = dt?.data?.currencyIDDefault;
    this.getValuelistCategory(dt?.data?.listCategory);
    if (this.action !== this.actionAdd) {
      this.lead = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
      this.customerIDOld = this.lead?.customerID;
      this.contactId =
        this.action === this.actionCopy
          ? dt?.data?.contactIdOld
          : this.lead.contactID;
      this.leadId =
        this.action === this.actionCopy
          ? dt?.data?.leadIdOld
          : this.lead?.recID;
      if (this.action === this.actionCopy) {
        this.oldIdInstance = this.lead?.refID;
        this.lead.applyProcess = dt?.data?.applyProcess;
        this.lead.leadID = '';
        this.lead.contactID = Util.uid();
        this.lead.recID = Util.uid();
        this.lead.permissions = this.lead?.permissions.filter(
          (x) => x.memberType != '2'
        );
      } else {
        this.planceHolderAutoNumber = this.lead?.leadID;
      }
    } else {
      //Phúc bổ sung đoạn này để convert customer qua Lead nếu lỗi thì liên hệ phúc nha
      this.convertCustomerToLead = dt?.data?.convertCustomerToLead ?? false;
      this.transIDCamp = dt?.data?.transIDCamp ?? null;
      if (this.convertCustomerToLead) {
        this.lead = JSON.parse(JSON.stringify(dt?.data?.dataConvert));
      } //end Phúc bổ sung đoạn này để convert customer qua Lead nếu lỗi thì liên hệ phúc nha
      this.leadId = this.lead.recID;
      this.contactId = this.lead.contactID;
    }
    // this.executeApiCalls();
    this.isView = dt?.data?.isView ?? false;
    this.isCategory = this.lead.category == '1';
  }

  onInit(): void {}

  ngAfterViewInit(): void {
    this.tabInfo = [this.menuGeneralInfo, this.menuGeneralSystem];
    this.tabContent = [this.tabGeneralInfoDetail, this.tabGeneralSystemDetail];
    this.executeApiCalls();
    this.lead.permissions = !this.lead?.permissions
      ? []
      : this.lead?.permissions;
    this.owner = this.lead?.owner;
  }

  async getParameterAddress() {
    let param = await firstValueFrom(
      this.cache.viewSettingValues('CMParameters')
    );
    let lever = 0;
    if (param?.length > 0) {
      let dataParam = param.filter((x) => x.category == '1' && !x.transType)[0];
      let paramDefault = JSON.parse(dataParam.dataValue);
      lever = paramDefault['ControlInputAddress'] ?? 0;
    }
    this.leverSetting = lever;
  }

  setAutoNameTabFields(autoNameTabFields) {
    this.autoNameTabFields = autoNameTabFields;
    if (this.menuInputInfo) {
      this.menuInputInfo.text =
        this.autoNameTabFields && this.autoNameTabFields.trim() != ''
          ? this.autoNameTabFields
          : 'Thông tin mở rộng';
      this.menuInputInfo.subName =
        this.autoNameTabFields && this.autoNameTabFields.trim() != ''
          ? this.autoNameTabFields
          : 'Input information';
      this.menuInputInfo.subText =
        this.autoNameTabFields && this.autoNameTabFields.trim() != ''
          ? this.autoNameTabFields
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
  }

  valueChange($event) {
    if ($event && $event.data) {
      this.lead[$event.field] = $event.data;
      if ($event.field == 'currencyID') {
        this.loadExchangeRate();
      } else if ($event.field == 'industries') {
        let owner = $event.component.itemsSelected[0]?.Owner;
        let ownerName = '';
        if (this.applyProcess) {
          let index = this.listParticipants.findIndex((x) => x.userID == owner);

          if (index != -1) {
            this.owner = owner;
            ownerName = this.listParticipants[index].userName;
          }
        } else {
          this.owner = owner;
          ownerName = $event?.component?.itemsSelected[0]?.UserName;
        }
        this.searchOwner('1', 'O', '0', this.owner, ownerName);
      }
    }
  }
  valueChangePermission($event) {
    if ($event.data === null || $event.data === '') {
      this.deleteOwner(
        'U',
        $event.field === 'salespersonID' ? 'S' : 'C',
        '0',
        $event.field === 'salespersonID'
          ? this.lead.salespersonID
          : this.lead.consultantID,
        $event.field
      );
    } else {
      this.searchOwner(
        'U',
        $event.field === 'salespersonID' ? 'S' : 'C',
        '0',
        $event.data,
        $event?.component?.itemsSelected[0]?.UserName
      );
    }
    this.lead[$event.field] = $event.data;
  }

  loadExchangeRate() {
    let day = this.lead.createdOn ?? new Date();
    if (this.lead.currencyID) {
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
          } else {
            this.lead.exchangeRate = exchangeRateNew;
          }
        });
    }
  }
  getValuelistCategory(listCategory) {
    const mappings = {
      '5': 'companyNo',
      '6': 'customerNo',
      '7': 'companyPhone',
      '8': 'customerPhone',
      '3': 'companyName',
      '4': 'customerName',
      '1': 'company',
      '2': 'customer',
    };
    for (const key in mappings) {
      const value = mappings[key];
      this[value] = listCategory.find((x) => x.value === key)?.text || '';
    }
  }
  valueChangeDate($event) {
    if ($event) {
      this.lead[$event.field] = $event.data.fromDate;
    }
  }

  async saveLead() {
    if (!this.isBlock) return;
    if (!this.lead?.leadName?.trim()) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['LeadName']?.headerText + '"'
      );
      return;
    }
    if (!this.lead?.leadID?.trim()) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['LeadID']?.headerText + '"'
      );
      return;
    }
    if (this.lead.leadID && this.lead.leadID.includes(' ')) {
      this.notificationsService.notifyCode(
        'CM026',
        0,
        '"' + this.gridViewSetup['LeadID'].headerText + '"'
      );
      return;
    }

    if (this.isExist) {
      this.notificationsService.notifyCode(
        'CM003',
        0,
        '"' + this.gridViewSetup['LeadID'].headerText + '"'
      );
      return;
    }

    if (this.lead.address && this.lead.address.trim() != '') {
      let json = await firstValueFrom(
        this.api.execSv<any>(
          'BS',
          'ERM.Business.BS',
          'ProvincesBusiness',
          'GetLocationAsync',
          [this.lead.address, this.leverSetting]
        )
      );
      if (json != null && json.trim() != '' && json != 'null') {
        let lstDis = JSON.parse(json);
        this.lead.provinceID = lstDis?.ProvinceID;
        this.lead.districtID = lstDis?.DistrictID;
        //  this.lead.wardID = lstDis?.WardID;
        this.lead.countryID = lstDis?.CountryID;
      } else {
        this.lead.provinceID = null;
        this.lead.districtID = null;
        this.lead.processID = null;
        //    this.lead.wardID = null;
      }
      if (this.lead?.countryID == null || this.lead?.countryID?.trim() == '') {
        if (this.lead.provinceID) {
          let province = await firstValueFrom(
            this.api.execSv<any>(
              'BS',
              'ERM.Business.BS',
              'ProvincesBusiness',
              'GetOneProvinceAsync',
              [this.lead.provinceID]
            )
          );
          this.lead.countryID = province?.countryID;
        }
      }
    }

    if (
      !this.codxCmService.checkValidateSetting(
        this.lead.address,
        this.lead,
        this.leverSetting,
        this.gridViewSetup,
        this.gridViewSetup?.Address?.headerText
      )
    ) {
      return;
    }
    this.promiseSaveFile();
  }
  cbxChange($event, field) {
    if ($event && $event.data) {
      this.lead[field] = $event;
    }
  }
  async valueChangeOwner($event, view) {
    if (view === this.viewOwnerDefault) {
      if ($event?.data && $event?.data !== '') {
        let ownerName = '';
        this.owner = $event?.data;
        ownerName = $event?.component?.itemsSelected[0]?.UserName;
        this.searchOwner('1', 'O', '0', this.owner, ownerName);
      } else if ($event === null || $event === '' || $event === '') {
        this.deleteOwner('1', 'O', '0', this.lead.owner, 'owner');
      }
    } else if (view === this.viewOwnerProcess) {
      if ($event) {
        this.owner = $event;
        let ownerName = '';
        if (this.listParticipants.length > 0 && this.listParticipants) {
          ownerName = this.listParticipants.filter(
            (x) => x.userID === this.owner
          )[0].userName;
        }
        this.searchOwner('1', 'O', '0', this.owner, ownerName);
      } else if ($event === null || $event === '') {
        this.deleteOwner('1', 'O', '0', this.lead.owner, 'owner');
      }
    }
  }
  searchOwner(
    objectType: any,
    roleType: any,
    memberType: any,
    owner: any,
    ownerName: any
  ) {
    if (owner && ownerName) {
      let index = -1;
      if (this.lead?.permissions?.length > 0 && this.lead?.permissions) {
        index = this.lead?.permissions.findIndex(
          (x) =>
            x.objectType == objectType &&
            x.roleType === roleType &&
            x.memberType == memberType
        );
        if (index != -1) {
          this.lead.permissions[index].objectID = owner;
          this.lead.permissions[index].objectName = ownerName;
          if (this.action == this.actionEdit) {
            this.lead.permissions[index].modifiedBy = this.user.userID;
            this.lead.permissions[index].modifiedOn = new Date();
          }
        }
      }
      if (index == -1) {
        this.addOwner(owner, ownerName, roleType, objectType);
      }
    }
  }

  deleteOwner(
    objectType: any,
    roleType: any,
    memberType: any,
    owner: any,
    field: any
  ) {
    if (this.lead?.permissions && this.lead?.permissions.length > 0) {
      let index = this.lead?.permissions.findIndex(
        (x) =>
          x.objectType == objectType &&
          x.roleType === roleType &&
          x.memberType == memberType &&
          x.objectID === owner
      );
      if (index != -1) {
        if (field === 'owner') {
          this.lead.owner = null;
          this.owner = null;
        } else if (field === 'salespersonID') {
          this.lead.salespersonID = null;
        } else if (field === 'consultantID') {
          this.lead.consultantID = null;
        }
        this.lead.permissions.splice(index, 1);
      }
    }
  }

  addOwner(owner, ownerName, roleType, objectType) {
    var permission = new CM_Permissions();
    permission.objectID = owner;
    permission.objectName = ownerName;
    permission.objectType = objectType;
    permission.roleType = roleType;
    permission.memberType = '0';
    permission.read = true;
    permission.update = true;
    permission.upload = true;
    permission.download = true;
    permission.isActive = true;
    permission.allowUpdateStatus =
      roleType === 'O' || roleType === 'S' ? '1' : '0';
    permission.full = roleType === 'O';
    permission.assign = roleType === 'O';
    permission.delete = roleType === 'O';
    permission.allowPermit = roleType === 'O';
    this.lead.permissions = this.lead?.permissions
      ? this.lead?.permissions
      : [];
    this.lead.permissions.push(permission);
  }
  // valueChangeIndustries($event) {
  //   if ($event && $event.data) {
  //     this.listIndustries.push($event.data);
  //   }
  // }

  addPermission(permissionDP) {
    if (permissionDP?.length > 0 && permissionDP) {
      for (let item of permissionDP) {
        this.lead.permissions.push(this.copyPermission(item));
      }
    }
  }

  // Add permission from DP
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
  checkApplyProcess(check: boolean) {
    if (check) {
      this.planceHolderAutoNumber = this.leadNoProcess;
      this.disabledShowInput = true;
      // this.itemTabsInput(true);
    } else {
      this.getAutoNumber();
      // this.itemTabsInput(false);
    }

    this.lead.applyProcess = check;
  }
  async getAutoNumber() {
    this.codxCmService
      .getFieldAutoNoDefault(this.funcID, this.formModel.entityName)
      .subscribe((res) => {
        if (res && !res.stop) {
          this.cache.message('AD019').subscribe((mes) => {
            if (mes) {
              this.planceHolderAutoNumber = mes?.customName || mes?.description;
            }
          });
          !this.leadNoSetting && this.getAutoNumberSetting();
          this.lead.leadID = this.leadNoSetting;
          this.disabledShowInput = true;
        } else {
          this.planceHolderAutoNumber = '';
          this.lead.leadID = '';
          this.disabledShowInput = false;
        }
      });
  }
  async getAutoNumberSetting() {
    this.codxCmService
      .genAutoNumberDefault(
        this.formModel.funcID,
        this.formModel.entityName,
        'LeadID'
      )
      .subscribe((autoNum) => {
        this.leadNoSetting = autoNum;
        this.lead.leadID = this.leadNoSetting;
      });
  }
  valueChangeCategory($event, field) {
    if ($event) {
      let checked = $event.component.checked;
      if ($event.field === this.radioCompany && checked) {
        this.isCategory = true;
        this.lead.category = '1';
      } else if ($event.field === this.radioCustomer && checked) {
        this.isCategory = false;
        this.lead.category = '2';
      }
      this.itemTabsInputContact(this.isCategory);
    }
    this.changeDetectorRef.detectChanges();
  }

  onAdd() {
    //this.lead.applyProcess && this.addPermission(this.lead.processID);
    if (this.convertCustomerToLead) {
      this.api
        .execSv<any>('CM', 'ERM.Business.CM', 'LeadsBusiness', 'AddLeadAsync', [
          this.lead,
          this.leadId,
          this.contactId,
          this.transIDCamp,
        ])
        .subscribe((res) => {
          if (res) {
            res.modifiedOn = moment(new Date()).add(99, 'hours').toDate();
            this.dialog.close(res);
            this.notificationsService.notifyCode('CM051');
          }
        });
    } else {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option), 0)
        .subscribe((res) => {
          if (res?.save) {
            //     this.view.dataService.update(res).subscribe();
            //bua save avata
            (this.dialog.dataService as CRUDService)
              .update(res.save)
              .subscribe();
            this.dialog.close(res.save);
          }
        });
    }
  }
  onEdit() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res?.update) {
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          this.dialog.close(res.update);
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
    instance.stepID =
      this.action !== this.actionEdit
        ? this.listInstanceSteps[0]?.stepID
        : lead.stepID;
  }
  updateDataLead(instance: tmpInstances, lead: CM_Leads) {
    if (this.action !== this.actionEdit) {
      lead.stepID = this.listInstanceSteps[0]?.stepID;
      lead.nextStep = this.listInstanceSteps[1]?.stepID;
      lead.status = this.owner ? '1' : '15';
      lead.refID = instance.recID;
      lead.startDate = null;
    }
  }

  async promiseSaveFile() {
    this.lead.owner = this.owner;
    this.lead.applyProcess &&
      this.convertDataInstance(this.lead, this.instance);
    this.lead.applyProcess && this.updateDataLead(this.instance, this.lead);
    this.action != this.actionEdit && this.updateDateCategory();

    if (this.avatarChangeLead) {
      await this.saveFileLead(this.leadId);
    }
    if (this.avatarChangeContact) {
      await this.saveFileContact(this.contactId);
    }
    this.saveAddLead();
  }
  async saveAddLead() {
    if (this.action !== this.actionEdit) {
      this.lead.applyProcess && (await this.insertInstance());
      !this.lead.applyProcess && this.onAdd();
    } else {
      this.lead.applyProcess && (await this.editInstance());
      !this.lead.applyProcess && this.onEdit();
    }
  }

  async insertInstance() {
    var data = [this.instance, this.listInstanceSteps, this.oldIdInstance];
    this.codxCmService.addInstance(data).subscribe((instance) => {
      if (instance) {
        this.lead.datas = instance?.datas;
        this.lead.status = instance.status;
        this.addPermission(instance.permissions);
        this.onAdd();
        //   this.isLoading && this.dialog.close(instance);
      }
    });
  }
  async editInstance() {
    var data = [this.instance, this.listCustomFile];
    this.codxCmService.editInstance(data).subscribe((instance) => {
      if (instance) {
        this.lead.datas = instance?.datas;
        this.lead.status = instance.status;
        this.lead.permissions = this.lead.permissions.filter(
          (x) => x.memberType != '2'
        );
        this.addPermission(instance?.permissions);
        // this.isLoading && this.dialog.close(instance);
        this.onEdit();
      }
    });
  }

  async saveFileLead(leadID) {
    // this.imageUploadLead.updateFileDirectReload(leadID).subscribe((result) => {
    //   if (result) {
    //   }
    // });

    await firstValueFrom(this.imageUploadLead.updateFileDirectReload(leadID));
  }
  async saveFileContact(contactID) {
    // this.imageUploadContact
    //   .updateFileDirectReload(contactID)
    //   .subscribe((result) => {
    //     if (result) {
    //     }
    //   });
    await firstValueFrom(
      this.imageUploadContact.updateFileDirectReload(contactID)
    );
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

  async executeApiCalls() {
    this.getParameterAddress();
    if (this.action === this.actionAdd) {
      let res = await firstValueFrom(
        this.codxCmService.getParam('CMParameters', '1')
      );
      if (res?.dataValue) {
        let dataValue = JSON.parse(res?.dataValue);
        this.currencyIDDefault = dataValue?.DefaultCurrency;
        this.applyProcess = dataValue?.ProcessLead == '1';
      }
      this.lead.currencyID = this.currencyIDDefault;
      this.lead.applyProcess = this.applyProcess;
      this.lead.applyProcess && this.getListInstanceSteps('');
      this.checkApplyProcess(this.lead.applyProcess);
    }

    if (!this.lead.applyProcess) {
      if (this.action !== this.actionEdit) this.getAutoNumber();
      // this.itemTabsInput(this.lead.applyProcess);
      this.owner = this.lead.owner;
    } else if (this.action !== this.actionAdd) {
      this.getListInstanceSteps(this.lead.processID);
    }
    this.itemTabsInputContact(this.isCategory);
  }
  // async getProcessSetting() {
  //   this.codxCmService.getListProcessDefault(['5']).subscribe((res) => {
  //     if (res) {
  //       // this.processId = res.recID;
  //       // this.dataObj = { processID: res.recID };
  //       // this.afterLoad();
  //       this.getListInstanceSteps(res.recID);
  //       this.lead.processID = res.recID;
  //       this.setAutoNameTabFields(res?.autoNameTabFields);
  //     }
  //   });
  // }
  async getListInstanceSteps(processId: any) {
    var data = [processId, this.lead?.refID, this.action, '5'];
    this.codxCmService.getInstanceSteps(data).subscribe(async (res) => {
      if (res && res.length > 0) {
        let obj = {
          id: res[3].processId,
          steps: res[0],
          permissions: res[1],
          leadID: this.action !== this.actionEdit ? res[2] : this.lead.leadID,
          processSetting: res[3],
        };
        this.leadNoProcess = res[2];
        let isExist = this.listMemorySteps.some((x) => x.id === processId);
        if (!isExist) {
          this.listMemorySteps.push(obj);
        }
        this.listInstanceSteps = res[0];
        this.idxCrr = this.listInstanceSteps.findIndex(
          (x) => x.stepID == this.lead.stepID
        );

        this.lead.processID = obj?.processSetting?.processId;
        this.isShowField = obj?.processSetting?.addFieldsControl == '1';
        this.setAutoNameTabFields(obj?.processSetting?.autoNameTabFields);
        this.itemTabsInput(this.ischeckFields(this.listInstanceSteps));
        this.listParticipants = null;
        this.listParticipants = JSON.parse(JSON.stringify(obj.permissions));
        if (this.action === this.actionEdit) {
          this.owner = this.lead.owner;
        } else {
          this.lead.leadID = res[2];
        }
        this.dateMax = this.HandleEndDate(
          this.listInstanceSteps,
          this.action,
          this.action !== this.actionEdit ||
            (this.action === this.actionEdit &&
              (this.lead.status == '1' || this.lead.status == '15'))
            ? null
            : this.lead.createdOn
        );
        this.lead.endDate =
          this.action === this.actionEdit ? this.lead?.endDate : this.dateMax;
        this.planceHolderAutoNumber = this.lead.leadID;

        this.changeDetectorRef.detectChanges();
      } else {
        this.lead.applyProcess = false;
      }
    });
  }

  HandleEndDate(listSteps: any, action: string, endDateValue: any) {
    endDateValue =
      action === this.actionAdd ||
      action === this.actionCopy ||
      (this.action === this.actionEdit &&
        (this.lead.status == '1' || this.lead.status == '15'))
        ? new Date()
        : new Date(endDateValue);
    let dateNow = endDateValue;
    let endDate = endDateValue;
    for (let i = 0; i < listSteps.length; i++) {
      if (!listSteps[i].isSuccessStep && !listSteps[i].isFailStep) {
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
  //   return this.listParticipants != null && this.listParticipants?.length > 0
  //     ? await this.codxCmService.getListUserByOrg(this.listParticipants)
  //     : this.listParticipants;
  // }
  // an tat theo truong tuy chinh

  itemTabsInput(check: boolean): void {
    let menuInput = this.tabInfo.findIndex(
      (item) => item === this.menuInputInfo
    );
    let tabInput = this.tabContent.findIndex(
      (item) => item === this.tabCustomFieldDetail
    );
    if (this.isShowField) {
      if (check && menuInput == -1 && tabInput == -1) {
        this.tabInfo.splice(2, 0, this.menuInputInfo);
        this.tabContent.splice(2, 0, this.tabCustomFieldDetail);
      } else if (!check && menuInput != -1 && tabInput != -1) {
        this.tabInfo.splice(menuInput, 1);
        this.tabContent.splice(tabInput, 1);
      }
    } else {
      if (menuInput != -1 && tabInput != -1) {
        this.tabInfo.splice(menuInput, 1);
        this.tabContent.splice(tabInput, 1);
      }
    }
  }
  itemTabsInputContact(check: boolean): void {
    let menuContact = this.tabInfo.findIndex(
      (item) => item === this.menuGeneralContact
    );
    let tabContact = this.tabContent.findIndex(
      (item) => item === this.tabGeneralContactDetail
    );
    if (check && menuContact == -1 && tabContact == -1) {
      this.tabInfo.splice(3, 0, this.menuGeneralContact);
      this.tabContent.splice(3, 0, this.tabGeneralContactDetail);
    } else if (!check && menuContact != -1 && tabContact != -1) {
      this.tabInfo.splice(menuContact, 1);
      this.tabContent.splice(tabContact, 1);
    }
  }

  ischeckFields(liststeps: any): boolean {
    this.listFields = [];
    if (this.action !== 'edit') {
      let stepCurrent = liststeps[0];
      if (stepCurrent && stepCurrent.fields?.length > 0) {
        let filteredTasks = stepCurrent.tasks
          .filter(
            (task) => task?.fieldID !== null && task?.fieldID?.trim() !== ''
          )
          .map((task) => task.fieldID)
          .flatMap((item) => item.split(';').filter((item) => item !== ''));
        let listFields = stepCurrent.fields.filter(
          (field) =>
            !filteredTasks.includes(
              this.action === 'copy' ? field?.recID : field?.refID
            )
        );
        this.listFields = [...this.listFields, ...listFields];
      }
    } else {
      let idxCrr = liststeps.findIndex((x) => x.stepID == this.lead?.stepID);
      if (idxCrr != -1) {
        for (let i = 0; i <= idxCrr; i++) {
          let stepCurrent = liststeps[i];
          if (stepCurrent && stepCurrent.fields?.length > 0) {
            let filteredTasks = stepCurrent?.tasks
              .filter(
                (task) => task?.fieldID !== null && task?.fieldID?.trim() !== ''
              )
              .map((task) => task?.fieldID)
              .flatMap((item) => item.split(';').filter((item) => item !== ''));
            let listFields = stepCurrent?.fields.filter(
              (field) => !filteredTasks.includes(field?.recID)
            );
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
  // check

  // covnert data CM -> data DP

  //#endregion

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
    //bo event.e vì nhan dc gia trị null
    if (event && event.data) {
      let result = event.e?.data;
      let field = event.data;
      switch (field.dataType) {
        case 'D':
          result = event.e?.data.fromDate;
          break;
        case 'P':
        case 'R':
        case 'A':
        case 'L':
        case 'TA':
        case 'PA':
          // case 'C': lead ko co
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
        if (field.dataType == 'N') this.caculateField();
      }
    }
  }
  valueTagChange(e) {
    this.lead.tags = e.data;
  }
  updateDateCategory() {
    if (this.lead.category == '2') {
      this.lead.industries = null;
      this.lead.annualRevenue = 0;
      this.lead.headcounts = null;
    }
  }
  changeAutoNum(e) {
    if (!this.disabledShowInput && e) {
      this.lead.leadID = e?.crrValue;
      if (this.lead.leadID && this.lead.leadID.includes(' ')) {
        this.notificationsService.notifyCode(
          'CM026',
          0,
          '"' + this.gridViewSetup['LeadID'].headerText + '"'
        );
        return;
      } else if (this.lead.leadID) {
        if (this.isExistLeadID(this.lead.leadID)) {
          return;
        }
      }
    }
  }
  async isExistLeadID(leadID) {
    this.codxCmService.isExistLeadId([leadID]).subscribe((res) => {
      if (res) {
        this.notificationsService.notifyCode(
          'CM003',
          0,
          '"' + this.gridViewSetup['LeadID'].headerText + '"'
        );
        this.isExist = res;
      }
      this.isExist = res;
    });
  }
  addFileCompleted(e) {
    this.isBlock = e;
  }

  //----------------------CACULATE---------------------------//

  getArrCaculateField() {
    this.arrCaculateField = [];
    this.listInstanceSteps.forEach((x) => {
      if (x.fields?.length > 0) {
        let fnum = x.fields.filter((x) => x.dataType == 'CF');
        if (fnum?.length > 0)
          this.arrCaculateField = this.arrCaculateField.concat(fnum);
      }
    });
    if (this.arrCaculateField?.length > 0)
      this.arrCaculateField.sort((a, b) => {
        if (a.dataFormat.includes('[' + b.fieldName + ']')) return 1;
        else if (b.dataFormat.includes('[' + a.fieldName + ']')) return -1;
        else return 0;
      });
    this.isLoadedCF = true;
  }
  //tính toán
  caculateField() {
    if (!this.isLoadedCF) this.getArrCaculateField();
    if (!this.arrCaculateField || this.arrCaculateField?.length == 0) return;
    let fieldsNum = [];
    this.listInstanceSteps.forEach((x) => {
      if (x.fields?.length > 0) {
        let fnum = x.fields.filter((x) => x.dataType == 'N');
        if (fnum?.length > 0) fieldsNum = fieldsNum.concat(fnum);
      }
    });
    if (!fieldsNum || fieldsNum?.length == 0) return;

    this.arrCaculateField.forEach((obj) => {
      let dataFormat = obj.dataFormat;
      fieldsNum.forEach((f) => {
        if (
          f.stepID == obj.stepID &&
          dataFormat.includes('[' + f.fieldName + ']')
        ) {
          if (!f.dataValue?.toString()) return;
          let dataValue = f.dataValue;
          if (f.dataFormat == 'P') dataValue = dataValue + '/100';
          dataFormat = dataFormat.replaceAll(
            '[' + f.fieldName + ']',
            dataValue
          );
        }
      });

      this.arrCaculateField.forEach((x) => {
        if (
          x.stepID == obj.stepID &&
          dataFormat.includes('[' + x.fieldName + ']')
        ) {
          if (!x.dataValue?.toString()) return;
          let dataValue = x.dataValue;
          dataFormat = dataFormat.replaceAll(
            '[' + x.fieldName + ']',
            dataValue
          );
        }
      });

      if (!dataFormat.includes('[')) {
        //tinh toán
        obj.dataValue = this.customFieldSV.caculate(dataFormat);
        //tính toan end
        let index = this.listInstanceSteps.findIndex(
          (x) => x.recID == obj.stepID
        );
        if (index != -1) {
          if (this.listInstanceSteps[index].fields?.length > 0) {
            let idxField = this.listInstanceSteps[index].fields.findIndex(
              (x) => x.recID == obj.recID
            );
            if (idxField != -1) {
              this.listInstanceSteps[index].fields[idxField].dataValue =
                obj.dataValue;

              let idxEdit = this.listCustomFile.findIndex(
                (x) =>
                  x.recID ==
                  this.listInstanceSteps[index].fields[idxField].recID
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
        this.setElement(obj.recID, obj.dataValue);
      }
    });
  }
  setElement(recID, value) {
    value = value == '_' ? '' : value;
    var codxinput = document.querySelectorAll(
      '.form-group codx-input[data-record="' + recID + '"]'
    );

    if (codxinput?.length > 0) {
      let htmlE = codxinput[0] as HTMLElement;
      let input = htmlE.querySelector('input') as HTMLInputElement;
      if (input) {
        input.value = value;
      }
    }
  }
  //------------------END_CACULATE--------------------//
}
