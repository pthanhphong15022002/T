import { comment } from './../../../../codx-share/src/lib/components/pdf/model/tmpSignArea.model';
import { async } from '@angular/core/testing';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
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
  CRUDService,
  Util,
  AlertConfirmInputConfig,
  DialogRef,
  AuthStore,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { PopupAddDealComponent } from './popup-add-deal/popup-add-deal.component';
import { CM_Customers } from '../models/cm_model';
import { PopupMoveStageComponent } from 'projects/codx-dp/src/lib/instances/popup-move-stage/popup-move-stage.component';
import { DealDetailComponent } from './deal-detail/deal-detail.component';
import { PopupSelectTempletComponent } from 'projects/codx-dp/src/lib/instances/popup-select-templet/popup-select-templet.component';
import { PopupMoveReasonComponent } from 'projects/codx-dp/src/lib/instances/popup-move-reason/popup-move-reason.component';
import { AnyNsRecord } from 'dns';
import { PopupEditOwnerstepComponent } from 'projects/codx-dp/src/lib/instances/popup-edit-ownerstep/popup-edit-ownerstep.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { firstValueFrom } from 'rxjs';
import { PopupOwnerDealComponent } from './popup-owner-deal/popup-owner-deal.component';
import { PopupBantDealComponent } from './popup-bant-deal/popup-bant-deal.component';
import { PopupPermissionsComponent } from '../popup-permissions/popup-permissions.component';
import { PopupAssginDealComponent } from './popup-assgin-deal/popup-assgin-deal.component';

@Component({
  selector: 'lib-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss'],
})
export class DealsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
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
  @ViewChild('dashBoard') dashBoard!: TemplateRef<any>;

  popupConfirm: DialogRef;

  @ViewChild('popUpQuestionStatus', { static: true }) popUpQuestionStatus;
  dialogQuestionForm: DialogRef;

  // extension core
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;

  // type any for view detail
  @Input() funcID: any;
  @Input() dataObj?: any;
  kanban: any;

  // config api get data
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Deals';
  className = 'DealsBusiness';
  method = 'GetListDealsAsync';
  idField = 'recID';

  // data structure
  listCustomer: CM_Customers[] = [];

  // type of string
  customerName: string = '';
  oldIdDeal: string = '';

  @Input() showButtonAdd = false;

  columnGrids = [];
  // showButtonAdd = false;
  button?: ButtonModel;
  dataSelected: any;
  //region Method
  //endregion

  titleAction = '';
  vllPriority = 'TM005';
  vllApprove = '';
  vllStatus = '';
  crrFuncID = '';
  nameModule: string = '';
  currencyIDDefault: any = 'VND';
  exchangeRateDefault: any = 1;
  viewMode = 2;
  // const set value
  readonly btnAdd: string = 'btnAdd';
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
  processIDKanban: string;
  processIDDefault: string;
  funcIDCrr: any;
  user: any;
  crrProcessID = '';
  returnedCmt = '';
  dataColums: any = [];
  listHeader: any = [];
  listSteps: any[] = [];
  arrFieldIsVisible: any[];

  valueListStatusCode: any; // status code ID
  statusDefault: string = '';

  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private authStore: AuthStore
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.loadParam();
    this.cache.functionList(this.funcID).subscribe((f) => {
      this.funcIDCrr = f;
      this.functionModule = f.module;
      this.nameModule = f.customName;
      this.executeApiCallFunctionID(f.formName, f.gridViewName);
    });
    this.getColorReason();

    this.processID = this.activedRouter.snapshot?.queryParams['processID'];
    if (this.processID) this.dataObj = { processID: this.processID };

    this.codxCmService.getProcessDefault('1').subscribe((res) => {
      if (res) {
        this.processIDDefault = res.recID;
        this.processIDKanban = res.recID;
      }
    });
  }

  onInit(): void {
    this.afterLoad();
    this.button = {
      id: this.btnAdd,
    };
  }

  ngAfterViewInit(): void {}

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
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateMore,
          resources: this.columnGrids,
          // frozenColumns: 1,
        },
      },
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
    ];

    this.views = this.viewsDefault;
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

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'DP';
    this.resourceKanban.assemblyName = 'DP';
    this.resourceKanban.className = 'ProcessesBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.dataObj;
  }

  changeView(e) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.viewCrr = e?.view?.type;
    //xu ly view fitter
    this.changeFilter();
    if (this.viewCrr == 6) {
      this.kanban = (this.view?.currentView as any)?.kanban;
    }

    this.processID = this.activedRouter.snapshot?.queryParams['processID'];
    if (this.processID) this.dataObj = { processID: this.processID };
    else if (this.processIDKanban)
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
  changeDataMF($event, data, type = null) {
    if ($event != null && data != null) {
      for (let eventItem of $event) {
        if (type == 11) {
          eventItem.isbookmark = false;
        }

        const functionID = eventItem.functionID;
        const mappingFunction = this.getRoleMoreFunction(functionID);
        mappingFunction && mappingFunction(eventItem, data);
      }
    }
  }
  getRoleMoreFunction(type) {
    let functionMappings;
    let isDisabled = (eventItem, data) => {
      eventItem.disabled =
        data?.alloweStatus == '1'
          ? (data.closed && data.status != '1') ||
            ['1', '0'].includes(data.status) ||
            this.checkMoreReason(data)
          : true;
    };
    let isDelete = (eventItem, data) => {
      eventItem.disabled = data.delete
        ? data.closed || this.checkMoreReason(data) || data.status == '0'
        : true;
    };
    let isCopy = (eventItem, data) => {
      eventItem.disabled = data.write
        ? data.closed || this.checkMoreReason(data) || data.status == '0'
        : true;
    };
    let isEdit = (eventItem, data) => {
      eventItem.disabled = data.write
        ? data.closed || this.checkMoreReason(data) || data.status == '0'
        : true;
    };
    let isClosed = (eventItem, data) => {
      eventItem.disabled =
        data?.alloweStatus == '1' ? data.closed || data.status == '0' : true;
    };
    let isOpened = (eventItem, data) => {
      eventItem.disabled =
        data?.alloweStatus == '1' ? !data.closed || data.status == '0' : true;
    };
    let isStartDay = (eventItem, data) => {
      eventItem.disabled =
        data?.alloweStatus == '1'
          ? !['1'].includes(data.status) || data.closed
          : true;
    };
    let isOwner = (eventItem, data) => {
      eventItem.disabled = data.full
        ? !['1', '2'].includes(data.status) || data.closed
        : true;
    };
    let isConfirmOrRefuse = (eventItem, data) => {
      //Xác nhận từ chối
      eventItem.disabled = data.full ? data.status != '0' : true;
    };
    let isApprovalTrans = (eventItem, data) => {
      eventItem.disabled =
        (data.closed && data.status != '1') ||
        data.status == '0' ||
        (data.processID && data?.approveRule != '1') ||
        data?.approveStatus >= '3';
    };
    let isUpdateBANT = (eventItem, data) => {
      eventItem.disabled = data.write
        ? (data.closed && data.status != '1') ||
          data.status == '0' ||
          this.checkMoreReason(data)
        : true;
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
    let isUpload = (eventItem, data) => {
      // ĐÍnh kèm file, nhập khẩu dữ liệu
      eventItem.disabled = !data.upload ? true : false;
    };
    let isEmail = (eventItem, data) => {
      // Gửi mail
      eventItem.disabled = !data.write ? true : false;
    };
    let isDownload = (eventItem, data) => {
      // Nhập khẩu dữ liệu
      eventItem.disabled = !data.download ? true : false;
    };

    let isDisCRd = (eventItem, data) => {
      // Nhập khẩu dữ liệu
      eventItem.disabled = true;
    };
    let isChangeStatus = (eventItem, data) => {
      eventItem.disabled = data.status != '2';
    };
    functionMappings = {
      ...['CM0201_1', 'CM0201_3', 'CM0201_4', 'CM0201_5'].reduce(
        (acc, code) => ({ ...acc, [code]: isDisabled }),
        {}
      ),
      ...['CM0201_12', 'CM0201_13'].reduce(
        (acc, code) => ({ ...acc, [code]: isConfirmOrRefuse }),
        {}
      ),
      ...['SYS101', 'SYS103', 'SYS104', 'SYS102'].reduce(
        (acc, code) => ({ ...acc, [code]: isDisCRd }),
        {}
      ),
      ...['SYS003', 'SYS001'].reduce(
        (acc, code) => ({ ...acc, [code]: isDisCRd }),
        {}
      ),
      CM0201_2: isStartDay, // bắt đầu
      CM0201_6: isApprovalTrans, //xet duyet
      CM0201_7: isOwner,
      CM0201_8: isClosed,
      CM0201_9: isOpened,
      SYS03: isEdit,
      SYS04: isCopy,
      SYS02: isDelete,
      CM0201_14: isUpdateBANT,
      CM0201_16: isRejectApprover,
      CM0201_15: isPermission,
      CM0201_17: isChangeStatus,
      SYS004: isEmail,
      SYS002: isDownload,
      SYS003: isUpload,
      SYS001: isUpload,
    };

    return functionMappings[type];
  }

  executeApiCallFunctionID(formName, gridViewName) {
    this.getGridViewSetup(formName, gridViewName);
    this.getMoreFunction(formName, gridViewName);
  }
  async getValuelistStatusCode() {
    this.cache.valueList('CRM041').subscribe((func) => {
      if (func) {
        this.valueListStatusCode = func.datas
          .filter((x) => ['2', '3', '5', '7'].includes(x.value))
          .map((item) => ({
            text: item.text,
            value: item.value,
          }));
      }
    });
  }

  getMoreFunction(formName, gridViewName) {
    this.cache.moreFunction(formName, gridViewName).subscribe((res) => {
      if (res && res.length > 0) {
        this.moreFuncInstance = res;
      }
    });
  }
  getGridViewSetup(formName, gridViewName) {
    this.cache.gridViewSetup(formName, gridViewName).subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
        this.vllStatus = this.gridViewSetup['Status'].referedValue;
        this.vllApprove = this.gridViewSetup['ApproveStatus'].referedValue;
        //lay grid view
        let arrField = Object.values(this.gridViewSetup).filter(
          (x: any) => x.isVisible
        );
        if (Array.isArray(arrField)) {
          this.arrFieldIsVisible = arrField
            .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
            .map((x: any) => x.fieldName);
          // this.getColumsGrid(this.gridViewSetup);
        }
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

  checkMoreReason(tmpPermission) {
    return (
      !tmpPermission?.roleMore?.isReasonSuccess &&
      !tmpPermission?.roleMore?.isReasonFail &&
      !tmpPermission?.roleMore?.isMoveStage
    );
  }
  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    const functionMapping = {
      SYS03: () => this.edit(data),
      SYS04: () => this.copy(data),
      SYS02: () => this.delete(data),
      CM0201_1: () => this.moveStage(data),
      CM0201_2: () => this.handelStartDay(data),
      CM0201_3: () => this.moveReason(data, true),
      CM0201_4: () => this.moveReason(data, false),
      CM0201_8: () => this.openOrCloseDeal(data, true),
      CM0201_7: () => this.popupOwnerRoles(data),
      CM0201_9: () => this.openOrCloseDeal(data, false),
      CM0201_5: () => this.exportFile(data),
      CM0201_6: () => this.approvalTrans(data),
      CM0201_12: () => this.confirmOrRefuse(true, data),
      CM0201_13: () => this.confirmOrRefuse(false, data),
      CM0201_14: () => this.openFormBANT(data),
      CM0201_16: () => this.cancelApprover(data),
      // SYS002: () => this.exportFiles(e, data),
      CM0201_15: () => this.popupPermissions(data),
      CM0201_17: () => this.openFormChangeStatus(data),
    };

    const executeFunction = functionMapping[e.functionID];
    if (executeFunction) {
      executeFunction();
    } else {
      let customData = {
        refID: data.recID,
        refType: 'CM_Deals',
      };

      if (data?.refID) {
        customData = {
          refID: data.processID,
          refType: 'DP_Processes',
        };
      }
      this.codxShareService.defaultMoreFunc(
        e,
        data,
        this.afterSave.bind(this),
        this.view.formModel,
        this.view.dataService,
        this,
        customData
      );
      this.detectorRef.detectChanges();
    }
  }
  afterSave(e?: any, that: any = null) {
    if (e) {
      let appoverStatus = e.unbounds.statusApproval;
      if (
        appoverStatus != null &&
        appoverStatus != this.dataSelected.approveStatus
      ) {
        this.dataSelected.approveStatus = appoverStatus;
      }
      this.view.dataService.update(this.dataSelected).subscribe();
    }
  }
  changeMF(e) {
    this.changeDataMF(e.e, e.data);
  }
  handelStartDay(data) {
    this.notificationsService
      .alertCode('DP033', null, ['"' + data?.dealName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.startDeal(data);
        }
      });
  }
  //

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
        if (this.viewCrr != 11) this.viewDetail(e.data);
        else if (e?.data?.rowData) this.viewDetail(e?.data?.rowData);
        break;
      //chang fiter
      case 'pined-filter':
        this.seclectFilter(e.data);
    }
  }

  dropDeals(data) {
    data.stepID = this.crrStepID;
    // if (!data.edit ? !data.edit: data.createdBy !== this.user.userID ) {
    //   this.notificationsService.notifyCode('SYS032');
    //   return;
    // }

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

  viewDetail(data) {
    this.dataSelected = data;
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 999;

    let popup = this.callfc.openForm(
      this.popDetail,
      '',
      Util.getViewPort().width,
      Util.getViewPort().height,
      '',
      null,
      '',
      option
    );
    popup.closed.subscribe((e) => {});
  }

  //end Kanaban

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
            nextStep: this.stepIdClick ? this.stepIdClick : data?.nextStep,
            // listStepCbx: this.lstStepInstances,
          };
          var obj = {
            stepName: data?.currentStepName,
            formModel: formMD,
            deal: data,
            stepReason: stepReason,
            headerTitle: this.titleAction,
            applyFor: '1',
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
              var instance = e.event.instance;
              var listSteps = e.event?.listStep;
              this.detailViewDeal.reloadListStep(listSteps);
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
              this.codxCmService.moveStageDeal(dataUpdate).subscribe((res) => {
                if (res) {
                  data = res[0];
                  this.view.dataService.update(data).subscribe();
                  this.detailViewDeal.dataSelected = data;
                  if (e.event.isReason != null) {
                    this.moveReason(data, e.event.isReason);
                  }
                  this.detectorRef.detectChanges();
                }
              });
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
    var datas = [data.recID, data.processID, check];
    this.notificationsService
      .alertCode('DP018', null, this.titleAction, "'" + data.dealName + "'")
      .subscribe((info) => {
        if (info.event.status == 'Y') {
          this.codxCmService.openOrClosedDeal(datas).subscribe((res) => {
            if (res) {
              this.dataSelected.closed = check;
              this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
              this.view.dataService.update(this.dataSelected).subscribe();
              this.notificationsService.notifyCode(
                check ? 'DP016' : 'DP017',
                0,
                "'" + data.dealName + "'"
              );
              if (data.showInstanceControl === '1') {
                this.view.dataService.update(this.dataSelected).subscribe();
              }
              if (
                data.showInstanceControl === '0' ||
                data.showInstanceControl === '2'
              ) {
                this.view.dataService.remove(this.dataSelected).subscribe();
                this.dataSelected = this.view.dataService.data[0];
                this.view.dataService.onAction.next({
                  type: 'delete',
                  data: data,
                });
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
        this.view.dataService.update(e.event).subscribe();
        this.detailViewDeal.dataSelected = JSON.parse(
          JSON.stringify(this.dataSelected)
        );
        this.detailViewDeal.getContactByDeaID(this.dataSelected.recID);
        this.changeDetectorRef.detectChanges();
      }
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
      nextStep: data?.nextStep,
    };
    var obj = {
      headerTitle: fun.defaultName,
      formModel: formMD,
      isReason: isMoveSuccess,
      applyFor: '1',
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
        var listSteps = e.event?.listStep;
        this.detailViewDeal.reloadListStep(listSteps);
        data = this.updateReasonDeal(e.event?.instance, data);
        var datas = [data, oldStepId, oldStatus, e.event?.comment];
        this.codxCmService.moveDealReason(datas).subscribe((res) => {
          if (res) {
            data = res[0];
            this.view.dataService.update(data).subscribe();
            //up kaban
            if (this.kanban) {
              let money = data.dealValue * data.exchangeRate;
              this.renderTotal(data.stepID, 'add', money);
              this.renderTotal(this.crrStepID, 'minus', money);
              this.kanban.refresh();
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
    this.codxCmService.startInstance([data.refID]).subscribe((resDP) => {
      if (resDP) {
        var datas = [data.recID, resDP[0]];
        this.codxCmService.startDeal(datas).subscribe((res) => {
          if (res) {
            this.dataSelected = res[0];
            this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
            this.detailViewDeal.reloadListStep(resDP[1]);
            this.notificationsService.notifyCode('SYS007');
            this.view.dataService.update(this.dataSelected).subscribe();
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
      gridViewSetup: this.gridViewSetup,
      formModel: this.view.formModel,
      applyFor: '1',
      titleAction: this.titleAction,
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
        this.detailViewDeal.promiseAllAsync();
        this.view.dataService.update(e?.event).subscribe();
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

  //#region Search
  searchChanged(e) {}
  //#endregion

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
      this.view.dataService.dataSelected.currencyID = this.currencyIDDefault;
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
    };
    let dialogCustomDeal = this.callfc.openSide(
      PopupAddDealComponent,
      obj,
      option
    );
    dialogCustomDeal.closed.subscribe((e) => {
      if (e && e.event != null) {
        this.view.dataService.update(e.event).subscribe();
        //up kaban
        if (this.kanban) {
          let dt = e.event;
          let money = dt.dealValue * dt.exchangeRate;
          this.renderTotal(dt.stepID, 'add', money);
          this.kanban.refresh();
        }
        //   this.detailViewDeal.promiseAllAsync();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    let dealValueOld = data.dealValue;
    let exchangeRateOld = data.exchangeRate;
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        option.zIndex = 1001;
        var formMD = new FormModel();

        var obj = {
          action: 'edit',
          formMD: formMD,
          titleAction: this.formatTitleMore(this.titleAction),
          gridViewSetup: this.gridViewSetup,
        };
        let dialogCustomDeal = this.callfc.openSide(
          PopupAddDealComponent,
          obj,
          option
        );
        dialogCustomDeal.closed.subscribe((e) => {
          if (e && e.event != null) {
            this.view.dataService.update(e.event).subscribe();
            //up kaban
            if (
              this.kanban &&
              (dealValueOld != e.event?.dealValue ||
                exchangeRateOld != e.event?.exchangeRate)
            ) {
              let dt = e.event;
              let money =
                dt.dealValue * dt.exchangeRate - dealValueOld * exchangeRateOld;
              this.renderTotal(dt.stepID, 'add', money);
              this.kanban.refresh();
            }

            this.detailViewDeal.dataSelected = JSON.parse(
              JSON.stringify(this.dataSelected)
            );
            this.detailViewDeal.promiseAllAsync();
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
                this.kanban.refresh();
              }
            }
          });
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeletedDealAsync';
    opt.data = [itemSelected.recID, null];
    return true;
  }
  //#endregion

  //#region event
  selectedChange(data) {
    if (data || data?.data) this.dataSelected = data?.data ? data?.data : data;
  }
  //#endregion

  autoMoveStage($event) {
    if ($event && $event != null) {
      this.detailViewDeal.promiseAllAsync();
      this.view.dataService.update($event).subscribe();
      this.detailViewDeal.dataSelected = JSON.parse(
        JSON.stringify(this.dataSelected)
      );
      this.changeDetectorRef.detectChanges();
    }
  }

  //xuất file
  exportFile(dt) {
    this.codxCmService.exportFile(dt, this.titleAction);
  }

  //------------------------- Ký duyệt  ----------------------------------------//
  approvalTrans(dt) {
    this.codxCmService.getProcess(dt.processID).subscribe((process) => {
      if (process) {
        this.codxCmService
          .getESCategoryByCategoryID(process.processNo)
          .subscribe((res) => {
            if (!res) {
              this.notificationsService.notifyCode('ES028');
              return;
            }
            if (res.eSign) {
              //kys soos
            } else {
              this.release(dt, res);
            }
          });
      } else {
        this.notificationsService.notifyCode('DP040');
      }
    });
  }

  release(data: any, category: any) {
    // new function release
    this.codxShareService.codxReleaseDynamic(
      this.view.service,
      data,
      category,
      this.view.formModel.entityName,
      this.view.formModel.funcID,
      data?.title,
      this.releaseCallback.bind(this)
    );
  }
  //call Back
  releaseCallback(res: any, t: any = null) {
    if (res?.msgCodeError) this.notificationsService.notify(res?.msgCodeError);
    else {
      this.codxCmService
        .getOneObject(this.dataSelected.recID, 'DealsBusiness')
        .subscribe((q) => {
          if (q) {
            this.dataSelected = q;
            this.view.dataService.update(this.dataSelected).subscribe();
            if (this.kanban) this.kanban.updateCard(this.dataSelected);
          }
          this.notificationsService.notifyCode('ES007');
        });
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
                          this.dataSelected.approveStatus = '0';
                          this.view.dataService
                            .update(this.dataSelected)
                            .subscribe();
                          if (this.kanban)
                            this.kanban.updateCard(this.dataSelected);
                          this.notificationsService.notifyCode('SYS007');
                        } else this.notificationsService.notifyCode('SYS021');
                      });
                  }
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
    //change view filter
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
      this.processIDKanban == this.crrProcessID;
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
        kanban.refresh();
        this.kanban = kanban;
        // if (this.kanban) this.kanban.refresh();
        this.detectorRef.detectChanges();
      });
  }

  onLoading(e) {
    if (!this.funCrr) {
      this.getColumsGrid(this.gridViewSetup);
      return;
    }

    //reload filter

    // if (this.funCrr != this.funcID) {
    //   this.view.pinedFilter.filters = [];
    //   this.view.dataService.filter.filters = [];
    // }
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.processID = this.activedRouter.snapshot?.queryParams['processID'];
    if (this.processID) this.dataObj = { processID: this.processID };
    else if (this.processIDKanban)
      this.dataObj = { processID: this.processIDKanban };
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
        .subscribe((x) => {
          if (x?.event?.status == 'Y') {
            this.startDeal(data);
          } else {
            this.codxCmService
              .confirmOrRefuse(data?.recID, check, '')
              .subscribe((res) => {
                if (res) {
                  this.dataSelected.status = '1';
                  this.dataSelected.nodifiedBy = new Date();
                  this.detailViewDeal.dataSelected = JSON.parse(
                    JSON.stringify(this.dataSelected)
                  );
                  this.view.dataService.update(this.dataSelected).subscribe();
                  this.notificationsService.notifyCode('SYS007');
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
        switch (key) {
          case 'CustomerID':
            template = this.templateCustomer;
            break;
          case 'BusinessLineID':
            template = this.templateBusinessLines;
            break;
          case 'DealValue':
            template = this.templateDealValue;
            break;
          case 'Status':
            template = this.templateStatus;
            break;
          case 'Owner':
            template = this.templateOwner;
            break;
          case 'StepID':
            template = this.templateSteps;
            break;
          case 'ConsultantID':
            template = this.templateConsultant;
            break;
          case 'ExpectedClosed':
            template = this.templateExpectedClosed;
            break;

          default:
            break;
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

    this.loadViewModel();
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
    // this.codxCmService.getParam('CMParameters', '4').subscribe((res) => {
    //   if (res) {
    //     let dataValue = JSON.parse(res.dataValue);
    //     if (Array.isArray(dataValue)) {
    //       let setting = dataValue.find((x) => x.Category == 'CM_Contracts');
    //       if (setting) this.applyApprover = setting['ApprovalRule'];
    //     }
    //   }
    // });

    //tien te
    this.codxCmService.getParam('CMParameters', '1').subscribe((dataParam1) => {
      if (dataParam1) {
        let paramDefault = JSON.parse(dataParam1.dataValue);
        this.currencyIDDefault = paramDefault['DefaultCurrency'] ?? 'VND';
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
          this.view.dataService.update(e?.event).subscribe();
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
  openFormChangeStatus(data) {
    this.dataSelected = data;
    this.statusDefault = data.status;
    this.dialogQuestionForm = this.callfc.openForm(
      this.popUpQuestionStatus,
      '',
      400,
      200
    );
  }
  valueChangeStatusCode($event) {
    if ($event) {
      this.statusDefault = $event.data;
    }
  }
  saveStatus() {
    if (this.dataSelected.status === this.statusDefault) {
      this.dialogQuestionForm.close();
      this.notificationsService.notifyCode('SYS007');
    } else {
      var datas = [this.dataSelected.recID, this.statusDefault];
      this.codxCmService.changeStatusDeal(datas).subscribe((res) => {
        if (res) {
          this.dialogQuestionForm.close();
          this.dataSelected.statusCodeID = this.statusDefault;
          this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
          this.view.dataService.dataSelected = this.dataSelected;
          this.view.dataService.update(this.dataSelected).subscribe();
          this.detectorRef.detectChanges();
          this.notificationsService.notifyCode('SYS007');
        }
      });
    }
  }
}
