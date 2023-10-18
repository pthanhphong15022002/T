import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange } from '@angular/core';
import { UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { fmSettledInvoices } from '../../../codx-ac.service';

@Component({
  selector: 'settledinvoices-table',
  templateUrl: './settledinvoices-table.component.html',
  styleUrls: ['./settledinvoices-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettledinvoicesTableComponent extends UIComponent {
  //#region Constructor
  @Input() itemSelected: any;
  @Input() baseCurr: any;

  totalsettledAmt: any = 0; //? tổng tiền thanh toán tab thông tin hóa đơn
  totalbalAmt: any = 0; //? tổng tiền số dư tab thông tin hóa đơn
  totalsettledAmt2: any = 0; //? tổng tiền thanh toán tab thông tin hóa đơn,HT
  totalbalAmt2: any = 0; //? tổng tiền số dư tab thông tin hóa đơn,HT
  listSettledInvoices:any;
  fmSettledInvoices: any = fmSettledInvoices
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector
  ) {
    super(inject);
    //this.userID = this.authStore.get().userID; //? get tên user đăng nhập
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {}
  ngOnChanges(value: SimpleChange) {
    this.getDataDetail(this.itemSelected);
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Init

  //#region Function

  /**
   * *Hàm get data chi tiết
   * @param data
   */
  getDataDetail(dataItem) {
    this.api
      .exec('AC', 'SettledInvoicesBusiness', 'LoadDataAsync', [
        dataItem.recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.listSettledInvoices = res;
          this.setTotalRecord();
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * Hàm tính tổng các số tiền của các tab detail(hạch toán,thông tin hóa đơn,hóa đơn GTGT)
   */
  setTotalRecord() {
    this.totalbalAmt = 0;
    this.totalbalAmt2 = 0;
    this.totalsettledAmt = 0;
    this.totalsettledAmt2 = 0;

    if (this.listSettledInvoices && this?.listSettledInvoices.length > 0) {
      this.totalbalAmt = this.listSettledInvoices.reduce((sum, data:any) => sum + data?.balAmt,0);
      this.totalsettledAmt = this.listSettledInvoices.reduce((sum, data:any) => sum + data?.settledAmt,0);
      if (this.itemSelected.currencyID != this.baseCurr) {
        this.totalbalAmt2 = this.listSettledInvoices.reduce((sum, data:any) => sum + data?.balAmt2,0);
        this.totalsettledAmt2 = this.listSettledInvoices.reduce((sum, data:any) => sum + data?.settledAmt2,0);
      }
    }
  }

  /**
   * *Hàm hỗ trợ ngFor không render lại toàn bộ data
   */
  trackByFn(index, item) {
    return item.recID;
  }
  //#endregion Function

}
