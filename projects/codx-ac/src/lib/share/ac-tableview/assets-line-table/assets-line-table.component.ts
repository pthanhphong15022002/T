import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange } from '@angular/core';
import { DataRequest, UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'assets-line-table',
  templateUrl: './assets-line-table.component.html',
  styleUrls: ['./assets-line-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsLineTableComponent extends UIComponent {
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
    let options = new DataRequest();
    options.entityName = 'AM_AssetJournalsLines';
    options.pageLoading = false;
    options.predicates = 'TransID=@0';
    options.dataValues = dataItem.recID;
    this.api
      .execSv('AM', 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res) {
          this.listAsset = res[0];
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
