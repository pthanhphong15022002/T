import {
  AfterViewInit,
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
  ButtonModel,
  CacheService,
  FormModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddCrmcontactsComponent } from './popup-add-crmcontacts/popup-add-crmcontacts.component';
import { CrmcustomerDetailComponent } from './crmcustomer-detail/crmcustomer-detail.component';
import { PopupAddCrmcustomerComponent } from './popup-add-crmcustomer/popup-add-crmcustomer.component';

@Component({
  selector: 'codx-crmcustomer',
  templateUrl: './crmcustomer.component.html',
  styleUrls: ['./crmcustomer.component.css'],
})
export class CrmCustomerComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
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
  @ViewChild('customerDetail') customerDetail: CrmcustomerDetailComponent;
  @ViewChild('itemContactName', { static: true })
  itemContactName: TemplateRef<any>;
  @ViewChild('itemMoreFunc', { static: true })
  itemMoreFunc: TemplateRef<any>;
  @ViewChild('itemFields', { static: true })
  itemFields: TemplateRef<any>;
  dataObj?: any;
  columnGrids = [];
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  // showButtonAdd = false;
  button?: ButtonModel;
  dataSelected: any;
  //region Method
  funcID = '';
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Customers';
  className = 'CustomersBusiness';
  method = 'GetListCRMLAsync';
  idField = 'recID';
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
    private activedRouter: ActivatedRoute
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

    this.router.params.subscribe((param: any) => {
      if (param.funcID) {
        this.funcID = param.funcID;
        this.afterLoad();
      }
    });
  }
  ngAfterViewInit(): void {
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
    //           width: 30,
    //           template: this.itemMoreFunc,
    //         },
    //       ];
    //       this.views.push({
    //         sameData: true,
    //         type: ViewType.grid,
    //         model: {
    //           resources: this.columnGrids,
    //           hideMoreFunc: true,
    //         },
    //       });
    //       this.detectorRef.detectChanges();
    //     });
    // } else if (this.funcID == 'CM0102') {
    //   this.cacheSv
    //     .gridViewSetup(formModel?.formName, formModel?.gridViewName)
    //     .subscribe((gv) => {
    //       this.columnGrids = [
    //         {
    //           field: 'contactName',
    //           headerText: gv
    //             ? gv['ContactName']?.headerText || 'Họ tên'
    //             : 'Họ tên',
    //           width: 250,
    //           template: this.itemContactName,
    //         },
    //         {
    //           field: 'phone',
    //           headerText: gv
    //             ? gv['Phone']?.headerText || 'Điện thoại'
    //             : 'Điện thoại',
    //           template: this.itemPhone,
    //           width: 250,
    //         },
    //         {
    //           field: 'email',
    //           headerText: gv ? gv['Email']?.headerText || 'Email' : 'Email',
    //           template: this.itemEmail,
    //           width: 250,
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
    //       this.views.push({
    //         sameData: true,
    //         type: ViewType.grid,
    //         model: {
    //           resources: this.columnGrids,
    //           hideMoreFunc: true,
    //         },
    //       });
    //       this.detectorRef.detectChanges();
    //     });
    // } else if (this.funcID == 'CM0103') {
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
    //           field: 'fields',
    //           headerText: gv
    //             ? gv['Fields']?.headerText || 'Lĩnh vực'
    //             : 'Lĩnh vực',
    //           template: this.itemFields,
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
    //           width: 30,
    //           template: this.itemMoreFunc,
    //         },
    //       ];
    //       this.views.push({
    //         sameData: true,
    //         type: ViewType.grid,
    //         model: {
    //           resources: this.columnGrids,
    //         },
    //       });
    //       this.detectorRef.detectChanges();
    //     });
    // }
    this.view.dataService.methodSave = 'AddCrmAsync';

    this.detectorRef.detectChanges();
  }

  onLoading(e) {
    // this.afterLoad();
  }

  viewChanged(e) {
    console.log(e);
  }

  changeView(e) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    if (this.crrFuncID != this.funcID) {
      this.afterLoad();
      this.crrFuncID = this.funcID;
    }
  }

  afterLoad() {
    this.showButtonAdd = ['CM0101', 'CM0102', 'CM0103', 'CM0104'].includes(
      this.funcID
    );
    this.cache.functionList(this.funcID).subscribe((fun) => {
      var formMD = new FormModel();
      this.entityName = fun.entityName;
      formMD.entityName = fun.entityName;
      formMD.formName = fun.formName;
      formMD.gridViewName = fun.gridViewName;
      this.view.formModel = formMD;
    });
    this.detectorRef.detectChanges();
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
        option.Width = '800px';
        this.titleAction =
          this.titleAction + ' ' + this.view?.function.customName;
        var dialog = this.callfc.openSide(
          this.funcID == 'CM0101' ||
            this.funcID == 'CM0103' ||
            this.funcID == 'CM0104'
            ? PopupAddCrmcustomerComponent
            : PopupAddCrmcontactsComponent,
          ['add', this.titleAction],
          option
        );
        dialog.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();
        });
      });
    });
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        this.cache.functionList(this.funcID).subscribe((fun) => {
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          var formMD = new FormModel();
          formMD.entityName = fun.entityName;
          formMD.formName = fun.formName;
          formMD.gridViewName = fun.gridViewName;
          formMD.funcID = this.funcID;
          option.FormModel = JSON.parse(JSON.stringify(formMD));
          option.Width = '800px';
          this.titleAction =
            this.titleAction + ' ' + this.view?.function.customName;
          var dialog = this.callfc.openSide(
            this.funcID == 'CM0101' ||
              this.funcID == 'CM0103' ||
              this.funcID == 'CM0104'
              ? PopupAddCrmcustomerComponent
              : PopupAddCrmcontactsComponent,
            ['edit', this.titleAction],
            option
          );
        });
      });
  }

  copy(data) {}
  //#endregion

  //#region event
  selectedChange(data) {
    this.dataSelected = data?.data ? data?.data : data;
    this.detectorRef.detectChanges();
  }
  //#endregion

  getNameCrm(data){
    if(this.funcID == "CM0101"){
      return data.customerName;
    }else if(this.funcID == "CM0102"){
      return data.contactName;
    }else if(this.funcID == "CM0103"){
      return data.partnerName;
    }else{
      return data.opponentName;
    }
  }

}
