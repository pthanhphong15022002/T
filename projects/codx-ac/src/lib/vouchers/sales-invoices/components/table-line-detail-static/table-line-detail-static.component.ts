import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormModel, UIComponent } from 'codx-core';
import { ISalesInvoicesLine } from '../../interfaces/ISalesInvoicesLine.interface';
import { SalesInvoiceService } from '../../sales-invoices.service';

@Component({
  selector: 'lib-table-line-detail-static',
  templateUrl: './table-line-detail-static.component.html',
  styleUrls: ['./table-line-detail-static.component.scss'],
})
export class TableLineDetailStaticComponent
  extends UIComponent
  implements AfterViewInit, OnChanges
{
  //#region Constructor
  @Input() salesInvoicesLines: ISalesInvoicesLine[] = [];
  @Input() loading: boolean = false;

  @ViewChild('myTable') tableRef: ElementRef<HTMLElement>;

  gvs: any;
  ths: { field: string; headerText: string; class?: string }[] = [];
  totalRow: {
    totalQuantity: number;
    totalNetAmt: number;
    totalVatAmt: number;
  } = {
    totalQuantity: 0,
    totalNetAmt: 0,
    totalVatAmt: 0,
  };
  vats: any[] = [];
  fmSalesInvoicesLines: FormModel = {
    funcID: 'ACT0605', // này là funcID của thằng cha, lấy tạm
    entityName: 'SM_SalesInvoicesLines',
    formName: 'SalesInvoicesLines',
    gridViewName: 'grvSalesInvoicesLines',
    entityPer: 'SM_SalesInvoicesLines',
  };
  hasVerticalScrollbar: boolean;

  constructor(injector: Injector, salesInvoiceService: SalesInvoiceService) {
    super(injector);
    this.gvs = salesInvoiceService.gvsSalesInvoicesLines;
    this.vats = salesInvoiceService.vats;
  }
  //#endregion

  //#region Init
  override onInit(): void {
    this.ths = [
      {
        field: 'lblNum',
        headerText: 'STT',
      },
      {
        field: 'lblItem',
        headerText: this.gvs?.ItemID?.headerText ?? 'Mặt hàng',
      },
      {
        field: 'lblQuantity',
        headerText: this.gvs?.Quantity?.headerText ?? 'Số lượng',
        class: 'text-end pe-5',
      },
      {
        field: 'lblSalesPrice',
        headerText: this.gvs?.SalesPrice?.headerText ?? 'Đơn giá',
        class: 'text-end pe-5',
      },
      {
        field: 'lblNetAmt',
        headerText: this.gvs?.NetAmt?.headerText ?? 'Thành tiền',
        class: 'text-end pe-5',
      },
      {
        field: 'lblVatid',
        headerText: this.gvs?.VATID?.headerText ?? 'Thuế GTGT',
        class: 'text-end pe-5',
      },
    ];
  }

  ngAfterViewInit(): void {
    const tableElement: HTMLElement = this.tableRef.nativeElement;
    this.hasVerticalScrollbar = tableElement.offsetHeight < tableElement.scrollHeight;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // calculate totalRow
    this.totalRow = {
      totalQuantity: 0,
      totalNetAmt: 0,
      totalVatAmt: 0,
    };
    for (const line of this.salesInvoicesLines) {
      this.totalRow.totalQuantity += line.quantity;
      this.totalRow.totalNetAmt += line.netAmt;
      this.totalRow.totalVatAmt += line.vatAmt;
    }
  }
  //#endregion

  //#region Event
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
