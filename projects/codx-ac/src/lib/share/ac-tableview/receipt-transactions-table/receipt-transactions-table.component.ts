import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange } from '@angular/core';
import { UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'receipt-transactions-table',
  templateUrl: './receipt-transactions-table.component.html',
  styleUrls: ['./receipt-transactions-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptTransactionsTableComponent extends UIComponent {
  //#region Constructor
  @Input() itemSelected: any;
  @Input() baseCurr: any;

  totalCostAmt:any = 0; //? tổng thành tiền tab thông tin hóa đơn
  totalQuantity:any = 0; //? tổng số lượng tab thông tin hóa đơn
  totalVatAtm: any = 0; //? tổng tiền thuế tab thông tin hóa đơn
  listVoucherLine:any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector
  ) {
    super(inject);
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
      .exec('IV', 'VouchersLinesBusiness', 'LoadDataAsync', [
        dataItem.recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          console.log(res);
          this.listVoucherLine = res;
          this.setTotalRecord();
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * Hàm tính tổng các số tiền của các tab detail(hạch toán,thông tin hóa đơn,hóa đơn GTGT)
   */
  setTotalRecord() {
    this.totalQuantity = 0;
    this.totalCostAmt = 0;
    this.totalVatAtm = 0;

    if (this.listVoucherLine && this.listVoucherLine.length > 0) {
      this.totalQuantity = this.listVoucherLine.reduce((sum, data:any) => sum + data?.qty,0);
      this.totalCostAmt = this.listVoucherLine.reduce((sum, data:any) => sum + data?.costAmt,0);
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
