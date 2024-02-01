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
  CallFuncService,
  Util,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { CM_Customers, CM_Leads, CM_Permissions } from '../models/cm_model';
import { PopupAddLeadComponent } from './popup-add-lead/popup-add-lead.component';
import { PopupConvertLeadComponent } from './popup-convert-lead/popup-convert-lead.component';
import { PopupMergeLeadsComponent } from './popup-merge-leads/popup-merge-leads.component';
import { PopupMoveStageComponent } from 'projects/codx-dp/src/lib/instances/popup-move-stage/popup-move-stage.component';
import { LeadDetailComponent } from './lead-detail/lead-detail.component';
import { PopupMoveReasonComponent } from 'projects/codx-dp/src/lib/instances/popup-move-reason/popup-move-reason.component';
import { PopupAssginDealComponent } from '../deals/popup-assgin-deal/popup-assgin-deal.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupPermissionsComponent } from '../popup-permissions/popup-permissions.component';
import { stringify } from 'querystring';
import { firstValueFrom } from 'rxjs';
import moment from 'moment';
import { PopupUpdateStatusComponent } from '../deals/popup-update-status/popup-update-status.component';
import { ExportData } from 'projects/codx-share/src/lib/models/ApproveProcess.model';
import { ViewDealDetailComponent } from '../deals/view-deal-detail/view-deal-detail.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { ViewLeadDetailComponent } from './view-lead-detail/view-lead-detail.component';
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

  @ViewChild('templateStatus') templateStatus: TemplateRef<any>;
  @ViewChild('templateCustommer') templateCustommer: TemplateRef<any>;
  // @ViewChild('popUpQuestionCopy', { static: true }) popUpQuestionCopy;
  // dialogQuestionCopy: DialogRef;
  dialogViewLead: DialogRef;
  // extension core
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;

  @Input() showButtonAdd = false;

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
  oldIdContact: string = '';
  oldIdLead: string = '';
  statusCodeID: string = '';
  statusCodeCmt: string = '';
  viewActiveType = '';
  applyApprover = '0';
  gridDetailView = '2';

  columnGrids = [];
  // showButtonAdd = false;
  button?: ButtonModel[];
  dataSelected: any;
  //region Method
  //endregion

  titleAction = '';
  vllApprove = 'DP043';
  vllStatus = 'DP041';
  vllPriority = 'TM005';
  crrFuncID = '';
  viewMode = 2;
  request: ResourceModel;
  resourceKanban?: ResourceModel;

  listHeader: any;
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
  queryParams: any;
  runMode: any;

  leverSetting = 0;
  isLoading = false;
  hideMoreFC = false;
  applyProcess: boolean = true;
  arrFieldIsVisible: any[];

  // const set value
  readonly btnAdd: string = 'btnAdd';
  readonly applyFor: any = '5';
  readonly fieldCbxStatus = { text: 'text', value: 'value' };
  readonly fieldCbxStatusCode = { text: 'text', value: 'value' };

  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
    private codxCommonService: CodxCommonService,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private authStore: AuthStore,
    private callFunc: CallFuncService
  ) {
    super(inject);
    this.getGridViewSetup('CMLeads', 'grvCMLeads');
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
    this.button = [
      {
        id: this.btnAdd,
      },
    ];
  }

  async ngAfterViewInit() {
    // this.loadViewModel();
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

  getFuncID(funcID) {
    this.cache.functionList(funcID).subscribe((f) => {
      if (f) {
        this.funcIDCrr = f;
        this.runMode = f?.runMode;
        // this.getGridViewSetup(
        //   this.funcIDCrr.formName,
        //   this.funcIDCrr.gridViewName
        // );
        this.getMoreFunction(
          this.funcIDCrr.formName,
          this.funcIDCrr.gridViewName
        );
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
        let arrField = Object.values(this.gridViewSetup).filter(
          (x: any) => x.isVisible
        );

        this.arrFieldIsVisible = arrField
          .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
          .map((x: any) => x.fieldName);
        this.getColumsGrid(this.gridViewSetup);
      }
    });
  }

  getColumsGrid(grvSetup) {
    this.columnGrids = [];
    this.arrFieldIsVisible.forEach((key) => {
      let field = Util.camelize(key);
      let template: any;
      let colums: any;
      if (grvSetup[key].isTemplate != '0') {
        switch (key) {
          case 'StatusCodeIDView': // hiện trạng
            template = this.templateStatus;
            break;
          case 'CustomerID': // khách hàng
            template = this.templateCustommer;
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
          //this.dataObj = { processID: res.recID };
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

  getMoreFunction(formName, gridViewName) {
    this.cache.moreFunction(formName, gridViewName).subscribe((res) => {
      if (res && res.length > 0) {
        this.moreFuncInstance = res;
      }
    });
  }

  onLoading(e) {
    this.loadViewModel();
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
    if (!data) return;
    if (this.runMode == '1') {
      this.codxShareService.changeMFApproval(event, data?.unbounds);
    } else if (event != null && data != null) {
      for (let eventItem of event) {
        if (data.status != '7') {
          if (type == 11) {
            eventItem.isbookmark = false;
          }
          eventItem.isblur =
            data.approveStatus == '3' && this.funcID == 'CM0205'; //CM0504 o bị isblur more
          const functionID = eventItem.functionID;
          const mappingFunction = this.getRoleMoreFunction(functionID);
          mappingFunction && mappingFunction(eventItem, data);
        } else {
          eventItem.disabled =
            eventItem?.functionID !== 'CM0205_12'
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
          (data.status != '13' && this.checkMoreReason(data, false)) ||
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

  checkMoreReason(data, isShow: boolean = true) {
    if (data?.isAdminAll && isShow) return false;
    return data?.status != '1' && data?.status != '2' && data?.status != '15';
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
    this.stepIdClick = '';
    let lst = [];
    lst.push(Object.assign({}, data)); // Đùng để cập nhật tự động address
    const functionMappings = {
      SYS03: () => this.edit(data),
      SYS04: () => this.copy(data),
      SYS05: () => this.viewLead(data),
      SYS02: () => this.delete(data),
      CM0205_1: () => this.convertLead(data),
      CM0205_2: () => this.mergeLead(data),
      CM0205_4: () => this.startNow(data),
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
      SYS002: () => this.exportTemplet(e, data),
      CM0205_17: () => this.cancelApprover(data),
      CM0205_18: () => this.updateAutoAddress(lst),
    };
    const executeFunction = functionMappings[e.functionID];
    if (executeFunction) {
      executeFunction();
    } else {
      // let customData = {
      //   refID: data.recID,
      //   refType: 'CM_Leads',
      // };

      // if (data?.refID && data.applyProcess) {
      //   customData = {
      //     refID: data.processID,
      //     refType: 'DP_Processes',
      //   };
      // }
      this.codxShareService.defaultMoreFunc(
        e,
        data,
        this.afterSave.bind(this),
        this.view.formModel,
        this.view.dataService,
        this
        // customData
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
          // processId: this.processId,
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

  viewLead(data) {
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
          // processId: this.processId,
          gridViewSetup: this.gridViewSetup,
          listCategory: this.listCategory,
          isView: true,
        };
        let dialogCustomDeal = this.callfc.openSide(
          PopupAddLeadComponent,
          obj,
          option
        );
        dialogCustomDeal.closed.subscribe((e) => {
          if (e && e.event != null) {
          }
        });
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

  startNow(data) {
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
  startNew(data) {
    this.notificationsService
      .alertCode('CM063', null, ['"' + data?.leadName + '"' || ''])
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
                .moveStageBackLead(dataUpdate)
                .subscribe((deal) => {
                  if (deal) {
                    this.dataSelected = deal;
                    this.view.dataService
                      .update(this.dataSelected, true)
                      .subscribe();
                    if (this.detailViewLead)
                      this.detailViewLead.dataSelected = this.dataSelected;
                    this.detailViewLead?.reloadListStep(res[0]);
                    this.detectorRef.detectChanges();
                    this.resetStatusCode();
                  }
                });
            }
          });
        }
      });
  }
  resetStatusCode() {
    this.statusCodeCmt = '';
    this.statusCodeID = '';
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
    permission.isActive = true;
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
          };
          let obj = {
            formModel: this.view.formModel,
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
                  // e.event?.comment,
                  // e.event?.expectedClosed,
                  // this.statusCodeID,
                  // this.statusCodeCmt,
                ];
                this.codxCmService
                  .moveStageBackLead(dataUpdate)
                  .subscribe((res) => {
                    if (res) {
                      this.view.dataService.update(res, true).subscribe();
                      if (this.detailViewLead)
                        this.detailViewLead.dataSelected = res;
                      this.detailViewLead?.reloadListStep(listSteps);
                      this.detectorRef.detectChanges();
                    }
                  });
              } else {
                let dataUpdate = [
                  data.recID,
                  instance.stepID,
                  // oldStepId,
                  // oldStatus,
                  // e.event?.comment,
                  // e.event?.expectedClosed,
                  // e.event?.permissionCM,
                ];
                this.codxCmService
                  .moveStageLead(dataUpdate)
                  .subscribe((res) => {
                    if (res) {
                      this.view.dataService.update(res, true).subscribe();
                      if (this.detailViewLead)
                        this.detailViewLead.dataSelected = res;
                      if (e.event.isReason != null) {
                        this.moveReason(res, e.event.isReason);
                      }
                      this.detailViewLead?.reloadListStep(listSteps);
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
      applyFor: this.applyFor,
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
        this.isLoading = false;
        data = this.updateReasonLead(e.event?.instance, data, isMoveSuccess);
        this.codxCmService.moveLeadReason([data]).subscribe((res) => {
          if (res) {
            data = res;
            this.view.dataService.update(data, true).subscribe();
            this.detailViewLead.reloadListStep(listSteps);
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
    let obj = {
      recID: data?.recID,
      refID: data?.refID,
      processID: data?.processID,
      stepID: data?.stepID,
      gridViewSetup: this.gridViewSetup,
      formModel: this.view.formModel,
      applyFor: this.applyFor,
      titleAction: this.titleAction,
      owner: data.owner,
      // startControl: data.steps.startControl,
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

  viewDetail(lead) {
    let data = {
      formModel: this.view.formModel,
      dataView: lead,
      isView: true,
      // listInsStepStart: this.listInsStep,
    };
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 100;
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    let popupContract = this.callFunc.openForm(
      ViewLeadDetailComponent,
      '',
      null,
      null,
      '',
      data,
      '',
      option
    );
    // this.dataSelected = data;
    // let temView =
    //   this.gridDetailView == '2' ? this.tempViewLeadDetail : this.popDetail;
    // let option = new DialogModel();
    // option.IsFull = true;
    // option.zIndex = 999;

    // this.dialogViewLead = this.callfc.openForm(
    //   temView,
    //   '',
    //   0,
    //   0,
    //   '',
    //   null,
    //   '',
    //   option
    // );
    // this.dialogViewLead.closed.subscribe((e) => {});
  }

  checkApplyProcess(data) {
    return data?.applyProcess;
  }
  // saveStatus() {
  //   if (
  //     this.dataSelected.status === this.statusDefault ||
  //     this.dataSelected.statusCode === this.statusDefault
  //   ) {
  //     this.dialogQuestionCopy.close();
  //     this.notificationsService.notifyCode('SYS007');
  //   } else {
  //     var datas = [this.dataSelected.recID, this.statusDefault];
  //     this.codxCmService.changeStatusLead(datas).subscribe((res) => {
  //       if (res) {
  //         this.dialogQuestionCopy.close();
  //         if (this.dataSelected?.applyProcess) {
  //           this.dataSelected.statusCode = this.statusDefault;
  //         } else {
  //           this.dataSelected.status = this.statusDefault;
  //         }
  //         this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
  //         this.view.dataService.dataSelected = this.dataSelected;
  //         this.view.dataService.update(this.dataSelected, true).subscribe();
  //         this.detectorRef.detectChanges();
  //         this.notificationsService.notifyCode('SYS007');
  //       }
  //     });
  //   }
  // }

  changeStatus(data) {
    let oldStatus = data?.status;
    this.dataSelected = data;
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 999;
    dialogModel.FormModel = this.view.formModel;
    let obj = {
      statusDefault: this.dataSelected?.statusCode,
      statusCodecmt: this.dataSelected?.statusCodeCmt,
      applyProcess: this.dataSelected.applyProcess,
      title: this.titleAction,
      formModel: this.view?.formModel,
      recID: this.dataSelected.recID,
      valueListStatusCode: this.valueListStatusCode,
      gridViewSetup: this.gridViewSetup,
      category: this.applyFor,
      statusOld: this.dataSelected?.status,
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
            "'" + this.dataSelected?.leadName + "'"
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
          this.dataSelected.statusCode = this.statusCodeID;
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
  // valueChangeStatus($event) {
  //   if ($event) {
  //     this.statusDefault = $event;
  //   }
  // }
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
      if (this.applyApprover == '1') this.approvalTransAction(dt, 'ES_CM0504');
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
          .getDataSource(data.recID, 'LeadsBusiness')
          .then((dataSource) => {
            let exportData: ExportData = {
              funcID: this.view.formModel.funcID,
              recID: data.recID,
              data: dataSource,
            };
            this.release(data, category, exportData);
          });
      });
  }
  release(data: any, category: any, exportData = null) {
    //duyet moi
    this.codxCommonService.codxReleaseDynamic(
      this.view.service,
      data,
      category,
      this.view.formModel.entityName,
      this.view.formModel.funcID,
      data?.leadName, //tên nè,
      this.releaseCallback.bind(this),
      null,
      null,
      'CM_Leads', //this.view.formModel.entityName // thích đổi mãi
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
      // this.notificationsService.notifyCode('ES007');
      // this.codxCmService
      //   .getOneObject(this.dataSelected.recID, 'LeadsBusiness')
      //   .subscribe((c) => {
      //     if (c) {
      //       this.dataSelected = c;
      //       this.view.dataService.update(this.dataSelected, true).subscribe();
      //       if (this.kanban) this.kanban.updateCard(this.dataSelected);
      //     }
      //     this.notificationsService.notifyCode('ES007');
      //   });
    }
  }

  //Huy duyet
  cancelApprover(dt) {
    this.notificationsService.alertCode('ES016').subscribe((x) => {
      if (x.event.status == 'Y') {
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
          //ko phân biệt (res2?.eSign == true) nữa
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
                  .update(this.dataSelected, true)
                  .subscribe();
                this.notificationsService.notifyCode('SYS007');
              } else this.notificationsService.notifyCode('SYS021');
            });
          // }
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

  //Export----------------------------------------------------//
  exportTemplet(e, data) {
    this.codxCmService
      .getDataSource(data.recID, 'LeadsBusiness')
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
