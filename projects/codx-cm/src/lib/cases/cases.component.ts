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
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { PopupAddDealComponent } from '../deals/popup-add-deal/popup-add-deal.component';
import { CM_Customers } from '../models/cm_model';
import { PopupAddCaseComponent } from './popup-add-case/popup-add-case.component';

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
  processID: any;

  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService
  ) {
    super(inject);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];

    // Get API
    // this.getListCustomer();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
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

  
  

  //#region  get data
  // getListCustomer() {
  //   this.codxCmService.getListCustomer().subscribe((res) => {
  //     if (res) {
  //       this.listCustomer = res[0];
  //     }
  //   });
  // }
  //#endregion

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

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }

  changeDataMF($event, data) {}

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
      //xuất file
      case 'CM0401_5':
      case 'CM0402_5':
        this.codxCmService.exportFile(data, this.titleAction);
        break;
    }
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
      //     this.dropDeals(this.dataDrop);

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
      titleAction: 'Phiếu ghi nhận thông tin',
    };
    let dialogCustomDeal = this.callfc.openSide(
      PopupAddCaseComponent,
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
          titleAction: 'Chỉnh sửa Phiếu ghi nhận sự cố',
        };
        let dialogCustomDeal = this.callfc.openSide(
          PopupAddCaseComponent,
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
}
