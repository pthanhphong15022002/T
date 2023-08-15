import {
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormModel, UIComponent } from 'codx-core';
import { IAcctTran } from '../../interfaces/IAcctTran.interface';
import { SumFormat, TableColumn } from '../../models/TableColumn.model';

@Component({
  selector: 'lib-table-accounting',
  templateUrl: './table-accounting.component.html',
  styleUrls: ['./table-accounting.component.scss'],
})
export class TableAccountingComponent extends UIComponent implements OnChanges {
  //#region Constructor
  @Input() lines: IAcctTran[][] = [[]];
  @Input() loading: boolean = false;
  @Input() formModel: FormModel;
  @Input() gvs: any;

  columns: TableColumn[];
  isFirstRun: boolean = true;

  constructor(injector: Injector) {
    super(injector);
  }
  //#endregion

  //#region Init
  override onInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isFirstRun) {
      this.columns = [
        new TableColumn({
          labelName: 'Num',
          headerText: 'STT',
        }),
        new TableColumn({
          labelName: 'Account',
          headerText: this.gvs?.AccountID?.headerText ?? 'Tài khoản',
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
          headerText: this.gvs?.Memo?.headerText ?? 'Ghi chú',
          headerClass: 'pe-3',
          footerClass: 'pe-3',
        }),
      ];

      this.isFirstRun = false;
    }

    // calculate totalRow
    const totalRow: { total1: number; total2: number } = {
      total1: 0,
      total2: 0,
    };
    for (const group of this.lines) {
      for (const line of group) {
        if (!line.crediting) {
          totalRow.total1 += line.transAmt;
        } else {
          totalRow.total2 += line.transAmt;
        }
      }
    }
    for (const col of this.columns) {
      if (col.labelName === 'Debt1') {
        col.sum = totalRow.total1;
      } else if (col.labelName === 'Debt2') {
        col.sum = totalRow.total2;
      }
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
