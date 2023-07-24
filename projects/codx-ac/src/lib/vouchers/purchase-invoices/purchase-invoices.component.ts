import {
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CallFuncService,
  DialogRef,
  FormModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { PurchaseInvoicesLines } from '../../models/PurchaseInvoicesLines.model';
import { IPurchaseInvoice } from './interfaces/IPurchaseInvoice.inteface';
import { PopAddPurchaseComponent } from './pop-add-purchase/pop-add-purchase.component';

@Component({
  selector: 'lib-purchase-invoices',
  templateUrl: './purchase-invoices.component.html',
  styleUrls: ['./purchase-invoices.component.scss'],
})
export class PurchaseinvoicesComponent extends UIComponent {
  //#region Contructor
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;

  button: ButtonModel = { id: 'btnAdd' };
  isFirstChange: boolean = true;
  funcName: any;
  parentID: string;
  journalNo: string;
  totalAmt: any = 0;
  totalQuantity: any = 0;
  totalVat: any = 0;
  master: IPurchaseInvoice;
  objectname: any;
  oData: any;
  itemName: any;
  lsVatCode: any;
  grvPurchaseInvoicesLines: any;
  fmPurchaseInvoicesLines: FormModel = {
    formName: 'PurchaseInvoicesLines',
    gridViewName: 'grvPurchaseInvoicesLines',
    entityName: 'AC_PurchaseInvoicesLines',
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
  parent: any;

  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute
  ) {
    super(inject);
    this.routerActive.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
      if (params?.parent) {
        this.cache.functionList(params.parent).subscribe((res) => {
          if (res) this.parent = res;
        });
      }
    });
    this.cache
      .gridViewSetup('PurchaseInvoicesLines', 'grvPurchaseInvoicesLines')
      .subscribe((res) => {
        if (res) {
          this.grvPurchaseInvoicesLines = res;
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
      this.funcName = res.defaultName;
    });

    this.views = [
      {
        type: ViewType.grid,
        active: false,
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

    this.view.setRootNode(this.parent?.customName);
  }

  ngOnDestroy() {
    this.view.setRootNode('');
  }
  //#endregion

  //#region Event
  onClickMF(e, data) {
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

  onClickAdd(e) {
    this.view.dataService
      .addNew(() =>
        this.api.exec('AC', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
          this.journalNo,
        ])
      )
      .subscribe((res: any) => {
        if (res) {
          let options = new SidebarModel();
          options.DataService = this.view.dataService;
          options.FormModel = this.view.formModel;
          options.isFull = true;

          this.callfc.openSide(
            PopAddPurchaseComponent,
            {
              formType: 'add',
              formTitle: `${e.text} ${this.funcName}`,
            },
            options,
            this.view.funcID
          );
        }
      });
  }
  //#endregion

  //#region Method
  setDefault(o) {
    return this.api.exec('AC', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }

  edit(e, data) {
    const copiedData = { ...data };
    this.view.dataService.dataSelected = copiedData;
    this.view.dataService.edit(copiedData).subscribe((res: any) => {
      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.callfunc
        .openSide(
          PopAddPurchaseComponent,
          {
            formType: 'edit',
            formTitle: `${e.text} ${this.funcName}`,
          },
          options,
          this.view.funcID
        )
        .closed.subscribe((res) => {
          if (res.event != null) {
            if (res.event['update']) {
              this.master = res.event['data'];
              this.loadDatadetail(this.master);
            }
          }
        });
    });
  }

  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy((o) => this.setDefault(o))
      .subscribe((res: any) => {
        if (res) {
          var obj = {
            formType: 'add',
            formTitle: `${e.text} ${this.funcName}`,
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.isFull = true;
          this.callfunc.openSide(
            PopAddPurchaseComponent,
            obj,
            option,
            this.view.funcID
          );
        }
      });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true).subscribe((res: any) => {
      if (res) {
        this.api
          .exec('ERM.Business.AC', 'VATInvoicesBusiness', 'DeleteAsync', [
            data.recID,
          ])
          .subscribe((res: any) => {});
      }
    });
  }
  //#endregion

  //#region Function
  onSelectChange(e) {
    console.log('onChange', e);

    if (e.data.error?.isError) {
      return;
    }

    this.master = e.data.data ?? e.data;
    if (!this.master) {
      return;
    }

    // prevent this function from being called twice on the first run
    if (this.isFirstChange) {
      this.isFirstChange = false;
      return;
    }

    this.loadDatadetail(this.master);
  }

  loadDatadetail(data) {
    this.api
      .exec('AC', 'ObjectsBusiness', 'LoadDataAsync', [data.objectID])
      .subscribe((res: any) => {
        if (res != null) {
          this.objectname = res[0]?.objectName;
        }
      });

    // this.api
    //   .exec('AC', 'PurchaseInvoicesLinesBusiness', 'GetAsync', [data.recID])
    //   .subscribe((res: any) => {
    //     this.purchaseInvoicesLines = res;
    //     this.loadTotal();
    //   });
  }

  loadTotal() {
    this.totalAmt = 0;
    this.totalQuantity = 0;
    this.totalVat = 0;
    this.purchaseInvoicesLines.forEach((item) => {
      if (item) {
        this.totalQuantity += item.quantity;
        this.totalAmt += item.netAmt;
        this.totalVat += item.vatAmt;
      }
    });
  }
  //#endregion
}
