import {
  AfterViewChecked,
  Component,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
  DataRequest,
  FormModel,
  UIComponent
} from 'codx-core';
import { TabModel } from 'projects/codx-ep/src/lib/models/tabControl.model';
import { CodxAcService } from '../../../codx-ac.service';
import { groupBy } from '../../../utils';
import { IAcctTran } from '../interfaces/IAcctTran.interface';
import { ISalesInvoice } from '../interfaces/ISalesInvoice.interface';
import { ISalesInvoicesLine } from '../interfaces/ISalesInvoicesLine.interface';
import { SumFormat, TableColumn } from '../models/TableColumn.model';
import {
  SalesInvoiceService,
  fmSalesInvoicesLines
} from '../salesinvoices.service';

@Component({
  selector: 'lib-salesinvoices-detail',
  templateUrl: './salesinvoices-detail.component.html',
  styleUrls: ['./salesinvoices-detail.component.scss'],
})
export class SalesinvoicesDetailComponent
  extends UIComponent
  implements AfterViewChecked, OnChanges
{
  //#region Constructor
  @ViewChild('memoContent', { read: ElementRef })
  memoContent: ElementRef<HTMLElement>;

  @Input() data: ISalesInvoice;
  @Input() recID: string;
  @Input() formModel: FormModel; // required
  @Input() dataService: CRUDService; // optional

  overflowed: boolean = false;
  expanding: boolean = false;
  loading: boolean = false;
  acctLoading: boolean = false;

  viewData: ISalesInvoice;
  lines: ISalesInvoicesLine[] = [];
  acctTranLines: IAcctTran[][] = [[]];
  columns: TableColumn[] = [];

  fmSalesInvoicesLines: FormModel;
  functionName: string;
  tabControl: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];

  constructor(
    private injector: Injector,
    private acService: CodxAcService,
    private salesInvoiceService: SalesInvoiceService
  ) {
    super(injector);

    this.fmSalesInvoicesLines = fmSalesInvoicesLines;

    this.columns = [
      new TableColumn({
        labelName: 'Num',
        headerText: 'STT',
      }),
      new TableColumn({
        labelName: 'Item',
        headerText: 'Mặt hàng',
        footerText: 'Tổng cộng',
        footerClass: 'text-end',
      }),
      new TableColumn({
        labelName: 'Quantity',
        field: 'quantity',
        headerText: 'Số lượng',
        headerClass: 'text-end',
        footerClass: 'text-end',
        hasSum: true,
      }),
      new TableColumn({
        labelName: 'SalesPrice',
        field: 'salesPrice',
        headerText: 'Đơn giá',
        headerClass: 'text-end',
      }),
      new TableColumn({
        labelName: 'NetAmt',
        field: 'netAmt',
        headerText: 'Thành tiền',
        headerClass: 'text-end',
        footerClass: 'text-end',
        hasSum: true,
        sumFormat: SumFormat.Currency,
      }),
      new TableColumn({
        labelName: 'Vatid',
        field: 'vatAmt',
        headerText: 'Thuế GTGT',
        headerClass: 'text-end pe-3',
        footerClass: 'text-end pe-3',
        hasSum: true,
        sumFormat: SumFormat.Currency,
      }),
    ];
  }
  //#endregion

  //#region Init
  override onInit(): void {
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      this.functionName = res.defaultName;
    });
  }

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.memoContent?.nativeElement;
    this.overflowed = element?.scrollWidth > element?.offsetWidth;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.dataService && changes.formModel?.currentValue) {
      this.cache.gridView(this.formModel.gridViewName).subscribe((gridView) => {
        this.dataService = this.acService.createCRUDService(
          this.injector,
          this.formModel,
          'AC',
          gridView
        );
      });
    }

    if (changes.data?.currentValue) {
      this.viewData = this.data;
      this.loadDetailData();
    } else if (changes.recID?.currentValue) {
      const options = new DataRequest();
      options.entityName = 'AC_SalesInvoices';
      options.predicates = 'RecID=@0';
      options.dataValues = this.recID;
      options.pageLoading = false;
      this.lines = [];
      this.acctTranLines = [];
      this.loading = true;
      this.acctLoading = true;
      this.acService.loadData$('AC', options).subscribe((data: any[]) => {
        this.viewData = data[0];
        this.loadDetailData();
      });
    }
  }
  //#endregion

  //#region Event
  async onInitMF(mfs: any, data: ISalesInvoice): Promise<void> {
    await this.salesInvoiceService.onInitMFAsync(mfs, data);
  }

  onClickMF(e, data): void {
    this.salesInvoiceService.onClickMF(
      e,
      data,
      this.functionName,
      this.formModel,
      this.dataService
    );
  }

  onClickShowLess(): void {
    this.expanding = !this.expanding;
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Method
  loadDetailData(): void {
    if (!this.viewData) {
      return;
    }

    this.expanding = false;

    this.loading = true;
    this.lines = [];
    this.api
      .exec(
        'AC',
        'SalesInvoicesLinesBusiness',
        'GetLinesAsync',
        this.viewData.recID
      )
      .subscribe((res: any) => {
        this.lines = res;
        this.loading = false;
      });

    this.acctLoading = true;
    this.acctTranLines = [];
    this.api
      .exec(
        'AC',
        'AcctTransBusiness',
        'GetAccountingAsync',
        '8dfddc85-4d44-11ee-8552-d880839a843e'
      )
      .subscribe((res: any) => {
        console.log(res);
        if (res) {
          this.acctTranLines = groupBy(res, 'entryID');
        }

        this.acctLoading = false;
      });
  }
  //#endregion

  //#region Function
  //#endregion
}
