// import {
//   Component,
//   Injector,
//   Input,
//   OnChanges,
//   SimpleChanges,
// } from '@angular/core';
// import { FormModel, UIComponent } from 'codx-core';
// import { IAcctTran } from '../../interfaces/IAcctTran.interface';

// @Component({
//   selector: 'lib-table-accounting',
//   templateUrl: './table-accounting.component.html',
//   styleUrls: ['./table-accounting.component.scss'],
// })
// export class TableAccountingComponent extends UIComponent implements OnChanges {
//   //#region Constructor
//   @Input() lines: IAcctTran[][] = [[]];
//   @Input() loading: boolean = false;

//   columns: TableColumn[];
//   fmAcctTrans: FormModel = {
//     entityName: 'AC_AcctTrans',
//     formName: 'AcctTrans',
//     gridViewName: 'grvAcctTrans',
//     entityPer: 'AC_AcctTrans',
//   };

//   constructor(injector: Injector) {
//     super(injector);

//     this.columns = [
//       new TableColumn({
//         labelName: 'Num',
//         headerText: 'STT',
//       }),
//       new TableColumn({
//         labelName: 'Account',
//         headerText: 'Tài khoản',
//         footerText: 'Tổng cộng',
//         footerClass: 'text-end',
//       }),
//       new TableColumn({
//         labelName: 'Debt1',
//         headerText: 'Nợ',
//         field: 'transAmt',
//         headerClass: 'text-end',
//         footerClass: 'text-end',
//         hasSum: true,
//         sumFormat: SumFormat.Currency,
//       }),
//       new TableColumn({
//         labelName: 'Debt2',
//         headerText: 'Có',
//         field: 'transAmt',
//         headerClass: 'text-end',
//         footerClass: 'text-end',
//         hasSum: true,
//         sumFormat: SumFormat.Currency,
//       }),
//       new TableColumn({
//         labelName: 'Memo',
//         headerText: 'Ghi chú',
//         headerClass: 'pe-3',
//         footerClass: 'pe-3',
//       }),
//     ];
//   }
//   //#endregion

//   //#region Init
//   override onInit(): void {}

//   ngOnChanges(changes: SimpleChanges): void {
//     // calculate totalRow
//     const totalRow: { total1: number; total2: number } = {
//       total1: 0,
//       total2: 0,
//     };
//     for (const group of this.lines) {
//       for (const line of group) {
//         if (!line.crediting) {
//           totalRow.total1 += line.transAmt;
//         } else {
//           totalRow.total2 += line.transAmt;
//         }
//       }
//     }
//     for (const col of this.columns) {
//       if (col.labelName === 'Debt1') {
//         col.sum = totalRow.total1;
//       } else if (col.labelName === 'Debt2') {
//         col.sum = totalRow.total2;
//       }
//     }
//   }
//   //#endregion

//   //#region Event
//   //#endregion

//   //#region Method
//   //#endregion

//   //#region Function
//   //#endregion
// }
