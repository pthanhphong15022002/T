import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange, ViewChild } from '@angular/core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { AuthStore, CodxService, FormModel, NotificationsService, SidebarModel, TenantStore, UIDetailComponent } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'cashtransfers-detail',
  templateUrl: './cashtransfers-detail.component.html',
  styleUrls: ['./cashtransfers-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashtransfersDetailComponent extends UIDetailComponent {
//#region Constructor
@Input() dataItem: any;
@Input() dataService: any;
@Input() formModel: any;
@Input() baseCurr: any;
@Input() journal: any;
@Input() headerText: any;
@Input() hideFields: any;
@Input() dataDefault: any;
@Input() gridViewSetup: any;
@ViewChild('elementTabDetail') elementTabDetail: TabComponent; //? element object các tab detail (hạch toán,thông tin hóa đơn,hóa đơn GTGT)
itemSelected: any;
dataCategory: any; //? data của category
optionSidebar: SidebarModel = new SidebarModel();
bhLogin: boolean = false;
tabInfo: TabModel[] = [
  //? danh sách các tab footer
  { name: 'History', textDefault: 'Lịch sử', isActive: false },
  { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
  { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
  { name: 'References', textDefault: 'Liên kết', isActive: false },
];
private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
isShowLess: any = false;
isShowMore:any = true;
isReadMore:any = false;
constructor(
  private inject: Injector,
  private acService: CodxAcService,
  private authStore: AuthStore,
  private shareService: CodxShareService,
  private notification: NotificationsService,
  private tenant: TenantStore,
  public codxService: CodxService
) {
  super(inject);
  this.authStore = inject.get(AuthStore);
}
//#endregion Constructor

//#region Init
onInit(): void {
  if(this.recID) this.getDataDetail(this.dataItem,this.recID);
  if(!this.formModel) this.getFormModel();
}

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

ngDoCheck() {
  this.onReadMore();
  this.detectorRef.detectChanges();
}

/**
 * *Hàm khởi tạo các tab detail
 * @param e
 * @param ele
 */
createTab(e: any, ele: TabComponent) {
  this.showHideTab(this.itemSelected?.vatControl, ele);
}

selecting(event){
  if (event.isSwiped) {
    event.cancel = true;
  }
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
    this.showHideTab(this.itemSelected?.vatControl); // ẩn hiện các tab detail
    this.detectorRef.detectChanges();
  } else {
    this.api
      .exec('AC', 'CashTranfersBusiness', 'GetDataDetailAsync', [recID])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.itemSelected = res;
        this.showHideTab(this.itemSelected?.vatControl); // ẩn hiện các tab detail
        this.detectorRef.detectChanges();
      });
  }
}

/**
 * *Hàm ẩn hiện các tab khi thay đổi chứng từ theo loại chứng từ
 * @param event
 * @param ele
 */
showHideTab(type: any, ele?: TabComponent) {
  ele = this.elementTabDetail;
  if (ele) {
    ele.hideTab(0, false);
    ele.select(0);
    if (type) {
      ele.hideTab(1, false);
    }else{
      ele.hideTab(1, true);
    }
  }
}

/**
 * *Hàm hỗ trợ ngFor không render lại toàn bộ data
 */
trackByFn(index, item) {
  return item.recID;
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

getFormModel()
{
  this.cache.functionList(this.funcID).subscribe(item=>{
    this.formModel = new FormModel();
    this.formModel.entityName = item?.entityName;
    this.formModel.formName = item?.formName;
    this.formModel.gridViewName = item?.gridViewName;
  })
}
//#endregion Function
}
