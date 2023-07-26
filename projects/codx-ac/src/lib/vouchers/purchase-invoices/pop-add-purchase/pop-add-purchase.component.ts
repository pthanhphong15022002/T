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
import { FormGroup } from '@angular/forms';
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
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';
import { PurchaseInvoicesLines } from '../../../models/PurchaseInvoicesLines.model';
import { VATInvoices } from '../../../models/VATInvoices.model';
import { IPurchaseInvoice } from '../interfaces/IPurchaseInvoice.inteface';
import { IPurchaseInvoiceLine } from '../interfaces/IPurchaseInvoiceLine.interface';
import { PopAddLineComponent } from '../pop-add-line/pop-add-line.component';

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

  master: IPurchaseInvoice;
  prevMaster: IPurchaseInvoice;
  lines: IPurchaseInvoiceLine[] = [];
  vatInvoices: VATInvoices[] = [];
  masterService: CRUDService;
  purchaseInvoiceLineService: CRUDService;
  vatInvoiceService: CRUDService;
  grvPurchaseInvoices: any;
  grvPurchaseInvoicesLines: any;

  isEdit: boolean = false;
  journal: IJournal;
  ignoredFields: string[] = [];
  hiddenFields: string[] = [];
  formTitle: string;
  validate: any = 0;
  vatType: string;
  hasSaved: any = false;
  isSaveMaster: any = false;
  expanded: boolean = false;
  purchaseInvoicesLinesDelete: Array<PurchaseInvoicesLines> = [];
  vatinvoices: VATInvoices = new VATInvoices();
  isInvoiceRefHidden: boolean = true;
  lineSubject = new Subject<IPurchaseInvoiceLine[]>();
  fmVATInvoices: FormModel = {
    entityName: 'AC_VATInvoices',
    formName: 'VATInvoices',
    gridViewName: 'grvVATInvoices',
    entityPer: 'AC_VATInvoices',
  };
  fmPurchaseInvoicesLines: FormModel = {
    entityName: 'AC_PurchaseInvoicesLines',
    formName: 'PurchaseInvoicesLines',
    gridViewName: 'grvPurchaseInvoicesLines',
    entityPer: 'AC_PurchaseInvoicesLines',
  };
  fgVATInvoices: FormGroup;
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
  keymodel: any = [];
  lsVatCode: any;
  journals: any;
  totalnet: any = 0;
  totalvat: any = 0;
  total: any = 0;
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
    @Optional() public dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);

    this.formTitle = dialogData.data?.formTitle;

    this.masterService = dialog.dataService;
    this.master = dialog.dataService?.dataSelected;
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

    this.lineSubject.subscribe((lines: IPurchaseInvoiceLine[]) => {
      this.isInvoiceRefHidden = lines.find((l) => l.vatid) ? false : true;
    });

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
      const options = new DataRequest();
      options.entityName = this.fmPurchaseInvoicesLines.entityName;
      options.predicates = 'TransID=@0';
      options.dataValues = this.master.recID;
      options.pageLoading = false;
      this.acService.loadDataAsync('AC', options).subscribe((lines) => {
        this.lines = lines;
        this.lineSubject.next(lines);
      });
    }
  }

  ngAfterViewInit() {}
  //#endregion

  //#region Event
  clickMF(e, data) {
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
        if (!this.master.unbounds) {
          this.master.unbounds = {};
        }
        this.master.unbounds.requiresTaxUpdate = event.status === 'Y';
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
    }
  }

  valueChangeVAT(e: any) {
    this.vatinvoices[e.field] = e.data;
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
    // if (e.data?.isAddNew == null) {
    //   this.api
    //     .exec(
    //       'AC',
    //       'PurchaseInvoicesLinesBusiness',
    //       'CheckExistPurchaseInvoicesLines',
    //       [e.data.recID]
    //     )
    //     .subscribe((res: any) => {
    //       if (res) {
    //         e.data.isAddNew = res;
    //       } else {
    //         this.api
    //           .exec('AC', 'VATInvoicesBusiness', 'UpdateVATfromPurchaseAsync', [
    //             this.master,
    //             e.data,
    //           ])
    //           .subscribe(() => {});
    //       }
    //     });
    // }

    console.log('onCellChange', e);

    if (!e.data[e.field]) {
      return;
    }
  }

  cellChangedInvoice(e: any) {
    if (e.data?.isAddNew == null) {
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'CheckExistVATInvoice', [
          e.data.recID,
        ])
        .subscribe((res: any) => {
          if (res) {
            e.data.isAddNew = res;
          }
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

          return;
        }

        this.lineSubject.next(this.lines);
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

          return;
        }

        this.lineSubject.next(this.lines);
      });
  }

  onActionEvent(e): void {
    console.log('onActionEvent', e);
  }

  onClickAddRow(): void {
    console.log(this.master);

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
      () => this.addRow()
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
      !e.closest('#gridViewV2 > .e-gridcontent')
    ) {
      this.gridPurchaseInvoiceLines.endEdit();
    }
  }
  //#endregion

  //#region Method
  copyRow(data) {
    this.purchaseInvoiceLineService.dataSelected = { ...data };
    this.purchaseInvoiceLineService
      .copy()
      .subscribe((res: IPurchaseInvoiceLine) => {
        this.gridPurchaseInvoiceLines.addRow(res, this.lines.length);
      });
  }

  editRow(data) {
    this.gridPurchaseInvoiceLines.gridRef.selectRow(Number(data.index));
    this.gridPurchaseInvoiceLines.gridRef.startEdit();
  }

  deleteRow(data: IPurchaseInvoiceLine) {
    this.purchaseInvoiceLineService.delete([data]).subscribe((res: any) => {
      if (res.error === false) {
        this.gridPurchaseInvoiceLines.deleteRow(data, true);
        this.lineSubject.next(this.lines);
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

  addRow(): void {
    if (this.masterService.hasSaved) {
      this.masterService.updateDatas.set(this.master.recID, this.master);
    }
    this.masterService
      .save(null, null, null, null, false)
      .subscribe((res: any) => {
        if (res.save.data || res.update.data) {
          this.masterService.hasSaved = true;

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
        }
      });
  }

  saveVAT() {
    if (this.vatType == '1') {
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'AddVATInvoiceAsync', [
          this.vatinvoices,
        ])
        .subscribe(() => {});
    } else {
      this.vatInvoices = this.gridVatInvoices.dataSource;
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'AddLineAsync', [this.vatInvoices])
        .subscribe(() => {});
    }
  }
  updateVAT() {
    if (this.vatType == '1') {
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'UpdateVATInvoiceAsync', [
          this.vatinvoices,
        ])
        .subscribe(() => {});
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
