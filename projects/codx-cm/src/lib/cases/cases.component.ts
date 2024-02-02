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
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  UIComponent,
  ViewModel,
  ButtonModel,
  FormModel,
  ResourceModel,
  CacheService,
  ViewType,
  SidebarModel,
  RequestOption,
  CRUDService,
  DialogModel,
  Util,
  NotificationsService,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { CM_Customers } from '../models/cm_model';
import { PopupMoveStageComponent } from 'projects/codx-dp/src/lib/instances/popup-move-stage/popup-move-stage.component';
import { PopupMoveReasonComponent } from 'projects/codx-dp/src/lib/instances/popup-move-reason/popup-move-reason.component';
import { CasesDetailComponent } from './case-detail/cases-detail.component';
import { PopupAddCasesComponent } from './popup-add-cases/popup-add-cases.component';
import { PopupEditOwnerstepComponent } from 'projects/codx-dp/src/lib/instances/popup-edit-ownerstep/popup-edit-ownerstep.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { firstValueFrom } from 'rxjs';
import { PopupPermissionsComponent } from '../popup-permissions/popup-permissions.component';
import { PopupUpdateStatusComponent } from '../deals/popup-update-status/popup-update-status.component';
import { ExportData } from 'projects/codx-share/src/lib/models/ApproveProcess.model';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { PopupAssginDealComponent } from '../deals/popup-assgin-deal/popup-assgin-deal.component';

@Component({
  selector: 'lib-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.scss'],
})
export class CasesComponent
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
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('cardTitleTmp') cardTitleTmp!: TemplateRef<any>;
  @ViewChild('templateMore') templateMore: TemplateRef<any>;
  @ViewChild('detailViewCase') detailViewCase: CasesDetailComponent;

  // extension core
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;

  // type any for view detail
  @Input() dataObj?: any;
  kanban: any;

  // config api get data
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Cases';
  className = 'CasesBusiness';
  method = 'GetListCasesAsync';
  idField = 'recID';
  listInsStep = [];
  // valueListStatusCode: any = []; // status code ID
  // data structure
  listCustomer: CM_Customers[] = [];

  // type of string
  customerName: string = '';
  oldIdcases: string = '';

  @Input() showButtonAdd = false;

  columnGrids = [];
  // showButtonAdd = false;
  button?: ButtonModel[];
  dataSelected: any;
  //region Method
  //endregion

  titleAction = '';
  vllPriority = 'TM005';
  vllApprove = '';
  vllStatus = '';
  crrFuncID = '';
  viewMode = 2;
  // const set value
  readonly btnAdd: string = 'btnAdd';
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  hideMoreFC = false;
  listHeader: any;
  processID: any;
  colorReasonSuccess: any;
  colorReasonFail: any;

  formModelCrr: FormModel = new FormModel();
  funCrr: any;
  viewsDefault: any;
  viewCrr: any;
  crrStepID: any;
  stepIdClick: any;
  dataDrop: any;
  dataColums: any = [];
  moreFuncCase: any;
  gridViewSetup: any;
  fiterOption: any;
  orgFilter: any;
  orgPin: any;
  pinnedItem: any;
  processIDKanban: any;
  processIDDefault: any;
  crrProcessID: any;

  statusCodeID: string = '';
  statusCodeCmt: string = '';
  caseType: string;
  applyFor: string;
  applyApprover = '0';

  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private codxCommonService: CodxCommonService,
    private codxCmService: CodxCmService,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService
  ) {
    super(inject);
    this.router.params.subscribe((param) => {
      this.funcID = param['funcID'];
    });
    // this.cache.functionList(this.funcID).subscribe((fun) => {
    //   if (fun)
    // });
    this.loadParam();
    this.executeApiCalls();
    this.processID = this.activedRouter.snapshot?.queryParams['processID'];
    if (this.processID) this.dataObj = { processID: this.processID };
  }

  onInit(): void {
    //test no chosse
    this.button = [
      {
        id: this.btnAdd,
      },
    ];
    this.afterLoad();
  }

  ngAfterViewInit(): void {
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
          resources: this.columnGrids,
          template2: this.templateMore,
          // frozenColumns: 1,
        },
      },
    ];
    this.cache.viewSettings(this.funcID).subscribe((views) => {
      this.viewsDefault.forEach((v, index) => {
        let idx = views.findIndex((x) => x.view == v.type);
        if (idx != -1) {
          v.hide = false;
          if (views[idx].isDefault) v.action = true;
          else v.active = false;
        } else {
          v.hide = true;
          v.active = false;
        }
        // if (
        //   !(
        //     (this.funcID == 'CM0401' || this.funcID == 'CM0402') &&
        //     v.type == '6'
        //   )
        // )
        this.views.push(v);
      });
      this.changeDetectorRef.detectChanges();
    });
  }

  afterLoad() {
    this.checkFunction(this.funcID);
    this.request = new ResourceModel();
    this.request.service = 'CM';
    this.request.assemblyName = 'CM';
    this.request.className = 'CasesBusiness';
    this.request.method = 'GetListCasesAsync';
    this.request.idField = 'recID';
    this.request.dataObj = this.dataObj;

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'DP';
    this.resourceKanban.assemblyName = 'DP';
    this.resourceKanban.className = 'ProcessesBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.dataObj;
  }

  async executeApiCalls() {
    try {
      await this.getColorReason();
    } catch (error) {}
  }
  // async getListStatusCode() {
  //   this.codxCmService
  //     .getListStatusCode([this.caseType == '1' ? '9' : '11'])
  //     .subscribe((res) => {
  //       if (res) {
  //         this.valueListStatusCode = res.map((item) => ({
  //           text: item.statusName,
  //           value: item.statusID,
  //         }));
  //       } else {
  //         this.valueListStatusCode = [];
  //       }
  //     });
  // }

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
      (this.funcID == 'CM0401' || this.funcID == 'CM0402') &&
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
  changeDataMF($event, data, type = null) {
    if ($event != null && data != null) {
      for (let eventItem of $event) {
        if (type == 11) {
          eventItem.isbookmark = false;
        }
        eventItem.isblur =
          data.approveStatus == '3' &&
          (this.funcID == 'CM0401' || this.funcID == 'CM0402'); // de duyet ko bị isblur more
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
          ? !['1'].includes(data.status) || data.closed || !data.applyProcess
          : true;
    };
    let isOwner = (eventItem, data) => {
      // Phân bổ
      eventItem.disabled = data.full
        ? !['15', '1', '2'].includes(data.status) || data.closed
        : true;
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
    let isApprover = (eventItem, data) => {
      eventItem.disabled =
        (data.closed && data.status != '1') ||
        data.status == '15' ||
        (this.applyApprover != '1' && !data.applyProcess) ||
        (data.applyProcess && data?.approveRule != '1') ||
        data?.approveStatus >= '3';
      // || this.checkMoreReason(data);
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
        !data?.isAdminAll || data.closed || data.status == '7';
    };

    functionMappings = {
      ...[
        'CM0401_1',
        'CM0401_3',
        'CM0401_4',
        'SYS101',
        'CM0402_1',
        'CM0402_3',
        'CM0402_4',
      ].reduce((fundID, more) => ({ ...fundID, [more]: isDisabled }), {}),
      ...['SYS101', 'SYS102', 'SYS103', 'SYS104'].reduce(
        (fundID, more) => ({ ...fundID, [more]: isDisabledDefault }),
        {}
      ),
      CM0401_2: isStartDay,
      CM0402_7: isOwner,
      CM0401_7: isOwner,
      CM0401_8: isClosed,
      CM0401_9: isOpened,
      CM0402_2: isStartDay,
      CM0402_8: isClosed,
      CM0402_9: isOpened,
      SYS03: isEdit,
      SYS04: isCopy,
      SYS02: isDelete,
      CM0401_6: isApprover,
      CM0402_6: isApprover,
      CM0401_11: isRejectApprover,
      CM0402_11: isRejectApprover,
      CM0401_3: isMoveReason,
      CM0401_4: isMoveReason,
      CM0402_3: isMoveReason,
      CM0402_4: isMoveReason,
      CM0401_15: isDeleteProcess,
      CM0401_14: isUpdateProcess,
      CM0402_15: isDeleteProcess,
      CM0402_14: isUpdateProcess,
      CM0401_13: isAddTask,
      CM0402_13: isAddTask,
    };
    return functionMappings[type];
  }
  checkApplyProcess(data) {
    return data?.applyProcess;
  }

  changeMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  checkMoreReason(data, isShow: boolean = true) {
    if (data?.isAdminAll && isShow) return false;
    return data?.status != '1' && data?.status != '2' && data?.status != '15';
  }

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    this.stepIdClick = '';
    let functionMappings = {};
    if (this.caseType == '1') {
      functionMappings = {
        SYS03: () => this.edit(data),
        SYS04: () => this.copy(data),
        SYS02: () => this.delete(data),
        CM0401_1: () => this.moveStage(data),
        CM0401_2: () => this.startNow(data),
        CM0401_3: () => this.moveReason(data, true),
        CM0401_4: () => this.moveReason(data, false),
        CM0401_8: () => this.openOrCloseCases(data, true),
        CM0401_7: () => this.popupOwnerRoles(data),
        CM0401_9: () => this.openOrCloseCases(data, false),
        CM0401_5: () => this.codxCmService.exportFile(data, this.titleAction),
        CM0402_5: () => this.codxCmService.exportFile(data, this.titleAction),
        CM0401_6: () => this.approvalTrans(data),
        CM0402_6: () => this.approvalTrans(data),
        CM0401_11: () => this.cancelApprover(data),
        CM0402_11: () => this.cancelApprover(data),
        CM0401_10: () => this.popupPermissions(data),
        CM0401_12: () => this.changeStatus(data),
        CM0401_14: () => this.updateProcess(data, true),
        CM0401_15: () => this.updateProcess(data, false),
        SYS002: () => this.exportTemplet(e, data),
      };
    } else {
      functionMappings = {
        SYS03: () => this.edit(data),
        SYS04: () => this.copy(data),
        SYS02: () => this.delete(data),
        CM0402_1: () => this.moveStage(data),
        CM0402_2: () => this.startNow(data),
        CM0402_3: () => this.moveReason(data, true),
        CM0402_4: () => this.moveReason(data, false),
        CM0402_8: () => this.openOrCloseCases(data, true),
        CM0402_7: () => this.popupOwnerRoles(data),
        CM0402_9: () => this.openOrCloseCases(data, false),
        CM0402_5: () => this.codxCmService.exportFile(data, this.titleAction),
        CM0402_6: () => this.approvalTrans(data),
        CM0402_11: () => this.cancelApprover(data),
        CM0402_10: () => this.popupPermissions(data),
        CM0402_12: () => this.changeStatus(data),
        CM0402_14: () => this.updateProcess(data, true),
        CM0402_15: () => this.updateProcess(data, false),
        SYS002: () => this.exportTemplet(e, data),
      };
    }

    const executeFunction = functionMappings[e.functionID];
    if (executeFunction) {
      executeFunction();
    } else {
      // let customData = {
      //   refID: data.recID,
      //   refType: 'CM_Cases',
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
        //customData
      );
    }
  }

  updateProcess(data, isCheck) {
    this.notificationsService
      .alertCode('DP033', null, [
        '"' + data?.caseName + '" ' + this.titleAction + ' ',
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
    this.codxCmService.updateProcessCase(datas).subscribe((res) => {
      if (res) {
        this.dataSelected = res;
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        this.notificationsService.notifyCode('SYS007');
        this.view.dataService.update(this.dataSelected, true).subscribe();
        if (this.dataSelected.applyProcess) {
          this.detailViewCase.promiseAllAsync();
        } else {
          this.detailViewCase.reloadListStep([]);
        }
        if (this.kanban) {
          //this.renderKanban(this.dataSelected);
        }
      }
      this.detectorRef.detectChanges();
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
                  //    this.startNow(this.dataSelected);
                } else {
                  this.moveStage(this.dataSelected);
                }
                break;
              case '1':
                //       this.startNew(this.dataSelected);
                break;
              case '3':
              case '5':
                //      this.moveReason(this.dataSelected, status === '3');
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
  afterSave(e?: any, that: any = null) {
    if (e) {
      let appoverStatus = e?.unbounds?.statusApproval;
      if (
        appoverStatus != null &&
        appoverStatus != this.dataSelected.approveStatus
      ) {
        this.dataSelected.approveStatus = appoverStatus;
      }
      this.view.dataService.update(this.dataSelected).subscribe();
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
                let dataUpdate = [tmpInstaceDTO];
                this.codxCmService
                  .moveStageBackCase(dataUpdate)
                  .subscribe((res) => {
                    if (res) {
                      this.view.dataService.update(res, true).subscribe();
                      if (this.kanban) {
                        //    this.renderKanban(res);
                      }
                      if (this.detailViewCase)
                        this.detailViewCase.dataSelected = res;
                      this.detailViewCase?.reloadListStep(listSteps);
                      this.detectorRef.detectChanges();
                    }
                  });
              } else {
                let dataUpdate = [
                  data.recID,
                  instance.stepID,
                  e.event?.permissionCM,
                ];
                this.codxCmService
                  .moveStageCases(dataUpdate)
                  .subscribe((res) => {
                    if (res) {
                      this.view.dataService.update(res, true).subscribe();
                      if (this.kanban) {
                        //   this.renderKanban(res);
                      }
                      if (this.detailViewCase)
                        this.detailViewCase.dataSelected = res;
                      if (e.event.isReason != null) {
                        this.moveReason(res, e.event.isReason);
                      }
                      this.detailViewCase?.reloadListStep(listSteps);
                      this.detectorRef.detectChanges();
                    }
                  });
              }
            }
          });
        });
    });
  }
  // renderKanban(data) {
  //   let money = data.dealValue * data.exchangeRate;
  //   this.renderTotal(data.stepID, 'add', money);
  //   this.renderTotal(this.crrStepID, 'minus', money);
  //   // this.kanban.updateCard(data);
  //   // this.kanban?.kanbanObj?.refreshHeader();
  //   this.kanban.refresh();
  // }
  // renderTotal(stepID, action = 'add', money) {
  //   let idx = this.kanban.columns.findIndex((x) => x.keyField == stepID);
  //   if (idx != -1) {
  //     if (action == 'add') {
  //       this.kanban.columns[idx].totalDealValue += money;
  //     } else if (action == 'minus') {
  //       this.kanban.columns[idx].totalDealValue -= money;
  //     }
  //   }
  // }

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
  openFormReason(data, fun, isMoveSuccess) {
    let dataCM = {
      refID: data?.refID,
      stepID: data?.stepID,
      nextStep: data?.nextStep,
    };
    let obj = {
      headerTitle: fun.defaultName,
      formModel: this.view?.formModel,
      isReason: isMoveSuccess,
      applyFor: this.applyFor,
      dataCM: dataCM,
      processID: data?.processID,
      stepName: data.currentStepName,
      isMoveProcess: false,
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
        this.detailViewCase?.reloadListStep(listSteps);
        data = this.updateReasonCases(e.event?.instance, data);
        let datas = [data];
        this.codxCmService.moveCaseReason(datas).subscribe((res) => {
          if (res) {
            data = res;
            this.view.dataService.update(data, true).subscribe();
            //up kaban
            if (this.kanban) {
              // this.renderKanban(data);
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
  updateReasonCases(instance: any, cases: any) {
    cases.status = instance.status;
    cases.stepID = instance.stepID;
    cases.nextStep = '';
    return cases;
  }

  convertDataInstance(cases: any, instance: any, nextStep: any) {
    cases.caseName = instance.title;
    cases.memo = instance.memo;
    cases.endDate = instance.endDate;
    cases.casesID = instance.instanceNo;
    cases.owner = instance.owner;
    cases.salespersonID = instance.owner;
    cases.processID = instance.processID;
    cases.stepID = instance.stepID;
    cases.refID = instance.recID;
    cases.stepID = instance.stepID;
    cases.status = instance.status;
    cases.nextStep = nextStep;
    cases.startDate = null;
    return cases;
  }

  openOrCloseCases(data, check) {
    var datas = [data.recID, check];
    this.notificationsService
      .alertCode(
        'DP018',
        null,
        "'" + this.titleAction + "'" + data?.caseName + "'"
      )
      .subscribe((info) => {
        if (info.event.status == 'Y') {
          this.codxCmService.openOrClosedCases(datas).subscribe((res) => {
            if (res) {
              this.dataSelected.closed = check;
              this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
              this.view.dataService.update(this.dataSelected, true).subscribe();
              this.notificationsService.notifyCode(
                check ? 'DP016' : 'DP017',
                0,
                "'" + data.caseName + "'"
              );
              if (this.kanban) {
                //this.renderKanban(this.dataSelected);
              }
              this.detectorRef.detectChanges();
            }
          });
        }
      });
  }
  popupOwnerRoles(data) {
    this.dataSelected = data;
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 999;
    dialogModel.FormModel = this.view?.formModel;
    var obj = {
      recID: data?.recID,
      refID: data?.refID,
      processID: data?.processID,
      stepID: data?.stepID,
      data: data,
      gridViewSetup: this.gridViewSetup,
      formModel: this.view?.formModel,
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

        this.detailViewCase?.promiseAllAsync();
        if (this.kanban) this.kanban.updateCard(this.dataSelected);
        this.notificationsService.notifyCode('SYS007');
        this.detectorRef.detectChanges();
      }
    });
  }

  dblClick(e, data) {}

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

  onActions(e) {
    switch (e.type) {
      case 'drop':
        this.dataDrop = e.data;
        this.stepIdClick = JSON.parse(JSON.stringify(this.dataDrop.stepID));
        // xử lý data chuyển công đoạn
        if (this.crrStepID != this.dataDrop.stepID)
          this.dropCases(this.dataDrop);

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

  getMoreFunction(formName, gridViewName) {
    this.cache.moreFunction(formName, gridViewName).subscribe((res) => {
      if (res && res.length > 0) {
        this.moreFuncCase = res;
      }
    });
  }

  dropCases(data) {
    data.stepID = this.crrStepID;
    if (data?.alloweStatus != '1') {
      this.notificationsService.notifyCode('CM027');
      return;
    }
    if (data.closed) {
      this.notificationsService.notifyCode('DP039');
      return;
    }
    if (data.status == '0') {
      this.notificationsService.notify('Sự cố chưa được xác nhận');
      return;
    }
    if (data.status == '1') {
      this.notificationsService.notifyCode(
        'DP038',
        0,
        '"' + data?.caseName + '"'
      );
      this.changeDetectorRef.detectChanges();
      return;
    }
    if (data.status != '1' && data.status != '2') {
      this.notificationsService.notifyCode(
        'DP037',
        0,
        '"' + data?.caseName + '"'
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
          idx = this.moreFuncCase.findIndex(
            (x) => x.functionID == 'CM0401_1' || x.functionID == 'CM0402_1'
          );
          if (idx != -1) {
            // if (this.checkMoreReason(data)) {
            //   this.notificationsService.notifyCode('SYS032');
            //   return;
            // }
            this.titleAction = this.moreFuncCase[idx].text;
            this.moveStage(data);
          }
        } else {
          if (stepCrr?.isSuccessStep) {
            idx = this.moreFuncCase.findIndex(
              (x) => x.functionID == 'CM0401_3' || x.functionID == 'CM0402_3'
            );
            if (idx != -1) {
              // if (this.checkMoreReason(data)) {
              //   this.notificationsService.notifyCode('SYS032');
              //   return;
              // }
              this.titleAction = this.moreFuncCase[idx].text;
              this.moveReason(data, true);
            }
          } else {
            idx = this.moreFuncCase.findIndex(
              (x) => x.functionID == 'CM0401_4' || x.functionID == 'CM0402_4'
            );
            if (idx != -1) {
              // if (this.checkMoreReason(data)) {
              //   this.notificationsService.notifyCode('SYS032');
              //   return;
              // }
              this.titleAction = this.moreFuncCase[idx].text;
              this.moveReason(data, false);
            }
          }
        }
      }
      // else {
      //  // data.stepID = this.crrStepID;
      //   this.changeDetectorRef.detectChanges();
      // }
    }
  }

  //#region Search
  searchChanged(e) {}
  //#endregion

  //#region CRUD
  add() {
    this.addCases();
  }

  addCases() {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      option.zIndex = 1001;
      this.openFormCases(this.formModelCrr, option, 'add');
    });
  }

  openFormCases(formMD, option, action) {
    let obj = {
      action: action === 'add' ? 'add' : 'copy',
      formMD: formMD,
      caseType: this.caseType,
      applyFor: this.applyFor,
      titleAction: this.titleAction,
      processID: this.processID,
      funcID: this.funcID,
      gridViewSetup: this.gridViewSetup,
    };
    let dialogCustomcases = this.callfc.openSide(
      PopupAddCasesComponent,
      obj,
      option
    );
    dialogCustomcases.closed.subscribe((e) => {
      if (!e?.event) this.view.dataService.clear();

      if (e && e.event != null) {
        this.dataSelected = JSON.parse(JSON.stringify(e?.event));
        this.view.dataService.update(e.event).subscribe();
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
        var obj = {
          action: 'edit',
          formMD: this.formModelCrr,
          titleAction: this.titleAction,
          applyFor: this.applyFor,
          gridViewSetup: this.gridViewSetup,
        };
        let dialogCustomcases = this.callfc.openSide(
          PopupAddCasesComponent,
          obj,
          option
        );
        dialogCustomcases.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();

          if (e && e.event != null) {
            this.dataSelected = JSON.parse(JSON.stringify(e?.event));
            this.view.dataService.update(e.event).subscribe();
            this.changeDetectorRef.detectChanges();
          }
        });
      });
  }

  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      this.oldIdcases = data.recID;
    }
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      option.zIndex = 1001;
      this.openFormCases(this.view.formModel, option, 'copy');
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
    opt.methodName = 'DeletedCasesAsync';
    opt.data = [itemSelected.recID];
    return true;
  }
  //#endregion

  //#region event
  selectedChange(data) {
    this.dataSelected = data?.data ? data?.data : data;
    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  getCustomerName(customerID: any) {
    return this.listCustomer.find((x) => x.recID === customerID);
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

  async checkFunction(funcID: any) {
    await this.cache.functionList(funcID).subscribe((fun) => {
      this.formModelCrr.funcID = fun.functionID;
      this.formModelCrr.entityName = fun.entityName;
      this.formModelCrr.formName = fun.formName;
      this.formModelCrr.gridViewName = fun.gridViewName;
      if (this.formModelCrr.formName === 'CMCases') {
        this.caseType = '1';
        this.applyFor = '2';
      } else if (this.formModelCrr.formName === 'CMRequests') {
        this.caseType = '2';
        this.applyFor = '3';
      }
      this.getMoreFunction(fun.formName, fun.gridViewName);
      this.getGridViewSetup(fun.formName, fun.gridViewName);
    });
  }

  //------------------------- Ký duyệt  ----------------------------------------//
  approvalTrans(dt) {
    if (dt?.applyProcess && dt?.processID) {
      this.codxCmService.getProcess(dt?.processID).subscribe((process) => {
        if (process) {
          if (process.approveRule)
            this.approvalTransAction(dt, process.processNo);
          else
            this.notificationsService.notifyCode(
              'Quy trình đang thực hiện chưa bật chức năng ký duyệt !'
            );
        } else {
          this.notificationsService.notifyCode('DP040');
        }
      });
    } else {
      //case chua có quy trình duyệt tạm lấy của leads test
      if (this.applyApprover == '1') this.approvalTransAction(dt, 'ES_CM0504');
      else
        this.notificationsService.notifyCode(
          'Thiết lập hệ thống chưa bật chức năng ký duyệt !'
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
          .getDataSource(data.recID, 'CasesBusiness')
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
      data?.title,
      this.releaseCallback.bind(this),
      null,
      null,
      'CM_Cases',
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
      // this.notificationsService.notifyCode('ES007'); - bên kia gọi rồi
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
        } else this.cancelAction(dt, 'ES_CM0504');
      }
    });
  }

  cancelAction(dt, categoryID) {
    this.codxCmService
      .getESCategoryByCategoryID(categoryID)
      .subscribe((res2: any) => {
        if (res2) {
          // if (res2?.eSign == true) {
          //   //trình ký
          // } else if (res2?.eSign == false) {
          //   //kí duyet
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
                if (this.kanban) this.kanban.updateCard(this.dataSelected);
                this.notificationsService.notifyCode('SYS007');
              } else this.notificationsService.notifyCode('SYS021');
            });
          // }
        } else this.notificationsService.notifyCode('ES028');
      });
  }
  //end duyet
  //--------------------------------------------------------------------//

  getGridViewSetup(formName, gridViewName) {
    this.cache.gridViewSetup(formName, gridViewName).subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
        this.vllStatus = this.gridViewSetup['Status'].referedValue;
        this.vllApprove = this.gridViewSetup['ApproveStatus'].referedValue;
      }
    });
  }

  //-----------------------------change Filter -------------------------------//
  changeFilter() {
    if (this.funcID != 'CM0401' || this.funcID != 'CM0402') {
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

        this.detectorRef.detectChanges();
      });
  }
  async onLoading(e) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    let applyFor =
      this.funcID == 'CM0401' ? '2' : this.funcID == 'CM0402' ? '3' : '';
    if (applyFor) {
      let processDf = await firstValueFrom(
        this.codxCmService.getProcessDefault(applyFor)
      );
      if (processDf) {
        this.processIDDefault = processDf.recID;
        this.processIDKanban = processDf.recID;
      }
    }
    if (!this.funCrr) return;

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

          this.views.push(v);
        });
        if (!this.views.some((x) => x.active)) {
          if (idxActive != -1) this.views[idxActive].active = true;
          else this.views[0].active = true;

          let viewModel =
            idxActive != -1 ? this.views[idxActive] : this.views[0];
          this.view.viewActiveType = viewModel.type;
          this.view.viewChange(viewModel);
        }
        if ((this.view?.currentView as any)?.kanban) this.loadKanban();
      }
    });
  }
  //end

  //#region temp Gird
  changeDataMFGird(e, data) {
    this.changeDataMF(e, data, 11);
  }
  //#endregion

  //export theo moreFun
  exportFiles(e, data) {
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
  //load Parama
  loadParam() {
    //approver
    this.codxCmService.getParam('CMParameters', '4').subscribe((res) => {
      if (res) {
        let dataValue = JSON.parse(res.dataValue);
        if (Array.isArray(dataValue)) {
          let setting = dataValue.find((x) => x.Category == 'CM_Cases');
          if (setting) this.applyApprover = setting['ApprovalRule'];
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

  //#region step start
  startNow(data) {
    this.notificationsService
      .alertCode('DP033', null, ['"' + data?.caseName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.startCases(data);
        }
      });
  }
  startCases(data) {
    this.codxCmService
      .startInstance([
        data?.refID,
        data?.recID,
        this.view?.formModel?.funcID,
        this.view?.formModel?.entityName,
      ])
      .subscribe((resDP) => {
        if (resDP) {
          let datas = [data.recID, resDP[0]];
          this.codxCmService.startCases(datas).subscribe((res) => {
            if (res) {
              this.dataSelected = res;
              this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
              this.view.dataService.update(this.dataSelected, true).subscribe();
              if (this.kanban) this.kanban.updateCard(this.dataSelected);
              if (this.detailViewCase)
                this.detailViewCase.reloadListStep(resDP[1]);
              this.notificationsService.notifyCode('SYS007');
            }
            this.detectorRef.detectChanges();
          });
        }
      });
  }
  //#endregion

  //Export----------------------------------------------------//
  exportTemplet(e, data) {
    this.codxCmService
      .getDataSource(data.recID, 'CasesBusiness')
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
