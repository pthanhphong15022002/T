import {
  AfterViewInit,
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
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Observable, lastValueFrom } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';
import { TableLineDetailComponent } from '../components/table-line-detail/table-line-detail.component';
import { ISalesInvoice } from '../interfaces/ISalesInvoice.interface';
import { ISalesInvoicesLine } from '../interfaces/ISalesInvoicesLine.interface';
import { PopupAddSalesInvoicesLineComponent } from '../popup-add-sales-invoices-line/popup-add-sales-invoices-line.component';
import { SalesInvoiceService } from '../sales-invoices.service';

@Component({
  selector: 'lib-popup-add-sales-invoice',
  templateUrl: './popup-add-sales-invoice.component.html',
  styleUrls: ['./popup-add-sales-invoice.component.scss'],
})
export class PopupAddSalesInvoiceComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('grid') grid: CodxGridviewV2Component;
  @ViewChild('tableLineDetail') tableLineDetail: TableLineDetailComponent;

  initialMaster: ISalesInvoice;
  master: ISalesInvoice = {} as ISalesInvoice;
  prevMaster: ISalesInvoice;
  lines: ISalesInvoicesLine[] = [];
  masterService: CRUDService;
  detailService: CRUDService;
  gvsSalesInvoices: any;
  gvsSalesInvoicesLines: any;
  fmSalesInvoicesLines: FormModel;

  formTitle: string;
  isEdit: boolean = false;
  voucherNoPlaceholderText$: Observable<string>;
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
  isReturnInvoice: boolean;

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
    this.voucherNoPlaceholderText$ =
      this.journalService.getVoucherNoPlaceholderText();

    this.editSettings.mode =
      this.journal.addNewMode == '2' ? 'Dialog' : 'Normal';

    if (this.journal.assignRule === '2') {
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

    this.cache
      .gridViewSetup(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .subscribe((res) => {
        this.gvsSalesInvoices = res;
      });
  }

  ngAfterViewInit(): void {}
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

  onDiscard(): void {
    this.masterService
      .delete([this.master], true, null, '', 'AC0010', null, null, false)
      .subscribe((res: any) => {
        console.log({ res });
        if (!res.error) {
          this.resetForm();
        }
      });
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

          this.master = Object.assign(this.master, res);
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

    if (!e.data[e.field]) {
      return;
    }

    const postFields: string[] = [
      'itemID',
      'costPrice',
      'salesPrice',
      'quantity',
      'netAmt',
      'vatid',
      'vatAmt',
      'umid',
      'idiM1',
      'discAmt',
    ];
    if (postFields.includes(e.field)) {
      this.api
        .exec('AC', 'SalesInvoicesLinesBusiness', 'ValueChangeAsync', [
          e.field,
          e.data,
        ])
        .subscribe((line) => {
          console.log(line);

          this.lines[e.idx] = Object.assign(this.lines[e.idx], line);
        });
    }
  }

  onClickMF(e, data) {
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
      this.detailService
        .addNew(() => this.getDefaultLine())
        .subscribe((res: ISalesInvoicesLine) => {
          this.grid.addRow(res, this.lines.length);
        });
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

  // ❌❌
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
    if (JSON.stringify(this.master) !== JSON.stringify(this.initialMaster)) {
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

    this.detailService
      .addNew(() => this.getDefaultLine())
      .subscribe((res: ISalesInvoicesLine) => {
        console.log(res);

        let index = this.lines.length;
        res.rowNo = index + 1;

        if (this.editSettings.mode === 'Normal') {
          this.grid.addRow(res, index);
        } else {
          const dialogModel = new DialogModel();
          dialogModel.FormModel = this.fmSalesInvoicesLines;
          dialogModel.DataService = this.detailService;

          this.callfc
            .openForm(
              PopupAddSalesInvoicesLineComponent,
              'This param is not working',
              500,
              700,
              '',
              {
                formType: 'add',
                index: index,
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
      });
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

      let index = this.lines.length;
      res.rowNo = index + 1;
      res.transID = this.master.recID;

      this.grid.addRow(res, index);
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
  //#endregion

  //#region Function
  getDefaultLine(): Observable<any> {
    return this.api.exec(
      'AC',
      'SalesInvoicesLinesBusiness',
      'GetDefaultAsync',
      [this.master]
    );
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
