import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange } from '@angular/core';
import { DataRequest, UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { fmPurchaseInvoicesAllocation } from '../../../codx-ac.service';

@Component({
  selector: 'allocation-table',
  templateUrl: './allocation-table.component.html',
  styleUrls: ['./allocation-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocationTableComponent extends UIComponent {
  //#region Constructor
  @Input() itemSelected: any;
  listAllocation:any;
  fmPurchaseInvoicesAllocation:any = fmPurchaseInvoicesAllocation;
  totalCostAmt:any = 0;
  totalAdjustedAmt:any = 0;
  totalQuantity:any = 0;
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
    let options = new DataRequest();
    options.entityName = 'AC_PurchaseAllocation';
    options.predicates = 'TransID=@0';
    options.dataValues = this.itemSelected.recID;
    options.pageLoading = false;
    this.api
      .execSv('AC', 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if(res){
          this.listAllocation = res[0] || [];
          this.setTotalRecord();
          this.detectorRef.detectChanges();
        }
      })
  }

  /**
   * Hàm tính tổng các số tiền của các tab detail(hạch toán,thông tin hóa đơn,hóa đơn GTGT)
   */
  setTotalRecord() {
    this.totalQuantity = 0;
    this.totalCostAmt = 0;
    this.totalAdjustedAmt = 0;

    if (this.listAllocation && this.listAllocation.length > 0) {
      this.totalQuantity = this?.listAllocation.reduce((sum, data:any) => sum + data?.quantity,0);
      this.totalCostAmt = this?.listAllocation.reduce((sum, data:any) => sum + data?.costAmt,0);
      this.totalAdjustedAmt = this?.listAllocation.reduce((sum, data:any) => sum + data?.adjustedAmt,0);
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
