import {
  Component,
  Injector,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CRUDService, DialogModel, FormModel, UIComponent } from 'codx-core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CodxAcService } from '../../../codx-ac.service';
import { ISalesInvoicesLine } from '../interfaces/ISalesInvoicesLine.interface';
import { PopupAddSalesInvoicesLineComponent } from '../popup-add-sales-invoices-line/popup-add-sales-invoices-line.component';
import { SalesInvoiceService } from '../sales-invoices.service';

@Component({
  selector: 'lib-table-line-detail',
  templateUrl: './table-line-detail.component.html',
  styleUrls: ['./table-line-detail.component.css'],
})
export class TableLineDetailComponent extends UIComponent {
  //#region Constructor
  @Input() height: number = 400;
  @Input() hasMF: boolean = false;
  @Input() hiddenFields: string[] = [];
  @Input() dataService: CRUDService;
  @Input() gvs: any;
  @Input() transID: string;

  @ViewChild('columnItemID', { static: true }) columnItemID: TemplateRef<any>;
  @ViewChild('columnQuantity', { static: true })
  columnQuantity: TemplateRef<any>;
  @ViewChild('columnVatid', { static: true }) columnVatid: TemplateRef<any>;

  columns: any[] = [];
  vats$: Observable<any[]>;
  fmSalesInvoicesLines: FormModel;

  constructor(
    injector: Injector,
    private acService: CodxAcService,
    salesInvoiceService: SalesInvoiceService
  ) {
    super(injector);
    this.fmSalesInvoicesLines = salesInvoiceService.fmSalesInvoicesLines;
  }
  //#endregion

  //#region Init
  override onInit(): void {
    this.vats$ = this.acService.loadComboboxData('VATCodesAC', 'BS');

    this.columns = [
      {
        field: 'rowNo',
        headerText: this.gvs?.RowNo?.headerText ?? 'STT',
        width: 55,
      },
      {
        field: 'itemID',
        headerText: this.gvs?.ItemID?.headerText ?? 'Mặt hàng',
        template: this.columnItemID,
        width: 500,
      },
      {
        field: 'quantity',
        headerText: this.gvs?.Quantity?.headerText ?? 'Số lượng',
        template: this.columnQuantity,
        width: 90,
      },
      {
        field: 'costPrice',
        headerText: this.gvs?.CostPrice?.headerText ?? 'Đơn giá',
        width: 90,
      },
      {
        field: 'costAmt',
        headerText: this.gvs?.CostAmt?.headerText ?? 'Thành tiền',
        width: 90,
      },
      {
        field: 'vatid',
        headerText: this.gvs?.VATID?.headerText ?? 'Thuế suất',
        template: this.columnVatid,
        width: 100,
      },
      {
        field: 'vatAmt',
        headerText: this.gvs?.VATAmt?.headerText ?? 'Tiền thuế',
        width: 90,
      },
    ];
  }
  //#endregion

  //#region Event
  onClickMF(e, data): void {
    console.log(e);

    // switch (e.functionID) {
    //   case 'SYS02':
    //     this.delete(data);
    //     break;
    //   case 'SYS03':
    //     this.edit(e, data);
    //     break;
    //   case 'SYS04':
    //     this.copy(e, data);
    //     break;
    //   case 'SYS002':
    //     this.export(data);
    //     break;
    // }
  }
  //#endregion

  //#region Method
  edit(e, data): void {
    console.log('editRow', data);

    const copiedData: ISalesInvoicesLine = { ...data };

    this.dataService.dataSelected = copiedData;
    this.dataService.edit(copiedData).subscribe(() => {
      const dialogModel = new DialogModel();
      dialogModel.FormModel = this.fmSalesInvoicesLines;
      dialogModel.DataService = this.dataService;

      this.callfc
        .openForm(
          PopupAddSalesInvoicesLineComponent,
          'This param is not working',
          500,
          700,
          '',
          {
            formType: 'edit',
            gvs: this.gvs,
            action: e.text,
            hiddenFields: this.hiddenFields,
          },
          '',
          dialogModel
        )
        .closed.pipe(tap((t) => console.log(t)))
        .subscribe(({ event }) => {
          // const index = this.salesInvoicesLines.findIndex(
          //   (l) => l.recID === event.recID
          // );
          // this.salesInvoicesLines[index] = event;
        });
    });
  }

  copy(e, data): void {
    console.log('copy', data);

    const copiedData: ISalesInvoicesLine = { ...data };

    // copiedData.rowNo = this.salesInvoicesLines.length + 1;
    this.dataService.dataSelected = copiedData;
    this.dataService.copy().subscribe(() => {
      const dialogModel = new DialogModel();
      dialogModel.FormModel = this.fmSalesInvoicesLines;
      dialogModel.DataService = this.dataService;

      this.callfc
        .openForm(
          PopupAddSalesInvoicesLineComponent,
          'This param is not working',
          500,
          700,
          '',
          {
            formType: 'add',
            // index: this.salesInvoicesLines.length,
            gvs: this.gvs,
            action: e.text,
            hiddenFields: this.hiddenFields,
          },
          '',
          dialogModel
        )
        .closed.pipe(tap((t) => console.log(t)))
        .subscribe(({ event }) => {
          // this.salesInvoicesLines = [...this.salesInvoicesLines, ...event];
        });
    });
  }

  delete(data): void {
    console.log('delete', data);

    this.dataService.delete([data]).subscribe(() => {
      // this.salesInvoicesLines = this.salesInvoicesLines.filter(
      //   (l) => l.recID !== data.recID
      // );
    });
  }

  export(data): void {}
  //#endregion

  //#region Function
  //#endregion
}
