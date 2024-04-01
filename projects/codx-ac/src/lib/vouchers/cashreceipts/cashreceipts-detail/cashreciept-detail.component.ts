import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  SimpleChange,
  ViewChild,
} from '@angular/core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations/src/tab/tab.component';
import {
  CodxService,
  FormModel,
  SidebarModel,
  UIDetailComponent,
} from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
declare var jsBh: any;
@Component({
  selector: 'cashreciept-detail',
  templateUrl: './cashreciept-detail.component.html',
  styleUrls: ['./cashreciept-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashrecieptDetailComponent extends UIDetailComponent {
  //#region Constructor
  @Input() dataItem: any;
  @Input() dataService: any;
  @Input() formModel: any;
  @Input() baseCurr: any;
  @Input() journal: any;
  @Input() headerText: any;
  @Input() hideFields: any;
  @Input() legalName: any;
  @Input() dataDefault: any;
  @Input() gridViewSetup: any;
  @ViewChild('elementTabDetail') elementTabDetail: TabComponent; //? element object các tab detail (hạch toán,thông tin hóa đơn,hóa đơn GTGT)
  itemSelected: any;
  totalAcctDR: any = 0; //? tổng tiền nợ tab hạch toán
  totalAcctCR: any = 0; //? tông tiền có tab hạch toán
  totalTransAmt: any = 0; //? tổng tiền số tiền,NT tab hạch toán
  totalsettledAmt: any = 0; //? tổng tiền thanh toán tab thông tin hóa đơn
  totalbalAmt: any = 0; //? tổng tiền số dư tab thông tin hóa đơn
  totalsettledAmt2: any = 0; //? tổng tiền thanh toán tab thông tin hóa đơn,HT
  totalbalAmt2: any = 0; //? tổng tiền số dư tab thông tin hóa đơn,HT
  totalVatBase: any = 0; //? tổng tiền số tiền tab hóa đơn GTGT
  totalVatAtm: any = 0; //? tổng tiền thuế tab hóa đơn GTGT
  dataCategory: any; //? data của category
  optionSidebar: SidebarModel = new SidebarModel();
  bhLogin: boolean = false;
  tabInfo: TabModel[] = [
    //? danh sách các tab footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  fmCashPaymentsLines: FormModel = {
    //? formModel của cashpaymentlines
    formName: 'CashPaymentsLines',
    gridViewName: 'grvCashPaymentsLines',
    entityName: 'AC_CashPaymentsLines',
  };
  fmAcctTrans: FormModel = {
    //? formModel của acctTrans
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityName: 'AC_AcctTrans',
  };
  fmSettledInvoices: FormModel = {
    //? formModel của settledInvoices
    formName: 'SettledInvoices',
    gridViewName: 'grvSettledInvoices',
    entityName: 'AC_SettledInvoices',
  };
  fmVatInvoices: FormModel = {
    //? formModel của vatInvoices
    formName: 'VATInvoices',
    gridViewName: 'grvVATInvoices',
    entityName: 'AC_VATInvoices',
  };
  isShowLess: any = false;
  isShowMore: any = true;
  isReadMore: any = false;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(private inject: Injector, public codxService: CodxService) {
    super(inject);
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    if (this.recID) this.getDataDetail(this.dataItem, this.recID);
    if (!this.formModel) this.getFormModel();
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

  /**
   * *Hàm khởi tạo các tab detail
   * @param e
   * @param ele
   */
  createTab(e: any, ele: TabComponent) {
    this.showHideTab(this.itemSelected?.subType, ele);
  }

  selecting(event) {
    if (event.isSwiped) {
      event.cancel = true;
    }
  }
  //#endregion region

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
      this.showHideTab(this.itemSelected?.subType); // ẩn hiện các tab detail
      this.detectorRef.detectChanges();
    } else {
      this.api
        .exec('AC', 'CashReceiptsBusiness', 'GetDataDetailAsync', [recID])
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.itemSelected = res;
          this.setTotalRecord();
          this.showHideTab(this.itemSelected?.subType); // ẩn hiện các tab detail
          this.detectorRef.detectChanges();
          this.onDestroy();
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
      switch (type) {
        case '11':
          //case '3':
          //case '4':
          ele.hideTab(1, true);
          ele.hideTab(2, true);
          break;
        case '12':
          ele.hideTab(1, false);
          ele.hideTab(2, true);
          break;
        // case '9':
        //   ele.hideTab(1, false);
        //   ele.hideTab(2, false);
        //   break;
      }
    }
  }

  /**
   * Hàm tính tổng các số tiền của các tab detail(hạch toán,thông tin hóa đơn,hóa đơn GTGT)
   */
  setTotalRecord() {
    this.totalAcctDR = 0;
    this.totalAcctCR = 0;
    this.totalTransAmt = 0;
    this.totalbalAmt = 0;
    this.totalbalAmt2 = 0;
    this.totalsettledAmt = 0;
    this.totalsettledAmt2 = 0;
    this.totalVatAtm = 0;
    this.totalVatBase = 0;

    if (
      this.itemSelected?.listAcctrants &&
      this.itemSelected?.listAcctrants.length > 0
    ) {
      this.itemSelected?.listAcctrants.forEach((item) => {
        if (this.itemSelected.currencyID == this.baseCurr) {
          if (!item.crediting) {
            this.totalAcctDR += item.transAmt;
          } else {
            this.totalAcctCR += item.transAmt;
          }
        } else {
          if (!item.crediting) {
            this.totalAcctDR += item.transAmt2;
            this.totalTransAmt += item.transAmt;
          } else {
            this.totalAcctCR += item.transAmt2;
          }
        }
      });
    }

    if (
      this.itemSelected?.listSettledInvoices &&
      this.itemSelected?.listSettledInvoices.length > 0
    ) {
      this.itemSelected?.listSettledInvoices.forEach((item) => {
        this.totalbalAmt += item.balAmt;
        this.totalsettledAmt += item.settledAmt;
        if (this.itemSelected.currencyID != this.baseCurr) {
          this.totalbalAmt2 += item.balAmt2;
          this.totalsettledAmt2 += item.settledAmt2;
        }
      });
    }

    if (
      this.itemSelected?.listVATInvoices &&
      this.itemSelected?.listVATInvoices.length > 0
    ) {
      this.itemSelected?.listVATInvoices.forEach((item) => {
        this.totalVatAtm += item.vatAmt;
        this.totalVatBase += item.vatBase;
      });
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
  onShowMoreLess(type) {
    if (type === 'showmore') {
      this.isShowMore = false;
      this.isShowLess = true;
    } else {
      this.isShowMore = true;
      this.isShowLess = false;
    }
    this.detectorRef.detectChanges();
  }

  /**
   * *Ham kiem tra dien giai khi vuot qua 2 dong
   */
  onReadMore() {
    let ele = document.getElementById('eleMemo');
    if (ele) {
      if (
        ele.offsetHeight < ele.scrollHeight ||
        ele.offsetWidth < ele.scrollWidth
      ) {
        this.isReadMore = true;
      } else {
        this.isReadMore = false;
      }
      this.detectorRef.detectChanges();
    }
  }

  getFormModel() {
    this.cache.functionList(this.funcID).subscribe((item) => {
      this.formModel = new FormModel();
      this.formModel.entityName = item?.entityName;
      this.formModel.formName = item?.formName;
      this.formModel.gridViewName = item?.gridViewName;
    });
  }
  //#endregion Function
}
