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
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { PopupAddDealComponent } from '../deals/popup-add-deal/popup-add-deal.component';
import { CM_Customers } from '../models/cm_model';
import { PopupAddLeadComponent } from './popup-add-lead/popup-add-lead.component';
import { PopupConvertLeadComponent } from './popup-convert-lead/popup-convert-lead.component';
import { PopupMergeLeadsComponent } from './popup-merge-leads/popup-merge-leads.component';
import { PopupMoveStageComponent } from 'projects/codx-dp/src/lib/instances/popup-move-stage/popup-move-stage.component';
import { LeadDetailComponent } from './lead-detail/lead-detail.component';
import { PopupMoveReasonComponent } from 'projects/codx-dp/src/lib/instances/popup-move-reason/popup-move-reason.component';
import { PopupEditOwnerstepComponent } from 'projects/codx-dp/src/lib/instances/popup-edit-ownerstep/popup-edit-ownerstep.component';
import { firstValueFrom } from 'rxjs';
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

  @ViewChild('detailViewLead') detailViewLead: LeadDetailComponent;

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
  funcIDCrr: any;
  gridViewSetup: any;
  colorReasonSuccess: any;
  colorReasonFail: any;
  processId: any;

  readonly applyForLead: string = '5';
  dataDrop: any;
  stepIdClick: any;
  crrStepID: any;
  moreFuncInstance: any;
  dataColums: any;

  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
    private notificationsService: NotificationsService
  ) {
    super(inject);
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    }
    this.getProcessSetting();
    this.executeApiCalls();
  }
  ngOnChanges(changes: SimpleChanges): void {}

  onInit(): void {
    this.button = {
      id: this.btnAdd,
    };
  }

  ngAfterViewInit(): void {
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
        toolbarTemplate: this.footerButton,
        model: {
          template: this.cardKanban,
          template2: this.viewColumKaban,
          setColorHeader: true,
        },
      },
    ];
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

  async executeApiCalls() {
    try {
      await this.getFuncID(this.funcID);
      await this.getColorReason();
    } catch (error) {}
  }
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

  onLoading(e) {}

  changeView(e) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    if (this.crrFuncID != this.funcID) {
      this.crrFuncID = this.funcID;
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

  changeDataMF($event, data) {
    if ($event != null && data != null) {
      for (let eventItem of $event) {
        const functionID = eventItem.functionID;
        const mappingFunction = this.getRoleMoreFunction(functionID);
        if (mappingFunction) {
          mappingFunction(eventItem, data);
        }
      }
    }
  }

  getRoleMoreFunction(type) {
    var functionMappings;
    var isDisabled = (eventItem, data) => {
      if (
        (data.closed && data.status != '1' && data.status != '3') ||
        data.status == '1' ||
        data.status == '3' ||
        this.checkMoreReason(data)
      ) {
        eventItem.disabled = true;
      }
    };
    var isDelete = (eventItem, data) => {
      if (data.closed || this.checkMoreReason(data)) {
        eventItem.disabled = true;
      }
    };
    var isCopy = (eventItem, data) => {
      if (data.closed || this.checkMoreReason(data)) {
        eventItem.disabled = true;
      }
    };
    var isEdit = (eventItem, data) => {
      if (data.closed || this.checkMoreReason(data)) {
        eventItem.disabled = true;
      }
    };
    var isClosed = (eventItem, data) => {
      eventItem.disabled =
        data.closed ||
        data.status == '1' ||
        data.status == '3' ||
        this.checkMoreReason(data);
    };
    var isOpened = (eventItem, data) => {
      eventItem.disabled =
        !data.closed ||
        data.status == '1' ||
        data.status == '3' ||
        this.checkMoreReason(data);
    };
    var isStartDay = (eventItem, data) => {
      eventItem.disabled = data.status != '1' && data.status != '3';
    };

    var isConvertLead = (eventItem, data) => {
      eventItem.disabled = data.status != '9';
    };

    var isMergeLead = (eventItem, data) => {
      eventItem.disabled = false;
    };

    functionMappings = {
      CM0205_1: isConvertLead, // convertLead
      CM0205_2: isMergeLead, // mergeLead
      CM0205_3: isDisabled,
      CM0205_4: isStartDay, // startyDay
      CM0205_5: isDisabled, // success
      CM0205_6: isDisabled, // fail
      CM0205_7: isDisabled,
      CM0205_8: isClosed,
      CM0205_9: isDisabled,
      CM0205_10: isClosed, // close lead
      CM0205_11: isOpened, // open lead
      SYS101: isDisabled,
      SYS103: isEdit,
      SYS03: isEdit,
      SYS104: isCopy,
      SYS04: isCopy,
      SYS102: isDelete,
      SYS02: isDelete,
    };

    return functionMappings[type];
  }

  checkMoreReason(tmpPermission) {
    if (
      !tmpPermission.roleMore.isReasonSuccess &&
      !tmpPermission.roleMore.isReasonFail &&
      !tmpPermission.roleMore.isMoveStage
    ) {
      return true;
    }
    return false;
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
        // this.viewDetail(e.data);
        break;
    }
  }

  dropLeads(data) {
    data.stepID = this.crrStepID;
    if (!data.edit) {
      this.notificationsService.notifyCode('SYS032');
      return;
    }
    if (data.closed) {
      this.notificationsService.notify(
        'Nhiệm vụ đã đóng, không thể chuyển tiếp! - Khanh thêm mess gấp để thay thế!',
        '2'
      );
      return;
    }

    if (this.moreFuncInstance?.length == 0) {
      this.changeDetectorRef.detectChanges();
      return;
    }
    if (data.status == '1') {
      this.notificationsService.notifyCode('DP037');
      this.changeDetectorRef.detectChanges();
      return;
    }
    if (data.status != '1' && data.status != '2') {
      this.notificationsService.notifyCode('DP038');
      this.changeDetectorRef.detectChanges();
      return;
    }

    if (
      this.kanban &&
      this.kanban.columns?.length > 0 &&
      this.dataColums.length == 0
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
            this.titleAction = this.moreFuncInstance[idx].text;
            this.moveStage(data);
          }
        } else {
          if (stepCrr?.isSuccessStep) {
            idx = this.moreFuncInstance.findIndex(
              (x) => x.functionID == 'CM0201_3'
            );
            if (idx != -1) {
              if (this.checkMoreReason(data)) {
                this.notificationsService.notifyCode('SYS032');
                return;
              }
              this.titleAction = this.moreFuncInstance[idx].text;
              this.moveReason(data, true);
            }
          } else {
            idx = this.moreFuncInstance.findIndex(
              (x) => x.functionID == 'CM0201_4'
            );
            if (idx != -1) {
              if (this.checkMoreReason(data)) {
                this.notificationsService.notifyCode('SYS032');
                return;
              }
              this.titleAction = this.moreFuncInstance[idx].text;
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

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    debugger;
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
      // Close deal
      case 'CM0205_10':
        this.openOrCloseLead(data, true);
        break;
      // Open deal
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
      case 'CM0205_9':
        //'  this.moveReason(data, false);
        break;
      // case 'CM0201_7':
      //   this.popupOwnerRoles(data);
      //   break;
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
        // }

        // });
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
    };
    let dialogCustomDeal = this.callfc.openSide(
      PopupAddLeadComponent,
      obj,
      option
    );
    dialogCustomDeal.closed.subscribe((e) => {
      if (e && e.event != null) {
        e.event.modifiedOn = new Date();
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
        var formMD = new FormModel();
        // formMD.funcID = funcIDApplyFor;
        // formMD.entityName = fun.entityName;
        // formMD.formName = fun.formName;
        // formMD.gridViewName = fun.gridViewName;
        var obj = {
          action: 'edit',
          formMD: formMD,
          titleAction: 'Chỉnh sửa tiềm năng',
          applyFor: this.applyForLead,
          processId: this.processId,
        };
        let dialogCustomDeal = this.callfc.openSide(
          PopupAddLeadComponent,
          obj,
          option
        );
        dialogCustomDeal.closed.subscribe((e) => {
          if (e && e.event != null) {
            e.event.modifiedOn = new Date();
            this.view.dataService.update(e.event).subscribe();
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
      // formMD.funcID = funcIDApplyFor;
      // formMD.entityName = fun.entityName;
      // formMD.formName = fun.formName;
      // formMD.gridViewName = fun.gridViewName;
      option.Width = '800px';
      option.zIndex = 1001;
      this.openFormLead(formMD, option, 'copy');
    });
  }

  delete(data: any) {
    //   this.cache.functionList(this.funcID).subscribe((fun) => {

    // });
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
                  this.dataSelected.status = '7';
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
  mergeLead(data) {
    let obj = {
      data,
      title: this.titleAction,
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
          // this.view.dataService.update(e.event[0]).subscribe();

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
  //#endregion

  startDay(data) {
    this.notificationsService
      .alertCode('DP033', null, ['"' + data?.leadName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          var datas = [data.recID];
          this.codxCmService.startLead(datas).subscribe((res) => {
            if (res) {
              this.dataSelected = res[0];
              this.notificationsService.notifyCode('SYS007');
              this.view.dataService.update(this.dataSelected).subscribe();
              // if (this.kanban) this.kanban.updateCard(this.dataSelected);
            }
            this.detectorRef.detectChanges();
          });
        }
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
              data.closed = check ? true : false;
              data.closedOn = check ? new Date() : data.ClosedOn;
              data.ModifiedOn = new Date();
              this.dataSelected = data;
              this.view.dataService.update(data).subscribe();
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
            nextStep: data?.nextStep,
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
              var index =
                e.event.listStep.findIndex(
                  (x) =>
                    x.stepID === instance.stepID &&
                    !x.isSuccessStep &&
                    !x.isFailStep
                ) + 1;
              var nextStep = '';
              if (index != -1) {
                if (index != e.event.listStep.length) {
                  var listStep = e.event.listStep;
                  nextStep = listStep[index]?.stepID;
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
    lead.status = isMoveSuccess ? '9' : '15';
    lead.stepID = instance.stepID;
    lead.nextStep = '';
    return lead;
  }

  popupOwnerRoles(data) {
    this.dataSelected = data;
    this.cache.functionList('DPT0402').subscribe((fun) => {
      var formMD = new FormModel();
      let dialogModel = new DialogModel();
      formMD.funcID = fun.functionID;
      formMD.entityName = fun.entityName;
      formMD.formName = fun.formName;
      formMD.gridViewName = fun.gridViewName;
      dialogModel.zIndex = 999;
      dialogModel.FormModel = formMD;
      var dataCM = {
        refID: data?.refID,
        processID: data?.processID,
        stepID: data?.stepID,
      };
      var dialog = this.callfc.openForm(
        PopupEditOwnerstepComponent,
        '',
        500,
        280,
        '',
        [null, this.titleAction, data, this.applyForLead, dataCM],
        '',
        dialogModel
      );
      dialog.closed.subscribe((e) => {
        if (e && e?.event != null) {
          this.notificationsService.notifyCode('SYS007');
          this.detectorRef.detectChanges();
        }
      });
    });
  }

  //#region event
  selectedChange(data) {
    this.dataSelected = data?.data ? data?.data : data;
    this.changeDetectorRef.detectChanges();
  }
  //#endregion
}
