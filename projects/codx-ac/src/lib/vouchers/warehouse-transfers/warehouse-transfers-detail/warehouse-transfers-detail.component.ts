import { Component, Injector, Input, SimpleChange } from '@angular/core';
import { NotificationsService, SidebarModel, TenantStore, UIComponent } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'warehouse-transfers-detail',
  templateUrl: './warehouse-transfers-detail.component.html',
  styleUrls: ['./warehouse-transfers-detail.component.css']
})
export class WarehouseTransfersDetailComponent extends UIComponent {
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
  isShowLess: any = false;
  isShowMore:any = true;
  isReadMore:any = false;
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

  ngDoCheck() {
    this.onReadMore();
    this.detectorRef.detectChanges();
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
  //#endregion Event

  //#region Function
  /**
   * *Hàm get data chi tiết
   * @param data
   */
  getDataDetail(dataItem, recID) {
    if (dataItem) {
      this.itemSelected = dataItem;
      this.isReadMore = false;
      this.isShowMore = true;
      this.isShowLess = false;
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

  /**
   * *Ham xem them & an bot dien giai
   * @param type 
   */
  onShowMoreLess(type){
    if(type === 'showmore'){
      this.isShowMore = false;
      this.isShowLess = true;
    }else{
      this.isShowMore = true;
      this.isShowLess = false;
    }
    this.detectorRef.detectChanges();
  }

  /**
   * *Ham kiem tra dien giai khi vuot qua 2 dong
   */
  onReadMore(){
    let ele = document.getElementById('eleMemo');
    if (ele) {
      if (ele.offsetHeight < ele.scrollHeight || ele.offsetWidth < ele.scrollWidth){
        this.isReadMore = true;
      }else{
        this.isReadMore = false;
      }
      this.detectorRef.detectChanges();
    }
  }
  //#endregion Function
}
