import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange } from '@angular/core';
import { UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { fmVATInvoices } from '../../../codx-ac.service';

@Component({
  selector: 'vatinvoices-table',
  templateUrl: './vatinvoices-table.component.html',
  styleUrls: ['./vatinvoices-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VatinvoicesTableComponent extends UIComponent {
  //#region Constructor
  @Input() itemSelected: any;
  @Input() baseCurr: any;

  totalVatBase: any = 0; //? tổng tiền số tiền tab hóa đơn GTGT
  totalVatAtm: any = 0; //? tổng tiền thuế tab hóa đơn GTGT
  listVATInvoices:any;
  fmVATInvoices: any = fmVATInvoices
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
      .exec('AC', 'VATInvoicesBusiness', 'LoadDataAsync', [
        dataItem.recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.listVATInvoices = res;
          this.setTotalRecord();
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * Hàm tính tổng các số tiền của các tab detail(hạch toán,thông tin hóa đơn,hóa đơn GTGT)
   */
  setTotalRecord() {
    this.totalVatAtm = 0;
    this.totalVatBase = 0;

    if (this.listVATInvoices && this.listVATInvoices.length > 0) {
      this.totalVatAtm = this.listVATInvoices.reduce((sum, data:any) => sum + data?.vatAmt,0);
      this.totalVatBase = this.listVATInvoices.reduce((sum, data:any) => sum + data?.vatBase,0);
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
