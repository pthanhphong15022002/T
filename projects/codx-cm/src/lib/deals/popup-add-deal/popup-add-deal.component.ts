import { async } from '@angular/core/testing';
import { load } from '@syncfusion/ej2-angular-charts';
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
  Util,
  CodxComboboxComponent,
  CodxInputComponent,
  DataRequest,
  DialogModel,
  CodxFormComponent,
} from 'codx-core';
import { CM_Contacts, CM_Deals, CM_Permissions } from '../../models/cm_model';
import { CodxCmService } from '../../codx-cm.service';
import { tmpInstances } from '../../models/tmpModel';
import { debug } from 'console';
import { CodxListContactsComponent } from '../../cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';
import { PopupQuickaddContactComponent } from '../../cmcustomer/cmcustomer-detail/codx-list-contacts/popup-quickadd-contact/popup-quickadd-contact.component';

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
  @ViewChild('tabGeneralContactDetail')
  tabGeneralContactDetail: TemplateRef<any>;
  @ViewChild('loadContactDeal') loadContactDeal: CodxListContactsComponent;
  CodxListContactsComponent;
  @ViewChild('form') form: CodxFormComponent;
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
  oldIdInstance: string = '';

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
  readonly fieldCbxParticipants = { text: 'userName', value: 'userID' };
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
    text: 'Thông tin mở rộng',
    name: 'InputInfo',
    subName: 'Input information',
    subText: 'Input information',
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
  user: any;
  owner: any;
  dateMessage: any;
  dateMax: any;
  customerIDOld: any;
  // model of DP
  instance: tmpInstances = new tmpInstances();
  instanceSteps: any;
  model: any;
  listInstanceSteps: any[] = [];

  customerID: string = '';
  customerOld: string;
  lstContactCustomer: any[] = [];
  lstContactDeal: any[] = [];
  lstContactDelete: any[] = [];
  lstContactAdd: any[] = [];
  lstContactOld: any[] = [];
  isLoad: boolean = true;
  customerName: any;
  isViewAll: boolean = false;
  functionModule: any;
  paramView: any;
  processIdDefault: string = '';
  currencyIDDefault: string = '';
  defaultDeal: string = '';

  // load data form DP
  isLoading: boolean = false;
  isBlock: boolean = true;
  currencyIDOld: string;
  idxCrr: any = -1;
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
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.titleAction = dt?.data?.titleAction;
    this.action = dt?.data?.action;
    this.isLoading = dt?.data?.isLoad;
    this.functionModule = dt?.data?.functionModule;
    this.model = { ApplyFor: '1' };
    this.gridViewSetup = dt?.data?.gridViewSetup;
    if (this.isLoading) {
      this.formModel = dt?.data?.formMD;

      if (this.action != this.actionAdd) {
        this.deal = dt?.data?.dataCM;
      }
    } else {
      this.deal =
        this.action != this.actionAdd
          ? JSON.parse(JSON.stringify(dialog.dataService.dataSelected))
          : this.deal;
    }

    if (dt?.data.processID) {
      this.deal.processID = dt?.data?.processID;
      this.isViewAll = true;
    }
    this.executeApiCalls();
    if (this.action != this.actionAdd) {
      this.customerIDOld = this.deal?.customerID;
      this.customerID = this.deal?.customerID;
    }
    if (this.action === this.actionCopy) {
      this.deal.owner = null;
      this.deal.salespersonID = null;
      this.oldIdInstance = this.deal.refID;
    }
    if (this.action === this.actionAdd) {
      this.currencyIDDefault = dt?.data?.currencyIDDefault;
      this.deal.currencyID = this.currencyIDDefault;
    }
  }

  onInit(): void {}

  ngAfterViewInit(): void {
    if (this.action == 'add') {
      this.tabInfo = [this.menuGeneralInfo, this.menuGeneralContact];
      this.tabContent = [
        this.tabGeneralInfoDetail,
        this.tabGeneralContactDetail,
      ];
    }
  }

  valueChange($event) {
    if ($event) {
      this.deal[$event.field] = $event.data;

      if ($event.field == 'customerID') {
        this.customerID = $event?.data ? $event.data : null;
        if (this.customerID) {
          this.customerOld = this.customerID;
          this.deal.customerID = this.customerID;
          this.customerName = $event.component?.itemsSelected[0]?.CustomerName;
          if (!this.deal.dealName?.trim()) {
            this.deal.dealName = this.customerName;
          }
          this.getListContactByObjectID(this.customerID);
        }
      }
      if ($event.field == 'currencyID') {
        this.loadExchangeRate();
      }
    }
  }
  contactEvent(e) {
    if (e.data) {
      var findIndex = this.lstContactDeal.findIndex(
        (x) => x.recID == e.data?.recID
      );
      if (e.action == 'edit') {
        if (findIndex != -1) {
          var isDefault = this.lstContactDeal[findIndex]?.isDefault;
          var role = this.lstContactDeal[findIndex]?.role;
          this.lstContactDeal[findIndex] = JSON.parse(JSON.stringify(e.data));
          this.lstContactDeal[findIndex] = JSON.parse(JSON.stringify(e.data));
          this.lstContactDeal[findIndex].isDefault = isDefault;
          this.lstContactDeal[findIndex].role = role;
        }
      } else {
        this.lstContactDelete.push(Object.assign({}, e?.data));
        if (findIndex != -1) {
          this.lstContactDeal.splice(findIndex, 1);
        }
      }
      this.changeDetectorRef.detectChanges();
    }
  }
  lstContactEmit(e) {
    this.lstContactDeal = e;
    // if (!this.isCheckContact) this.isCheckContact = true;
  }

  lstContactDeleteEmit(e) {
    this.lstContactDelete = e;
  }

  objectConvertDeal(e) {
    if (e.e == true) {
      if (e.data) {
        var tmp = new CM_Contacts();
        tmp = JSON.parse(JSON.stringify(e.data));
        tmp.recID = Util.uid();
        tmp.refID = e.data.recID;
        tmp.objectType = '4';
        tmp.isDefault = false;
        var indexCus = this.lstContactCustomer.findIndex(
          (x) => x.recID == e.data.recID
        );

        if (!this.lstContactDeal.some((x) => x.refID == e?.data?.recID)) {
          this.lstContactDeal.push(tmp);
          this.loadContactDeal.loadListContact(this.lstContactDeal);
        }
        if (indexCus != -1) {
          this.lstContactCustomer[indexCus].checked = true;
        }
        if (tmp.objectType) this.popupEditRoleDeal(tmp, e.data);
      }
    } else {
      var index = this.lstContactDeal.findIndex(
        (x) => x.refID == e?.data?.recID
      );
      if (index != -1) {
        this.lstContactDeal.splice(index, 1);
        this.loadContactDeal.loadListContact(this.lstContactDeal);
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  popupEditRoleDeal(tmp, data) {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CMContacts';
    dataModel.gridViewName = 'grvCMContacts';
    dataModel.entityName = 'CM_Contacts';
    dataModel.funcID = 'CM0102';
    var title = '';
    opt.FormModel = dataModel;
    this.cache
      .moreFunction(dataModel.formName, dataModel.gridViewName)
      .subscribe((fun) => {
        if (fun && fun.length) {
          let m = fun.find((x) => x.functionID == 'CM0102_4');
          if (m) title = m.defaultName;
        }
        this.cache
          .gridViewSetup(dataModel.formName, dataModel.gridViewName)
          .subscribe((res) => {
            var obj = {
              moreFuncName: title ?? 'Cập nhật vai trò',
              action: 'editRole',
              dataContact: data,
              type: 'formAdd',
              recIDCm: this.deal?.recID,
              objectType: '4',
              objectName: this.deal?.dealName,
              gridViewSetup: res,
              listContacts: this.lstContactDeal,
              customerID: null,
            };
            var dialog = this.callfc.openForm(
              PopupQuickaddContactComponent,
              '',
              500,
              250,
              '',
              obj,
              '',
              opt
            );
            dialog.closed.subscribe((e) => {
              if (e && e?.event) {
                if (e.event?.recID) {
                  var index = this.lstContactDeal.findIndex(
                    (x) => x.recID != e.event?.recID && x.isDefault
                  );
                  if (index != -1) {
                    if (e?.event?.isDefault) {
                      this.lstContactDeal[index].isDefault = false;
                    }
                  }
                  tmp.isDefault = e?.event?.isDefault;
                  tmp.role = e?.event?.role;
                }
              }
            });
          });
      });
  }

  getListContactByObjectID(objectID) {
    this.codxCmService.getListContactByObjectID(objectID).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstContactCustomer =
          this.codxCmService.bringDefaultContactToFront(res);
      } else {
        this.lstContactCustomer = [];
      }

      if (
        this.action === this.actionEdit &&
        this.deal.customerID === this.customerIDOld
      ) {
        this.lstContactDeal = this.lstContactOld;
      } else {
        this.lstContactDeal = [];
      }
    });
  }

  getListContactByDealID(objectID) {
    this.codxCmService.getListContactByObjectID(objectID).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstContactDeal = res;

        if (this.action === this.actionEdit && this.isLoad) {
          this.lstContactOld = JSON.parse(JSON.stringify(res));
          this.isLoad = false;
        }
      }
    });
  }

  valueChangeDate($event) {
    if ($event) {
      this.deal[$event.field] = $event.data.fromDate;
    }
  }

  saveOpportunity() {
    if (!this.isBlock) return;
    if (!this.deal?.businessLineID) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['BusinessLineID']?.headerText + '"'
      );
      return;
    }
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
    if (!this.deal?.owner) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['SalespersonID']?.headerText + '"'
      );
      return;
    }
    if (this.checkEndDayInstance(this.deal?.endDate, this.dateMax)) {
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
    this.convertDataInstance(this.deal, this.instance);
    this.updateDateDeal(this.instance, this.deal);
    this.executeSaveData();
  }

  async executeSaveData() {
    try {
      if (this.isLoading) {
        if (this.action !== this.actionEdit) {
          await this.addDealForDP();
          await this.insertInstance();
        } else {
          await this.editDealForDP();
          await this.editInstance();
        }
      } else {
        if (this.action !== this.actionEdit) {
          await this.insertInstance();
          await this.onAdd();
        } else {
          await this.editInstance();
          await this.onEdit();
        }
      }
    } catch (error) {}
  }

  cbxChange($event, field) {
    if ($event) {
      this.deal[field] = $event;
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
    if ($event) {
      this.owner = $event;
      this.deal.owner = this.owner;
      let ownerName = '';
      if (this.listParticipants.length > 0 && this.listParticipants) {
        ownerName = this.listParticipants.filter(
          (x) => x.userID === this.deal.owner
        )[0].userName;
      }
      this.checkOwner(this.deal.owner,ownerName);
    }
  }
  checkOwner(owner: any, ownerName: any) {
    if (owner && this.deal?.permissions ) {
      let index  = -1;
      if(this.deal?.permissions.length > 0 && this.deal?.permissions) {
        index = this.deal?.permissions.findIndex(
          (x) => x.objectType == '1' && x.roleType === 'O' && x.memberType == '1'
        );
        if (index !== -1 ) {
          this.deal.permissions[index].objectID = owner;
          this.deal.permissions[index].objectName = ownerName;
        }
      }
      index == -1 && this.addOwner(owner,ownerName);
    }
  }
  addOwner(owner,ownerName) {
    var permission = new CM_Permissions();
    permission.objectID = owner;
    permission.objectName = ownerName;
    permission.objectType = '1';
    permission.roleType = 'O';
    permission.full = true;
    permission.read = true;
    permission.update = true;
    permission.assign = true;
    permission.delete = true;
    permission.upload = true;
    permission.download = true;
    permission.isActive = true;
    permission.memberType = '1';
    permission.allowPermit = true;
    permission.allowUpdateStatus = '1';
    this.deal.permissions.push(permission);
  }
  valueChangeBusinessLine($event) {
    if ($event && $event.data) {
      this.deal.businessLineID = $event.data;
      if (this.deal.businessLineID && this.action !== this.actionEdit) {
        if (
          !$event.component?.itemsSelected[0]?.ProcessID &&
          !this.processIdDefault
        ) {
          this.getParamatersProcessDefault();
        } else {
          var processId =
            !$event.component.itemsSelected[0].ProcessID &&
            this.processIdDefault
              ? this.processIdDefault
              : $event.component.itemsSelected[0].ProcessID;
          if (processId) {
            this.deal.processID = processId;
            var result = this.checkProcessInList(processId);
            if (result) {
              this.listParticipants = null;
              this.listInstanceSteps = result?.steps;
              this.listParticipants = JSON.parse(
                JSON.stringify(result?.permissions)
              );
              this.deal.dealID = result?.dealId;
              this.deal.endDate = this.HandleEndDate(
                this.listInstanceSteps,
                this.action,
                this.action !== this.actionEdit ? null:  this.deal.createdOn
              );
              this.itemTabs(this.ischeckFields(this.listInstanceSteps));
              if (this.listParticipants.length > 0 && this.listParticipants) {
                var index = this.listParticipants.findIndex(
                  (x) => x.userID === this.user.userID
                );
                if (index != -1) {
                  this.owner = this.user.userID;
                } else {
                  this.owner = null;
                }
              }
              this.changeDetectorRef.detectChanges();
            } else {
              this.getListInstanceSteps(processId);
            }
          }
        }
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  async executeGetDataParamter() {
    await this.getParamatersProcessDefault();
  }

  async onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res) {
          this.dialog.close(res.save[0]);
        } else this.dialog.close();
      });
  }
  async onEdit() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.update) {
          this.dialog.close(res.update[0]);
        }
      });
  }
  beforeSave(option: RequestOption) {
    var datas = [];
    if (this.action !== this.actionEdit) {
      datas = [this.deal, this.lstContactDeal];
    } else {
      datas = [
        this.deal,
        this.customerIDOld,
        this.lstContactDeal,
        this.lstContactDelete,
      ];
    }

    option.methodName =
      this.action !== this.actionEdit ? 'AddDealAsync' : 'EditDealAsync';
    option.className = 'DealsBusiness';
    option.data = datas;
    option.service = 'CM';
    return true;
  }

  async executeApiCalls() {
    try {
      this.isLoading &&
        (await this.getGridViewSetup(
          this.formModel.formName,
          this.formModel.gridViewName
        ));
      if (this.action !== this.actionAdd) {
        await this.getListInstanceSteps(this.deal.processID);
      }
      if (this.action === this.actionEdit) {
        await this.getListContactByDealID(this.deal.recID);
      }
      if (
        this.action === this.actionAdd &&
        this.deal.processID &&
        this.isViewAll
      ) {
        await this.getBusinessLineByProcessID(this.deal.processID);
      }
    } catch (error) {}
  }
  async getParamatersProcessDefault() {
    this.codxCmService.getListProcessDefault(['1']).subscribe((res) => {
      if (res) {
        this.processIdDefault = res.recID;
        this.deal.processID = this.processIdDefault;
        this.getListInstanceSteps(this.processIdDefault);
      }
    });
  }

  async getGridViewSetup(formName, gridViewName) {
    this.cache.gridViewSetup(formName, gridViewName).subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }

  async getBusinessLineByProcessID(processID) {
    this.codxCmService
      .getIdBusinessLineByProcessID([processID])
      .subscribe((res) => {
        if (res) {
          this.deal.businessLineID = res;
          if (this.deal.businessLineID && this.action !== this.actionEdit) {
            if (this.deal.processID) {
              var result = this.checkProcessInList(this.deal.processID);
              if (result) {
                this.listInstanceSteps = result?.steps;
                this.listParticipants = result?.permissions;
                this.deal.dealID = result?.dealId;
                this.deal.endDate = this.HandleEndDate(
                  this.listInstanceSteps,
                  this.action,
                  this.action !== this.actionEdit ? null:  this.deal.createdOn
                );
                this.itemTabs(this.ischeckFields(this.listInstanceSteps));
                this.changeDetectorRef.detectChanges();
              } else {
                this.getListInstanceSteps(this.deal.processID);
              }
            }
          }
        }
      });
  }
  async getListInstanceSteps(processId: any) {
      var data = [processId, this.deal?.refID, this.action, '1'];
    this.codxCmService.getInstanceSteps(data).subscribe(async (res) => {
      if (res && res.length > 0) {
        var obj = {
          id: processId,
          steps: res[0],
          permissions: await this.getListPermission(res[1]),
          dealId: this.action !== this.actionEdit ? res[2] : this.deal.dealID,
        };
        var isExist = this.listMemorySteps.some((x) => x.id === processId);
        if (!isExist) {
          this.listMemorySteps.push(obj);
        }
        this.listInstanceSteps = res[0];
        this.itemTabs(this.ischeckFields(this.listInstanceSteps));
        this.listParticipants = null;
        this.listParticipants = JSON.parse(JSON.stringify(obj.permissions));
        if (this.action === this.actionEdit) {
          this.owner = this.deal.owner;
        } else {
          this.deal.endDate = this.HandleEndDate(
            this.listInstanceSteps,
            this.action,
            this.action != this.actionEdit ? null : this.deal.createdOn
          );
          if(this.listParticipants.length > 0 && this.listParticipants) {
            var index = this.listParticipants.findIndex(x=>x.userID ===  this.user.userID);
            this.owner = index != -1 ?this.user.userID: null;
          }
          this.deal.dealID = res[2];
        }
        this.dateMax = this.HandleEndDate(
          this.listInstanceSteps,
          this.action,
          this.action != this.actionEdit ? null : this.deal.createdOn
        );
        this.changeDetectorRef.detectChanges();
      }
    });
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

  async addDealForDP() {
    var datas = [this.deal, this.lstContactDeal];
    this.codxCmService.addDeal(datas).subscribe((deal) => {
      if (deal) {
      }
    });
  }
  async editDealForDP() {
    var datas = [
      this.deal,
      this.customerIDOld,
      this.lstContactDeal,
      this.lstContactAdd,
      this.lstContactDelete,
    ];
    this.codxCmService.editDeal(datas).subscribe((deal) => {
      if (deal) {
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
    if (this.action !== this.actionEdit) {
      instance.startDate = null;
      instance.status = '1';
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
      deal.startDate = null;
    }
    deal.owner = this.owner;
    deal.salespersonID = this.owner;
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
    var dateNow = action == 'add' || action == 'copy' ? new Date() : new Date(endDateValue);
    var endDate =action == 'add' || action == 'copy' ? new Date() : new Date(endDateValue);
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

  isRequired(field: string) {
    return this.gridViewSetup[field]?.h;
  }

  // --------------------------lOad Tabs ----------------------- //
  itemTabs(check: boolean): void {
    if (check) {
      this.tabInfo = [
        this.menuGeneralInfo,
        this.menuGeneralContact,
        this.menuInputInfo,
      ];
      this.tabContent = [
        this.tabGeneralInfoDetail,
        this.tabGeneralContactDetail,
        this.tabCustomFieldDetail,
      ];
    } else {
      this.tabInfo = [this.menuGeneralInfo, this.menuGeneralContact];
      this.tabContent = [
        this.tabGeneralInfoDetail,
        this.tabGeneralContactDetail,
      ];
    }
  }
  ischeckFields(steps: any): boolean {
    if (steps?.length > 0) {
      if (this.action != 'edit') {
        if (steps[0].fields?.length > 0) return true;
        return false;
      }
      let check = false;
      this.idxCrr = steps.findIndex((x) => x.stepID == this.deal.stepID);
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

  setTitle(e: any) {
    this.title = this.titleAction;
    this.changeDetectorRef.detectChanges();
  }

  covnertListContact(listOld, listNew) {
    if (this.deal.customerID === this.customerIDOld) {
      const setOld = new Set(listOld.map((item) => item.contactID));
      const setNew = new Set(listNew.map((item) => item.contactID));
      const list1 = listOld.filter((item) => !setNew.has(item.contactID));
      const list2 = listNew.filter((item) => !setOld.has(item.contactID));
      const list3 = listNew.filter((item) => setOld.has(item.contactID));
      this.lstContactDelete = list1;
      this.lstContactAdd = list2;
      this.lstContactDeal = list3;
    } else {
      this.lstContactDelete = this.lstContactOld;
    }
  }

  contactEventDeal(e) {
    if (e.data) {
      var findIndex = this.lstContactCustomer.findIndex(
        (x) => x.recID == e.data?.refID
      );
      if (e.action == 'edit') {
        if (findIndex != -1) {
          var isDefault = this.lstContactCustomer[findIndex].isDefault;
          this.lstContactCustomer[findIndex] = JSON.parse(
            JSON.stringify(e.data)
          );
          this.lstContactCustomer[findIndex].recID = e.data.refID;
          this.lstContactCustomer[findIndex].role = null;
          this.lstContactCustomer[findIndex].isDefault = isDefault;
          this.loadContactDeal.loadListContact(this.lstContactCustomer);
        }
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  loadExchangeRate() {
    let day = this.deal.createdOn ?? new Date();
    if (this.deal.currencyID) {
      this.codxCmService
        .getExchangeRate(this.deal.currencyID, day)
        .subscribe((res) => {
          let exchangeRateNew = res?.exchRate ?? 0;
          if (exchangeRateNew == 0) {
            this.notificationsService.notify(
              'Tỷ giá tiền tệ "' +
                this.deal.currencyID +
                '" chưa thiết lập xin hay chọn lại !',
              '3'
            );
            this.form.formGroup.patchValue(this.deal);
            return;
          } else {
            this.deal.exchangeRate = exchangeRateNew;
          }
        });
    }
  }
  valueTagChange(e) {
    this.deal.tags = e.data;
  }
  addFileCompleted(e) {
    this.isBlock = e;
  }
}
