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
import { CM_Contracts } from '../../models/cm_model';
import { PaymentsComponent } from '../component/payments/payments.component';

@Component({
  selector: 'lib-views-contracts',
  templateUrl: './views-contracts.component.html',
  styleUrls: ['./views-contracts.component.scss']
})
export class ViewsContractsComponent extends UIComponent{
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
  formModel: FormModel = {
    formName: 'CMQuotations',
    gridViewName: 'grvCMQuotations',
    funcID: 'CM0202',
  };
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
    { name: 'Contract', textDefault: 'Hợp đồng', isActive: false, template: null},
  ];
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    private callFunc: CallFuncService,
    private notiService: NotificationsService,
    private changeDetector: ChangeDetectorRef,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
  }

  onInit(): void {
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
  }

  ngAfterViewInit() {
    let index = this.tabControl.findIndex(item => item.name == 'Contract');
    if(index >= 0){
      let contract = { name: 'Contract', textDefault: 'Hợp đồng', isActive: false, template: this.contract};
      this.tabControl.splice(index,1,contract)
    }

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
    this.detectorRef.detectChanges();
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
    }
  }

  async addContract(){
    this.view.dataService.addNew().subscribe(async (res) => {
      let contracts = new CM_Contracts();
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
    option.FormModel = this.formModel;
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
    };
    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1001;
    option.DataService = this.view.dataService;
    option.FormModel = this.formModel;
    let popupTask = this.callfc.openForm(
      PaymentsComponent,'',
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
