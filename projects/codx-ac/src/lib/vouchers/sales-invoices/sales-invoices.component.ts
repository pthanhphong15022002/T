import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  DataRequest,
  FormModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { ISalesInvoice } from './interfaces/ISalesInvoice.interface';
import { ISalesInvoicesLine } from './interfaces/ISalesInvoicesLine.interface';
import { SumFormat, TableColumn } from './models/TableColumn.model';
import { PopupAddSalesInvoiceComponent } from './popup-add-sales-invoice/popup-add-sales-invoice.component';
import { SalesInvoiceService } from './sales-invoices.service';
import { IAcctTran as IAcctTran } from './interfaces/IAcctTran.interface';

@Component({
  selector: 'lib-sales-invoices',
  templateUrl: './sales-invoices.component.html',
  styleUrls: ['./sales-invoices.component.scss'],
})
export class SalesInvoicesComponent
  extends UIComponent
  implements AfterViewInit, AfterViewChecked
{
  //#region Constructor
  @ViewChild('moreTemplate') moreTemplate?: TemplateRef<any>;
  @ViewChild('sider') sider?: TemplateRef<any>;
  @ViewChild('content') content?: TemplateRef<any>;
  @ViewChild('memoContent', { read: ElementRef })
  memoContent: ElementRef<HTMLElement>;

  views: Array<ViewModel> = [];
  btnAdd = {
    id: 'btnAdd',
  };
  functionName: string;
  journalNo: string;
  master: ISalesInvoice;
  lines: ISalesInvoicesLine[] = [];
  acctTranLines: IAcctTran[][] = [[]];
  gvsSalesInvoicesLines: any;
  vats: any[] = [];
  tabControl: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];
  parent: any;
  loading: boolean = false;
  acctLoading: boolean = false;
  overflowed: boolean = false;
  expanding: boolean = false;

  fmSalesInvoicesLines: FormModel;
  fmAcctTrans: FormModel = {
    entityName: 'AC_AcctTrans',
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityPer: 'AC_AcctTrans',
  };

  columns: TableColumn[];
  accountingColumns: TableColumn[];

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private salesInvoiceService: SalesInvoiceService
  ) {
    super(inject);

    this.router.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
      if (params?.parent) {
        this.cache.functionList(params.parent).subscribe((res) => {
          if (res) this.parent = res;
        });
      }
    });

    this.vats = salesInvoiceService.vats;
    this.fmSalesInvoicesLines = salesInvoiceService.fmSalesInvoicesLines;
    this.gvsSalesInvoicesLines = salesInvoiceService.gvsSalesInvoicesLines;
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.columns = [
      new TableColumn({
        labelName: 'Num',
        headerText: 'STT',
      }),
      new TableColumn({
        labelName: 'Item',
        headerText:
          this.gvsSalesInvoicesLines?.ItemID?.headerText ?? 'Mặt hàng',
        footerText: 'Tổng cộng',
        footerClass: 'text-end',
      }),
      new TableColumn({
        labelName: 'Quantity',
        field: 'quantity',
        headerText:
          this.gvsSalesInvoicesLines?.Quantity?.headerText ?? 'Số lượng',
        headerClass: 'text-end',
        footerClass: 'text-end',
        hasSum: true,
      }),
      new TableColumn({
        labelName: 'SalesPrice',
        field: 'salesPrice',
        headerText:
          this.gvsSalesInvoicesLines?.SalesPrice?.headerText ?? 'Đơn giá',
        headerClass: 'text-end',
      }),
      new TableColumn({
        labelName: 'NetAmt',
        field: 'netAmt',
        headerText:
          this.gvsSalesInvoicesLines?.NetAmt?.headerText ?? 'Thành tiền',
        headerClass: 'text-end',
        footerClass: 'text-end',
        hasSum: true,
        sumFormat: SumFormat.Currency,
      }),
      new TableColumn({
        labelName: 'Vatid',
        field: 'vatAmt',
        headerText:
          this.gvsSalesInvoicesLines?.VATID?.headerText ?? 'Thuế GTGT',
        headerClass: 'text-end pe-3',
        footerClass: 'text-end pe-3',
        hasSum: true,
        sumFormat: SumFormat.Currency,
      }),
    ];

    this.cache
      .gridViewSetup(this.fmAcctTrans.formName, this.fmAcctTrans.gridViewName)
      .subscribe((gvs) => {
        this.accountingColumns = [
          new TableColumn({
            labelName: 'Num',
            headerText: 'STT',
          }),
          new TableColumn({
            labelName: 'Account',
            headerText: gvs?.AccountID?.headerText ?? 'Tài khoản',
            footerText: 'Tổng cộng',
            footerClass: 'text-end',
          }),
          new TableColumn({
            labelName: 'Debt1',
            headerText: 'Nợ',
            field: 'transAmt',
            headerClass: 'text-end',
            footerClass: 'text-end',
            hasSum: true,
            sumFormat: SumFormat.Currency,
          }),
          new TableColumn({
            labelName: 'Debt2',
            headerText: 'Có',
            field: 'transAmt',
            headerClass: 'text-end',
            footerClass: 'text-end',
            hasSum: true,
            sumFormat: SumFormat.Currency,
          }),
          new TableColumn({
            labelName: 'Memo',
            headerText: gvs?.Memo?.headerText ?? 'Ghi chú',
            headerClass: 'pe-3',
            footerClass: 'pe-3',
          }),
        ];
      });
  }

  ngAfterViewInit(): void {
    console.log(this.view);

    this.views = [
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.moreTemplate,
          frozenColumns: 1,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.sider,
          panelRightRef: this.content,
        },
      },
    ];

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      this.functionName = this.acService.toCamelCase(res.defaultName);
    });
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
  onChange(e): void {
    console.log('onChange', e);

    if (e.data.error?.isError) {
      return;
    }

    this.master = e.data.data ?? e.data;
    if (!this.master) {
      return;
    }

    this.expanding = false;

    this.loading = true;
    this.lines = [];
    this.api
      .exec(
        'SM',
        'SalesInvoicesLinesBusiness',
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
        this.acctTranLines = this.groupBy(res, 'entryID');

        // calculate totalRow
        const totalRow: { total1: number; total2: number } = {
          total1: 0,
          total2: 0,
        };
        for (const group of this.acctTranLines) {
          for (const line of group) {
            if (!line.crediting) {
              totalRow.total1 += line.transAmt;
            } else {
              totalRow.total2 += line.transAmt;
            }
          }
        }
        for (const col of this.accountingColumns) {
          if (col.labelName === 'Debt1') {
            col.sum = totalRow.total1;
          } else if (col.labelName === 'Debt2') {
            col.sum = totalRow.total2;
          }
        }

        this.acctLoading = false;
      });
  }

  onClickAdd(e): void {
    this.view.dataService
      .addNew(() =>
        this.api.exec('SM', 'SalesInvoicesBusiness', 'GetDefaultAsync', [
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
            PopupAddSalesInvoiceComponent,
            {
              formType: 'add',
              formTitle: `${e.text} ${this.functionName}`,
            },
            options,
            this.view.funcID
          );
        }
      });
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
      case 'SYS002':
        this.export(data);
        break;
    }
  }

  onClickShowLess(): void {
    this.expanding = !this.expanding;
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Method
  delete(data: ISalesInvoice): void {
    this.view.dataService.delete([data], true).subscribe((res: any) => {
      console.log({ res });
      if (!res.error) {
        this.salesInvoiceService.deleteLinesByTransID(data.recID);
      }
    });
  }

  edit(e, data): void {
    console.log('edit', { data });

    const copiedData = { ...data };

    this.view.dataService.dataSelected = copiedData;
    this.view.dataService.edit(copiedData).subscribe((res) => {
      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.callfc.openSide(
        PopupAddSalesInvoiceComponent,
        {
          formType: 'edit',
          formTitle: `${e.text} ${this.functionName}`,
        },
        options,
        this.view.funcID
      );
    });
  }

  copy(e, data): void {
    console.log('copy', { data });

    this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res) => {
      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.callfc.openSide(
        PopupAddSalesInvoiceComponent,
        {
          formType: 'add',
          formTitle: `${e.text} ${this.functionName}`,
        },
        options,
        this.view.funcID
      );
    });
  }

  export(data) {
    var gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
    //Chưa có group
    gridModel.groupFields = 'createdBy';
    this.callfc.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [gridModel, data.recID],
      null
    );
  }
  //#endregion

  //#region Function
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
