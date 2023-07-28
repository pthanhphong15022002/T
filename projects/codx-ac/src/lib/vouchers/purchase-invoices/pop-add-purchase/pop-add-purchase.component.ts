import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
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
import { BehaviorSubject, Observable, lastValueFrom } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';
import { IPurchaseInvoice } from '../interfaces/IPurchaseInvoice.inteface';
import { IPurchaseInvoiceLine } from '../interfaces/IPurchaseInvoiceLine.interface';
import { IVATInvoice } from '../interfaces/IVATInvoice.interface';
import { PopAddLineComponent } from '../pop-add-line/pop-add-line.component';
import { PurchaseInvoiceService } from '../purchase-invoices.service';

@Component({
  selector: 'lib-pop-add-purchase',
  templateUrl: './pop-add-purchase.component.html',
  styleUrls: ['./pop-add-purchase.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class PopAddPurchaseComponent extends UIComponent implements OnInit {
  //#region Constructor
  @ViewChild('gridPurchaseInvoiceLines')
  public gridPurchaseInvoiceLines: CodxGridviewV2Component;
  @ViewChild('gridVatInvoices') public gridVatInvoices: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('tab') tab: TabComponent;

  initialMaster: IPurchaseInvoice;
  master: IPurchaseInvoice;
  prevMaster: IPurchaseInvoice;
  lines: IPurchaseInvoiceLine[] = [];
  vatInvoices: IVATInvoice[] = [];
  masterService: CRUDService;
  purchaseInvoiceLineService: CRUDService;
  vatInvoiceService: CRUDService;
  grvPurchaseInvoices: any;

  isEdit: boolean = false;
  journal: IJournal;
  ignoredFields: string[] = [];
  hiddenFields: string[] = [];
  formTitle: string;
  vatType: string;
  hasSaved: any = false;
  isSaveMaster: any = false;
  fmVATInvoices: FormModel = {
    entityName: 'AC_VATInvoices',
    formName: 'VATInvoices',
    gridViewName: 'grvVATInvoices',
    entityPer: 'AC_VATInvoices',
  };
  fmPurchaseInvoicesLines: FormModel;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];
  lockFields: string[];
  voucherNoPlaceholderText$: Observable<string>;
  journalStateSubject = new BehaviorSubject<boolean>(false);
  acParams: any;

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notiService: NotificationsService,
    private journalService: JournalService,
    purchaseInvoiceService: PurchaseInvoiceService,
    @Optional() public dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);

    this.fmPurchaseInvoicesLines =
      purchaseInvoiceService.fmPurchaseInvoicesLines;
    this.fmVATInvoices = purchaseInvoiceService.fmVATInvoices;

    this.formTitle = dialogData.data?.formTitle;

    this.masterService = dialog.dataService;
    this.master = this.masterService?.dataSelected;
    this.initialMaster = { ...this.master };
    this.prevMaster = { ...this.master };
    this.isEdit = dialogData.data.formType === 'edit';
    this.masterService.hasSaved = this.isEdit;

    this.purchaseInvoiceLineService = acService.createCrudService(
      inject,
      this.fmPurchaseInvoicesLines,
      'AC'
    );
    this.vatInvoiceService = acService.createCrudService(
      inject,
      this.fmVATInvoices,
      'AC'
    );
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.voucherNoPlaceholderText$ =
      this.journalService.getVoucherNoPlaceholderText();

    this.acService.getACParameters().subscribe((res) => {
      this.acParams = res;
    });

    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.grvPurchaseInvoices = res;
        }
      });

    this.journalService.getJournal(this.master.journalNo).subscribe((res) => {
      this.journal = res;
      this.vatType = this.journal.subType;

      if (this.journal.assignRule === '2') {
        this.ignoredFields.push('VoucherNo');
      }

      this.hiddenFields = this.journalService.getHiddenFields(this.journal);

      this.journalStateSubject.next(true);
    });

    if (this.isEdit) {
      const options1 = new DataRequest();
      options1.entityName = this.fmPurchaseInvoicesLines.entityName;
      options1.predicates = 'TransID=@0';
      options1.dataValues = this.master.recID;
      options1.pageLoading = false;
      this.acService.loadDataAsync('AC', options1).subscribe((lines) => {
        this.lines = lines;
      });

      const options2 = new DataRequest();
      options2.entityName = this.fmVATInvoices.entityName;
      options2.predicates = 'TransID=@0&&InvoiceType=@1';
      options2.dataValues = `${this.master.recID};Detail`;
      options2.pageLoading = false;
      this.acService.loadDataAsync('AC', options2).subscribe((vatInvoices) => {
        this.vatInvoices = vatInvoices;
      });
    }
  }

  ngAfterViewInit() {}
  //#endregion

  //#region Event
  onClickMF(e, data) {
    let dataService: CRUDService = this.purchaseInvoiceLineService;
    let grid: CodxGridviewV2Component = this.gridPurchaseInvoiceLines;
    let dataSource: any[] = this.lines;
    if (this.tab.selectedItem === 1) {
      dataService = this.vatInvoiceService;
      grid = this.gridVatInvoices;
      dataSource = this.vatInvoices;
    }

    switch (e.functionID) {
      case 'SYS02':
        this.deleteRow(data, dataService, grid);
        break;
      case 'SYS03':
        this.editRow(data, grid);
        break;
      case 'SYS04':
        this.copyRow(data, dataService, grid, dataSource);
        break;
    }
  }

  onInputChange(e: any): void {
    console.log('onInputChange', e);

    // e.data for valueChange and e.crrValue for controlBlur
    if (!e.data && !e.crrValue) {
      return;
    }

    if (this.master[e.field] === this.prevMaster[e.field]) {
      return;
    }

    if (
      e.field === 'exchangeRate' &&
      this.acParams.BaseCurr === this.acParams.TaxCurr
    ) {
      this.notiService.alertCode('AC0022').subscribe(({ event }) => {
        this.master.unbounds = {
          requiresTaxUpdate: event.status === 'Y',
        };
        this.handleMasterChange(e.field);
      });

      return;
    }

    const postFields: string[] = [
      'objectID',
      'currencyID',
      'taxExchRate',
      'voucherDate',
    ];
    if (postFields.includes(e.field)) {
      this.handleMasterChange(e.field);
    } else {
      this.prevMaster = { ...this.master };
    }
  }

  onGridCreated(e, grid: CodxGridviewV2Component): void {
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
      for (const c of grid.columnsGrid) {
        if (toggleFields.includes(c.fieldName)) {
          c.isVisible = true;
          grid.visibleColumns.push(c);
        }
      }
      grid.hideColumns(this.hiddenFields);

      for (const v of grid.visibleColumns) {
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

  onCellChange(e: any) {
    console.log('onCellChange', e);
    if (!e.data[e.field]) {
      return;
    }

    const postFields: string[] = ['itemID'];
    if (postFields.includes(e.field)) {
      this.api
        .exec('AC', 'PurchaseInvoicesLinesBusiness', 'ValueChangeAsync', [
          e.field,
          e.data,
        ])
        .subscribe((line) => {
          this.lines[e.idx] = Object.assign(this.lines[e.idx], line);
        });
    }
  }

  onClickClose() {
    this.dialog.close();
  }

  onDiscard() {
    this.dialog.dataService
      .delete([this.master], true, null, '', 'AC0010', null, null, false)
      .subscribe((res) => {
        if (res.data != null) {
          this.dialog.close();
          this.dt.detectChanges();
        }
      });
  }

  onChangeMF(e): void {
    for (const mf of e) {
      if (['SYS003', 'SYS004', 'SYS001', 'SYS002'].includes(mf.functionID)) {
        mf.disabled = true;
      }
    }
  }

  onEndEdit(line: IPurchaseInvoiceLine): void {
    line.fixedDIMs = this.genFixedDims(line);
    line.unbounds = {
      invoiceForm: this.master.invoiceForm,
      invoiceSeriNo: this.master.invoiceSeriNo,
      invoiceNo: this.master.invoiceNo,
      invoiceDate: this.master.invoiceDate,
    };
    this.purchaseInvoiceLineService.updateDatas.set(line.recID, line);
    this.purchaseInvoiceLineService
      .save(null, null, null, null, false)
      .subscribe((res: any) => {
        if (res.update?.error) {
          this.gridPurchaseInvoiceLines.gridRef.selectRow(
            Number(line._rowIndex)
          );
          this.gridPurchaseInvoiceLines.gridRef.startEdit();
        }
      });
  }

  onEndAddNew(line: IPurchaseInvoiceLine): void {
    line.fixedDIMs = this.genFixedDims(line);
    line.unbounds = {
      invoiceForm: this.master.invoiceForm,
      invoiceSeriNo: this.master.invoiceSeriNo,
      invoiceNo: this.master.invoiceNo,
      invoiceDate: this.master.invoiceDate,
    };
    this.purchaseInvoiceLineService
      .save(null, null, null, null, false)
      .subscribe((res: any) => {
        if (res.save?.error) {
          this.gridPurchaseInvoiceLines.gridRef.selectRow(
            Number(line._rowIndex)
          );
          this.gridPurchaseInvoiceLines.gridRef.startEdit();
        }
      });
  }

  onActionEvent(e): void {
    console.log('onActionEvent', e);
  }

  onEndEdit2(data: any): void {
    this.vatInvoiceService.updateDatas.set(data.recID, data);
    this.vatInvoiceService
      .save(null, null, null, null, false)
      .subscribe((res: any) => {
        if (res.update?.error) {
          this.gridVatInvoices.gridRef.selectRow(Number(data._rowIndex));
          this.gridVatInvoices.gridRef.startEdit();
        }
      });
  }

  onEndAddNew2(data: any): void {
    this.vatInvoiceService
      .save(null, null, null, null, false)
      .subscribe((res: any) => {
        if (res.save?.error) {
          this.gridVatInvoices.gridRef.selectRow(Number(data._rowIndex));
          this.gridVatInvoices.gridRef.startEdit();
        }
      });
  }

  onClickAddRow(): void {
    if (
      !this.acService.validateFormData(
        this.form.formGroup,
        this.grvPurchaseInvoices,
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
      'AC_PurchaseInvoices',
      this.form,
      this.masterService.hasSaved,
      async () => await this.addRow()
    );
  }

  onClickSave(closeAfterSave: boolean): void {
    if (
      !this.acService.validateFormData(
        this.form.formGroup,
        this.grvPurchaseInvoices,
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
      'AC_PurchaseInvoices',
      this.form,
      this.masterService.hasSaved,
      () => {
        this.master.status = '1';

        if (this.masterService.hasSaved) {
          this.masterService.updateDatas.set(this.master.recID, this.master);
        }

        this.masterService.save().subscribe((res: any) => {
          if (res.save.data || res.update.data) {
            if (closeAfterSave) {
              this.dialog.close();
            } else {
              this.resetForm();
            }
          }
        });
      }
    );
  }

  // ❌❌
  @HostListener('keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    console.log(e);

    if (e.key !== 'Tab') {
      return;
    }

    if (
      !e.shiftKey &&
      (document.activeElement.id === 'gridViewV2' ||
        document.activeElement.className === 'e-tab-wrap')
    ) {
      if (this.tab.selectedItem === 0) {
        document.getElementById('btnAddLine').focus();
      } else {
        document.getElementById('btnAddLine2').focus();
      }
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
      this.gridPurchaseInvoiceLines.gridRef.isEdit &&
      !e.closest('.edit-value') &&
      !e.closest('.e-gridcontent')
    ) {
      this.gridPurchaseInvoiceLines.endEdit();
    }

    if (!e.closest('.card-footer')) {
      const el = document.querySelector('#footer');
      el.classList.remove('expand');
      el.classList.add('collape');
    }
  }
  //#endregion

  //#region Method
  copyRow(
    data: any,
    dataService: CRUDService,
    grid: CodxGridviewV2Component,
    dataSource: any[]
  ): void {
    dataService.dataSelected = { ...data };
    dataService.copy().subscribe((res) => {
      grid.addRow(res, dataSource.length);
    });
  }

  editRow(data: any, grid: CodxGridviewV2Component): void {
    grid.gridRef.selectRow(Number(data.index));
    grid.gridRef.startEdit();
  }

  deleteRow(
    data: any,
    dataService: CRUDService,
    grid: CodxGridviewV2Component
  ): void {
    dataService.delete([data]).subscribe((res: any) => {
      if (res.error === false) {
        grid.deleteRow(data, true);
      }
    });
  }

  handleMasterChange(field: string): void {
    this.api
      .exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
        field,
        this.master,
      ])
      .subscribe((res: any) => {
        console.log(res);

        this.master = Object.assign(this.master, res);
        this.prevMaster = { ...this.master };
        this.form.formGroup.patchValue(res);
      });
  }

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

    if (this.tab.selectedItem === 0) {
      this.purchaseInvoiceLineService
        .addNew(() =>
          this.api.exec<any>(
            'AC',
            'PurchaseInvoicesLinesBusiness',
            'GetDefaultAsync',
            [this.master]
          )
        )
        .subscribe((res: IPurchaseInvoiceLine) => {
          if (this.journal.addNewMode === '1') {
            this.gridPurchaseInvoiceLines.addRow(res, this.lines.length);
          } else {
            // later
          }
        });
    } else {
      this.vatInvoiceService
        .addNew(() =>
          this.api.exec(
            'AC',
            'VATInvoicesBusiness',
            'SetDefaultAsync',
            this.master.recID
          )
        )
        .subscribe((newVatInvoice: IVATInvoice) => {
          if (this.journal.addNewMode === '1') {
            this.gridVatInvoices.addRow(newVatInvoice, this.vatInvoices.length);
          } else {
            // later
          }
        });
    }
  }

  resetForm(): void {
    this.masterService
      .addNew(() =>
        this.api.exec('AC', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
          this.master.journalNo,
        ])
      )
      .subscribe((res: IPurchaseInvoice) => {
        this.master = Object.assign(this.master, res);
        this.initialMaster = { ...this.master };
        this.prevMaster = { ...this.master };
        this.form.formGroup.patchValue(res);

        this.masterService.hasSaved = false;

        this.masterService.dataSelected = this.master;
        this.masterService.addDatas.set(this.master.recID, this.master);

        this.lines = [];
      });
  }
  //#endregion

  //#region Function
  openPopupLine(data, type: string) {
    var obj = {
      dataline: this.lines,
      dataPurchaseinvoices: this.master,
      headerText: this.formTitle,
      data: data,
      lockFields: this.lockFields,
      type: type,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'PurchaseInvoicesLines';
    dataModel.gridViewName = 'grvPurchaseInvoicesLines';
    dataModel.entityName = 'AC_PurchaseInvoicesLines';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('PurchaseInvoicesLines', 'grvPurchaseInvoicesLines')
      .subscribe((res) => {
        if (res) {
          var dialogs = this.callfc.openForm(
            PopAddLineComponent,
            '',
            900,
            850,
            '',
            obj,
            '',
            opt
          );
          dialogs.closed.subscribe((res) => {
            if (res.event != null) {
              var dataline = res.event['data'];
              if (dataline) {
                this.lines.push(dataline);
              }
              this.hasSaved = true;
              this.isSaveMaster = true;
            }
          });
        }
      });
  }

  genFixedDims(line: IPurchaseInvoiceLine): string {
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
