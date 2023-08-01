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
  caseType: string;
  applyFor: string;
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
    // if (!this.funcID) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    // }
    this.cache.functionList(this.funcID).subscribe((fun) => {
      if (fun) this.getGridViewSetup(fun.formName, fun.gridViewName);
    });

    this.executeApiCalls();
    this.processID = this.activedRouter.snapshot?.queryParams['processID'];
    if (this.processID) this.dataObj = { processID: this.processID };
  }

  onInit(): void {
    //test no chosse
    this.button = {
      id: this.btnAdd,
    };
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

    //cu ok xong xoas
    // this.funcID = this.activedRouter.snapshot.params['funcID'];
    // this.viewCrr = e?.view?.type;
    // this.changeFilter();
    // if (!this.funCrr) {
    //   this.funCrr = this.funcID;
    //   return;
    // }

    // if (this.funCrr != this.funcID) {
    //   this.funCrr = this.funcID;
    //   this.processID = this.activedRouter.snapshot?.queryParams['processID'];
    //   if (this.processID) this.dataObj = { processID: this.processID };
    //   if (this.crrFuncID != this.funcID) {
    //     this.cache.viewSettings(this.funcID).subscribe((views) => {
    //       if (views) {
    //         this.afterLoad();
    //         this.crrFuncID = this.funcID;
    //         this.views = [];
    //         let idxActive = -1;
    //         let viewOut = false;
    //         this.viewsDefault.forEach((v, index) => {
    //           let idx = views.findIndex((x) => x.view == v.type);
    //           if (idx != -1) {
    //             v.hide = false;
    //             if (v.type != this.viewCrr) v.active = false;
    //             else v.active = true;
    //             if (views[idx].isDefault) idxActive = index;
    //           } else {
    //             v.hide = true;
    //             v.active = false;
    //             if (this.viewCrr == v.type) viewOut = true;
    //           }
    //           if (v.type == 6) {
    //             v.request.dataObj = this.dataObj;
    //             v.request2.dataObj = this.dataObj;
    //           }
    //           if (
    //             !(
    //               (this.funcID == 'CM0401' || this.funcID == 'CM0402') &&
    //               v.type == '6'
    //             )
    //           )
    //             this.views.push(v);
    //           else viewOut = true;
    //         });
    //         if (!this.views.some((x) => x.active)) {
    //           if (idxActive != -1) this.views[idxActive].active = true;
    //           else this.views[0].active = true;

    //           let viewModel =
    //             idxActive != -1 ? this.views[idxActive] : this.views[0];
    //           this.view.viewActiveType = viewModel.type;
    //           this.view.viewChange(viewModel);
    //           if (viewOut) this.view.load();
    //         }
    //         if ((this.view?.currentView as any)?.kanban) {
    //           let kanban = (this.view?.currentView as any)?.kanban;
    //           let settingKanban = kanban.kanbanSetting;
    //           settingKanban.isChangeColumn = true;
    //           settingKanban.formName = this.view?.formModel?.formName;
    //           settingKanban.gridViewName = this.view?.formModel?.gridViewName;
    //           this.api
    //             .exec<any>('DP', 'ProcessesBusiness', 'GetColumnsKanbanAsync', [
    //               settingKanban,
    //               this.dataObj,
    //             ])
    //             .subscribe((resource) => {
    //               if (resource?.columns && resource?.columns.length)
    //                 kanban.columns = resource.columns;
    //               kanban.kanbanSetting.isChangeColumn = false;
    //               kanban.dataObj = this.dataObj;
    //               kanban.loadDataSource(
    //                 kanban.columns,
    //                 kanban.kanbanSetting?.swimlaneSettings,
    //                 false
    //               );
    //               kanban.refresh();
    //             });
    //         }

    //         this.detectorRef.detectChanges();
    //       }
    //     });
    //   }
    // }
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
      if ((data.closed && data.status != '1') || data.status == '1') {
        eventItem.disabled = true;
      }
    };
    var isDelete = (eventItem, data) => {
      if (data.closed) {
        eventItem.disabled = true;
      }
    };
    var isCopy = (eventItem, data) => {
      if (data.closed) {
        eventItem.disabled = true;
      }
    };
    var isEdit = (eventItem, data) => {
      if (data.closed) {
        eventItem.disabled = true;
      }
    };
    var isClosed = (eventItem, data) => {
      eventItem.disabled = data.closed || data.status == '1';
    };
    var isOpened = (eventItem, data) => {
      eventItem.disabled = !data.closed || data.status == '1';
    };
    var isStartDay = (eventItem, data) => {
      eventItem.disabled = data.status != '1';
    };
    if (this.caseType === '1') {
      functionMappings = {
        CM0401_1: isDisabled,
        CM0401_3: isDisabled,
        CM0401_4: isDisabled,
        CM0401_2: isStartDay,
        CM0401_7: isDisabled,
        CM0401_8: isClosed,
        CM0401_9: isOpened,
        SYS101: isDisabled,
        SYS103: isEdit,
        SYS03: isEdit,
        SYS104: isCopy,
        SYS04: isCopy,
        SYS102: isDelete,
        SYS02: isDelete,
      };
    } else {
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
      // trinh ký
      case 'CM0401_6':
      case 'CM0402_6':
        this.approvalTrans(data);
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
          this.startCases(data.recID, data.caseType);
        }
      });
  }
  startCases(caseId, caseType) {
    var data = [caseId, caseType];
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
    // var formMD = new FormModel();
    // formMD.funcID = fun.functionID;
    // formMD.entityName = fun.entityName;
    // formMD.formName = fun.formName;
    // formMD.gridViewName = fun.gridViewName;
    // var dataCM = {
    //   refID: data?.refID,
    //   processID: data?.processID,
    //   stepID: data?.stepID,
    //   nextStep: data?.nextStep,
    // };
    // var obj = {
    //   headerTitle: fun.defaultName,
    //   formModel: formMD,
    //   isReason: isMoveSuccess,
    //   applyFor: this.applyFor,
    //   dataCM: dataCM,
    //   stepName: data.currentStepName,
    // };
    // var dialogRevision = this.callfc.openForm(
    //   PopupMoveReasonComponent,
    //   '',
    //   800,
    //   600,
    //   '',
    //   obj
    // );
    // dialogRevision.closed.subscribe((e) => {
    //   if (e && e.event != null) {
    //     var instance = e.event?.instance;
    //     var instanceMove = e.event?.instanceMove;
    //     if (instanceMove) {
    //       var dealOld = JSON.parse(JSON.stringify(data));
    //       var dealNew = JSON.parse(JSON.stringify(data));
    //       dealOld = this.updateReasonCases(instance, dealOld);
    //       dealNew = this.convertDataInstance(
    //         dealNew,
    //         instanceMove,
    //         e.event?.nextStep
    //       );
    //       var datas = [dealOld, dealNew];
    //       this.codxCmService.moveDealReason(datas).subscribe((res) => {
    //         if (res) {
    //           data = res[0];
    //           this.view.dataService.dataSelected = data;
    //           this.view.dataService
    //             .update(this.view.dataService.dataSelected)
    //             .subscribe();
    //           this.view.dataService.add(res[1], 0).subscribe((res) => {});
    //           this.detectorRef.detectChanges();
    //         }
    //       });
    //     } else {
    //       data = this.updateReasonCases(instance, data);
    //       var datas = [data, data.customerID];
    //       this.codxCmService.updateDeal(datas).subscribe((res) => {
    //         if (res) {
    //           data = res[0];
    //           this.view.dataService.update(data).subscribe();
    //           this.detectorRef.detectChanges();
    //         }
    //       });
    //     }
    //   } else {
    //   if (this.kanban) {
    //     this.dataSelected.stepID = this.crrStepID;
    //     this.kanban.updateCard(this.dataSelected);
    //   }
    // }
    // });
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
    // if (!data.edit) {
    //   this.notificationsService.notifyCode('SYS032');
    //   return;
    // }
    // if (data.closed) {
    //   this.notificationsService.notify(
    //     'Nhiệm vụ đã đóng, không thể chuyển tiếp! - Khanh thêm mess gấp để thay thế!',
    //     '2'
    //   );
    //   return;
    // }

    // if (this.moreFuncInstance?.length == 0) {
    //   this.changeDetectorRef.detectChanges();
    //   return;
    // }
    // if (data.status == '1') {
    //   this.notificationsService.notifyCode('DP038');
    //   this.changeDetectorRef.detectChanges();
    //   return;
    // }
    // if (data.status != '1' && data.status != '2') {
    //   this.notificationsService.notifyCode('DP037');
    //   this.changeDetectorRef.detectChanges();
    //   return;
    // }

    // Alo Bao bat dk chặn
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
    var obj = {
      action: action === 'add' ? 'add' : 'copy',
      formMD: formMD,
      caseType: this.caseType,
      applyFor: this.applyFor,
      titleAction: this.titleAction,
      processID: this.processID,
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
        var obj = {
          action: 'edit',
          formMD: this.formModelCrr,
          titleAction: this.titleAction,
          applyFor: this.applyFor,
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
    });
  }

  //------------------------- Ký duyệt  ----------------------------------------//
  approvalTrans(dt) {
    if (dt?.processID) {
      this.codxCmService.getProcess(dt?.processID).subscribe((process) => {
        if (process) {
          this.codxCmService
            .getESCategoryByCategoryID(process.processNo)
            .subscribe((res) => {
              this.approvalTransAction(dt, res);
            });
        } else {
          this.notificationsService.notifyCode('DP040');
        }
      });
    } else {
      this.codxCmService
        .getESCategoryByCategoryID('ES_CM0504')
        .subscribe((res) => {
          this.approvalTransAction(dt, res);
        });
    }
  }
  approvalTransAction(data, category) {
    if (!category) {
      this.notificationsService.notifyCode('ES028');
      return;
    }
    if (category.eSign) {
      //kys soos
    } else {
      this.release(data, category);
    }
  }
  release(data: any, category: any) {
    this.codxShareService.codxReleaseDynamic(
      this.view.service,
      data,
      category,
      this.view.formModel.entityName,
      this.view.formModel.funcID,
      data?.title,
      this.releaseCallback
    );
  }
  //call Back
  releaseCallback(res: any) {
    //codxshare ko tra gi ve ca nen call api lai
    if (res?.msgCodeError) this.notificationsService.notify(res?.msgCodeError);
    else {
      this.codxCmService
        .getOneObject(this.dataSelected.recID, 'CasesBusiness')
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
                          this.codxCmService
                            .updateApproveStatus(
                              'CasesBusiness',
                              dt?.recID,
                              '0'
                            )
                            .subscribe();
                          this.notificationsService.notifyCode('SYS007');
                        } else this.notificationsService.notifyCode('SYS021');
                      });
                  }
                }
              });
          } else {
            this.notificationsService.notify(
              'Quy trình không tồn tại hoặc đã bị xóa ! Vui lòng liên hê "Khanh" để xin messcode',
              '3'
            );
          }
        });
      }
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
}
