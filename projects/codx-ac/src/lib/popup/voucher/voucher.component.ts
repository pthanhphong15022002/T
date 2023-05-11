import { DataRequest } from './../../../../../../src/shared/models/data.request';
import {
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  CodxFormComponent,
  CodxGridviewV2Component,
  FormModel,
  Util,
  CacheService,
  SortModel,
} from 'codx-core';

@Component({
  selector: 'lib-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.css'],
})
export class VoucherComponent implements OnInit {
  //#region Constructor
  dialog!: DialogRef;
  title: string;
  cashpayment: any;
  type: number;
  vouchers: Array<any> = [];
  gridModel: DataRequest = new DataRequest();
  invoiceDueDate: any;
  gridHeight: number = 0;
  formModel: FormModel = {
    gridViewName: 'grvAC_SubInvoices',
    formName: 'AC_SubInvoices',
    entityName: 'AC_SubInvoices',
  };
  mapPredicates = new Map<string, string>();
  mapDataValues = new Map<string, string>();
  sublegendOpen: Array<any> = [];
  predicates: string;
  dataValues: string;
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  morefunction: any;
  payAmt: number = 0;
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
    this.cashpayment = dialogData.data.cashpayment;
    this.type = dialogData.data.type;
    this.title = dialogData.data.title;
    this.gridModel.pageSize = 20;
    this.gridModel.page = 1;
  }
  //#region Constructor

  //#region Init
  ngOnInit(): void {
    this.cache
      .moreFunction('SubLedgerOpen', 'grvSubLedgerOpen')
      .subscribe((res) => {
        if (res && res.length) {
          let m = res.find((x) => x.functionID == 'ACT041005');
          if (m) {
            this.morefunction = m;
          }
        }
      });

    this.mapPredicates.set('currencyID', 'CurrencyID = @0');
    this.mapDataValues.set('currencyID', this.cashpayment.currencyID);
  }
  ngAfterViewInit() {
    let hBody, hTab;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;

    this.gridHeight = hBody - (hTab + 120);
  }
  //#endregion

  //#region Event
  payAmtEnter(e: any) {
    // let data = e.component?.value;
    // if (this.payAmt == data) return;
    // this.payAmt = data;
    // if (this.payAmt && this.payAmt > 0) this.paymentAmt();
  }

  payAmtChange(e) {
    this.payAmt = e.data;
  }

  payAmtBlur(e: any) {
    // if (this.payAmt == e.value) return;
    // this.payAmt = e.value;
  }

  valueChange(e: any) {
    let field = e.field;
    if (!e.data || typeof e.data === 'undefined') {
      this.mapPredicates.delete(field);
      this.mapDataValues.delete(field);
    }
    if (field === 'voucherType' && e.data) {
      switch (e.data) {
        case '1':
          this.mapPredicates.set('voucherType', 'InvoiceDueDate <=@0');
          this.setDate();
          break;
        case '2':
          this.mapPredicates.set('voucherType', 'InvoiceDueDate <=@0');
          this.setDate();
          break;
      }
    }

    if (field === 'mixedPayment' && e.data) {
      if (e.data) {
        this.mapPredicates.set('currencyID', 'CurrencyID = @0');
        this.mapDataValues.set('currencyID', this.cashpayment.currencyID);
      } else {
        this.mapPredicates.delete(field);
        this.mapDataValues.delete(field);
      }
    }

    if (field === 'date' && this.mapPredicates.has('voucherType') && e.data)
      this.setDate(e.data);

    if (field === 'accountID' && e.data) {
      this.mapPredicates.set('accountID', 'AccountID = @0');
      this.mapDataValues.set('accountID', e.data);
    }

    if (field === 'invoiceDueDate' && typeof e.data !== 'undefined') {
      this.mapPredicates.set('invoiceDueDate', 'InvoiceDueDate = @0');
      this.mapDataValues.set(
        'invoiceDueDate',
        new Date(e.data.toDate).toISOString()
      );
    }

    if (field === 'payType') {
      let sort: Array<SortModel> = [];
      switch (e.data) {
        case '1':
          break;
        case '2':
          sort = [{ field: 'InvoiceDueDate', dir: 'asc' }];
          break;
        case '3':
          sort = [{ field: 'InvoiceDueDate', dir: 'desc' }];
          break;
        case '4':
          sort = [
            { field: 'BalAmt', dir: 'asc' },
            { field: 'InvoiceDueDate', dir: 'asc' },
          ];
          break;
        case '5':
          sort = [
            { field: 'BalAmt', dir: 'desc' },
            { field: 'InvoiceDueDate', dir: 'asc' },
          ];
          break;
        default:
          sort = [];
          break;
      }
      this.gridModel.sort = sort;
    }
  }

  submit() {
    let predicates = Array.from(
      this.mapPredicates,
      ([name, value]) => value
    ).join('|');
    let dataValues = Array.from(
      this.mapDataValues,
      ([name, value]) => value
    ).join('|');

    this.gridModel.predicates = predicates;
    this.gridModel.dataValues = dataValues;
    this.loadData();
  }

  apply() {
    let data = this.grid.arrSelectedRows;
    this.api
      .exec<any>('AC', 'SettledInvoicesBusiness', 'ConvertSubLedgenToSettled', [
        data,
        this.cashpayment,
        this.payAmt,
      ])
      .subscribe((res) => {
        if (res && res.length) this.dialog.close(res);
      });
  }

  paymentAmt(data) {
    // let data = this.sublegendOpen;
    let termID = [];
    data.filter((x) => {
      if (x.invoiceDueDate <= this.cashpayment.voucherDate && x.pmtTermID)
        termID.push(x.pmtTermID);
    });

    if (termID) {
      this.api
        .exec<any>(
          'BS',
          'PaymentTermsBusiness',
          'GetListPmtAsync',
          JSON.stringify(termID)
        )
        .subscribe((res) => {
          if (res) this.handSettledAmt(data, res);
        });
    } else this.handSettledAmt(data);
  }

  close() {
    this.dialog.close();
  }
  //#endregion

  //#region function
  setDate(day?: any) {
    let date = new Date(this.form.formGroup.value['invoiceDueDate']);
    let aDate = (date as any).addDays(day || 0);
    this.mapDataValues.set('date', aDate.toISOString());
  }

  handSettledAmt(data = [], terms = []) {
    let pay = this.payAmt;
    let len = data.length;
    let indexes = this.grid.selectedIndexes;
    data.forEach((e: any, i: number) => {
      if (e.invoiceDueDate <= this.cashpayment.voucherDate) {
        let settled = terms.find((x) => x.pmtTermID == e.pmtTermID);
        let mustPay = e.balanceAmt;
        let settledDisc = e.settledDisc || 0;
        if (pay > 0) {
          // Tinh chiet khau
          if (
            (settled && settled.discPartial) ||
            (!settled.discPartial && e.balanceAmt == pay)
          ) {
            settledDisc = settled.discPct * e.balanceAmt;
          }

          //Tinh so tien chi tra
          mustPay = e.balanceAmt - settledDisc;

          if (pay > mustPay) {
            e.settledAmt = mustPay;
            pay -= mustPay;
          } else {
            e.settledAmt = pay;
            pay = 0;
          }
          // this.grid.gridRef.updateRow(e._rowIndex, e);
          // setTimeout(() => {
          //   this.grid.gridRef?.selectRow(e._rowIndex);
          // }, 100);
        }
        e.settledDisc = settledDisc;
        if (i == len - 1) {
          //  this.grid.gridRef.refresh();
          this.sublegendOpen = data;
          setTimeout(() => {
            this.grid.gridRef?.selectRows(indexes);
          }, 100);
        }
      }
    });
  }

  loadData() {
    this.gridModel.entityName = 'AC_SubInvoices';
    this.api
      .exec<any>(
        'AC',
        'SettledInvoicesBusiness',
        'LoadBySubInvoicesAsync',
        this.gridModel
      )
      .subscribe((res) => {
        if (res && res.length) {
          this.autoPay(res);
          //if (this.payAmt && this.payAmt > 0) this.paymentAmt(res[0]);
          //this.sublegendOpen = res[0];
        }
      });
  }

  autoPay(data: []) {
    let accID = this.form.formGroup.controls.accountID.value;
    this.api.exec<any>('AC', 'SettledInvoicesBusiness', 'SettlementAsync', [
      data,
      this.cashpayment,
      accID,
      this.payAmt,
    ]).subscribe(res=>{
console.log(res);
    });
  }
  //#endregion
}



