import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import {
  CRUDService,
  CodxFormComponent,
  CodxGridviewV2Component,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Observable, lastValueFrom } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import {
  IJournal,
  Vll075,
} from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';
import { TableLineDetailComponent } from '../components/table-line-detail/table-line-detail.component';
import { ISalesInvoice } from '../interfaces/ISalesInvoice.interface';
import { ISalesInvoicesLine } from '../interfaces/ISalesInvoicesLine.interface';
import { SalesInvoiceService } from '../salesinvoices.service';
import { SalesinvoiceslinesAddComponent } from '../salesinvoiceslines-add/salesinvoiceslines-add.component';

@Component({
  selector: 'lib-salesinvoices-add',
  templateUrl: './salesinvoices-add.component.html',
  styleUrls: ['./salesinvoices-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesinvoicesAddComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('grid') grid: CodxGridviewV2Component;
  @ViewChild('tableLineDetail') tableLineDetail: TableLineDetailComponent;

  initialMaster: ISalesInvoice;
  prevMaster: ISalesInvoice;
  master: ISalesInvoice = {} as ISalesInvoice;
  prevLine: ISalesInvoicesLine;
  lines: ISalesInvoicesLine[] = [];
  masterService: CRUDService;
  detailService: CRUDService;
  gvsSalesInvoices: any;
  gvsSalesInvoicesLines: any;
  fmSalesInvoicesLines: FormModel;

  baseCurr: string;
  formTitle: string;
  journal: IJournal;
  hiddenFields: string[] = [];
  ignoredFields: string[] = [];
  tabs: TabModel[] = [
    { name: 'history', textDefault: 'Lịch sử', isActive: false },
    { name: 'comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'link', textDefault: 'Liên kết', isActive: false },
  ];
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };

  isEdit: boolean = false;
  isReturnInvoice: boolean;

  defaultLineData: ISalesInvoicesLine;

  constructor(
    injector: Injector,
    private acService: CodxAcService,
    private journalService: JournalService,
    private salesInvoiceService: SalesInvoiceService,
    private notiService: NotificationsService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);
    this.fmSalesInvoicesLines = salesInvoiceService.fmSalesInvoicesLines;
    this.gvsSalesInvoicesLines = salesInvoiceService.gvsSalesInvoicesLines;
    this.journal = salesInvoiceService.journal;

    this.masterService = dialogRef.dataService;
    this.formTitle = dialogData.data.formTitle;
    this.isEdit = dialogData.data.formType === 'edit';
    this.masterService.hasSaved = this.isEdit;
    this.master = this.dialogRef.dataService?.dataSelected;
    this.prevMaster = { ...this.master };
    this.initialMaster = { ...this.master };

    this.isReturnInvoice = dialogRef.formModel.funcID === 'ACT0701';

    // create a CRUDService for AC_SalesInvoicesLines
    this.detailService = acService.createCrudService(
      injector,
      this.fmSalesInvoicesLines,
      'AC'
    );
  }
  //#endregion

  //#region Init
  override onInit(): void {
    this.cache
      .gridViewSetup(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .subscribe((res) => {
        this.gvsSalesInvoices = res;
      });

    this.cache.companySetting().subscribe((res) => {
      this.baseCurr = res[0]?.baseCurr;
    });

    this.editSettings.mode =
      this.journal.addNewMode == '2' ? 'Dialog' : 'Normal';

    if (this.journal.assignRule === Vll075.TuDongKhiLuu) {
      this.ignoredFields.push('VoucherNo');
    }

    this.hiddenFields = this.journalService.getHiddenFields(this.journal);

    if (this.isEdit) {
      const options = new DataRequest();
      options.entityName = 'AC_SalesInvoicesLines';
      options.predicates = 'TransID=@0';
      options.dataValues = this.master.recID;
      options.pageLoading = false;
      this.acService
        .loadDataAsync('AC', options)
        .subscribe(
          (res) => (this.lines = res.sort((a, b) => a.rowNo - b.rowNo))
        );
    }

    this.getDefaultLine().subscribe((res) => {
      this.defaultLineData = res.data;
    });
  }

  ngAfterViewInit(): void {
    // prevent readonly input and codx-tabs from being focused
    setTimeout(() => {
      const inputEls: HTMLInputElement[] = Array.from(
        document.querySelectorAll('codx-input input')
      );
      for (const el of inputEls) {
        if (el.readOnly) {
          el.setAttribute('tabindex', '-1');
        }
      }

      const navLinkEls: HTMLAnchorElement[] = Array.from(
        document.querySelectorAll('codx-tabs a.nav-link')
      );
      for (const el of navLinkEls) {
        el.setAttribute('tabindex', '-1');
      }
    }, 1000);
  }
  //#endregion

  //#region Event
  onClickSave(closeAfterSave: boolean): void {
    console.log(this.master);
    console.log(this.lines);

    if (
      !this.acService.validateFormData(
        this.form.formGroup,
        this.gvsSalesInvoices,
        [],
        this.ignoredFields
      )
    ) {
      return;
    }

    if (
      this.journal.transLimit &&
      this.master.totalAmt > this.journal.transLimit
    ) {
      this.notiService.notifyCode('AC0016');
      return;
    }

    this.journalService.checkVoucherNoBeforeSave(
      this.journal,
      this.master,
      'AC',
      'AC_SalesInvoices',
      this.form,
      this.masterService.hasSaved,
      () => this.save(closeAfterSave)
    );
  }

  onClickClose(): void {
    this.dialogRef.close();
  }

  onClickDiscard(): void {
    this.masterService
      .delete([this.master], true, null, '', 'AC0010', null, null, false)
      .subscribe((res: any) => {
        console.log({ res });
        if (!res.error) {
          this.resetForm();
        }
      });
  }

  onSubTypeChange(e): void {
    this.master.subType = e.data[0];
  }

  onInputChange(e): void {
    console.log('onInputChange', e);

    // e.data for valueChange and e.crrValue for controlBlur
    if (!e.data && !e.crrValue) {
      return;
    }

    if (this.master[e.field] === this.prevMaster[e.field]) {
      return;
    }

    const postFields: string[] = [
      'objectID',
      'currencyID',
      'exchangeRate',
      'voucherDate',
    ];
    if (postFields.includes(e.field)) {
      this.api
        .exec('AC', 'SalesInvoicesBusiness', 'ValueChangeAsync', [
          e.field,
          this.master,
        ])
        .subscribe((res: any) => {
          console.log(res);

          Object.assign(this.master, res);
          this.prevMaster = { ...this.master };
          this.form.formGroup.patchValue(res);
        });
    } else {
      this.prevMaster = { ...this.master };
    }
  }

  onGridInit(columns: any[]): void {
    if (this.journal.addNewMode === '2') {
      return;
    }

    // ❌ cache problem
    let toggleFields: string[] = [
      ...Array.from({ length: 3 }, (_, i) => 'DIM' + (i + 1)),
      ...Array.from({ length: 10 }, (_, i) => 'IDIM' + i),
    ];
    for (const c of columns) {
      if (toggleFields.includes(c.fieldName)) {
        c.isVisible = true;
      }

      if (this.hiddenFields.includes(c.fieldName)) {
        c.isVisible = false;
      }

      if (c.fieldName === 'DIM1') {
        if (['1', '2'].includes(this.journal.diM1Control)) {
          c.predicate = '@0.Contains(DepartmentID)';
          c.dataValue = `[${this.journal.diM1}]`;
        }
      }

      if (c.fieldName === 'DIM2') {
        if (['1', '2'].includes(this.journal.diM2Control)) {
          c.predicate = '@0.Contains(CostCenterID)';
          c.dataValue = `[${this.journal.diM2}]`;
        }
      }

      if (c.fieldName === 'DIM3') {
        if (['1', '2'].includes(this.journal.diM3Control)) {
          c.predicate = '@0.Contains(CostItemID)';
          c.dataValue = `[${this.journal.diM3}]`;
        }
      }
    }
  }

  onCellChange(e): void {
    console.log('onCellChange', e);

    if (!this.master) {
      return;
    }

    if (this.prevLine?.[e.field] == e.data[e.field]) {
      return;
    }

    const postFields: string[] = [
      'itemid',
      'quantity',
      'salesprice',
      'discpct',
      'discamt',
      'miscprice',
      'miscamt',
      'salestaxpct',
      'salestaxamt',
      'excisetaxpct',
      'excisetaxamt',
      'vatid',
      'vatbase',
      'vatamt',
      'commissionpct',
      'commissionamt',
      'costprice',
    ];
    if (postFields.includes(e.field.toLowerCase())) {
      this.api
        .exec('AC', 'SalesInvoicesLinesBusiness', 'ValueChangeAsync', [
          e.field,
          this.master,
          e.data,
        ])
        .subscribe((line: any) => {
          console.log(line);

          this.prevLine = { ...line };
          Object.assign(this.lines[e.idx], line);
          this.detectorRef.markForCheck();
        });
    }
  }

  onClickMF(e, data): void {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteRow(data);
        break;
      case 'SYS03':
        this.editRow(data);
        break;
      case 'SYS04':
        this.copyRow(data);
        break;
      case 'SYS002':
        // this.export(data);
        break;
    }
  }

  onChangeMF(e): void {
    console.log(
      'onChangeMF',
      e.filter((m) => !m.disabled)
    );
    for (const mf of e) {
      if (['SYS003', 'SYS004', 'SYS001', 'SYS002'].includes(mf.functionID)) {
        mf.disabled = true;
      }
    }
  }

  onClickAddRow(): void {
    if (
      !this.acService.validateFormData(
        this.form.formGroup,
        this.gvsSalesInvoices,
        [],
        this.ignoredFields
      )
    ) {
      return;
    }

    this.journalService.checkVoucherNoBeforeSave(
      this.journal,
      this.master,
      'AC',
      'AC_SalesInvoices',
      this.form,
      this.masterService.hasSaved,
      async () => await this.addRow()
    );
  }

  onEndAddNew(line: ISalesInvoicesLine): void {
    console.log('onEndAddNew', line);

    line.fixedDIMs = this.genFixedDims(line);
    this.detailService.clear();
    this.detailService.addDatas.set(line.recID, line);
    this.detailService
      .save(null, null, null, null, false)
      .subscribe((res: any) => {
        if (res.save?.error) {
          this.grid.gridRef.selectRow(Number(line._rowIndex));
          this.grid.gridRef.startEdit();
        }
      });
  }

  onEndEdit(line: ISalesInvoicesLine): void {
    console.log('onEndEdit', line);

    line.fixedDIMs = this.genFixedDims(line);
    this.detailService.clear();
    this.detailService.updateDatas.set(line.recID, line);
    this.detailService
      .save(null, null, null, null, false)
      .subscribe((res: any) => {
        if (res.update?.error) {
          this.grid.gridRef.selectRow(Number(line._rowIndex));
          this.grid.gridRef.startEdit();
        }
      });
  }

  onActionEvent(e): void {
    console.log('onActionEvent', e);

    // add a new row after pressing tab on the last column
    if (e.type === 'add' && this.grid.autoAddRow) {
      const newLine: ISalesInvoicesLine = this.createNewSalesInvoiceLine();
      this.detailService.clear();
      this.detailService.addDatas.set(newLine.recID, newLine);
      this.grid.addRow(newLine, this.lines.length);
    }

    if (e.type === 'beginEdit') {
      this.prevLine = { ...e.data };

      this.api
        .exec('AC', 'SalesInvoicesLinesBusiness', 'BeginEditAsync', e.data)
        .subscribe();
    }

    // bùa 🤬
    // edit => escape => edit again => lỗi
    if (e.type === 'closeEdit' && !e.data.isAddNew) {
      this.lines[e.data._rowIndex] = e.data;
    }
  }

  // ❌❌ bùa tab
  @HostListener('keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    console.log(e);

    if (e.key !== 'Tab') {
      return;
    }

    if (!e.shiftKey && document.activeElement.className === 'e-tab-wrap') {
      document.getElementById('btnAddLine').focus();
    }

    if (e.shiftKey) {
      if (
        document.activeElement.className === 'e-lastrowcell' ||
        document.activeElement.id === 'gridViewV2'
      ) {
        document
          .querySelector<HTMLElement>("codx-input[field='postedDate'] input")
          .focus();

        return;
      }

      const nodes = document.querySelectorAll('ejs-grid #dropdownMenuButton');
      if (nodes[nodes.length - 1] === document.activeElement) {
        document
          .querySelector<HTMLElement>("codx-input[field='postedDate'] input")
          .focus();
      }
    }
  }

  @HostListener('click', ['$event.target'])
  onClick(e: HTMLElement): void {
    if (
      this.grid.gridRef.isEdit &&
      !e.closest('.edit-value') &&
      !e.closest('.e-gridcontent')
    ) {
      this.grid.endEdit();
    }

    if (!e.closest('.card-footer')) {
      const el = document.querySelector('#footer');
      el.classList.remove('expand');
      el.classList.add('collape');
    }
  }
  //#endregion

  //#region Method
  save(closeAfterSave: boolean): void {
    this.master.status = '1';

    if (this.masterService.hasSaved) {
      this.masterService.updateDatas.set(this.master.recID, this.master);
    }

    this.masterService.save().subscribe((res: any) => {
      if (res.save.data || res.update.data) {
        if (closeAfterSave) {
          this.dialogRef.close();
        } else {
          this.resetForm();
        }
      }
    });
  }

  /** Save master before adding a new row */
  async addRow(): Promise<void> {
    const { updateColumns: a, updateColumn: b, ...rest1 } = this.master as any;
    const {
      updateColumns: c,
      updateColumn: d,
      ...rest2
    } = this.initialMaster as any;
    if (JSON.stringify(rest1) !== JSON.stringify(rest2)) {
      if (this.masterService.hasSaved) {
        this.masterService.updateDatas.set(this.master.recID, this.master);
      }

      const res: any = await lastValueFrom(
        this.masterService.save(null, null, null, null, false)
      );

      if (!res.save.data && !res.update.data) {
        return;
      }

      this.masterService.hasSaved = true;
      this.initialMaster = { ...this.master };
    }

    const newLine: ISalesInvoicesLine = this.createNewSalesInvoiceLine();
    this.detailService.clear();
    this.detailService.dataSelected = newLine;
    this.detailService.addDatas.set(newLine.recID, newLine);
    if (this.journal.addNewMode === '1') {
      this.grid.addRow(newLine, this.lines.length);
    } else {
      // error ??
      const dialogModel = new DialogModel();
      dialogModel.FormModel = this.fmSalesInvoicesLines;
      dialogModel.DataService = this.detailService;

      this.callfc
        .openForm(
          SalesinvoiceslinesAddComponent,
          'This param is not working',
          500,
          700,
          '',
          {
            formType: 'add',
            index: this.lines.length,
          },
          '',
          dialogModel
        )
        .closed.subscribe(({ event }) => {
          if (event?.length > 0) {
            this.tableLineDetail.grid.refresh();
          }
        });
    }
  }

  deleteRow(data): void {
    console.log('deleteRow', data);

    this.detailService.delete([data]).subscribe((res: any) => {
      if (res.error === false) {
        this.grid.deleteRow(data, true);
      }
    });
  }

  editRow(data): void {
    console.log('editRow', data);

    this.grid.gridRef.selectRow(Number(data.index));
    this.grid.gridRef.startEdit();
  }

  copyRow(data): void {
    console.log('copyRow', data);

    this.detailService.dataSelected = { ...data };
    this.detailService.copy().subscribe((res: ISalesInvoicesLine) => {
      console.log(res);

      res.transID = this.master.recID;
      this.grid.addRow(res, this.lines.length);
    });
  }

  resetForm(): void {
    this.masterService
      .addNew(() =>
        this.api.exec('AC', 'SalesInvoicesBusiness', 'GetDefaultAsync', [
          this.master.journalNo,
        ])
      )
      .subscribe((res: ISalesInvoice) => {
        console.log(res);
        this.master = Object.assign(this.master, res);
        this.initialMaster = { ...this.master };
        this.prevMaster = { ...this.master };
        this.form.formGroup.patchValue(res);

        this.masterService.hasSaved = false;

        // after implementing addNew(), both this.masterService.dataSelected and this.masterService.addDatas
        // no longer point to the object referenced by this.salesInvoice,
        // so I reassign it here
        this.masterService.dataSelected = this.master;
        this.masterService.addDatas.set(this.master.recID, this.master);

        this.lines = [];
      });
  }

  getDefaultLine(): Observable<any> {
    return this.api.exec(
      'AC',
      'SalesInvoicesLinesBusiness',
      'GetDefaultAsync',
      [this.master]
    );
  }
  //#endregion

  //#region Function
  createNewSalesInvoiceLine(): ISalesInvoicesLine {
    const line: ISalesInvoicesLine = { ...this.defaultLineData };
    line.recID = Util.uid();
    line.createdOn = new Date();
    line.idiM4 = this.master.warehouseID;

    return line;
  }

  genFixedDims(line: ISalesInvoicesLine): string {
    let fixedDims: string[] = Array(10).fill('0');
    for (let i = 0; i < 10; i++) {
      if (line['idiM' + i]) {
        fixedDims[i] = '1';
      }
    }
    return fixedDims.join('');
  }
  //#endregion
}
