import {
  OnInit,
  Optional,
  ViewChild,
  Component,
  TemplateRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  CM_Contracts,
  CM_Customers,
  CM_Quotations,
  CM_QuotationsLines,
  CM_ContractsPayments,
  CM_Permissions,
} from '../../models/cm_model';
import {
  Util,
  DialogRef,
  FormModel,
  AuthStore,
  DialogData,
  CRUDService,
  DialogModel,
  CacheService,
  SidebarModel,
  RequestOption,
  ApiHttpService,
  CallFuncService,
  CodxFormComponent,
  CodxInputComponent,
  NotificationsService,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { Observable, Subject, firstValueFrom, takeUntil } from 'rxjs';
import { ContractsService } from '../service-contracts.service';
import { StepService } from 'projects/codx-share/src/lib/components/codx-step/step.service';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { PopupAddCategoryComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-category/popup-add-category.component';
import { tmpInstances } from '../../models/tmpModel';
import { CodxListContactsComponent } from '../../cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';

@Component({
  selector: 'add-contracts',
  templateUrl: './add-contracts.component.html',
  styleUrls: ['./add-contracts.component.scss'],
})
export class AddContractsComponent implements OnInit, AfterViewInit {
  @ViewChild('task') task: TemplateRef<any>;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('extend') extend: TemplateRef<any>;
  @ViewChild('reference') reference: TemplateRef<any>;
  @ViewChild('information') information: TemplateRef<any>;
  @ViewChild('fieldTemp') fieldTemp: TemplateRef<any>;

  @ViewChild('more') more: TemplateRef<any>;
  @ViewChild('inputDeal') inputDeal: CodxInputComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('inputContact') inputContact: CodxInputComponent;
  @ViewChild('inputQuotation') inputQuotation: CodxInputComponent;
  @ViewChild('realtiesTmp') realtiesTmp: TemplateRef<any>;
  @ViewChild('loadContactDeal') loadContactDeal: CodxListContactsComponent;

  REQUIRE = [
    'contractID',
    'customerID',
    'contractAmt',
    'pmtMethodID',
    'pmtMethodID',
    'contractName',
    'contractType',
    'effectiveFrom',
    'businessLineID',
  ];

  customer: CM_Customers;
  contracts: CM_Contracts;
  quotations: CM_Quotations;
  contractsInput: CM_Contracts;
  listQuotationsLine: CM_QuotationsLines[] = [];
  quotationLinesEdit: CM_QuotationsLines[] = [];
  listQLineOfContract: CM_QuotationsLines[] = [];
  quotationLinesAddNew: CM_QuotationsLines[] = [];
  quotationLinesDeleted: CM_QuotationsLines[] = [];
  listQLineOfContractAdd: CM_QuotationsLines[] = [];

  listPayment: CM_ContractsPayments[] = [];
  listPaymentAdd: CM_ContractsPayments[] = [];
  listPaymentEdit: CM_ContractsPayments[] = [];
  listPaymentDelete: CM_ContractsPayments[] = [];
  listPaymentHistory: CM_ContractsPayments[] = [];

  account: any;
  columns: any;
  grvPayments: any;
  projectID: string;
  dialog!: DialogRef;
  view = [];
  isLoadDate = true;
  checkPhone = true;
  isErorrDate = true;
  customerIdOld = null;
  disabledDelActualDate = false;

  user;
  parentID = '';
  processID = '';
  action = 'add';
  entityName = '';
  tabClicked = '';
  headerTest = '';
  contractRefID = '';
  listField = [];
  customerID = {};
  listProcessNo = [];
  listTypeContract = [];
  listCustomFile: any[] = [];
  listMemorySteps: any[] = [];
  listInstanceSteps: any[] = [];
  REQUIRE_TASK = ['taskName', 'endDate', 'startDate'];
  type: 'contract' | 'DP' | 'deal' | 'quotation' | 'customer' | 'task';

  listParticipants;
  objPermissions = {};
  grvSetup: any;
  tabContent: any[] = [];
  isExitAutoNum: any = false;
  planceHolderAutoNumber: any = '';
  disabledShowInput: boolean = false;

  autoNumber = '';
  recIDContract = '';
  processIdDefault = '';
  currencyIDDefault = '';
  isApplyProcess = false;
  countInputChangeAuto = 0;
  // task
  instance = new tmpInstances();;
  viewTask;
  stepsTasks;
  oldIdInstance;
  listApproverView;
  isStartIns = false;
  isActivitie = false;
  isSaveTimeTask = true;
  isLoadDateTask = false;
  popupRealties;
  moreDefaut = {
    read: true,
    share: true,
    write: true,
    delete: true,
    download: true,
  };

  isShowFieldLeft = false;
  nameTabFieldsSetting = '';
  lstContactDeal: any[] = [];
  lstContactDelete: any[] = [];
  isBlock = true;
  // Tab control
  tabInfo = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'GeneralInfo',
      subName: 'General information',
      subText: 'General information',
    },
    {
      icon: 'icon-reorder',
      text: 'Tham chiếu',
      name: 'InputReference',
      subName: 'Input information',
      subText: 'Input information',
    },
  ];

  tabField = {
    icon: 'icon-reorder',
    text: 'Thông tin mở rộng',
    name: 'InputField',
    subName: 'Input field',
    subText: 'Input field',
  };

  //#region FormModel
  formModel: FormModel = {
    funcID: 'CM0204',
    formName: 'CMContracts',
    entityName: 'CM_Contracts',
    entityPer: 'CM_Contracts',
    gridViewName: 'grvCMContracts',
  };
  fmQuotations: FormModel = {
    funcID: 'CM02021',
    formName: 'CMQuotations',
    entityName: 'CM_Quotations',
    gridViewName: 'grvCMQuotations',
  };
  fmQuotationLines: FormModel = {
    funcID: 'CM02021',
    formName: 'CMQuotationsLines',
    entityName: 'CM_QuotationsLines',
    gridViewName: 'grvCMQuotationsLines',
  };
  fmContractsPayments: FormModel = {
    funcID: 'CM0204 ',
    formName: 'CMContractsPayments',
    entityName: 'CM_ContractsPayments',
    gridViewName: 'grvCMContractsPayments',
  };
  frmModelInstancesTask = {
    funcID: 'DPT040102',
    formName: 'DPInstancesStepsTasks',
    entityName: 'DP_Instances_Steps_Tasks',
    gridViewName: 'grvDPInstancesStepsTasks',
  };
  formModelAM: FormModel = {
    formName: 'CMRealties',
    entityName: 'AM_Realties',
    gridViewName: 'grvCMRealties',
  };
  //#endregion

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private cmService: CodxCmService,
    private stepService: StepService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private contractService: ContractsService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.type = dt?.data?.type;
    this.action = dt?.data?.action;
    this.account = dt?.data?.account;
    this.parentID = dt?.data?.parentID;
    this.projectID = dt?.data?.projectID;
    this.processID = dt?.data?.processID;
    this.headerTest = dt?.data?.actionName;
    this.entityName = dt?.data?.entityName;
    this.isStartIns = !!dt?.data?.isStartIns;
    this.contractRefID = dt?.data?.contractRefID;
    this.recIDContract = dt?.data?.recIDContract;
    this.stepsTasks = dt?.data?.stepsTasks || {};
    this.contractsInput = dt?.data?.contract || dt?.data?.dataCM || null;
    this.user = this.authStore.get();
    // this.getTitle();
    this.getFormModel();
    this.getGrvSetup();
  }

  async ngOnInit() {
    this.action != 'edit' && (await this.getSettingContract());
    this.setDataContract(this.contractsInput);
    if (this.type == 'task') {
      this.cache
        .gridViewSetup('DPInstancesStepsTasks', 'grvDPInstancesStepsTasks')
        .subscribe((res) => {
          for (let key in res) {
            if (res[key]['isRequire']) {
              let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
              this.viewTask[keyConvert] = res[key]['headerText'];
            }
          }
        });
    }
  }

  async ngAfterViewInit() {
    this.tabContent = [this.information, this.reference, this.extend];
    if (this.type == 'task') {
      this.tabInfo.push({
        icon: 'icon-more',
        text: 'Công việc',
        name: 'General task',
        subName: 'General task',
        subText: 'General task',
      });
      this.tabContent.push(this.task);
    }
  }
  //#region setData
  setDataParent() {
    if (this.entityName && this.parentID) {
      switch (this.entityName) {
        case 'CM_Customers':
          this.contracts.customerID = this.parentID;
          break;
        case 'CM_Deals':
          this.contracts.dealID = this.parentID;
          this.getCustomerByDealID(this.parentID);
          this.setValueComboboxQuotation();
          break;
      }
    }
  }

  async setDataContract(data) {
    switch (this.action) {
      case 'add':
        this.contracts = data ? data : new CM_Contracts();
        this.contracts.paidAmt = 0;
        this.contracts.status = '1';
        this.contracts.remainAmt = 0;
        this.contracts.useType = '1';
        this.contracts.pmtStatus = '1';
        this.contracts.delStatus = '1';
        this.contracts.recID = Util.uid();
        this.contracts.pmtMethodID = 'ATM';
        this.contracts.contractDate = new Date();
        this.contracts.effectiveFrom = new Date();
        this.contracts.projectID = this.projectID;
        this.contracts.applyProcess = false;
        this.contracts.displayed = true;
        this.contracts.currencyID = this.currencyIDDefault;
        this.loadExchangeRate(this.contracts.currencyID);
        this.setContractByDataOutput();
        this.getAutoNumber();
        this.setDataParent();
        if ((this.type == 'DP', this.processID)) {
          this.contracts.processID = this.processID;
          this.getBusinessLineByProcessID(this.processID);
        }
        break;
      case 'edit':
        if (data) {
          this.contracts = data;
        } else if (this.recIDContract) {
          let dataEdit = await firstValueFrom(
            this.contractService.getContractByRecID(this.recIDContract)
          );
          if (dataEdit) {
            this.contracts = dataEdit;
          }
        }
        if(this.contracts?.applyProcess && this.contracts.processID){
          this.getListInstanceSteps(this.contracts.processID);
        }
        this.getCustomersDefaults(this.contracts?.customerID);
        break;
      case 'copy':
        if (data) {
          this.contracts = data;
        } else if (this.recIDContract) {
          let dataCopy = await firstValueFrom(
            this.contractService.getContractByRecID(this.recIDContract)
          );
          if (dataCopy) {
            this.contracts = dataCopy;
          }
        }
        delete this.contracts['id'];
        this.contracts.recID = Util.uid();
        this.contracts.status = '1';
        // this.contracts.applyProcess = this.isApplyProcess;
        this.contracts.currencyID = this.currencyIDDefault;
        if (!this.contracts?.applyProcess) {
          this.contracts.contractID = null;
          this.getAutoNumberSetting();
        } else {
          this.disabledShowInput = true;
        }
        if(this.contracts?.applyProcess && this.contracts?.processID){
          this.getListInstanceSteps(this.contracts.processID);
        }
        this.getCustomersDefaults(this.contracts?.customerID);
        break;
      case 'extend':
        if (data) {
          this.contracts = JSON.parse(JSON.stringify(data));
          delete this.contracts['id'];
          this.contracts.parentID = this.contracts?.recID;
          this.contracts.recID = Util.uid();
          this.contracts.status = '1';
          this.contracts.useType = '5';
        }
        if(this.contracts?.applyProcess && this.contracts.processID){
          this.getListInstanceSteps(this.contracts.processID);
        }
        this.getCustomersDefaults(this.contracts?.customerID);
        break;
      default:
    }
  }

  setContractByDataOutput() {
    if (this.contracts.dealID) {
      this.getCustomerByDealID(this.contracts.dealID);
    }
    if (this.contracts.customerID) {
      this.getCustomerByRecID(this.contracts.customerID);
    }
  }

  setDataContractCombobox(customer) {
    if (customer) {
      this.customerIdOld = this.contracts.customerID;
      this.customer = customer;
      this.customerID = { customerID: customer?.recID };
      this.contracts.customerID = customer?.recID;
      this.contracts.customerName = customer?.customerName;
      this.contracts.taxCode = customer?.taxCode;
      this.contracts.address = customer?.address;
      this.contracts.phone = customer?.phone;
      this.contracts.faxNo = customer?.faxNo;
      this.contracts.representative = null;
      this.contracts.jobTitle = null;
      this.contracts.bankAccount = customer?.bankAccount;
      this.contracts.bankID = customer?.bankID;
      this.getContactByCustomerID(this.contracts?.customerID);
    }
  }
  //#endregion

  //#region get data setting default
  async getSettingContract() {
    let res = await firstValueFrom(
      this.cmService.getParam('CMParameters', '1')
    );
    if (res?.dataValue) {
      let dataValue = JSON.parse(res?.dataValue);
      this.currencyIDDefault = dataValue?.DefaultCurrency || 'VND';
      this.isApplyProcess =
        this.type == 'DP' ? true : dataValue?.ProcessContract == '1';
    }
  }

  loadExchangeRate(currencyID) {
    let day = this.contracts.createdOn ?? new Date();
    this.cmService.getExchangeRate(currencyID, day).subscribe((res) => {
      let exchangeRateNew = res?.exchRate ?? 0;
      if (exchangeRateNew == 0) {
        this.notiService.notify(
          'Tỷ giá "' + this.contracts?.currencyID + '" chưa thiết lập  !',
          '3'
        );
        this.contracts.currencyID = 'VND';
        this.contracts.exchangeRate = 1;
        return;
      } else {
        this.contracts.exchangeRate = exchangeRateNew;
      }
    });
  }
  //#endregion

  //#region auto number
  GetProcesIDDefault() {
    if (this.processIdDefault) {
      this.contracts.processID = this.processIdDefault;
    } else {
      this.contractService.GetProcessIdDefault('4').subscribe((res) => {
        if (res) {
          this.contracts.processID = res?.recID;
          this.processIdDefault = res?.recID;
        } else {
          this.notiService.notify(
            'Chưa có quy trình hợp đồng được thiết lập, vui lòng thiết lập quy trình hợp đồng mặc định',
            '3'
          );
        }
      });
    }
  }

  GetProcessNoByProcessID(processID) {
    let process = this.listProcessNo?.find((x) => x?.processID === processID);
    if (process) {
      this.contracts.contractID = process?.processNo;
      this.disabledShowInput = true;
    } else {
      this.contractService
        .GetProcessNoByProcessID(processID)
        .subscribe((res) => {
          if (res) {
            this.contracts.contractID = res;
            this.listProcessNo =
              this.listProcessNo?.length == 0 ? [] : this.listProcessNo;
            this.listProcessNo?.push({ processID: processID, processNo: res });
          } else {
            this.contracts.contractID = this.autoNumber;
          }
        });
    }

    return null;
  }
  // kiểm tra có thiết lập tư động ko
  async getAutoNumber() {
    this.cmService
      .getFieldAutoNoDefault(
        this.dialog.formModel.funcID,
        this.dialog.formModel.entityName
      )
      .subscribe((res) => {
        if (res && !res.stop) {
          this.cache.message('AD019').subscribe((mes) => {
            if (mes) {
              this.planceHolderAutoNumber = mes?.customName || mes?.description;
            }
          });
          this.getAutoNumberSetting();
        } else {
          this.planceHolderAutoNumber = '';
          this.contracts.contractID = null;
          this.disabledShowInput = false;
        }
      });
  }

  // lấy mã tự động
  async getAutoNumberSetting() {
    this.cmService
      .genAutoNumberDefault(
        this.dialog.formModel.funcID,
        this.dialog.formModel.entityName,
        'ContractID'
      )
      .subscribe((autoNum) => {
        this.contracts.contractID = autoNum;
        this.autoNumber = autoNum;
        this.disabledShowInput = true;
      });
  }

  // check trùm mã khi nhạp tay
  changeAutoNum(e) {
    if (
      this.countInputChangeAuto == 0 &&
      !this.autoNumber &&
      !this.contracts?.applyProcess &&
      e?.data
    ) {
      if (
        !this.disabledShowInput &&
        this.action !== 'edit' &&
        this.action !== 'extend' &&
        e
      ) {
        this.contracts.contractID = e?.data;
        if (
          this.contracts.contractID &&
          this.contracts.contractID.includes(' ')
        ) {
          this.notiService.notifyCode(
            'CM026',
            0,
            '"' + this.grvSetup['ContractID'].headerText + '"'
          );
          return;
        }
        this.cmService
          .isExitsAutoCodeNumber('ContractsBusiness', this.contracts.contractID)
          .subscribe((res) => {
            this.isExitAutoNum = res;
            if (this.isExitAutoNum)
              this.notiService.notifyCode(
                'CM003',
                0,
                '"' + this.grvSetup['ContractID'].headerText + '"'
              );
          });
      }
      this.countInputChangeAuto = 1;
    } else {
      this.countInputChangeAuto = 0; // core chạy 2 lần
    }
  }
  //#endregion

  //#region change Input
  valueChangeText(event) {
    this.contracts[event?.field] = event?.data;
    if (event?.field == 'contractName') {
      this.contracts[event?.field] = this.stepService.capitalizeFirstLetter(
        event?.data
      );
    }
    if (event?.field == 'delPhone') {
      let isPhone = this.stepService.isValidPhoneNumber(event?.data);
      if (!isPhone && this.checkPhone) {
        this.notiService.notifyCode('RS030');
      }
      this.checkPhone = !this.checkPhone;
    }
    if (event?.field == 'interval') {
      const startDate = new Date(this.contracts?.effectiveFrom) || new Date();
      let interval = parseInt(event?.data || 0);
      this.contracts.effectiveTo = new Date(
        startDate.setMonth(startDate.getMonth() + interval)
      );
    }
  }

  valueChangeCombobox(event) {
    this.contracts[event?.field] = event?.data;
    switch (event?.field) {
      case 'customerID':
        this.getContactByCustomerID(event?.data);
        this.contracts.dealID = null;
        this.inputDeal.crrValue = null;
        this.inputDeal.ComponentCurrent.dataService.data = [];
        this.inputDeal.model = { customerID: this.contracts.customerID };

        // this.contracts.quotationID = null;
        // this.inputQuotation.crrValue = null;
        // this.inputQuotation.ComponentCurrent.dataService.data = [];
        // this.inputQuotation.model = { customerID: this.contracts.customerID };
        if(event?.component?.itemsSelected[0]){
          let customerName = event?.component?.itemsSelected[0]?.CustomerName
          this.contracts.customerName = customerName;
        }
        break;
      case 'dealID':
        if (!this.contracts.customerID && this.contracts?.dealID) {
          this.getCustomerByDealID(event?.data);
          this.setValueComboboxQuotation();
        }
        break;
      case 'quotationID':
        if (!this.contracts?.customerID && this.contracts?.quotationID) {
          this.getCustomerByQuotationID(event?.data);
          this.setValueComboboxDeal();
          this.getQuotationsLinesByTransID(event?.data);
        }
        break;
      case 'delStatus':
        this.disabledDelActualDate =
          event?.data == '0' || event?.data == '1' ? true : false;
        break;
      case 'contractType':
        if(event?.component?.itemsSelected[0]){
          let autoNumber = event?.component?.itemsSelected[0]?.AutoNumber
          if(autoNumber){
            this.getADAutoNumberByAutoNoCode(autoNumber).subscribe(res => {
              if(res){
                this.contracts.contractID = res;
              }else{
                this.contracts.contractID = this.autoNumber;
              }
            })
          }
        }
        break;
      case 'businessLineID':
        if (event?.field == 'businessLineID' && event?.data) {
          let processID = event?.component?.itemsSelected
            ? event?.component?.itemsSelected[0]?.ProcessContractID
            : null;
          this.contracts.businessLineID = event?.data;
          if (processID) {
            this.contracts.processID = processID;
            this.contracts.applyProcess = true;
            // this.GetProcessNoByProcessID(processID);
            this.disabledShowInput = true;
            this.getListInstanceSteps(processID);
          } else {
            this.itemTabsInput(false);
            if (this.isApplyProcess) {
              this.GetProcesIDDefault();
            } else {
              this.contracts.applyProcess = false;
              this.contracts.processID = null;
              if (this.autoNumber) {
                this.contracts.contractID = this.autoNumber;
              } else {
                this.contracts.contractID = '';
                this.disabledShowInput = false;
              }
            }
          }
        }
        break;
    }
    this.form.formGroup.patchValue(this.contracts);
  }

  getADAutoNumberByAutoNoCode(autoNoCode): Observable<any> {
    return this.api.exec<any>(
      'ERM.Business.AD',
      'AutoNumbersBusiness',
      'CreateAutoNumberAsync',
      [autoNoCode, null, true, null]
    );
  }


  getContactByCustomerID(customerID) {
    this.contractService
      .getOneContactByObjectID(customerID)
      .subscribe((contactID) => {
        if (contactID) {
          if (this.inputContact && this.inputContact?.ComponentCurrent) {
            this.contracts.contactID = contactID;
            this.inputContact.crrValue = contactID;
            this.inputContact.ComponentCurrent.dataService.data = [];
            this.inputContact.model = { objectID: this.contracts.customerID };
          }
        } else {
          this.contracts.contactID = null;
          this.inputContact.crrValue = null;
          this.inputContact.ComponentCurrent.dataService.data = [];
          this.inputContact.model = { objectID: this.contracts.customerID };
        }
        this.form.formGroup.patchValue(this.contracts);
      });
  }

  valueChangeOwner(event) {
    this.contracts.owner = event?.data;
    // console.log(event?.component?.itemsSelected[0]);
    // let user = event?.component?.itemsSelected[0];
    // if (!this.contracts.applyProcess && user) {
    //   let permissions = new CM_Permissions();
    //   permissions.recID = Util.uid();
    //   permissions.objectID = user?.UserID;
    //   permissions.objectName = user?.UserName;
    //   permissions.objectType = 'U';
    //   permissions.roleType = 'O';
    //   permissions.memberType = '0';
    //   permissions.full = true;
    //   permissions.read = true;
    //   permissions.edit = false;
    //   permissions.create = false;
    //   permissions.update = true;
    //   permissions.assign = true;
    //   permissions.delete = true;
    //   permissions.share = false;
    //   permissions.upload = true;
    //   permissions.download = true;
    //   this.contracts.permissions = [permissions];
    // }
  }

  setValueComboboxDeal() {
    let listDeal = this.inputDeal.ComponentCurrent.dataService.data;
    if (listDeal) {
      if (this.customerIdOld != this.contracts.customerID) {
        this.contracts.dealID = null;
        this.inputDeal.ComponentCurrent.dataService.data = [];
        this.inputDeal.model = { customerID: this.contracts.customerID };
      }
    }
  }

  setValueComboboxQuotation() {
    let listQuotation = this.inputQuotation.ComponentCurrent.dataService.data;
    if (listQuotation) {
      if (this.customerIdOld != this.contracts.customerID) {
        this.contracts.quotationID = null;
        this.inputQuotation.ComponentCurrent.dataService.data = [];
        this.inputQuotation.model = { customerID: this.contracts.customerID };
      }
    }
  }

  changeValueDate(event) {
    this.contracts[event?.field] = new Date(event?.data?.fromDate);
    const startDate = this.contracts?.effectiveFrom
      ? new Date(this.contracts?.effectiveFrom)
      : null;
    const endDate = this.contracts?.effectiveTo
      ? new Date(this.contracts?.effectiveTo)
      : null;
    if (event?.field == 'effectiveTo' && this.isLoadDate) {
      if (endDate && startDate > endDate) {
        // this.isSaveTimeTask = false;
        this.isLoadDate = !this.isLoadDate;
        this.notiService.notifyCode(
          'CM010',
          0,
          this.view['effectiveTo'],
          this.view['effectiveFrom']
        );
        return;
      } else {
        // this.isSaveTimeTask = true;
      }
    } else {
      this.isLoadDate = !this.isLoadDate;
    }

    if (
      (event?.field == 'effectiveTo' || event?.field == 'effectiveFrom') &&
      startDate &&
      endDate
    ) {
      let startYear = startDate.getFullYear();
      let endYear = endDate.getFullYear();
      let startMonth = startDate.getMonth();
      let endMonth = endDate.getMonth();

      let interval = (endYear - startYear) * 12 + (endMonth - startMonth);
      this.contracts.interval = interval.toFixed(1);
    }
  }

  //#endregion

  //#region setDefault
  getFormModel() {
    this.cache
      .gridViewSetup(
        this.dialog?.formModel?.formName,
        this.dialog?.formModel?.gridViewName
      )
      .subscribe((res) => {
        for (let key in res) {
          if (res[key]) {
            let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
            this.view[keyConvert] = res[key]['headerText'];
          }
        }
      });
  }
  getTitle() {
    this.cache.functionList(this.dialog?.formModel.funcID).subscribe((f) => {
      if (f) {
        if (this.headerTest) {
          this.headerTest =
            this.headerTest + ' ' + f?.defaultName.toString().toLowerCase();
        } else {
          this.cache.moreFunction('CoDXSystem', '').subscribe((res: any) => {
            if (res) {
              if (this.action == 'add') {
                let title =
                  res?.find((x) => x.functionID == 'SYS01')?.description || '';
                this.headerTest = (
                  title +
                  ' ' +
                  f?.defaultName.toString()
                ).toUpperCase();
              } else if (this.action == 'edit') {
                let title =
                  res?.find((x) => x.functionID == 'SYS03')?.description || '';
                this.headerTest = (
                  title +
                  ' ' +
                  f?.defaultName.toString()
                ).toUpperCase();
              } else if (this.action == 'copy') {
                let title =
                  res?.find((x) => x.functionID == 'SYS04')?.description || '';
                this.headerTest = (
                  title +
                  ' ' +
                  f?.defaultName.toString()
                ).toUpperCase();
              }
            }
          });
        }
      }
    });
  }
  getGrvSetup() {
    this.cache
      .gridViewSetup(
        this.dialog?.formModel.formName,
        this.dialog?.formModel.gridViewName
      )
      .subscribe((grv) => {
        this.grvSetup = grv;
      });
  }
  //#endregion

  //#region Customners
  getCustomersDefaults(customerID) {
    this.cmService.getContactByObjectID(customerID).subscribe((res) => {
      if (res) {
        this.contracts.representative = res?.contactName;
        this.contracts.jobTitle = res?.jobTitle;
      }
    });
  }
  //#endregion

  //#region get data
  getCustomerByDealID(dealID) {
    this.contractService.getCustomerBydealID(dealID).subscribe((res) => {
      if (res) {
        this.setDataContractCombobox(res);
      }
    });
  }

  getCustomerByQuotationID(recID) {
    this.contractService.getCustomerByQuotationID(recID).subscribe((res) => {
      if (res) {
        this.setDataContractCombobox(res);
      }
    });
  }

  getQuotationByQuotationID(recID) {
    this.contractService.getQuotationByQuotationID(recID).subscribe((res) => {
      if (res) {
      }
    });
  }

  getCustomerByRecID(recID) {
    this.contractService.getCustomerByRecID(recID).subscribe((res) => {
      if (res) {
        this.setDataContractCombobox(res);
      }
    });
  }

  getQuotationsLinesByTransID(recID) {
    this.cmService.getQuotationsLinesByTransID(recID).subscribe((res) => {
      if (res) {
        this.listQuotationsLine = res;
        this.contracts.contractAmt = this.sumNetAmtQuotations(); // giá trị hợp đồng
      }
    });
  }

  getBusinessLineByProcessID(processID) {
    this.cmService
      .getIdBusinessLineByProcessContractID([processID])
      .subscribe((res) => {
        if (res) {
          this.contracts.businessLineID = res;
        }
      });
  }
  //#endregion

  //#region tasks
  changeValueTextTask(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  changeValueDateTask(event) {
    this.stepsTasks[event?.field] = new Date(event?.data?.fromDate);
    if (this.isLoadDateTask) {
      this.isLoadDateTask = !this.isLoadDateTask;
      return;
    }
    const startDate = new Date(this.stepsTasks['startDate']);
    const endDate = new Date(this.stepsTasks['endDate']);
    if (endDate && startDate > endDate) {
      this.isSaveTimeTask = false;
      this.isLoadDateTask = !this.isLoadDateTask;
      this.notiService.notifyCode('DP019');
      this.stepsTasks['durationHour'] = 0;
      this.stepsTasks['durationDay'] = 0;
      return;
    } else {
      this.isSaveTimeTask = true;
    }
    if (this.stepsTasks['startDate'] && this.stepsTasks['endDate']) {
      const endDate = new Date(this.stepsTasks['endDate']);
      const startDate = new Date(this.stepsTasks['startDate']);
      if (endDate >= startDate) {
        const duration = endDate.getTime() - startDate.getTime();
        const time = Number((duration / 60 / 1000 / 60).toFixed(1));
        let days = 0;
        let hours = 0;
        if (time < 1) {
          hours = time;
        } else {
          hours = Number((time % 24).toFixed(1));
          days = Math.floor(time / 24);
        }
        this.stepsTasks['durationHour'] = hours;
        this.stepsTasks['durationDay'] = days;
      }
    } else {
      this.stepsTasks['durationHour'] = 0;
      this.stepsTasks['durationDay'] = 0;
    }
  }

  valueChangeAlertTask(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  sumNetAmtQuotations() {
    // tính tổng giá trị của mặt hàng
    if (this.listQuotationsLine?.length > 0) {
      let contractAmt = this.listQuotationsLine.reduce((sum, item) => {
        return sum + item?.netAmt || 0;
      }, 0);
      return contractAmt;
    }
    return 0;
  }
  //#endregion

  //#region Approve
  private destroyFrom$: Subject<void> = new Subject<void>();
  titleAction: any;

  async clickSettingApprove() {
    let category;
    let categoryName = this.stepsTasks?.isTaskDefault
      ? 'DP_Steps_Tasks'
      : 'DP_Instances_Steps_Tasks';
    let idTask = this.stepsTasks?.isTaskDefault
      ? this.stepsTasks?.refID
      : this.stepsTasks?.recID;
    if (this.action == 'edit')
      category = await firstValueFrom(
        this.api.execSv<any>(
          'ES',
          'ES',
          'CategoriesBusiness',
          'GetByCategoryIDTypeAsync',
          [idTask, categoryName, null]
        )
      );
    if (category) {
      this.actionOpenFormApprove2(category);
    } else {
      this.api
        .execSv<any>('ES', 'Core', 'DataBusiness', 'GetDefaultAsync', [
          'ESS22',
          'ES_Categories',
        ])
        .subscribe(async (res) => {
          if (res && res?.data) {
            category = res.data;
            category.recID = res?.recID ?? Util.uid();
            category.eSign = true;
            category.category = this.isActivitie
              ? 'DP_Activities'
              : 'DP_Instances_Steps_Tasks';
            category.categoryID = idTask;
            category.categoryName = this.stepsTasks.taskName;
            category.createdBy = this.user.userID;
            category.owner = this.user.userID;
            category.functionApproval = this.isActivitie ? 'DPT07' : 'DPT04';
            category['refID'] = idTask;
            this.actionOpenFormApprove2(category, true);
          }
        });
    }
  }

  actionOpenFormApprove2(item, isAdd = false) {
    this.cache.functionList('ESS22').subscribe((f) => {
      if (f) {
        if (!f || !f.gridViewName || !f.formName) return;
        this.cache.gridView(f.gridViewName).subscribe((gridview) => {
          this.cache
            .gridViewSetup(f.formName, f.gridViewName)
            .pipe(takeUntil(this.destroyFrom$))
            .subscribe((grvSetup) => {
              let formES = new FormModel();
              formES.funcID = f?.functionID;
              formES.entityName = f?.entityName;
              formES.formName = f?.formName;
              formES.gridViewName = f?.gridViewName;
              formES.currentData = item;
              let option = new SidebarModel();
              option.Width = '800px';
              option.FormModel = formES;
              let opt = new DialogModel();
              opt.FormModel = formES;
              option.zIndex = 1100;
              let popupEditES = this.callfunc.openForm(
                PopupAddCategoryComponent,
                '',
                800,
                800,
                '',
                {
                  disableCategoryID: '1',
                  data: item,
                  isAdd: isAdd,
                  headerText: this.titleAction,
                  dataType: 'auto',
                  templateRefID: this.stepsTasks?.isTaskDefault
                    ? this.stepsTasks?.refID
                    : this.stepsTasks?.recID,
                  templateRefType: this.isActivitie
                    ? 'DP_Activities'
                    : 'DP_Instances_Steps_Tasks',
                  disableESign: true,
                },
                '',
                opt
              );

              popupEditES.closed.subscribe((res) => {
                if (res?.event) {
                  this.loadListApproverStep();
                }
              });
            });
        });
      }
    });
  }

  loadListApproverStep() {
    let idTask = this.stepsTasks?.isTaskDefault
      ? this.stepsTasks?.refID
      : this.stepsTasks?.recID;
    this.getListAproverStepByCategoryID(idTask)
      .pipe(takeUntil(this.destroyFrom$))
      .subscribe((res) => {
        if (res) {
          this.listApproverView = res;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  getListAproverStepByCategoryID(categoryID) {
    return this.api.exec<any>(
      'ES',
      'ApprovalStepsBusiness',
      'GetListStepByCategoryIDAsync',
      categoryID
    );
  }
  //#endregion

  //#region seve Instance

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
  //#endregion

  getListInstanceSteps(processId: any) {
    let action = this.action == "extend" ? "copy" :  this.action;
    let data = [processId, this.contracts?.refID, action, '4'];
    this.cmService.getInstanceSteps(data).subscribe((res) => {
      if (res && res.length > 0) {
        let obj = {
          id: processId,
          steps: res[0],
          permissions: res[1],
          contractID:
            this.action !== 'edit' ? res[2] : this.contracts?.contractID,
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
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getSettingFields(processSetting, listInstanceSteps) {
    this.isShowFieldLeft = processSetting?.addFieldsControl == '1';
    this.setAutoNameTabFields(processSetting?.autoNameTabFields);
    this.itemTabsInput(this.ischeckFields(listInstanceSteps));
  }

  setAutoNameTabFields(autoNameTabFields) {
    this.nameTabFieldsSetting = autoNameTabFields;
    if (this.tabField) {
      this.tabField.text = autoNameTabFields?.trim()
        ? autoNameTabFields?.trim()
        : 'Thông tin mở rộng';
    }
  }

  ischeckFields(liststeps: any): boolean {
    this.listField = [];
    if (this.action !== 'edit') {
      let stepCurrent = liststeps[0];
      if (stepCurrent && stepCurrent.fields?.length > 0) {
        let fieldIdAllTask = stepCurrent.tasks
          .filter((task) => task?.fieldID && task?.fieldID?.trim())
          .map((task) => task.fieldID)
          .flatMap((item) => item.split(';').filter((item) => item !== ''));

        let listField = stepCurrent.fields.filter(
          (field) =>
            !fieldIdAllTask.includes(
              this.action === 'copy' ? field?.recID : field?.refID
            )
        );
        this.listField = listField || [];
      }
    } else {
      let idxCrr = liststeps.findIndex(
        (x) => x.stepID == this.contracts?.stepID
      );
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
            this.listField = [...this.listField, ...listFields];
          }
        }
      }
    }
    return this.listField != null && this.listField?.length > 0;
  }
  itemTabsInput(check: boolean): void {
    let menuInput = this.tabInfo.findIndex(
      (item) => item?.name === this.tabField?.name
    );
    let tabInput = this.tabContent.findIndex((item) => item === this.fieldTemp);
    if (this.isShowFieldLeft) {
      if (check && menuInput == -1 && tabInput == -1) {
        this.tabInfo.splice(2, 0, this.tabField);
        this.tabContent.splice(2, 0, this.fieldTemp);
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

  addFileCompleted(e) {
    this.isBlock = e;
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
          result = event?.e;
          break;
        case 'C':
          result = event?.e;
          let type = event?.type ?? '';
          let contact = event?.result ?? '';
          this.convertToFieldDp(contact, type);
          break;
      }
      let index = this.listInstanceSteps.findIndex(
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

  //#region CRUD
  checkRequiredTask() {
    if (this.type == 'task') {
      let message = [];
      if (!this.isSaveTimeTask) {
        this.notiService.notifyCode('DP019');
        return;
      }
      if (!this.stepsTasks['taskName']?.trim()) {
        message.push(this.view['taskName']);
      }
      if (this.stepsTasks?.roles?.length <= 0) {
        message.push(this.view['roles']);
      }

      if (this.isStartIns) {
        if (this.stepsTasks?.status != '3') {
          if (!this.stepsTasks?.startDate) {
            message.push(this.view['startDate']);
          }
          if (!this.stepsTasks?.endDate) {
            message.push(this.view['endDate']);
          }
        }
      } else {
        if (
          !this.stepsTasks['durationDay'] &&
          !this.stepsTasks['durationHour']
        ) {
          message.push(this.view['durationDay']);
        }
      }
      if (message.length > 0) {
        this.notiService.notifyCode('SYS009', 0, message.join(', '));
        return;
      }
    }
  }

  checkRequiredContract() {}

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

  save() {
    if (this.stepService.checkRequire(this.REQUIRE, this.contracts, this.view))
      return;
    if (
      this.contracts?.delPhone &&
      !this.stepService.isValidPhoneNumber(this.contracts?.delPhone)
    ) {
      this.notiService.notifyCode('RS030');
      return;
    }
    if (this.contracts.contractID && this.contracts.contractID.includes(' ')) {
      this.notiService.notifyCode(
        'CM026',
        0,
        '"' + this.grvSetup['ContractID'].headerText + '"'
      );
      return;
    }
    if (this.isExitAutoNum) {
      this.notiService.notifyCode(
        'CM003',
        0,
        '"' + this.grvSetup['ContractID'].headerText + '"'
      );
      return;
    }
    this.checkRequiredTask();
    this.contracts.applyProcess &&
      this.convertDataInstance(this.contracts, this.instance);
    this.contracts.applyProcess &&
      this.updateDateDeal(this.instance, this.contracts);

    switch (this.action) {
      case 'add':
      case 'copy':
      case 'extend':
        if (this.contracts.applyProcess) {
          this.addInstance();
        } else {
          this.addContracts();
        }
        break;
      case 'edit':
        if (this.contracts.applyProcess) {
          this.editInstance();
        } else {
          this.editContract();
        }
        
        break;
    }
  }

  addInstance() {
    if (this.type == 'contract') {
      let data = [this.instance, this.listInstanceSteps, this.oldIdInstance];
      this.cmService.addInstance(data).subscribe((instance) => {
        if (instance) {
          // this.instanceRes = instance;
          this.contracts.status = instance.status;
          this.contracts.datas = instance.datas;
          this.contracts.stepID = instance.stepID;
          this.addPermission(instance?.permissions);
          this.addContracts();
        }
      });
    } else if (this.type == 'DP') {
      this.dialog.dataService
        .save((option: any) => this.beforeSaveInstance(option))
        .subscribe((res) => {
          if (res && res.save) {
            this.contracts.status = res?.save?.status;
            this.contracts.datas = res?.save?.datas;
            this.addPermission(res?.save?.permissions);
            this.addContracts();
            this.dialog.close(res?.save);
            this.changeDetectorRef.detectChanges();
          }
        });
    }
  }
  async editInstance() {
    if (this.type == 'contract') {
      let data = [this.instance, this.listCustomFile];
      this.cmService.editInstance(data).subscribe((instance) => {
        if (instance) {
          // this.instanceRes = instance;
          this.contracts.status = instance.status;
          this.contracts.datas = instance.datas;
          this.contracts.permissions = this.contracts?.permissions?.filter(
            (x) => x.memberType != '2'
          );
          this.addPermission(instance.permissions);
          this.editContract();
        }
      });
    } else if(this.type == 'DP') {
      this.dialog.dataService
      .save((option: any) => this.beforeSaveInstance(option))
      .subscribe((res) => {
        if (res.update) {
          this.contracts.status = res?.update?.status;
          this.contracts.datas = res?.update?.datas;
          this.contracts.permissions = this.contracts?.permissions.filter(
            (x) => x.memberType != '2'
          );
          this.addPermission(res?.update?.permissions);
          let datas = [
            this.contracts,
            null,
            this.lstContactDeal,
            null,
            this.lstContactDelete,
          ];
          this.editContract();
          this.dialog.close(res?.update);
        }
      });
    }
  }

  addContracts() {
    if (this.type == 'contract') {
      this.dialog.dataService
        .save((opt: any) => this.beforeSave(opt), 0)
        .subscribe((res) => {
          if (res.save) {
            (this.dialog.dataService as CRUDService)
              .update(res.save)
              .subscribe();
            this.dialog.close(res.save);
          } else {
            this.dialog.close();
          }
          this.changeDetectorRef.markForCheck();
        });
    } else if (this.type == 'DP') {
      this.cmService.addContracts([this.contracts]).subscribe((res) => {
        if (res) {
        }
      });
    } else {
      this.cmService
        .addContracts([this.contracts, this.listPaymentAdd])
        .subscribe((res) => {
          if (res) {
            this.dialog.close({ contract: res, action: this.action });
          }
        });
    }
  }

  beforeSave(op: RequestOption) {
    if (
      this.action == 'add' ||
      this.action == 'copy' ||
      this.action == 'extend'
    ) {
      op.methodName = 'AddContractsAsync';
      op.data = [this.contracts];
    }
    if (this.action == 'edit') {
      op.methodName = 'UpdateContractAsync';
      op.data = [this.contracts];
    }
    return true;
  }

  convertDataInstance(contract: CM_Contracts, instance: tmpInstances) {
    this.oldIdInstance = this.contracts?.refID; 
    // this.contracts.refID = Util.uid();
    if (this.action === 'edit') {
      instance.recID = contract.refID;
    }
    if (this.action !== 'edit') {
      instance.startDate = null;
      instance.status = '1';
    }
    instance.title = contract?.contractName?.trim();
    instance.memo = contract?.note?.trim();
    instance.endDate = contract.effectiveTo;
    instance.instanceNo = contract.contractID;
    instance.owner = contract?.owner;
    instance.processID = contract.processID;
    instance.stepID = contract.stepID;
  }

  addPermission(permissionDP) {
    if (permissionDP && permissionDP?.length > 0) {
      this.contracts.permissions = this.contracts?.permissions
        ? this.contracts.permissions
        : [];
      for (let item of permissionDP) {
        this.contracts.permissions.push(this.copyPermission(item));
      }
    }
  }
  updateDateDeal(instance: tmpInstances, contract: CM_Contracts) {
    if (this.action !== 'edit') {
      contract.stepID = this.listInstanceSteps[0].stepID;
      contract.status = '1';
      contract.refID = instance.recID;
    }
    // deal.owner = this.owner;
    // deal.salespersonID = this.owner;
  }

  editContract() {
    if (this.dialog?.dataService) {
      this.dialog.dataService
        .save((opt: any) => this.beforeSave(opt))
        .subscribe((res) => {
          if (res.update) {
            (this.dialog.dataService as CRUDService)
              .update(res.update)
              .subscribe();
            this.dialog.close({ contract: res.update, action: this.action });
            this.changeDetectorRef.markForCheck();
          } else {
            this.dialog.close();
          }
        });
    } else {
      let data = [this.contracts];
      this.cmService.editContracts(data).subscribe((res) => {
        if (res) {
          this.dialog.close({ contract: res, action: this.action });
        }
      });
    }
  }
  //#endregion
}
