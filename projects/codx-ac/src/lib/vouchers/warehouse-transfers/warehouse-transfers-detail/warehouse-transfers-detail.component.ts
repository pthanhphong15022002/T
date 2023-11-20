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
  /**
   * *Hàm click các morefunction
   * @param event
   * @param data
   */
  clickMoreFunction(e, data) {
    // switch (e.functionID) {
    //   case 'SYS02':
    //     this.deleteVoucher(data); //? xóa chứng từ
    //     break;
    //   case 'SYS03':
    //     this.editVoucher(data); //? sửa chứng từ
    //     break;
    //   case 'SYS04':
    //     this.copyVoucher(data); //? sao chép chứng từ
    //     break;
    //   case 'SYS002':
    //     //this.exportVoucher(data); //? xuất dữ liệu chứng từ
    //     break;
    //   case 'ACT071404':
    //     this.releaseVoucher(e.text, data); //? gửi duyệt chứng từ
    //     break;
    //   case 'ACT071405':
    //     this.cancelReleaseVoucher(e.text, data); //? hủy yêu cầu duyệt chứng từ
    //     break;
    //   case 'ACT071403':
    //     this.validateVourcher(e.text, data); //? kiểm tra tính hợp lệ chứng từ
    //     break;
    //   case 'ACT071406':
    //     this.postVoucher(e.text, data); //? ghi sổ chứng từ
    //     break;
    //   case 'ACT071407':
    //     this.unPostVoucher(e.text, data); //? khôi phục chứng từ
    //     break;
    //   case 'ACT071408':
    //     //this.printVoucher(data, e.functionID); //? in chứng từ
    //     break;
    // }
  }
  //#endregion Event

  //#region Function
  changeMFDetail(event: any, data: any, type: any = '') {
    
  }

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
  //#endregion Function
}
