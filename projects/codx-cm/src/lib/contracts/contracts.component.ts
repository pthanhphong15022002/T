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
  Util,
  SidebarModel,
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
import { PopupMoveStageComponent } from 'projects/codx-dp/src/lib/instances/popup-move-stage/popup-move-stage.component';
import { PopupMoveReasonComponent } from 'projects/codx-dp/src/lib/instances/popup-move-reason/popup-move-reason.component';
import { ContractsViewDetailComponent } from './contracts-view-detail/contracts-view-detail.component';
import { PopupAssginDealComponent } from '../deals/popup-assgin-deal/popup-assgin-deal.component';
import { StepService } from 'projects/codx-share/src/lib/components/codx-step/step.service';
import { ContractsDetailComponent } from './contracts-detail/contracts-detail.component';

@Component({
  selector: 'contracts-detail',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
})
export class ContractsComponent extends UIComponent {
  @Input() customerID: string;

  @ViewChild('contract') contract: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('itemViewList') itemViewList?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail: TemplateRef<any>;
  //temGird
  @ViewChild('tempContractName') tempContractName: TemplateRef<any>;
  @ViewChild('tempCustomerID') tempCustomerID: TemplateRef<any>;
  @ViewChild('tempContractAmt') tempContractAmt: TemplateRef<any>;
  @ViewChild('tempPaidAmt') tempPaidAmt: TemplateRef<any>;
  @ViewChild('tempCurrencyID') tempCurrencyID: TemplateRef<any>;
  @ViewChild('tempApplyProcess') tempApplyProcess: TemplateRef<any>;
  @ViewChild('tempStepID') tempStepID: TemplateRef<any>;
  @ViewChild('tempStatus') tempStatus: TemplateRef<any>;
  @ViewChild('tempOwner') tempOwner: TemplateRef<any>;

  listClicked = [];
  views: Array<ViewModel> = [];
  listPayment: CM_ContractsPayments[] = [];
  listQuotationsLine: CM_QuotationsLines[];
  listPaymentHistory: CM_ContractsPayments[] = [];

  account: any;
  quotations: CM_Quotations;
  listInsStep = [];

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
  functionMappings;
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
  contractSelected: any;
  button?: ButtonModel[] = [{ id: 'btnAdd' }];
  tabControl = [];
  //param
  approveRule = '0';
  paramDefault: any;
  runMode: any;

  constructor(
    private inject: Injector,
    private cmService: CodxCmService,
    private callFunc: CallFuncService,
    private contractService: ContractsService,
    private notiService: NotificationsService,
    private codxShareService: CodxShareService,
    private changeDetectorRef: ChangeDetectorRef,
    private stepService: StepService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((f) => {
      if (f) {
        this.runMode = f?.runMode;
      }
    });
  }

  async onInit(){
    this.loadParam();
    this.grvSetup = await firstValueFrom(
      this.cache.gridViewSetup('CMContracts', 'grvCMContracts')
    );

    let arrField = Object.values(this.grvSetup).filter((x: any) => x.isVisible);
    if (Array.isArray(arrField)) {
      this.arrFieldIsVisible = arrField
        .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
        .map((x: any) => x.fieldName);
      this.getColumsGrid(this.grvSetup);
    }

    this.vllStatus = this.grvSetup['Status'].referedValue;
    this.vllApprove = this.grvSetup['ApproveStatus'].referedValue;
    this.tabControl = this.contractService?.footerTab;
    this.getAccount();
    this.getColumsGrid(this.grvSetup);
  }

  async ngOnChanges(changes: SimpleChanges) {
    this.listClicked = JSON.parse(JSON.stringify(this.listClicked));
  }

  ngAfterViewInit() {
    this.getColumsGrid(this.grvSetup);
    console.log(this.view.dataService);
  }

  changeTab(e) {
    this.tabClicked = e;
  }

  click(e) {
    this.actionName = e?.text;
    switch (e.id) {
      case 'btnAdd':
        this.addContract();
        if (this.isAddContract) {
          this.isAddContract = false;
        }
        break;
    }
  }

  selectedChange(val: any) {
    if (!val?.data) return;
    this.contractSelected = val?.data;
    this.getQuotationsAndQuotationsLinesByTransID(
      this.contractSelected.quotationID
    );
    this.getPayMentByContractID(this.contractSelected?.recID);
    this.detectorRef.detectChanges();
  }

    // moreFunc
    changeMF(e) {
      this.changeDataMF(e.e, e.data);
    }
  
    changeDataMF(event, data, isDetail = false) {
      if (this.runMode == '1') {
        this.codxShareService.changeMFApproval(event, data?.unbounds);
      } else if (event != null) {
        event.forEach((res) => {
          res.isblur = data?.approveStatus == '3';
          if(isDetail){
            res.isbookmark = false;
          }
          switch (res.functionID) {
            //Gửi duyệt
            case 'CM0204_1':
              if (
                data.status == '0' ||
                (data.closed && data.status != '1') ||
                (this.approveRule != '1' && !data.applyApprover) ||
                (data.applyApprover && data?.approveRule != '1') ||
                data?.approveStatus >= '3'
              ) {
                res.disabled = true;
              }
              break;
            //Hủy yêu cầu duyệt
            case 'CM0204_2':
              if (
                (data.closed && data.status != '1') ||
                data.status == '0' ||
                data.approveStatus != '3'
              ) {
                res.disabled = true;
              }
              res.isblur = false;
              break;
  
            case 'CM0204_4':
              res.disabled = true;
              break;
  
            case 'CM0204_3': //tạo hợp đồng gia hạn
              if (data?.status == '1') {
                res.disabled = true;
              }
              break;
  
            case 'CM0204_5': //Đã giao hàng
              if (data?.status == '1') {
                res.disabled = true;
              }
              break;
  
            case 'CM0204_6': //hoàn tất hợp đồng
              if (data?.status == '1') {
                res.disabled = true;
              }
              break;
  
            // case 'CM0204_7': // Xem chi tiết
            //   if (!isDetail) {
            //     res.disabled = true;
            //   }
            //   break;
  
            case 'CM0204_8': // chuyển giai đoạn
              res.disabled = !data?.applyProcess || data?.status == '1';
              break;
  
            case 'CM0204_9': // bắt đầu
              res.disabled = !data?.applyProcess || data?.status !== '1';
              break;
  
            case 'CM0204_10': // thành công
              res.disabled = !data?.applyProcess || data?.status !== '2';
              break;
            case 'CM0204_11': // thất bại
              res.disabled = !data?.applyProcess || data?.status !== '2';
              break;
  
            case 'CM0204_13': // thêm công việc
              if (data?.applyProcess) {
              } else {
                res.disabled = true;
              }
              break;
  
            case 'CM0204_14': // phân công người phụ trách
              break;
  
            case 'CM0204_15': // Đóng hợp đồng
              if (data?.closed) {
                res.disabled = true;
              }
              break;
  
            case 'CM0204_16': // mở lại hợp đồng
              if (!data?.closed) {
                res.disabled = true;
              }
              break;
          }
        });
      }
    }
  
    clickMoreFunc(e) {
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
        case 'CM0204_9':
          //Bắt đầu
          this.startInstance(data);
          break;
        case 'CM0204_8':
          //Chuyển giai đoạn
          this.moveStage(data);
          break;
        case 'CM0204_10':
          //thành công
          this.moveReason(data, true);
          break;
        case 'CM0204_11':
          //thất bại
          this.moveReason(data, false);
          break;
        case 'CM0204_14':
          //thất bại
          this.popupOwnerRoles(data);
          break;
        //export core làm
        case 'SYS002':
          this.exportTemplet(e, data);
          break;
        case 'CM0204_7':
          this.viewDetailContract(data);
          break;
        default: {
          // var customData = {
          //   refID: data.recID,
          //   refType: 'CM_Contracts',
          // };
          // if (data?.refID && data.applyProcess) {
          //   customData.refID = data.processID;
          //   customData.refType = 'DP_Processes';
          // }
          this.codxShareService.defaultMoreFunc(
            e,
            data,
            this.afterSave.bind(this),
            this.view.formModel,
            this.view.dataService,
            this
            //customData
          );
          this.detectorRef.detectChanges();
          break;
        }
      }
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

  afterSave(e?: any, that: any = null) {
    if (e) {
      let appoverStatus = e.unbounds.statusApproval;
      if (
        appoverStatus != null &&
        appoverStatus != this.contractSelected.approveStatus
      ) {
        this.contractSelected.approveStatus = appoverStatus;
      }
      this.view.dataService.update(this.contractSelected).subscribe();
    }
  }

  viewDetailContract(contract) {
    let data = {
      formModel: this.view.formModel,
      contract: contract,
      isView: true,
      listInsStepStart: this.listInsStep,
    };
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1001;
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    let popupContract = this.callFunc.openForm(
      ContractsDetailComponent,
      '',
      null,
      null,
      '',
      data,
      '',
      option
    );
  }

  async addContract() {
    this.view.dataService.addNew().subscribe(async (res) => {
      await this.openPopupContract(null, 'add', res);
    });
  }

  async addContractAdjourn(data: CM_Contracts) {
    this.view.dataService.addNew().subscribe(async (res) => {
      let contracts = JSON.parse(JSON.stringify(data)) as CM_Contracts;
      contracts.contractType = '2';
      contracts.quotationID = null;
      contracts.refID = contracts.recID;
      delete contracts['id'];
      this.openPopupContract(null, 'add', contracts);
    });
  }

  async editContract(contract) {
    if (contract) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(contract));
    }
    let dataEdit = this.view.dataService.dataSelected;
    this.view.dataService.edit(dataEdit).subscribe(async (res) => {
      this.openPopupContract(null, 'edit', dataEdit);
    });
  }

  async copyContract(contract) {
    this.view.dataService.addNew().subscribe(async (res) => {
      let dataCopy = JSON.parse(JSON.stringify(contract));
      this.openPopupContract(null, 'copy', dataCopy);
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
    option.methodName = 'DeleteContractAsync';
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
    let option = new SidebarModel();
    option.Width = '800px';
    option.zIndex = 1001;
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;

    let popupContract = this.callfc.openSide(
      AddContractsComponent,
      data,
      option
    );
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
      contract: this.contractSelected,
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
    if (dt?.applyProcess && dt?.processID) {
      this.cmService.getProcess(dt?.processID).subscribe((process) => {
        if (process) {
          this.approvalTransAction(dt, process.processNo);
        } else {
          this.notiService.notifyCode('DP040');
        }
      });
    } else {
      this.approvalTransAction(dt, 'ES_CM0502');
    }
  }
  approvalTransAction(data, categoryID) {
    this.cmService
      .getESCategoryByCategoryID(categoryID)
      .subscribe((category) => {
        if (!category) {
          this.notiService.notifyCode('ES028');
          return;
        }

        //ko phân biệt eSign
        this.release(data, category);
      });
  }
  //Gửi duyệt
  release(data: any, category: any, exportData = null) {
    //duyet moi
    this.codxShareService.codxReleaseDynamic(
      this.view.service,
      data,
      category,
      this.view.formModel.entityName,
      this.view.formModel.funcID,
      data?.title,
      this.releaseCallback.bind(this),
      null,
      null,
      null,
      null,
      null,
      exportData
    );
  }
  //call Back
  releaseCallback(res: any, t: any = null) {
    if (res?.msgCodeError) this.notiService.notify(res?.msgCodeError);
    else {
      this.contractSelected.approveStatus = res?.returnStatus;
      this.contractSelected.status = res?.returnStatus;
      this.view.dataService.update(this.contractSelected).subscribe();
      this.notiService.notifyCode('ES007');
      // this.cmService
      //   .getOneObject(this.itemSelected.recID, 'ContractsBusiness')
      //   .subscribe((q) => {
      //     if (q) {
      //       this.itemSelected = q;
      //       this.view.dataService.update(this.itemSelected).subscribe();
      //     }
      //     this.notiService.notifyCode('ES007');
      //   });
    }
  }

  //Huy duyet
  cancelApprover(dt) {
    this.notiService.alertCode('ES016').subscribe((x) => {
      if (x.event.status == 'Y') {
        if (dt.applyProcess) {
          this.cmService.getProcess(dt.processID).subscribe((process) => {
            if (process) {
              this.cancelAction(dt, process.processNo);
            } else {
              this.notiService.notifyCode('DP040');
            }
          });
        } else {
          this.cancelAction(dt, 'ES_CM0502');
        }
      }
    });
    //   }
    // });
  }

  cancelAction(dt, categoryID) {
    this.cmService
      .getESCategoryByCategoryID(categoryID)
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
                  this.contractSelected.approveStatus = '0';
                  this.view.dataService
                    .update(this.contractSelected)
                    .subscribe();
                  this.notiService.notifyCode('SYS007');
                } else this.notiService.notifyCode('SYS021');
              });
          }
        } else this.notiService.notifyCode('ES028');
      });
  }
  //end duyet
  //--------------------------------------------------------------------//
  // "Permissions", "Closed", "ClosedOn", "ClosedBy"
  getColumsGrid(grvSetup) {
    this.columnGrids = [];
    this.arrFieldIsVisible.forEach((key) => {
      let field = Util.camelize(key);
      let template: any;
      let colums: any;
      // switch (key) {
        // case 'ContractName':
        //   template = this.tempContractName;
        //   break;
        // case 'CustomerID':
        //   template = this.tempCustomerID;
        //   break;
        // case 'ContractAmt':
        //   template = this.tempContractAmt;
        //   break;
        // case 'PaidAmt':
        //   template = this.tempPaidAmt;
        //   break;
        // case 'CurrencyID':
        //   template = this.tempCurrencyID;
        //   break;
        // case 'ApplyProcess':
        //   template = this.tempApplyProcess;
        //   break;
        // case 'StepID':
        //   template = this.tempStepID;
        //   break;
        // case 'Status':
        //   template = this.tempStatus;
        //   break;
        // case 'Owner':
        //   template = this.tempOwner;
        //   break;
        // default:
        //   break;
      // }
      if (template) {
        colums = {
          field: field,
          headerText: grvSetup[key].headerText,
          width: grvSetup[key].width,
          template: template,
          // textAlign: 'center',
        };
      } else {
        colums = {
          field: field,
          headerText: grvSetup[key].headerText,
          width: grvSetup[key].width,
        };
      }

      this.columnGrids.push(colums);
    });

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
          // resources: this.columnGrids,
          template2: this.templateMore,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  startInstance(data) {
    this.notiService
      .alertCode('DP033', null, ['"' + data?.contractName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.api
            .exec<any>('DP', 'InstancesBusiness', 'StartInstanceAsync', [
              data?.refID,
            ])
            .subscribe((res) => {
              if (res) {
                this.listInsStep = res;
              }
            });
          this.contractService
            .updateStatus([data?.recID, '2'])
            .subscribe((res) => {
              if (res) {
                data.status = '2';
                this.moreDefaut = Object.assign(this.moreDefaut);
                this.changeDetectorRef.markForCheck();
              }
            });
        }
      });
  }

  moveStage(data: any) {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    this.cache.functionList('DPT0402').subscribe((fun) => {
      this.cache
        .gridViewSetup(fun.formName, fun.gridViewName)
        .subscribe((grvSt) => {
          var formMD = new FormModel();
          formMD.funcID = fun.functionID;
          formMD.entityName = fun.entityName;
          formMD.formName = fun.formName;
          formMD.gridViewName = fun.gridViewName;
          let oldStatus = data.status;
          let oldStepId = data.stepID;
          var stepReason = {
            isUseFail: false,
            isUseSuccess: false,
          };
          var dataCM = {
            refID: data?.refID,
            processID: data?.processID,
            stepID: data?.stepID,
            // nextStep: this.stepIdClick ? this.stepIdClick : data?.nextStep,
            // listStepCbx: this.listInsStep,
          };
          var obj = {
            stepName: data?.currentStepName,
            formModel: formMD,
            deal: data,
            stepReason: stepReason,
            headerTitle: this.actionName,
            applyFor: '4',
            dataCM: dataCM,
          };
          var dialogMoveStage = this.callfc.openForm(
            PopupMoveStageComponent,
            '',
            850,
            900,
            '',
            obj
          );
          dialogMoveStage.closed.subscribe((e) => {
            if (e && e.event != null) {
              this.listInsStep = e?.event?.listStep;
              var instance = e.event.instance;
              var listSteps = e.event?.listStep;
              var index =
                e.event.listStep.findIndex(
                  (x) =>
                    x.stepID === instance.stepID &&
                    !x.isSuccessStep &&
                    !x.isFailStep
                ) + 1;
              var nextStep = '';
              if (
                index != -1 &&
                !listSteps[index]?.isSuccessStep &&
                !listSteps[index]?.isFailStep
              ) {
                if (index != e.event.listStep.length) {
                  nextStep = listSteps[index]?.stepID;
                }
              }
              var dataUpdate = [
                data.recID,
                instance.stepID,
                nextStep,
                oldStepId,
                oldStatus,
                e.event?.comment,
                e.event?.expectedClosed,
                e.event?.probability,
              ];
              // this.codxCmService.moveStageDeal(dataUpdate).subscribe((res) => {
              //   if (res) {
              //     data = res[0];
              //     this.view.dataService.update(data).subscribe();
              //     this.detailViewDeal.dataSelected = data;
              //     if (e.event.isReason != null) {
              //       this.moveReason(data, e.event.isReason);
              //     }
              //     this.detectorRef.detectChanges();
              //   }
              // });
            }
          });
        });
    });
  }

  moveReason(data: any, isMoveSuccess: boolean) {
    //lay step Id cu de gen lai total
    // if (!this.crrStepID || this.crrStepID != data.stepID)
    //   this.crrStepID = data.stepID;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    var functionID = isMoveSuccess ? 'DPT0403' : 'DPT0404';
    this.cache.functionList(functionID).subscribe((fun) => {
      this.openFormReason(data, fun, isMoveSuccess);
    });
  }

  openFormReason(data, fun, isMoveSuccess) {
    var formMD = new FormModel();
    formMD.funcID = fun.functionID;
    formMD.entityName = fun.entityName;
    formMD.formName = fun.formName;
    formMD.gridViewName = fun.gridViewName;
    let oldStatus = data.status;
    let oldStepId = data.stepID;
    var dataCM = {
      refID: data?.refID,
      processID: data?.processID,
      stepID: data?.stepID,
    };
    var obj = {
      headerTitle: fun.defaultName,
      formModel: formMD,
      isReason: isMoveSuccess,
      processID: data?.processID,
      applyFor: '4',
      dataCM: dataCM,
      stepName: data.currentStepName,
    };

    var dialogRevision = this.callfc.openForm(
      PopupMoveReasonComponent,
      '',
      800,
      600,
      '',
      obj
    );
    dialogRevision.closed.subscribe((e) => {
      if (e && e.event != null) {
        //   data = this.updateReasonDeal(e.event?.instance, data);
        //   var datas = [data, oldStepId, oldStatus, e.event?.comment];
        //   this.codxCmService.moveDealReason(datas).subscribe((res) => {
        //     if (res) {
        //       data = res[0];
        //       this.view.dataService.update(data).subscribe();
        //       //up kaban
        //       if (this.kanban) {
        //         let money = data.dealValue * data.exchangeRate;
        //         this.renderTotal(data.stepID, 'add', money);
        //         this.renderTotal(this.crrStepID, 'minus', money);
        //         this.kanban.refresh();
        //       }
        //       this.detectorRef.detectChanges();
        //     }
        //   });
        //   // }
        // } else {
        //   if (this.kanban) {
        //     this.dataSelected.stepID = this.crrStepID;
        //     this.kanban.updateCard(this.dataSelected);
        //   }
      }
    });
  }

  autoStart(event) {
    if (event) {
      this.api
        .exec<any>('DP', 'InstancesBusiness', 'StartInstanceAsync', [
          this.contractSelected?.refID,
        ])
        .subscribe((res) => {
          console.log(res);
          if (res) {
            this.listInsStep = res;
          }
        });
    }
  }

  loadParam() {
    this.cmService.getParam('CMParameters', '4').subscribe((res) => {
      if (res) {
        let dataValue = JSON.parse(res.dataValue);
        if (Array.isArray(dataValue)) {
          let setting = dataValue.find((x) => x.Category == 'CM_Contracts');
          if (setting) this.approveRule = setting['ApprovalRule'];
        }
      }
    });
  }

  //export theo moreFun
  exportFiles(e, data) {
    let formatDatas = data.datas ?? '';
    let customData = {
      refID: data.recID,
      refType: this.view.entityName,
      dataSource: formatDatas,
    };
    if (data?.refID) {
      this.cmService.getDatasExport(data?.refID).subscribe((dts) => {
        if (dts) {
          if (formatDatas) {
            formatDatas = JSON.stringify([
              ...JSON.parse(formatDatas),
              ...JSON.parse(dts),
            ]);
          } else formatDatas = dts;
          customData = {
            refID: data.processID,
            refType: 'DP_Processes',
            dataSource: formatDatas,
          };
        }
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          this.afterSave,
          this.view.formModel,
          this.view.dataService,
          this,
          customData
        );
        this.detectorRef.detectChanges();
      });
    } else {
      this.codxShareService.defaultMoreFunc(
        e,
        data,
        this.afterSave,
        this.view.formModel,
        this.view.dataService,
        this
      );
      this.detectorRef.detectChanges();
    }
  }
  autoOpenPopupSusscess(e) {
    e && this.moveReason(this.contractSelected, true);
  }

  popupOwnerRoles(data) {
    var formMD = new FormModel();
    let dialogModel = new DialogModel();
    formMD.funcID = 'CM0205';
    formMD.entityName = 'CM_Deals';
    formMD.formName = 'CMDeals';
    formMD.gridViewName = 'grvCMDeals';
    dialogModel.zIndex = 999;
    dialogModel.FormModel = formMD;
    var obj = {
      recID: data?.recID,
      refID: data?.refID,
      processID: data?.processID,
      stepID: data?.stepID,
      data: data,
      gridViewSetup: null,
      formModel: this.view.formModel,
      applyFor: '1',
      titleAction: this.actionName,
      owner: data.owner,
      startControl: data.steps.startControl,
      applyProcess: true,
      buid: data.buid,
    };
    var dialog = this.callfc.openForm(
      PopupAssginDealComponent,
      '',
      750,
      400,
      '',
      obj,
      '',
      dialogModel
    );
    dialog.closed.subscribe((e) => {
      if (e && e?.event != null) {
        // this.detailViewDeal.promiseAllAsync();
        // this.view.dataService.update(e?.event).subscribe();
        // this.notificationsService.notifyCode('SYS007');
        // this.detectorRef.detectChanges();
      }
    });
  }

  //Export----------------------------------------------------//
  exportTemplet(e, data) {
    this.api
      .execSv<any>(
        'CM',
        'CM',
        'ContractsBusiness',
        'GetDataSourceExportAsync',
        data.recID
      )
      .subscribe((str) => {
        if (str && str?.length > 0) {
          let dataSource = '[' + str[0] + ']';
          if (str[1]) {
            let datas = str[1];
            if (datas && datas.includes('[{')) datas = datas.substring(2);
            let fix = str[0];
            fix = fix.substring(1, fix.length - 1);
            dataSource = '[{ ' + fix + ',' + datas;
          }

          let customData = {
            refID: data.recID,
            refType: this.view.entityName,
            dataSource: dataSource,
          };
          if (data?.refID && data.applyProcess) {
            customData.refID = data.processID;
            customData.refType = 'DP_Processes';
          }
          this.codxShareService.defaultMoreFunc(
            e,
            data,
            this.afterSave,
            this.view.formModel,
            this.view.dataService,
            this,
            customData
          );
          this.detectorRef.detectChanges();
        }
      });
  }
}
