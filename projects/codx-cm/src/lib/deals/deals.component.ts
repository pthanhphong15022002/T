import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  UIComponent,
  ViewModel,
  ButtonModel,
  FormModel,
  CacheService,
  ViewType,
  SidebarModel,
  ResourceModel,
  RequestOption,
  NotificationsService,
  DialogModel,
  Util,
  AlertConfirmInputConfig,
  DialogRef,
  AuthStore,
  DataRequest,
  CodxFormDynamicComponent,
  CRUDService,
  CallFuncService,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { PopupAddDealComponent } from './popup-add-deal/popup-add-deal.component';
import { CM_Customers } from '../models/cm_model';
import { PopupMoveStageComponent } from 'projects/codx-dp/src/lib/instances/popup-move-stage/popup-move-stage.component';
import { DealDetailComponent } from './deal-detail/deal-detail.component';
import { PopupMoveReasonComponent } from 'projects/codx-dp/src/lib/instances/popup-move-reason/popup-move-reason.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { finalize, firstValueFrom, map } from 'rxjs';
import { PopupBantDealComponent } from './popup-bant-deal/popup-bant-deal.component';
import { PopupPermissionsComponent } from '../popup-permissions/popup-permissions.component';
import { PopupAssginDealComponent } from './popup-assgin-deal/popup-assgin-deal.component';
import { PopupUpdateStatusComponent } from './popup-update-status/popup-update-status.component';

import { ViewDealDetailComponent } from './view-deal-detail/view-deal-detail.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { ExportData } from 'projects/codx-common/src/lib/models/ApproveProcess.model';
import { CurrentStepComponent } from './step-task/current-step/current-step.component';
import { PopupCostItemsComponent } from './popup-cost-items/popup-cost-items.component';
import { StepService } from 'projects/codx-dp/src/lib/share-crm/codx-step/step.service';

@Component({
  selector: 'lib-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss'],
})
export class DealsComponent
  extends UIComponent
  implements OnInit, AfterViewInit {
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  @ViewChild('itemViewList', { static: true })
  itemViewList: TemplateRef<any>;
  @ViewChild('itemMoreFunc', { static: true })
  itemMoreFunc: TemplateRef<any>;
  @ViewChild('itemFields', { static: true })
  itemFields: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('viewColumKaban') viewColumKaban!: TemplateRef<any>;
  @ViewChild('cardTitleTmp') cardTitleTmp!: TemplateRef<any>;
  @ViewChild('footerKanban') footerKanban!: TemplateRef<any>;
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  @ViewChild('popViewDetail') popViewDetail: TemplateRef<any>;
  @ViewChild('templateViewDetail') templateViewDetail: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;

  @ViewChild('detailViewDeal') detailViewDeal: DealDetailComponent;
  @ViewChild('confirmOrRefuseTemp') confirmOrRefuseTemp: TemplateRef<any>;
  @ViewChild('templateMore') templateMore: TemplateRef<any>;
  //temp gird
  @ViewChild('templateCustomer') templateCustomer: TemplateRef<any>;
  @ViewChild('templateBusinessLines') templateBusinessLines: TemplateRef<any>;
  @ViewChild('templateDealValue') templateDealValue: TemplateRef<any>;
  @ViewChild('templateStatus') templateStatus: TemplateRef<any>;
  @ViewChild('templateOwner') templateOwner: TemplateRef<any>;
  @ViewChild('templateSteps') templateSteps: TemplateRef<any>;
  @ViewChild('templateConsultant') templateConsultant: TemplateRef<any>;
  @ViewChild('templateExpectedClosed') templateExpectedClosed: TemplateRef<any>;
  @ViewChild('templateNote') templateNote: TemplateRef<any>;
  @ViewChild('templateStatusCode') templateStatusCode: TemplateRef<any>;
  @ViewChild('templateIndustries') templateIndustries: TemplateRef<any>;
  @ViewChild('templateCost') templateCost: TemplateRef<any>;
  @ViewChild('templateGrossProfit') templateGrossProfit: TemplateRef<any>;

  @ViewChild('templateAct') templateAct: TemplateRef<any>;
  @ViewChild('headerTempAct') headerTempAct: TemplateRef<any>;

  @ViewChild('dashBoard') dashBoard!: TemplateRef<any>;

  popupConfirm: DialogRef;

  // @ViewChild('popUpQuestionStatus', { static: true }) popUpQuestionStatus;
  // dialogQuestionForm: DialogRef;

  // extension core
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;

  // type any for view detail
  @Input() dataObj?: any;
  @Input() showButtonAdd = false;

  kanban: any;
  viewGird: any;

  // config api get data
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Deals';
  className = 'DealsBusiness';
  method = 'GetListDealsAsync';
  idField = 'recID';
  predicate = '';
  dataValue = '';
  popupViewDeal: DialogRef;
  // data structure
  listCustomer: CM_Customers[] = [];

  // type of string
  customerName: string = '';
  oldIdDeal: string = '';

  columnGrids = [];
  // showButtonAdd = false;
  button?: ButtonModel[];
  dataSelected: any;
  //region Method
  //endregion

  titleAction = '';
  vllPriority = 'TM005';
  vllApprove = 'DP043';
  vllStatus = 'CRM042';
  crrFuncID = '';
  nameModule: string = '';
  currencyIDDefault: any = 'VND';
  exchangeRateDefault: any = 1;
  viewMode = 2;
  // const set value
  readonly btnAdd: string = 'btnAdd';
  readonly applyFor: string = '1';

  request: ResourceModel;
  resourceKanban?: ResourceModel;
  hideMoreFC = false;
  colorReasonSuccess: any;
  colorReasonFail: any;
  processID: any;
  dataDrop: any;
  stepIdClick: any;
  crrStepID: any;
  moreFuncInstance: any;
  funCrr: any;
  viewCrr: any;
  viewsDefault: any;
  gridViewSetup: any;
  functionModule: any;
  paramDefault: any;
  fiterOption: any;
  orgFilter: any;
  orgPin: any;
  pinnedItem: any;
  funcIDCrr: any;
  user: any;
  crrProcessID = '';
  returnedCmt = '';
  dataColums: any = [];
  listHeader: any = [];
  listSteps: any[] = [];
  arrFieldIsVisible: any[];
  isChangeOwner = false;
  // valueListStatusCode: any; // status code ID
  statusCodeID: string = '';
  statusCodeCmt: string = '';
  processIDKanban: string;
  processIDDefault: string;
  queryParams: any;
  gridDetailView = '2';
  runMode: any;
  filterView: any;
  columns: any;
  loadFirst: boolean = true;
  totalView: string;
  moreEdit = '';
  taskAdd;
  applyApprover = '0';
  startLoad = false;
  funcDefault = 'CM0201';
  listKeyFieldSum = [];
  objectSumValue = {};
  dealConfirm: string = '1';
  tabDefaut = '';
  valueListTab;
  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private authStore: AuthStore,
    private stepService: StepService,
    private callFunc: CallFuncService
  ) {
    super(inject);
    this.executeApiCallFunctionID('CMDeals', 'grvCMDeals');
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.queryParams = this.router.snapshot.queryParams;
    if (this.queryParams?.recID) {
      this.predicate = 'RecID=@0';
      this.dataValue = this.queryParams?.recID;
    }

    this.loadParam();
    this.cache.functionList(this.funcID).subscribe((f) => {
      this.funcIDCrr = f;
      this.runMode = f?.runMode;
      this.functionModule = f.module;
      this.nameModule = f.customName;
    });

    this.getColorReason();
    // this.processID = this.activedRouter.snapshot?.queryParams['processID'];
    // if (this.processID) this.dataObj = { processID: this.processID };

    this.codxCmService
      .getRecIDProcessDefault(this.applyFor)
      .subscribe((res) => {
        if (res) {
          this.processIDDefault = res;
          this.processIDKanban = res;
        }
      });
  }

  async onInit() {
    this.afterLoad();
    this.button = [
      {
        id: this.btnAdd,
      },
    ];
    const [valueListTab, tabDefaut] = await Promise.all([
      this.codxCmService.getValueList("CRM086"),
      this.codxCmService.getSettingContract()
    ]);
    this.valueListTab = valueListTab;
    if (tabDefaut) {
      this.tabDefaut = tabDefaut?.ActiveTabDeals;
    }
  }

  ngAfterViewInit(): void { }

  onLoading(e) {
    //reload filter
    this.loadViewModel();
  }

  loadViewModel() {
    this.viewsDefault = [
      {
        type: ViewType.listdetail,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      {
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        // toolbarTemplate: this.footerButton,
        model: {
          template: this.cardKanban,
          template2: this.viewColumKaban,
          setColorHeader: true,
        },
      },
      // {
      //   type: ViewType.grid,
      //   active: false,
      //   sameData: true,
      //   model: {
      //     template2: this.templateMore,
      //     //groupSettings: { showDropArea: false, columns: ['customerName'] },
      //   },
      // },
      {
        type: ViewType.chart,
        active: false,
        sameData: false,
        reportType: 'D',
        // reportView: true,
        showFilter: true,
        model: {
          panelLeftRef: this.dashBoard,
        },
      },
      //quay lui quay tới quay lại cách ban đầu
      {
        //test view mới
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateMore,
          //groupSettings: { showDropArea: false, columns: ['customerName'] },
          resources: this.columnGrids,
          //frozenColumns: 1,
        },
      },
    ];
    this.loadDefaultSetting();

    //this.views = this.viewsDefault; //--tạm cmt

    // this.cache.viewSettings(this.funcID).subscribe((views) => {
    //   this.viewsDefault.forEach((v, index) => {
    //     let idx = views.findIndex((x) => x.view == v.type);
    //     if (idx != -1) {
    //       v.hide = false;
    //       if (views[idx].isDefault) v.action = true;
    //       else v.active = false;
    //     } else {
    //       v.hide = true;
    //       v.active = false;
    //     }
    //     // if (!(this.funcID == 'CM0201' && v.type == '6'))
    //     this.views.push(v);
    //   });
    // });
    //this.changeDetectorRef.detectChanges();
  }

  afterLoad() {
    this.request = new ResourceModel();
    this.request.service = 'CM';
    this.request.assemblyName = 'CM';
    this.request.className = 'DealsBusiness';
    this.request.method = 'GetListDealsAsync';
    this.request.idField = 'recID';
    this.request.dataObj = this.dataObj;
    if (this.queryParams?.recID) {
      this.request.predicate = this.predicate;
      this.request.dataValue = this.dataValue;
    }
    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'DP';
    this.resourceKanban.assemblyName = 'DP';
    this.resourceKanban.className = 'ProcessesBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.dataObj;
  }

  changeView(e) {
    //xu ly view fitter
    this.changeFilter();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.viewCrr = e?.view?.type;

    if (this.viewCrr == 6) {
      this.kanban = (this.view?.currentView as any)?.kanban;
      this.columns = this.kanban.columns;
    }

    this.processID = this.activedRouter.snapshot?.queryParams['processID'];
    if (this.processID) {
      this.dataObj = { processID: this.processID };
    } else if (this.processIDKanban)
      this.dataObj = { processID: this.processIDKanban };

    if (this.funCrr != this.funcID) {
      this.funCrr = this.funcID;
    } else if (
      this.funcID == 'CM0201' &&
      this.viewCrr == 6 &&
      this.processIDKanban != this.crrProcessID &&
      (this.view?.currentView as any)?.kanban
    ) {
      this.crrProcessID = this.processIDKanban;
      this.dataObj = { processID: this.processIDKanban };
      this.view.views.forEach((x) => {
        if (x.type == 6) {
          x.request.dataObj = this.dataObj;
          x.request2.dataObj = this.dataObj;
        }
      });
      this.loadKanban();
    }
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }
  changeDataMF(event, data, type = null) {
    if (this.runMode == '1') {
      this.codxShareService.changeMFApproval(event, data?.unbounds);
    } else if (event != null && data != null) {
      for (let eventItem of event) {
        if (data.status != '7') {
          if (type == 11) {
            eventItem.isbookmark = false;
          }
          const functionID = eventItem.functionID;
          const mappingFunction = this.getRoleMoreFunction(functionID);
          if (mappingFunction) {
            mappingFunction(eventItem, data);
          } else {
            if (['SYS003', 'SYS004', 'SYS001', 'SYS002', 'SYS009', 'SYS008', '', ''].includes(functionID)) {
              eventItem.disabled = this.checkMoreReason(data);
            } else {
            }
          }
        } else {
          eventItem.disabled =
            eventItem?.functionID !== 'CM0201_17'
              ? true
              : data?.alloweStatus == '1'
                ? false
                : true;
        }
      }
    }
  }
  getRoleMoreFunction(type) {
    let functionMappings;
    let isDisabled = (eventItem, data) => {
      eventItem.disabled =
        data?.alloweStatus == '1'
          ? this.checkMoreReason(data) ||
          !data.applyProcess
          : true;
    };
    let isDelete = (eventItem, data) => {
      eventItem.disabled = data.delete
        ? this.checkMoreReason(data)
        : true;
    };
    let isCopy = (eventItem, data) => {
      eventItem.disabled = data.write
        ? data.closed || data.status == '0' || data?.approveStatus == '3' || !data?.isAdminAll
        : true;
    };
    let isEdit = (eventItem, data) => {
      eventItem.disabled = data.write
        ? this.checkMoreReason(data)
        : true;
    };
    let isClosed = (eventItem, data) => {
      eventItem.disabled =
        data?.alloweStatus == '1'
          ? this.checkMoreReason(data)
          : true;
    };
    let isOpened = (eventItem, data) => {
      eventItem.disabled =
        data?.alloweStatus == '1'
          ? !data.closed || data?.approveStatus == '3'
          : true;
    };
    let isStartDay = (eventItem, data) => {
      eventItem.disabled =
        data?.alloweStatus == '1'
          ? !['1'].includes(data.status) || data.closed || !data.applyProcess
          : true;
    };
    let isOwner = (eventItem, data) => {
      eventItem.disabled =
        data?.alloweStatus == '1' ? this.checkMoreReason(data)
          : true;
    };
    let isConfirmOrRefuse = (eventItem, data) => {
      //Xác nhận từ chối
      eventItem.disabled =
        data?.alloweStatus == '1' ? !['0'].includes(data.status) : true;
    };
    let isApprovalTrans = (eventItem, data) => {
      eventItem.disabled =
        data.closed ||
        (this.applyApprover != '1' && !data.applyProcess) ||
        ['0', "3", "4", "5", "6"].includes(data.status) ||
        data?.approveStatus >= '3';
    };
    let isRejectApprover = (eventItem, data) => {
      eventItem.disabled =
        (data.closed && data.status != '1') ||
        data.status == '0' ||
        data.approveStatus != '3';
      eventItem.isblur = false;
    };
    let isPermission = (eventItem, data) => {
      // Phân quyền
      eventItem.disabled = !data.assign && !data.allowPermit ? true : false;
    };

    let isDisable = (eventItem, data) => {
      eventItem.disabled = true;
    };
    let isChangeStatus = (eventItem, data) => {
      eventItem.disabled = data?.alloweStatus == '1' ? (data?.approveStatus == '3' || data.closed) : false;
    };
    let isMoveReason = (eventItem, data) => {
      eventItem.disabled =
        data?.alloweStatus == '1'
          ? (data.closed && data?.status != '1') ||
          !data.applyProcess ||
          ['1', '0', '15'].includes(data?.status) ||
          this.checkMoreReason(data, false)
          : true;
    };
    let isUpdateProcess = (eventItem, data) => {
      eventItem.disabled = data.full
        ? data.closed ||
        data.applyProcess ||
        this.checkMoreReason(data, false) ||
        (data?.applyProcess && ['3', '5'].includes(data.status))
        : true;
    };
    let isDeleteProcess = (eventItem, data) => {
      eventItem.disabled = data.full
        ? data.closed || !data.applyProcess || this.checkMoreReason(data, false)
        : true;
    };
    let isAddTask = (eventItem, data) => {
      eventItem.disabled =
        !data?.isAdminAll || this.checkMoreReason(data, false);
    };

    functionMappings = {
      // ...['CM0201_1', 'CM0201_3', 'CM0201_4', 'CM0201_5'].reduce(
      //   (acc, code) => ({ ...acc, [code]: isDisabled }),
      //   {}
      // ),
      // ...['CM0201_12', 'CM0201_13'].reduce(
      //   (acc, code) => ({ ...acc, [code]: isConfirmOrRefuse }),
      //   {}
      // ),
      // ...['SYS101', 'SYS103', 'SYS104', 'SYS102'].reduce(
      //   (acc, code) => ({ ...acc, [code]: isDisable }),
      //   {}
      // ),
      SYS102: isDisable,
      SYS104: isDisable,
      SYS103: isDisable,
      SYS101: isDisable,
      CM0201_13: isConfirmOrRefuse,
      CM0201_12: isConfirmOrRefuse,
      CM0201_5: isDisabled,
      CM0201_1: isDisabled,

      CM0201_3: isMoveReason,
      CM0201_4: isMoveReason,
      CM0201_2: isStartDay, // bắt đầu
      CM0201_6: isApprovalTrans, //xet duyet
      CM0201_7: isOwner,
      CM0201_8: isClosed,
      CM0201_9: isOpened,
      SYS03: isEdit,
      SYS04: isCopy,
      SYS02: isDelete,
      CM0201_16: isRejectApprover,
      CM0201_15: isPermission,
      CM0201_17: isChangeStatus,
      CM0201_19: isDisable,
      CM0201_20: isDisable,
      // CM0201_19: isUpdateProcess,
      // CM0201_20: isDeleteProcess,
      CM0201_18: isAddTask,
    };

    return functionMappings[type];
  }
  clickMF(e, data) {
    if (!data) return;
    this.dataSelected = data;
    this.titleAction = e.text;
    this.stepIdClick = '';
    const functionMapping = {
      SYS03: () => this.edit(data),
      SYS04: () => this.copy(data),
      SYS02: () => this.delete(data),
      SYS05: () => this.viewInfo(data),//xem
      CM0201_1: () => this.moveStage(data),//chuyen giai doan
      CM0201_2: () => this.startNow(data), // bat dau ngay
      CM0201_3: () => this.moveReason(data, true),//thanh cong
      CM0201_4: () => this.moveReason(data, false),// that bai
      CM0201_7: () => this.popupOwnerRoles(data),//phan con phu trach
      CM0201_8: () => this.openOrCloseDeal(data, true),//dong
      CM0201_9: () => this.openOrCloseDeal(data, false),//mo

      CM0201_6: () => this.approvalTrans(data), //goi duyet
      CM0201_12: () => this.confirmOrRefuse(true, data),
      CM0201_13: () => this.confirmOrRefuse(false, data),
      CM0201_14: () => this.openFormBANT(data),
      CM0201_16: () => this.cancelApprover(data),//huy duyet
      SYS002: () => this.exportTemplet(e, data),
      CM0201_15: () => this.popupPermissions(data),//chia se
      CM0201_17: () => this.changeStatus(data),//doi trang thai
      CM0201_18: () => this.addTask(data),//them cong viec
      CM0201_19: () => this.updateProcess(data, true), //Dua vao quy trinh
      CM0201_20: () => this.updateProcess(data, false),//khong su dung quy trinh
    };

    const executeFunction = functionMapping[e.functionID];
    if (executeFunction) {
      executeFunction();
    } else {
      this.codxShareService.defaultMoreFunc(
        e,
        data,
        this.afterSave.bind(this),
        this.view.formModel,
        this.view.dataService,
        this
      );
      this.detectorRef.detectChanges();
    }
  }
  //-------------- GET DEFAULT ------------------------//
  executeApiCallFunctionID(formName, gridViewName) {
    this.getGridViewSetup(formName, gridViewName);
    this.getMoreFunction(formName, gridViewName);
  }

  getMoreFunction(formName, gridViewName) {
    this.cache.moreFunction(formName, gridViewName).subscribe((res) => {
      if (res && res.length > 0) {
        this.moreFuncInstance = res;
      }
    });
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res?.length > 0) {
        let m = res?.find((x) => x.functionID == 'SYS03');
        this.moreEdit = m?.customName ?? m?.defaultName;
      }
    });
  }

  getGridViewSetup(formName, gridViewName) {
    this.cache.gridViewSetup(formName, gridViewName).subscribe((grv) => {
      if (grv) {
        this.gridViewSetup = grv;
        this.vllStatus = this.gridViewSetup?.Status?.referedValue;
        this.vllApprove = this.gridViewSetup?.ApproveStatus?.referedValue;
        // lay grid view - view gird he thong
        let arrField = Object.values(this.gridViewSetup).filter(
          (x: any) => x.isVisible
        );

        if (Array.isArray(arrField)) {
          this.arrFieldIsVisible = arrField
            .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
            .map((x: any) => x.fieldName);
          this.listKeyFieldSum = arrField
            .filter((x: any) => x.summaryBottom == '1' || x.summaryTop == '1')
            .map((x: any) => x.fieldName);
        }
        this.getColumsGrid(this.gridViewSetup);
      }
    });
  }

  getColorReason() {
    this.cache.valueList('DP036').subscribe((res) => {
      if (res.datas) {
        for (let item of res.datas) {
          if (item.value === 'S') {
            this.colorReasonSuccess = item;
          } else if (item.value === 'F') {
            this.colorReasonFail = item;
          }
        }
      }
    });
  }
  //----------------- END ---------------------------//

  checkMoreReason(data, isShow: boolean = true) {
    return (!['1', '2', '15'].includes(data?.status) || data?.approveStatus == '3' || data?.closed);
  }

  updateProcess(data, isCheck) {
    this.notificationsService
      .alertCode('DP033', null, [
        '"' + data?.dealName + '" ' + this.titleAction + ' ',
      ])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.checkOwner(data, isCheck);
        }
      });
  }
  checkOwner(data, isCheck) {
    if (isCheck && data?.owner) {
      let datas = [
        data.processID,
        data.businessLineID,
        data.owner,
        this.applyFor,
      ];
      this.codxCmService.isExistOwnerInProcess(datas).subscribe((res) => {
        if (res) {
          let dataUpdateProcess = [
            data.recID,
            data.status,
            '',
            isCheck,
            data.owner,
          ];
          this.getApiUpdateProcess(dataUpdateProcess);
        } else {
          this.notificationsService
            .alertCode('DP033', null, [
              '"' +
              data?.dealName +
              '" ' +
              'Người phụ trách không tồn tại trong quy trình' +
              ' ',
            ])
            .subscribe((x) => {
              if (x.event && x.event.status == 'Y') {
                let dataUpdateProcess = [
                  data.recID,
                  data.status,
                  '',
                  isCheck,
                  '',
                ];
                this.getApiUpdateProcess(dataUpdateProcess);
              }
            });
        }
      });
    } else {
      let dataUpdateProcess = [data.recID, data.status, '', isCheck];
      this.getApiUpdateProcess(dataUpdateProcess);
    }
  }
  getApiUpdateProcess(datas) {
    this.codxCmService.updateProcessDeal(datas).subscribe((res) => {
      if (res) {
        this.dataSelected = res;
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        this.notificationsService.notifyCode('SYS007');
        this.view.dataService.update(this.dataSelected, true).subscribe();
        if (this.dataSelected.applyProcess) {
          this.detailViewDeal.promiseAllAsync();
        } else {
          this.detailViewDeal.reloadListStep([]);
        }
        if (this.kanban) {
          this.renderKanban(this.dataSelected);
        }
      }
      this.detectorRef.detectChanges();
    });
  }
  afterSave(e?: any, that: any = null) {
    if (e) {
      let appoverStatus = e?.unbounds?.statusApproval;
      if (
        appoverStatus != null &&
        appoverStatus != this.dataSelected.approveStatus
      ) {
        this.dataSelected.approveStatus = appoverStatus;
      }
      this.view.dataService.update(this.dataSelected, true).subscribe();
    }
  }
  changeMF(e) {
    this.changeDataMF(e.e, e.data);
  }
  startNow(data) {
    this.notificationsService
      .alertCode('DP033', null, ['"' + data?.dealName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.startDeal(data);
        }
      });
  }
  startNew(data) {
    this.notificationsService
      .alertCode('CM063', null, ['"' + data?.dealName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          // this.startDeal(data);
          this.codxCmService.startNewInstance([data.refID]).subscribe((res) => {
            if (res) {
              let dataUpdate = [
                res[1],
                null,
                data?.expectedClosed,
                this.statusCodeID,
                this.statusCodeCmt,
              ];
              this.codxCmService
                .moveStageBackDataCM(dataUpdate)
                .subscribe((deal) => {
                  if (deal) {
                    this.dataSelected = deal;
                    this.view.dataService
                      .update(this.dataSelected, true)
                      .subscribe();
                    if (this.kanban) {
                      this.renderKanban(this.dataSelected);
                    }
                    if (this.detailViewDeal)
                      this.detailViewDeal.dataSelected = this.dataSelected;
                    this.detailViewDeal?.reloadListStep(res[0]);
                    this.detectorRef.detectChanges();
                    this.resetStatusCode();
                  }
                });
            }
          });
        }
      });
  }
  //
  resetStatusCode() {
    this.statusCodeCmt = '';
    this.statusCodeID = '';
  }

  // //Begin Kanaban keo tha kanban
  onActions(e) {
    switch (e.type) {
      case 'drop':
        this.dataDrop = e.data;
        this.stepIdClick = JSON.parse(JSON.stringify(this.dataDrop.stepID));
        // xử lý data chuyển công đoạn
        if (this.crrStepID != this.dataDrop.stepID)
          this.dropDeals(this.dataDrop);
        break;
      case 'drag':
        ///bắt data khi kéo
        this.crrStepID = e?.data?.stepID;
        break;
      case 'dbClick':
        //xư lý dbClick
        this.viewDetail(e.data?.rowData);
        break;
      //chang fiter
      case 'pined-filter':
        if (this.kanban) {
          this.seclectFilter(e.data);
        }
        break;
      //data load xong
      case 'databound':
        this.totalGirdView();
        break;
    }
  }

  dropDeals(data) {
    data.stepID = this.crrStepID;
    // if (!data.edit ? !data.edit: data.createdBy !== this.user.userID ) {
    //   this.notificationsService.notifyCode('SYS032');
    //   return;
    // }
    if (data?.alloweStatus != '1') {
      this.notificationsService.notifyCode('CM027');
      return;
    }
    if (data.closed) {
      this.notificationsService.notifyCode('DP039');
      return;
    }
    if (data.status == '0') {
      this.notificationsService.notify('Cơ hội chưa được xác nhận');
      return;
    }
    if (data.status == '1') {
      this.notificationsService.notifyCode(
        'DP038',
        0,
        '"' + data.dealName + '"'
      );
      this.changeDetectorRef.detectChanges();
      return;
    }
    if (data.status != '1' && data.status != '2') {
      this.notificationsService.notifyCode(
        'DP037',
        0,
        '"' + data.dealName + '"'
      );
      this.changeDetectorRef.detectChanges();
      return;
    }

    if (
      this.kanban &&
      this.kanban.columns?.length > 0 &&
      this.dataColums?.length == 0
    )
      this.dataColums = this.kanban.columns;

    if (this.dataColums.length > 0) {
      var idx = this.dataColums.findIndex(
        (x) => x.dataColums.recID == this.stepIdClick
      );
      if (idx != -1) {
        var stepCrr = this.dataColums[idx].dataColums;
        if (!stepCrr?.isSuccessStep && !stepCrr?.isFailStep) {
          idx = this.moreFuncInstance.findIndex(
            (x) => x.functionID == 'CM0201_1'
          );
          if (idx != -1) {
            if (this.checkMoreReason(data)) {
              this.notificationsService.notifyCode('SYS032');
              return;
            }
            this.titleAction = this.moreFuncInstance[idx].customName;
            this.moveStage(data);
          }
        } else {
          if (stepCrr?.isSuccessStep) {
            idx = this.moreFuncInstance.findIndex(
              (x) => x.functionID == 'CM0201_3'
            );
            if (idx != -1) {
              this.titleAction = this.moreFuncInstance[idx].customName;
              this.moveReason(data, true);
            }
          } else {
            idx = this.moreFuncInstance.findIndex(
              (x) => x.functionID == 'CM0201_4'
            );
            if (idx != -1) {
              this.titleAction = this.moreFuncInstance[idx].customName;
              this.moveReason(data, false);
            }
          }
        }
      }
    }
  }

  viewDetail(deal) {
    if (deal) {
      let data = {
        formModel: this.view.formModel,
        dataView: deal,
        isView: true,
        detailViewDeal: this.detailViewDeal,
      };
      let option = new DialogModel();
      option.IsFull = true;
      option.zIndex = 100;
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      let popup = this.callFunc.openForm(
        ViewDealDetailComponent,
        '',
        null,
        null,
        '',
        data,
        '',
        option
      );
      popup.closed.subscribe((e) => {
        if (e && e.event) {
          if (e.event?.isUpDealCost) {
            let dealCost = e.event.dealCost;
            deal.dealCost = dealCost;
          }
          if (e.event?.isUpDealValueTo) {
            let dealValueTo = e.event.dealValueTo;
            deal.dealValueTo = dealValueTo;
          }
          let grossProfit = deal.dealValueTo - deal.dealCost;
          deal.grossProfit = grossProfit;

          this.view.dataService.update(deal, true).subscribe();

          if (this.listKeyFieldSum?.length > 0) this.totalGirdView(); //tính lại tổng chajy cuxng nhanh
        }
      });
    }
  }
  //end Kanaban

  currentStep(deal, type = '1') {
    if (deal) {
      let data = {
        formModel: this.view.formModel,
        dataView: deal,
        isView: true,
        type,
        view: this.view,
        statusCodeID: this.statusCodeID,
        statusCodeCmt: this.statusCodeCmt,
        detailViewDeal: this.detailViewDeal,
        title: type == '1' ? 'Thông tin dự án' : 'Hiện trạng',
        // listInsStepStart: this.listInsStep,
      };
      let option = new DialogModel();
      option.zIndex = 100;
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      let popup = this.callFunc.openForm(
        CurrentStepComponent,
        '',
        800,
        window.innerHeight,
        '',
        data,
        '',
        option
      );
      popup.closed.subscribe((e) => {
        if (e && e.event) {
          if (e.event?.isUpDealCost) {
            let dealCost = e.event.dealCost;
            deal.dealCost = dealCost;
          }
          if (e.event?.isUpDealValueTo) {
            let dealValueTo = e.event.dealValueTo;
            deal.dealValueTo = dealValueTo;
          }
          let grossProfit = deal.dealValueTo - deal.dealCost;
          deal.grossProfit = grossProfit;

          this.view.dataService.update(deal, true).subscribe();

          if (this.listKeyFieldSum?.length > 0) this.totalGirdView(); //tính lại tổng chajy cuxng nhanh
        }
      });
    }
  }

  moveStage(data: any) {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    this.cache.functionList('DPT0402').subscribe((fun) => {
      this.cache
        .gridViewSetup(fun.formName, fun.gridViewName)
        .subscribe((grvSt) => {
          let formMD = new FormModel();
          formMD.funcID = fun.functionID;
          formMD.entityName = fun.entityName;
          formMD.formName = fun.formName;
          formMD.gridViewName = fun.gridViewName;
          let oldStatus = data.status;
          let oldStepId = data.stepID;
          let stepReason = {
            isUseFail: false,
            isUseSuccess: false,
          };
          let dataCM = {
            refID: data?.refID,
            processID: data?.processID,
            stepID: data?.stepID,
            nextStep: this.stepIdClick ? this.stepIdClick : '',
            isCallInstance: true,
            // listStepCbx: this.lstStepInstances,
          };
          let obj = {
            formModel: formMD,
            deal: data,
            stepReason: stepReason,
            headerTitle: this.titleAction,
            applyFor: this.applyFor,
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
                let dataUpdate = [
                  tmpInstaceDTO,
                  e.event?.comment,
                  e.event?.expectedClosed,
                  this.statusCodeID,
                  this.statusCodeCmt,
                ];
                this.codxCmService
                  .moveStageBackDataCM(dataUpdate)
                  .subscribe((res) => {
                    if (res) {
                      this.view.dataService.update(res, true).subscribe();
                      if (this.kanban) {
                        this.renderKanban(res);
                      }
                      if (this.detailViewDeal)
                        this.detailViewDeal.dataSelected = res;
                      this.detailViewDeal?.reloadListStep(listSteps);
                      this.detectorRef.detectChanges();
                    }
                  });
              } else {
                let dataUpdate = [
                  data.recID,
                  instance.stepID,
                  oldStepId,
                  oldStatus,
                  e.event?.comment,
                  e.event?.expectedClosed,
                  e.event?.permissionCM,
                ];
                this.codxCmService
                  .moveStageDeal(dataUpdate)
                  .subscribe((res) => {
                    if (res) {
                      this.view.dataService.update(res, true).subscribe();
                      if (this.kanban) {
                        this.renderKanban(res);
                      }
                      if (this.detailViewDeal)
                        this.detailViewDeal.dataSelected = res;
                      if (e.event.isReason != null) {
                        this.moveReason(res, e.event.isReason);
                      }
                      this.detailViewDeal?.reloadListStep(listSteps);
                      this.detectorRef.detectChanges();
                    }
                  });
              }
            }
          });
        });
    });
  }

  moveReason(data: any, isMoveSuccess: boolean) {
    //lay step Id cu de gen lai total
    if (!this.crrStepID || this.crrStepID != data.stepID)
      this.crrStepID = data.stepID;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    var functionID = isMoveSuccess ? 'DPT0403' : 'DPT0404';
    this.cache.functionList(functionID).subscribe((fun) => {
      this.openFormReason(data, fun, isMoveSuccess);
    });
  }

  openOrCloseDeal(data, check) {
    var datas = [data.recID, check];
    this.notificationsService
      .alertCode('DP018', null, this.titleAction, "'" + data.dealName + "'")
      .subscribe((info) => {
        if (info.event.status == 'Y') {
          this.codxCmService.openOrClosedDeal(datas).subscribe((res) => {
            if (res) {
              this.dataSelected.closed = check;
              this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
              this.view.dataService.update(this.dataSelected, true).subscribe();
              this.notificationsService.notifyCode(
                check ? 'DP016' : 'DP017',
                0,
                "'" + data.dealName + "'"
              );
              if (this.kanban) {
                this.renderKanban(this.dataSelected);
              }
              this.detectorRef.detectChanges();
            }
          });
        }
      });
  }
  openFormBANT(data) {
    var formMD = new FormModel();
    formMD.funcID = this.funcIDCrr.functionID;
    formMD.entityName = this.funcIDCrr.entityName;
    formMD.formName = this.funcIDCrr.formName;
    formMD.gridViewName = this.funcIDCrr.gridViewName;
    var obj = {
      headerTitle: this.titleAction,
      formModel: formMD,
      gridViewSetup: this.gridViewSetup,
      data: data,
    };

    var dialogRevision = this.callfc.openForm(
      PopupBantDealComponent,
      '',
      650,
      750,
      '',
      obj
    );
    dialogRevision.closed.subscribe((e) => {
      if (e && e.event != null) {
        this.view.dataService.update(e.event, true).subscribe();
        if (this.detailViewDeal)
          this.detailViewDeal.dataSelected = JSON.parse(
            JSON.stringify(this.dataSelected)
          );

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  openFormReason(data, fun, isMoveSuccess) {
    let formMD = new FormModel();
    formMD.funcID = fun.functionID;
    formMD.entityName = fun.entityName;
    formMD.formName = fun.formName;
    formMD.gridViewName = fun.gridViewName;
    let oldStatus = data.status;
    let oldStepId = data.stepID;
    let dataCM = {
      refID: data?.refID,
      stepID: data?.stepID,
      nextStep: data?.nextStep,
    };
    let obj = {
      headerTitle: fun.defaultName,
      formModel: formMD,
      isReason: isMoveSuccess,
      applyFor: this.applyFor,
      dataCM: dataCM,
      processID: data?.processID,
      stepName: data.currentStepName,
      isMoveProcess: true,
    };

    let dialogRevision = this.callfc.openForm(
      PopupMoveReasonComponent,
      '',
      800,
      600,
      '',
      obj
    );
    dialogRevision.closed.subscribe((e) => {
      if (e && e.event != null) {
        let listSteps = e.event?.listStep;
        this.detailViewDeal?.reloadListStep(listSteps);
        data = this.updateReasonDeal(e.event?.instance, data);
        let datas = [data, oldStepId, oldStatus, e.event?.comment];
        this.codxCmService.moveDealReason(datas).subscribe((res) => {
          if (res) {
            data = res;
            this.view.dataService.update(data, true).subscribe();
            //up kaban
            if (this.kanban) {
              this.renderKanban(data);
            }
            this.detectorRef.detectChanges();
          }
        });
        // }
      } else {
        if (this.kanban) {
          this.dataSelected.stepID = this.crrStepID;
          this.kanban.updateCard(this.dataSelected);
        }
      }
    });
  }

  convertDataInstance(deal: any, instance: any, nextStep: any) {
    deal.dealName = instance.title;
    deal.memo = instance.memo;
    deal.endDate = instance.endDate;
    deal.dealID = instance.instanceNo;
    deal.owner = instance.owner;
    deal.salespersonID = instance.owner;
    deal.processID = instance.processID;
    deal.stepID = instance.stepID;
    deal.refID = instance.recID;
    deal.stepID = instance.stepID;
    deal.status = instance.status;
    deal.nextStep = nextStep;
    deal.startDate = null;
    return deal;
  }
  updateReasonDeal(instance: any, deal: any) {
    deal.status = instance.status;
    deal.stepID = instance.stepID;
    deal.nextStep = '';
    return deal;
  }
  startDeal(data) {
    this.codxCmService
      .startInstance([data.refID, data.recID, 'CM0201', 'CM_Deals'])
      .subscribe((resDP) => {
        if (resDP) {
          let datas = [data.recID, resDP[0]];
          this.codxCmService.startDeal(datas).subscribe((res) => {
            if (res) {
              this.dataSelected = res;
              this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
              this.view.dataService.update(this.dataSelected, true).subscribe();
              if (this.kanban) this.kanban.updateCard(this.dataSelected);
              if (this.detailViewDeal)
                this.detailViewDeal.reloadListStep(resDP[1]);
              this.notificationsService.notifyCode('SYS007');
            }
            this.detectorRef.detectChanges();
          });
        }
      });
  }

  popupOwnerRoles(data) {
    this.dataSelected = data;
    var formMD = new FormModel();
    let dialogModel = new DialogModel();
    formMD.funcID = this.funcIDCrr.functionID;
    formMD.entityName = this.funcIDCrr.entityName;
    formMD.formName = this.funcIDCrr.formName;
    formMD.gridViewName = this.funcIDCrr.gridViewName;
    dialogModel.zIndex = 999;
    dialogModel.FormModel = formMD;
    var obj = {
      recID: data?.recID,
      refID: data?.refID,
      processID: data?.processID,
      stepID: data?.stepID,
      data: data,
      gridViewSetup: this.gridViewSetup,
      formModel: this.view.formModel,
      applyFor: this.applyFor,
      titleAction: this.titleAction,
      owner: data.owner,
      //startControl: data.steps.startControl,
      applyProcess: data.applyProcess,
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
        this.dataSelected = e?.event;
        this.view.dataService.update(e?.event, true).subscribe();

        this.detailViewDeal?.promiseAllAsync();
        if (this.kanban) this.kanban.updateCard(this.dataSelected);
        this.notificationsService.notifyCode('SYS007');
        this.detectorRef.detectChanges();
      }
    });
  }

  getPropertiesHeader(data, type) {
    if (!this.listHeader || this.listHeader?.length == 0) {
      this.listHeader = this.getPropertyColumn();
    }
    let find = this.listHeader?.find((item) => item.recID === data.keyField);
    return find ? find[type] : '';
  }

  getPropertyColumn() {
    let dataColumns =
      this.kanban?.columns?.map((column) => {
        return {
          recID: column['dataColums']?.recID,
          icon: column['dataColums']?.icon || null,
          iconColor: column['dataColums']?.iconColor || null,
          backgroundColor: column['dataColums']?.backgroundColor || null,
          textColor: column['dataColums']?.textColor || null,
        };
      }) || [];

    return dataColumns;
  }
  //#region CRUD
  add() {
    this.addDeal();
  }

  addDeal() {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      var formMD = new FormModel();
      option.Width = '800px';
      option.zIndex = 1001;
      this.openFormDeal(formMD, option, 'add');
    });
  }

  openFormDeal(formMD, option, action) {
    var obj = {
      action: action === 'add' ? 'add' : 'copy',
      formMD: formMD,
      titleAction: this.formatTitleMore(this.titleAction),
      processID: this.processID,
      gridViewSetup: this.gridViewSetup,
      functionModule: this.functionModule,
      currencyIDDefault: this.currencyIDDefault,
      exchangeRateDefault: this.exchangeRateDefault,
      customerCategory:
        action === 'add' ? '' : this.dataSelected?.customerCategory,
      copyTransID: this.oldIdDeal,
    };
    let dialogCustomDeal = this.callfc.openSide(
      PopupAddDealComponent,
      obj,
      option
    );
    dialogCustomDeal.closed.subscribe((e) => {
      if (e && e.event != null) {
        //this.view.dataService.update(e.event, true).subscribe();
        //up kaban nee đúng process
        let dt = e.event;
        this.dataSelected = dt;
        if (this.kanban && this.processIDKanban == e.event?.processID) {
          let money = dt.dealValue * dt.exchangeRate;
          this.renderTotal(dt.stepID, 'add', money);

          // this.kanban?.updateCard(dt);
          // this.kanban?.kanbanObj?.refreshHeader();
          this.kanban.refresh();
        }
        // if (this.detailViewDeal) {
        //   this.detailViewDeal.dataSelected = JSON.parse(
        //     JSON.stringify(this.dataSelected)
        //   );
        //   this.detailViewDeal?.promiseAllAsync();
        //   this.detailViewDeal.loadContactEdit();
        // }
        //   this.detailViewDeal.promiseAllAsync();
        if (this.listKeyFieldSum?.length > 0) this.totalGirdView(); //tính lại tổng
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    let ownerIdOld = data.owner;
    let dealValueOld = data.dealValue;
    let exchangeRateOld = data.exchangeRate;
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        this.funcID;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        option.zIndex = 1001;
        var formMD = new FormModel();

        var obj = {
          action: 'edit',
          formMD: formMD,
          titleAction: this.formatTitleMore(this.titleAction),
          gridViewSetup: this.gridViewSetup,
          customerCategory: this.dataSelected?.customerCategory,
        };
        let dialogCustomDeal = this.callfc.openSide(
          PopupAddDealComponent,
          obj,
          option
        );
        dialogCustomDeal.closed.subscribe((e) => {
          if (e && e.event != null) {
            this.view.dataService.update(e.event, true).subscribe();
            let dt = e.event;
            this.dataSelected = dt;
            //up kaban
            if (
              this.kanban &&
              (dealValueOld != e.event?.dealValue ||
                exchangeRateOld != e.event?.exchangeRate)
            ) {
              let money =
                dt.dealValue * dt.exchangeRate - dealValueOld * exchangeRateOld;
              this.renderTotal(dt.stepID, 'add', money);

              // this.kanban?.updateCard(dt);
              // this.kanban?.kanbanObj?.refreshHeader();
              // this.kanban.refreshUI();
              this.kanban.refresh();
            }
            if (this.detailViewDeal) {
              this.detailViewDeal.dataSelected = JSON.parse(
                JSON.stringify(this.dataSelected)
              );
              this.detailViewDeal?.promiseAllAsync();
              this.detailViewDeal.loadContactEdit();
            }
            this.isChangeOwner = ownerIdOld != e.event.owner;
            if (this.listKeyFieldSum?.length > 0) this.totalGirdView(); //tính lại tổng
            this.changeDetectorRef.detectChanges();
          }
        });
      });
  }

  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      this.oldIdDeal = data.recID;
    }
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;

      var formMD = new FormModel();
      option.Width = '800px';
      option.zIndex = 1001;
      this.openFormDeal(formMD, option, 'copy');
    });
  }

  delete(data: any) {
    var datas = [data.recID];
    this.codxCmService.isCheckDealInUse(datas).subscribe((res) => {
      if (res[0]) {
        this.notificationsService.notifyCode(
          'CM014',
          0,
          '' + this.nameModule + ''
        );
        return;
      } else if (res[1]) {
        this.notificationsService.notifyCode(
          'CM015',
          0,
          '' + this.nameModule + ''
        );
        return;
      } else {
        if (data?.processID && ['3', '4', '5', '6'].includes(data?.status)) {
          this.codxCmService
            .getProcessSettingByRecID(data?.processID)
            .subscribe((res) => {
              if (res) {
                if (res?.isEdit) {
                  this.view.dataService.dataSelected = data;
                  this.view.dataService
                    .delete([this.view.dataService.dataSelected], true, (opt) =>
                      this.beforeDel(opt)
                    )
                    .subscribe((res) => {
                      if (res) {
                        this.view.dataService.onAction.next({
                          type: 'delete',
                          data: data,
                        });
                        //up kaban
                        if (this.kanban) {
                          let money = data.dealValue * data.exchangeRate;
                          this.renderTotal(data.stepID, 'minus', money);
                          this.kanban?.refresh();
                        }
                      }
                      this.changeDetectorRef.detectChanges();
                    });
                } else {
                  this.notificationsService.notify(
                    'Cơ hội không thể xóa khi đã thành công!',
                    '3'
                  );
                }
              }
            });
        } else {
          this.view.dataService.dataSelected = data;
          this.view.dataService
            .delete([this.view.dataService.dataSelected], true, (opt) =>
              this.beforeDel(opt)
            )
            .subscribe((res) => {
              if (res) {
                this.view.dataService.onAction.next({
                  type: 'delete',
                  data: data,
                });
                //up kaban
                if (this.kanban) {
                  let money = data.dealValue * data.exchangeRate;
                  this.renderTotal(data.stepID, 'minus', money);
                  this.kanban?.refresh();
                }
              }
              this.changeDetectorRef.detectChanges();
            });
        }
      }
    });
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeletedDealAsync';
    opt.data = [itemSelected.recID, null];
    return true;
  }

  viewInfo(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    this.funcID;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    option.zIndex = 1001;
    var formMD = new FormModel();

    var obj = {
      action: 'view',
      formMD: formMD,
      titleAction: this.formatTitleMore(this.titleAction),
      gridViewSetup: this.gridViewSetup,
      customerCategory: this.dataSelected?.customerCategory,
    };
    let dialogCustomDeal = this.callfc.openSide(
      PopupAddDealComponent,
      obj,
      option
    );
  }
  //#endregion

  //#region event
  selectedChange(data) {
    // debugger;
    if (data || data?.data) this.dataSelected = data?.data ? data?.data : data;
  }
  //#endregion

  autoMoveStage($event) {
    if ($event && $event != null) {
      this.view.dataService.update($event, true).subscribe();
      if (this.detailViewDeal) {
        this.detailViewDeal.promiseAllAsync();
        this.detailViewDeal.dataSelected = JSON.parse(
          JSON.stringify(this.dataSelected)
        );
      }

      this.changeDetectorRef.detectChanges();
    }
  }

  //------------------------- Ký duyệt  ----------------------------------------//
  approvalTrans(dt) {
    if (dt?.applyProcess && dt?.processID) {
      this.codxCmService.getProcess(dt?.processID).subscribe((process) => {
        if (process) {
          if (process.approveRule)
            this.approvalTransAction(dt, process.processNo);
          else
            this.notificationsService.notify(
              'Quy trình đang thực hiện chưa bật chức năng ký duyệt !',
              '3'
            );
        } else {
          this.notificationsService.notifyCode('DP040');
        }
      });
    } else {
      if (this.applyApprover == '1') this.approvalTransAction(dt, 'ES_CM0503');
      else
        this.notificationsService.notify(
          'Thiết lập hệ thống chưa bật chức năng ký duyệt !',
          '3'
        );
    }
  }

  approvalTransAction(data, categoryID) {
    this.codxCmService
      .getESCategoryByCategoryID(categoryID)
      .subscribe((category) => {
        if (!category) {
          this.notificationsService.notifyCode('ES028');
          return;
        }
        this.codxCmService
          .getDataSource(data.recID, 'DealsBusiness')
          .then((dataSource) => {
            let exportData: ExportData = {
              funcID: this.view.formModel.funcID,
              recID: data.recID,
              data: dataSource,
              entityName: this.view.formModel.entityName,
              formName: this.view.formModel.formName,
              gridViewName: this.view.formModel.gridViewName,
            };
            this.release(data, category, exportData);
          });
      });
  }

  release(data: any, category: any, exportData = null) {
    // new function release
    this.codxCommonService.codxReleaseDynamic(
      this.view.service,
      data,
      category,
      this.view.formModel.entityName,
      this.view.formModel.funcID,
      data?.dealName, //tên nè,
      this.releaseCallback.bind(this),
      null,
      null,
      'CM_Deals', //null thích đổi mãi
      null,
      null,
      exportData
    );
  }
  //call Back
  releaseCallback(res: any, t: any = null) {
    if (res?.msgCodeError) this.notificationsService.notify(res?.msgCodeError);
    else {
      this.dataSelected.approveStatus = res?.returnStatus;
      this.dataSelected.status = res?.returnStatus;
      this.view.dataService.update(this.dataSelected).subscribe();
      if (this.kanban) this.kanban.updateCard(this.dataSelected);
    }
  }

  //Huy duyet
  cancelApprover(dt) {
    this.notificationsService.alertCode('ES016').subscribe((x) => {
      if (x.event.status == 'Y') {
        this.codxCmService.getProcess(dt.processID).subscribe((process) => {
          if (process) {
            this.codxCmService
              .getESCategoryByCategoryID(process.processNo)
              .subscribe((res2: any) => {
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
                        this.view.dataService
                          .update(this.dataSelected)
                          .subscribe();
                        if (this.kanban)
                          this.kanban.updateCard(this.dataSelected);
                        this.notificationsService.notifyCode('SYS007');
                      } else this.notificationsService.notifyCode('SYS021');
                    });
                  // }
                }
              });
          } else {
            this.notificationsService.notifyCode('DP040');
          }
        });
      }
    });
  }
  //end duyet
  //--------------------------------------------------------------------//

  //--------------------------Tính tổng-------------------------//
  genTotal(stepID) {
    let totalCol = 0;
    if (this.kanban && this.kanban.columns?.length > 0) {
      let idx = this.kanban.columns.findIndex((x) => x.keyField == stepID);
      if (idx != -1) {
        let dt = this.kanban.columns[idx];
        if (dt.totalDealValue) {
          totalCol = dt.totalDealValue / this.exchangeRateDefault;
        }
      }
    }
    return totalCol;
  }

  renderKanban(data) {
    let money = data.dealValue * data.exchangeRate;
    this.renderTotal(data.stepID, 'add', money);
    this.renderTotal(this.crrStepID, 'minus', money);
    // this.kanban.updateCard(data);
    // this.kanban?.kanbanObj?.refreshHeader();
    this.kanban.refresh();
  }

  renderTotal(stepID, action = 'add', money) {
    let idx = this.kanban.columns.findIndex((x) => x.keyField == stepID);
    if (idx != -1) {
      if (action == 'add') {
        this.kanban.columns[idx].totalDealValue += money;
      } else if (action == 'minus') {
        this.kanban.columns[idx].totalDealValue -= money;
      }
    }
  }
  //end

  //-----------------------------change Filter -------------------------------//
  changeFilter() {
    //change view filter => Lúc trước filter lỗi mới cần
    if (this.funcID != 'CM0201') {
      let idxBusinesLineOp = this.view.filterOptions.findIndex(
        (x) => x.fieldName == 'BusinessLineID'
      );
      if (idxBusinesLineOp != -1) {
        this.fiterOption = this.view.filterOptions[idxBusinesLineOp];
        this.view.filterOptions.splice(idxBusinesLineOp, 1);
      }

      let idxBusinesLineOg = this.view.orgFilters.findIndex(
        (x) => x.fieldName == 'BusinessLineID'
      );
      if (idxBusinesLineOg != -1) {
        this.orgFilter = this.view.orgFilters[idxBusinesLineOg];
        this.view.orgFilters.splice(idxBusinesLineOg, 1);
      }

      let idxBusinesLine = this.view.orgPinned.findIndex(
        (x) => x.fieldName == 'BusinessLineID'
      );
      if (idxBusinesLine != -1) {
        this.orgPin = this.view.orgPinned[idxBusinesLine];
        this.view.orgPinned.splice(idxBusinesLine, 1);
      }

      let idxBusinesLineItem = this.view.pinnedItems.findIndex(
        (x) => x.fieldName == 'BusinessLineID'
      );
      if (idxBusinesLineItem != -1) {
        this.pinnedItem = this.view.pinnedItems[idxBusinesLineItem];
        this.view.pinnedItems.splice(idxBusinesLineItem, 1);
      }
    } else {
      ///add fileter
      let idxBusinesLineOp = this.view.filterOptions.findIndex(
        (x) => x.fieldName == 'BusinessLineID'
      );
      if (idxBusinesLineOp == -1 && this.fiterOption) {
        this.view.filterOptions.unshift(this.fiterOption);
        this.fiterOption = null;
      }

      let idxBusinesLineOg = this.view.orgFilters.findIndex(
        (x) => x.fieldName == 'BusinessLineID'
      );
      if (idxBusinesLineOg == -1 && this.orgFilter) {
        this.view.orgFilters.unshift(this.orgFilter);
        this.orgFilter = null;
      }

      let idxBusinesLine = this.view.orgPinned.findIndex(
        (x) => x.fieldName == 'BusinessLineID'
      );
      if (idxBusinesLine == -1 && this.orgPin) {
        this.view.orgPinned.unshift(this.orgPin);
        this.orgPin = null;
      }

      let idxBusinesLineItem = this.view.pinnedItems.findIndex(
        (x) => x.fieldName == 'BusinessLineID'
      );
      if (idxBusinesLineItem == -1 && this.pinnedItem) {
        this.view.pinnedItems.unshift(this.pinnedItem);
        this.pinnedItem = null;
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  async seclectFilter(datas) {
    if (datas && datas?.length > 0) {
      var filter = datas.filter((x) => x.field == 'BusinessLineID')[0];
      if (filter) {
        this.processIDKanban = await firstValueFrom(
          this.codxCmService.getProcessByBusinessLineID(filter?.value)
        );
        if (!this.processIDKanban) this.processIDKanban = this.processIDDefault;
      } else this.processIDKanban = this.processIDDefault;
    }
    // load kanban
    if (this.viewCrr == 6 && this.processIDKanban != this.crrProcessID) {
      this.crrProcessID == this.processIDKanban;
      this.dataObj = { processID: this.processIDKanban };
      this.view.views.forEach((x) => {
        if (x.type == 6) {
          x.request.dataObj = this.dataObj;
          x.request2.dataObj = this.dataObj;
        }
      });
      this.loadKanban();
    } else this.refeshDealValue();
  }

  loadKanban() {
    if (!this.kanban) this.kanban = (this.view?.currentView as any)?.kanban;
    let kanban = (this.view?.currentView as any)?.kanban;
    let settingKanban = kanban.kanbanSetting;
    settingKanban.isChangeColumn = true;
    settingKanban.formName = this.view?.formModel?.formName;
    settingKanban.gridViewName = this.view?.formModel?.gridViewName;
    this.api
      .exec<any>('DP', 'ProcessesBusiness', 'GetColumnsKanbanAsync', [
        settingKanban,
        this.dataObj,
      ])
      .subscribe((resource) => {
        if (resource?.columns && resource?.columns.length)
          kanban.columns = resource.columns;
        kanban.kanbanSetting.isChangeColumn = false;
        kanban.dataObj = this.dataObj;
        kanban.loadDataSource(
          kanban.columns,
          kanban.kanbanSetting?.swimlaneSettings,
          false
        );
        this.loadFirst = true;
        kanban.refresh();
        this.kanban = kanban;
        this.detectorRef.detectChanges();
      });
  }

  loadDefaultSetting() {
    this.funcID = this.activedRouter.snapshot.params['funcID'];

    this.processID = this.activedRouter.snapshot?.queryParams['processID'];
    if (this.processID) this.processIDKanban = this.processID;

    this.dataObj = { processID: this.processIDKanban };

    this.crrProcessID = this.processIDKanban;

    this.cache.viewSettings(this.funcID).subscribe((views) => {
      if (views) {
        this.afterLoad();
        this.views = [];
        let idxActive = -1;
        let viewOut = false;
        this.viewsDefault.forEach((v, index) => {
          let idx = views.findIndex((x) => x.view == v.type);
          if (idx != -1) {
            v.hide = false;
            if (v.type != this.viewCrr) v.active = false;
            else v.active = true;
            if (views[idx].isDefault) idxActive = index;
          } else {
            v.hide = true;
            v.active = false;
            if (this.viewCrr == v.type) viewOut = true;
          }
          if (v.type == 6) {
            v.request.dataObj = this.dataObj;
            v.request2.dataObj = this.dataObj;
          }
          //  if (!(this.funcID == 'CM0201' && v.type == '6'))
          this.views.push(v);
          //  else viewOut = true;
        });

        if (!this.views.some((x) => x.active)) {
          if (idxActive != -1) this.views[idxActive].active = true;
          else this.views[0].active = true;

          let viewModel =
            idxActive != -1 ? this.views[idxActive] : this.views[0];
          this.view.viewActiveType = viewModel.type;
          this.view.viewChange(viewModel);
          if (viewOut) this.view.load();
        }
        //this.view.views = this.views;
        if ((this.view?.currentView as any)?.kanban) this.loadKanban();
      }
    });
  }
  //end

  //#region xác nhận/ từ chối
  confirmOrRefuse(check, data) {
    if (check) {
      var config = new AlertConfirmInputConfig();
      config.type = 'YesNo';
      this.notificationsService
        .alertCode(
          'CM007',
          null,
          this.titleAction?.toLocaleLowerCase(),
          "'" + data?.dealName + "'"
        )
        .subscribe(async (x) => {
          if (x?.event?.status == 'Y') {
            const ins = await firstValueFrom(
              this.api.execSv<any>(
                'DP',
                'ERM.Business.DP',
                'InstancesBusiness',
                'GetAsync',
                [data.refID]
              )
            );
            if (ins?.status == '1' || ins?.status == '0') {
              this.startDeal(data);
            } else {
              let datas = [data.recID, ins?.endDate];
              this.codxCmService.startDeal(datas).subscribe((res) => {
                if (res) {
                  this.dataSelected = res;
                  this.dataSelected = JSON.parse(
                    JSON.stringify(this.dataSelected)
                  );
                  this.view.dataService
                    .update(this.dataSelected, true)
                    .subscribe();
                  if (this.kanban) this.kanban.updateCard(this.dataSelected);
                  if (this.detailViewDeal)
                    // this.detailViewDeal.reloadListStep(resDP[1]);
                    this.notificationsService.notifyCode('SYS007');
                }
                this.detectorRef.detectChanges();
              });
            }
          } else {
            this.codxCmService
              .confirmOrRefuse(data?.recID, check, '')
              .subscribe((res) => {
                if (res) {
                  this.dataSelected.status = '1';
                  this.dataSelected.nodifiedBy = new Date();

                  this.view.dataService
                    .update(this.dataSelected, true)
                    .subscribe();
                  this.notificationsService.notifyCode('SYS007');
                  if (this.detailViewDeal)
                    this.detailViewDeal.dataSelected = JSON.parse(
                      JSON.stringify(this.dataSelected)
                    );
                  this.detectorRef.detectChanges();
                }
              });
          }
        });
    } else {
      this.returnedCmt = '';
      this.popupConfirm = this.callfc.openForm(
        this.confirmOrRefuseTemp,
        '',
        500,
        280
      );
    }
  }

  valueChangeConfirm(e) {
    this.returnedCmt = e?.data?.trim();
  }

  saveConfirm() {
    var data = this.dataSelected;
    this.codxCmService
      .confirmOrRefuse(this.dataSelected?.recID, false, this.returnedCmt)
      .subscribe((res) => {
        if (res) {
          this.view.dataService.remove(this.dataSelected).subscribe();
          this.dataSelected = this.view.dataService.data[0];
          this.popupConfirm.close();
          this.notificationsService.notifyCode('CM022');
          this.view.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
          this.detectorRef.detectChanges();
        }
      });
  }
  //#endregion

  //#region temp Gird
  changeDataMFGird(e, data) {
    this.changeDataMF(e, data, 11);
  }
  //#endregion

  getColumsGrid(grvSetup) {
    this.columnGrids = [];
    if (this.arrFieldIsVisible?.length > 0) {
      this.arrFieldIsVisible.forEach((key) => {
        let field = Util.camelize(key);
        let template: any;
        let colums: any;
        if (grvSetup[key].isTemplate != '0') {
          switch (key) {
            case 'StepID':
            case 'ProjectView': // thông tin dự án
              template = this.templateSteps;
              break;
            case 'DealCost':
            case 'DealCostView': //chi phí
              template = this.templateCost;
              break;
            case 'GrossProfit':
            case 'GrossProfitView': //lãi gộp
              template = this.templateGrossProfit;
              break;
            case 'Status':
            case 'StatusCodeIDView': //hiện trạng
            // template = this.templateStatus;
            // break;
            case 'StatusCodeID': //hiện trạng
            case 'StatusCodeIDView':
              template = this.templateStatus;
              break;
            default:
              break;
          }
        }

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
    }
    // //set activite - ko cần nữa
    // let columnActiviti = {
    //   isExternal: true,
    //   headerTemplate: this.headerTempAct,
    //   width: '250px',
    //   template: this.templateAct,
    //   // textAlign: 'center',
    // };
    // this.columnGrids.push(columnActiviti);

    //sau
    //this.loadViewModel();
  }

  autoStart(event) {
    if (event) {
      this.startDeal(this.dataSelected);
    }
  }

  //export theo moreFun
  exportFiles(e, data) {
    let customData: any;
    if (data?.refID) {
      this.codxCmService.getDatasExport(data?.refID).subscribe((dts) => {
        if (dts) {
          customData = {
            refID: data.processID,
            refType: 'DP_Processes',
            dataSource: dts,
          };
        } else {
          customData = {
            refID: data.processID,
            refType: 'DP_Processes',
            dataSource: '',
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
      customData = {
        refID: data.recID,
        refType: this.view.entityName,
        dataSource: '',
      };
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

  loadParam() {
    //approver
    this.codxCmService.getParam('CMParameters', '4').subscribe((res) => {
      if (res) {
        let dataValue = JSON.parse(res.dataValue);
        if (Array.isArray(dataValue)) {
          let setting = dataValue.find((x) => x.Category == 'CM_Contracts');
          if (setting) this.applyApprover = setting['ApprovalRule'];
        }
      }
    });

    //tien te
    this.codxCmService.getParam('CMParameters', '1').subscribe((dataParam1) => {
      if (dataParam1) {
        let paramDefault = JSON.parse(dataParam1.dataValue);
        this.currencyIDDefault = paramDefault['DefaultCurrency'] ?? 'VND';
        this.dealConfirm = paramDefault['DealConfirm'] ?? '1';
        this.gridDetailView = paramDefault?.GridDetailView || '2';
        this.exchangeRateDefault = 1; //cai nay chua hop ly neu exchangeRateDefault nos tinh ti le theo dong tien khac thi sao ba
        if (this.currencyIDDefault != 'VND') {
          let day = new Date();
          this.codxCmService
            .getExchangeRate(this.currencyIDDefault, day)
            .subscribe((res) => {
              if (res) this.exchangeRateDefault = res?.exchRate;
              else {
                this.currencyIDDefault = 'VND';
                this.exchangeRateDefault = 1;
              }
            });
        }
      }
    });
  }

  //#region Permissons
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
      title: this.titleAction,
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
  //#endregion

  formatTitleMore(titleAction) {
    return (
      titleAction +
      ' ' +
      this.funcIDCrr.customName.charAt(0).toLocaleLowerCase() +
      this.funcIDCrr.customName.slice(1)
    );
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
      title: this.titleAction,
      recID: this.dataSelected.recID,
      gridViewSetup: this.gridViewSetup,
      category: this.applyFor,
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
          this.notificationsService.notifyCode(
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
                  this.startNow(this.dataSelected);
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
            }
          }
        } else {
          this.dataSelected.statusCodeID = this.statusCodeID;
          this.dataSelected.statusCodeCmt = this.statusCodeCmt;
          this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
          this.view.dataService.dataSelected = this.dataSelected;
          this.view.dataService.update(this.dataSelected, true).subscribe();
          this.detectorRef.detectChanges();
          this.notificationsService.notifyCode('SYS007');
        }
      }
    });
  }

  exportTemplet(e, data) {
    this.codxCmService
      .getDataSource(data.recID, 'DealsBusiness')
      .then((dataSource) => {
        if (dataSource) {
          var customData = {
            refID: data.processID,
            refType: 'DP_Processes',
            dataSource: dataSource,
          };
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

  getTotalDealValue(e) {
    let keyField = e.key;
    let total = e.total;
    if (this.kanban && this.kanban.columns?.length > 0) {
      let idx = this.kanban.columns.findIndex((x) => x.keyField == keyField);
      if (idx != -1 && this.kanban.columns[idx].totalDealValue != total) {
        this.kanban.columns[idx].totalDealValue = total;
      }
      if (idx == this.kanban.columns?.length - 1) {
        this.loadFirst = false;
      }
    }
  }
  loadedColumns(e) {
    // this.loadFirst = e;
  }

  refeshDealValue() {
    this.kanban.columns.forEach((x) => (x.totalDealValue = 0));
    this.loadFirst = true;
  }

  //---------Tính tổng grid view-------------//
  requestEnded(e) {
    if (e.type == 'read') {
      // this.totalGirdView();
    }
  }
  totalGirdView() {
    // Nó có tiền tệ khác nhau nên phải tính
    //   //không the format truyền qua
    //   // let intl = new Internationalization();
    //   // let nFormatter = intl.getNumberFormat({
    //   //   skeleton: 'n6',
    //   // });

    //chưa dùng đến nhưng chắc chắn có dùng - đã dùng
    if (this.listKeyFieldSum?.length > 0) {
      //caái này xử lý tempView
      let viewSum = JSON.parse(JSON.stringify(this.listKeyFieldSum));

      let idxDealCostView = viewSum.findIndex((f) => f == 'DealCostView');
      if (idxDealCostView != -1) {
        viewSum.splice(idxDealCostView, 1);
        viewSum.push('DealCost');
      }

      let idxGrossProfitView = viewSum.findIndex((f) => f == 'GrossProfitView');
      if (idxGrossProfitView != -1) {
        viewSum.splice(idxGrossProfitView, 1), viewSum.push('GrossProfit');
      }

      let fieldSum = [...new Set(viewSum)].join(';'); //lay các giá trị ko trung nhau

      this.getTotalFiels(fieldSum).subscribe((totals) => {
        if (totals) {
          // let objectDealValue = {};
          this.listKeyFieldSum.forEach((f) => {
            let fieldName = Util.camelize(f);
            let fv = f;
            if (fieldName == 'dealCostView') fv = 'DealCost';
            if (fieldName == 'grossProfitView') fv = 'GrossProfit';

            this.objectSumValue[fieldName] = totals[fv] ?? 0;
          });
          this.view.currentView.sumData = this.objectSumValue;
        }
      });
    }
  }

  getTotal() {
    let service = 'CM';
    let className = 'DealsBusiness'; //gan tam
    let method = 'GetTotalDealValueAsync'; //gan tam
    let gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.pageLoading = false;
    gridModel.onlySetPermit = false; //goi qua phan quyền pes
    gridModel.filter = this.view.dataService.filter;

    return this.api
      .execSv<any>(service, service, className, method, [
        gridModel,
        this.exchangeRateDefault,
      ])
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response;
        })
      );
  }

  ///Cái này dùng nhiều Field => làm trước
  getTotalFiels(listKey) {
    let service = 'CM';
    let className = 'DealsBusiness'; //gan tam
    let method = 'GetTotalFieldsAsync'; //gan tam

    let dataObj = {
      listKey: listKey, //'DealValue;DealValueTo;DealCost;GrossProfit', //tesst
      exchRate: this.exchangeRateDefault,
    };

    let gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.pageLoading = false;
    gridModel.onlySetPermit = false; //goi qua phan quyền pes
    gridModel.filter = this.view.dataService.filter;
    gridModel.dataObj = JSON.stringify(dataObj);
    return this.api
      .execSv<any>(service, service, className, method, [gridModel])
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response;
        })
      );
  }
  //---------------End----------------------//

  //#region editCus
  editCustomer(event) {
    if (event && event?.data) {
      this.dataSelected = event?.data;
      this.popupCustomer(event?.data);
    }
  }

  popupCustomer(data, isView = false) {
    this.codxCmService
      .getOneObject(data?.customerID, 'CustomersBusiness')
      .subscribe((ele) => {
        if (ele) {
          let tempData = JSON.parse(JSON.stringify(ele));
          var dataService = new CRUDService(this.inject);
          let formModel = new FormModel();
          formModel.formName =
            tempData?.category == '1' ? 'CMCustomers' : 'CMPersonalCustomers';
          formModel.gridViewName =
            tempData?.category == '1'
              ? 'grvCMCustomers'
              : 'grvCMPersonalCustomers';
          formModel.entityName = 'CM_Customers';
          formModel.funcID = tempData?.category == '1' ? 'CM0101' : 'CM0105';
          formModel.userPermission = this.view?.formModel?.userPermission;
          let request = new DataRequest(
            formModel.formName,
            formModel?.gridViewName,
            formModel?.entityName
          );
          request.funcID = formModel?.funcID;
          dataService.service = 'CM';
          dataService.request = request;
          dataService.dataSelected = tempData;
          dataService.updateDatas.set(tempData.recID, tempData);
          let option = new SidebarModel();
          option.FormModel = formModel;
          option.Width = '800px';
          option.zIndex = 1001;
          this.cache
            .gridViewSetup(formModel.formName, formModel.gridViewName)
            .subscribe((grid) => {
              let dialogAdd = this.callfc.openSide(
                CodxFormDynamicComponent,
                {
                  formModel: option.FormModel,
                  data: tempData,
                  dataService: dataService,
                  titleMore: this.moreEdit,
                  isAddMode: false,
                  isView: isView,
                },
                option
              );
              dialogAdd.closed.subscribe((e) => {
                if (e && e?.event && e?.event?.update) {
                  const dataCus = e?.event?.update?.data;
                  this.dataSelected.customerName = dataCus?.customerName;
                  this.dataSelected.industries = dataCus?.industries;
                  this.dataSelected.shortName = dataCus?.shortName;
                  if (this.detailViewDeal) {
                    this.detailViewDeal.dataSelected = JSON.parse(
                      JSON.stringify(this.dataSelected)
                    );
                  }

                  this.view.dataService
                    .update(this.dataSelected, true)
                    .subscribe();
                  this.detectorRef.detectChanges();
                }
              });
            });
        }
      });
  }
  //#endregion
  async addTask(data) {
    let taskOutput = await this.stepService.addTaskCM(data, 'CM_Deals');
    this.taskAdd = taskOutput;
  }
  searchChanged(e) {
    this.view.dataService.search(e);
    this.detectorRef.detectChanges();
  }

  //-------------GIRD NEW----------------//
  viewDetailsCost(data) {
    this.codxCmService.getCostItemsByTransID(data.recID).subscribe((res) => {
      if (res) {
        let options = new DialogModel();
        let obj = {
          title: this.gridViewSetup?.DealCost?.headerText,
          listCosts: res,
          transID: data.recID,
          dealValueTo: data.dealValueTo,
        };
        let dialogCost = this.callfc.openForm(
          PopupCostItemsComponent,
          '',
          600,
          700,
          '',
          obj,
          null,
          options
        );
        dialogCost.closed.subscribe((e) => {
          if (e && e.event) {
            let dataOld = JSON.parse(JSON.stringify(data));
            if (e.event?.isUpDealCost) {
              let dealCost = e.event.dealCost;
              data.dealCost = dealCost;
            }
            if (e.event?.isUpDealValueTo) {
              let dealValueTo = e.event.dealValueTo;
              data.dealValueTo = dealValueTo;
            }
            let grossProfit = data.dealValueTo - data.dealCost;
            data.grossProfit = grossProfit;

            this.view.dataService.update(data, true).subscribe();

            if (this.listKeyFieldSum?.length > 0) this.totalGirdView(); //tính lại tổng chajy cuxng nhanh
          }
        });
      }
    });
  }

  //render chứ ko call api  lại (Chua test nen chua gang)
  renderSum(dataOld, dataNew) {
    if (!this.listKeyFieldSum || this.listKeyFieldSum?.length == 0) return;
    let exchangeRate = dataOld?.exchangeRate ?? dataNew?.exchangeRate;
    if (!exchangeRate) exchangeRate = 1;
    if (dataOld?.dealCost != dataNew?.dealCost) {
      this.objectSumValue['dealCost'] =
        this.objectSumValue['dealCost'] ??
        0 + (dataNew?.dealCost ?? 0 - dataOld?.dealCost ?? 0) * exchangeRate;
      this.objectSumValue['dealCostView'] =
        this.objectSumValue['dealCostView'] ??
        0 + (dataNew?.dealCost ?? 0 - dataOld?.dealCost ?? 0) * exchangeRate;
    }
    if (dataOld?.grossProfit != dataNew?.grossProfit) {
      this.objectSumValue['grossProfit'] =
        this.objectSumValue['grossProfit'] ??
        0 +
        (dataNew?.grossProfit ?? 0 - dataOld?.grossProfit ?? 0) *
        exchangeRate;
      this.objectSumValue['grossProfitView'] =
        this.objectSumValue['grossProfitView'] ??
        0 +
        (dataNew?.grossProfit ?? 0 - dataOld?.grossProfit ?? 0) *
        exchangeRate;
    }
    this.view.currentView.sumData = this.objectSumValue;
  }
  //--------------------------------------//
  handelMoveStage(event, contract) {
    if (event) {
      this.moveStage(contract);
    }
  }

  /** in trường tùy chỉnh => more gọi vào
  * @param data
  * @param reportID
  * @param reportType
  */
  printDataSource(data: any, reportID: any, reportType: string = 'V') {
    let params = {
      Recs: data?.recID,
    };
    this.codxShareService.printReport(
      reportID,
      reportType,
      params,
      this.view?.formModel
    );
  }
}
