import {
  AfterViewChecked,
  AfterViewInit,
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
  SidebarModel,
  UIComponent,
} from 'codx-core';
import { TabModel } from 'projects/codx-ep/src/lib/models/tabControl.model';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { Observable } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';
import { groupBy, toCamelCase } from '../../../utils';
import { IAcctTran } from '../interfaces/IAcctTran.interface';
import { ISalesInvoice } from '../interfaces/ISalesInvoice.interface';
import { ISalesInvoicesLine } from '../interfaces/ISalesInvoicesLine.interface';
import { SumFormat, TableColumn } from '../models/TableColumn.model';
import { SalesinvoicesAddComponent } from '../salesinvoices-add/salesinvoices-add.component';
import { MF, SalesinvoicesComponent } from '../salesinvoices.component';
import { fmSalesInvoicesLines } from '../salesinvoices.service';

@Component({
  selector: 'lib-salesinvoices-detail',
  templateUrl: './salesinvoices-detail.component.html',
  styleUrls: ['./salesinvoices-detail.component.scss'],
})
export class SalesinvoicesDetailComponent
  extends UIComponent
  implements AfterViewInit, AfterViewChecked, OnChanges
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

  journal: IJournal;
  viewData: ISalesInvoice;
  lines: ISalesInvoicesLine[] = [];
  acctTranLines: IAcctTran[][] = [[]];
  columns: TableColumn[] = [];

  fmSalesInvoicesLines: FormModel;
  fmAcctTrans: FormModel = {
    entityName: 'AC_AcctTrans',
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityPer: 'AC_AcctTrans',
  };
  gvsAcctTrans: any;

  functionName: string;
  tabControl: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];

  constructor(
    private injector: Injector,
    parentComponent: SalesinvoicesComponent,
    private acService: CodxAcService,
    private journalService: JournalService
  ) {
    super(injector);

    this.journal = parentComponent?.journal;
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

    this.cache
      .gridViewSetup(this.fmAcctTrans.formName, this.fmAcctTrans.gridViewName)
      .subscribe((gvs) => {
        this.gvsAcctTrans = gvs;
      });
  }
  //#endregion

  //#region Init
  override onInit(): void {}

  ngAfterViewInit(): void {
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      this.functionName = toCamelCase(res.defaultName);
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
  onClickMF(e, data): void {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS002':
        this.export(data);
        break;
    }
  }

  onInitMF(mfs: any, data: ISalesInvoice): void {
    // console.log(mfs.filter((f) => !f.disabled));
    let disabledFuncs: MF[] = [
      MF.GuiDuyet,
      MF.GhiSo,
      MF.HuyYeuCauDuyet,
      MF.In,
      MF.KhoiPhuc,
      MF.KiemTraTinhHopLe,
    ];
    switch (data.status) {
      case '7': // phac thao
        disabledFuncs = disabledFuncs.filter(
          (f) => f !== MF.KiemTraTinhHopLe && f !== MF.In
        );
        break;
      case '1': // da hop le
        if (['1', '2'].includes(this.journal.approvalControl)) {
          disabledFuncs = disabledFuncs.filter((f) => f !== MF.GuiDuyet);
        } else {
          disabledFuncs = disabledFuncs.filter(
            (f) => f !== MF.GhiSo && f !== MF.In
          );
        }
        break;
      case '3': // cho duyet
        disabledFuncs = disabledFuncs.filter(
          (f) => f !== MF.HuyYeuCauDuyet && f !== MF.In
        );
        break;
      case '5': // da duyet
        disabledFuncs = disabledFuncs.filter(
          (f) => f !== MF.GhiSo && f !== MF.In
        );
        break;
      case '6': // da ghi so
        disabledFuncs = disabledFuncs.filter(
          (f) => f !== MF.KhoiPhuc && f !== MF.In
        );
        break;
      case '9': // khoi phuc
        disabledFuncs = disabledFuncs.filter(
          (f) => f !== MF.GhiSo && f !== MF.In
        );
        break;
    }

    for (const mf of mfs) {
      if (disabledFuncs.includes(mf.functionID)) {
        mf.disabled = true;
      }
    }
  }

  onClickShowLess(): void {
    this.expanding = !this.expanding;
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Method
  getDefault(): Observable<any> {
    return this.api.exec('AC', 'SalesInvoicesBusiness', 'GetDefaultAsync', [
      this.journal.journalNo,
    ]);
  }

  delete(data: ISalesInvoice): void {
    this.dataService.delete([data], true).subscribe();
  }

  edit(data): void {
    console.log('edit', { data });

    const copiedData = { ...data };
    this.dataService.dataSelected = copiedData;
    this.dataService.edit(copiedData).subscribe((res) => {
      let options = new SidebarModel();
      options.DataService = this.dataService;
      options.FormModel = this.formModel;
      options.isFull = true;

      this.callfc.openSide(
        SalesinvoicesAddComponent,
        {
          formType: 'edit',
          formTitle: this.functionName,
        },
        options,
        this.formModel.funcID
      );
    });
  }

  copy(data): void {
    console.log('copy', { data });

    this.dataService.dataSelected = data;
    this.dataService.copy().subscribe((res) => {
      let options = new SidebarModel();
      options.DataService = this.dataService;
      options.FormModel = this.formModel;
      options.isFull = true;

      this.callfc.openSide(
        SalesinvoicesAddComponent,
        {
          formType: 'add',
          formTitle: this.functionName,
        },
        options,
        this.formModel.funcID
      );
    });
  }

  export(data): void {
    const gridModel = new DataRequest();
    gridModel.formName = this.formModel.formName;
    gridModel.entityName = this.formModel.entityName;
    gridModel.funcID = this.formModel.funcID;
    gridModel.gridViewName = this.formModel.gridViewName;
    gridModel.page = this.dataService.request.page;
    gridModel.pageSize = this.dataService.request.pageSize;
    gridModel.predicate = this.dataService.request.predicates;
    gridModel.dataValue = this.dataService.request.dataValues;
    gridModel.entityPermission = this.formModel.entityPer;
    gridModel.groupFields = 'createdBy'; //Chưa có group
    this.callfc.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [gridModel, data.recID],
      null
    );
  }

  loadDetailData(): void {
    if (!this.viewData) {
      return;
    }

    if (!this.journal) {
      this.journalService
        .getJournal$(this.viewData.journalNo)
        .subscribe((res) => {
          this.journal = res;
        });
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
