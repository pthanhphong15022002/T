import { async } from '@angular/core/testing';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  UIComponent,
  ViewModel,
  ButtonModel,
  FormModel,
  ResourceModel,
  CacheService,
  NotificationsService,
  ViewType,
  SidebarModel,
  RequestOption,
  DialogModel,
  DataRequest,
  DialogRef,
  AuthStore,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { PopupAddDealComponent } from '../deals/popup-add-deal/popup-add-deal.component';
import { CM_Customers, CM_Leads, CM_Permissions } from '../models/cm_model';
import { PopupAddLeadComponent } from './popup-add-lead/popup-add-lead.component';
import { PopupConvertLeadComponent } from './popup-convert-lead/popup-convert-lead.component';
import { PopupMergeLeadsComponent } from './popup-merge-leads/popup-merge-leads.component';
import { PopupMoveStageComponent } from 'projects/codx-dp/src/lib/instances/popup-move-stage/popup-move-stage.component';
import { LeadDetailComponent } from './lead-detail/lead-detail.component';
import { PopupMoveReasonComponent } from 'projects/codx-dp/src/lib/instances/popup-move-reason/popup-move-reason.component';
import { PopupEditOwnerstepComponent } from 'projects/codx-dp/src/lib/instances/popup-edit-ownerstep/popup-edit-ownerstep.component';
import { PopupOwnerDealComponent } from '../deals/popup-owner-deal/popup-owner-deal.component';
import { PopupAssginDealComponent } from '../deals/popup-assgin-deal/popup-assgin-deal.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupPermissionsComponent } from '../popup-permissions/popup-permissions.component';
import { stringify } from 'querystring';
import { firstValueFrom } from 'rxjs';
import moment from 'moment';
import { PopupUpdateStatusComponent } from '../deals/popup-update-status/popup-update-status.component';
@Component({
  selector: 'lib-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LeadsComponent
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
  @ViewChild('templateViewDetail') tempViewLeadDetail: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('detailViewLead') detailViewLead: LeadDetailComponent;
  @ViewChild('popUpQuestionCopy', { static: true }) popUpQuestionCopy;
  dialogQuestionCopy: DialogRef;
  dialogViewLead: DialogRef;
  // extension core
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;

  // type any for view detail
  dataObj?: any;
  kanban: any;

  // config api get data
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Leads';
  className = 'LeadsBusiness';
  method = 'GetListLeadsAsync';
  idField = 'recID';
  predicate = '';
  dataValue = '';
  // data structure
  listCustomer: CM_Customers[] = [];
  listCategory: any[] = [];
  valueListStatusCode: any[] = [];
  // type of string
  oldIdDeal: string = '';

  @Input() showButtonAdd = false;

  columnGrids = [];
  // showButtonAdd = false;
  button?: ButtonModel;
  dataSelected: any;
  //region Method
  //endregion

  titleAction = '';
  vllApprove = 'DP043';
  vllStatus = 'DP041';
  vllPriority = 'TM005';
  crrFuncID = '';
  viewMode = 2;
  // const set value
  readonly btnAdd: string = 'btnAdd';
  request: ResourceModel;
  resourceKanban?: ResourceModel;

  listHeader: any;
  oldIdContact: string = '';
  oldIdLead: string = '';
  funcIDCrr: any;
  gridViewSetup: any;
  colorReasonSuccess: any;
  colorReasonFail: any;
  processId: any;
  dataDrop: any;
  stepIdClick: any;
  crrStepID: any;
  moreFuncInstance: any;
  dataColums: any;
  viewCrr: any;
  paramDefault: any;
  action: any;
  currencyIDDefault: any;
  statusDefault: any;
  user: any;
  valueListStatus: any;

  isLoading = false;
  hideMoreFC = false;
  applyProcess: boolean = true;
  gridDetailView = '2';

  readonly applyFor: any = '5';
  readonly fieldCbxStatus = { text: 'text', value: 'value' };
  readonly fieldCbxStatusCode = { text: 'text', value: 'value' };

  applyApprover = '0';
  queryParams: any;
  leverSetting = 0;
  viewActiveType = '';
  runMode: any;

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
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    }
    this.user = this.authStore.get();
    this.queryParams = this.router.snapshot.queryParams;
    if (this.queryParams?.recID) {
      this.predicate = 'RecID=@0';
      this.dataValue = this.queryParams?.recID;
      this.viewActiveType = '2';
    }
    this.executeApiCalls();
    this.loadParam();
  }

  onInit(): void {
    this.button = {
      id: this.btnAdd,
    };
  }

  async ngAfterViewInit() {
    this.loadViewModel();
    let param = await firstValueFrom(
      this.cache.viewSettingValues('CMParameters')
    );
    let lever = 0;
    if (param?.length > 0) {
      let dataParam = param.filter((x) => x.category == '1' && !x.transType)[0];
      let paramDefault = JSON.parse(dataParam.dataValue);
      lever = paramDefault['ControlInputAddress'] ?? 0;
    }
    this.leverSetting = lever;
    this.codxCmService.initCache().subscribe((res) => {});
  }

  afterLoad() {
    this.request = new ResourceModel();
    this.request.service = 'CM';
    this.request.assemblyName = 'CM';
    this.request.className = 'LeadsBusiness';
    this.request.method = 'GetListLeadsAsync';
    this.request.idField = 'recID';
    this.request.dataObj = this.dataObj;

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'DP';
    this.resourceKanban.assemblyName = 'DP';
    this.resourceKanban.className = 'ProcessesBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.dataObj;
  }

  executeApiCalls() {
    this.getFuncID(this.funcID);
    this.getColorReason();
    this.getValuelistStatus();
    this.getValuelistCategory();
    this.getProcessSetting();
    this.getListStatusCode();
    this.afterLoad();
  }
  getValuelistStatus() {
    this.cache.valueList('CRM041').subscribe((func) => {
      if (func) {
        this.valueListStatus = func.datas
          .filter((x) => ['2', '3', '5', '7'].includes(x.value))
          .map((item) => ({
            text: item.text,
            value: item.value,
          }));
      }
    });
  }
  getValuelistCategory() {
    this.cache.valueList('CRM058').subscribe((res) => {
      if (res) {
        this.listCategory = res.datas;
      }
    });
  }
  async getListStatusCode() {
    this.codxCmService.getListStatusCode(['3']).subscribe((res) => {
      if (res) {
        this.valueListStatusCode = res.map((item) => ({
          text: item.statusName,
          value: item.statusID,
        }));
      } else {
        this.valueListStatusCode = [];
      }
    });
  }
  async getProcessSetting() {
    this.codxCmService
      .getListProcessDefault([this.applyFor])
      .subscribe((res) => {
        if (res) {
          this.processId = res.recID;
          this.dataObj = { processID: res.recID };
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

  getGridViewSetup(formName, gridViewName) {
    this.cache.gridViewSetup(formName, gridViewName).subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
        this.vllStatus =
          this.gridViewSetup['Status'].referedValue ?? this.vllStatus;
        this.vllApprove =
          this.gridViewSetup['ApproveStatus'].referedValue ?? this.vllApprove;
      }
    });
  }
  getFuncID(funcID) {
    //bua tam
    // if (funcID == 'CM0504') funcID = 'CM0205';
    this.cache.functionList(funcID).subscribe((f) => {
      if (f) {
        this.funcIDCrr = f;
        this.runMode = f?.runMode;
        this.getGridViewSetup(
          this.funcIDCrr.formName,
          this.funcIDCrr.gridViewName
        );
        this.getMoreFunction(
          this.funcIDCrr.formName,
          this.funcIDCrr.gridViewName
        );
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

  onLoading(e) {
    // this.loadViewModel();
  }

  loadViewModel() {
    this.views = [
      {
        type: ViewType.listdetail,
        active: false,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      // {
      //   type: ViewType.kanban,
      //   active: false,
      //   sameData: false,
      //   request: this.request,
      //   request2: this.resourceKanban,
      //   // toolbarTemplate: this.footerButton,
      //   model: {
      //     template: this.cardKanban,
      //     template2: this.viewColumKaban,
      //     setColorHeader: true,
      //   },
      // },
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          // resources: this.columnGrids,
          template2: this.templateMore,
          // frozenColumns: 1,
        },
      },
    ];
  }

  changeView(e) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    if (this.crrFuncID != this.funcID) {
      this.crrFuncID = this.funcID;
      // this.cache.functionList(this.funcID).subscribe((f) => {
      //   if (f) {
      //     this.funcIDCrr = f;
      //     this.runMode = f?.runMode;
      //   }
      // });
    }
    this.viewCrr = e?.view?.type;
    if (this.viewCrr == 6) {
      this.kanban = (this.view?.currentView as any)?.kanban;
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
        if (type == 11) eventItem.isbookmark = false;
        eventItem.isblur = data.approveStatus == '3' && this.funcID == 'CM0205'; //CM0504 o bị isblur more
        const functionID = eventItem.functionID;
        const mappingFunction = this.getRoleMoreFunction(functionID);
        if (mappingFunction) {
          mappingFunction(eventItem, data);
        }
      }
    }
  }

  getRoleMoreFunction(type) {
    let functionMappings;
    let isDisabled = (eventItem, data) => {
      // Mặc định
      eventItem.disabled =
        data?.alloweStatus == '1'
          ? (data.closed && !['15', '1'].includes(data.status)) ||
            ['15', '1'].includes(data.status) ||
            this.checkMoreReason(data) ||
            !data.applyProcess
          : true;
    };
    let isCopy = (eventItem, data) => {
      // Thêm, xóa, copy
      eventItem.disabled = data.write
        ? data.closed ||
          (data.status != '13' && this.checkMoreReason(data)) ||
          (!this.checkApplyProcess(data) && ['3', '5'].includes(data.status))
        : true;
      // eventItem.disabled  = false;
    };
    let isEdit = (eventItem, data) => {
      // Chỉnh sửa
      eventItem.disabled = data.write
        ? data.closed ||
          (data.status != '13' && this.checkMoreReason(data)) ||
          (!this.checkApplyProcess(data) && ['3', '5'].includes(data.status))
        : true;
    };
    let isDelete = (eventItem, data) => {
      // Chỉnh sửa
      eventItem.disabled = data.delete
        ? data.closed ||
          (data.status != '13' && this.checkMoreReason(data)) ||
          (!this.checkApplyProcess(data) && ['3', '5'].includes(data.status))
        : true;
    };
    let isClosed = (eventItem, data) => {
      //Đóng tiềm năng
      eventItem.disabled =
        data?.alloweStatus == '1' || data?.read ? data.closed : true;
    };

    // let isClosed = (eventItem, data) => {
    //   eventItem.disabled =
    //     data?.alloweStatus == '1'
    //       ? data.closed
    //       : true;
    // };

    let isOpened = (eventItem, data) => {
      // Mở tiềm năng
      eventItem.disabled =
        data?.alloweStatus == '1' || data?.read ? !data.closed : true;
    };
    let isStartDay = (eventItem, data) => {
      // Bắt đầu ngay
      eventItem.disabled =
        data?.alloweStatus == '1'
          ? !['1'].includes(data.status) || data.closed || !data.applyProcess
          : true;
    };
    let isConvertLead = (eventItem, data) => {
      // Chuyển thành cơ hội
      eventItem.disabled = data.write
        ? !['13', '3', '2'].includes(data.status) || data.closed
        : true;
    };
    let isMergeLead = (eventItem, data) => {
      // Chuyển thành cơ hội
      eventItem.disabled = data.write
        ? !['15', '1'].includes(data.status) || data.closed
        : true;
    };

    let isOwner = (eventItem, data) => {
      // Phân bổ
      eventItem.disabled = data.full
        ? !['15', '1', '2'].includes(data.status) || data.closed
        : true;
    };
    let isFailReason = (eventItem, data) => {
      // Đánh dấu thất bại
      eventItem.disabled =
        data?.alloweStatus == '1'
          ? (data.closed && !['15', '1'].includes(data.status)) ||
            ['15', '1'].includes(data.status) ||
            (data.status != '13' && this.checkMoreReason(data)) ||
            !data.applyProcess
          : true;
    };
    let isStartFirst = (eventItem, data) => {
      // Làm lại khi tiềm năng đã thành công or thất bại
      eventItem.disabled = data.write
        ? (!['3', '5'].includes(data.status) && data.applyProcess) ||
          (!data.applyProcess && data.status != '5')
        : true;
    };
    let isChangeStatus = (eventItem, data) => {
      // Đổi trạng thái cho tiềm năng ko có quy trình
      eventItem.disabled = data?.alloweStatus == '1' ? data.closed : true;
    };

    let isUpdateProcess = (eventItem, data) => {
      // Đưa quy trình vào sử dụng với tiềm năng  có quy trình
      eventItem.disabled = data.full
        ? data.closed ||
          data.applyProcess ||
          this.checkMoreReason(data) ||
          (!this.checkApplyProcess(data) && ['3', '5'].includes(data.status))
        : true;
    };
    let isDeleteProcess = (eventItem, data) => {
      // Xóa quy trình đang sử dụng với tiềm năng ko có quy trình
      eventItem.disabled = data.full
        ? data.closed || !data.applyProcess || this.checkMoreReason(data)
        : true;
    };

    let isApprover = (eventItem, data) => {
      eventItem.disabled =
        (data.closed && data.status != '1') ||
        data.status == '15' ||
        (this.applyApprover != '1' && !data.applyProcess) ||
        (data.applyProcess && data?.approveRule != '1') ||
        data?.approveStatus >= '3';
      // || this.checkMoreReason(data);
    };
    let isPermission = (eventItem, data) => {
      // Phân quyền
      eventItem.disabled = !data.assign && !data.allowPermit ? true : false;
    };
    let isRejectApprover = (eventItem, data) => {
      // Gửi duyệt của a thảo
      eventItem.disabled =
        (data.closed && data.status != '1') ||
        data.status == '15' ||
        data.approveStatus != '3';
      eventItem.isblur = false;
    };

    let isDisabledDefault = (eventItem, data) => {
      eventItem.disabled = true;
    };
    functionMappings = {
      ...['SYS101', 'SYS102', 'SYS103', 'SYS104'].reduce(
        (fundID, more) => ({ ...fundID, [more]: isDisabledDefault }),
        {}
      ),
      ...['CM0205_3', 'CM0205_5', 'CM0205_7'].reduce(
        (fundID, more) => ({ ...fundID, [more]: isDisabled }),
        {}
      ),
      CM0205_1: isConvertLead, // convertLead
      CM0205_2: isMergeLead, // mergeLead
      CM0205_4: isStartDay, // startyDay
      CM0205_6: isFailReason, // fail
      CM0205_8: isApprover,
      CM0205_9: isOwner,
      CM0205_10: isClosed, // close lead
      CM0205_11: isOpened, // open lead
      SYS03: isEdit,
      SYS04: isCopy,
      SYS02: isDelete,
      CM0205_13: isStartFirst, // tiep tup van,
      CM0205_12: isChangeStatus,
      CM0205_14: isUpdateProcess, // co su dung quy trinh
      CM0205_15: isDeleteProcess, // khong su dung quy trinh
      CM0205_17: isRejectApprover,
      CM0205_16: isPermission, //Phân quyền
    };
    return functionMappings[type];
  }

  checkMoreReason(tmpPermission) {
    return (
      !tmpPermission.roleMore.isReasonSuccess &&
      !tmpPermission.roleMore.isReasonFail &&
      !tmpPermission.roleMore.isMoveStage
    );
  }

  onActions(e) {
    switch (e.type) {
      case 'drop':
        this.dataDrop = e.data;
        this.stepIdClick = JSON.parse(JSON.stringify(this.dataDrop.stepID));
        // xử lý data chuyển công đoạn
        if (this.crrStepID != this.dataDrop.stepID)
          this.dropLeads(this.dataDrop);

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
    }
  }

  dropLeads(data) {
    data.stepID = this.crrStepID;
    if (!data?.full) {
      this.notificationsService.notifyCode('SYS032');
      return;
    }
    if (data.closed) {
      this.notificationsService.notifyCode('DP039');
      return;
    }
    if (data.status == '1' || data.status == '15') {
      this.notificationsService.notifyCode(
        'DP038',
        0,
        '"' + data.leadName + '"'
      );
      this.changeDetectorRef.detectChanges();
      return;
    }
    if (data.status == '3' || data.status == '5') {
      this.notificationsService.notifyCode(
        'DP037',
        0,
        '"' + data.leadName + '"'
      );
      this.changeDetectorRef.detectChanges();
      return;
    }
    if (data.status == '11') {
      this.notificationsService.notifyCode('Tiềm năng đã chuyển đổi');
      this.changeDetectorRef.detectChanges();
      return;
    }
    this.dataColums = this.kanban.columns;
    if (this.dataColums.length > 0) {
      var idx = this.dataColums.findIndex(
        (x) => x.dataColums.recID == this.stepIdClick
      );

      if (data.status == '13' && idx != -1) {
        var stepCrr = this.dataColums[idx].dataColums;
        if (!stepCrr?.isFailStep) {
          this.notificationsService.notifyCode(
            'Tiềm năng đã bị từ chối không thể đánh dấu được'
          );
          return;
        } else {
          this.moveStage(data);
        }
      } else if (idx != -1) {
        var stepCrr = this.dataColums[idx].dataColums;
        if (!stepCrr?.isSuccessStep && !stepCrr?.isFailStep) {
          idx = this.moreFuncInstance.findIndex(
            (x) => x.functionID == 'CM0205_3'
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
              (x) => x.functionID == 'CM0205_5'
            );
            if (idx != -1) {
              this.titleAction = this.moreFuncInstance[idx].customName;
              this.moveReason(data, true);
            }
          } else {
            idx = this.moreFuncInstance.findIndex(
              (x) => x.functionID == 'CM0205_6'
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

  clickMF(e, data) {
    this.titleAction = e.text;
    this.dataSelected = data;
    let lst = [];
    lst.push(Object.assign({}, data)); // Đùng để cập nhật tự động address
    const functionMappings = {
      SYS03: () => this.edit(data),
      SYS04: () => this.copy(data),
      SYS02: () => this.delete(data),
      CM0205_1: () => this.convertLead(data),
      CM0205_2: () => this.mergeLead(data),
      CM0205_4: () => this.startDay(data),
      CM0205_10: () => this.openOrCloseLead(data, true),
      CM0205_11: () => this.openOrCloseLead(data, false),
      CM0205_3: () => this.moveStage(data),
      CM0205_5: () => this.moveReason(data, true),
      CM0205_6: () => this.moveReason(data, false),
      CM0205_8: () => this.approvalTrans(data),
      CM0205_9: () => this.popupOwnerRoles(data),
      CM0205_12: () => this.changeStatus(data),
      CM0205_13: () => this.startFirst(data),
      CM0205_14: () => this.updateProcess(data, true),
      CM0205_15: () => this.updateProcess(data, false),
      CM0205_16: () => this.popupPermissions(data),
      //SYS002: () => this.exportFiles(e, data),
      CM0205_17: () => this.cancelApprover(data),
      CM0205_18: () => this.updateAutoAddress(lst),
    };
    const executeFunction = functionMappings[e.functionID];
    if (executeFunction) {
      executeFunction();
    } else {
      let customData = {
        refID: data.recID,
        refType: 'CM_Leads',
      };

      if (data?.refID && data.applyProcess) {
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
    }
  }

  changeMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  getPropertiesHeader(data, type) {
    if (this.listHeader?.length == 0) {
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
    this.addLead();
  }

  addLead() {
    this.view.dataService.addNew().subscribe((res) => {
      this.cache.functionList(this.funcID).subscribe((fun) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        var formMD = new FormModel();
        formMD.funcID = this.funcID;
        formMD.entityName = fun.entityName;
        formMD.formName = fun.formName;
        formMD.gridViewName = fun.gridViewName;
        option.Width = '800px';
        option.zIndex = 1001;
        this.openFormLead(formMD, option, 'add');
      });
    });
  }

  openFormLead(formMD, option, action) {
    var obj = {
      action: action === 'add' ? 'add' : 'copy',
      formMD: formMD,
      titleAction: this.formatTitleMore(this.titleAction),
      leadIdOld: this.oldIdLead,
      contactIdOld: this.oldIdContact,
      applyFor: this.applyFor,
      processId: this.processId,
      gridViewSetup: this.gridViewSetup,
      applyProcess: this.dataSelected?.applyProcess,
      listCategory: this.listCategory,
    };
    let dialogCustomDeal = this.callfc.openSide(
      PopupAddLeadComponent,
      obj,
      option
    );
    dialogCustomDeal.closed.subscribe((e) => {
      if (e && e.event != null) {
        e.event.modifiedOn = new Date();
        this.dataSelected = e.event;
        //   this.detailViewLead.promiseAllLoad();
        this.view.dataService.update(this.dataSelected, true).subscribe();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
    }
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
          applyFor: this.applyFor,
          processId: this.processId,
          gridViewSetup: this.gridViewSetup,
          listCategory: this.listCategory,
        };
        let dialogCustomDeal = this.callfc.openSide(
          PopupAddLeadComponent,
          obj,
          option
        );
        dialogCustomDeal.closed.subscribe((e) => {
          if (e && e.event != null) {
            //    e.event.modifiedOn = new Date();
            //  data.modifiedOn = new Date() ;
            data.modifiedOn = moment(new Date()).add(99, 'hours').toDate();
            this.detailViewLead.promiseAllLoad();
            this.dataSelected = JSON.parse(JSON.stringify(e.event));
            this.view.dataService.update(this.dataSelected, true).subscribe();
            this.changeDetectorRef.detectChanges();
          }
        });
      });
  }

  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      this.oldIdLead = data.recID;
      this.oldIdContact = data.contactID;
    }
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;

      var formMD = new FormModel();
      option.Width = '800px';
      option.zIndex = 1001;
      this.openFormLead(formMD, option, 'copy');
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({ type: 'delete', data: data });
        }
      });
    this.changeDetectorRef.detectChanges();
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeletedLeadAsync';
    opt.data = [itemSelected.recID, null];
    return true;
  }
  //#endregion

  //#region convertLead
  convertLead(data) {
    this.dataSelected = data;
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.cache.gridViewSetup('CMLeads', 'grvCMLeads').subscribe((res) => {
      let option = new SidebarModel();
      var formMD = new FormModel();
      formMD.entityName = 'CM_Leads';
      formMD.formName = 'CMLeads';
      formMD.gridViewName = 'grvCMLeads';
      formMD.funcID = this.funcID;
      option.FormModel = JSON.parse(JSON.stringify(formMD));
      option.Width = '800px';
      var obj = {
        action: 'edit',
        title: this.titleAction,
        gridViewSetup: res,
        applyFor: this.applyFor,
        data: data,
      };
      var dialog = this.callfc.openSide(PopupConvertLeadComponent, obj, option);
      dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e && e.event) {
          this.dataSelected.salespersonID = e.event.salespersonID;
          this.dataSelected.consultantID = e.event.consultantID;
          this.dataSelected.status = '11';
          this.view.dataService.update(this.dataSelected, true).subscribe();
          this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
          this.dataSelected.applyProcess &&
            this.detailViewLead.reloadListStep(e.event.listStep);
          this.detectorRef.detectChanges();
        }
      });
    });
  }
  //#endregion

  //#region mergeLead
  mergeLead(leadOne, isMulti = false, leadTwo = null, leadThree = null) {
    let obj = {
      leadOne: leadOne,
      leadTwo: leadTwo,
      leadThree: leadThree,
      title: this.titleAction,
      isMulti: isMulti,
    };
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1001;
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    let popupContract = this.callfc.openForm(
      PopupMergeLeadsComponent,
      '',
      null,
      null,
      '',
      obj,
      '',
      option
    );
    popupContract.closed.subscribe((e) => {
      if (!e?.event) this.view.dataService.clear();

      if (e && e.event) {
        if (e.event.length > 0) {
          e.event[0].modifiedOn = new Date();
          this.view.dataService.add(e.event[0], 0).subscribe();

          if (e.event[1]) {
            this.view.dataService.remove(e.event[1]).subscribe();
          }
          if (e.event[2]) {
            this.view.dataService.remove(e.event[2]).subscribe();
          }
          if (e.event[3]) {
            this.view.dataService.remove(e.event[3]).subscribe();
          }
          this.dataSelected = JSON.parse(
            JSON.stringify(this.view.dataService.data[0])
          );
          this.detectorRef.detectChanges();
        }
      }
    });
  }

  //auto update address
  async updateAutoAddress(datas = []) {
    // let lsts = datas.filter(
    //   (x) => x.address != null && x.address?.trim() != ''
    // );
    // for (var item of lsts) {
    //   let json = await firstValueFrom(
    //     this.api.execSv<any>(
    //       'BS',
    //       'ERM.Business.BS',
    //       'ProvincesBusiness',
    //       'GetLocationAsync',
    //       [item?.address, this.leverSetting]
    //     )
    //   );
    //   if (json != null && json.trim() != '' && json != "null") {
    //     let lstDis = JSON.parse(json);
    //     if (item.provinceID != lstDis?.ProvinceID)
    //       item.provinceID = lstDis?.ProvinceID;
    //     if (item.districtID != lstDis?.DistrictID)
    //       item.districtID = lstDis?.DistrictID;
    //     // if (item?.wardID != lstDis?.WardID) item.wardID = lstDis?.WardID;
    //   } else {
    //     item.provinceID = null;
    //     item.districtID = null;
    //     item.wardID = null;
    //   }
    // }

    // this.api
    //   .execSv<any>(
    //     'CM',
    //     'ERM.Business.CM',
    //     'CustomersBusiness',
    //     'UpdateAutoAddressAsync',
    //     [null, lsts]
    //   )
    //   .subscribe((res) => {
    //     if (res) {
    //       lsts.forEach((ele) => {
    //         this.view.dataService.update(ele).subscribe();
    //       });
    //       this.notificationsService.notifyCode('SYS007');
    //       this.detectorRef.detectChanges();
    //     }
    //   });
    this.api
      .execSv<any>(
        'CM',
        'ERM.Business.CM',
        'CustomersBusiness',
        'RPAUpdateAddresscAsync',
        ['CM_Leads']
      )
      .subscribe((res) => {
        this.notificationsService.notifyCode('SYS007');
      });
  }

  onMoreMulti(e) {
    let event = e?.event;
    this.titleAction = event?.text;
    switch (event?.functionID) {
      case 'CM0205_2': //Gộp
        if (e?.dataSelected != null) {
          if (e?.dataSelected?.length < 4 && e?.dataSelected?.length >= 2) {
            var lst = e?.dataSelected;
            var isCheck = false;
            isCheck = lst.some((x) => !x?.roles?.isOnwer);
            if (isCheck) {
              this.notificationsService.notifyCode('CM027'); //Đợi mssg
              return;
            } else {
              isCheck = !lst.every(
                (x) => x.category == '1' || x.category == '2'
              );
              if (!!isCheck) {
                this.notificationsService.notifyCode('CM030'); //Đợi mssg
                return;
              }
            }

            lst.forEach((element) => {
              if (!['15', '1'].includes(element?.status) && !isCheck) {
                isCheck = true;
                this.notificationsService.notifyCode('CM028'); //Đợi mssg
                return;
              } else if (element.closed && !isCheck) {
                isCheck = true;
                this.notificationsService.notifyCode('CM029'); //Đợi mssg
                return;
              }
            });
            if (!isCheck) {
              let leadTwo = new CM_Leads();
              let leadThree = new CM_Leads();
              for (let i = 1; i < lst.length; i++) {
                if (i == 1) {
                  leadTwo = lst[1];
                } else {
                  leadThree = lst[i];
                }
              }
              if (lst.length == 2) {
                leadThree = null;
              }
              this.mergeLead(lst[0], true, leadTwo, leadThree);
            }
          } else {
            this.notificationsService.notifyCode('CM008');
            return;
          }
        }
        break;
      case 'CM0205_18':
        this.updateAutoAddress(e?.dataSelected);
        break;
      default:
        break;
    }
  }
  //#endregion

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

  startDay(data) {
    this.notificationsService
      .alertCode('DP033', null, ['"' + data?.leadName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.codxCmService
            .startInstance([data.refID, data.recID, 'CM0205', 'CM_Leads'])
            .subscribe((resDP) => {
              if (resDP) {
                var datas = [data.recID, resDP[0]];
                this.codxCmService.startLead(datas).subscribe((res) => {
                  if (res) {
                    this.dataSelected = res;
                    this.dataSelected = JSON.parse(
                      JSON.stringify(this.dataSelected)
                    );
                    this.detailViewLead.reloadListStep(resDP[1]);
                    this.notificationsService.notifyCode('SYS007');
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
  startFirst(data) {
    this.notificationsService
      .alertCode('DP033', null, [
        '"' + data?.leadName + ' bạn có muốn quay trở lại đầu tiên không"' ||
          '',
      ])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.executeStartLead(data);
        }
      });
  }
  executeStartLead(data: any) {
    if (data.applyProcess) {
      this.codxCmService
        .moveBackStartInstance([
          data.refID,
          data.status,
          data.processID,
          this.applyFor,
        ])
        .subscribe((resDP) => {
          if (resDP) {
            let datas = [data.recID, resDP[0]];
            this.startFirstLead(datas, resDP[1]);
          }
        });
    } else {
      let datas = [data.recID, ''];
      this.startFirstLead(datas, null);
    }
  }
  startFirstLead(datas: any, listStep: any) {
    this.codxCmService.moveStartFirstLead(datas).subscribe((res) => {
      if (res) {
        this.dataSelected = res;
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        this.view.dataService.update(this.dataSelected, true).subscribe();
        listStep.length > 0 &&
          listStep &&
          this.detailViewLead.reloadListStep(listStep);
        this.notificationsService.notifyCode('SYS007');
      }
      this.detectorRef.detectChanges();
    });
  }

  updateProcess(data, isCheck) {
    this.notificationsService
      .alertCode('DP033', null, [
        '"' + data?.leadName + '" ' + this.titleAction + ' ',
      ])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          let datas = [data.recID, data.status, this.processId, isCheck];
          this.getApiUpdateProcess(datas);
        }
      });
  }
  addPermission(permissionDP, lead) {
    if (permissionDP?.length > 0 && permissionDP) {
      for (let item of permissionDP) {
        lead.permissions.push(this.copyPermission(item));
      }
    }
  }
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
    permission.isActive = permissionDP.isActive;
    permission.create = permissionDP.create;
    permission.memberType = '2'; // Data from DP
    permission.allowPermit = permissionDP.allowPermit;
    permission.allowUpdateStatus = permissionDP.allowUpdateStatus;
    permission.createdOn = new Date();
    permission.createdBy = this.user.userID;
    return permission;
  }

  getApiUpdateProcess(datas) {
    this.codxCmService.updateProcess(datas).subscribe((res) => {
      if (res) {
        this.dataSelected = res;
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        this.notificationsService.notifyCode('SYS007');
        this.view.dataService.update(this.dataSelected, true).subscribe();
        if (this.dataSelected.applyProcess) {
          this.detailViewLead.promiseAllLoad();
        }
      }
      this.detectorRef.detectChanges();
    });
  }

  openOrCloseLead(data, check) {
    var datas = [data.recID, check];
    this.notificationsService
      .alertCode('DP018', null, this.titleAction, "'" + data.leadName + "'")
      .subscribe((info) => {
        if (info.event.status == 'Y') {
          this.codxCmService.openOrClosedLead(datas).subscribe((res) => {
            if (res) {
              this.dataSelected.closed = check;
              this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
              this.view.dataService.update(this.dataSelected, true).subscribe();
              this.notificationsService.notifyCode(
                check ? 'DP016' : 'DP017',
                0,
                "'" + data.leadName + "'"
              );
              if (data.showInstanceControl === '1') {
                this.view.dataService
                  .update(this.dataSelected, true)
                  .subscribe();
              }
              // if (
              //   data.showInstanceControl === '0' ||
              //   data.showInstanceControl === '2'
              // ) {
              //   this.view.dataService.remove(this.dataSelected).subscribe();
              //   this.dataSelected = this.view.dataService.data[0];
              //   this.view.dataService.onAction.next({
              //     type: 'delete',
              //     data: data,
              //   });
              // }
              this.detectorRef.detectChanges();
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
          var stepReason = {
            isUseFail: false,
            isUseSuccess: false,
          };
          var dataCM = {
            refID: data?.refID,
            processID: data?.processID,
            stepID: data?.stepID,
            nextStep: this.stepIdClick ? this.stepIdClick : '',
            isCallInstance: true,
          };
          var obj = {
            stepName: data?.currentStepName,
            formModel: formMD,
            deal: data,
            stepReason: stepReason,
            headerTitle: this.titleAction,
            applyFor: this.applyFor,
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
              this.detailViewLead.reloadListStep(listSteps);
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
              var dataUpdate = [data.recID, instance.stepID];
              this.codxCmService.moveStageLead(dataUpdate).subscribe((res) => {
                if (res) {
                  data = res;
                  this.view.dataService.update(data, true).subscribe();
                  this.detailViewLead.dataSelected = data;

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
      applyFor: this.applyFor,
      dataCM: dataCM,
      stepName: data.currentStepName,
      isMoveProcess: false,
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
        this.isLoading = false;
        this.detailViewLead.reloadListStep(listSteps);
        data = this.updateReasonLead(e.event?.instance, data, isMoveSuccess);
        var datas = [data];
        this.codxCmService.moveLeadReason(datas).subscribe((res) => {
          if (res) {
            data = res;
            this.view.dataService.update(data, true).subscribe();
            this.detectorRef.detectChanges();
          }
        });
        // }
      }
    });
  }
  updateReasonLead(instance: any, lead: any, isMoveSuccess: boolean) {
    lead.status = isMoveSuccess ? '3' : '5';
    lead.stepID = instance.stepID;
    lead.nextStep = '';
    return lead;
  }

  popupOwnerRoles(data) {
    this.dataSelected = JSON.parse(JSON.stringify(data));
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
      applyFor: this.applyFor,
      titleAction: this.titleAction,
      owner: data.owner,
      startControl: data.steps.startControl,
      applyProcess: data.applyProcess,
      buid: data.buid,
      data: data,
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
        this.detailViewLead.promiseAllLoad();
        this.view.dataService.update(e?.event, true).subscribe();
        this.notificationsService.notifyCode('SYS007');
        this.detectorRef.detectChanges();
      }
    });
  }

  //#region event
  selectedChange(data) {
    this.dataSelected = data?.data ? data?.data : data;
    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  //#region temp Gird
  changeDataMFGird(e, data) {
    this.changeDataMF(e, data, 11);
  }
  //#endregion

  viewDetail(data) {
    this.dataSelected = data;
    let temView =
      this.gridDetailView == '2' ? this.tempViewLeadDetail : this.popDetail;
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 999;

    this.dialogViewLead = this.callfc.openForm(
      temView,
      '',
      0,
      0,
      '',
      null,
      '',
      option
    );
    this.dialogViewLead.closed.subscribe((e) => {});
  }

  checkApplyProcess(data) {
    return data?.applyProcess;
  }
  saveStatus() {
    if (
      this.dataSelected.status === this.statusDefault ||
      this.dataSelected.statusCode === this.statusDefault
    ) {
      this.dialogQuestionCopy.close();
      this.notificationsService.notifyCode('SYS007');
    } else {
      var datas = [this.dataSelected.recID, this.statusDefault];
      this.codxCmService.changeStatusLead(datas).subscribe((res) => {
        if (res) {
          this.dialogQuestionCopy.close();
          if (this.dataSelected?.applyProcess) {
            this.dataSelected.statusCode = this.statusDefault;
          } else {
            this.dataSelected.status = this.statusDefault;
          }
          this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
          this.view.dataService.dataSelected = this.dataSelected;
          this.view.dataService.update(this.dataSelected, true).subscribe();
          this.detectorRef.detectChanges();
          this.notificationsService.notifyCode('SYS007');
        }
      });
    }
  }

  changeStatus(data) {
    this.dataSelected = data;
    if (this.dataSelected.applyProcess) {
      let formMD = new FormModel();
      let dialogModel = new DialogModel();
      formMD.funcID = this.funcIDCrr.functionID;
      formMD.entityName = this.view?.formModel.entityName;
      formMD.formName = this.view?.formModel.formName;
      formMD.gridViewName = this.view?.formModel.gridViewName;
      dialogModel.zIndex = 999;
      dialogModel.FormModel = formMD;
      let obj = {
        statusDefault: this.dataSelected?.statusCode,
        statusCodecmt: this.dataSelected?.statusCodeCmt,
        applyProcess: true,
        title: this.titleAction,
        recID: this.dataSelected.recID,
        valueListStatusCode: this.valueListStatusCode,
        gridViewSetup: this.gridViewSetup,
        category: this.applyFor,
      };
      let dialog = this.callfc.openForm(
        PopupUpdateStatusComponent,
        '',
        500,
        400,
        '',
        obj,
        '',
        dialogModel
      );
      dialog.closed.subscribe((e) => {
        if (e && e?.event != null) {
          this.dataSelected.statusCodeID = e?.event?.statusDefault;
          this.dataSelected.statusCodeCmt = e?.event?.statusCodecmt;
          this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
          this.view.dataService.dataSelected = this.dataSelected;
          this.view.dataService.update(this.dataSelected, true).subscribe();
          this.detectorRef.detectChanges();
          this.notificationsService.notifyCode('SYS007');
        }
      });
    } else {
      this.dataSelected = data;
      this.statusDefault = this.dataSelected.applyProcess
        ? this.dataSelected?.statusCode
        : ['1', '15'].includes(this.dataSelected?.status)
        ? ''
        : this.dataSelected?.status;
      this.dialogQuestionCopy = this.callfc.openForm(
        this.popUpQuestionCopy,
        '',
        400,
        200
      );
    }
  }
  valueChangeStatus($event) {
    if ($event) {
      this.statusDefault = $event;
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
      this.view.dataService.update(this.dataSelected, true).subscribe();
    }
  }

  //export theo moreFun
  exportFiles(e, data) {
    //Tạo data cho Quang debug
    // let datas = [
    //   // {
    //   // dai_dien: 'Trần Đoàn Tuyết Khanh',
    //   // ten_cong_ty: 'Tập đoàn may mặc Khanh Pig',
    //   // dia_chi: '06 Lê Lợi, Huế',
    //   // ma_so_thue: '1111111111111',
    //   // hinh_thuc_thanh_toan: 'Chuyển khoản',
    //   // tai_khoan: 'VCB-012024554565',
    //   // san_pham: 'Sản phẩm quần què',
    //   // dien_tich: '0',
    //   // so_luong: 1,
    //   // don_gia: 100000,

    // datas: [
    // {
    //   customerID: 'Sản phẩm 1',
    //   Industries: '0',
    //   BusinessLineID: 3333333333,
    //   don_gia: 100000,
    // },
    // {
    //   customerID: 'Sản phẩm 2',
    //   Industries: '0',
    //   BusinessLineID: 99999999,
    //   don_gia: 5000,
    // },
    // ,
    // ],
    //  }
    // ];

    // let formatDatas = JSON.stringify(datas);

    let formatDatas = data.datas ?? '';
    let customData = {
      refID: data.recID,
      refType: this.view.entityName,
      dataSource: formatDatas,
    };
    if (data?.refID) {
      this.codxCmService.getDatasExport(data?.refID).subscribe((dts) => {
        if (dts) {
          if (formatDatas) {
            formatDatas = JSON.stringify([
              ...JSON.parse(formatDatas),
              ...JSON.parse(dts),
            ]);
          } else formatDatas = dts;
          debugger;
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
        this,
        customData
      );
      this.detectorRef.detectChanges();
    }
  }

  //------------------------- Ký duyệt  ----------------------------------------//
  approvalTrans(dt) {
    if (dt?.applyProcess && dt?.processID) {
      this.codxCmService.getProcess(dt?.processID).subscribe((process) => {
        if (process) {
          this.approvalTransAction(dt, process.processNo);
        } else {
          this.notificationsService.notifyCode('DP040');
        }
      });
    } else {
      this.approvalTransAction(dt, 'ES_CM0504');
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
        if (category.eSign) {
          //kys soos
        } else {
          this.release(data, category);
        }
      });
  }
  release(data: any, category: any) {
    //duyet moi
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
        .getOneObject(this.dataSelected.recID, 'LeadsBusiness')
        .subscribe((c) => {
          if (c) {
            this.dataSelected = c;
            this.view.dataService.update(this.dataSelected, true).subscribe();
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
        debugger;
        if (dt.applyProcess) {
          this.codxCmService.getProcess(dt.processID).subscribe((process) => {
            if (process) {
              this.cancelAction(dt, process.processNo);
            } else {
              this.notificationsService.notifyCode('DP040');
            }
          });
        } else {
          this.cancelAction(dt, 'ES_CM0504');
        }
      }
    });
  }

  cancelAction(dt, categoryID) {
    this.codxCmService
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
                  this.dataSelected.approveStatus = '0';
                  this.view.dataService
                    .update(this.dataSelected, true)
                    .subscribe();
                  this.notificationsService.notifyCode('SYS007');
                } else this.notificationsService.notifyCode('SYS021');
              });
          }
        } else this.notificationsService.notifyCode('ES028');
      });
  }
  //end duyet
  //--------------------------------------------------------------------//

  loadParam() {
    //approver
    this.codxCmService.getParam('CMParameters', '1').subscribe((res) => {
      if (res) {
        let dataValue = JSON.parse(res.dataValue);
        this.gridDetailView = dataValue?.GridDetailView || '2';
      }
    });
    this.codxCmService.getParam('CMParameters', '4').subscribe((res) => {
      if (res) {
        let dataValue = JSON.parse(res.dataValue);
        if (Array.isArray(dataValue)) {
          let setting = dataValue.find((x) => x.Category == 'CM_Leads');
          if (setting) this.applyApprover = setting['ApprovalRule'];
        }
      }
    });
  }
  formatTitleMore(titleAction) {
    return (
      titleAction +
      ' ' +
      this.funcIDCrr.customName.charAt(0).toLocaleLowerCase() +
      this.funcIDCrr.customName.slice(1)
    );
  }
}
