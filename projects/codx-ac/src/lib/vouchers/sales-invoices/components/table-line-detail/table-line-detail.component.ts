import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
  CodxGridviewV2Component,
  DialogModel,
  FormModel,
  UIComponent,
} from 'codx-core';
import { ISalesInvoicesLine } from '../../interfaces/ISalesInvoicesLine.interface';
import { PopupAddSalesInvoicesLineComponent } from '../../popup-add-sales-invoices-line/popup-add-sales-invoices-line.component';
import { SalesInvoiceService } from '../../sales-invoices.service';

@Component({
  selector: 'lib-table-line-detail',
  templateUrl: './table-line-detail.component.html',
  styleUrls: ['./table-line-detail.component.css'],
})
export class TableLineDetailComponent extends UIComponent implements OnChanges {
  //#region Constructor
  @Input() height: number = 400;
  @Input() hasMF: boolean = false;
  @Input() gvs: any;
  @Input() transID: string;
  @Input() dataService: CRUDService;
  @Output() create = new EventEmitter();

  @ViewChild('grid', { static: true }) grid: CodxGridviewV2Component;
  @ViewChild('columnItemID', { static: true }) columnItemID: TemplateRef<any>;
  @ViewChild('columnQuantity', { static: true })
  columnQuantity: TemplateRef<any>;
  @ViewChild('columnVatid', { static: true }) columnVatid: TemplateRef<any>;

  columns: any[] = [];
  vats: any[];
  fmSalesInvoicesLines: FormModel;

  constructor(injector: Injector, salesInvoiceService: SalesInvoiceService) {
    super(injector);
    this.fmSalesInvoicesLines = salesInvoiceService.fmSalesInvoicesLines;
    this.vats = salesInvoiceService.vats;
  }
  //#endregion

  //#region Init
  override onInit(): void {
    this.columns = [
      {
        field: 'itemID',
        headerText: this.gvs?.ItemID?.headerText ?? 'Mặt hàng',
        template: this.columnItemID,
        width: 430,
      },
      {
        field: 'quantity',
        headerText: this.gvs?.Quantity?.headerText ?? 'Số lượng',
        template: this.columnQuantity,
        width: 90,
      },
      {
        field: 'salesPrice',
        headerText: this.gvs?.SalesPrice?.headerText ?? 'Đơn giá',
        width: 90,
      },
      {
        field: 'netAmt',
        headerText: this.gvs?.NetAmt?.headerText ?? 'Thành tiền',
        width: 100,
      },
      {
        field: 'vatid',
        headerText: this.gvs?.VATID?.headerText ?? 'Thuế GTGT',
        template: this.columnVatid,
        width: 100,
      },
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.transID) {
      this.grid?.dataService.load().subscribe(() => {
        this.grid.refresh();
      });
    }
  }
  //#endregion

  //#region Event
  onClickMF(e, data): void {
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

  onCreate(e): void {
    this.create.emit(e);
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
            action: e.text,
          },
          '',
          dialogModel
        )
        .closed.subscribe((res) => {
          console.log(res);
          if (res.event) {
            this.grid.refresh();
          }
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
            action: e.text,
          },
          '',
          dialogModel
        )
        .closed.subscribe(({ event }) => {
          if (event?.length > 0) {
            this.grid.refresh();
          }
        });
    });
  }

  delete(data): void {
    this.grid.deleteRow(data);
  }

  export(data): void {}
  //#endregion

  //#region Function
  //#endregion
}
