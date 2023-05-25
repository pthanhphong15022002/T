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

@Component({
  selector: 'lib-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss'],
})
export class DealsComponent
  extends UIComponent
  implements OnInit, AfterViewInit, OnChanges
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
  crrFuncID = '';
  viewMode = 2;
  // const set value
  readonly btnAdd: string = 'btnAdd';
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  hideMoreFC = false;
  listHeader: any;
  colorReasonSuccess: any;
  colorReasonFail: any;
  processID: any;

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

    this.executeApiCalls();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataObj']) {
      this.dataObj = changes['dataObj'].currentValue;
      if (this.processID != this.dataObj?.processID) {
        this.processID = this.dataObj?.processID;
      
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
              kanban.loadDataSource(
                kanban.columns,
                kanban.kanbanSetting?.swimlaneSettings,
                false
              );
              kanban.refresh();
            });
        }
        (this.view?.dataService as CRUDService)
        .setPredicates(['ProcessID==@0'], [this.processID])
        .subscribe();
      }
    }
  }

  onInit(): void {
    this.afterLoad();

    this.button = {
      id: this.btnAdd,
    };

    this.detectorRef.detectChanges();
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

  ngAfterViewInit(): void {
    this.crrFuncID = this.funcID;
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
    this.changeDetectorRef.detectChanges();
  }

  changeView(e) {
    // this.afterLoad();
    if (e?.view.type == 6) {
      if (this.kanban) (this.view.currentView as any).kanban = this.kanban;
      else this.kanban = (this.view.currentView as any).kanban;
      // if (this.dataObj && this.dataObj.processID != this.processID) {
      //   this.processID = this.dataObj.processID;
      //   if (!this.kanban.kanbanSetting) {
      //     this.cache.viewSettings(this.funcID).subscribe((res) => {
      //       if (res) {
      //         let viewKanban = res.filter((x) => x.view == 6);
      //         if (viewKanban) {
      //           let settingKanban = JSON.parse(viewKanban.setting);
      //           this.changeColumns(settingKanban);
      //         }
      //       }
      //     });
      //   } else this.changeColumns(this.kanban.kanbanSetting);
      // }
    }
    // this.funcID = this.activedRouter.snapshot.params['funcID'];
    // if (this.crrFuncID != this.funcID) {
    //   this.crrFuncID = this.funcID;
    // }
  }
  changeColumns(settingKanban) {
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
          this.kanban.columns = resource.columns;
        this.kanban.kanbanSetting.isChangeColumn = false;
        this.kanban.loadDataSource(
          this.kanban.columns,
          this.kanban.kanbanSetting?.swimlaneSettings,
          false
        );

        this.kanban.refresh();
      });
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
      if (data.status == '1') {
        for (let more of $event) {
          switch (more.functionID) {
            case 'SYS01':
            case 'SYS101':
            case 'CM0201_1':
            case 'CM0201_3':
            case 'CM0201_4':
              more.disabled = true;
              break;
            case 'SYS03':
            case 'SYS04':
            case 'SYS02':
            case 'CM0201_2':
              more.isblur = false;
              break;
            default:
              more.isblur = true;
          }
        }
      } else {
        for (let more of $event) {
          switch (more.functionID) {
            case 'CM0201_1':
              if (this.checkMoreReason(data.permission) || data.closed) {
                more.disabled = true;
              }
              break;
            case 'CM0201_3':
              if (this.checkMoreReason(data.permission) || data.closed) {
                more.disabled = true;
              }
              break;
            case 'CM0201_4':
              if (this.checkMoreReason(data.permission) || data.closed) {
                more.disabled = true;
              }
              break;
            case 'CM0201_2':
              more.disabled = true;
              break;
            case 'CM0201_8':
              if (data.closed) {
                more.isblur = true;
              } else {
                more.isblur = false;
              }
              break;
            case 'CM0201_9':
              if (!data.closed) {
                more.isblur = true;
              } else {
                more.isblur = false;
              }
              break;
            case 'SYS01':
            case 'SYS03':
            case 'SYS04':
            case 'SYS02':
            case 'SYS101':
            case 'SYS102':
            case 'SYS103':
            case 'SYS104':
              if (this.checkMoreReason(data.permission) || data.closed) {
                more.disabled = true;
              }
              break;
          }
        }
      }
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
      case 'CM0201_1':
        this.moveStage(data);
        break;
      case 'CM0201_2':
        this.handelStartDay(data);
        break;
      case 'CM0201_3':
        this.moveReason(data, true);
        break;
      case 'CM0201_4':
        this.moveReason(data, false);
        break;
      // Open deal
      case 'CM0201_8':
        this.openOrCloseDeal(data, true);
        break;
      case  'CM0201_7':
        this.popupOwnerRoles(data);
        break;
      // Close deal
      case 'CM0201_9':
        this.openOrCloseDeal(data, false);
        break;
      //xuât file
      case 'CM0201_5':
        this.exportFile(data);
        break;
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
          this.startDeal(data.recID);
        }
      });
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
            deal: data,
            listStepCbx: null,
            stepIdClick: null,
            stepReason: stepReason,
            headerTitle: this.titleAction,
            listStepProccess: null,
            lstParticipants: null,
            isDurationControl: null,
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
              this.codxCmService.moveStageDeal(dataUpdate).subscribe((res) => {
                if (res) {
                  data = res[0];
                  this.view.dataService.update(data).subscribe();
                  this.detailViewDeal.dataSelected = data;
                  this.detectorRef.detectChanges();
                }
              });
              //xu ly data đổ về
              // data = e.event.instance;
              // this.listStepInstances = e.event.listStep;
              // if (e.event.isReason != null) {
              //   this.moveReason(null, data, e.event.isReason);
              // }
              // this.view.dataService.update(data).subscribe();
              // if (this.kanban) this.kanban.updateCard(data);
              // this.dataSelected = data;

              // if (this.detailViewInstance) {
              //   this.detailViewInstance.dataSelect = this.dataSelected;
              //   this.detailViewInstance.listSteps = this.listStepInstances;
              // }
            }
          });
        });
      // });
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

  openOrCloseDeal(data, check) {
    var datas = [data.recID, data.processID, check];
    this.notificationsService
      .alertCode('DP018', null, "'" + this.titleAction + "'")
      .subscribe((info) => {
        if (info.event.status == 'Y') {
          this.codxCmService.openOrClosedDeal(datas).subscribe((res) => {
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
        var instance = e.event?.instance;
        var instanceMove = e.event?.instanceMove;
        if (instanceMove) {
          var dealOld = JSON.parse(JSON.stringify(data));
          var dealNew = JSON.parse(JSON.stringify(data));
          dealOld = this.updateReasonDeal(e.event?.instance, dealOld);
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
          data = this.updateReasonDeal(e.event?.instance, data);
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

  startDeal(recId) {
    var data = [recId];
    this.codxCmService.startDeal(data).subscribe((res) => {
      if (res) {
        this.dataSelected = res[0];
        this.notificationsService.notifyCode('SYS007');
        this.view.dataService.update(this.dataSelected).subscribe();
        if (this.kanban) this.kanban.updateCard(this.dataSelected);
      }
      this.detectorRef.detectChanges();
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
        [null, this.titleAction, data,'1',dataCM],
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
    switch (this.funcID) {
      case 'CM0201': {
        //statements;
        this.addDeal();
        break;
      }
      default: {
        //statements;
        break;
      }
    }
  }

  onActions(e) {}

  addDeal() {
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
      this.openFormDeal(formMD, option, 'add');
    });
  }

  openFormDeal(formMD, option, action) {
    var obj = {
      action: action === 'add' ? 'add' : 'copy',
      formMD: formMD,
      titleAction: action === 'add' ? 'Thêm cơ hội' : 'Sao chép cơ hội',
    };
    let dialogCustomDeal = this.callfc.openSide(
      PopupAddDealComponent,
      obj,
      option
    );
    dialogCustomDeal.closed.subscribe((e) => {
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
          titleAction: 'Chỉnh sửa cơ hội',
        };
        let dialogCustomDeal = this.callfc.openSide(
          PopupAddDealComponent,
          obj,
          option
        );
        dialogCustomDeal.closed.subscribe((e) => {
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
      this.oldIdDeal = data.recID;
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
      this.openFormDeal(formMD, option, 'copy');
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
    opt.methodName = 'DeletedDealAsync';
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

  //xuất file
  exportFile(dt) {
    this.codxCmService.exportFile(dt, this.titleAction);
    // this.codxCmService
    //   .getDataInstance(dt.refID)
    //   .subscribe((res) => {
    //     if (res) {
    //       let option = new DialogModel();
    //       option.zIndex = 1001;
    //       let formModel = new FormModel() ;

    //       formModel.entityName = 'DP_Instances';
    //       formModel.formName = 'DPInstances';
    //       formModel.gridViewName = 'grvDPInstances';
    //       formModel.funcID = 'DPT04';

    //       let obj = {
    //         data: res,
    //         formModel: formModel,
    //         isFormExport: true,
    //         refID: dt.processID,
    //         refType: 'DP_Processes',
    //         titleAction: this.titleAction,
    //         loaded: false,
    //       };
    //       let dialogTemplate = this.callfc.openForm(
    //         PopupSelectTempletComponent,
    //         '',
    //         600,
    //         500,
    //         '',
    //         obj,
    //         '',
    //         option
    //       );
    //     }
    //   });
  }
}
