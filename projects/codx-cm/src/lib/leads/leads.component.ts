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
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { PopupAddDealComponent } from '../deals/popup-add-deal/popup-add-deal.component';
import { CM_Customers, CM_Leads } from '../models/cm_model';
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
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('detailViewLead') detailViewLead: LeadDetailComponent;
  @ViewChild('popUpQuestionCopy', { static: true }) popUpQuestionCopy;
  dialogQuestionCopy: DialogRef;
  // extension core
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;

  // type any for view detail
  funcID: any;
  dataObj?: any;
  kanban: any;

  // config api get data
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Leads';
  className = 'LeadsBusiness';
  method = 'GetListLeadsAsync';
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
  vllApprove = 'DP043';
  vllStatus = 'DP041';
  vllPriority = 'TM005';
  crrFuncID = '';
  viewMode = 2;
  // const set value
  readonly btnAdd: string = 'btnAdd';
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  hideMoreFC = false;
  listHeader: any;
  oldIdContact: string = '';
  oldIdLead: string = '';
  applyProcess: boolean = true;
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
  valueListStatus: any;
  isLoading = false;

  readonly applyForLead: string = '5';
  readonly fieldCbxStatus = { text: 'text', value: 'value' };
  applyApprover = '0';

  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService
  ) {
    super(inject);
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    }
    this.executeApiCalls();
    this.loadParam();
  }

  onInit(): void {
    this.button = {
      id: this.btnAdd,
    };
    this.getProcessSetting();
  }

  ngAfterViewInit(): void {
    // this.views = [
    //   {
    //     type: ViewType.listdetail,
    //     sameData: true,
    //     model: {
    //       template: this.itemTemplate,
    //       panelRightRef: this.templateDetail,
    //     },
    //   },
    //   {
    //     type: ViewType.kanban,
    //     active: false,
    //     sameData: false,
    //     request: this.request,
    //     request2: this.resourceKanban,
    //     toolbarTemplate: this.footerButton,
    //     model: {
    //       template: this.cardKanban,
    //       template2: this.viewColumKaban,
    //       setColorHeader: true,
    //     },
    //   },
    //   {
    //     type: ViewType.grid,
    //     active: false,
    //     sameData: true,
    //     model: {
    //       resources: this.columnGrids,
    //       template2: this.templateMore,
    //       // frozenColumns: 1,
    //     },
    //   },
    // ];
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
    try {
      this.getFuncID(this.funcID);
      this.getColorReason();
      // this.getCurrentSetting();
      this.getValuelistStatus();
    } catch (error) {}
  }
  async getValuelistStatus() {
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
  // async getCurrentSetting() {
  //   this.cache.viewSettingValues('CMParameters').subscribe((res) => {
  //     if (res?.length > 0) {
  //       let dataParam = res.filter((x) => x.category == '1' && !x.transType)[0];
  //       if (dataParam) {
  //         var applyProcessSetting = JSON.parse(dataParam.dataValue);
  //         // applyProcess
  //         this.applyProcess = applyProcessSetting['ProcessLead'] == '1';
  //         // currnecy
  //         this.currencyIDDefault = applyProcessSetting['DefaultCurrency'];
  //       }
  //     }
  //   });
  // }
  async getProcessSetting() {
    this.codxCmService
      .getListProcessDefault([this.applyForLead])
      .subscribe((res) => {
        if (res) {
          this.processId = res.recID;
          this.dataObj = { processID: res.recID };
          this.afterLoad();
          this.views = [
            {
              type: ViewType.listdetail,
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
                resources: this.columnGrids,
                template2: this.templateMore,
                // frozenColumns: 1,
              },
            },
          ];
        }
      });
  }
  async getColorReason() {
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

  async promiseByFuncID(formName, gridViewName) {}

  async getGridViewSetup(formName, gridViewName) {
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
  async getFuncID(funcID) {
    this.cache.functionList(funcID).subscribe((f) => {
      if (f) {
        this.funcIDCrr = f;
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
  async getMoreFunction(formName, gridViewName) {
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

  changeDataMF($event, data, type = null) {
    if ($event != null && data != null) {
      for (let eventItem of $event) {
        if (type == 11) eventItem.isbookmark = false;
        eventItem.isblur = data.approveStatus == '3';
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
          ? (data.closed && !['0', '1'].includes(data.status)) ||
            ['0', '1'].includes(data.status) ||
            this.checkMoreReason(data) ||
            !data.applyProcess
          : true;
    };
    let isCopy = (eventItem, data) => {
      // Thêm, xóa, copy
      eventItem.disabled = data.write
        ? data.closed || this.checkMoreReason(data)
        : true;
      // eventItem.disabled  = false;
    };
    let isEdit = (eventItem, data) => {
      // Chỉnh sửa
      eventItem.disabled = data.write
        ? data.closed || (data.status != '13' && this.checkMoreReason(data))
        : true;
    };
    let isDelete = (eventItem, data) => {
      // Chỉnh sửa
      eventItem.disabled = data.delete
        ? data.closed || (data.status != '13' && this.checkMoreReason(data))
        : true;
    };
    let isClosed = (eventItem, data) => {
      //Đóng tiềm năng
      eventItem.disabled =
        data?.alloweStatus == '1' && data?.read ? data.closed : true;
    };
    let isOpened = (eventItem, data) => {
      // Mở tiềm năng
      eventItem.disabled =
        data?.alloweStatus == '1' && data?.read ? !data.closed : true;
    };
    let isStartDay = (eventItem, data) => {
      // Bắt đầu ngay
      eventItem.disabled =
        data?.alloweStatus == '1'
          ? !['0', '1'].includes(data.status) ||
            data.closed ||
            !data.applyProcess
          : true;
    };
    let isConvertLead = (eventItem, data) => {
      // Chuyển thành cơ hội
      eventItem.disabled = data.write
        ? !['13', '3'].includes(data.status) || data.closed
        : true;
    };
    let isMergeLead = (eventItem, data) => {
      // Chuyển thành cơ hội
      eventItem.disabled = data.write
        ? !['0', '1'].includes(data.status) || data.closed
        : true;
    };

    let isOwner = (eventItem, data) => {
      // Phân bổ
      eventItem.disabled = data.full
        ? !['0', '1', '2'].includes(data.status) || data.closed
        : true;
    };
    let isFailReason = (eventItem, data) => {
      // Đánh dấu thất bại
      eventItem.disabled =
        data?.alloweStatus == '1'
          ? (data.closed && !['0', '1'].includes(data.status)) ||
            ['0', '1'].includes(data.status) ||
            (data.status != '13' && this.checkMoreReason(data)) ||
            !data.applyProcess
          : true;
    };
    let isDisabledDefault = (eventItem, data) => {
      // Mặc định tắt hết
      eventItem.disabled = true;
    };
    let isStartFirst = (eventItem, data) => {
      // Làm lại khi tiềm năng đã thành công or thất bại
      eventItem.disabled = data.write
        ? !['3', '5'].includes(data.status)
        : true;
    };
    let isChangeStatus = (eventItem, data) => {
      // Đổi trạng thái cho tiềm năng ko có quy trình
      eventItem.disabled =
        data?.alloweStatus == '1' ? this.checkApplyProcess(data) : true;
    };

    let isUpdateProcess = (eventItem, data) => {
      // Đưa quy trình vào sử dụng với tiềm năng  có quy trình
      eventItem.disabled = data.applyProcess;
    };
    let isDeleteProcess = (eventItem, data) => {
      // Xóa quy trình đang sử dụng với tiềm năng ko có quy trình
      eventItem.disabled = data.full ? data.closed || !data.applyProcess : true;
    };

    let isApprover = (eventItem, data) => {
      eventItem.disabled =
        (data.closed && data.status != '1') ||
        data.status == '0' ||
        (this.applyApprover != '1' && !data.applyProcess) ||
        (data.applyProcess && data?.approveRule != '1') ||
        data?.approveStatus >= '3' ||
        this.checkMoreReason(data);
    };
    let isPermission = (eventItem, data) => {
      // Phân quyền
      eventItem.disabled = !data.assign && !data.allowPermit ? true : false;
    };
    let isRejectApprover = (eventItem, data) => {
      // Gửi duyệt của a thảo
      eventItem.disabled =
        (data.closed && data.status != '1') ||
        data.status == '0' ||
        data.approveStatus != '3';
      eventItem.isblur = false;
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

    functionMappings = {
      CM0205_1: isConvertLead, // convertLead
      CM0205_2: isMergeLead, // mergeLead
      CM0205_3: isDisabled,
      CM0205_4: isStartDay, // startyDay
      CM0205_5: isDisabled, // success
      CM0205_6: isFailReason, // fail
      CM0205_7: isDisabled,
      CM0205_8: isApprover,
      CM0205_9: isOwner,
      CM0205_10: isClosed, // close lead
      CM0205_11: isOpened, // open lead
      SYS101: isDisabledDefault,
      SYS103: isDisabledDefault,
      SYS03: isEdit,
      SYS104: isDisabledDefault,
      SYS04: isCopy,
      SYS102: isDisabledDefault,
      SYS02: isDelete,
      CM0205_13: isStartFirst, // tiep tup van,
      CM0205_12: isChangeStatus,
      CM0205_14: isUpdateProcess, // co su dung quy trinh
      CM0205_15: isDeleteProcess, // khong su dung quy trinh
      CM0205_17: isRejectApprover,
      CM0205_16: isPermission, //Phân quyền
      SYS003: isUpload,
      SYS004: isEmail,
      SYS001: isUpload,
      SYS002: isDownload,
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
    if (!data?.roles?.isOnwer) {
      this.notificationsService.notifyCode('SYS032');
      return;
    }
    if (data.closed) {
      this.notificationsService.notifyCode('DP039');
      return;
    }
    if (data.status == '1' || data.status == '0') {
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
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;

      case 'SYS04':
        this.copy(data);
        break;

      case 'SYS02':
        this.delete(data);
        break;

      case 'CM0205_1':
        this.convertLead(data);
        break;

      case 'CM0205_2':
        this.mergeLead(data);
        break;

      case 'CM0205_4':
        this.startDay(data);
        break;

      case 'CM0205_10':
        this.openOrCloseLead(data, true);
        break;

      case 'CM0205_11':
        this.openOrCloseLead(data, false);
        break;

      case 'CM0205_3':
        this.moveStage(data);
        break;

      case 'CM0205_5':
        this.moveReason(data, true);
        break;

      case 'CM0205_6':
        this.moveReason(data, false);
        break;
      //ki duyet
      case 'CM0205_8':
        this.approvalTrans(data);
        break;
      case 'CM0205_9':
        this.popupOwnerRoles(data);
        break;

      case 'CM0205_12':
        this.openFormChangeStatus(data);
        break;

      case 'CM0205_13':
        this.startFirst(data);
        break;

      case 'CM0205_14':
        this.updateProcess(data, true);
        break;

      case 'CM0205_15':
        this.updateProcess(data, false);
        break;
      case 'CM0205_16':
        this.popupPermissions(data);
        break;

      case 'SYS002':
        this.exportFiles(e, data);
        break;
      //cancel Aprover
      case 'CM0205_17':
        this.cancelApprover(data);
        break;
      default:
        var customData: any = null;
        // var customData = {
        //   refID: data.processID,
        //   refType: 'DP_Processes',
        //   dataSource: '', // truyen sau
        // };
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          this.afterSave.bind(this),
          this.view.formModel,
          this.view.dataService,
          this,
          customData
        );
        break;
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
      titleAction: action === 'add' ? 'Thêm tiềm năng' : 'Sao chép tiềm năng',
      leadIdOld: this.oldIdLead,
      contactIdOld: this.oldIdContact,
      applyFor: this.applyForLead,
      processId: this.processId,
      gridViewSetup: this.gridViewSetup,
      applyProcess: this.dataSelected.applyProcess,
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
        this.detailViewLead.promiseAllLoad();
        this.view.dataService.update(this.dataSelected).subscribe();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
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
          titleAction: 'Chỉnh sửa tiềm năng',
          applyFor: this.applyForLead,
          processId: this.processId,
          gridViewSetup: this.gridViewSetup,
        };
        let dialogCustomDeal = this.callfc.openSide(
          PopupAddLeadComponent,
          obj,
          option
        );
        dialogCustomDeal.closed.subscribe((e) => {
          if (e && e.event != null) {
            e.event.modifiedOn = new Date();
            this.detailViewLead.promiseAllLoad();
            this.dataSelected = e.event;
            this.view.dataService.update(this.dataSelected).subscribe();
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
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        this.cache.functionList(this.funcID).subscribe((fun) => {
          this.cache
            .gridViewSetup(fun?.formName, fun?.gridViewName)
            .subscribe((res) => {
              let option = new SidebarModel();
              option.DataService = this.view.dataService;
              var formMD = new FormModel();
              formMD.entityName = fun.entityName;
              formMD.formName = fun.formName;
              formMD.gridViewName = fun.gridViewName;
              formMD.funcID = this.funcID;
              option.FormModel = JSON.parse(JSON.stringify(formMD));
              option.Width = '800px';
              var obj = {
                action: 'edit',
                title: this.titleAction,
                gridViewSetup: res,
              };
              var dialog = this.callfc.openSide(
                PopupConvertLeadComponent,
                obj,
                option
              );
              dialog.closed.subscribe((e) => {
                if (!e?.event) this.view.dataService.clear();
                if (e && e.event) {
                  this.dataSelected.status = '11';
                  this.view.dataService.update(this.dataSelected).subscribe();
                  this.dataSelected = JSON.parse(
                    JSON.stringify(this.dataSelected)
                  );
                  this.detectorRef.detectChanges();
                }
              });
            });
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
              if (!['0', '1'].includes(element?.status) && !isCheck) {
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
      default:
        break;
    }
    console.log('gộp: ', e);
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
          this.view.dataService.update(e?.event).subscribe();
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
          this.codxCmService.startInstance([data.refID]).subscribe((resDP) => {
            if (resDP) {
              var datas = [data.recID, resDP[0]];
              this.codxCmService.startLead(datas).subscribe((res) => {
                if (res) {
                  this.dataSelected = res[0];
                  this.dataSelected = JSON.parse(
                    JSON.stringify(this.dataSelected)
                  );
                  this.detailViewLead.reloadListStep(resDP[1]);
                  this.notificationsService.notifyCode('SYS007');
                  this.view.dataService.update(this.dataSelected).subscribe();
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
          this.codxCmService
            .moveBackStartInstance([
              data.refID,
              data.status,
              data.processID,
              this.applyForLead,
            ])
            .subscribe((resDP) => {
              if (resDP) {
                var datas = [data.recID, resDP[0]];
                this.codxCmService
                  .moveStartFirstLead(datas)
                  .subscribe((res) => {
                    if (res) {
                      this.dataSelected = res[0];
                      this.dataSelected = JSON.parse(
                        JSON.stringify(this.dataSelected)
                      );
                      this.detailViewLead.reloadListStep(resDP[1]);
                      this.notificationsService.notifyCode('SYS007');
                      this.view.dataService
                        .update(this.dataSelected)
                        .subscribe();
                    }
                    this.detectorRef.detectChanges();
                  });
              }
            });
        }
      });
  }
  updateProcess(data, isCheck) {
    this.notificationsService
      .alertCode('DP033', null, [
        '"' + data?.leadName + '" ' + this.titleAction + ' ',
      ])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          if (!isCheck) {
            let datas = [
              data.recID,
              this.applyForLead,
              isCheck,
              this.processId,
              '',
              '',
            ];
            this.getApiUpdateProcess(datas, []);
          } else {
            let datas = [
              data.leadName,
              data.leadID,
              this.processId,
              this.applyForLead,
            ];
            this.codxCmService.addInstanceNoRecId(datas).subscribe((res) => {
              if (res) {
                let dataInstance = [
                  data.recID,
                  this.applyForLead,
                  isCheck,
                  this.processId,
                  res[0],
                  res[1],
                ];
                this.getApiUpdateProcess(dataInstance, res[2]);
              }
            });
          }
        }
      });
  }
  getApiUpdateProcess(datas, listStep) {
    this.codxCmService.updateProcess(datas).subscribe((res) => {
      if (res) {
        this.dataSelected = res[0];
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        if (listStep.length > 0 && listStep) {
          this.detailViewLead.reloadListStep(listStep);
        }
        this.detailViewLead.resetTab(this.dataSelected.applyProcess);
        this.notificationsService.notifyCode('SYS007');
        this.view.dataService.update(this.dataSelected).subscribe();
      }
      this.detectorRef.detectChanges();
    });
  }

  openOrCloseLead(data, check) {
    var datas = [data.recID, data.processID, check];
    this.notificationsService
      .alertCode('DP018', null, this.titleAction, "'" + data.leadName + "'")
      .subscribe((info) => {
        if (info.event.status == 'Y') {
          this.codxCmService.openOrClosedLead(datas).subscribe((res) => {
            if (res) {
              this.dataSelected.closed = check;
              this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
              this.view.dataService.update(this.dataSelected).subscribe();
              this.notificationsService.notifyCode(
                check ? 'DP016' : 'DP017',
                0,
                "'" + data.leadName + "'"
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
            nextStep: this.stepIdClick ? this.stepIdClick : data?.nextStep,
          };
          var obj = {
            stepName: data?.currentStepName,
            formModel: formMD,
            deal: data,
            stepReason: stepReason,
            headerTitle: this.titleAction,
            applyFor: this.applyForLead,
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
              var dataUpdate = [data.recID, instance.stepID, nextStep];
              this.codxCmService.moveStageLead(dataUpdate).subscribe((res) => {
                if (res) {
                  data = res[0];
                  this.view.dataService.update(data).subscribe();
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
      applyFor: this.applyForLead,
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
        this.isLoading = false;
        this.detailViewLead.reloadListStep(listSteps);
        data = this.updateReasonLead(e.event?.instance, data, isMoveSuccess);
        var datas = [data];
        this.codxCmService.moveLeadReason(datas).subscribe((res) => {
          if (res) {
            data = res[0];
            this.view.dataService.update(data).subscribe();
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
      applyFor: this.applyForLead,
      titleAction: this.titleAction,
      owner: data.owner,
      startControl: data.steps.startControl,
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
        this.detailViewLead.promiseAllLoad();
        this.view.dataService.update(e?.event).subscribe();
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
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 999;

    let popup = this.callfc.openForm(
      this.popDetail,
      '',
      0,
      0,
      '',
      null,
      '',
      option
    );
    popup.closed.subscribe((e) => {});
  }
  checkApplyProcess(data) {
    return data.applyProcess;
  }
  saveCopy() {
    if (this.dataSelected.status === this.statusDefault) {
      this.dialogQuestionCopy.close();
      this.notificationsService.notifyCode('SYS007');
    } else {
      var datas = [this.dataSelected.recID, this.statusDefault];
      this.codxCmService.changeStatus(datas).subscribe((res) => {
        if (res[0]) {
          this.dialogQuestionCopy.close();
          this.dataSelected.status = res[0].status;
          this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
          this.view.dataService.dataSelected = this.dataSelected;
          this.view.dataService.update(this.dataSelected).subscribe();
          this.detectorRef.detectChanges();
          this.notificationsService.notifyCode('SYS007');
        }
      });
    }
  }
  openFormChangeStatus(data) {
    this.dataSelected = data;
    this.statusDefault = data.status;
    this.dialogQuestionCopy = this.callfc.openForm(
      this.popUpQuestionCopy,
      '',
      400,
      200
    );
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
      this.view.dataService.update(this.dataSelected).subscribe();
    }
  }

  //export theo moreFun
  exportFiles(e, data) {
    let customData: any;
    if (data?.refID) {
      this.codxCmService.getDatasExport(data?.refID).subscribe((dts) => {
        if (dts) {
          customData.refID = data.processID;
          customData.refType = 'DP_Processes';
          customData.dataSource = dts;
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
        if (dt.applyApprover) {
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
                  this.view.dataService.update(this.dataSelected).subscribe();
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
    this.codxCmService.getParam('CMParameters', '4').subscribe((res) => {
      if (res) {
        let dataValue = JSON.parse(res.dataValue);
        if (Array.isArray(dataValue)) {
          let setting = dataValue.find((x) => x.Category == 'CM_Contracts');
          if (setting) this.applyApprover = setting['ApprovalRule'];
        }
      }
    });
  }
}
