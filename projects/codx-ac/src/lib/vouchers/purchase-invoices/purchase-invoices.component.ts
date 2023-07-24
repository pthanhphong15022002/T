import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CallFuncService,
  FormModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { IAcctTran } from '../sales-invoices/interfaces/IAcctTran.interface';
import { IPurchaseInvoice } from './interfaces/IPurchaseInvoice.inteface';
import { IPurchaseInvoiceLine } from './interfaces/IPurchaseInvoiceLine.interface';
import { PopAddPurchaseComponent } from './pop-add-purchase/pop-add-purchase.component';
import {
  SumFormat,
  TableColumn,
} from '../sales-invoices/models/TableColumn.model';
import { PurchaseInvoiceService } from './purchase-invoices.service';

@Component({
  selector: 'lib-purchase-invoices',
  templateUrl: './purchase-invoices.component.html',
  styleUrls: ['./purchase-invoices.component.scss'],
})
export class PurchaseinvoicesComponent
  extends UIComponent
  implements AfterViewInit, AfterViewChecked
{
  //#region Contructor
  @ViewChild('siderTemplate') siderTemplate?: TemplateRef<any>;
  @ViewChild('contentTemplate') contentTemplate?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('memoContent', { read: ElementRef })
  memoContent: ElementRef<HTMLElement>;

  views: Array<ViewModel> = [];
  button: ButtonModel = { id: 'btnAdd' };
  isFirstChange: boolean = true;
  expanding: boolean = false;
  overflowed: boolean = false;
  loading: boolean = false;
  acctLoading: boolean = false;
  master: IPurchaseInvoice;
  lines: IPurchaseInvoiceLine[] = [];
  acctTranLines: IAcctTran[][] = [[]];
  funcName: any;
  parentID: string;
  journalNo: string;
  totalAmt: any = 0;
  totalQuantity: any = 0;
  totalVat: any = 0;
  oData: any;
  itemName: any;
  lsVatCode: any;
  fmPurchaseInvoicesLines: FormModel;
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
  columns: TableColumn[];
  fmAcctTrans: FormModel = {
    entityName: 'AC_AcctTrans',
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityPer: 'AC_AcctTrans',
  };
  gvsAcctTrans: any;

  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private purchaseInvoiceService: PurchaseInvoiceService,
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

    this.fmPurchaseInvoicesLines =
      purchaseInvoiceService.fmPurchaseInvoicesLines;
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .gridViewSetup(this.fmAcctTrans.formName, this.fmAcctTrans.gridViewName)
      .subscribe((gvs) => {
        this.gvsAcctTrans = gvs;
      });

    this.cache
      .gridViewSetup(
        this.fmPurchaseInvoicesLines.formName,
        this.fmPurchaseInvoicesLines.gridViewName
      )
      .subscribe((grv) => {
        this.columns = [
          new TableColumn({
            labelName: 'Num',
            headerText: 'STT',
          }),
          new TableColumn({
            labelName: 'Item',
            headerText: grv?.ItemID?.headerText ?? 'Mặt hàng',
            footerText: 'Tổng cộng',
            footerClass: 'text-end',
          }),
          new TableColumn({
            labelName: 'Quantity',
            field: 'quantity',
            headerText: grv?.Quantity?.headerText ?? 'Số lượng',
            headerClass: 'text-end',
            footerClass: 'text-end',
            hasSum: true,
          }),
          new TableColumn({
            labelName: 'PurchasePrice',
            field: 'purcPrice',
            headerText: grv?.PurcPrice?.headerText ?? 'Đơn giá',
            headerClass: 'text-end',
          }),
          new TableColumn({
            labelName: 'NetAmt',
            field: 'netAmt',
            headerText: grv?.NetAmt?.headerText ?? 'Thành tiền',
            headerClass: 'text-end',
            footerClass: 'text-end',
            hasSum: true,
            sumFormat: SumFormat.Currency,
          }),
          new TableColumn({
            labelName: 'Vatid',
            field: 'vatAmt',
            headerText: grv?.VATID?.headerText ?? 'Thuế GTGT',
            headerClass: 'text-end pe-3',
            footerClass: 'text-end pe-3',
            hasSum: true,
            sumFormat: SumFormat.Currency,
          }),
        ];
      });

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
          template: this.siderTemplate,
          panelRightRef: this.contentTemplate,
        },
      },
    ];

    this.view.setRootNode(this.parent?.customName);
  }

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.memoContent?.nativeElement;
    this.overflowed = element?.scrollWidth > element?.offsetWidth;
  }

  ngOnDestroy() {
    this.view.setRootNode('');
  }
  //#endregion

  //#region Event
  onClickShowLess(): void {
    this.expanding = !this.expanding;
    this.detectorRef.detectChanges();
  }

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

    this.expanding = false;

    this.loading = true;
    this.lines = [];
    this.api
      .exec(
        'AC',
        'PurchaseInvoicesLinesBusiness',
        'GetLinesAsync',
        this.master.recID
      )
      .subscribe((res: any) => {
        this.lines = res;
        this.loading = false;
      });

    this.acctLoading = true;
    this.acctTranLines = [];
    this.api
      .exec(
        'AC',
        'AcctTransBusiness',
        'LoadDataAsync',
        'e973e7b7-10a1-11ee-94b4-00155d035517'
      )
      .subscribe((res: IAcctTran[]) => {
        console.log(res);
        if (res) {
          this.acctTranLines = this.groupBy(res, 'entryID');
        }

        this.acctLoading = false;
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
  loadDatadetail(data) {
    // this.api
    //   .exec('AC', 'PurchaseInvoicesLinesBusiness', 'GetAsync', [data.recID])
    //   .subscribe((res: any) => {
    //     this.purchaseInvoicesLines = res;
    //     this.loadTotal();
    //   });
  }

  groupBy(arr: any[], key: string): any[][] {
    return Object.values(
      arr.reduce((acc, current) => {
        acc[current[key]] = acc[current[key]] ?? [];
        acc[current[key]].push(current);
        return acc;
      }, {})
    );
  }
  //#endregion
}
