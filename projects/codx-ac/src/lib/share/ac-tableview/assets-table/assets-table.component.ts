import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange } from '@angular/core';
import { DataRequest, UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'assets-table',
  templateUrl: './assets-table.component.html',
  styleUrls: ['./assets-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsTableComponent extends UIComponent {
  //#region Constructor
  @Input() itemSelected: any;
  @Input() baseCurr: any;

  
  listAsset:any;
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
      .exec('AM', 'AssetsBusiness', 'GetDataAsync',[this.itemSelected])
      .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res) {
          this.listAsset = res;
          this.setTotalRecord();
        }else{
          this.listAsset = [];
        }
        this.detectorRef.detectChanges();
      });
  }

  /**
   * Hàm tính tổng các số tiền của các tab detail(hạch toán,thông tin hóa đơn,hóa đơn GTGT)
   */
  setTotalRecord() {
    
  }

  /**
   * *Hàm hỗ trợ ngFor không render lại toàn bộ data
   */
  trackByFn(index, item) {
    return item.recID;
  }
  //#endregion Function
}
