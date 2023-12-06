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
import { CodxAcService, fmSettledInvoices } from 'projects/codx-ac/src/lib/codx-ac.service';
import { SelectionSettingsModel } from '@syncfusion/ej2-angular-grids';

@Component({
  selector: 'lib-settledinvoices-add',
  templateUrl: './settledinvoices-add.component.html',
  styleUrls: ['./settledinvoices-add.component.css'],
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
  fmSettledInvoices:any = fmSettledInvoices;
  mapPredicates = new Map<string, string>();
  mapDataValues = new Map<string, string>();
  subInvoices: Array<any> = [];
  predicates: string;
  dataValues: string;
  objectName:any;
  isDblCLick: boolean = false;
  oldSelected: any = [];
  dataFilter:any = {};
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.cashpayment = dialogData.data.cashpayment;
    this.objectName = dialogData.data.objectName;
    this.title = dialogData.data.title;
    this.gridModel.page = 1;
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '80%', '90%'); 
    this.setDefault();
    let type = this.cashpayment.totalAmt == 0 ? 0 : 1; 
    this.getDataSubInvoice(type);
  }

  ngAfterViewInit() {}

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * *Hàm set data default
   */
  setDefault(){
    this.mapPredicates.set('currencyID', 'CurrencyID = @0');
    this.mapDataValues.set('currencyID', this.cashpayment.currencyID);
    this.mapPredicates.set('objectID', 'ObjectID = @0');
    this.mapDataValues.set('objectID', this.cashpayment.objectID);
    this.dataFilter.currencyID = this.cashpayment.currencyID;
    this.dataFilter.payAmt = this.cashpayment.totalAmt;
    this.gridModel.sort = [{ field: 'InvoiceDueDate', dir: 'asc' }];
  }
  //#endregion Init

  //#region Event
  /**
   * *Hàm chọn dòng
   * @param e 
   * @returns 
   */
  onSelected(event) {
    if (event) {
      let index = this.grid.editIndex;
      if(index == 0) this.grid.editSelectedItem = false;
      let data = event;
      if (data?.settledAmt != 0) return;
      if(!this.oldSelected.includes(data._rowIndex)) this.oldSelected.push(data._rowIndex);
      this.acService.execApi('AC', 'SettledInvoicesBusiness', 'SettlementOneLineAsync', [
        data,
        this.dataFilter?.accountID ? this.dataFilter.accountID : '',
        this.cashpayment.objectID,
        this.cashpayment.journalType,
        this.cashpayment.voucherDate,
        data?.cashDiscDate,
        this.cashpayment.currencyID,
        this.cashpayment.exchangeRate,
        this.dataFilter.payAmt,
      ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
        if (res) {
          this.grid.updateRow(data._rowIndex,res,false);
          if (data._rowIndex && Array.isArray(data._rowIndex)) {
            this.oldSelected = data._rowIndex;
          }
          setTimeout(() => {
            this.grid.gridRef?.selectRows(this.oldSelected);
            if(index != 0) this.grid.gridRef.startEdit();
            //if(this.grid.editIndex != 0) this.grid.gridRef.startEdit();
            
            // if (this.isDblCLick) {
            //   this.isDblCLick = false;
            //   this.grid.gridRef.startEdit();
            //   this.detectorRef.detectChanges();
            // } else {
            //   this.grid.gridRef?.selectRows(this.grid.selectedIndexes);
            // }     
          },20);
        }
      }) 
    }
  }

  /**
   * *Hàm bỏ chọn dòng || bỏ chọn tất cả
   * @param e 
   */
  onDeselected(event:any){
    let arrdata = [];
    if(event && !event?.data.length) return;
    arrdata = event?.data;
    arrdata.forEach(data => {
      let index = this.grid.arrSelectedRows.findIndex(
        (x) => x.recID == data.recID
      );
      if(index > -1) this.grid.arrSelectedRows.splice(index,1);
    });
    this.detectorRef.detectChanges();
  }

  /**
   * *Hàm valuechange
   * @param e 
   */
  valueChange(e: any) {
    let field = e.field;
    if (!e.data || typeof e.data === 'undefined') {
      this.mapPredicates.delete(field);
      this.mapDataValues.delete(field);
      return;
    }
    switch(e.field.toLowerCase()){
      case 'vouchertype':
        this.dataFilter.voucherType = e.data; 
        if (e.data == '1') {
          this.mapPredicates.set('voucherType', 'InvoiceDueDate <=@0');
        }else{
          this.mapPredicates.set('voucherType', 'InvoiceDueDate >=@0');
        }
        this.setDate();
        break;
      case 'date':
        if (this.mapPredicates.has('voucherType') && e.data) {
          this.dataFilter.date = e.data;
          this.setDate(e.data);
        }
        break;
      case 'accountid':
        this.dataFilter.accountid = e.data;
        this.mapPredicates.set('accountID', 'AccountID = @0');
        this.mapDataValues.set('accountID', e.data);
        break;
      case 'invoiceduedate':
        this.dataFilter.invoiceDueDate = e.data.toDate;
        this.mapPredicates.set('invoiceDueDate', 'InvoiceDueDate = @0');
        this.mapDataValues.set('invoiceDueDate',new Date(e.data.toDate).toISOString());
        break;
      case 'paytype':
        this.gridModel.sort = [];
        if(e.data == '2') this.gridModel.sort = [{ field: 'InvoiceDueDate', dir: 'asc' }];
        if(e.data == '3') this.gridModel.sort = [{ field: 'InvoiceDueDate', dir: 'desc' }];
        if(e.data == '4') this.gridModel.sort = [{ field: 'BalAmt', dir: 'asc' },{ field: 'InvoiceDueDate', dir: 'asc' }];
        if(e.data == '5') this.gridModel.sort = [{ field: 'BalAmt', dir: 'desc' },{ field: 'InvoiceDueDate', dir: 'asc'}];
        break;
      case 'payAmt':
        this.dataFilter.payAmt = e.data;
        break;
    }
  }

  /**
   * *Hàm set predicate
   * @param type 
   */
  getDataSubInvoice(type:number) {
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

  /**
   * *Hàm xử lí click chọn hóa đơn
   */
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

  /**
   * *Hàm đóng form
   */
  close() {
    this.onDestroy();
    this.dialog.close();
  }
  //#endregion Event

  //#region Function

  /**
   * *Hàm set date predicate
   * @param day 
   */
  setDate(day?: any) {
    let date;
    if(this.dataFilter?.invoiceDueDate){
      date = new Date(this.dataFilter?.invoiceDueDate);
    }else{
      date = new Date();
    }
    let aDate = (date as any).addDays(day || 0);
    this.mapDataValues.set('date', aDate.toISOString());
  }

  /**
   * *Hàm tính chiết khấu,tiền chi trả
   * @param data 
   * @param terms 
   */
  handSettledAmt(data = [], terms = []) {
    let pay = this.dataFilter.payAmt;
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

  /**
   * *Hàm load lọc dữ liệu
   * @param type 
   */
  loadData(type) {
    this.gridModel.entityName = 'AC_SubInvoices';
    this.acService.execApi('AC', 'SettledInvoicesBusiness', 'LoadSettledAsync', [
      this.gridModel,
      this.dataFilter?.accountID ? this.dataFilter.accountID : '',
      this.cashpayment.objectID,
      this.cashpayment.journalType,
      this.cashpayment.voucherDate,
      this.cashpayment.currencyID,
      this.cashpayment.exchangeRate,
      this.dataFilter.payAmt,
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

  /**
   * *Hàm cấn trừ tự động
   * @param data 
   */
  autoPay(data: []) {
    let accID = this.form.formGroup.controls.accountID.value;
    this.acService.execApi('AC', 'SettledInvoicesBusiness', 'SettlementAsync', [
      data,
      this.cashpayment,
      accID,
      this.dataFilter.payAmt,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res)=>{
      if (res) {
        this.subInvoices = res[0];
        setTimeout(() => {
          this.grid.gridRef?.selectRows(res[1]);
        }, 100);
      }
    })
  }
  onDoubleClick(e: any) {
    if (e.rowIndex) {
      this.isDblCLick = true;
      this.grid.gridRef.selectRow(e.rowIndex);
    }
  }

  onAction(e: any) {
    if (e.type == 'endEdit') {
      if (this.oldSelected && this.oldSelected.length && this.grid.gridRef) {
        setTimeout(() => {
          this.grid.gridRef.selectRows(this.oldSelected);
        }, 500);
      }
    }
  }
  //#endregion Function
}
