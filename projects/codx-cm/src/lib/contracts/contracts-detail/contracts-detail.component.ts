import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApiHttpService,
  ButtonModel,
  CRUDService,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';

import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import { PopupAddQuotationsComponent } from '../../quotations/popup-add-quotations/popup-add-quotations.component';
import { ListContractsComponent } from '../list-contracts/list-contracts.component';
import { AddContractsComponent } from '../add-contracts/add-contracts.component';
import { CM_Contracts, CM_ContractsPayments, CM_Quotations, CM_QuotationsLines } from '../../models/cm_model';
import { CodxCmService } from '../../codx-cm.service';
import { PopupAddPaymentComponent } from '../payment/popup-add-payment/popup-add-payment.component';
import { ContractsService } from '../service-contracts.service';

@Component({
  selector: 'contracts-detail',
  templateUrl: './contracts-detail.component.html',
  styleUrls: ['./contracts-detail.component.scss']
})
export class ContractsDetailComponent extends UIComponent{
  @Input() funcID: string;
  @Input() customerID: string;
  @ViewChild('contract')contract: TemplateRef<any>;

  @ViewChild('itemViewList') itemViewList?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail: TemplateRef<any>;
  //temGird
  @ViewChild('templateCreatedBy') templateCreatedBy: TemplateRef<any>;
  @ViewChild('templateStatus') templateStatus: TemplateRef<any>;
  @ViewChild('templateCustomer') templateCustomer: TemplateRef<any>;

  listPayment: CM_ContractsPayments[] = [];
  listPaymentHistory: CM_ContractsPayments[] = [];
  listQuotationsLine: CM_QuotationsLines[];
  quotations: CM_Quotations;

  listClicked =[]
  tabClicked = '';
  fomatDate = 'dd/MM/yyyy';
  account:any;

  views: Array<ViewModel> = [];
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Contracts';
  className = 'ContractsBusiness';
  methodLoadData = 'GetListContractsAsync';

  fmQuotations: FormModel = {
    formName: 'CMQuotations',
    gridViewName: 'grvCMQuotations',
    entityName: 'CM_Quotations',
    funcID: 'CM02021',
  };

  fmQuotationLines: FormModel = {
    formName: 'CMQuotationsLines',
    gridViewName: 'grvCMQuotationsLines',
    entityName: 'CM_QuotationsLines',
    funcID: 'CM02021',
  };
  fmContractsPayments: FormModel = {
    formName: 'CMContractsPayments',
    gridViewName: 'grvCMContractsPayments',
    entityName: 'CM_ContractsPayments',
    funcID: 'CM02041 ',
  };
  fmContractsPaymentsHistory: FormModel = {
    formName: 'CMContractsPaymentsHistory',
    gridViewName: 'grvCMContractsPaymentsHistory',
    entityName: 'CM_ContractsPayments',
    funcID: 'CM02042  ',
  };


  //test
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  grvSetup: any;
  vllStatus = '';

  customerIDCrr = '';
  requestData = new DataRequest();
  listQuotations = [];
  predicates = 'RefType==@0 && RefID==@1';
  dataValues = '';
  columnGrids: any;
  arrFieldIsVisible = [];
  itemSelected: any;
  button?: ButtonModel;
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false, template: null },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false, template: null },
    { name: 'Task', textDefault: 'Công việc', isActive: false, template: null },
    { name: 'Approve', textDefault: 'Ký duyệt', isActive: false, template: null },
    { name: 'References', textDefault: 'Liên kết', isActive: false, template: null },
    { name: 'Quotations', textDefault: 'Báo giá', isActive: false, template: null },
    { name: 'Order', textDefault: 'Đơn hàng', isActive: false, template: null },
  ];
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    private callFunc: CallFuncService,
    private notiService: NotificationsService,
    private changeDetector: ChangeDetectorRef,
    private cmService: CodxCmService,
    private contractService: ContractsService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
  }

  async onInit(): Promise<void> {
    this.grvSetup = await firstValueFrom(
      this.cache.gridViewSetup('CMContracts', 'grvCMContracts')
    );
    this.vllStatus = this.grvSetup['Status'].referedValue;    
    this.button = {
      id: 'btnAdd',
    };
    this.listClicked = [
      { name: 'general', textDefault: 'Thông tin chung', icon: 'icon-info', isActive: true },
      { name: 'detailItem', textDefault: 'Chi tiết mặt hàng', icon: 'icon-link', isActive: false },
      { name: 'pay', textDefault: 'Phương thức và tiến độ thanh toán', icon: 'icon-tune', isActive: false },
      { name: 'termsAndRelated', textDefault: 'Điều khoản và hồ sơ liên quan', icon: 'icon-more', isActive: false },
    ]
    this.getAccount();
  }

  async ngOnChanges(changes: SimpleChanges) {
    this.listClicked = JSON.parse(JSON.stringify(this.listClicked));
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateMore,
          frozenColumns: 1,
        },
      },
    ];
  }

  changeTab(e){
    this.tabClicked = e;
  }

  click(e) {
    switch (e.id) {
      case 'btnAdd':
        this.addContract();
        break;
    }
  }

  selectedChange(val: any) {
    this.itemSelected = val?.data;
    this.getQuotationsAndQuotationsLinesByTransID(this.itemSelected.quotationID);
    this.getPayMentByContractID(this.itemSelected?.recID);
    this.detectorRef.detectChanges();
  }

  getQuotationsAndQuotationsLinesByTransID(recID) {
    this.contractService.getQuotationsLinesByTransID(recID).subscribe((res) => {
      if (res) {
        this.quotations = res[0];
        this.listQuotationsLine = res[1];
      }else{
        this.quotations = null;
        this.listQuotationsLine = [];
      }
    });
  }

  getPayMentByContractID(contractID) {
    this.contractService.getPaymentsByContractID(contractID).subscribe((res) => {
      if (res) {
        let listPayAll =  res as CM_ContractsPayments[];
        this.listPayment = listPayAll.filter(pay => pay.lineType == '0');
        this.listPaymentHistory = listPayAll.filter(pay => pay.lineType == '1');
      }else{
        this.listPayment = [];
        this.listPaymentHistory = [];
      }
    });
  }

  // moreFunc
  eventChangeMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  changeDataMF(e, data) {}

  clickMoreFunction(e) {
    this.clickMF(e.e, e.data);
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteContract(data);
        break;
      case 'SYS03':
        this.editContract(data);
        break;
      case 'SYS04':
        this.copyContract(data);
        break;
      case 'CM0204_3':
        //tạo hợp đồng gia hạn
        this.addContractAdjourn(data)
        break;
      case 'CM0204_5':
        //Đã giao hàng
        this.updateDelStatus(data);
        break;
      case 'CM0204_6':
        //hoàn tất hợp đồng
        this.completedContract(data);
        break;
      case 'CM0204_1':
        //Gửi duyệt
       
        break;
      case 'CM0204_2':
        //Hủy yêu cầu duyệt
       
        break;
    }
  }

  async addContract(){
    this.view.dataService.addNew().subscribe(async (res) => {
      let contracts = new CM_Contracts();
      let contractOutput = await this.openPopupContract(null, "add",contracts);
    })
  }

  async addContractAdjourn(data: CM_Contracts){
    this.view.dataService.addNew().subscribe(async (res) => {
      let contracts = JSON.parse(JSON.stringify(data)) as CM_Contracts;
      contracts.contractType = '2';
      contracts.quotationID = null;
      contracts.refID = contracts.recID;
      delete contracts['id'];
      let contractOutput = await this.openPopupContract(null, "add",contracts);
    })
  }

  async editContract(contract){
    let dataEdit = JSON.parse(JSON.stringify(contract));
    this.view.dataService.edit(dataEdit).subscribe(async (res) => {
      let dataOutput = await this.openPopupContract(null,"edit",dataEdit);
    })
  }

  async copyContract(contract){
    this.view.dataService.addNew().subscribe(async (res) => {
      let dataCopy = JSON.parse(JSON.stringify(contract));
      let contractOutput = await this.openPopupContract(null,"copy",dataCopy);
    });
  }

  updateDelStatus(contract: CM_Contracts){
    if(contract?.recID){
      this.contractService.updateDelStatus(contract?.recID).subscribe((res) => {
        if (res) {
          contract.delStatus = "2";
          this.notiService.notifyCode('SYS007');   
        }
      });
    }
    
  }

  completedContract(contract: CM_Contracts){
    this.notiService
      .alertCode('Bạn có muốn hoàn tất hợp đồng này', null, ['"' + contract?.contractName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.contractService.updateStatus(contract?.recID).subscribe((res) => {
            if (res) {
              contract.status = "4";
              this.notiService.notifyCode('SYS007');   
            }
          });
        }
      });
  }

  beforeDelete(option: RequestOption, data) {
    option.methodName = 'DeleteContactAsync';
    option.className = 'ContractsBusiness';
    option.assemblyName = 'CM';
    option.service = 'CM';
    option.data = data;
    return true;
  }

  deleteContract(contract){
    if(contract?.recID){
      this.view.dataService
      .delete([contract], true, (option: RequestOption) =>
      this.beforeDelete(option, contract.recID))
      .subscribe((res: any) => {
        if (res) {
        }
      });
    }
  }

  async openPopupContract(projectID,action, contract?){
    let data = {
      projectID,
      action,
      contract: contract || null,
      account: this.account,
      type: 'view',
    }
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1001;
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    let popupContract = this.callFunc.openForm(
      AddContractsComponent,
      '',
      null,
      null,
      '',
      data,
      '',
      option
    );
    let dataPopupOutput = await firstValueFrom(popupContract.closed);
    return dataPopupOutput;
  }

  getAccount(){
    this.api.execSv<any>(
      'SYS',
      'AD',
      'CompanySettingsBusiness',
      'GetAsync'
    ).subscribe(res => {
      console.log(res);
      if(res){
        this.account = res;
      }
    })
  }

  async getForModel  (functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let formModel = new FormModel;
    formModel.formName = f?.formName;
    formModel.gridViewName = f?.gridViewName;
    formModel.entityName = f?.entityName;
    formModel.funcID = functionID;
    return formModel;
  }

  addPayHistory(){
    this.openPopupPay('add', 'payHistory', null);
  }
  addPay(){
    this.openPopupPay('add', 'pay', null);
  }

  async openPopupPay(action,type,data) {
    let dataInput = {
      action,
      data,
      type,
      contractID: this.itemSelected?.recID
    };
    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1001;
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    let popupTask = this.callfc.openForm(
      PopupAddPaymentComponent,'',
      600,
      400,
      '',
      dataInput,
      '',
      option,
      );

    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    return dataPopupOutput;
  }

}
