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
  @ViewChild('casesDetail') casesDetail: CasesDetailComponent;

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
  entityName = 'CM_Cases';
  className = 'CasesBusiness';
  method = 'GetListCasesAsync';
  idField = 'recID';

  // data structure
  listCustomer: CM_Customers[] = [];

  // type of string
  customerName: string = '';
  oldIdcases: string = '';

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
  processID: any;
  colorReasonSuccess: any;
  colorReasonFail: any;
  caseType:string;
  applyFor:string;


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
      this.checkFunction(this.funcID);
    }


    this.executeApiCalls();
    // Get API
    // this.getListCustomer();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
      this.checkFunction(this.funcID);
    }
    if (changes['dataObj']) {
      this.dataObj = changes['dataObj'].currentValue;
      if (this.processID != this.dataObj?.processID) {
        this.processID = this.dataObj?.processID;
        this.reloadData();
      }
    }
  }

  onInit(): void {
    //test no chosse
    this.button = {
      id: this.btnAdd,
    };
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    }
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
  ngAfterViewInit(): void {
    if (this.dataObj) {
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
    } else
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
        //   hide: true,
        //   request2: this.resourceKanban,
        //   toolbarTemplate: this.footerButton,
        //   model: {
        //     template: this.cardKanban,
        //     template2: this.viewColumKaban,
        //     setColorHeader: true,
        //   },
        // },
      ];
    this.reloadData();
    this.changeDetectorRef.detectChanges();
  }

  reloadData() {
    if (this.view) {
      this.dataSelected = null;
      this.view.dataService.predicates = null;
      this.view.dataService.dataValues = null;
      this.view.dataObj = this.dataObj;
      this.view?.views?.forEach((x) => {
        if (x.type == 6) {
          x.request.dataObj = this.dataObj;
          x.request2.dataObj = this.dataObj;
        }
      });
      if ((this.view?.currentView as any)?.kanban) {
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
          });
      }

      if (this.processID)
        (this.view?.dataService as CRUDService)
          .setPredicates(['ProcessID==@0'], [this.processID])
          .subscribe();
    }
  }

  async executeApiCalls() {
    try {
      await this.getColorReason();
    } catch (error) {}
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


  changeView(e) {
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  changeDataMF($event, data) {
    if ($event != null && data != null) {
        this.getMore($event,data);
    }
  }

  getMore($event,data){
    for (let eventItem of $event) {
      const functionID = eventItem.functionID;
      const mappingFunction = this.getRoleMoreFunction(functionID);
      if (mappingFunction) {
        mappingFunction(eventItem, data);
      }
    }
  }

  getRoleMoreFunction(type) {
    var functionMappings;
    var isDisabled = (eventItem, data) => {
      if(data.closed || data.status == '1'){
        eventItem.disabled = true;
      }
    };
    var isClosed = (eventItem, data) => {
      eventItem.disabled = data.closed || data.status == '1';
    }
    var isOpened = (eventItem, data) => {
        eventItem.disabled = !data.closed || data.status == '1';
    }
    var isStartDay = (eventItem, data) => {
        eventItem.disabled = data.status != '1';
    }
    if(this.caseType === '1') {
      functionMappings = {
        CM0401_1: isDisabled,
        CM0401_3: isDisabled,
        CM0401_4: isDisabled,
        CM0401_2: isStartDay,
        CM0401_7: isDisabled,
        CM0401_8: isClosed,
        CM0401_9: isOpened,
        SYS101: isDisabled,
        SYS01: isDisabled,
        SYS103: isDisabled,
        SYS03: isDisabled,
        SYS104: isDisabled ,
        SYS04: isDisabled,
        SYS102: isDisabled,
        SYS02: isDisabled,
      };
    }
    else {

    }

    return functionMappings[type];

  }

  changeMF(e) {
    this.changeDataMF(e.e, e.data);
  }


  checkMoreReason(tmpPermission) {
    if (
      tmpPermission.isReasonSuccess &&
      tmpPermission.isReasonFail &&
      tmpPermission.isMoveStage
    ) {
      return true;
    }
    if (tmpPermission.isReasonSuccess) {
      return true;
    }
    if (tmpPermission.IsReasonFail) {
      return true;
    }
    if (tmpPermission.isMoveStage) {
      return true;
    }
    return false;
  }

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
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
      case 'CM0401_1':
        this.moveStage(data);
        break;
      case 'CM0401_2':
        this.handelStartDay(data);
        break;
      case 'CM0401_3':
        this.moveReason(data, true);
        break;
      case 'CM0401_4':
        this.moveReason(data, false);
        break;
      // Open cases
      case 'CM0401_8':
        this.openOrCloseCases(data, true);
        break;
      case 'CM0401_7':
        this.popupOwnerRoles(data);
        break;
      // Close cases
      case 'CM0401_9':
        this.openOrCloseCases(data, false);
        break;
      //xuất file
      case 'CM0401_5':
      case 'CM0402_5':
        this.codxCmService.exportFile(data, this.titleAction);
        break;
    }
  }

  moveStage(data: any) {
    // if (!this.isClick) {
    //   return;
    // }
    // if (listStepCbx.length == 0 || listStepCbx == null) {
    //   listStepCbx = this.listSteps;
    // }
    // this.isClick = false;
    // this.crrStepID = data.stepID;
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
            cases: data,
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
              this.codxCmService.moveStageCases(dataUpdate).subscribe((res) => {
                if (res) {
                  data = res[0];
                  this.view.dataService.update(data).subscribe();
               //   this.detailViewcases.dataSelected = data;
                  this.detectorRef.detectChanges();
                }
              });
            }
          });
        });
    });
  }
  handelStartDay(data) {
    this.notificationsService
      .alertCode('DP033', null, ['"' + data?.caseName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
           this.startCases(data.recID,data.caseType);
        }
      });
  }
  startCases(caseId, caseType){
    var data = [caseId,caseType];
    this.codxCmService.startCases(data).subscribe((res) => {
      if (res[0]) {
        this.dataSelected = res[0];
        this.notificationsService.notifyCode('SYS007');
        this.view.dataService.update(this.dataSelected).subscribe();
        if (this.kanban) this.kanban.updateCard(this.dataSelected);
      }
      this.detectorRef.detectChanges();
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
        var instance = e.event?.instance;
        var instanceMove = e.event?.instanceMove;
        if (instanceMove) {
          var dealOld = JSON.parse(JSON.stringify(data));
          var dealNew = JSON.parse(JSON.stringify(data));
          dealOld = this.updateReasonCases(instance, dealOld);
          dealNew = this.convertDataInstance(
            dealNew,
            instanceMove,
            e.event?.nextStep
          );
          var datas = [dealOld, dealNew];
          this.codxCmService.moveDealReason(datas).subscribe((res) => {
            if (res) {
              data = res[0];
              this.view.dataService.dataSelected = data;
              this.view.dataService
                .update(this.view.dataService.dataSelected)
                .subscribe();
              this.view.dataService.add(res[1], 0).subscribe((res) => {});
              this.detectorRef.detectChanges();
            }
          });
        } else {
          data = this.updateReasonCases(instance, data);
          var datas = [data, data.customerID];
          this.codxCmService.updateDeal(datas).subscribe((res) => {
            if (res) {
              data = res[0];
              this.view.dataService.update(data).subscribe();
              this.detectorRef.detectChanges();
            }
          });
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
    var datas = [data.recID, data.processID, check];
    this.notificationsService
      .alertCode('DP018', null, "'" + this.titleAction + "'")
      .subscribe((info) => {
        if (info.event.status == 'Y') {
          this.codxCmService.openOrClosedCases(datas).subscribe((res) => {
            if (res) {
              data.closed = check ? true : false;
              data.closedOn = check ? new Date() : data.ClosedOn;
              data.ModifiedOn = new Date();
              this.dataSelected = data;
              this.view.dataService.update(data).subscribe();
              this.notificationsService.notifyCode(check ? 'DP016' : 'DP017');
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
        [null, this.titleAction, data, this.applyFor, dataCM],
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


  dblClick(e, data) {}

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

  onActions(e) {
    switch (e.type) {
      // case 'drop':
      //   this.dataDrop = e.data;
      //   this.stepIdClick = JSON.parse(JSON.stringify(this.dataDrop.stepID));
      //   // xử lý data chuyển công đoạn
      //   if (this.crrStepID != this.dataDrop.stepID)
      //     this.dropcasess(this.dataDrop);

      //   break;
      // case 'drag':
      //   ///bắt data khi kéo
      //   this.crrStepID = e?.data?.stepID;

      //   break;
      case 'dbClick':
        //xư lý dbClick
        this.viewDetail(e.data);
        break;
    }
  }

  //#region Search
  searchChanged(e) {}
  //#endregion

  //#region CRUD
  add() {
    switch (this.funcID) {
      case 'CM0401': {
        //statements;
        this.addCases();
        break;
      }
      default: {
        //statements;
        break;
      }
    }
  }

  addCases() {
    this.view.dataService.addNew().subscribe((res) => {
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
      this.openFormCases(formMD, option, 'add');
    });
  }

  openFormCases(formMD, option, action) {
    var obj = {
      action: action === 'add' ? 'add' : 'copy',
      formMD: formMD,
      caseType: this.caseType,
      applyFor: this.applyFor,
      titleAction: this.titleAction,
    };
    let dialogCustomcases = this.callfc.openSide(
      PopupAddCasesComponent,
      obj,
      option
    );
    dialogCustomcases.closed.subscribe((e) => {
      if (e && e.event != null) {
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
          titleAction: 'Chỉnh sửa Phiếu ghi nhận sự cố',
        };
        let dialogCustomcases = this.callfc.openSide(
          PopupAddCasesComponent,
          obj,
          option
        );
        dialogCustomcases.closed.subscribe((e) => {
          if (e && e.event != null) {
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

      var formMD = new FormModel();
      // formMD.funcID = funcIDApplyFor;
      // formMD.entityName = fun.entityName;
      // formMD.formName = fun.formName;
      // formMD.gridViewName = fun.gridViewName;
      option.Width = '800px';
      option.zIndex = 1001;
      this.openFormCases(formMD, option, 'copy');
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

  checkFunction(funcID:any){
    if(funcID === 'CM0401') {
      this.caseType = '1';
      this.applyFor = '2';
    }
    else if(funcID === 'CM0402') {
      this.caseType = '2';
      this.applyFor = '3';
    }
  }
}
