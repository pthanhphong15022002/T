import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange } from '@angular/core';
import { UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'acctrants-table',
  templateUrl: './acctrants-table.component.html',
  styleUrls: ['./acctrants-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcctrantsTableComponent extends UIComponent {
  //#region Constructor
  @Input() itemSelected: any;
  @Input() baseCurr: any;
  @Input() noCheckCurrID: any = false;

  totalAcctDR: any = 0; //? tổng tiền nợ tab hạch toán
  totalAcctCR: any = 0; //? tông tiền có tab hạch toán
  totalTransAmt: any = 0; //? tổng tiền số tiền,NT tab hạch toán
  listAcctrants:any;
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
      .exec('AC', 'AcctTransBusiness', 'GetAccountingAsync', [
        dataItem.recID,
        dataItem.status
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.listAcctrants = res;
          this.setTotalRecord();
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * Hàm tính tổng các số tiền của các tab detail(hạch toán,thông tin hóa đơn,hóa đơn GTGT)
   */
  setTotalRecord() {
    this.totalAcctDR = 0;
    this.totalAcctCR = 0;
    this.totalTransAmt = 0;

    if (this.listAcctrants && this.listAcctrants.length > 0) {
      if (this.itemSelected.currencyID == this.baseCurr) {
        this.totalAcctDR = this?.listAcctrants.filter(x => x.crediting == false).reduce((sum, data:any) => sum + data?.transAmt,0);
        this.totalAcctCR = this?.listAcctrants.filter(x => x.crediting == true).reduce((sum, data:any) => sum + data?.transAmt,0);
      }else{
        this.totalAcctDR = this?.listAcctrants.filter(x => x.crediting == false).reduce((sum, data:any) => sum + data?.transAmt2,0);
        this.totalAcctCR = this?.listAcctrants.filter(x => x.crediting == true).reduce((sum, data:any) => sum + data?.transAmt2,0);
        this.totalTransAmt = this?.listAcctrants.filter(x => x.crediting == false).reduce((sum, data:any) => sum + data?.transAmt,0);
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
