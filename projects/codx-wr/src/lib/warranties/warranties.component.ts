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
  AuthStore,
  ButtonModel,
  CacheService,
  FormModel,
  NotificationsService,
  ResourceModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-warranties',
  templateUrl: './warranties.component.html',
  styleUrls: ['./warranties.component.css'],
})
export class WarrantiesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  // ViewChild
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;

  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail!: TemplateRef<any>;

  // extension core
  views: Array<ViewModel> = [];
  viewsDefault: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;

  // type any for view detail
  @Input() dataObj?: any;
  @Input() funcID: any;

  // region LocalVariable
  vllStatus = '';
  dataSelected: any;
  idField = 'recID';
  service = 'WR';
  assemblyName = 'ERM.Business.WR';
  entityName = 'WR_Products';
  className = 'ProductsBusiness';
  method = 'FunctionTest';
  request: ResourceModel;
  button?: ButtonModel;
  readonly btnAdd: string = 'btnAdd';
  titleAction = '';
  user: any;

  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private authStore: AuthStore
  ) {
    super(inject);
    this.user = this.authStore.get();
    // this.funcID = this.activedRouter.snapshot.params['funcID'];
    // this.loadParam();
    // this.cache.functionList(this.funcID).subscribe((f) => {
    //   this.funcIDCrr = f;
    //   this.functionModule = f.module;
    //   this.nameModule = f.customName;
    //   this.executeApiCallFunctionID(f.formName, f.gridViewName);
    // });
    // this.getColorReason();

    // this.processID = this.activedRouter.snapshot?.queryParams['processID'];
    // if (this.processID) this.dataObj = { processID: this.processID };

    // this.codxCmService.getProcessDefault('1').subscribe((res) => {
    //   if (res) {
    //     this.processIDDefault = res.recID;
    //     this.processIDKanban = res.recID;
    //   }
    // });
  }

  onInit(): void {
    this.afterLoad();
    this.button = {
      id: this.btnAdd,
    };
  }

  ngAfterViewInit(): void {
    console.log(this.view.dataService);
    this.viewsDefault = [
      {
        type: ViewType.list,
        active: false,
        sameData: true,
        model: {
          template: this.itemViewList,
        },
      },
      {
        type: ViewType.listdetail,
        active: false,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
    ];

    this.views = this.viewsDefault;
  }

  onLoading(e) {
    console.log('Not implemented');
    // if (!this.funCrr) {
    //   this.getColumsGrid(this.gridViewSetup);
    //   return;
    // }

    // this.funcID = this.activedRouter.snapshot.params['funcID'];
    // this.processID = this.activedRouter.snapshot?.queryParams['processID'];
    // if (this.processID) this.dataObj = { processID: this.processID };
    // else if (this.processIDKanban)
    //   this.dataObj = { processID: this.processIDKanban };
    // this.cache.viewSettings(this.funcID).subscribe((views) => {
    //   if (views) {
    //     this.afterLoad();
    //     this.views = [];
    //     let idxActive = -1;
    //     let viewOut = false;
    //     this.viewsDefault.forEach((v, index) => {
    //       let idx = views.findIndex((x) => x.view == v.type);
    //       if (idx != -1) {
    //         v.hide = false;
    //         if (v.type != this.viewCrr) v.active = false;
    //         else v.active = true;
    //         if (views[idx].isDefault) idxActive = index;
    //       } else {
    //         v.hide = true;
    //         v.active = false;
    //         if (this.viewCrr == v.type) viewOut = true;
    //       }
    //       if (v.type == 6) {
    //         v.request.dataObj = this.dataObj;
    //         v.request2.dataObj = this.dataObj;
    //       }
    //       //  if (!(this.funcID == 'CM0201' && v.type == '6'))
    //       this.views.push(v);
    //       //  else viewOut = true;
    //     });
    //     if (!this.views.some((x) => x.active)) {
    //       if (idxActive != -1) this.views[idxActive].active = true;
    //       else this.views[0].active = true;

    //       let viewModel =
    //         idxActive != -1 ? this.views[idxActive] : this.views[0];
    //       this.view.viewActiveType = viewModel.type;
    //       this.view.viewChange(viewModel);
    //       if (viewOut) this.view.load();
    //     }
    //     if ((this.view?.currentView as any)?.kanban) this.loadKanban();
    //   }
    // });
  }

  afterLoad() {
    this.request = new ResourceModel();
    this.request.service = 'WR';
    this.request.assemblyName = 'ERM.Business.WR';
    this.request.className = 'ProductsBusiness';
    this.request.method = 'FunctionTest';
    this.request.idField = 'recID';
    this.request.dataObj = this.dataObj;

    // this.resourceKanban = new ResourceModel();
    // this.resourceKanban.service = 'DP';
    // this.resourceKanban.assemblyName = 'DP';
    // this.resourceKanban.className = 'ProcessesBusiness';
    // this.resourceKanban.method = 'GetColumnsKanbanAsync';
    // this.resourceKanban.dataObj = this.dataObj;
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    console.log('Not implemented');
    // switch (e.functionID) {
    //   case 'SYS03':
    //     this.edit(data);
    //     break;
    //   case 'SYS04':
    //     this.copy(data);
    //     break;
    //   case 'SYS02':
    //     this.delete(data);
    //     break;
    //   case 'CM0201_1':
    //     this.moveStage(data);
    //     break;
    //   case 'CM0201_2':
    //     this.handelStartDay(data);
    //     break;
    //   case 'CM0201_3':
    //     this.moveReason(data, true);
    //     break;
    //   case 'CM0201_4':
    //     this.moveReason(data, false);
    //     break;
    //   case 'CM0201_8':
    //     this.openOrCloseDeal(data, true);
    //     break;
    //   case 'CM0201_7':
    //     this.popupOwnerRoles(data);
    //     break;
    //   case 'CM0201_9':
    //     this.openOrCloseDeal(data, false);
    //     break;
    //   case 'CM0201_5':
    //     this.exportFile(data);
    //     break;
    //   case 'CM0201_6':
    //     this.approvalTrans(data);
    //     break;
    //   case 'CM0201_12':
    //     this.confirmOrRefuse(true, data);
    //     break;
    //   case 'CM0201_13':
    //     this.confirmOrRefuse(false, data);
    //     break;
    //   case 'CM0201_14':
    //     this.openFormBANT(data);
    //     break;
    //   //cancel Aprover
    //   case 'CM0201_16':
    //     this.cancelApprover(data);
    //     break;
    //   case 'SYS002':
    //     this.exportFiles(e, data);
    //     break;

    //   case 'CM0201_15':
    //     this.popupPermissions(data);
    //     break;
    //   default:
    //     var customData = {
    //       refID: data.processID,
    //       refType: 'DP_Processes',
    //       dataSource: '', // truyen sau
    //     };
    //     this.codxShareService.defaultMoreFunc(
    //       e,
    //       data,
    //       this.afterSave.bind(this),
    //       this.view.formModel,
    //       this.view.dataService,
    //       this,
    //       customData
    //     );
    //     this.detectorRef.detectChanges();
    //     break;
    // }
  }

  changeDataMF($event, data, type = null) {
    console.log('Not implemented');
    // if ($event != null && data != null) {
    //   for (let eventItem of $event) {
    //     if (type == 11) {
    //       eventItem.isbookmark = false;
    //     }
    //     const functionID = eventItem.functionID;
    //     const mappingFunction = this.getRoleMoreFunction(functionID);
    //     mappingFunction && mappingFunction(eventItem, data);
    //   }
    // }
  }

  selectedChange(data) {
    if (data || data?.data) this.dataSelected = data?.data ? data?.data : data;
    this.changeDetectorRef.detectChanges();
  }

  changeView(e) {
    console.log('Not implemented');
    // this.funcID = this.activedRouter.snapshot.params['funcID'];
    // this.viewCrr = e?.view?.type;
    // //xu ly view fitter
    // this.changeFilter();
    // if (this.viewCrr == 6) {
    //   this.kanban = (this.view?.currentView as any)?.kanban;
    // }

    // this.processID = this.activedRouter.snapshot?.queryParams['processID'];
    // if (this.processID) this.dataObj = { processID: this.processID };
    // else if (this.processIDKanban)
    //   this.dataObj = { processID: this.processIDKanban };

    // if (this.funCrr != this.funcID) {
    //   this.funCrr = this.funcID;
    // } else if (
    //   this.funcID == 'CM0201' &&
    //   this.viewCrr == 6 &&
    //   this.processIDKanban != this.crrProcessID &&
    //   (this.view?.currentView as any)?.kanban
    // ) {
    //   this.crrProcessID = this.processIDKanban;
    //   this.dataObj = { processID: this.processIDKanban };
    //   this.view.views.forEach((x) => {
    //     if (x.type == 6) {
    //       x.request.dataObj = this.dataObj;
    //       x.request2.dataObj = this.dataObj;
    //     }
    //   });
    //   this.loadKanban();
    // }
  }

  onActions(e) {
    console.log('Not implemented');
    // switch (e.type) {
    //   case 'drop':
    //     this.dataDrop = e.data;
    //     this.stepIdClick = JSON.parse(JSON.stringify(this.dataDrop.stepID));
    //     // xử lý data chuyển công đoạn
    //     if (this.crrStepID != this.dataDrop.stepID)
    //       this.dropDeals(this.dataDrop);
    //     break;
    //   case 'drag':
    //     ///bắt data khi kéo
    //     this.crrStepID = e?.data?.stepID;
    //     break;
    //   case 'dbClick':
    //     //xư lý dbClick
    //     if (this.viewCrr != 11) this.viewDetail(e.data);
    //     else if (e?.data?.rowData) this.viewDetail(e?.data?.rowData);
    //     break;
    //   //chang fiter
    //   case 'pined-filter':
    //     this.seclectFilter(e.data);
    // }
  }

  // region CRUD
  add() {
    this.addWarranty();
  }

  addWarranty() {
    this.view.dataService.addNew().subscribe((res) => {
      console.log('Not implemented');
      // let option = new SidebarModel();
      // option.DataService = this.view.dataService;
      // option.FormModel = this.view.formModel;
      // var formMD = new FormModel();
      // option.Width = '800px';
      // option.zIndex = 1001;
      // this.view.dataService.dataSelected.currencyID = this.currencyIDDefault;
      // this.openFormDeal(formMD, option, 'add');
    });
  }
}
