import {
  Component,
  Injector,
  Optional,
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
  RequestOption,
  SidebarModel,
  FormModel,
} from 'codx-core';
import { PopAddPurchaseComponent } from './pop-add-purchase/pop-add-purchase.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { PurchaseInvoicesLines } from '../../models/PurchaseInvoicesLines.model';

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
  journalNo: string;
  width: any;
  height: any;
  innerWidth: any;
  itemSelected: any;
  objectname: any;
  oData: any;
  page: any = 1;
  pageSize = 5;
  itemName: any;
  lsVatCode: any;
  gridViewLines: any;
  fmPurchaseInvoicesLines: FormModel = {
    formName: 'PurchaseInvoicesLines',
    gridViewName: 'grvPurchaseInvoicesLines',
    entityName: 'PS_PurchaseInvoicesLines',
  };
  purchaseInvoicesLines: Array<PurchaseInvoicesLines> = [];
  tabItem: any = [
    { text: 'Thông tin chứng từ', iconCss: 'icon-info' },
    { text: 'Chi tiết bút toán', iconCss: 'icon-format_list_numbered' },
  ];
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.routerActive.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });
    this.cache
      .gridViewSetup('PurchaseInvoicesLines', 'grvPurchaseInvoicesLines')
      .subscribe((res) => {
        if (res) {
          this.gridViewLines = res;
        }
      });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.api
      .exec('AC', 'ObjectsBusiness', 'LoadDataAsync')
      .subscribe((res: any) => {
        if (res != null) {
          this.oData = res;
        }
      });
    this.api
      .exec('IV', 'ItemsBusiness', 'LoadAllDataAsync')
      .subscribe((res: any) => {
        if (res != null) {
          this.itemName = res;
        }
      });
    this.api
      .exec('BS', 'VATCodesBusiness', 'LoadAllDataAsync')
      .subscribe((res: any) => {
        if (res != null) {
          this.lsVatCode = res;
        }
      });
  }

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
      this.journalNo,
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
      .copy((o) => this.setDefault(o))
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
    this.loadDatadetail(data);
  }
  changeDataMF() {
    this.itemSelected = this.view.dataService.dataSelected;
    this.loadDatadetail(this.itemSelected);
  }
  loadDatadetail(data) {
    this.api
      .exec('AC', 'ObjectsBusiness', 'LoadDataAsync', [data.objectID])
      .subscribe((res: any) => {
        if (res != null) {
          this.objectname = res[0].objectName;
        }
      });
    this.api
      .exec('PS', 'PurchaseInvoicesLinesBusiness', 'GetAsync', [data.recID])
      .subscribe((res: any) => {
        this.purchaseInvoicesLines = res;
      });
  }
  //#endregion
}
