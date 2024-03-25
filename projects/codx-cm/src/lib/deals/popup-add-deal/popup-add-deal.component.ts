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
  NotificationsService,
  AuthStore,
  UIComponent,
  RequestOption,
  Util,
  CodxInputComponent,
  CodxFormComponent,
  TenantStore,
} from 'codx-core';
import {
  CM_Contacts,
  CM_CostItems,
  CM_Deals,
  CM_Permissions,
} from '../../models/cm_model';
import { CodxCmService } from '../../codx-cm.service';
import { tmpInstances } from '../../models/tmpModel';
import { CodxListContactsComponent } from '../../cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { CustomFieldService } from 'projects/codx-dp/src/lib/share-crm/codx-input-custom-field/custom-field.service';

@Component({
  selector: 'lib-popup-add-deal',
  templateUrl: './popup-add-deal.component.html',
  styleUrls: ['./popup-add-deal.component.scss'],
})
export class PopupAddDealComponent
  extends UIComponent
  implements OnInit, AfterViewInit {
  // view child
  @ViewChild('tabGeneralInfoDetail') tabGeneralInfoDetail: TemplateRef<any>;
  @ViewChild('tabCostItems') tabCostItems: TemplateRef<any>;
  @ViewChild('tabCustomFieldDetail')
  tabCustomFieldDetail: TemplateRef<any>;
  @ViewChild('tabGeneralContactDetail')
  tabGeneralContactDetail: TemplateRef<any>;
  @ViewChild('loadContactDeal') loadContactDeal: CodxListContactsComponent;
  CodxListContactsComponent;
  @ViewChild('formlayoutadd') form: CodxFormComponent;
  @ViewChild('cbxOwner') cbxOwner: CodxInputComponent;
  @ViewChild('inputChannelID') inputChannelID: CodxInputComponent;
  // setting values in system
  dialog: DialogRef;
  //type any
  formModel: FormModel;
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
  lstContactCustomer: any[] = [];
  lstContactDeal: any[] = [];
  lstContactDelete: any[] = [];
  lstContactAdd: any[] = [];
  lstContactOld: any[] = [];
  listInstanceSteps: any[] = [];
  listFields: any[];

  // const
  readonly actionAdd: string = 'add';
  readonly actionCopy: string = 'copy';
  readonly actionEdit: string = 'edit';
  readonly typeForDeal: string = '1';
  readonly fieldCbxParticipants = { text: 'userName', value: 'userID' };
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE
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

  menuInputInfo = {
    icon: 'icon-reorder',
    text: 'Thông tin mở rộng',
    name: 'InputInfo',
    subName: 'Input information',
    subText: 'Input information',
  };

  menuCostItems = {
    icon: 'icon-u_dollar-sign-alt',
    text: 'Chi phí ',
    name: 'CostItems',
    subName: 'Opportunity Cost',
    subText: 'Opportunity Cost',
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
  // idxCrr: any = -1;
  instanceRes: any;
  instanceReason: any;
  dateMessage: any;
  dateMax: any;
  paramView: any;
  customerIDOld: any;
  instanceSteps: any;
  model: any;
  customerName: any;
  functionModule: any;
  customerView: any;
  // model of DP
  instance: tmpInstances = new tmpInstances();

  customerID: string = '';
  customerOld: string;
  isLoad: boolean = true;
  isViewAll: boolean = false;
  isViewContact: boolean = false;

  processIdDefault: string = '';
  defaultDeal: string = '';
  customerCategory: string = '';
  recIdMove: string = '';

  // load data form DP
  isLoading: boolean = false;
  isBlock: boolean = true;
  isviewCustomer: boolean = false;
  isShowField: boolean = false;
  isShowReasonDP: boolean = false;
  isTurnOnProcess: boolean = true;
  isSave: boolean = true;
  currencyIDOld: string;
  autoNameTabFields: string;
  bussineLineNameTmp: string = '';
  customerNameTmp: string = '';
  shortNameTmp: string = '';
  planceHolderAutoNumber: string = '';

  arrCaculateField: any[] = [];
  isLoadedCF = false;
  costInfos: any;
  totalCost = 0;
  grViewCost: any;
  tmpCost: CM_CostItems;
  viewOnly = false;
  cost: any;
  copyTransID: any; //copy transID cost
  tenant = '';

  constructor(
    private inject: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private codxCmService: CodxCmService,
    private customFieldSV: CustomFieldService,
    private tenantStore: TenantStore,
    private routerLink: Router,
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
    this.copyTransID = dt?.data?.copyTransID;
    // this.tenant = this.tenantStore.get().tenant;
    const currentUrl = this.routerLink.url;
    this.tenant = 'qtsc';
    // this.tenant = currentUrl.includes("qtsc") ? "qtsc" : "";

    // add view from customer
    this.isviewCustomer = dt?.data?.isviewCustomer;
    this.customerView = dt?.data?.customerView;
    this.viewOnly = this.action == 'view';

    if (this.isLoading) {
      this.formModel = dt?.data?.formMD;
      if (this.action != this.actionAdd) {
        this.deal = dt?.data?.dataCM;
        //       this.owner = this.deal.owner;
        this.customerCategory = dt?.data?.dataCM?.customerCategory;
      }
      this.instanceReason = dt?.data?.instanceReason;
      if (this.instanceReason) {
        this.deal.dealName = this.instanceReason?.title;
        this.deal.owner = this.instanceReason?.ownerMove;
        this.deal.salespersonID = this.instanceReason?.ownerMove;
        this.owner = this.instanceReason?.ownerMove;
        this.recIdMove = this.instanceReason?.recID;
        this.isShowReasonDP = true;
        //  this.deal.processID = this.instanceReason?.processMove;
      }
    } else {
      this.deal =
        this.action != this.actionAdd
          ? JSON.parse(JSON.stringify(dialog.dataService.dataSelected))
          : this.deal;
      this.customerCategory = dt?.data?.customerCategory;

      if (this.action === this.actionAdd) {
        this.deal.exchangeRate = dt?.data?.exchangeRateDefault;
        this.deal.currencyID = dt?.data?.currencyIDDefault;
      }
    }
    this.isviewCustomer && this.copyDataCustomer(this.deal, this.customerView);
    if (dt?.data?.processID) {
      this.deal.processID = dt?.data?.processID;
      this.isViewAll = true;
    }
    if (this.action != this.actionAdd) {
      this.customerIDOld = this.deal?.customerID;
      this.customerID = this.deal?.customerID;
      let transIDCost =
        this.action === this.actionCopy ? this.copyTransID : this.deal.recID;
      this.codxCmService
        .getCostItemsByTransID(transIDCost)
        .subscribe((costs) => {
          if (costs?.length > 0) {
            if (this.action === this.actionCopy)
              costs.forEach((x) => (x.transID = this.deal.recID));
            // this.calculateTotalCost(); //cux
          }
          this.costInfos = costs ?? [];
        });
    } else {
      this.costInfos = [];
    }
    if (this.action === this.actionCopy) {
      this.deal.applyProcess =
        this.deal.processID && this.deal.processID !== this.guidEmpty;
      this.deal.owner = this.deal.applyProcess ? null : this.deal.owner;
      this.deal.salespersonID = null;
      this.oldIdInstance = this.deal.refID;
      this.deal.permissions = this.deal?.permissions.filter(
        (x) => x.memberType != '2'
      );
    }
    this.executeApiCalls();
  }

  onInit(): void { }

  async ngAfterViewInit(): Promise<void> {
    if (this.tenant == 'qtsc') {
      this.tabInfo = [this.menuGeneralInfo];
      this.tabContent = [this.tabGeneralInfoDetail];
    } else {
      this.tabInfo = [this.menuGeneralInfo, this.menuCostItems];
      this.tabContent = [this.tabGeneralInfoDetail, this.tabCostItems];
    }

    if (this.action !== this.actionAdd || this.isviewCustomer) {
      if (this.isviewCustomer) {
        this.customerCategory = this.customerView?.category;
      }
      this.customerID = this.deal?.customerID;
      this.itemTabContact(this.ischeckCategoryCustomer(this.customerCategory));
      this.getListContactByObjectID(this.customerID);
      this.isviewCustomer && (await this.getContactDefault(this.customerID));
    }
    if (!this.deal.applyProcess) {
      this.owner = this.deal.owner;
    }
  }

  async getContactDefault(customerID) {
    let res = await firstValueFrom(
      this.codxCmService.getContactByObjectID(customerID)
    );
    if (res) {
      let contact = new CM_Contacts();
      contact.refID = res.recID;
      contact.recID = Util.uid();
      contact.objectID = this.deal.recID;
      contact.objectName = this.deal.dealName;
      contact.objectType = '4';
      contact.isDefault = true;
      contact.contactType = res.ContactType;
      contact.contactName = res.contactName;
      contact.jobTitle = res.jobTitle;
      contact.mobile = res.mobile;
      contact.personalEmail = res.personalEmail;
      contact.role = res.role;
      contact.createdBy = this.user.userId;
      contact.createdOn = new Date();

      setTimeout(() => {
        if (this.loadContactDeal && this.loadContactDeal?.loaded) {
          this.lstContactDeal.push(res);
          this.loadContactDeal.loadListContact(this.lstContactDeal);
        }
      }, 1000);
    }
  }

  copyDataCustomer(deal: any, data: any) {
    deal.customerID = data?.customerID;
    deal.dealName = data?.shortName ? data?.shortName : data?.dealName;
    deal.industries = data?.industries;
    deal.channelID = data?.channelID;
    deal.shortName = data?.shortName;
    deal.customerName = data?.dealName;
    this.customerCategory = data?.category;
    deal.customerCategory = this.customerCategory;
    this.customerNameTmp = data?.dealName;
    this.shortNameTmp = data?.shortName;

    //this.itemTabContact(this.ischeckCategoryCustomer(this.categoryCustomer));
  }

  //get autoname tab fields
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
  //end

  valueChange($event) {
    if ($event) {
      this.deal[$event.field] = $event.data;
      if ($event.field === 'customerID') {
        this.lstContactDeal = [];
        this.lstContactDelete = [];
        this.customerID = $event?.data ? $event.data : null;
        if (this.customerID) {
          this.customerOld = this.customerID;
          this.deal.customerID = this.customerID;
          this.customerName = $event.component?.itemsSelected[0]?.CustomerName;
          this.customerNameTmp = this.customerName?.trim();
          this.deal.industries = $event.component?.itemsSelected[0]?.Industries;
          this.deal.shortName = $event.component?.itemsSelected[0]?.ShortName;
          this.inputChannelID.crrValue = null;
          this.inputChannelID.ComponentCurrent.dataService.data = [];
          this.deal.channelID = $event.component?.itemsSelected[0]?.ChannelID;
          this.deal.customerName =
            $event.component?.itemsSelected[0]?.CustomerName;
          this.deal.customerCategory =
            $event.component?.itemsSelected[0]?.Category;
          this.shortNameTmp = this.deal?.shortName?.trim();

          if (this.bussineLineNameTmp?.trim()) {
            this.deal.dealName =
              (this.shortNameTmp ? this.shortNameTmp : this.customerNameTmp) +
              ' mua ' +
              this.bussineLineNameTmp?.trim();
          } else if (!this.deal.dealName?.trim()) {
            this.deal.dealName = this.customerNameTmp;
          }
          this.getListContactByObjectID(this.customerID);
          this.form.formGroup.patchValue(this.deal);
        }
        this.itemTabContact(
          this.ischeckCategoryCustomer(
            $event.component.itemsSelected[0].Category
          )
        );
      }
      // if ($event.field === 'currencyID') {
      //   this.loadExchangeRate();
      // }
      if ($event.field === 'consultantID') {
        if ($event.data) {
          this.searchOwner(
            'U',
            'C',
            '0',
            this.deal.consultantID,
            $event?.component?.itemsSelected[0]?.UserName
          );
        } else if ($event.data === null || $event.data === '') {
          this.deleteOwner('U', 'C', '0', this.deal.consultantID, $event.field);
        }
      }
      // //lãi gộp
      // if ($event.field == 'dealValueTo') {
      //   if (this.deal.dealValueTo) {
      //     this.deal['grossProfit'] = this.deal.dealValueTo - this.totalCost;
      //   } else {
      //     this.deal['grossProfit'] = 0 - this.totalCost;
      //   }
      // }
    }
  }

  // valueChangeOwner($event) {
  //   if ($event ) {
  //     this.owner = $event;
  //     let ownerName = '';
  //     if (this.listParticipants.length > 0 && this.listParticipants) {
  //       ownerName = this.listParticipants.filter(
  //         (x) => x.userID === this.owner
  //       )[0]?.userName;
  //     }
  //     this.searchOwner('1', 'O', '0', this.owner, ownerName);
  //   } else if ($event === null || $event === '') {
  //     this.deleteOwner('1', 'O', '0', this.deal.owner, 'owner');
  //   }
  // }
  async valueChangeOwner($event, view) {
    if (!this.deal?.businessLineID) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['BusinessLineID']?.headerText + '"'
      );
      this.owner = null;
      return;
    }
    if (view === this.viewOwnerDefault) {
      if ($event?.data && $event?.data !== '') {
        let ownerName = '';
        this.owner = $event?.data;
        ownerName = $event?.component?.itemsSelected[0]?.UserName;
        this.searchOwner('1', 'O', '0', this.owner, ownerName);
      } else if ($event === null || $event === '' || $event === '') {
        this.deleteOwner('1', 'O', '0', this.deal.owner, 'owner');
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
        this.deleteOwner('1', 'O', '0', this.deal.owner, 'owner');
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
    if (this.deal?.permissions && this.deal?.permissions.length > 0) {
      let index = this.deal?.permissions?.findIndex(
        (x) =>
          x.objectType == objectType &&
          x.roleType === roleType &&
          x.memberType == memberType &&
          x.objectID === owner
      );
      if (index != -1) {
        if (field === 'owner') {
          this.owner = null;
        } else if (field === 'consultantID') {
          this.deal.consultantID = null;
        }
        this.deal?.permissions.splice(index, 1);
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
    let index = -1;
    if (this.deal?.permissions?.length > 0 && this.deal?.permissions) {
      index = this.deal?.permissions.findIndex(
        (x) =>
          x.objectType == objectType &&
          x.roleType === roleType &&
          x.memberType == memberType
      );
      if (index != -1) {
        this.deal.permissions[index].objectID = owner;
        this.deal.permissions[index].objectName = ownerName;
        if (this.action == this.actionEdit) {
          this.deal.permissions[index].modifiedBy = this.user.userID;
          this.deal.permissions[index].modifiedOn = new Date();
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
    this.deal.permissions = this.deal?.permissions
      ? this.deal?.permissions
      : [];
    this.deal.permissions.push(permission);
  }
  addPermission(permissionDP) {
    if (permissionDP && permissionDP?.length > 0) {
      this.deal.permissions = this.deal?.permissions
        ? this.deal.permissions
        : [];
      for (let item of permissionDP) {
        this.deal.permissions.push(this.copyPermission(item));
      }
    }
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

  saveDeal() {
    if (!this.checkValidateCost()) {
      this.notificationsService.notify(
        'Chưa hoàn thiện nội dung chi phí, hãy hoàn thiện để tiếp tục !',
        '3'
      );
      return;
    }

    if (!this.deal?.businessLineID) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['BusinessLineID']?.headerText + '"'
      );
      return;
    }
    if (
      this.deal?.processID &&
      !this.deal.businessLineID &&
      this.deal.applyProcess
    ) {
      this.notificationsService.notifyCode(
        'Quy trình chưa được thiết lập sản phẩm'
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
    // if (!this.deal?.owner) {
    //   this.notificationsService.notifyCode(
    //     'SYS009',
    //     0,
    //     '"' + this.gridViewSetup['SalespersonID']?.headerText + '"'
    //   );
    //   return;
    // }
    // if (this.checkEndDayInstance(this.deal?.endDate, this.dateMax)) {
    //   this.notificationsService.notifyCode(
    //     'DP032',
    //     0,
    //     '"' + this.gridViewSetup['EndDate']?.headerText + '"',
    //     '"' + this.dateMessage + '"'
    //   );
    //   return;
    // }
    if (this.deal.applyProcess) {
      let ischeck = true;
      let ischeckFormat = true;
      let title = '';
      let messageCheckFormat = '';

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
    }
    this.deal.owner = this.owner;
    this.deal.salespersonID = this.owner;
    this.deal.applyProcess &&
      this.convertDataInstance(this.deal, this.instance);
    this.deal.applyProcess && this.updateDateDeal(this.instance, this.deal);
    if (!this.isSave) return;
    this.executeSaveData();
  }

  async executeSaveData() {
    this.isSave = false;
    if (this.deal.applyProcess) {
      if (this.action !== this.actionEdit) {
        await this.insertInstance();
      } else {
        await this.editInstance();
      }
    } else {
      if (this.action !== this.actionEdit) {
        await this.onAdd();
      } else {
        await this.onEdit();
      }
    }
  }

  cbxChange($event, field) {
    if ($event) {
      this.deal[field] = $event;
    }
  }
  valueChangeCustom(event) {
    //bo event.e vì nhan dc gia trị null
    if (event && event.data) {
      var result = event.e;
      var field = event.data;

      if (field.dataType == 'C') {
        let type = event?.type ?? '';
        let contact = event?.result ?? '';
        this.convertToFieldDp(contact, type);
      }

      // let result = event.e?.data;
      // let field = event.data;
      // switch (field.dataType) {
      //   case 'D':
      //     result = event.e?.data.fromDate;
      //     break;
      //   case 'P':
      //   case 'R':
      //   case 'A':
      //   case 'L':
      //   case 'TA':
      //   case 'PA':
      //     result = event?.e;
      //     break;
      //   case 'C':
      //     result = event?.e;
      //     let type = event?.type ?? '';
      //     let contact = event?.result ?? '';
      //     this.convertToFieldDp(contact, type);
      //     break;
      // }
      let index = this.listInstanceSteps.findIndex(
        (x) => x.recID == field.stepID
      );
      if (index != -1) {
        if (this.listInstanceSteps[index].fields?.length > 0) {
          let idxField = this.listInstanceSteps[index].fields.findIndex(
            (x) => x.recID == event.data.recID
          );
          if (idxField != -1) {
            let valueOld =
              this.listInstanceSteps[index].fields[idxField].dataValue;
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
            if (field.dataType == 'N' && valueOld != result)
              this.caculateField();
          }
        }
      }
    }
  }

  //#region Convert contact to field DP
  convertToFieldDp(contact, type) {
    if (contact != null) {
      if (this.lstContactDeal != null && this.lstContactDeal.length > 0) {
        let index = -1;

        if (contact.refID != null && contact.refID?.trim() != '') {
          index = this.lstContactDeal.findIndex(
            (x) => x.refID == contact.refID
          );
        } else {
          index = this.lstContactDeal.findIndex(
            (x) => x.recID == contact.recID
          );
        }
        let idxDefault = -1;
        if (contact?.isDefault) {
          idxDefault = this.lstContactDeal.findIndex(
            (x) => x.isDefault && x.recID != contact.recID
          );
        }
        if (index != -1) {
          if (type != 'delete') {
            this.lstContactDeal[index] = contact;
          } else {
            this.lstContactDeal.splice(index, 1);
          }
        } else {
          if (type != 'delete') {
            this.lstContactDeal.push(Object.assign({}, contact));
          }
        }
        if (idxDefault != -1 && type != 'delete') {
          this.lstContactDeal[idxDefault].isDefault = false;
        }
      } else {
        if (type != 'delete') {
          let lst = [];
          lst.push(Object.assign({}, contact));
          this.lstContactDeal = lst;
        }
      }
      if (this.loadContactDeal) {
        this.loadContactDeal.loadListContact(this.lstContactDeal);
      }
      // this.lstContactDeal = JSON.parse(JSON.stringify(this.lstContactDeal));
      this.changeDetectorRef.detectChanges();
    }
  }

  lstContactEmit(e) {
    this.lstContactDeal =
      e != null && e?.length > 0 ? JSON.parse(JSON.stringify(e)) : [];
    this.changeDetectorRef.detectChanges();
    // if (!this.isCheckContact) this.isCheckContact = true;
  }

  lstContactDeleteEmit(e) {
    this.lstContactDelete = e;
  }

  //#endregion

  // Add permission form DP - FE
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
    permission.create = permissionDP.create;
    permission.memberType = '2'; // Data from DP
    permission.allowPermit = permissionDP.allowPermit;
    permission.allowUpdateStatus = permissionDP.allowUpdateStatus;
    permission.createdOn = new Date();
    permission.createdBy = this.user.userID;
    permission.isActive = true;
    return permission;
  }
  valueChangeBusinessLine($event) {
    if ($event && $event?.data) {
      this.deal.businessLineID = $event?.data;
      this.bussineLineNameTmp =
        $event?.component?.itemsSelected[0]?.BusinessLineName;
      if (this.customerNameTmp?.trim()) {
        this.deal.dealName =
          (this.shortNameTmp
            ? this.shortNameTmp?.trim()
            : this.customerNameTmp?.trim()) +
          ' mua ' +
          this.bussineLineNameTmp;
      }
      if (this.deal.businessLineID && this.action !== this.actionEdit) {
        // if (
        //   !$event.component?.itemsSelected[0]?.ProcessID &&
        //   !this.processIdDefault
        // ) {
        //   this.getParamatersProcessDefault();
        // } else {
        //   let processId =
        //     !$event.component.itemsSelected[0].ProcessID &&
        //     this.processIdDefault
        //       ? this.processIdDefault
        //       : $event.component.itemsSelected[0].ProcessID;
        //   if (processId) {
        //     this.deal.processID = processId;
        //     let result = this.checkProcessInList(processId);
        //     if (result) {
        //       this.listParticipants = [];
        //       this.listInstanceSteps = result?.steps;
        //       this.listParticipants = JSON.parse(
        //         JSON.stringify(result?.permissions)
        //       );
        //       this.deal.dealID = result?.dealId;
        //       this.deal.endDate = this.HandleEndDate(
        //         this.listInstanceSteps,
        //         this.action,
        //         this.action !== this.actionEdit ||
        //           (this.action === this.actionEdit &&
        //             (this.deal.status == '1' || this.deal.status == '15'))
        //           ? null
        //           : this.deal.createdOn
        //       );
        //       this.getSettingFields(result?.processSetting,this.listInstanceSteps)
        //       if (this.listParticipants && this.listParticipants?.length > 0 && !this.owner) {
        //         let index = this.listParticipants.findIndex(
        //           (x) => x.userID === this.user.userID
        //         );
        //         if (index != -1) {
        //           this.owner = this.user.userID;
        //         } else {
        //           this.owner = null;
        //         }
        //       }
        //     } else {
        //       this.getListInstanceSteps(processId);
        //     }
        //   }
        // }
        this.action =
          this.action === this.actionCopy ? this.actionAdd : this.action;
        let processId =
          !$event.component.itemsSelected[0].ProcessID && this.processIdDefault
            ? this.processIdDefault
            : $event.component.itemsSelected[0].ProcessID;
        this.listInstanceSteps = [];
        this.listParticipants = [];
        this.owner = null;
        this.deal.permissions =
          this.deal?.permissions && this.deal?.permissions?.length > 0
            ? this.deal?.permissions.filter(
              (x) => x.roleType != 'O' && x.objectType != '1'
            )
            : this.deal?.permissions;
        if (processId) {
          this.deal.applyProcess = true;
          this.deal.processID = processId;
          let result = this.checkProcessInList(processId);
          if (result) {
            this.listParticipants = [];
            this.listInstanceSteps = result?.steps;
            this.listParticipants = JSON.parse(
              JSON.stringify(result?.permissions)
            );
            this.deal.dealID = result?.dealId;
            this.deal.endDate = this.HandleEndDate(
              this.listInstanceSteps,
              this.action,
              this.action !== this.actionEdit ||
                (this.action === this.actionEdit &&
                  (this.deal.status == '1' || this.deal.status == '15'))
                ? null
                : this.deal.createdOn
            );
            this.getSettingFields(
              result?.processSetting,
              this.listInstanceSteps
            );
            if (
              this.listParticipants &&
              this.listParticipants?.length > 0 &&
              !this.owner
            ) {
              let index = this.listParticipants.findIndex(
                (x) => x.userID === this.user.userID
              );
              if (index != -1) {
                this.owner = this.user.userID;
              } else {
                this.owner = null;
              }
            }
          } else {
            this.getListInstanceSteps(processId);
          }
        } else {
          if (!this.isTurnOnProcess) {
            this.dealDefault();
          } else {
            this.getParamatersProcessDefault();
          }
        }
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  dealDefault() {
    this.deal.applyProcess = false;
    this.owner = this.user.userID;
    !this.planceHolderAutoNumber && this.getAutoNumber();
    this.itemTabsInput(this.ischeckFields(this.listInstanceSteps));
    this.searchOwner('1', 'O', '0', this.owner, this.user.userName);
  }

  // async executeGetDataParamter() {
  //   await this.getParamatersProcessDefault();
  // }

  onAdd() {
    if (this.isviewCustomer) {
      let datas = [this.deal, this.lstContactDeal];
      this.codxCmService.addDeal(datas).subscribe((deal) => {
        if (deal) {
          this.dialog.close(deal);
        }
      });
    } else {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option), 0)
        .subscribe((res) => {
          if (res) {
            this.dialog.close(res.save);
          } else this.dialog.close();
        });
    }
  }
  onAddInstance() {
    if (this.isShowReasonDP) {
      let data = [this.instance, this.listInstanceSteps, this.oldIdInstance];
      this.codxCmService.addInstance(data).subscribe((instance) => {
        if (instance) {
          this.instanceRes = instance;
          this.deal.status = instance.status;
          this.deal.datas = instance.datas;
          this.addPermission(instance?.permissions);
          let datas = [this.deal, this.lstContactDeal];
          this.codxCmService.addDeal(datas).subscribe((deal) => {
            if (deal) {
            }
          });
          if (this.recIdMove) {
            this.codxCmService
              .updateMoveProcess([this.recIdMove, this.deal?.processID])
              .subscribe((res) => {
                if (res) {
                }
              });
          }

          this.dialog.close();
        }
      });
    } else {
      this.dialog.dataService
        .save((option: any) => this.beforeSaveInstance(option))
        .subscribe((res) => {
          if (res && res.save) {
            this.deal.status = res?.save?.status;
            this.deal.datas = res?.save?.datas;
            this.addPermission(res?.save?.permissions);
            let datas = [this.deal, this.lstContactDeal];
            this.codxCmService.addDeal(datas).subscribe((deal) => {
              if (deal) {
              }
            });
            this.dialog.close(res?.save);
            this.changeDetectorRef.detectChanges();
          }
        });
    }
  }
  onUpdateInstance() {
    this.dialog.dataService
      .save((option: any) => this.beforeSaveInstance(option))
      .subscribe((res) => {
        if (res.update) {
          this.deal.status = res?.update?.status;
          this.deal.datas = res?.update?.datas;
          this.deal.permissions = this.deal?.permissions.filter(
            (x) => x.memberType != '2'
          );
          this.addPermission(res?.update?.permissions);
          let datas = [
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
          this.dialog.close(res?.update);
        }
      });
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
  onEdit() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.update) {
          this.dialog.close(res.update);
        } else {
          this.dialog.close();
        }
      });
  }
  beforeSave(option: RequestOption) {
    let datas = [];
    if (this.action !== this.actionEdit) {
      datas = [this.deal, this.lstContactDeal, this.costInfos];
    } else {
      datas = [
        this.deal,
        this.customerIDOld,
        this.lstContactDeal,
        this.lstContactDelete,
        this.costInfos,
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
    if (this.isLoading) {
      this.getGridViewSetup(
        this.formModel.formName,
        this.formModel.gridViewName
      );
    }

    this.cache
      .gridViewSetup('CMCostItems', 'grvCMCostItems')
      .subscribe((grvCost) => {
        if (grvCost) {
          this.grViewCost = Util.camelizekeyObj(grvCost);
        }
      });

    if (this.action == this.actionAdd) {
      this.loadExchangeRate();
    }
    if (this.action != this.actionAdd) {
      this.deal.applyProcess &&
        (await this.getListInstanceSteps(this.deal.processID));
      !this.deal.applyProcess && (await this.getAutoNumber());
    }

    if (this.action == this.actionEdit || this.action == 'view') {
      await this.getListContactByDealID(this.deal.recID);
    }
    if (
      this.action == this.actionAdd &&
      this.deal.processID &&
      this.isViewAll
    ) {
      await this.getBusinessLineByProcessID(this.deal.processID);
    }
  }
  async getParamatersProcessDefault() {
    let res = await firstValueFrom(
      this.codxCmService.getParam('CMParameters', '1')
    );
    if (res?.dataValue) {
      let dataValue = JSON.parse(res?.dataValue);
      this.isTurnOnProcess = dataValue?.ProcessDeal == '1';
      if (this.isTurnOnProcess) {
        this.codxCmService.getListProcessDefault(['1']).subscribe((res) => {
          if (res) {
            this.processIdDefault = res.recID;
            this.deal.processID = this.processIdDefault;
            this.deal.applyProcess = true;
            this.getListInstanceSteps(this.processIdDefault);
          }
        });
      } else {
        this.isTurnOnProcess = false;
        this.deal.applyProcess = false;
        this.dealDefault();
      }
    }
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
          this.deal.applyProcess = true;
          this.deal.businessLineID = res;
          if (!this.deal.businessLineID) {
            this.notificationsService.notifyCode(
              'Quy trình chưa được thiết lập sản phẩm'
            );
            return;
          }
          if (
            this.deal.businessLineID &&
            this.action != this.actionEdit &&
            this.action != 'view'
          ) {
            if (this.deal.processID) {
              let result = this.checkProcessInList(this.deal?.processID);
              if (result) {
                this.listInstanceSteps = result?.steps;
                this.listParticipants = result?.permissions;
                this.deal.dealID = result?.dealId;
                this.deal.endDate = this.HandleEndDate(
                  this.listInstanceSteps,
                  this.action,
                  this.action != this.actionEdit ||
                    (this.action === this.actionEdit &&
                      (this.deal?.status == '1' || this.deal?.status == '15'))
                    ? null
                    : this.deal.createdOn
                );
                this.getSettingFields(
                  result?.processSetting,
                  this.listInstanceSteps
                );
                this.changeDetectorRef.detectChanges();
              } else {
                this.getListInstanceSteps(this.deal.processID);
              }
            }
          }
        }
      });
  }
  getSettingFields(processSetting, listInstanceSteps) {
    this.isShowField = processSetting?.addFieldsControl == '1';
    this.setAutoNameTabFields(processSetting?.autoNameTabFields);
    this.itemTabsInput(this.ischeckFields(listInstanceSteps));
  }
  async getListInstanceSteps(processId: any) {
    //bùa vì code cũ của bảo
    let action = this.action == 'view' ? 'edit' : this.action;
    let data = [processId, this.deal?.refID, action, '1'];
    this.codxCmService.getInstanceSteps(data).subscribe(async (res) => {
      if (res && res.length > 0) {
        let obj = {
          id: processId,
          steps: res[0],
          permissions: res[1],
          dealId:
            this.action !== this.actionEdit && this.action != 'view'
              ? res[2]
              : this.deal.dealID,
          processSetting: res[3],
        };
        let isExist = this.listMemorySteps.some((x) => x.id === processId);
        if (!isExist) {
          this.listMemorySteps.push(obj);
        }
        this.listInstanceSteps = res[0];
        this.getSettingFields(res[3], this.listInstanceSteps);
        this.listParticipants = [];
        this.listParticipants = JSON.parse(JSON.stringify(obj?.permissions));
        if (this.action == this.actionEdit || this.action == 'view') {
          this.owner = this.deal.owner;
        } else {
          if (
            this.listParticipants?.length > 0 &&
            this.listParticipants &&
            !this.owner
          ) {
            let index = this.listParticipants?.findIndex(
              (x) => x.userID === this.user.userID
            );
            this.owner = index != -1 ? this.user.userID : null;
          }
          this.deal.dealID = res[2];
        }
        this.dateMax = this.HandleEndDate(
          this.listInstanceSteps,
          this.action,
          this.action !== this.actionEdit ||
            (this.action === this.actionEdit &&
              (this.deal.status == '1' || this.deal.status == '15'))
            ? null
            : this.deal.createdOn
        );
        this.deal.endDate =
          this.action === this.actionEdit ? this.deal?.endDate : this.dateMax;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  async insertInstance() {
    if (!this.isLoading) {
      let data = [this.instance, this.listInstanceSteps, this.oldIdInstance];
      this.codxCmService.addInstance(data).subscribe((instance) => {
        if (instance) {
          this.instanceRes = instance;
          this.deal.status = instance.status;
          this.deal.datas = instance.datas;
          this.addPermission(instance?.permissions);
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
          this.deal.status = instance.status;
          this.deal.datas = instance.datas;
          this.deal.permissions = this.deal?.permissions?.filter(
            (x) => x.memberType != '2'
          );
          this.addPermission(instance.permissions);
          this.onEdit();
        }
      });
    } else {
      this.onUpdateInstance();
    }
  }

  // check valid
  checkProcessInList(processId) {
    var result = this.listMemorySteps.filter((x) => x.id == processId)[0];
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
    instance.title = deal?.dealName?.trim();
    instance.memo = deal?.memo?.trim();
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
    endDateValue =
      action === this.actionAdd ||
        action === this.actionCopy ||
        (this.action === this.actionEdit &&
          (this.deal.status == '1' || this.deal.status == '15'))
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
  itemTabsInput(check: boolean): void {
    let menuInput = this.tabInfo.findIndex(
      (item) => item?.name == this.menuInputInfo?.name
    );
    let tabInput = this.tabContent.findIndex(
      (item) => item == this.tabCustomFieldDetail
    );
    if (this.isShowField) {
      if (check && menuInput == -1 && tabInput == -1) {
        this.tabInfo.splice(3, 0, this.menuInputInfo);
        this.tabContent.splice(3, 0, this.tabCustomFieldDetail);
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

  itemTabContact(check: boolean): void {
    let menuContact = this.tabInfo.findIndex(
      (item) => item === this.menuGeneralContact
    );
    let tabContact = this.tabContent.findIndex(
      (item) => item === this.tabGeneralContactDetail
    );
    if (check && menuContact == -1 && tabContact == -1) {
      this.tabInfo.splice(2, 0, this.menuGeneralContact);
      this.tabContent.splice(2, 0, this.tabGeneralContactDetail);
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
      let idxCrr = liststeps.findIndex((x) => x.stepID == this.deal?.stepID);
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
  ischeckCategoryCustomer(value: any): boolean {
    return value == '1';
  }

  // checkAddField(stepCrr, idx, field) {
  //   if (stepCrr) {
  //     if (this.action == 'edit' && this.idxCrr != -1 && this.idxCrr >= idx) {
  //       return true;
  //     }
  //     if (idx == 0) return true;
  //     return false;

  //     //
  //   }
  //   return false;
  // }

  //----------------------------end---------------------------//

  setTitle(e: any) {
    this.title = this.titleAction;
    // this.changeDetectorRef.detectChanges();
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

  // contactEventDeal(e) {
  //   if (e.data) {
  //     var findIndex = this.lstContactCustomer.findIndex(
  //       (x) => x.recID == e.data?.refID
  //     );
  //     if (e.action == 'edit') {
  //       if (findIndex != -1) {
  //         var isDefault = this.lstContactCustomer[findIndex].isDefault;
  //         this.lstContactCustomer[findIndex] = JSON.parse(
  //           JSON.stringify(e.data)
  //         );
  //         this.lstContactCustomer[findIndex].recID = e.data.refID;
  //         this.lstContactCustomer[findIndex].role = null;
  //         this.lstContactCustomer[findIndex].isDefault = isDefault;
  //         this.loadContactDeal.loadListContact(this.lstContactCustomer);
  //       }
  //     }
  //     this.changeDetectorRef.detectChanges();
  //   }
  // }

  loadExchangeRate() {
    this.codxCmService.getParam('CMParameters', '1').subscribe((dataParam1) => {
      if (dataParam1) {
        let paramDefault = JSON.parse(dataParam1.dataValue);
        this.deal.currencyID = paramDefault['DefaultCurrency'] ?? 'VND';
        let day = new Date();
        this.codxCmService
          .getExchangeRate(this.deal.currencyID, day)
          .subscribe((res) => {
            if (res) this.deal.exchangeRate = res?.exchRate;
            else {
              this.deal.currencyID = 'VND';
              this.deal.exchangeRate = 1;
            }
          });
      }
    });
  }
  valueTagChange(e) {
    this.deal.tags = e.data;
  }
  addFileCompleted(e) {
    this.isBlock = e;
  }
  async getAutoNumber() {
    this.cache.message('AD019').subscribe((mes) => {
      if (mes) {
        this.planceHolderAutoNumber = mes?.customName || mes?.description;
      }
    });
  }
  changeAutoNum(e) { }

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
          this.setElement(obj.recID, obj.dataValue);
        }
      }
    });
  }

  setElement(recID, value) {
    value =
      value && value != '_'
        ? Number.parseFloat(value)?.toFixed(2).toString()
        : '';
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

  //----------------Cost Items -----------------//

  // addCost() {
  //   if (this.cost && !this.cost.costItemName) {
  //     this.notificationsService.notify(
  //       'Chưa nhập nội dung chi phí, hãy hoàn thiện chi phí trước khi thêm chi phí mới !',
  //       '3'
  //     );
  //     return;
  //   }

  //   let newCost = new CM_CostItems();
  //   newCost.transID = this.deal?.recID;
  //   newCost.quantity = 1;
  //   newCost.unitPrice = 0;
  //   if (!this.costInfos) this.costInfos = [];

  //   this.costInfos.push(newCost);
  //   this.cost = newCost;
  //   this.calculateTotalCost();
  //   this.detectorRef.detectChanges();
  // }

  // changeCost(evt: any) {
  //   if (evt) {
  //   }
  // }
  // deleteCost(index: number) {
  //   if (this.costInfos?.length > index) {
  //     this.costInfos?.splice(index, 1);
  //     if (this.costInfos.length == 0) this.cost = null;
  //     this.calculateTotalCost();
  //     this.detectorRef.detectChanges();
  //   }
  // }
  // editCost(evt: any, index: number) {
  //   if (evt && this.costInfos?.length > index) {
  //     switch (evt?.field) {
  //       case 'quantity':
  //         this.costInfos[index].quantity = evt?.data;
  //         break;

  //       case 'unitPrice':
  //         this.costInfos[index].unitPrice = evt?.data;
  //         break;

  //       case 'costItemName':
  //         this.costInfos[index].costItemName = evt?.data;
  //         break;

  //       case 'costItemID':
  //         this.costInfos[index].costItemID = evt?.data;
  //         break;
  //     }

  //     this.cost = this.costInfos[index];
  //     this.calculateTotalCost();
  //   }
  // }
  // calculateTotalCost() {
  //   this.totalCost = 0;
  //   if (this.costInfos?.length > 0) {
  //     this.costInfos?.forEach((cost) => {
  //       if (cost?.quantity && cost?.unitPrice)
  //         cost.amount = cost?.quantity * cost?.unitPrice;
  //       else cost.amount = 0;
  //       this.totalCost += cost.amount;
  //     });
  //   }
  //   this.deal['dealCost'] = this.totalCost;
  //   if (this.deal.dealValueTo) {
  //     this.deal['grossProfit'] = this.deal.dealValueTo - this.totalCost;
  //   } else {
  //     this.deal['grossProfit'] = 0 - this.totalCost;
  //   }
  // }

  checkValidateCost() {
    let check = true;
    this.costInfos?.forEach((cost) => {
      if (!cost.costItemName || cost.costItemName.trim() == '') {
        check = false;
        return;
      }
    });
    return check;
  }
  tabChange(e) {
    if (e?.nextId == 'CostItems') {
    }
  }

  dataCostItems(e) {
    this.costInfos = e;
  }

  totalDataCost(e) {
    this.deal['dealCost'] = e;
    if (this.deal.dealValueTo) {
      this.deal['grossProfit'] = this.deal.dealValueTo - e;
    } else {
      this.deal['grossProfit'] = 0 - e;
    }
  }

  //lãi gộp
  changeDealValueTo(e) {
    this.deal.dealValueTo = e;
    if (this.deal.dealValueTo) {
      this.deal['grossProfit'] = this.deal.dealValueTo - this.totalCost;
    } else {
      this.deal['grossProfit'] = 0 - this.totalCost;
    }
  }
  //---------------------------------------------//
}
