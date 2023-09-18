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
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Observable } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { groupBy } from '../../../utils';
import { IAcctTran } from '../../salesinvoices/interfaces/IAcctTran.interface';
import {
  SumFormat,
  TableColumn,
} from '../../salesinvoices/models/TableColumn.model';
import { IPurchaseInvoice } from '../interfaces/IPurchaseInvoice.inteface';
import { IPurchaseInvoiceLine } from '../interfaces/IPurchaseInvoiceLine.interface';
import { PurchaseinvoicesAddComponent } from '../purchaseinvoices-add/purchaseinvoices-add.component';
import { MF, fmPurchaseInvoicesLines } from '../purchaseinvoices.service';
import { PurchaseinvoicesComponent } from '../purchaseinvoices.component';
import { JournalService } from '../../../journals/journals.service';

@Component({
  selector: 'lib-purchaseinvoices-detail',
  templateUrl: './purchaseinvoices-detail.component.html',
  styleUrls: ['./purchaseinvoices-detail.component.scss'],
})
export class PurchaseinvoicesDetailComponent
  extends UIComponent
  implements AfterViewInit, AfterViewChecked, OnChanges
{
  //#region Constructor
  @ViewChild('memoContent', { read: ElementRef })
  memoContent: ElementRef<HTMLElement>;

  @Input() data: IPurchaseInvoice;
  @Input() recID: string;
  @Input() formModel: FormModel;
  @Input() dataService: CRUDService;

  overflowed: boolean = false;
  expanding: boolean = false;
  loading: boolean = false;
  acctLoading: boolean = false;
  isFirstRun: boolean = true;

  journal: IJournal;
  viewData: IPurchaseInvoice;
  lines: IPurchaseInvoiceLine[] = [];
  acctTranLines: IAcctTran[][] = [[]];
  columns: TableColumn[] = [];

  fmPurchaseInvoicesLines: FormModel;
  fmAcctTrans: FormModel = {
    entityName: 'AC_AcctTrans',
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityPer: 'AC_AcctTrans',
  };
  gvsAcctTrans: any;

  funcName: string;
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];

  constructor(
    private injector: Injector,
    parentComponent: PurchaseinvoicesComponent,
    private acService: CodxAcService,
    private journalService: JournalService
  ) {
    super(injector);

    this.journal = parentComponent.journal;
    this.fmPurchaseInvoicesLines = fmPurchaseInvoicesLines;
  }
  //#endregion

  //#region Init
  override onInit(): void {}

  ngAfterViewInit(): void {
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      this.funcName = res.defaultName;
    });
  }

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.memoContent?.nativeElement;
    this.overflowed = element?.scrollWidth > element?.offsetWidth;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isFirstRun) {
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

      this.isFirstRun = false;
    }

    if (!this.dataService && changes.formModel?.currentValue) {
      this.dataService = this.acService.createCRUDService(
        this.injector,
        this.formModel,
        'AC'
      );
    }

    if (changes.data?.currentValue) {
      this.viewData = this.data;
      this.loadDetailData();
    } else if (changes.recID?.currentValue) {
      const options = new DataRequest();
      options.entityName = 'AC_PurchaseInvoices';
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

  onInitMF(mfs: any, data: IPurchaseInvoice): void {
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
    return this.api.exec('AC', 'PurchaseInvoicesBusiness', 'GetDefaultAsync', [
      this.journal.journalNo,
    ]);
  }

  edit(e, data): void {
    const copiedData = { ...data };
    this.dataService.dataSelected = copiedData;
    this.dataService.edit(copiedData).subscribe((res: any) => {
      let options = new SidebarModel();
      options.DataService = this.dataService;
      options.FormModel = this.formModel;
      options.isFull = true;

      this.callfc.openSide(
        PurchaseinvoicesAddComponent,
        {
          formType: 'edit',
          formTitle: this.funcName,
        },
        options,
        this.formModel.funcID
      );
    });
  }

  copy(e, data): void {
    this.dataService.dataSelected = data;
    this.dataService
      .copy(() => this.getDefault())
      .subscribe((res: any) => {
        if (res) {
          var obj = {
            formType: 'add',
            formTitle: this.funcName,
          };
          let option = new SidebarModel();
          option.DataService = this.dataService;
          option.FormModel = this.formModel;
          option.isFull = true;
          this.callfc.openSide(
            PurchaseinvoicesAddComponent,
            obj,
            option,
            this.formModel.funcID
          );
        }
      });
  }

  delete(data: IPurchaseInvoice): void {
    this.dataService.delete([data], true).subscribe();
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
        'PurchaseInvoicesLinesBusiness',
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
