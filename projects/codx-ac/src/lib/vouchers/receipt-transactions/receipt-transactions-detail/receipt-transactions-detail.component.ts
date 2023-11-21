import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Injector, Input, Output, SimpleChange, ViewChild } from '@angular/core';
import { extend } from '@syncfusion/ej2-angular-grids';
import { CallFuncService, DataRequest, DialogModel, FormModel, NotificationsService, RequestOption, SidebarModel, TenantStore, UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { AnimationModel } from '@syncfusion/ej2-angular-progressbar';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxListReportsComponent } from 'projects/codx-share/src/lib/components/codx-list-reports/codx-list-reports.component';
import { ReceiptTransactionsAddComponent } from '../receipt-transactions-add/receipt-transactions-add.component';
import { CodxAcService } from '../../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';

@Component({
  selector: 'receipt-transactions-detail',
  templateUrl: './receipt-transactions-detail.component.html',
  styleUrls: ['./receipt-transactions-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptTransactionsDetailComponent extends UIComponent {
  
  //#region Constructor
  @Input() recID: any;
  @Input() dataItem: any;
  @Input() dataService: any;
  @Input() formModel: any;
  @Input() baseCurr: any;
  @Input() journal: any;
  @Input() headerText: any;
  @Input() hideFields: any;
  @Input() dataDefault: any;
  @Input() gridViewSetup: any;
  itemSelected: any;
  dataCategory: any; //? data của category
  optionSidebar: SidebarModel = new SidebarModel();
  tabInfo: TabModel[] = [
    //? danh sách các tab footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    private tenant: TenantStore
  ) {
    super(inject);
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.dataService;
    this.optionSidebar.FormModel = this.formModel;
    this.optionSidebar.isFull = true;
  }

  ngOnChanges(value: SimpleChange) {
    this.getDataDetail(this.dataItem, this.recID);
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion Init

  //#region Event

  //#endregion

  //#region Function
  
  /**
   * *Hàm get data chi tiết
   * @param data
   */
  getDataDetail(dataItem, recID) {
    if (dataItem) {
      this.itemSelected = dataItem;
      this.detectorRef.detectChanges();
    }else{
      this.api
      .exec('IV', 'VouchersBusiness', 'GetDataDetailAsync', [
        dataItem,
        recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.itemSelected = res;
        this.detectorRef.detectChanges();
      });
    }
  }

  //#endregion


  
}
