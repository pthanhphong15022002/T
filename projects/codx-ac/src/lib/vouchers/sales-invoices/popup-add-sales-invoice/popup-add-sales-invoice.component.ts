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
  UIComponent,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { BehaviorSubject, Observable } from 'rxjs';
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

  master: ISalesInvoice = {} as ISalesInvoice;
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
  expanded: boolean = false;
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
  gridHeight: number;
  journalStateSubject = new BehaviorSubject<boolean>(false);

  constructor(
    injector: Injector,
    private acService: CodxAcService,
    private journalService: JournalService,
    private salesInvoiceService: SalesInvoiceService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);
    this.fmSalesInvoicesLines = salesInvoiceService.fmSalesInvoicesLines;
    this.gvsSalesInvoicesLines = salesInvoiceService.gvsSalesInvoicesLines;

    this.masterService = dialogRef.dataService;
    this.formTitle = dialogData.data.formTitle;
    this.isEdit = dialogData.data.formType === 'edit';
    this.masterService.hasSaved = this.isEdit;
    this.master = this.dialogRef.dataService?.dataSelected;

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

    this.journalService.getJournal(this.master.journalNo).subscribe((res) => {
      this.journal = res;

      this.editSettings.mode =
        this.journal.addNewMode == '2' ? 'Dialog' : 'Normal';

      if (this.journal.assignRule === '2') {
        this.ignoredFields.push('VoucherNo');
      }

      this.hiddenFields = this.journalService.getHiddenFields(this.journal);

      this.journalStateSubject.next(true);
    });

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

    this.journalService.handleVoucherNoAndSave(
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
          this.salesInvoiceService.deleteLinesByTransID(this.master.recID);

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

    const postFields: string[] = [
      'objectID',
      'currencyID',
      'exchangeRate',
      'voucherDate',
      'salespersonID',
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
          this.form.formGroup.patchValue(res);
        });
    }
  }

  onCreate(e): void {
    console.log(this.grid);

    this.journalStateSubject.subscribe((loaded) => {
      if (!loaded) {
        return;
      }

      if (this.journal.addNewMode === '2') {
        return;
      }

      // ❌ cache problem
      let toggleFields: string[] = [
        ...Array.from({ length: 3 }, (_, i) => 'DIM' + (i + 1)),
        ...Array.from({ length: 10 }, (_, i) => 'IDIM' + i),
      ];
      for (const c of this.grid.columnsGrid) {
        if (toggleFields.includes(c.fieldName)) {
          c.isVisible = true;
          this.grid.visibleColumns.push(c);
        }
      }
      this.grid.hideColumns(this.hiddenFields);

      for (const v of this.grid.visibleColumns) {
        if (v.fieldName === 'DIM1') {
          if (['1', '2'].includes(this.journal.diM1Control)) {
            v.predicate = '@0.Contains(DepartmentID)';
            v.dataValue = `[${this.journal.diM1}]`;
          }
        }

        if (v.fieldName === 'DIM2') {
          if (['1', '2'].includes(this.journal.diM2Control)) {
            v.predicate = '@0.Contains(CostCenterID)';
            v.dataValue = `[${this.journal.diM2}]`;
          }
        }

        if (v.fieldName === 'DIM3') {
          if (['1', '2'].includes(this.journal.diM3Control)) {
            v.predicate = '@0.Contains(CostItemID)';
            v.dataValue = `[${this.journal.diM3}]`;
          }
        }
      }
    });
  }

  onCellChange(e): void {
    console.log('onCellChange', e);

    if (!e.data[e.field]) {
      return;
    }

    if (e.field === 'itemID') {
      this.setPredicatesByItemID(e.data.itemID);
    }

    if (e.field.toLowerCase() === 'idim4') {
      this.setPredicateByIDIM4(e.data[e.field]);
    }

    const postFields: string[] = [
      'itemID',
      'costPrice',
      'salesPrice',
      'quantity',
      'netAmt',
      'vatid',
      'vatAmt',
      'lineType',
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

    if (this.masterService.hasSaved) {
      this.masterService.updateDatas.set(this.master.recID, this.master);
    }
    this.journalService.handleVoucherNoAndSave(
      this.journal,
      this.master,
      'AC',
      'AC_SalesInvoices',
      this.form,
      this.masterService.hasSaved,
      () => this.addRow()
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

    // ❌ for copyRow ???
    delete this.grid.rowDataSelected.createdOn;

    if (e.type === 'beginEdit') {
      // reset predicates
      for (const v of this.grid.visibleColumns) {
        if (
          [
            'idim0',
            'idim1',
            'idim2',
            'idim3',
            'idim6',
            'idim7',
            'idim5',
          ].includes(v.fieldName?.toLowerCase())
        ) {
          v.predicate = '';
          v.dataValue = '';
        }
      }

      if (e.data.itemID) {
        this.setPredicatesByItemID(e.data.itemID);
      }

      if (e.data.idiM4) {
        this.setPredicateByIDIM4(e.data.idiM4);
      }
    }

    // add a new row after pressing tab on the last column
    // if (e.type === "add") {
    //   this.onClickAddRow();
    // }
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

  // ❌
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
    if (this.grid.gridRef.isEdit && !e.closest('.e-gridcontent')) {
      this.grid.endEdit();
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
  addRow(): void {
    this.masterService
      .save(null, null, null, null, false)
      .subscribe((res: any) => {
        if (res.save.data || res.update.data) {
          this.masterService.hasSaved = true;

          this.detailService
            .addNew(() =>
              this.api.exec(
                'AC',
                'SalesInvoicesLinesBusiness',
                'GetDefaultAsync',
                [this.master]
              )
            )
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
        this.master.recID = res.recID;
        this.master.status = res.status;
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
  setPredicatesByItemID(dataValue: string): void {
    for (const v of this.grid.visibleColumns) {
      if (
        ['idim0', 'idim1', 'idim2', 'idim3', 'idim6', 'idim7'].includes(
          v.fieldName?.toLowerCase()
        )
      ) {
        v.predicate = 'ItemID=@0';
        v.dataValue = dataValue;
      }
    }
  }

  setPredicateByIDIM4(dataValue: string): void {
    const idim5 = this.grid.visibleColumns.find(
      (v) => v.fieldName?.toLowerCase() === 'idim5'
    );
    if (idim5) {
      idim5.predicate = 'WarehouseID=@0';
      idim5.dataValue = dataValue;
    }
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