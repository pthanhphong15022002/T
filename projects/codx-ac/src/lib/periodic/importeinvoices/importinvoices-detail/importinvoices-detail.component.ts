import {
  Component,
  Injector,
  Input,
  SimpleChange,
  ViewChild,
} from '@angular/core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import {
  NotificationsService,
  SidebarModel,
  TenantStore,
  UIComponent,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'importinvoices-detail',
  templateUrl: './importinvoices-detail.component.html',
  styleUrls: ['./importinvoices-detail.component.scss'],
})
export class ImportinvoicesDetailComponent extends UIComponent {
  //#region Constructor
  @Input() recID: any;
  @Input() dataItem: any;
  @Input() dataService: any;
  @Input() formModel: any;
  @Input() baseCurr: any;
  @Input() journal: any;
  @Input() headerText: any;
  @Input() gridViewSetup: any;
  @ViewChild('elementTabDetail') elementTabDetail: TabComponent; //? element object các tab detail (hạch toán,thông tin hóa đơn,hóa đơn GTGT)
  itemSelected: any;
  dataCategory: any; //? data của category
  optionSidebar: SidebarModel = new SidebarModel();
  id: string;
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
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.dataService;
    this.optionSidebar.FormModel = this.formModel;
    this.optionSidebar.isFull = true;
  }

  ngOnChanges(changes: SimpleChange) {
    if (changes['recID']) {
      if (
        changes['recID'].currentValue === this.id ||
        changes['recID'].currentValue == null
      )
        return;
      this.id = changes['recID'].currentValue;
      // this.loadedHisPro = false;
      // this.getTaskDetail();
      this.getDataDetail(this.dataItem,this.id);
    }
  }

  //#endregion Init

  //#region Event
  clickMF(e, data) {}
  //#endregion

  //#region Method
  /**
   * *Hàm get data chi tiết
   * @param data
   */
  getDataDetail(data,recID) {
    this.api
      .exec('AC', 'PurchaseInvoicesBusiness', 'GetTempInvoicesDetailAsync', [
        data,recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.itemSelected = res;
        this.detectorRef.detectChanges();
      });
  }

  //#endregion
  
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
      switch (type) {
        case '2':
          ele.hideTab(0, false);
          ele.hideTab(1, false);
          ele.hideTab(2, false);
          break;
        case '1':
        case '3':
          ele.hideTab(1, false);
          ele.hideTab(2, false);
          ele.hideTab(2, true);
          break;
      }
    }
  }
  /**
   * *Hàm khởi tạo các tab detail
   * @param e
   * @param ele
   */
  createTab(e: any, ele: TabComponent) {
    this.showHideTab(this.itemSelected?.subType, ele);
  }
  //#endregion Init
}
