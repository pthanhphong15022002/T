import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModel, CacheService, FormModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CrmcustomerDetailComponent } from '../crmcustomer/crmcustomer-detail/crmcustomer-detail.component';

@Component({
  selector: 'lib-opportunity',
  templateUrl: './opportunity.component.html',
  styleUrls: ['./opportunity.component.scss']
})
export class OpportunityComponent extends UIComponent
implements OnInit, AfterViewInit {

  // extension core
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;

  // type any for view detail
  funcID: any;
  dataObj?: any;

  // config api get data
  service = 'DP';
  assemblyName = 'ERM.Business.DP';
  entityName = 'DP_Processes';
  className = 'ProcessesBusiness';
  method = 'GetListProcessesAsync';
  idField = 'recID';

  @Input() showButtonAdd = false;
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
  @ViewChild('opportunityDetail') opportunityDetail: OpportunityComponent;
  @ViewChild('itemContactName', { static: true })
  itemContactName: TemplateRef<any>;
  @ViewChild('itemMoreFunc', { static: true })
  itemMoreFunc: TemplateRef<any>;
  @ViewChild('itemFields', { static: true })
  itemFields: TemplateRef<any>;
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
  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super(inject);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
  }
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
  }
  onInit(): void {
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
    ];

    // bắt sự kiện tại đây chứ k dc bắt trên viewChanged nha cu, sự kiện viewChange dc emit khi view đã đc change, k đúng với case này.
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
    debugger;
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

  changeView(e) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    if (this.crrFuncID != this.funcID) {
      this.afterLoad();
      this.crrFuncID = this.funcID;
    }
  }

  afterLoad() {
    this.showButtonAdd = ['CM0201' ,'CM0101' ,'CM02' ,'CM0102' , 'CM0103','CM0104'].includes(this.funcID);
    let formModel = this.view?.formModel;
    if (this.funcID == 'CM0101') {
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
              field: '',
              headerText: '',
              width: 30,
              template: this.itemMoreFunc,
              textAlign: 'center',
            },
          ];
          var i = this.views.findIndex((x) => x.type == 11);
          if (i != -1) {
            this.views[i].model.resources = this.columnGrids;
          }
          this.changeDetectorRef.detectChanges();
        });
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

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }

  //#region Search
  searchChanged(e) {}
  //#endregion

  //#region CRUD
  add() {
    switch(this.funcID) {
      case 'CM0101': {
         //statements;
         break;
      }
      case 'CM0102': {
         //statements;
         break;
      }
      case 'CM0103': {
        this.addPartner(this.funcID);
        //statements;
        break;
     }
     case 'CM0104': {
      //statements;
      break;
   }
    default: {
         //statements;
         break;
      }
   }
  }

  changeDataMF($event, data){

  }
  addPartner(funcID){
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

}
