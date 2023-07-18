import {
  Input,
  OnInit,
  Injector,
  Optional,
  Component,
  ViewChild,
  TemplateRef,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ViewType,
  ViewModel,
  DialogRef,
  FormModel,
  ButtonModel,
  DataRequest,
  DialogModel,
  UIComponent,
  RequestOption,
  CallFuncService,
  NotificationsService,
} from 'codx-core';
import {
  CM_Contracts,
  CM_Quotations,
  CM_QuotationsLines,
  CM_ContractsPayments,
} from '../models/cm_model';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CodxCmService } from '../codx-cm.service';
import { ContractsService } from './service-contracts.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { AddContractsComponent } from './add-contracts/add-contracts.component';
import { PopupAddPaymentComponent } from './payment/popup-add-payment/popup-add-payment.component';

@Component({
  selector: 'contracts-detail',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
})
export class ContractsComponent extends UIComponent {
  @Input() funcID: string;
  @Input() customerID: string;

  @ViewChild('contract') contract: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('itemViewList') itemViewList?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail: TemplateRef<any>;
  //temGird
  @ViewChild('templateStatus') templateStatus: TemplateRef<any>;
  @ViewChild('templateCustomer') templateCustomer: TemplateRef<any>;
  @ViewChild('templateCreatedBy') templateCreatedBy: TemplateRef<any>;

  listClicked = [];
  views: Array<ViewModel> = [];
  listPayment: CM_ContractsPayments[] = [];
  listQuotationsLine: CM_QuotationsLines[];
  listPaymentHistory: CM_ContractsPayments[] = [];

  account: any;
  quotations: CM_Quotations;

  tabClicked = '';
  actionName = '';
  isAddContract = true;

  service = 'CM';
  entityName = 'CM_Contracts';
  className = 'ContractsBusiness';
  assemblyName = 'ERM.Business.CM';
  methodLoadData = 'GetListContractsAsync';

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
    funcID: 'CM02041 ',
    formName: 'CMContractsPayments',
    entityName: 'CM_ContractsPayments',
    gridViewName: 'grvCMContractsPayments',
  };
  fmContractsPaymentsHistory: FormModel = {
    funcID: 'CM02042  ',
    entityName: 'CM_ContractsPayments',
    formName: 'CMContractsPaymentsHistory',
    gridViewName: 'grvCMContractsPaymentsHistory',
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
  vllApprove = '';

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
    {
      template: null,
      isActive: false,
      name: 'Comment',
      textDefault: 'Thảo luận',
    },
    {
      template: null,
      isActive: false,
      name: 'Attachment',
      textDefault: 'Đính kèm',
    },
    {
      template: null,
      isActive: false,
      name: 'Task',
      textDefault: 'Công việc',
    },
    {
      template: null,
      isActive: false,
      name: 'Approve',
      textDefault: 'Ký duyệt',
    },
    {
      template: null,
      isActive: false,
      name: 'References',
      textDefault: 'Liên kết',
    },
    {
      template: null,
      isActive: false,
      name: 'Quotations',
      textDefault: 'Báo giá',
    },
    {
      template: null,
      isActive: false,
      name: 'Order',
      textDefault: 'Đơn hàng',
    },
  ];

  constructor(
    private inject: Injector,
    private cmService: CodxCmService,
    private callFunc: CallFuncService,
    private contractService: ContractsService,
    private notiService: NotificationsService,
    private codxShareService: CodxShareService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
  }

  async onInit(): Promise<void> {
    this.grvSetup = await firstValueFrom(
      this.cache.gridViewSetup('CMContracts', 'grvCMContracts')
    );
    this.vllStatus = this.grvSetup['Status'].referedValue;
    this.vllApprove = this.grvSetup['ApproveStatus'].referedValue;

    this.button = {
      id: 'btnAdd',
    };
    this.listClicked = [
      {
        name: 'general',
        textDefault: 'Thông tin chung',
        icon: 'icon-info',
        isActive: true,
      },
      {
        name: 'detailItem',
        textDefault: 'Chi tiết mặt hàng',
        icon: 'icon-link',
        isActive: false,
      },
      {
        name: 'pay',
        textDefault: 'Phương thức và tiến độ thanh toán',
        icon: 'icon-tune',
        isActive: false,
      },
      {
        name: 'termsAndRelated',
        textDefault: 'Điều khoản và hồ sơ liên quan',
        icon: 'icon-more',
        isActive: false,
      },
    ];
    this.getAccount();
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
        active: false,
        sameData: true,
        model: {
          resources: this.columnGrids,
          template2: this.templateMore,
          // frozenColumns: 1,
        },
      },
    ];
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
        active: false,
        sameData: true,
        model: {
          resources: this.columnGrids,
          template2: this.templateMore,
          // frozenColumns: 1,
        },
      },
    ];
  }

  changeTab(e) {
    this.tabClicked = e;
  }

  click(e) {
    this.actionName = e?.text;
    switch (e.id) {
      case 'btnAdd':
        if (this.isAddContract) {
          this.isAddContract = false;
          this.addContract();
        }
        break;
    }
  }

  selectedChange(val: any) {
    if (!val?.data) return;
    this.itemSelected = val?.data;
    this.getQuotationsAndQuotationsLinesByTransID(
      this.itemSelected.quotationID
    );
    this.getPayMentByContractID(this.itemSelected?.recID);
    this.detectorRef.detectChanges();
  }

  getQuotationsAndQuotationsLinesByTransID(recID) {
    this.contractService.getQuotationsLinesByTransID(recID).subscribe((res) => {
      if (res) {
        this.quotations = res[0];
        this.listQuotationsLine = res[1];
      } else {
        this.quotations = null;
        this.listQuotationsLine = [];
      }
    });
  }

  getPayMentByContractID(contractID) {
    this.contractService
      .getPaymentsByContractID(contractID)
      .subscribe((res) => {
        if (res) {
          let listPayAll = res as CM_ContractsPayments[];
          this.listPayment = listPayAll.filter((pay) => pay.lineType == '0');
          this.listPaymentHistory = listPayAll.filter(
            (pay) => pay.lineType == '1'
          );
        } else {
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
    this.actionName = e.text;
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
        this.addContractAdjourn(data);
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
        this.approvalTrans(data);
        break;
      case 'CM0204_2':
        //Hủy yêu cầu duyệt
        this.cancelApprover(data);
        break;
    }
  }

  async addContract() {
    this.view.dataService.addNew().subscribe(async (res) => {
      let contracts = new CM_Contracts();
      let contractOutput = await this.openPopupContract(null, 'add', contracts);
    });
  }

  async addContractAdjourn(data: CM_Contracts) {
    this.view.dataService.addNew().subscribe(async (res) => {
      let contracts = JSON.parse(JSON.stringify(data)) as CM_Contracts;
      contracts.contractType = '2';
      contracts.quotationID = null;
      contracts.refID = contracts.recID;
      delete contracts['id'];
      let contractOutput = await this.openPopupContract(null, 'add', contracts);
    });
  }

  async editContract(contract) {
    let dataEdit = JSON.parse(JSON.stringify(contract));
    this.view.dataService.edit(dataEdit).subscribe(async (res) => {
      let dataOutput = await this.openPopupContract(null, 'edit', dataEdit);
    });
  }

  async copyContract(contract) {
    this.view.dataService.addNew().subscribe(async (res) => {
      let dataCopy = JSON.parse(JSON.stringify(contract));
      let contractOutput = await this.openPopupContract(null, 'copy', dataCopy);
    });
  }

  updateDelStatus(contract: CM_Contracts) {
    if (contract?.recID) {
      this.contractService.updateDelStatus(contract?.recID).subscribe((res) => {
        if (res) {
          contract.delStatus = '2';
          this.notiService.notifyCode('SYS007');
        }
      });
    }
  }

  completedContract(contract: CM_Contracts) {
    this.notiService
      .alertCode('CM004', null, ['"' + contract?.contractName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.contractService
            .updateStatus(contract?.recID)
            .subscribe((res) => {
              if (res) {
                contract.status = '4';
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

  deleteContract(contract) {
    if (contract?.recID) {
      this.view.dataService
        .delete([contract], true, (option: RequestOption) =>
          this.beforeDelete(option, contract.recID)
        )
        .subscribe((res: any) => {
          if (res) {
          }
        });
    }
  }

  async openPopupContract(projectID, action, contract?) {
    let data = {
      projectID,
      action,
      contract: contract || null,
      account: this.account,
      type: 'view',
      actionName: this.actionName || '',
    };
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
    this.isAddContract = true;
    return dataPopupOutput;
  }

  getAccount() {
    this.api
      .execSv<any>('SYS', 'AD', 'CompanySettingsBusiness', 'GetAsync')
      .subscribe((res) => {
        console.log(res);
        if (res) {
          this.account = res;
        }
      });
  }

  async getForModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let formModel = new FormModel();
    formModel.formName = f?.formName;
    formModel.gridViewName = f?.gridViewName;
    formModel.entityName = f?.entityName;
    formModel.funcID = functionID;
    return formModel;
  }

  addPayHistory() {
    this.openPopupPay('add', 'payHistory', null);
  }
  addPay() {
    this.openPopupPay('add', 'pay', null);
  }

  async openPopupPay(action, type, data) {
    let dataInput = {
      action,
      data,
      type,
      contract: this.itemSelected,
    };
    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 2001;
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    let popupTask = this.callfc.openForm(
      PopupAddPaymentComponent,
      '',
      550,
      400,
      '',
      dataInput,
      '',
      option
    );

    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    return dataPopupOutput;
  }

  //------------------------- Ký duyệt  ----------------------------------------//
  approvalTrans(dt) {
    this.cmService.getProcess(dt?.processID).subscribe((process) => {
      if (process) {
        this.cmService
          .getESCategoryByCategoryID(process.processNo)
          .subscribe((res) => {
            if (!res) {
              this.notiService.notifyCode('ES028');
              return;
            }
            if (res.eSign) {
              //kys soos
            } else {
              this.release(dt, res.processID);
            }
          });
      } else {
        this.notiService.notifyCode('DP040');
      }
    });
  }
  //Gửi duyệt
  release(data: any, processID: any) {
    this.codxShareService
      .codxRelease(
        this.view.service,
        data?.recID,
        processID,
        this.view.formModel.entityName,
        this.view.formModel.funcID,
        '',
        data?.title,
        ''
      )
      .subscribe((res2: any) => {
        if (res2?.msgCodeError) this.notiService.notify(res2?.msgCodeError);
        else {
          this.itemSelected.approveStatus = '3';
          this.view.dataService.update(this.itemSelected).subscribe();
          // if (this.kanban) this.kanban.updateCard(this.itemSelected);
          this.cmService
            .updateApproveStatus('DealsBusiness', data?.recID, '3')
            .subscribe();
          this.notiService.notifyCode('ES007');
        }
      });
  }

  //Huy duyet
  cancelApprover(dt) {
    this.notiService.alertCode('ES016').subscribe((x) => {
      if (x.event.status == 'Y') {
        this.cmService.getProcess(dt?.processID).subscribe((process) => {
          if (process) {
            this.cmService
              .getESCategoryByCategoryID(process.processNo)
              .subscribe((res2: any) => {
                if (res2) {
                  if (res2?.eSign == true) {
                    //trình ký
                  } else if (res2?.eSign == false) {
                    //kí duyet
                    this.codxShareService
                      .codxCancel(
                        'CM',
                        dt?.recID,
                        this.view.formModel.entityName,
                        null,
                        null
                      )
                      .subscribe((res3) => {
                        if (res3) {
                          this.itemSelected.approveStatus = '0';
                          this.cmService
                            .updateApproveStatus(
                              'DealsBusiness',
                              dt?.recID,
                              '0'
                            )
                            .subscribe();
                          this.notiService.notifyCode('SYS007');
                        } else this.notiService.notifyCode('SYS021');
                      });
                  }
                } else {
                  this.notiService.notifyCode('ES028');
                  return;
                }
              });
          } else {
            this.notiService.notifyCode('DP040');
          }
        });
      }
    });
  }
  //end duyet
  //--------------------------------------------------------------------//
  // getColumsGrid(grvSetup) {
  //   this.columnGrids = [];
  //   this.arrFieldIsVisible.forEach((key) => {
  //     let field = Util.camelize(key);
  //     let template: any;
  //     let colums: any;
  //     switch (key) {
  //       case 'Status':
  //         template = this.templateStatus;
  //         break;
  //       case 'CustomerID':
  //         template = this.templateCustomer;
  //         break;
  //       case 'CreatedBy':
  //         template = this.templateCreatedBy;
  //         break;
  //       case 'TotalTaxAmt':
  //         template = this.templateTotalTaxAmt;
  //         break;
  //       case 'TotalAmt':
  //         template = this.templateTotalAmt;
  //         break;
  //       case 'TotalSalesAmt':
  //         template = this.templateTotalSalesAmt;
  //         break;
  //       case 'CreatedOn':
  //         template = this.templateCreatedOn;
  //         break;
  //       case 'DealID':
  //         template = this.templateDeal;
  //         break;
  //       case 'ApproveStatus':
  //         template = this.templateApproverStatus;
  //         break;
  //       default:
  //         break;
  //     }
  //     if (template) {
  //       colums = {
  //         field: field,
  //         headerText: grvSetup[key].headerText,
  //         width: grvSetup[key].width,
  //         template: template,
  //         // textAlign: 'center',
  //       };
  //     } else {
  //       colums = {
  //         field: field,
  //         headerText: grvSetup[key].headerText,
  //         width: grvSetup[key].width,
  //       };
  //     }

  //     this.columnGrids.push(colums);
  //   });

  //   this.views = [
  //     {
  //       type: ViewType.listdetail,
  //       active: true,
  //       sameData: true,
  //       model: {
  //         template: this.itemTemplate,
  //         panelRightRef: this.templateDetail,
  //       },
  //     },
  //     {
  //       type: ViewType.grid,
  //       active: false,
  //       sameData: true,
  //       model: {
  //         resources: this.columnGrids,
  //         template2: this.templateMore,
  //         // frozenColumns: 1,
  //       },
  //     },
  //   ];

  //   this.detectorRef.detectChanges();
  // }
}
