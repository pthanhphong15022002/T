import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange } from '@angular/core';
import { UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'temp-purchaseinvoices-table',
  templateUrl: './temp-purchaseinvoices-table.component.html',
  styleUrls: ['./temp-purchaseinvoices-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TempPurchaseinvoicesTableComponent extends UIComponent{
  //#region Constructor
  @Input() itemSelected: any;
  @Input() baseCurr: any;

  totalNetAmt:any = 0; //? tổng thành tiền tab thông tin hóa đơn
  totalQuantity:any = 0; //? tổng số lượng tab thông tin hóa đơn
  totalVatAtm: any = 0; //? tổng tiền thuế GTGT tab thông tin hóa đơn
  totalVatPct: any = 0; //? tổng tiền thuế Suất tab thông tin hóa đơn

  listPurchaseInvoicesLine:any;
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
      .exec('AC', 'PurchaseInvoicesLinesBusiness', 'LoadTempDataAsync', [
        dataItem.recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.listPurchaseInvoicesLine = res;
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
    this.totalNetAmt = 0;
    this.totalVatAtm = 0;

    if (this.listPurchaseInvoicesLine && this.listPurchaseInvoicesLine.length > 0) {
      this.totalQuantity = this.listPurchaseInvoicesLine.reduce((sum, data:any) => sum + data?.quantity,0);
      this.totalNetAmt = this.listPurchaseInvoicesLine.reduce((sum, data:any) => sum + data?.netAmt,0);
      this.totalVatAtm = this.listPurchaseInvoicesLine.reduce((sum, data:any) => sum + data?.vatAmt,0);
      this.totalVatPct = this.listPurchaseInvoicesLine.reduce((sum, data:any) => sum + data?.vatPct * 100,0);
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
