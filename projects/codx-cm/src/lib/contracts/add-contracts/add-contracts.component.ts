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
  CacheService,
  ApiHttpService,
  CallFuncService,
  CodxInputComponent,
  NotificationsService,
  CodxFormComponent,
  RequestOption,
  SidebarModel,
  DialogModel,
} from 'codx-core';
import { Observable, Subject, firstValueFrom, takeUntil } from 'rxjs';
import { CodxCmService } from '../../codx-cm.service';
import { ContractsService } from '../service-contracts.service';
import { StepService } from 'projects/codx-share/src/lib/components/codx-step/step.service';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { PopupAddCategoryComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-category/popup-add-category.component';

@Component({
  selector: 'add-contracts',
  templateUrl: './add-contracts.component.html',
  styleUrls: ['./add-contracts.component.scss'],
})
export class AddContractsComponent implements OnInit, AfterViewInit{
  @ViewChild('information') information: TemplateRef<any>;
  @ViewChild('reference') reference: TemplateRef<any>;
  @ViewChild('extend') extend: TemplateRef<any>;
  @ViewChild('task') task: TemplateRef<any>;

  @ViewChild('more') more: TemplateRef<any>;
  @ViewChild('inputDeal') inputDeal: CodxInputComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('inputQuotation') inputQuotation: CodxInputComponent;
  @ViewChild('inputContact') inputContact: CodxInputComponent;
  REQUIRE = [
    'contractID',
    'contractType',
    'businessLineID',
    'contractName',
    'customerID',
    'contractAmt',
    'pmtMethodID',
    'pmtMethodID',
    'effectiveFrom',
  ];
  @ViewChild('form') form: CodxFormComponent;
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
  // instance: tmpInstances = new tmpInstances();

  view = [];
  isLoadDate = true;
  checkPhone = true;
  isErorrDate = true;
  customerIdOld = null;
  disabledDelActualDate = false;

  user;
  contractRefID = '';
  action = 'add';
  tabClicked = '';
  customerID = {};
  headerTest = '';
  listTypeContract = [];
  type: 'view' | 'DP' | 'deal' | 'quotation' | 'customer' | 'task';
  listMemorySteps: any[] = [];
  listInstanceSteps: any[] = [];
  listCustomFile: any[] = [];
  listField = [];
  processID = '';

  listParticipants;
  objPermissions = {};
  formModel: FormModel = {
    entityName: 'CM_Contracts',
    entityPer: 'CM_Contracts',
    formName: 'CMContracts',
    funcID: 'CM0204',
    gridViewName: 'grvCMContracts',
  };

  listProcessNo = [];

  readonly fieldCbxParticipants = { text: 'objectName', value: 'objectID' };

  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
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
  disabledShowInput: boolean = false;
  planceHolderAutoNumber: any = '';
  grvSetup: any;
  isExitAutoNum: any = false;
  idxCrr: number = -1;

  // Tab control
  tabInfo = [
    {icon: 'icon-info', text: 'Thông tin chung', name: 'GeneralInfo', subName: 'General information', subText: 'General information'},
    {icon: 'icon-reorder', text: 'Tham chiếu', name: 'InputInfo', subName: 'Input information', subText: 'Input information'},
    {icon: 'icon-contact_phone', text: 'Mở rộng', name: 'GeneralContact', subName: 'General contact', subText: 'General contact'}
  ]
  tabContent: any[] = [];
  recIDContract = '';
  autoNumber = '';
  isApplyProcess = false;
  countInputChangeAuto = 0;
  processIdDefault = '';
  stepsTasks;
  isActivitie = false;
  listApproverView;
  currencyIDDefault = '';
  frmModelInstancesTask = {
    funcID: 'DPT040102',
    formName: 'DPInstancesStepsTasks',
    entityName: 'DP_Instances_Steps_Tasks',
    gridViewName: 'grvDPInstancesStepsTasks',
  };
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
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.dialog = dialog;
    this.type = dt?.data?.type;
    this.action = dt?.data?.action;
    this.account = dt?.data?.account;
    this.projectID = dt?.data?.projectID;
    this.processID = dt?.data?.processID;
    this.headerTest = dt?.data?.actionName;
    this.contractRefID = dt?.data?.contractRefID;
    this.recIDContract = dt?.data?.recIDContract;
    this.contractsInput = dt?.data?.contract || dt?.data?.dataCM || null;
    this.stepsTasks = dt?.data?.stepsTasks || {};
    this.user = this.authStore.get();
    this.getTitle();
    this.getFormModel();
    this.getGrvSetup();
  }

  async ngOnInit() {
    if(this.action !="edit"){
      await this.getSettingContract();
    }
    this.setDataContract(this.contractsInput);
  }

  async ngAfterViewInit(){
    this.tabContent = [this.information,this.reference,this.extend];
    if(this.type == 'task'){
      this.tabInfo.push({icon: 'icon-more', text: 'Công việc', name: 'General task', subName: 'General task', subText: 'General task'});
      this.tabContent.push(this.task);
    }
  }

  //#region setData
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
        this.contracts.applyProcess = this.isApplyProcess;
        this.contracts.currencyID = this.currencyIDDefault;
        this.contracts.pmtStatus = this.contracts.pmtStatus ? this.contracts.pmtStatus : '0';
        this.contracts.contractType = this.contracts.contractType ? this.contracts.contractType : '1';
        this.loadExchangeRate(this.contracts.currencyID);
        this.setContractByDataOutput();
        this.getAutoNumber();
        break;
      case 'edit':
        if (data) {
          this.contracts = data;
        } else if (this.contractRefID) {
          let dataEdit = await firstValueFrom(
            this.contractService.getContractByRefID(this.contractRefID)
          );
          if (dataEdit) {
            this.contracts = dataEdit;
          }
        }else if (this.recIDContract){
          let dataEdit = await firstValueFrom(
            this.contractService.getContractByRecID(this.recIDContract)
          );
          if (dataEdit) {
            this.contracts = dataEdit;
          }
        }
        this.getCustomersDefaults(this.contracts?.customerID);
        break;
      case 'copy':
        if (data) {
          this.contracts = data;
        } else if (this.contractRefID) {
          let dataCopy = await firstValueFrom(
            this.contractService.getContractByRefID(this.contractRefID)
          );
          if (dataCopy) {
            this.contracts = dataCopy;
          }
        }else if (this.recIDContract){
          let dataCopy = await firstValueFrom(
            this.contractService.getContractByRecID(this.recIDContract)
          );
          if (dataCopy) {
            this.contracts = dataCopy;
          }
        }
        delete this.contracts['id'];
        this.contracts.recID = Util.uid();
        if(!this.contracts?.applyProcess){
          this.getAutoNumber();
        }else{
          this.disabledShowInput = true;
        }

        break;
      default:
    }
  }

  setContractByDataOutput() {
    if (this.contracts.dealID) {
      this.getCustomerByDealID(this.contracts.dealID);
    }
    if (this.contracts.customerID) {
      this.getCustomerByrecID(this.contracts.customerID);
    }
  }

  setDataContractCombobox(customer) {
    this.customerIdOld = this.contracts.customerID;
    this.customer = customer;
    this.customerID = { customerID: customer?.recID };
    this.contracts.customerID = customer?.recID;
    this.contracts.taxCode = customer?.taxCode;
    this.contracts.address = customer?.address;
    this.contracts.phone = customer?.phone;
    this.contracts.faxNo = customer?.faxNo;
    this.contracts.representative = null;
    this.contracts.jobTitle = null;
    this.contracts.bankAccount = customer?.bankAccount;
    this.contracts.bankID = customer?.bankID;
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
      this.isApplyProcess  =this.type == 'DP' ? true : dataValue?.ProcessContract == '1';
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
  GetProcesIDDefault(){
    if(this.processIdDefault){
      this.contracts.processID = this.processIdDefault;
    }else{
      this.contractService.GetProcessIdDefault("4").subscribe(res => {
        if(res){
          this.contracts.processID = res;
          this.processIdDefault = res;
        }
      })
    }

  }
  GetProcessNoByProcessID(processID){
    let process = this.listProcessNo?.find(x => x?.processID === processID);
    if(process){
      this.contracts.contractID = process?.processNo;
    }else{
      this.contractService.GetProcessNoByProcessID(processID).subscribe((res) => {
        if(res){
          this.contracts.contractID = res;
          this.listProcessNo = this.listProcessNo?.length == 0 ? [] : this.listProcessNo;
          this.listProcessNo?.push({processID: processID,  processNo: res});
        }else{
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
    if(this.countInputChangeAuto == 0 && !(this.autoNumber && this.isApplyProcess)){
      if (!this.disabledShowInput && this.action !== 'edit' && e) {
        this.contracts.contractID = e?.data;
        if (this.contracts.contractID && this.contracts.contractID.includes(' '))
        {
          this.notiService.notifyCode('CM026',0,'"' + this.grvSetup['ContractID'].headerText + '"');
          return;
        }
        this.cmService
          .isExitsAutoCodeNumber('ContractsBusiness', this.contracts.contractID)
          .subscribe((res) => {
            this.isExitAutoNum = res;
            if (this.isExitAutoNum) this.notiService.notifyCode('CM003',0,'"' + this.grvSetup['ContractID'].headerText + '"');
          });
      }
      this.countInputChangeAuto = 1;
    }else{
      this.countInputChangeAuto = 0; // core chạy 2 lần
    }
  }
  //#endregion

  //#region CRUD
  save(){
    if (this.stepService.checkRequire(this.REQUIRE, this.contracts, this.view)) return;
    if (this.contracts?.delPhone && !this.stepService.isValidPhoneNumber(this.contracts?.delPhone)) {
      this.notiService.notifyCode('RS030');
      return;
    }
    if (this.contracts.contractID && this.contracts.contractID.includes(' ')) {
      this.notiService.notifyCode('CM026',0,'"' + this.grvSetup['ContractID'].headerText + '"');
      return;
    }
    if (this.isExitAutoNum) {
      this.notiService.notifyCode('CM003',0,'"' + this.grvSetup['ContractID'].headerText + '"');
      return;
    }
    switch (this.action) {
      case 'add':
      case 'copy':
        this.addContracts();
        break;
      case 'edit':
        this.editContract();
        break;
    }
  }

  beforeSave(op: RequestOption) {
    if (this.action == 'add' || this.action == 'copy') {
      op.methodName = 'AddContractsAsync';
      op.data = [this.contracts];
    }
    if (this.action == 'edit') {
      op.methodName = 'UpdateContractAsync';
      op.data = [this.contracts];
    }
    return true;
  }

  async addContracts() {
    if (this.type == 'view') {
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
          // this.changeDetector.detectChanges();
        });
    } else if (this.type == 'DP') {
      // this.setDataInstance(this.contracts, this.instance);
      // let instance = await this.addInstance();
      // this.cmService
      //   .addContracts([this.contracts, this.listPaymentAdd])
      //   .subscribe((res) => {
      //     if (res) {
      //       this.dialog.close({ instance: instance });
      //     }
      //   });
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

  editContract() {
    if (this.type == 'view') {
      this.dialog.dataService
        .save((opt: any) => this.beforeSave(opt))
        .subscribe((res) => {
          this.dialog.close({ contract: res, action: this.action });
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
  }

  valueChangeCombobox(event) {
    if(event?.data != this.contracts[event?.field] ){
      this.contracts[event?.field] = event?.data;
      if (event?.field == 'dealID' && event?.data) {
        if (!this.contracts.customerID) {
          this.getCustomerByDealID(event?.data);
          this.setValueComboboxQuotation();
        }
      }
      if (event?.field == 'quotationID' && event?.data) {
        // this.getDataByQuotationID(event?.data);
        if (!this.contracts.customerID) {
          this.setValueComboboxDeal();
        }
      }
      if (event?.field == 'customerID' && event?.data) {
        this.setValueComboboxQuotation();
        this.setValueComboboxDeal();
        this.getCustomerByrecID(event?.data);
        this.getCustomersDefaults(event?.data);
        this.contractService.getOneContactByObjectID(event?.data).subscribe(res => {
          if(res){
            if(this.inputContact && this.inputContact?.ComponentCurrent){
              this.contracts.contactID = res;
              this.inputContact?.ComponentCurrent?.setValue(res);
            }
          }else{
            this.contracts.contactID = null;
            this.inputContact?.ComponentCurrent?.setValue(null);
          }
        })
      }

      if (event?.field == 'delStatus') {
        this.disabledDelActualDate =
          event?.data == '0' || event?.data == '1' ? true : false;
      }
      if (event?.field == 'businessLineID' && event?.data) {
        let processID = event?.component?.itemsSelected ? event?.component?.itemsSelected[0]?.ProcessContractID : null;
        this.contracts.businessLineID = event?.data;
        if(processID){
          this.contracts.processID = processID;
        }else{
          this.GetProcesIDDefault();
        }
        if(this.isApplyProcess && this.autoNumber){
          this.GetProcessNoByProcessID(processID);
        }
      }
    }
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
      }
    }
  }

  setValueComboboxQuotation() {
    let listQuotation = this.inputQuotation.ComponentCurrent.dataService.data;
    if (listQuotation) {
      if (this.customerIdOld != this.contracts.customerID) {
        this.contracts.quotationID = null;
        this.inputQuotation.ComponentCurrent.dataService.data = [];
      }
    }
  }

  changeValueDate(event) {
    this.contracts[event?.field] = new Date(event?.data?.fromDate);
    if (event?.field == 'effectiveTo' && this.isLoadDate) {
      const startDate = new Date(this.contracts['effectiveFrom']);
      const endDate = new Date(this.contracts['effectiveTo']);
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
  getTitle(){
    this.cache.functionList(this.dialog?.formModel.funcID).subscribe((f) => {
      if (f) {
        if (this.headerTest) {
          this.headerTest =
            this.headerTest + ' ' + f?.defaultName.toString().toLowerCase();
        } else {
          this.headerTest = f?.defaultName.toString().toLowerCase();
        }
      }
    });
  }
  getGrvSetup(){
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

  getCustomerByrecID(recID) {
    this.contractService.getCustomerByRecID(recID).subscribe((res) => {
      if (res) {
        this.setDataContractCombobox(res);
      }
    });
  }

  getQuotationsAndQuotationsLinesByTransID(recID) {
    this.contractService.getQuotationsLinesByTransID(recID).subscribe((res) => {
      if (res) {
        this.quotations = res[0];
      }
    });
  }

  //#endregion

  changeValueTextTask(event){
    this.stepsTasks[event?.field] = event?.data;
  }

  changeValueDateTask(event){
    this.stepsTasks[event?.field] = event?.data;
  }

  valueChangeAlertTask(event){
    this.stepsTasks[event?.field] = event?.data;
  }

async clickSettingApprove() {
    let category;
    let idTask = this.stepsTasks?.isTaskDefault ? this.stepsTasks?.refID : this.stepsTasks?.recID;
    if (this.action == 'edit')
      category = await firstValueFrom(
        this.api.execSv<any>(
          'ES',
          'ES',
          'CategoriesBusiness',
          'GetByCategoryIDAsync',
          idTask
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
            category.Category = this.isActivitie ? 'DP_Activities' : 'DP_Instances_Steps_Tasks';
            category.categoryID = idTask;
            category.categoryName = this.stepsTasks.taskName;
            category.createdBy = this.user.userID;
            category.owner = this.user.userID;
            category.FunctionApproval = this.isActivitie ? 'DPT07' : 'DPT04';
            this.actionOpenFormApprove2(category, true);
          }
        });
    }
  }
  private destroyFrom$: Subject<void> = new Subject<void>();
  titleAction: any;

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
                  templateRefID: this.stepsTasks?.isTaskDefault ? this.stepsTasks?.refID : this.stepsTasks?.recID,
                  templateRefType: this.isActivitie ? 'DP_Activities' : 'DP_Instances_Steps_Tasks',
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
    let idTask = this.stepsTasks?.isTaskDefault ? this.stepsTasks?.refID : this.stepsTasks?.recID;
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

  //#region Quotation
  // getQuotationsLinesInContract(contractID, quotationID) {
  //   this.contractService
  //     .getQuotationsLinesInContract([contractID || null, quotationID || null])
  //     .subscribe((res) => {
  //       if (res) {
  //         if (res?.length > 0) {
  //           this.listQuotationsLine = res;
  //           this.contracts.contractAmt = this.sumNetAmtQuotations();
  //           this.listQuotationsLine = this.listQuotationsLine.sort(
  //             (a, b) => a.rowNo - b.rowNo
  //           );
  //           this.listQLineOfContract = this.listQuotationsLine.filter(
  //             (quotationsLine) => quotationsLine?.contractID
  //           );
  //           if (this.action == 'copy' && this.listQLineOfContract?.length > 0) {
  //             this.listQLineOfContract = this.listQLineOfContract.map(
  //               (item) => {
  //                 return { ...item, contractID: this.contracts?.recID };
  //               }
  //             );
  //           }
  //         }
  //       } else {
  //         this.listQuotationsLine = [];
  //         this.contracts.contractAmt = null;
  //       }
  //       this.listQuotationsLine = res?.length > 0 ? res : [];
  //     });
  // }

  // getDataByQuotationID(recID) {
  //   // quotation, quotationsLine, customer
  //   this.listQLineOfContract = this.listQuotationsLine.filter(
  //     (quotationsLine) => quotationsLine?.contractID
  //   );
  //   this.contractService.getDataByTransID(recID).subscribe((res) => {
  //     if (res) {
  //       let quotation = res[0];
  //       let quotationsLine = res[1];
  //       let customer = res[2];
  //       let countQuotation = quotationsLine?.length || 0;
  //       this.listQLineOfContract = this.listQLineOfContract.map(
  //         (item, index) => ({ ...item, rowNo: index + countQuotation + 1 })
  //       );
  //       let qLinesNotEdit = this.listQLineOfContract.filter(
  //         (qLine) =>
  //           !this.quotationLinesEdit.some(
  //             (qLinesEdit) => qLinesEdit.recID === qLine.recID
  //           )
  //       );
  //       this.quotationLinesEdit = [
  //         ...this.quotationLinesEdit,
  //         ...qLinesNotEdit,
  //       ];
  //       this.listQuotationsLine = [
  //         ...this.listQLineOfContract,
  //         ...quotationsLine,
  //       ];
  //       this.listQuotationsLine = this.listQuotationsLine.sort(
  //         (a, b) => a.rowNo - b.rowNo
  //       );
  //       this.quotations = quotation;
  //       this.setDataContractCombobox(customer);
  //       this.contracts.dealID = quotation?.refID;
  //       this.contracts.contractAmt = this.sumNetAmtQuotations(); // giá trị hợp đồng
  //       this.contracts.paidAmt = this.contracts.paidAmt || 0; // số tiền đã thanh toán
  //       this.contracts.remainAmt =
  //         Number(this.contracts.contractAmt) - Number(this.contracts.paidAmt); // số tiền còn lại
  //       this.contracts.currencyID = quotation.currencyID; // tiền tệ
  //       this.contracts.exchangeRate = quotation.exchangeRate; // tỷ giá
  //     }
  //   });
  // }

  // eventQuotationLines(e) {
  //   this.listQuotationsLine = e?.listQuotationLines;
  //   this.quotationLinesAddNew = e?.quotationLinesAddNew;
  //   this.quotationLinesEdit = e?.quotationLinesEdit;
  //   this.quotationLinesDeleted = e?.quotationLinesDeleted;
  //   let quotationLine = this.quotationLinesAddNew.find(
  //     (quotationLine) => quotationLine.recID == e?.quotationLineIdNew
  //   );
  //   if (quotationLine) {
  //     quotationLine.transID = null;
  //     quotationLine.contractID = this.contracts?.recID;
  //     this.listQLineOfContractAdd.push(quotationLine);
  //   }
  //   this.loadTotal();
  // }

  // loadTotal() {
  //   let totals = 0;
  //   let totalVAT = 0;
  //   let totalDis = 0;
  //   let totalSales = 0;
  //   if (this.listQuotationsLine?.length > 0) {
  //     this.listQuotationsLine.forEach((element) => {
  //       totalSales += element['salesAmt'] ?? 0;
  //       totals += element['netAmt'] ?? 0;
  //       totalVAT += element['vatAmt'] ?? 0;
  //       totalDis += element['discAmt'] ?? 0;
  //     });
  //   }
  //   this.contracts.contractAmt = totals;
  //   this.contracts.remainAmt =
  //     Number(this.contracts.contractAmt) - Number(this.contracts.paidAmt);

  //   this.quotations['totalSalesAmt'] = totalSales;
  //   this.quotations['totalAmt'] = totals;
  //   this.quotations['totalTaxAmt'] = totalVAT;
  //   this.quotations['discAmt'] = totalDis;
  // }

  // sumNetAmtQuotations() {
  //   // tính tổng giá trị của mặt hàng
  //   if (this.listQuotationsLine?.length > 0) {
  //     let contractAmt = this.listQuotationsLine.reduce((sum, item) => {
  //       return sum + item?.netAmt || 0;
  //     }, 0);
  //     return contractAmt;
  //   }
  //   return 0;
  // }
  //#endregion
  //#region CRUD


  // beforeSaveInstance(option: RequestOption) {
  //   if (this.action === 'add' || this.action === 'copy') {
  //     option.methodName = 'AddInstanceAsync';
  //     option.data = [this.instance, this.listInstanceSteps, null];
  //   } else if (this.action === 'edit') {
  //     option.methodName = 'EditInstanceAsync';
  //     option.data = [this.instance, this.listCustomFile];
  //   }

  //   return true;
  // }


  //#endregion
  //#region Save


  // setDataInstance(contract: CM_Contracts, instance: tmpInstances) {
  //   instance.title = contract?.contractName;
  //   instance.instanceNo = contract?.contractID;
  //   instance.owner = contract.owner;
  //   instance.processID = contract?.processID;
  //   instance.status = '1';
  //   contract.refID = instance?.recID;
  //   contract.stepID = this.listInstanceSteps
  //     ? this.listInstanceSteps[0]?.stepID
  //     : contract.stepID;
  //   contract.status = this.action == 'add' ? '1' : contract.status;
  // }

  // async addInstance() {
  //   var data = [this.instance, this.listInstanceSteps, this.contractRefID];
  //   let instance = await firstValueFrom(this.cmService.addInstance(data));
  //   if (instance) {
  //     let listPermissions = instance?.permissions;
  //     if (listPermissions?.length > 0) {
  //       let listPermission = [];
  //       listPermissions.forEach((p) => {
  //         let permissions = new CM_Permissions();
  //         permissions.recID = Util.uid();
  //         permissions.objectID = p?.objectID;
  //         permissions.objectName = p?.objectName;
  //         permissions.objectType = p?.objectType;
  //         permissions.roleType = p?.roleType;
  //         permissions.memberType = '2';
  //         permissions.full = true;
  //         permissions.read = p?.read;
  //         permissions.edit = p?.edit;
  //         permissions.create = p?.create;
  //         permissions.update = p?.update;
  //         permissions.assign = p?.assign;
  //         permissions.delete = p?.delete;
  //         permissions.share = p?.share;
  //         permissions.upload = p?.upload;
  //         permissions.download = p?.download;
  //         permissions.allowUpdateStatus = p?.allowUpdateStatus;
  //         listPermission.push(permissions);
  //       });
  //       this.contracts.permissions = listPermission;
  //     }
  //     return instance;
  //   } else {
  //     return null;
  //   }
  // }
  //#endregion

  // getPayMentByContractID(contractID) {
  //   this.contractService
  //     .getPaymentsByContractID(contractID)
  //     .subscribe((res) => {
  //       if (res) {
  //         let listPayAll = res as CM_ContractsPayments[];
  //         this.listPayment = listPayAll.filter((pay) => pay.lineType == '0');
  //         this.listPaymentHistory = listPayAll.filter(
  //           (pay) => pay.lineType == '1'
  //         );
  //       }
  //     });
  // }


  //#endregion
  //#region payment
  // addPayment() {
  //   let payment = new CM_ContractsPayments();
  //   payment.lineType = '0';
  //   this.openPopupPayment('add', payment);
  // }

  // editPayment(payment) {
  //   this.openPopupPayment('edit', payment);
  // }

  // deletePayment(payment) {
  //   this.notiService.alertCode('SYS030').subscribe((res) => {
  //     if (res.event.status === 'Y') {
  //       let indexPayDelete = this.listPayment.findIndex(
  //         (payFind) => payFind.recID == payment.recID
  //       );
  //       if (indexPayDelete >= 0) {
  //         this.listPayment.splice(indexPayDelete, 1);
  //         this.listPaymentDelete.push(payment);
  //         for (
  //           let index = indexPayDelete;
  //           index < this.listPayment.length;
  //           index++
  //         ) {
  //           this.listPayment[index].rowNo = index + 1;
  //         }
  //         this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
  //       }
  //     }
  //   });
  // }

  // async openPopupPayment(action, payment) {
  //   let dataInput = {
  //     action,
  //     payment,
  //     listPayment: this.listPayment,
  //     listPaymentAdd: this.listPaymentAdd,
  //     listPaymentEdit: this.listPaymentEdit,
  //     listPaymentDelet: this.listPaymentDelete,
  //     contract: this.contracts,
  //   };

  //   let option = new DialogModel();
  //   option.IsFull = false;
  //   option.zIndex = 1021;
  //   option.FormModel = this.fmContractsPayments;
  //   let popupPayment = this.callfunc.openForm(
  //     PopupAddPaymentComponent,
  //     '',
  //     550,
  //     400,
  //     '',
  //     dataInput,
  //     '',
  //     option
  //   );

  //   popupPayment.closed.subscribe((res) => {
  //     if (res) {
  //       this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
  //     }
  //   });
  // }

  // addPayHistory(payment) {
  //   let payMentHistory = new CM_ContractsPayments();
  //   let countPayMent = this.listPayment.length;
  //   payMentHistory.rowNo = countPayMent + 1;
  //   payMentHistory.refNo = this.contracts?.recID;
  //   payMentHistory.lineType = '1';
  //   this.openPopupPaymentHistory('add', payment, payMentHistory);
  // }

  // viewPayHistory(payment, width: number, height: number) {
  //   let dataInput = {
  //     isSave: false,
  //     payment,
  //     listPaymentHistory: this.listPaymentHistory,
  //     listPaymentAdd: this.listPaymentAdd,
  //     listPaymentEdit: this.listPaymentEdit,
  //     listPaymentDelete: this.listPaymentDelete,
  //     contracts: this.contracts,
  //     listPayment: this.listPayment,
  //   };

  //   let option = new DialogModel();
  //   option.IsFull = false;
  //   option.zIndex = 1021;
  //   option.FormModel = this.fmContractsPayments;
  //   let popupPayHistory = this.callfunc.openForm(
  //     PopupViewPaymentHistoryComponent,
  //     '',
  //     width,
  //     height,
  //     '',
  //     dataInput,
  //     '',
  //     option
  //   );
  // }

  // async openPopupPaymentHistory(action, payment, paymentHistory) {
  //   let dataInput = {
  //     action,
  //     payment,
  //     paymentHistory,
  //     contract: this.contracts,
  //     listPayment: this.listPayment,
  //     listPaymentHistory: this.listPaymentHistory,
  //     listPaymentAdd: this.listPaymentAdd,
  //     listPaymentEdit: this.listPaymentEdit,
  //     listPaymentDelet: this.listPaymentDelete,
  //   };

  //   let formModel = new FormModel();
  //   formModel.entityName = 'CM_ContractsPayments';
  //   formModel.formName = 'CMContractsPayments';
  //   formModel.gridViewName = 'grvCMContractsPayments';

  //   let option = new DialogModel();
  //   option.IsFull = false;
  //   option.zIndex = 1021;
  //   option.FormModel = formModel;

  //   let popupPaymentHistory = this.callfunc.openForm(
  //     PopupAddPaymentHistoryComponent,
  //     '',
  //     600,
  //     400,
  //     '',
  //     dataInput,
  //     '',
  //     option
  //   );

  //   popupPaymentHistory.closed.subscribe((res) => {
  //     if (res) {
  //       this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
  //     }
  //   });
  // }
  //#endregion
  //#region click
  // changeTab(e) {
  //   this.tabClicked = e;
  // }

  // addFile(evt: any) {
  //   this.attachment.uploadFile();
  // }

  // onClickMFPayment(e, data) {
  //   switch (e.functionID) {
  //     case 'SYS02':
  //       this.deletePayment(data);
  //       break;
  //     case 'SYS03':
  //       this.editPayment(data);
  //       break;
  //     case 'SYS04':
  //       console.log(data);
  //       // this.copyContract(data);
  //       break;
  //     case 'CM02041_1': //xem lịch sử
  //       this.viewPayHistory(data, 1200, 500);
  //       break;
  //     case 'CM02041_2': // thêm lịch sử
  //       this.addPayHistory(data);
  //       break;
  //   }
  // }
  //#endregion

  //#region proress
  // cbxProcessChange(event) {
  //   if (event?.data) {
  //     this.contracts['processID'] = event.data;
  //     if (event) {
  //       var result = this.checkProcessInList(event); // lấy về thì giữ lại để check đỡ gọi API
  //       if (result) {
  //         this.listInstanceSteps = result?.steps;
  //         this.listParticipants = result?.permissions;
  //         this.contracts.contractID = result?.dealId;
  //         this.changeDetectorRef.detectChanges();
  //       } else {
  //         this.getListInstanceSteps(
  //           this.contracts?.processID,
  //           this.contracts.refID
  //         );
  //       }
  //     }
  //   }
  // }

  // getListInstanceSteps(processID, instanceID) {
  //   var data = [processID, instanceID, this.action, '4'];
  //   this.cmService.getInstanceSteps(data).subscribe(async (res) => {
  //     if (res && res.length > 0) {
  //       var obj = {
  //         id: processID,
  //         steps: res[0],
  //         permissions: await this.getListPermission(res[1]),
  //         dealId: res[2],
  //       };
  //       this.contracts.contractID =
  //         this.action !== 'edit' ? obj.dealId : this.contracts.contractID;
  //       var isExist = this.listMemorySteps.some((x) => x.id === processID);
  //       if (!isExist) {
  //         this.listMemorySteps.push(obj);
  //       }
  //       this.listInstanceSteps = res[0];
  //       this.getFields(this.listInstanceSteps);
  //     }
  //   });
  // }
  // checkProcessInList(processId) {
  //   var result = this.listMemorySteps.filter((x) => x.id === processId)[0];
  //   if (result) {
  //     return result;
  //   }
  //   return null;
  // }
  // getFields(steps: any) {
  //   this.listField = [];
  //   if (steps?.length > 0 && steps != null) {
  //     if (this.action == 'edit') {
  //       this.idxCrr = steps.findIndex((x) => x.stepID == this.contracts.stepID);
  //     } else this.idxCrr = 0;
  //     if (this.idxCrr != -1) {
  //       for (let i = 0; i <= this.idxCrr; i++) {
  //         if (steps[i]?.fields?.length > 0) {
  //           this.listField.push(...steps[i].fields);
  //         }
  //       }
  //     }
  //   }
  // }
  // async getListPermission(permissions) {
  //   this.listParticipants = permissions.filter((x) => x.roleType === 'P');
  //   return this.listParticipants != null && this.listParticipants.length > 0
  //     ? await this.cmService.getListUserByOrg(this.listParticipants)
  //     : this.listParticipants;
  // }
  // valueChangeCustom(event) {
  //   if (event && event.e && event.data) {
  //     var result = event.e?.data;
  //     var field = event.data;
  //     switch (field.dataType) {
  //       case 'D':
  //         result = event.e?.data.fromDate;
  //         break;
  //       case 'P':
  //       case 'R':
  //       case 'A':
  //       // case 'C': ///ko có
  //       case 'L':
  //       case 'TA':
  //       case 'PA':
  //         result = event.e;
  //         break;
  //     }
  //     var index = this.listInstanceSteps.findIndex(
  //       (x) => x.recID == field.stepID
  //     );
  //     if (index != -1) {
  //       if (this.listInstanceSteps[index].fields?.length > 0) {
  //         let idxField = this.listInstanceSteps[index].fields.findIndex(
  //           (x) => x.recID == event.data.recID
  //         );
  //         if (idxField != -1) {
  //           this.listInstanceSteps[index].fields[idxField].dataValue = result;
  //           let idxEdit = this.listCustomFile.findIndex(
  //             (x) =>
  //               x.recID == this.listInstanceSteps[index].fields[idxField].recID
  //           );
  //           if (idxEdit != -1) {
  //             this.listCustomFile[idxEdit] =
  //               this.listInstanceSteps[index].fields[idxField];
  //           } else
  //             this.listCustomFile.push(
  //               this.listInstanceSteps[index].fields[idxField]
  //             );
  //         }
  //       }
  //     }
  //   }
  // }
  //#endregion

  // loadComboboxData(comboboxName: string, service: string): Observable<any> {
  //   const dataRequest = new DataRequest();
  //   dataRequest.comboboxName = comboboxName;
  //   dataRequest.pageLoading = false;
  //   return this.api
  //     .execSv(
  //       service,
  //       'ERM.Business.Core',
  //       'DataBusiness',
  //       'LoadDataCbxAsync',
  //       [dataRequest]
  //     )
  //     .pipe(
  //       tap((p) => console.log(p)),
  //       map((p) => JSON.parse(p[0])),
  //       tap((p) => console.log(p))
  //     );
  // }

  // checkSpace(text: string) {
  //   return text.includes(' ');
  // }
}
