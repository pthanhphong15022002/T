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
  CacheService,
  ViewType,
  SidebarModel,
  ResourceModel,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { PopupAddDealComponent } from './popup-add-deal/popup-add-deal.component';
import { CM_Customers } from '../models/cm_model';

@Component({
  selector: 'lib-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss'],
})
export class DealsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  @ViewChild('itemViewList', { static: true })
  itemViewList: TemplateRef<any>;
  @ViewChild('itemCustomerName', { static: true })
  itemCustomerName: TemplateRef<any>;
  @ViewChild('itemContact', { static: true })
  itemContact: TemplateRef<any>;
  @ViewChild('itemAddress', { static: true }) itemAddress: TemplateRef<any>;
  @ViewChild('itemPriority', { static: true }) itemPriority: TemplateRef<any>;
  @ViewChild('itemCreatedBy', { static: true }) itemCreatedBy: TemplateRef<any>;
  @ViewChild('itemCreatedOn', { static: true }) itemCreatedOn: TemplateRef<any>;
  @ViewChild('itemPhone', { static: true }) itemPhone: TemplateRef<any>;
  @ViewChild('itemEmail', { static: true }) itemEmail: TemplateRef<any>;
  @ViewChild('dealsComponent') dealsComponent: DealsComponent;
  @ViewChild('itemContactName', { static: true })
  itemContactName: TemplateRef<any>;
  @ViewChild('itemMoreFunc', { static: true })
  itemMoreFunc: TemplateRef<any>;
  @ViewChild('itemFields', { static: true })
  itemFields: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('viewColumKaban') viewColumKaban!: TemplateRef<any>;
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;

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
  entityName = 'CM_Deals';
  className = 'DealsBusiness';
  method = 'GetListDealsAsync';
  idField = 'recID';

  // data structure
  listCustomer: CM_Customers[] = [];

  // type of string
  customerName: string = '';

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
  hideMoreFC = true;
  listHeader: any;

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
    this.getListCustomer();
  }
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
  }

  onInit(): void {
     //test no chosse 
     this.dataObj = {
      processID:'327eb334-5695-468c-a2b6-98c0284d0620'
    }
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

    this.button = {
      id: this.btnAdd,
    };
   

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
        type: ViewType.list,
        sameData: true,
        model: {
          template: this.itemViewList,
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

    this.router.params.subscribe((param: any) => {
      if (param.funcID) {
        this.funcID = param.funcID;
        this.afterLoad();
      }
    });
  }

  ngAfterViewInit(): void {
    this.crrFuncID = this.funcID;
    let formModel = this.view?.formModel;
    this.columnGrids = [];
    if (this.funcID == 'CM0201') {
      this.cacheSv
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.columnGrids = [
            {
              field: 'customerName',
              headerText: gv
                ? gv['CustomerName']?.headerText || 'Tên khách hàng'
                : 'Tên khách hàng',
              width: 250,
              template: this.itemCustomerName,
            },
            {
              field: 'address',
              headerText: gv
                ? gv['Address']?.headerText || 'Địa chỉ'
                : 'Địa chỉ',
              template: this.itemAddress,
              width: 250,
            },
            {
              field: 'contact',
              headerText: gv
                ? gv['Contact']?.headerText || 'Liên hệ chính'
                : 'Liên hệ chính',
              template: this.itemContact,
              width: 250,
            },
            {
              field: 'priority',
              headerText: gv
                ? gv['Piority']?.headerText || 'Độ ưu tiên'
                : 'Độ ưu tiên',
              template: this.itemPriority,
              width: 100,
            },
            {
              field: 'createdBy',
              headerText: gv
                ? gv['CreatedBy']?.headerText || 'Người tạo'
                : 'Người tạo',
              template: this.itemCreatedBy,
              width: 100,
            },
            {
              field: 'createdOn',
              headerText: gv
                ? gv['CreatedOn']?.headerText || 'Ngày tạo'
                : 'Ngày tạo',
              template: this.itemCreatedOn,
              width: 180,
            },
            {
              width: 30,
              template: this.itemMoreFunc,
            },
          ];
          this.views.push({
            sameData: true,
            type: ViewType.grid,
            model: {
              resources: this.columnGrids,
              hideMoreFunc: true,
            },
          });
          this.changeDetectorRef.detectChanges();
        });
    }

    this.changeDetectorRef.detectChanges();
  }

  onLoading(e) {
    // this.afterLoad();
  }

  //#region  get data
  getListCustomer() {
    this.codxCmService.getListCustomer().subscribe((res) => {
      if (res) {
        this.listCustomer = res[0];
      }
    });
  }
  //#endregion

  changeView(e) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    if (this.crrFuncID != this.funcID) {
      this.afterLoad();
      this.crrFuncID = this.funcID;
    }
  }

  afterLoad() {
    // this.showButtonAdd = [
    //   'CM0201',
    //   'CM0101',
    //   'CM02',
    //   'CM0102',
    //   'CM0103',
    //   'CM0104',
    // ].includes(this.funcID);
    // let formModel = this.view?.formModel;
    // if (this.funcID == 'CM0101') {
    //   this.cacheSv
    //     .gridViewSetup(formModel?.formName, formModel?.gridViewName)
    //     .subscribe((gv) => {
    //       this.columnGrids = [
    //         {
    //           field: 'customerName',
    //           headerText: gv
    //             ? gv['CustomerName']?.headerText || 'Tên khách hàng'
    //             : 'Tên khách hàng',
    //           width: 250,
    //           template: this.itemCustomerName,
    //         },
    //         {
    //           field: 'address',
    //           headerText: gv
    //             ? gv['Address']?.headerText || 'Địa chỉ'
    //             : 'Địa chỉ',
    //           template: this.itemAddress,
    //           width: 250,
    //         },
    //         {
    //           field: 'contact',
    //           headerText: gv
    //             ? gv['Contact']?.headerText || 'Liên hệ chính'
    //             : 'Liên hệ chính',
    //           template: this.itemContact,
    //           width: 250,
    //         },
    //         {
    //           field: 'priority',
    //           headerText: gv
    //             ? gv['Piority']?.headerText || 'Độ ưu tiên'
    //             : 'Độ ưu tiên',
    //           template: this.itemPriority,
    //           width: 100,
    //         },
    //         {
    //           field: 'createdBy',
    //           headerText: gv
    //             ? gv['CreatedBy']?.headerText || 'Người tạo'
    //             : 'Người tạo',
    //           template: this.itemCreatedBy,
    //           width: 100,
    //         },
    //         {
    //           field: 'createdOn',
    //           headerText: gv
    //             ? gv['CreatedOn']?.headerText || 'Ngày tạo'
    //             : 'Ngày tạo',
    //           template: this.itemCreatedOn,
    //           width: 180,
    //         },
    //         {
    //           field: '',
    //           headerText: '',
    //           width: 30,
    //           template: this.itemMoreFunc,
    //           textAlign: 'center',
    //         },
    //       ];
    //       var i = this.views.findIndex((x) => x.type == 11);
    //       if (i != -1) {
    //         this.views[i].model.resources = this.columnGrids;
    //       }
    //       this.changeDetectorRef.detectChanges();
    //     });
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

  addDeal() {
    this.view.dataService.addNew().subscribe((res) => {
      // const funcIDApplyFor = this.process.applyFor === '1' ? 'DPT0406' : 'DPT0405';
      // const applyFor = this.process.applyFor;
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
      titleAction: action === 'add' ? 'Thêm cơ hội' : 'Copy cơ hội',
    };
    var dialogCustomField = this.callfc.openSide(
      PopupAddDealComponent,
      obj,
      option
    );
    dialogCustomField.closed.subscribe((e) => {
      if (e && e.event != null) {
        var data = e.event;
        if (this.kanban) {
          this.kanban.updateCard(data);
          if (this.kanban?.dataSource?.length == 1) {
            this.kanban.refresh();
          }
        }
        // this.dataSelected = data;
        // if (this.detailViewInstance) {
        //   this.detailViewInstance.dataSelect = this.dataSelected;
        //   this.detailViewInstance.listSteps = this.listStepInstances;
        // }

        this.detectorRef.detectChanges();
      }
    });
  }

  addPartner(funcID) {
    // this.view.dataService.addNew().subscribe((res: any) => {
    //   let option = new SidebarModel();
    //   option.DataService = this.view?.dataService;
    //   option.FormModel = this.view?.formModel;
    //   option.Width = '800px';
    //   var headerText = this.titleAction +' '+this.view?.function.description;
    //   var dataObj = {
    //     action:'add',
    //     headerText: headerText,
    //   }
    //   var dialog = this.callfc.openSide(
    //     PopupAddCrmPartnerComponent,
    //     dataObj,
    //     option
    //   );
    //   dialog.closed.subscribe((e) => {
    //     if (!e?.event) this.view.dataService.clear();
    //   });
    // });
  }

  edit(data) {
    // if (data) {
    //   this.view.dataService.dataSelected = data;
    // }
    // this.view.dataService
    //   .edit(this.view.dataService.dataSelected)
    //   .subscribe((res) => {
    //     let option = new SidebarModel();
    //     option.DataService = this.view.dataService;
    //     option.FormModel = this.view.formModel;
    //     option.Width = '800px';
    //     this.titleAction = this.titleAction +' '+this.view?.function.description;
    //     var dialog = this.callfc.openSide(
    //       this.funcID == 'CM0101'
    //         ? PopupAddCrmcustomerComponent
    //         : PopupAddCrmcontactsComponent,
    //       ['edit', this.titleAction],
    //       option
    //     );
    //   });
  }

  copy(data) {}
  //#endregion

  //#region event
  selectedChange(data) {
    this.dataSelected = data?.data ? data?.data : data;
    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  getCustomerName(customerID: any) {
    return this.listCustomer.find((x) => x.customerID === customerID)
      ?.customerName;
  }

  handleDataTmp(data) {
    return {
      customerName: this.getCustomerName(data.customerID),
    };
  }
}
