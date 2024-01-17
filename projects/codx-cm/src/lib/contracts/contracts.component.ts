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
  AuthStore,
} from 'codx-core';
import {
  CM_Contracts,
  CM_Quotations,
  CM_QuotationsLines,
  CM_ContractsPayments,
} from '../models/cm_model';
import {
  DP_Instances_Steps_Tasks,
  DP_Instances_Steps_Tasks_Roles,
} from 'projects/codx-dp/src/lib/models/models';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CodxCmService } from '../codx-cm.service';
import { ContractsService } from './service-contracts.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { AddContractsComponent } from './add-contracts/add-contracts.component';
import { PopupAddPaymentComponent } from './payment/popup-add-payment/popup-add-payment.component';
import { PopupMoveStageComponent } from 'projects/codx-dp/src/lib/instances/popup-move-stage/popup-move-stage.component';
import { PopupMoveReasonComponent } from 'projects/codx-dp/src/lib/instances/popup-move-reason/popup-move-reason.component';
import { ContractsViewDetailComponent } from './contracts-view-right/contracts-view-right.component';
import { PopupAssginDealComponent } from '../deals/popup-assgin-deal/popup-assgin-deal.component';
import { StepService } from 'projects/codx-share/src/lib/components/codx-step/step.service';
import { ContractsDetailComponent } from './contracts-detail/contracts-detail.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { ExportData } from 'projects/codx-common/src/lib/models/ApproveProcess.model';
import { PopupPermissionsComponent } from '../popup-permissions/popup-permissions.component';
import { PopupUpdateStatusComponent } from '../deals/popup-update-status/popup-update-status.component';

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

  @ViewChild('liquidationTmp') liquidationTmp: TemplateRef<any>;

  @ViewChild('detailViewContract')
  detailViewContract: ContractsViewDetailComponent;

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
  contractAppendix;

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

  frmModelExport: FormModel = {
    formName: 'CMTempDataSources',
    gridViewName: 'grvCMTempDataSources',
    entityName: 'CM_TempDataSources',
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
  button?: ButtonModel[] = [{ id: 'btnAdd' }];
  tabControl = [];
  //param
  approveRule = '0';
  paramDefault: any;
  runMode: any;
  user;
  taskAdd;
  popupLiquidation;
  liquidation: CM_Contracts;
  dataSelected: any;

  statusCodeID: any;
  statusCodeCmt: any;
  processID = '';
  constructor(
    private inject: Injector,
    private cmService: CodxCmService,
    private callFunc: CallFuncService,
    private contractService: ContractsService,
    private notiService: NotificationsService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private changeDetectorRef: ChangeDetectorRef,
    private stepService: StepService,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((f) => {
      if (f) {
        this.runMode = f?.runMode;
      }
    });
    this.user = this.authStore.get();
  }

  async onInit() {
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
    this.processID = this.activedRouter.snapshot?.queryParams['processID'];
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
  onActions(e) {
    switch (e.type) {
      case 'dbClick':
        this.viewDetailContract(e?.data?.rowData);
        break;
    }
  }
  selectedChange(val: any) {
    if (!val?.data) return;
    this.dataSelected = val?.data;
    this.getQuotationsAndQuotationsLinesByTransID(
      this.dataSelected.quotationID
    );
    this.getPayMentByContractID(this.dataSelected?.recID);
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
        res.isblur =
          data?.approveStatus == '3' && res?.functionID != 'CM0204_2';
        if (isDetail) {
          res.isbookmark = false;
        }
        switch (res.functionID) {
          case 'CM0204_3':
          case 'CM0204_17':
          case 'CM0204_21':
          case 'CM0204_22':
            res.disabled = data?.closed;
            break;
          case 'SYS02':
            res.disabled = data?.delete
              ? data.closed ||
                this.checkMoreReason(data) ||
                (!data.applyProcess && ['3', '5'].includes(data.status))
              : true;
            break;
          case 'SYS03':
            res.disabled = data?.write
              ? data?.closed ||
                this.checkMoreReason(data) ||
                (!data.applyProcess && ['3', '5'].includes(data.status))
              : true;
            break;
          case 'SYS04':
            res.disabled = data?.write
              ? data.closed ||
                (data.status != '13' && this.checkMoreReason(data, false)) ||
                (!data.applyProcess && ['3', '5'].includes(data.status))
              : true;

            break;
          //Gửi duyệt
          case 'CM0204_1':
            res.disabled =
              data?.closed ||
              data?.status == '0' ||
              // (data?.closed && data?.status != '1') ||
              (this.approveRule != '1' && !data?.applyApprover) ||
              (data?.applyApprover && data?.approveRule != '1') ||
              data?.approveStatus >= '3';
            break;
          //Hủy yêu cầu duyệt
          case 'CM0204_2':
            res.disabled =
              data?.closed ||
              // (data?.closed && data?.status != '1') ||
              data?.status == '0' ||
              data?.approveStatus != '3';
            break;
          case 'CM0204_4':
            res.disabled = true;
            break;
          case 'CM0204_5': //Đã giao hàng
            res.disabled = true;
            break;
          case 'CM0204_6': //hoàn tất hợp đồng
            res.disabled = data?.status == '1' || data?.closed;
            break;
          case 'CM0204_8': // chuyển giai đoạn
            res.disabled =
              !data?.applyProcess ||
              data?.status == '1' ||
              data?.closed ||
              this.checkMoreReason(data);
            break;
          case 'CM0204_9': // bắt đầu
            res.disabled =
              !data?.applyProcess ||
              data?.status !== '1' ||
              data?.closed ||
              this.checkMoreReason(data);
            break;
          case 'CM0204_10': // thành công
            res.disabled =
              !data?.applyProcess ||
              data?.status !== '2' ||
              data?.closed ||
              this.checkMoreReason(data);
            break;
          case 'CM0204_11': // thất bại
            res.disabled =
              !data?.applyProcess ||
              data?.status !== '2' ||
              data?.closed ||
              this.checkMoreReason(data);
            break;
          case 'CM0204_13': // thêm công việc
            res.disabled = data?.closed;
            break;
          case 'CM0204_14': // phân công người phụ trách
            res.disabled =
              data?.alloweStatus == '1'
                ? !['1', '2', '15'].includes(data.status) || data.closed
                : true;
            break;
          case 'CM0204_15': // Đóng hợp đồng
            res.disabled = data?.closed;
            break;
          case 'CM0204_16': // mở lại hợp đồng
            res.disabled = !data?.closed;
            break;
          case 'CM0204_18': // thanh lý
            res.disabled = (data?.status == '17' && data?.disposalType == '1') || data?.closed;
            break;
          case 'CM0204_19': // đưa vào quy trình xử lý
            res.disabled = data?.full
              ? data?.closed ||
                data?.applyProcess ||
                this.checkMoreReason(data) ||
                (!data?.applyProcess && ['3', '5'].includes(data?.status))
              : true;
            break;
          case 'CM0204_20': // không sử dụng quy trình
            res.disabled = data?.full
              ? data?.closed ||
                !data?.applyProcess ||
                this.checkMoreReason(data)
              : true;
            break;
        }
      });
    }
  }
  checkMoreReason(data, isShow: boolean = true) {
    if (data?.isAdminAll && isShow) return false;
    return data?.status != '1' && data?.status != '2' && data?.status != '15';
  }

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }

  clickMF(e, data) {
    this.actionName = e.text;
    this.dataSelected == data;
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
        //phan cong nguoi phu trach
        this.popupOwnerRoles(data);
        break;
      //export core làm
      case 'SYS002':
        this.exportTemplet(e, data);
        break;
      case 'CM0204_7':
        this.viewDetailContract(data);
        break;
      case 'CM0204_15':
        this.closedContract(data, true);
        break;
      case 'CM0204_16':
        this.closedContract(data, false);
        break;
      case 'CM0204_13':
        this.addTask(data);
        break;
      case 'CM0204_18': // thanh lý hợp đồng
        this.liquidationContract(data);
        break;
      case 'CM0204_17': // chia sẻ
        this.popupPermissions(data);
        break;
      case 'CM0204_21': // phụ lục
        this.addContractAppendix(data);
        break;
      case 'CM0204_22': //đổi trạng thái
        this.changeStatus(data);
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

  popupPermissions(data) {
    let dialogModel = new DialogModel();
    let formModel = new FormModel();
    formModel.formName = 'CMPermissions';
    formModel.gridViewName = 'grvCMPermissions';
    formModel.entityName = 'CM_Permissions';
    dialogModel.zIndex = 999;
    dialogModel.FormModel = formModel;
    let obj = {
      data: data,
      title: this.actionName,
      entityName: this.view.formModel.entityName,
    };
    this.callfc
      .openForm(
        PopupPermissionsComponent,
        '',
        950,
        650,
        '',
        obj,
        '',
        dialogModel
      )
      .closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          this.view.dataService.update(e?.event, true).subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }
  async addTask(contract: CM_Contracts) {
    let taskOutput = await this.stepService.addTaskCM(contract, 'CM_Contracts');
    this.taskAdd = taskOutput;
  }

  closedContract(data: CM_Contracts, type) {
    this.notiService
      .alertCode('DP018', null, this.actionName, "'" + data?.contractName + "'")
      .subscribe((info) => {
        if (info.event.status == 'Y') {
          this.contractService
            .closeContract([data?.recID, type])
            .subscribe((res) => {
              if (res) {
                data.closed = type;
                data.modifiedOn = new Date();
                data.modifiedBy = this.user?.userID;
                this.view.dataService.update(data, true).subscribe();
                this.notiService.notifyCode(
                  type ? 'DP016' : 'DP017',
                  0,
                  "'" + data?.contractName + "'"
                );
                this.changeDetectorRef.markForCheck();
              }
            });
        }
      });
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
      if (e?.funcID == 'SYS004') {
        if (e?.result?.isSendMail) {
          this.addTaskMail(e);
          this.notiService.notifyCode('SYS006');
        } else {
          this.notiService.notify('Gửi mail thất bại', '3');
        }
      }
      let appoverStatus = e?.unbounds?.statusApproval;
      if (
        appoverStatus != null &&
        appoverStatus != this.dataSelected?.approveStatus
      ) {
        this.dataSelected.approveStatus = appoverStatus;
      }
      this.view.dataService.update(this.dataSelected).subscribe();
    }
  }

  addTaskMail(e) {
    let task = new DP_Instances_Steps_Tasks();
    let mail = e?.result?.data;
    task.taskName = mail?.subject || 'Email';
    task.owner = this.user?.UserID;
    task.actualEnd = new Date();
    task.status = '3';
    task.progress = 100;
    task.recID = Util.uid();
    task.refID = Util.uid();
    task.taskType = 'E';
    task.approveStatus = '1';
    task.dependRule = '0';
    task.isTaskDefault = false;
    task.assigned = '0';
    let role = new DP_Instances_Steps_Tasks_Roles();
    role.recID = Util.uid();
    role.taskID = task.recID;
    role.objectName = this.user?.userName;
    role.objectID = this.user?.userID;
    role.createdOn = new Date();
    role.createdBy = this.user?.userID;
    role.roleType = 'O';
    role.objectType = this.user?.objectType;
    task.owner = role.objectID;
    task.roles = [role];
    if (this.dataSelected?.applyProcess) {
      task.stepID = this.dataSelected?.stepID;
      task.instanceID = this.dataSelected?.refID;
      this.api
        .exec<any>('DP', 'InstancesStepsBusiness', 'AddTaskStepAsync', [
          task,
          false,
          false,
        ])
        .subscribe((res) => {
          if (res) {
            this.taskAdd = {
              task: res[0],
              progressGroup: res[1],
              progressStep: res[2],
              isCreateMeeting: false,
            };
          }
        });
    } else {
      task.objectID = this.dataSelected?.recID;
      task.objectType = 'CM_Contracts';
      this.api
        .exec<any>('DP', 'ActivitiesBusiness', 'AddActivitiesAsync', [
          task,
          false,
          false,
        ])
        .subscribe((res) => {
          if (res) {
            this.taskAdd = {
              task: res,
              isCreateMeeting: false,
            };
          }
        });
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
    option.zIndex = 100;
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
      await this.openPopupContract(
        this.processID,
        'add',
        'contract',
        null,
        res
      );
    });
  }

  async addContractAdjourn(data: CM_Contracts) {
    this.view.dataService.addNew().subscribe(async (res) => {
      let contracts = JSON.parse(JSON.stringify(data)) as CM_Contracts;
      this.openPopupContract(null, 'copy', 'extend', data, contracts);
    });
  }

  async addContractAppendix(data: CM_Contracts) {
    let contracts = JSON.parse(JSON.stringify(data)) as CM_Contracts;
    this.openPopupContract(null, 'copy', 'appendix', data, contracts);
  }

  async editContract(contract) {
    if (contract) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(contract));
    }
    let dataEdit = this.view.dataService.dataSelected;
    this.view.dataService.edit(dataEdit).subscribe(async (res) => {
      this.openPopupContract(null, 'edit', 'contract', contract, dataEdit);
    });
  }

  async copyContract(contract) {
    this.view.dataService.addNew().subscribe(async (res) => {
      let dataCopy = JSON.parse(JSON.stringify(contract));
      this.openPopupContract(null, 'copy', 'contract', contract, dataCopy);
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
          if (res?.contractName && res?.contractID) {
            this.view.dataService.add(res).subscribe();
            this.view.currentView['schedule'].refresh();
            this.detectorRef.markForCheck();
          }
        });
    }
  }

  async openPopupContract(
    processID,
    action,
    type = 'contract',
    contractOld,
    contract
  ) {
    let data = {
      processID,
      action,
      contract: contract || null,
      account: this.account,
      type: type,
      actionName: this.actionName || '',
    };
    let option = new SidebarModel();
    option.Width = '800px';
    option.zIndex = 1000;
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;

    let popupContract = this.callfc.openSide(
      AddContractsComponent,
      data,
      option
    );
    popupContract.closed.subscribe((res) => {
      let contractAdd = res?.event;
      if (contractAdd && action == 'add' && contractAdd?.parentID) {
        let contractPrent = this.view.dataService?.data?.find(
          (x) => x.recID == contractAdd?.parentID
        );
        if (contractPrent) {
          if (contractAdd?.useType == '5') {
            this.view.dataService.remove(contractPrent).subscribe();
            this.view.currentView['schedule'].refresh();
            this.detectorRef.detectChanges();
          } else if (contractAdd?.useType == '3') {
            if (contractPrent?.recID == this.dataSelected?.recID) {
              this.contractAppendix = res?.event?.contract;
              this.detectorRef.detectChanges();
            }
          }
        }
        this.notiService.notifyCode('SYS006');
      } else if (contractAdd && action == 'copy') {
        if (contractAdd?.useType == '5') {
          this.view.dataService.remove(contractOld).subscribe();
          this.view.currentView['schedule'].refresh();
          this.detectorRef.detectChanges();
        } else if (contractAdd?.useType == '3') {
          this.contractAppendix = res?.event;
          this.detectorRef.detectChanges();
        }
        this.notiService.notifyCode('SYS006');
      }
    });
  }

  getAccount() {
    this.api
      .execSv<any>('SYS', 'AD', 'CompanySettingsBusiness', 'GetAsync')
      .subscribe((res) => {
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
      contract: this.dataSelected,
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

  //------------------------- Ký duyệt -contacType ưu tiên trước ----------------------------------------//
  approvalTrans(dt) {
    if (dt.contactType) {
      this.approvalTransAction(dt, dt.contactType, 'CM_Contracts');
    } else {
      //khúc này check cũng được không cũng được- nv chưa rõ
      if (dt?.applyProcess && dt?.processID) {
        this.cmService.getProcess(dt?.processID).subscribe((process) => {
          if (process) {
            if (process.approveRule)
              this.approvalTransAction(dt, process.processNo);
            else
              this.notiService.notifyCode(
                'Quy trình đang thực hiện chưa bật chức năng ký duyệt !'
              );
          } else {
            this.notiService.notifyCode('DP040');
          }
        });
      } else {
        if (this.approveRule == '1') this.approvalTransAction(dt, 'ES_CM0502');
        this.notiService.notifyCode(
          'Thiết lập hệ thống chưa bật chức năng ký duyệt !'
        );
      }
    }
  }

  approvalTransAction(data, categoryID, category = null) {
    this.getESCategory(categoryID, category).subscribe((category) => {
      if (!category) {
        this.notiService.notifyCode('ES028');
        return;
      }

      this.cmService
        .getDataSource(data.recID, 'ContractsBusiness')
        .then((dataSource) => {
          let exportData: ExportData = {
            funcID: this.view.formModel.funcID,
            recID: data.recID,
            data: dataSource,
            entityName: this.frmModelExport.entityName,
            formName: this.frmModelExport.formName,
            gridViewName: this.frmModelExport.gridViewName,
          };
          this.release(data, category, exportData);
        });
    });
  }

  getESCategory(categoryID, category = null) {
    if (category)
      return this.cmService.getESCategoryByCategoryIDByType(
        categoryID,
        category
      );
    else return this.cmService.getESCategoryByCategoryID(categoryID);
  }
  //Gửi duyệt
  release(data: any, category: any, exportData = null) {
    //duyet moi
    this.codxCommonService.codxReleaseDynamic(
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
      this.dataSelected.approveStatus = res?.returnStatus;
      this.dataSelected.status = res?.returnStatus;
      this.view.dataService.update(this.dataSelected).subscribe();
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
        if (dt.contactType) {
          this.cancelAction(dt, dt.contactType, 'CM_Contracts');
        } else {
          //khúc này check cũng được không cũng được- nv chưa rõ
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
      }
    });
    //   }
    // });
  }

  cancelAction(dt, categoryID, category = null) {
    this.getESCategory(categoryID, category).subscribe((res2: any) => {
      if (res2) {
        // if (res2?.eSign == true) {
        //   //trình ký
        // } else if (res2?.eSign == false) {
        //kí duyet
        this.codxCommonService
          .codxCancel(
            'CM',
            dt?.recID,
            this.view.formModel.entityName,
            null,
            null
          )
          .subscribe((res3) => {
            if (res3) {
              this.dataSelected.approveStatus = '0';
              this.view.dataService.update(this.dataSelected).subscribe();
              this.notiService.notifyCode('SYS007');
            } else this.notiService.notifyCode('SYS021');
          });
        // }
      } else this.notiService.notifyCode('ES028');
    });
  }
  //end duyet
  //--------------------------------------------------------------------//
  // "Permissions", "Closed", "ClosedOn", "ClosedBy"
  getColumsGrid(grvSetup) {
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

  // startInstance(data) {
  //   this.notiService
  //     .alertCode('DP033', null, ['"' + data?.contractName + '"' || ''])
  //     .subscribe((x) => {
  //       if (x.event && x.event.status == 'Y') {
  //         this.api
  //           .exec<any>('DP', 'InstancesBusiness', 'StartInstanceAsync', [
  //             data?.refID,
  //           ])
  //           .subscribe((res) => {
  //             if (res) {
  //               this.listInsStep = res;
  //             }
  //           });
  //         this.contractService
  //           .updateStatus([data?.recID, '2'])
  //           .subscribe((res) => {
  //             if (res) {
  //               data.status = '2';
  //               this.view.dataService.update(data, true).subscribe();
  //               this.moreDefaut = Object.assign(this.moreDefaut);
  //               this.changeDetectorRef.markForCheck();
  //             }
  //           });
  //       }
  //     });
  // }

  startInstance(data) {
    this.notiService
      .alertCode('DP033', null, ['"' + data?.contractName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.cmService
            .startInstance([data.refID, data.recID, 'CM0204', 'CM_Contracts'])
            .subscribe((resDP) => {
              if (resDP) {
                var datas = [data.recID];
                this.cmService.startContrart(datas).subscribe((res) => {
                  if (res) {
                    this.dataSelected = res;
                    this.dataSelected = JSON.parse(
                      JSON.stringify(this.dataSelected)
                    );
                    this.detailViewContract.reloadListStep(resDP[1]);
                    this.notiService.notifyCode('SYS007');
                    this.view.dataService
                      .update(this.dataSelected, true)
                      .subscribe();
                  }
                  this.detectorRef.detectChanges();
                });
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
      // this.cache
      //   .gridViewSetup(fun.formName, fun.gridViewName)
      //   .subscribe((grvSt) => {
      let stepReason = {
        isUseFail: false,
        isUseSuccess: false,
      };
      let dataCM = {
        refID: data?.refID,
        processID: data?.processID,
        stepID: data?.stepID,
        nextStep: '',
        isCallInstance: true,
      };
      let obj = {
        formModel: this.view.formModel,
        deal: data,
        stepReason: stepReason,
        headerTitle: this.actionName,
        applyFor: '4',
        dataCM: dataCM,
      };
      let dialogMoveStage = this.callfc.openForm(
        PopupMoveStageComponent,
        '',
        850,
        900,
        '',
        obj
      );
      dialogMoveStage.closed.subscribe((e) => {
        if (e && e.event != null) {
          let instance = e.event?.instance;
          let listSteps = e.event?.listStep;
          let isMoveBackStage = e.event?.isMoveBackStage;
          let tmpInstaceDTO = e.event?.tmpInstaceDTO;
          if (isMoveBackStage) {
            let dataUpdate = [tmpInstaceDTO];
            this.cmService
              .moveStageBackContract(dataUpdate)
              .subscribe((res) => {
                if (res) {
                  this.view.dataService.update(res, true).subscribe();
                  if (this.detailViewContract) {
                    this.detailViewContract.contract = this.dataSelected;
                  }
                  this.detailViewContract?.reloadListStep(listSteps);
                  this.detectorRef.detectChanges();
                }
              });
          } else {
            let dataUpdate = [data.recID, instance.stepID];
            this.cmService.moveStageContract(dataUpdate).subscribe((res) => {
              if (res) {
                this.view.dataService.update(res, true).subscribe();
                if (this.detailViewContract)
                  this.detailViewContract.contract = res;
                if (e.event.isReason != null) {
                  this.moveReason(res, e.event.isReason);
                }
                this.detailViewContract?.reloadListStep(listSteps);
                this.detectorRef.detectChanges();
              }
            });
          }
        }
        //  });
      });
    });
  }

  changeStatus(data) {
    let oldStatus = data?.status;
    this.dataSelected = data;
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 999;
    dialogModel.FormModel = this.view.formModel;
    let obj = {
      statusDefault: this.dataSelected?.statusCodeID,
      statusCodecmt: this.dataSelected?.statusCodeCmt,
      applyProcess: this.dataSelected.applyProcess,
      title: this.actionName,
      recID: this.dataSelected.recID,
      category: '4',
      formModel: this.view?.formModel,
      statusOld: this.dataSelected?.status,
      owner: this.dataSelected.owner,
    };
    let dialogStatus = this.callfc.openForm(
      PopupUpdateStatusComponent,
      '',
      500,
      400,
      '',
      obj,
      '',
      dialogModel
    );
    dialogStatus.closed.subscribe((e) => {
      if (e && e?.event != null) {
        this.statusCodeID = e?.event?.statusDefault;
        this.statusCodeCmt = e?.event?.statusCodecmt;
        let status = e?.event?.status;
        let message = e?.event?.message;
        if (status && !this.dataSelected.applyProcess) {
          this.dataSelected.status = status;
        }
        if (message) {
          this.notiService.notifyCode(
            message,
            0,
            "'" + this.dataSelected?.dealName + "'"
          );
          return;
        }
        if (this.dataSelected.applyProcess && e?.event?.isOpenForm) {
          if (status) {
            switch (status) {
              case '2':
                if (oldStatus == '1') {
                  this.startInstance(this.dataSelected);
                } else {
                  this.moveStage(this.dataSelected);
                }
                break;
              case '1':
                this.startNew(this.dataSelected);
                break;
              case '3':
              case '5':
                this.moveReason(this.dataSelected, status === '3');
                break;
              case '17':
                this.liquidationContract(data);
                break;
            }
          }
        } else {
          this.dataSelected.statusCodeID = this.statusCodeID;
          this.dataSelected.statusCodeCmt = this.statusCodeCmt;
          this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
          this.view.dataService.dataSelected = this.dataSelected;
          this.view.dataService.update(this.dataSelected, true).subscribe();
          this.detectorRef.detectChanges();
          this.notiService.notifyCode('SYS007');
        }
      }
    });
  }

  startNew(data) {
    this.notiService
      .alertCode('CM063', null, ['"' + data?.contractName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          // this.startDeal(data);
          this.cmService.startNewInstance([data.refID]).subscribe((res) => {
            if (res) {
              let dataUpdate = [
                res[1],
                null,
                data?.expectedClosed,
                this.statusCodeID,
                this.statusCodeCmt,
              ];
              this.cmService
                .moveStageBackDataCM(dataUpdate)
                .subscribe((deal) => {
                  if (deal) {
                    this.dataSelected = deal;
                    this.view.dataService
                      .update(this.dataSelected, true)
                      .subscribe();
                    // if (this.detailViewDeal)
                    //   this.detailViewDeal.dataSelected = this.dataSelected;
                    // this.detailViewDeal?.reloadListStep(res[0]);
                    // this.detectorRef.detectChanges();
                    // this.resetStatusCode();
                  }
                });
            }
          });
        }
      });
  }

  // moveReason(data: any, isMoveSuccess: boolean) {
  //   //lay step Id cu de gen lai total
  //   // if (!this.crrStepID || this.crrStepID != data.stepID)
  //   //   this.crrStepID = data.stepID;
  //   let option = new SidebarModel();
  //   option.DataService = this.view.dataService;
  //   option.FormModel = this.view.formModel;
  //   var functionID = isMoveSuccess ? 'DPT0403' : 'DPT0404';
  //   this.cache.functionList(functionID).subscribe((fun) => {
  //     this.openFormReason(data, fun, isMoveSuccess);
  //   });
  // }

  // openFormReason(data, fun, isMoveSuccess) {
  //   var formMD = new FormModel();
  //   formMD.funcID = fun.functionID;
  //   formMD.entityName = fun.entityName;
  //   formMD.formName = fun.formName;
  //   formMD.gridViewName = fun.gridViewName;
  //   let oldStatus = data.status;
  //   let oldStepId = data.stepID;
  //   var dataCM = {
  //     refID: data?.refID,
  //     processID: data?.processID,
  //     stepID: data?.stepID,
  //   };
  //   var obj = {
  //     headerTitle: fun.defaultName,
  //     formModel: formMD,
  //     isReason: isMoveSuccess,
  //     processID: data?.processID,
  //     applyFor: '4',
  //     dataCM: dataCM,
  //     stepName: data.currentStepName,
  //   };

  //   var dialogRevision = this.callfc.openForm(
  //     PopupMoveReasonComponent,
  //     '',
  //     800,
  //     600,
  //     '',
  //     obj
  //   );
  //   dialogRevision.closed.subscribe((e) => {
  //     if (e && e.event != null) {
  //       //   data = this.updateReasonDeal(e.event?.instance, data);
  //       //   var datas = [data, oldStepId, oldStatus, e.event?.comment];
  //       //   this.codxCmService.moveDealReason(datas).subscribe((res) => {
  //       //     if (res) {
  //       //       data = res[0];
  //       //       this.view.dataService.update(data).subscribe();
  //       //       //up kaban
  //       //       if (this.kanban) {
  //       //         let money = data.dealValue * data.exchangeRate;
  //       //         this.renderTotal(data.stepID, 'add', money);
  //       //         this.renderTotal(this.crrStepID, 'minus', money);
  //       //         this.kanban.refresh();
  //       //       }
  //       //       this.detectorRef.detectChanges();
  //       //     }
  //       //   });
  //       //   // }
  //       // } else {
  //       //   if (this.kanban) {
  //       //     this.dataSelected.stepID = this.crrStepID;
  //       //     this.kanban.updateCard(this.dataSelected);
  //       //   }
  //     }
  //   });
  // }

  moveReason(data: any, isMoveSuccess: boolean) {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    var functionID = isMoveSuccess ? 'DPT0403' : 'DPT0404';
    this.cache.functionList(functionID).subscribe((fun) => {
      this.openFormReason(data, fun, isMoveSuccess);
    });
  }

  openFormReason(data, fun, isMoveSuccess) {
    let formMD = new FormModel();
    formMD.funcID = fun.functionID;
    formMD.entityName = fun.entityName;
    formMD.formName = fun.formName;
    formMD.gridViewName = fun.gridViewName;
    let dataCM = {
      refID: data?.refID,
      stepID: data?.stepID,
      nextStep: data?.nextStep,
    };
    let obj = {
      headerTitle: fun.defaultName,
      formModel: formMD,
      isReason: isMoveSuccess,
      applyFor: '4',
      processID: data?.processID,
      dataCM: dataCM,
      stepName: data.currentStepName,
      isMoveProcess: false,
    };

    let dialogReason = this.callfc.openForm(
      PopupMoveReasonComponent,
      '',
      800,
      600,
      '',
      obj
    );
    dialogReason.closed.subscribe((e) => {
      if (e && e.event != null) {
        let listSteps = e.event?.listStep;
        //    data = this.updateReasonContract(e.event?.instance, data, isMoveSuccess);
        this.cmService
          .moveContractReason([
            data.recID,
            isMoveSuccess ? '3' : '5',
            e?.event?.instance?.stepID,
          ])
          .subscribe((res) => {
            if (res) {
              data = res;
              this.view.dataService.update(data, true).subscribe();
              this.detailViewContract.reloadListStep(listSteps);
              this.detectorRef.detectChanges();
            }
          });
        // }
      }
    });
  }
  // updateReasonContract(instance: any, contract: any, isMoveSuccess: boolean) {
  //   contract.status = isMoveSuccess ? '3' : '5';
  //   contract.stepID = instance.stepID;
  //   return contract;
  // }

  autoStart(event) {
    if (event) {
      this.cmService
      .startInstance([this.dataSelected?.refID, this.dataSelected?.recID, 'CM0204', 'CM_Contracts'])
      .subscribe((resDP) => {
        if (resDP) {
          var datas = [this.dataSelected?.recID];
          this.cmService.startContrart(datas).subscribe((res) => {
            if (res) {
              this.dataSelected = res;
              this.dataSelected = JSON.parse(
                JSON.stringify(this.dataSelected)
              );
              this.detailViewContract.reloadListStep(resDP[1]);
              this.notiService.notifyCode('SYS007');
              this.view.dataService
                .update(this.dataSelected, true)
                .subscribe();
            }
            this.detectorRef.detectChanges();
          });
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
    e && this.moveReason(this.dataSelected, true);
  }

  popupOwnerRoles(data) {
    let owner = data?.owner;
    var formMD = new FormModel();
    let dialogModel = new DialogModel();
    formMD.funcID = this.view?.formModel?.funcID;
    formMD.entityName = this.view?.formModel?.entityName;
    formMD.formName = this.view?.formModel?.formName;
    formMD.gridViewName = this.view?.formModel?.gridViewName;
    dialogModel.zIndex = 1011;
    dialogModel.FormModel = formMD;
    var obj = {
      recID: data?.recID,
      refID: data?.refID,
      processID: data?.processID,
      stepID: data?.stepID,
      data: data,
      gridViewSetup: null,
      formModel: this.view.formModel,
      applyFor: '4',
      titleAction: this.actionName,
      owner: data.owner,
      // startControl: data.steps.startControl,
      applyProcess: data?.applyProcess,
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
        this.view.dataService.update(e?.event, true).subscribe();
        this.notiService.notifyCode('SYS007');
        this.detectorRef.markForCheck();
      }
    });
  }

  //Export----------------------------------------------------//
  exportTemplet(e, data) {
    this.cmService
      .getDataSource(data.recID, 'ContractsBusiness')
      .then((dataSource) => {
        if (dataSource) {
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
            this.frmModelExport, //this.view.formModel,
            this.view.dataService,
            this,
            customData
          );
          this.detectorRef.detectChanges();
        }
      });
  }

  liquidationContract(data) {
    this.liquidation = JSON.parse(JSON.stringify(data));
    this.liquidation.status = '17';
    this.liquidation.disposalID = this.liquidation?.contractID;
    this.liquidation.disposalOn = new Date();
    this.liquidation.debtClosingOn = new Date();
    this.liquidation.disposalID = this.liquidation?.contractID;
    this.liquidation.pmtMethodID = 'CK';
    let opt = new DialogModel();
    opt.zIndex = 1015;
    this.popupLiquidation = this.callFunc.openForm(
      this.liquidationTmp,
      '',
      500,
      600,
      '',
      null,
      '',
      opt
    );
  }

  changeData(event) {
    if (
      event?.field == 'disposalOn' ||
      event?.field == 'debtClosingOn' ||
      event?.field == 'disposalExpired'
    ) {
      this.liquidation[event?.field] = event?.data?.fromDate;
    } else {
      this.liquidation[event?.field] = event?.data;
    }
  }

  saveLiquidation() {
    this.api
      .exec<any>('CM', 'ContractsBusiness', 'DisposalContractAsync', [
        this.liquidation,
      ])
      .subscribe((res) => {
        console.log(res);
        if (res) {
          this.dataSelected.status = res.status;
          this.view.dataService.update(res, true).subscribe();
          this.changeDetectorRef.markForCheck();
          this.popupLiquidation.close();
          this.notiService.notifyCode('SYS007');
        }
      });
  }
  reloadListStep(listSteps: any) {
    // this.isDataLoading = true;
    // this.listSteps = listSteps;
    // this.getStepCurrent(this.dataSelected);
    // this.isDataLoading = false;
    // this.changeDetectorRef.detectChanges();
  }
}

// this.columnGrids = [];
// this.arrFieldIsVisible.forEach((key) => {
//   let field = Util.camelize(key);
//   let template: any;
//   let colums: any;
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
//   if (template) {
//     colums = {
//       field: field,
//       headerText: grvSetup[key].headerText,
//       width: grvSetup[key].width,
//       template: template,
//       // textAlign: 'center',
//     };
//   } else {
//     colums = {
//       field: field,
//       headerText: grvSetup[key].headerText,
//       width: grvSetup[key].width,
//     };
//   }

//   this.columnGrids.push(colums);
// });
