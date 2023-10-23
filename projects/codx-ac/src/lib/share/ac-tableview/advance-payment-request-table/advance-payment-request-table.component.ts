import { Component, Injector, Input, SimpleChange } from '@angular/core';
import { UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'advance-payment-request-table',
  templateUrl: './advance-payment-request-table.component.html',
  styleUrls: ['./advance-payment-request-table.component.css']
})
export class AdvancePaymentRequestTableComponent extends UIComponent {
  //#region Constructor
  @Input() itemSelected: any;

  totalDR: any = 0; //? tổng tiền nợ tab hạch toán
  listAdvancePayment:any;
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
      .exec('AC', 'AdvancedPaymentLinesBusiness', 'LoadDataAsync', [
        dataItem.recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.listAdvancePayment = res;
          this.setTotalRecord();
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * Hàm tính tổng các số tiền của các tab detail(hạch toán,thông tin hóa đơn,hóa đơn GTGT)
   */
  setTotalRecord() {
    this.totalDR = 0;
    this.totalDR = this?.listAdvancePayment.reduce((sum, data:any) => sum + data?.dr,0);
  }

  /**
   * *Hàm hỗ trợ ngFor không render lại toàn bộ data
   */
  trackByFn(index, item) {
    return item.recID;
  }
  //#endregion Function
}
