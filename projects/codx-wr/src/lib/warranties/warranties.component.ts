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
  CallFuncService,
  DialogModel,
  FormModel,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupAddWarrantyComponent } from './popup-add-warranty/popup-add-warranty.component';
import { PopupUpdateReasonCodeComponent } from './popup-update-reasoncode/popup-update-reasoncode.component';

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
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;

  // type any for view detail
  @Input() dataObj?: any;
  @Input() funcID: any;

  // region LocalVariable
  viewMode = 1;
  vllStatus = '';
  dataSelected: any;
  viewCrr: any;
  request: ResourceModel;
  button?: ButtonModel = { id: 'btnAdd' };
  readonly btnAdd: string = 'btnAdd';
  funcIDCrr: any;
  titleAction = '';
  user: any;
  gridViewSetup: any;
  moreFuncInstance: any;

  // config api get data
  service = 'WR';
  assemblyName = 'ERM.Business.WR';
  entityName = 'WR_WorkOrders';
  className = 'WorkOrdersBusiness';
  method = 'GetListWorkOrdersAsync';
  idField = 'recID';
  // idField = 'recID';
  // service = 'WR';
  // assemblyName = 'ERM.Business.WR';
  // entityName = 'WR_Products';
  // className = 'ProductsBusiness';
  // method = 'GetListProductsAsync';

  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private callFc: CallFuncService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private authStore: AuthStore
  ) {
    super(inject);
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    }
    this.executeApiCalls();
    // this.loadParam();
  }

  onInit(): void {
    this.afterLoad();
    this.button = {
      id: this.btnAdd,
    };
    // this.loadViewModel();
  }

  ngAfterViewInit(): void {
    setTimeout(() => console.log(this.view.dataService), 5000);
    this.loadViewModel();
  }

  searchChanged(e) {}

  onLoading(e) {
    // this.loadViewModel();
  }

  loadViewModel() {
    this.views = [
      {
        type: ViewType.list,
        active: true,
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

    this.detectorRef.detectChanges();
  }

  afterLoad() {
    this.request = new ResourceModel();
    this.request.service = 'WR';
    this.request.assemblyName = 'ERM.Business.WR';
    this.request.className = 'WorkOrdersBusiness';
    this.request.method = 'GetListWorkOrdersAsync';
    this.request.idField = 'recID';
    this.request.dataObj = this.dataObj;

    // this.resourceKanban = new ResourceModel();
    // this.resourceKanban.service = 'DP';
    // this.resourceKanban.assemblyName = 'DP';
    // this.resourceKanban.className = 'ProcessesBusiness';
    // this.resourceKanban.method = 'GetColumnsKanbanAsync';
    // this.resourceKanban.dataObj = this.dataObj;
  }

  executeApiCalls() {
    try {
      this.getFuncID(this.funcID);
      // this.getColorReason();
      // this.getCurrentSetting();
      this.getValuelistStatus();
    } catch (error) {}
  }

  async getValuelistStatus() {
    console.log('Not implemented');
    // this.cache.valueList('CRM041').subscribe((func) => {
    //   if (func) {
    //     this.valueListStatus = func.datas
    //       .filter((x) => ['2', '3', '5', '7'].includes(x.value))
    //       .map((item) => ({
    //         text: item.text,
    //         value: item.value,
    //       }));
    //   }
    // });
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

  changeMoreMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS03':
        // this.edit(data);
        this.updateReasonCode(data);
        break;
      case 'SYS04':
        // this.copy(data);
        break;
      case 'SYS02':
        // this.delete(data);
        break;
      default:
        var customData = {
          refID: data.processID,
          refType: 'DP_Processes',
          dataSource: '', // truyen sau
        };
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this,
          customData
        );
        this.detectorRef.detectChanges();
        break;
    }
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

  async getGridViewSetup(formName, gridViewName) {
    this.cache.gridViewSetup(formName, gridViewName).subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
        this.vllStatus =
          this.gridViewSetup['Status'].referedValue ?? this.vllStatus;
        // this.vllApprove =
        //   this.gridViewSetup['ApproveStatus'].referedValue ?? this.vllApprove;
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

  selectedChange(data) {
    console.log('Not implemented');
    // if (data || data?.data) this.dataSelected = data?.data ? data?.data : data;
    // this.changeDetectorRef.detectChanges();
  }

  changeView(e) {
    // this.funcID = this.activedRouter.snapshot.params['funcID'];
    // if (this.crrFuncID != this.funcID) {
    //   this.crrFuncID = this.funcID;
    // }
    this.viewCrr = e?.view?.type;
    // if (this.viewCrr == 6) {
    //   this.kanban = (this.view?.currentView as any)?.kanban;
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

  //#region  CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      this.cache.functionList(this.funcID).subscribe((fun) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        var formMD = new FormModel();
        formMD.entityName = fun.entityName;
        formMD.formName = fun.formName;
        formMD.gridViewName = fun.gridViewName;
        formMD.funcID = this.funcID;
        option.FormModel = JSON.parse(JSON.stringify(formMD));
        option.Width = '550px';
        var obj = {
          action: 'add',
          title: this.titleAction,
        };
        var dialog = this.callfc.openSide(
          PopupAddWarrantyComponent,
          obj,
          option
        );
        dialog.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();
          if (e && e.event != null) {
            e.event.modifiedOn = new Date();
            this.dataSelected = JSON.parse(JSON.stringify(e?.event));
            this.view.dataService.update(e?.event).subscribe();
            this.detectorRef.detectChanges();
          }
        });
      });
    });
  }
  //#endregion

  //#region update reason code
  updateReasonCode(data){
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 1010;
    dialogModel.FormModel = this.view?.formModel;
    let obj = {
      title: this.titleAction,
    };
    this.callFc
      .openForm(
        PopupUpdateReasonCodeComponent,
        '',
        600,
        700,
        '',
        obj,
        '',
        dialogModel
      )
      .closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          this.detectorRef.detectChanges();
        }
      });
  }
  //#endregion
}
