import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  DataRequest,
  FormModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { BehaviorSubject, Observable, distinctUntilKeyChanged } from 'rxjs';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../journals/journals.service';
import { IAcctTran } from '../sales-invoices/interfaces/IAcctTran.interface';
import {
  SumFormat,
  TableColumn,
} from '../sales-invoices/models/TableColumn.model';
import { IPurchaseInvoice } from './interfaces/IPurchaseInvoice.inteface';
import { IPurchaseInvoiceLine } from './interfaces/IPurchaseInvoiceLine.interface';
import { PopAddPurchaseComponent } from './pop-add-purchase/pop-add-purchase.component';
import { PurchaseInvoiceService } from './purchase-invoices.service';

enum MF {
  GuiDuyet = 'ACT060102',
  GhiSo = 'ACT060103',
  HuyYeuCauDuyet = 'ACT060104',
  KhoiPhuc = 'ACT060105',
  KiemTraTinhHopLe = 'ACT060106',
  In = 'ACT060107',
}

@Component({
  selector: 'lib-purchase-invoices',
  templateUrl: './purchase-invoices.component.html',
  styleUrls: ['./purchase-invoices.component.scss'],
})
export class PurchaseinvoicesComponent
  extends UIComponent
  implements AfterViewInit, AfterViewChecked
{
  //#region Constructor
  @ViewChild('siderTemplate') siderTemplate?: TemplateRef<any>;
  @ViewChild('contentTemplate') contentTemplate?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('memoContent', { read: ElementRef })
  memoContent: ElementRef<HTMLElement>;

  views: Array<ViewModel> = [];
  button: ButtonModel = { id: 'btnAdd' };
  isFirstChange: boolean = true;
  expanding: boolean = false;
  overflowed: boolean = false;
  loading: boolean = false;
  acctLoading: boolean = false;
  master: IPurchaseInvoice;
  lines: IPurchaseInvoiceLine[] = [];
  acctTranLines: IAcctTran[][] = [[]];
  funcName: any;
  journalNo: string;
  fmPurchaseInvoicesLines: FormModel;
  tabItem: any = [
    { text: 'Thông tin chứng từ', iconCss: 'icon-info' },
    { text: 'Chi tiết bút toán', iconCss: 'icon-format_list_numbered' },
  ];
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];
  columns: TableColumn[];
  fmAcctTrans: FormModel = {
    entityName: 'AC_AcctTrans',
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityPer: 'AC_AcctTrans',
  };
  gvsAcctTrans: any;
  journal: IJournal;

  defaultSubject = new BehaviorSubject<IPurchaseInvoice>(null);

  constructor(
    inject: Injector,
    private purchaseInvoiceService: PurchaseInvoiceService,
    private journalService: JournalService,
    private routerActive: ActivatedRoute
  ) {
    super(inject);

    this.routerActive.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });

    this.fmPurchaseInvoicesLines =
      purchaseInvoiceService.fmPurchaseInvoicesLines;
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .gridViewSetup(this.fmAcctTrans.formName, this.fmAcctTrans.gridViewName)
      .subscribe((gvs) => {
        this.gvsAcctTrans = gvs;
      });

    this.cache
      .gridViewSetup(
        this.fmPurchaseInvoicesLines.formName,
        this.fmPurchaseInvoicesLines.gridViewName
      )
      .subscribe((grv) => {
        this.columns = [
          new TableColumn({
            labelName: 'Num',
            headerText: 'STT',
          }),
          new TableColumn({
            labelName: 'Item',
            headerText: grv?.ItemID?.headerText ?? 'Mặt hàng',
            footerText: 'Tổng cộng',
            footerClass: 'text-end',
          }),
          new TableColumn({
            labelName: 'Quantity',
            field: 'quantity',
            headerText: grv?.Quantity?.headerText ?? 'Số lượng',
            headerClass: 'text-end',
            footerClass: 'text-end',
            hasSum: true,
          }),
          new TableColumn({
            labelName: 'PurchasePrice',
            field: 'purcPrice',
            headerText: grv?.PurcPrice?.headerText ?? 'Đơn giá',
            headerClass: 'text-end',
          }),
          new TableColumn({
            labelName: 'NetAmt',
            field: 'netAmt',
            headerText: grv?.NetAmt?.headerText ?? 'Thành tiền',
            headerClass: 'text-end',
            footerClass: 'text-end',
            hasSum: true,
            sumFormat: SumFormat.Currency,
          }),
          new TableColumn({
            labelName: 'Vatid',
            field: 'vatAmt',
            headerText: grv?.VATID?.headerText ?? 'Thuế GTGT',
            headerClass: 'text-end pe-3',
            footerClass: 'text-end pe-3',
            hasSum: true,
            sumFormat: SumFormat.Currency,
          }),
        ];
      });

    this.emitDefault();

    this.journalService.getJournal(this.journalNo).subscribe((journal) => {
      this.purchaseInvoiceService.journal = this.journal = journal;
    });

    this.purchaseInvoiceService.initCache();
  }

  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      this.funcName = res.defaultName;
    });

    this.views = [
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateMore,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.siderTemplate,
          panelRightRef: this.contentTemplate,
        },
      },
    ];
  }

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.memoContent?.nativeElement;
    this.overflowed = element?.scrollWidth > element?.offsetWidth;
  }

  ngOnDestroy() {}
  //#endregion

  //#region Event
  onClickShowLess(): void {
    this.expanding = !this.expanding;
    this.detectorRef.detectChanges();
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

  onClickAdd(e) {
    this.view.dataService
      .addNew(() =>
        this.defaultSubject
          .asObservable()
          .pipe(distinctUntilKeyChanged('recID'))
      )
      .subscribe((res: any) => {
        console.log('onClickAdd', res);
        if (res) {
          let options = new SidebarModel();
          options.DataService = this.view.dataService;
          options.FormModel = this.view.formModel;
          options.isFull = true;

          this.callfc
            .openSide(
              PopAddPurchaseComponent,
              {
                formType: 'add',
                formTitle: `${e.text} ${this.funcName}`,
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

  onSelectChange(e) {
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
        'PurchaseInvoicesLinesBusiness',
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
        'LoadDataAsync',
        'e973e7b7-10a1-11ee-94b4-00155d035517'
      )
      .subscribe((res: IAcctTran[]) => {
        console.log(res);
        if (res) {
          this.acctTranLines = this.groupBy(res, 'entryID');
        }

        this.acctLoading = false;
      });
  }

  onChangeMF(mfs: any, data: IPurchaseInvoice): void {
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
  //#endregion

  //#region Method
  getDefault(): Observable<any> {
    return this.api.exec('AC', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }

  edit(e, data) {
    const copiedData = { ...data };
    this.view.dataService.dataSelected = copiedData;
    this.view.dataService.edit(copiedData).subscribe((res: any) => {
      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.callfc.openSide(
        PopAddPurchaseComponent,
        {
          formType: 'edit',
          formTitle: `${e.text} ${this.funcName}`,
        },
        options,
        this.view.funcID
      );
    });
  }

  copy(e, data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .copy(() => this.getDefault())
      .subscribe((res: any) => {
        if (res) {
          var obj = {
            formType: 'add',
            formTitle: `${e.text} ${this.funcName}`,
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.isFull = true;
          this.callfc.openSide(
            PopAddPurchaseComponent,
            obj,
            option,
            this.view.funcID
          );
        }
      });
  }

  delete(data: IPurchaseInvoice): void {
    this.view.dataService.delete([data], true).subscribe();
  }

  export(data): void {
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
