import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  DataRequest,
  FormModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { IAcctTran } from './interfaces/IAcctTran.interface';
import { ISalesInvoice } from './interfaces/ISalesInvoice.interface';
import { ISalesInvoicesLine } from './interfaces/ISalesInvoicesLine.interface';
import { SumFormat, TableColumn } from './models/TableColumn.model';
import { SalesinvoicesAddComponent } from './salesinvoices-add/salesinvoices-add.component';
import { SalesInvoiceService } from './salesinvoices.service';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../journals/journals.service';
import { BehaviorSubject, Observable, distinctUntilKeyChanged } from 'rxjs';
import { IPurchaseInvoice } from '../purchaseinvoices/interfaces/IPurchaseInvoice.inteface';

enum MF {
  GuiDuyet = 'ACT060504',
  GhiSo = 'ACT060506',
  HuyYeuCauDuyet = 'ACT060505',
  KhoiPhuc = 'ACT060507',
  KiemTraTinhHopLe = 'ACT060503',
  In = 'ACT060508',
}

@Component({
  selector: 'lib-salesinvoices',
  templateUrl: './salesinvoices.component.html',
  styleUrls: ['./salesinvoices.component.scss'],
})
export class SalesinvoicesComponent
  extends UIComponent
  implements AfterViewInit, AfterViewChecked
{
  //#region Constructor
  @ViewChild('moreTemplate') moreTemplate?: TemplateRef<any>;
  @ViewChild('sider') sider?: TemplateRef<any>;
  @ViewChild('content') content?: TemplateRef<any>;
  @ViewChild('memoContent', { read: ElementRef })
  memoContent: ElementRef<HTMLElement>;

  views: Array<ViewModel> = [];
  btnAdd = {
    id: 'btnAdd',
  };
  tabControl: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];
  functionName: string;
  journalNo: string;
  defaultSubject = new BehaviorSubject<IPurchaseInvoice>(null);

  journal: IJournal;
  master: ISalesInvoice;
  lines: ISalesInvoicesLine[] = [];
  acctTranLines: IAcctTran[][] = [[]];
  columns: TableColumn[];

  loading: boolean = false;
  acctLoading: boolean = false;
  overflowed: boolean = false;
  expanding: boolean = false;
  isFirstChange: boolean = true;

  fmSalesInvoicesLines: FormModel;
  fmAcctTrans: FormModel = {
    entityName: 'AC_AcctTrans',
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityPer: 'AC_AcctTrans',
  };
  gvsSalesInvoicesLines: any;
  gvsAcctTrans: any;

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private salesInvoiceService: SalesInvoiceService,
    private journalService: JournalService
  ) {
    super(inject);

    this.router.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });

    this.fmSalesInvoicesLines = salesInvoiceService.fmSalesInvoicesLines;
    this.gvsSalesInvoicesLines = salesInvoiceService.gvsSalesInvoicesLines;
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.columns = [
      new TableColumn({
        labelName: 'Num',
        headerText: 'STT',
      }),
      new TableColumn({
        labelName: 'Item',
        headerText:
          this.gvsSalesInvoicesLines?.ItemID?.headerText ?? 'Mặt hàng',
        footerText: 'Tổng cộng',
        footerClass: 'text-end',
      }),
      new TableColumn({
        labelName: 'Quantity',
        field: 'quantity',
        headerText:
          this.gvsSalesInvoicesLines?.Quantity?.headerText ?? 'Số lượng',
        headerClass: 'text-end',
        footerClass: 'text-end',
        hasSum: true,
      }),
      new TableColumn({
        labelName: 'SalesPrice',
        field: 'salesPrice',
        headerText:
          this.gvsSalesInvoicesLines?.SalesPrice?.headerText ?? 'Đơn giá',
        headerClass: 'text-end',
      }),
      new TableColumn({
        labelName: 'NetAmt',
        field: 'netAmt',
        headerText:
          this.gvsSalesInvoicesLines?.NetAmt?.headerText ?? 'Thành tiền',
        headerClass: 'text-end',
        footerClass: 'text-end',
        hasSum: true,
        sumFormat: SumFormat.Currency,
      }),
      new TableColumn({
        labelName: 'Vatid',
        field: 'vatAmt',
        headerText:
          this.gvsSalesInvoicesLines?.VATID?.headerText ?? 'Thuế GTGT',
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

    this.emitDefault();

    this.journalService.getJournal(this.journalNo).subscribe((journal) => {
      this.salesInvoiceService.journal = this.journal = journal;
    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.moreTemplate,
          frozenColumns: 1,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.sider,
          panelRightRef: this.content,
        },
      },
    ];

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      this.functionName = this.acService.toCamelCase(res.defaultName);
    });
  }

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.memoContent?.nativeElement;
    this.overflowed = element?.scrollWidth > element?.offsetWidth;
  }

  ngOnDestroy() {}
  //#endregion

  //#region Event
  onChange(e): void {
    console.log('onChange', e);

    if (e.data.error?.isError) {
      return;
    }

    this.master = e.data.data ?? e.data;
    if (!this.master) {
      return;
    }

    // prevent this function from being called twice on the first run
    if (this.isFirstChange) {
      this.isFirstChange = false;
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
        this.master.recID
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
        'GetListDataDetailAsync',
        'e973e7b7-10a1-11ee-94b4-00155d035517'
      )
      .subscribe((res: any) => {
        console.log(res);
        if (res) {
          this.acctTranLines = this.groupBy(res.lsAcctrants, 'entryID');
        }

        this.acctLoading = false;
      });
  }

  onClickAdd(e): void {
    this.view.dataService
      .addNew(() =>
        this.defaultSubject
          .asObservable()
          .pipe(distinctUntilKeyChanged('recID'))
      )
      .subscribe((res: any) => {
        if (res) {
          let options = new SidebarModel();
          options.DataService = this.view.dataService;
          options.FormModel = this.view.formModel;
          options.isFull = true;

          this.callfc
            .openSide(
              SalesinvoicesAddComponent,
              {
                formType: 'add',
                formTitle: `${e.text} ${this.functionName}`,
              },
              options,
              this.view.funcID
            )
            .closed.subscribe(() => {
              this.emitDefault();
            });
        }
      })
      .unsubscribe();
  }

  onClickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(e, data);
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
      case '0': // phac thao
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
      this.journalNo,
    ]);
  }

  delete(data: ISalesInvoice): void {
    this.view.dataService.delete([data], true).subscribe();
  }

  edit(e, data): void {
    console.log('edit', { data });

    const copiedData = { ...data };
    this.view.dataService.dataSelected = copiedData;
    this.view.dataService.edit(copiedData).subscribe((res) => {
      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.callfc.openSide(
        SalesinvoicesAddComponent,
        {
          formType: 'edit',
          formTitle: `${e.text} ${this.functionName}`,
        },
        options,
        this.view.funcID
      );
    });
  }

  copy(e, data): void {
    console.log('copy', { data });

    this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res) => {
      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.callfc.openSide(
        SalesinvoicesAddComponent,
        {
          formType: 'add',
          formTitle: `${e.text} ${this.functionName}`,
        },
        options,
        this.view.funcID
      );
    });
  }

  export(data) {
    var gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
    //Chưa có group
    gridModel.groupFields = 'createdBy';
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
  //#endregion

  //#region Function
  emitDefault(): void {
    this.getDefault().subscribe((res) => {
      this.defaultSubject.next({
        ...res,
        recID: res.data.recID,
      });
    });
  }

  groupBy(arr: any[], key: string): any[][] {
    if (!Array.isArray(arr)) {
      return [[]];
    }

    return Object.values(
      arr.reduce((acc, current) => {
        acc[current[key]] = acc[current[key]] ?? [];
        acc[current[key]].push(current);
        return acc;
      }, {})
    );
  }
  //#endregion
}
