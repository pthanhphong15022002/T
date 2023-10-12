import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
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
  UIComponent,
  DataRequest,
  NotificationsService,
} from 'codx-core';
import { AnimationModel, ProgressBar } from '@syncfusion/ej2-angular-progressbar';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from 'projects/codx-ac/src/lib/codx-ac.service';

@Component({
  selector: 'lib-settledinvoices-add',
  templateUrl: './settledinvoices-add.component.html',
  styleUrls: ['./settledinvoices-add.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class SettledInvoicesAdd extends UIComponent implements OnInit {
  //#region Constructor
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  title: string;
  cashpayment: any;
  vouchers: Array<any> = [];
  gridModel: DataRequest = new DataRequest();
  invoiceDueDate: any;
  gridHeight: any = '100%';
  formModel: FormModel = {
    gridViewName: 'grvSettledInvoices',
    formName: 'SettledInvoices',
    entityName: 'AC_SettledInvoices',
  };
  mapPredicates = new Map<string, string>();
  mapDataValues = new Map<string, string>();
  subInvoices: Array<any> = [];
  predicates: string;
  dataValues: string;
  objectName:any;
  morefunction: any;
  payAmt: number = 0;
  sort:any = Array<SortModel> ;
  isInit:any = false;
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.cashpayment = dialogData.data.cashpayment;
    this.objectName = dialogData.data.objectName;
    this.title = dialogData.data.title;
    this.gridModel.pageSize = 20;
    this.gridModel.page = 1;
    this.setDefault();
  }
  //#region Constructor

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '80%', '90%');
  }

  ngAfterViewInit() {
    this.dt.detectChanges();
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setDefault(){
    this.mapPredicates.set('currencyID', 'CurrencyID = @0');
    this.mapDataValues.set('currencyID', this.cashpayment.currencyID);
    this.mapPredicates.set('objectID', 'ObjectID = @0');
    this.mapDataValues.set('objectID', this.cashpayment.objectID);
    this.payAmt = this.cashpayment.totalAmt;
    this.sort = [{ field: 'InvoiceDueDate', dir: 'asc' }];
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

  oldSelected: any = [];
  onSelected(e) {
    let data = e.data;
    if (data.settledAmt != 0) return;
    let cashDiscDate;
    let accID = this.form.formGroup.controls.accountID.value;
    if (data.unbounds) cashDiscDate = data.unbounds.cashDiscDate;
    this.acService.execApi('AC', 'SettledInvoicesBusiness', 'SettlementOneLineAsync', [
      data,
      accID,
      this.cashpayment.objectID,
      this.cashpayment.journalType,
      this.cashpayment.voucherDate,
      cashDiscDate,
      this.cashpayment.currencyID,
      this.cashpayment.exchangeRate,
      this.payAmt,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.grid.updateRow(e.rowIndex,res,false);
        if (e.rowIndexes && Array.isArray(e.rowIndexes)) {
          this.oldSelected = e.rowIndexes;
        }
        setTimeout(() => {
          if (this.isDblCLick) {
            this.isDblCLick = false;
            this.grid.gridRef.startEdit();
            this.dt.detectChanges();
          } else {
            this.grid.gridRef?.selectRows(this.oldSelected);
          }     
        },50);
      }
    })
  }

  onDeselected(e:any){
    e.data.forEach(data => {
      let index = this.grid.arrSelectedRows.findIndex(
        (x) => x.recID == data.recID
      );
      this.grid.arrSelectedRows.splice(index,1);
    }); 
    setTimeout(() => {
      this.dt.detectChanges();
    }, 100);
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

    if (field === 'currencyID' && e.data) {
      this.mapPredicates.set('currencyID', 'CurrencyID = @0');
      this.mapDataValues.set('currencyID', e.data);
    }

    if (field === 'invoiceDueDate' && typeof e.data !== 'undefined' && e.data) {
      this.mapPredicates.set('invoiceDueDate', 'InvoiceDueDate = @0');
      this.mapDataValues.set(
        'invoiceDueDate',
        new Date(e.data.toDate).toISOString()
      );
    }

    if (field === 'payType') {
      this.sort = [];
      switch (e.data) {
        case '1':
          break;
        case '2':
          this.sort = [{ field: 'InvoiceDueDate', dir: 'asc' }];
          break;
        case '3':
          this.sort = [{ field: 'InvoiceDueDate', dir: 'desc' }];
          break;
        case '4':
          this.sort = [
            { field: 'BalAmt', dir: 'asc' },
            { field: 'InvoiceDueDate', dir: 'asc' },
          ];
          break;
        case '5':
          this.sort = [
            { field: 'BalAmt', dir: 'desc' },
            { field: 'InvoiceDueDate', dir: 'asc' },
          ];
          break;
        default:
          this.sort = [];
          break;
      }
      this.gridModel.sort = this.sort;
    }
  }

  submit(type:number) {
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
    this.loadData(type);
  }

  apply() {
    let data = this.grid.arrSelectedRows;
    this.api
      .exec('AC', 'SettledInvoicesBusiness', 'SaveListSettledInvoicesAsync', [
        this.cashpayment,
        data,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.dialog.close(data);
        }
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
      this.acService.execApi('BS',
      'PaymentTermsBusiness',
      'GetListPmtAsync',
      JSON.stringify(termID)).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
        if(res){
          this.handSettledAmt(data, res);
        }
      })
    } else this.handSettledAmt(data);
  }

  close() {
    this.onDestroy();
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
          this.subInvoices = data;
          setTimeout(() => {
            this.grid.gridRef?.selectRows(indexes);
          }, 100);
        }
      }
    });
  }

  loadData(type) {
    // this.gridModel.predicate = this.morefunction.predicate;
    // this.gridModel.dataValue = this.morefunction.dataValue;
    this.gridModel.entityName = 'AC_SubInvoices';
    let accID = this.form.formGroup.controls.accountID.value;

    this.acService.execApi('AC', 'SettledInvoicesBusiness', 'LoadSettledAsync', [
      this.gridModel,
      accID,
      this.cashpayment.objectID,
      this.cashpayment.journalType,
      this.cashpayment.voucherDate,
      this.cashpayment.currencyID,
      this.cashpayment.exchangeRate,
      this.payAmt,
      type,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any) =>{
      if (res && res.length) {
        if (res[0].length > 0) {
          this.subInvoices = res[0];
          if (type == 1) {
            setTimeout(() => {
              this.grid.gridRef?.selectRows(res[2]);
            }, 100);
          }
          setTimeout(() => {
            this.grid.refresh();
          });     
          this.detectorRef.detectChanges();
        }else{
          this.notification.notifyCode('AC0027');
        }    
      }
    })
  }

  autoPay(data: []) {
    let accID = this.form.formGroup.controls.accountID.value;
    this.acService.execApi('AC', 'SettledInvoicesBusiness', 'SettlementAsync', [
      data,
      this.cashpayment,
      accID,
      this.payAmt,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res)=>{
      if (res) {
        this.subInvoices = res[0];
        setTimeout(() => {
          this.grid.gridRef?.selectRows(res[1]);
        }, 100);
      }
    })
  }
  //#endregion

  isDblCLick: boolean = false;
  onDoubleClick(e: any) {
    if (e.rowIndex) {
      this.isDblCLick = true;
      this.grid.gridRef.selectRow(e.rowIndex);
    }
  }
  actions(e: any) {
    if (e.type == 'endEdit') {
      if (this.oldSelected && this.oldSelected.length && this.grid.gridRef) {
        setTimeout(() => {
          this.grid.gridRef.selectRows(this.oldSelected);
        }, 500);
      }
    }
  }
}
