import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  CRUDService,
  DialogModel,
  FormModel,
  UIComponent,
  Util,
} from 'codx-core';
import { ISalesInvoicesLine } from '../interfaces/ISalesInvoicesLine.interface';
import { PopupAddSalesInvoicesLineComponent } from '../popup-add-sales-invoices-line/popup-add-sales-invoices-line.component';
import { tap } from 'rxjs/operators';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-table-line-detail',
  templateUrl: './table-line-detail.component.html',
  styleUrls: ['./table-line-detail.component.css'],
})
export class TableLineDetailComponent extends UIComponent implements OnChanges {
  //#region Constructor
  @Input() salesInvoicesLines: ISalesInvoicesLine[] = [];
  @Input() maxHeight: string = '400px';
  @Input() hasMF: boolean = false;
  @Input() gvs: any;
  @Input() hiddenFields: string[] = [];
  @Input() dataService: CRUDService;
  @Output() delete = new EventEmitter<ISalesInvoicesLine>();
  @Output() update = new EventEmitter<ISalesInvoicesLine>();
  @Output() copy = new EventEmitter<ISalesInvoicesLine[]>();

  totalRow: { totalQuantity: number; totalPrice: number; totalVat: number } = {
    totalQuantity: 0,
    totalPrice: 0,
    totalVat: 0,
  };

  vats: any[] = [];
  fmSalesInvoicesLines: FormModel = {
    funcID: 'ACT0605', // này là funcID của thằng cha, lấy tạm
    entityName: 'SM_SalesInvoicesLines',
    formName: 'SalesInvoicesLines',
    gridViewName: 'grvSalesInvoicesLines',
    entityPer: 'SM_SalesInvoicesLines',
  };
  ths: { field: string; label: string }[] = [
    {
      field: 'lblNum',
      label: 'STT',
    },
    {
      field: 'lblProduct',
      label: 'Mặt hàng',
    },
    {
      field: 'lblQty',
      label: 'Số lượng',
    },
    {
      field: 'lblPrice',
      label: 'Đơn giá',
    },
    {
      field: 'lblCost',
      label: 'Thành tiền',
    },
    {
      field: 'lblTaxRate',
      label: 'Thuế suất',
    },
    {
      field: 'lblTax',
      label: 'Tiền thuế',
    },
  ];

  constructor(private injector: Injector, private acService: CodxAcService) {
    super(injector);
  }
  //#endregion

  //#region Init
  override onInit(): void {
    this.acService
      .loadComboboxData('VATCodesAC', 'BS')
      .subscribe((res) => (this.vats = res));
  }

  ngOnChanges(changes: SimpleChanges): void {
    // calculate totalRow
    this.totalRow = {
      totalQuantity: 0,
      totalPrice: 0,
      totalVat: 0,
    };
    for (const l of this.salesInvoicesLines) {
      this.totalRow.totalQuantity += l.quantity;
      this.totalRow.totalPrice += l.costAmt;
      this.totalRow.totalVat += l.vatAmt;
    }
  }
  //#endregion

  //#region Event
  onClickMF(e, data): void {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteRow(data);
        break;
      case 'SYS03':
        this.editRow(e, data);
        break;
      case 'SYS04':
        this.copyRow(e, data);
        break;
      case 'SYS002':
        this.export(data);
        break;
    }
  }
  //#endregion

  //#region Method
  editRow(e, data): void {
    console.log('editRow', data);

    this.dataService.dataSelected = data;
    this.dataService.edit(data).subscribe(() => {
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
          this.update.emit(event);
        });
    });
  }

  copyRow(e, data): void {
    console.log('copyRow', data);

    let temp: ISalesInvoicesLine = { ...data };
    temp.rowNo = this.salesInvoicesLines.length + 1;
    this.dataService.dataSelected = temp;
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
            index: this.salesInvoicesLines.length,
            gvs: this.gvs,
            action: e.text,
            hiddenFields: this.hiddenFields,
          },
          '',
          dialogModel
        )
        .closed.pipe(tap((t) => console.log(t)))
        .subscribe(({ event }) => {
          this.copy.emit(event);
        });
    });
  }

  export(data): void {}

  deleteRow(data): void {
    console.log(data);
    this.dataService.delete([data]).subscribe(() => this.delete.emit(data));
  }
  //#endregion

  //#region Function
  //#endregion
}
