import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange } from '@angular/core';
import { AuthStore, CodxService, FormModel, NotificationsService, SidebarModel, TenantStore, UIComponent, UIDetailComponent } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { CodxAcService } from '../../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subject, takeUntil } from 'rxjs';
import { GeneralJournalAddComponent } from '../general-journal-add/general-journal-add.component';

@Component({
  selector: 'general-journal-detail',
  templateUrl: './general-journal-detail.component.html',
  styleUrls: ['./general-journal-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralJournalDetailComponent extends UIDetailComponent {

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
  isShowLess: any = false;
  isShowMore:any = true;
  isReadMore:any = false;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    public codxService: CodxService
  ) {
    super(inject);
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

  ngDoCheck() {
    this.onReadMore();
    this.detectorRef.detectChanges();
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
      .exec('AC', 'GeneralJournalsBusiness', 'GetDataDetailAsync', [
        dataItem,
        recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.itemSelected = res;
        this.detectorRef.detectChanges();
        this.onDestroy();
      });
    } 
  }

  /**
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data: any, action: any = '') {
    return this.api.exec('AC', 'GeneralJournalsBusiness', 'SetDefaultAsync', [
      data,
      this.journal,
      action,
    ]);
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
