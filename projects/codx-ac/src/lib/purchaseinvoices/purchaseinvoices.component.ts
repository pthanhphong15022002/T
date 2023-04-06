import {
  Component,
  Injector,
  OnInit,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  UIComponent,
  ViewModel,
  DialogRef,
  ButtonModel,
  CallFuncService,
  ViewType,
  FormModel,
  DialogModel,
  RequestOption,
  SidebarModel,
} from 'codx-core';
import { PopAddPurchaseComponent } from './pop-add-purchase/pop-add-purchase.component';

@Component({
  selector: 'lib-purchaseinvoices',
  templateUrl: './purchaseinvoices.component.html',
  styleUrls: ['./purchaseinvoices.component.css'],
})
export class PurchaseinvoicesComponent extends UIComponent {
  //#region Contructor
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  dialog!: DialogRef;
  button?: ButtonModel = { id: 'btnAdd' };
  headerText: any;
  funcName: any;
  parentID: string;
  width: any;
  height: any;
  innerWidth: any;
  itemSelected: any;
  objectname:any;
  tabItem: any = [
    { text: 'Thông tin chứng từ', iconCss: 'icon-info' },
    { text: 'Chi tiết bút toán', iconCss: 'icon-format_list_numbered' },
  ];
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.routerActive.queryParams.subscribe((res) => {
      if (res && res?.recID) this.parentID = res.recID;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) this.funcName = res.defaultName;
    });
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateMore,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
    ];
  }
  //#endregion

  //#region Event
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add(e);
        break;
    }
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(e, data);
        break;
    }
  }
  setDefault(o) {
    return this.api.exec('PS', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
      this.parentID,
    ]);
  }
  add(e) {
    this.headerText = this.funcName;
    this.view.dataService
      .addNew((o) => this.setDefault(o))
      .subscribe((res: any) => {
        var obj = {
          formType: 'add',
          headerText: this.headerText,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.isFull = true;
        this.dialog = this.callfunc.openSide(
          PopAddPurchaseComponent,
          obj,
          option,
          this.view.funcID
        );
      });
  }
  edit(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        var obj = {
          formType: 'edit',
          headerText: this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.isFull = true;
        this.dialog = this.callfunc.openSide(
          PopAddPurchaseComponent,
          obj,
          option,
          this.view.funcID
        );
      });
  }
  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        var obj = {
          formType: 'copy',
          headerText: this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.isFull = true;
        this.dialog = this.callfunc.openSide(
          PopAddPurchaseComponent,
          obj,
          option,
          this.view.funcID
        );
      });
  }
  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .delete([data], true, (option: RequestOption) =>
        this.beforeDelete(option, data)
      )
      .subscribe((res: any) => {
        if (res) {
          this.api
            .exec(
              'ERM.Business.PS',
              'PurchaseInvoicesLinesBusiness',
              'DeleteAsync',
              [data.recID]
            )
            .subscribe((res: any) => {
              if (res) {
                this.api
                  .exec(
                    'ERM.Business.AC',
                    'VATInvoicesBusiness',
                    'DeleteAsync',
                    [data.recID]
                  )
                  .subscribe((res: any) => {});
              }
            });
        }
      });
  }
  //#endregion

  //#region Function
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'PurchaseInvoicesBusiness';
    opt.assemblyName = 'PS';
    opt.service = 'PS';
    opt.data = data;
    return true;
  }

  clickChange(data) {
    this.itemSelected = data;
    this.api
      .exec('AC', 'ObjectsBusiness', 'LoadDataAsync',[this.itemSelected.objectID])
      .subscribe((res: any) => {
        if (res != null) {
          this.objectname = res;
        }
      });
  }
  changeDataMF() {
    this.itemSelected = this.view.dataService.dataSelected;
    this.api
      .exec('AC', 'ObjectsBusiness', 'LoadDataAsync',[this.itemSelected.objectID])
      .subscribe((res: any) => {
        if (res != null) {
          this.objectname = res;
        }
      });
  }
  //#endregion
}
