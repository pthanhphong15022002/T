import { Component, Injector, Optional, ViewChild } from '@angular/core';
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
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Observable, tap } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';
import { ISalesInvoice } from '../interfaces/ISalesInvoice.interface';
import { ISalesInvoicesLine } from '../interfaces/ISalesInvoicesLine.interface';
import { PopupAddSalesInvoicesLineComponent } from '../popup-add-sales-invoices-line/popup-add-sales-invoices-line.component';
import { SalesInvoiceService } from '../sales-invoices.service';

@Component({
  selector: 'lib-popup-add-sales-invoice',
  templateUrl: './popup-add-sales-invoice.component.html',
  styleUrls: ['./popup-add-sales-invoice.component.css'],
})
export class PopupAddSalesInvoiceComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('grid') grid: CodxGridviewV2Component;

  salesInvoice: ISalesInvoice = {} as ISalesInvoice;
  salesInvoicesLines: ISalesInvoicesLine[] = [];
  masterService: CRUDService;
  detailService: CRUDService;
  formTitle: string;
  isEdit: boolean = false;
  voucherNoPlaceholderText$: Observable<string>;
  journal: IJournal;
  customerName: string;
  gvsSalesInvoices: any;
  gvsSalesInvoicesLines: any;
  hiddenFields: string[] = [];
  ignoredFields: string[] = [];
  columns: any[] = [];
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
  fmSalesInvoicesLines: FormModel = {
    entityName: 'SM_SalesInvoicesLines',
    formName: 'SalesInvoicesLines',
    gridViewName: 'grvSalesInvoicesLines',
    entityPer: 'SM_SalesInvoicesLines',
  };

  constructor(
    private injector: Injector,
    private acService: CodxAcService,
    private journalService: JournalService,
    private salesInvoiceService: SalesInvoiceService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    console.log(this.dialogRef);

    this.masterService = dialogRef.dataService;
    this.formTitle = dialogData.data.formTitle;
    this.isEdit = dialogData.data.formType === 'edit';
    this.masterService.hasSaved = this.isEdit;
    this.salesInvoice = this.dialogRef.dataService?.dataSelected;

    // create a CRUDService for SM_SalesInvoicesLines
    this.detailService = acService.createCrudService(
      injector,
      this.fmSalesInvoicesLines,
      'SM'
    );
  }
  //#endregion

  //#region Init
  override onInit(): void {
    // this.cache
    //   .gridViewSetup('SalesInvoicesLines', 'grvSalesInvoicesLines')
    //   .pipe(
    //     map((g) =>
    //       Object.entries(g)
    //         .map(([k, v]) => v)
    //         .filter((c: any) => c.isVisible === true)
    //         .sort((a: any, b: any) => a.columnOrder - b.columnOrder)
    //     ),
    //     tap((t) => console.log(t))
    //   )
    //   .subscribe((res) => (this.columns = res));

    this.acService.loadComboboxData('ObjectsAC', 'AC').subscribe((objects) => {
      this.customerName = objects?.find(
        (o) => o.ObjectID === this.salesInvoice.objectID
      )?.ObjectName;
    });

    this.voucherNoPlaceholderText$ =
      this.journalService.getVoucherNoPlaceholderText();

    const journalOptions = new DataRequest();
    journalOptions.entityName = 'AC_Journals';
    journalOptions.predicates = 'JournalNo=@0';
    journalOptions.dataValues = this.salesInvoice.journalNo;
    journalOptions.pageLoading = false;
    this.acService.loadDataAsync('AC', journalOptions).subscribe((res) => {
      this.journal = res[0]?.dataValue
        ? { ...res[0], ...JSON.parse(res[0].dataValue) }
        : res[0];

      this.editSettings.mode =
        this.journal.inputMode == '2' ? 'Dialog' : 'Normal';

      if (this.journal.voucherNoRule === '2') {
        this.ignoredFields.push('VoucherNo');
      }

      this.hiddenFields = this.journalService.getHiddenFields(this.journal);
    });

    if (this.isEdit) {
      const salesInvoicesLinesOptions = new DataRequest();
      salesInvoicesLinesOptions.entityName = 'SM_SalesInvoicesLines';
      salesInvoicesLinesOptions.predicates = 'TransID=@0';
      salesInvoicesLinesOptions.dataValues = this.salesInvoice.recID;
      salesInvoicesLinesOptions.pageLoading = false;
      this.acService
        .loadDataAsync('SM', salesInvoicesLinesOptions)
        .subscribe(
          (res) =>
            (this.salesInvoicesLines = res.sort((a, b) => a.rowNo - b.rowNo))
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

    this.cache
      .gridViewSetup(
        this.fmSalesInvoicesLines.formName,
        this.fmSalesInvoicesLines.gridViewName
      )
      .subscribe((res) => {
        this.gvsSalesInvoicesLines = res;
      });
  }
  //#endregion

  //#region Event
  onClickSave(closeAfterSaving: boolean): void {
    console.log(this.salesInvoice);
    console.log(this.salesInvoicesLines);

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

    // for (const salesInvoiceLine of this.salesInvoicesLines) {
    //   if (
    //     !this.acService.validateFormDataUsingGvs(
    //       this.gvsSalesInvoicesLines,
    //       salesInvoiceLine,
    //       ['umid', 'vatid', 'idiM4']
    //     )
    //   ) {
    //     return;
    //   }
    // }

    this.journalService.handleVoucherNoAndSave(
      this.journal,
      this.salesInvoice,
      'SM',
      'SM_SalesInvoices',
      this.form,
      this.masterService.hasSaved,
      () => this.save(closeAfterSaving)
    );
  }

  onClickClose(): void {
    this.dialogRef.close();
  }

  onDiscard(): void {
    this.masterService
      .delete([this.salesInvoice], true, null, '', 'AC0010', null, null, false)
      .subscribe((res: any) => {
        console.log({ res });
        if (!res.error) {
          this.salesInvoiceService.deleteLinesByTransID(
            this.salesInvoice.recID
          );

          this.resetForm();
        }
      });
  }

  onInputChange(e): void {
    if (e.field.toLowerCase() === 'objectid') {
      this.customerName = e.component.itemsSelected[0].ObjectName;
    }
  }

  onCreate(e): void {
    this.grid.disableField(this.hiddenFields);
    // console.log(this.grid.columnsGrid);
  }

  onCellChange(e): void {
    console.log('onCellChange', e);
  }

  onClickDeleteRow(data): void {
    this.grid.deleteRow(data, true);
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
      this.masterService.updateDatas.set(
        this.salesInvoice.recID,
        this.salesInvoice
      );
    }
    this.journalService.handleVoucherNoAndSave(
      this.journal,
      this.salesInvoice,
      'SM',
      'SM_SalesInvoices',
      this.form,
      this.masterService.hasSaved,
      () => this.addRow()
    );
  }

  onClickCopyRow(data): void {
    this.grid.addRow(
      {
        ...data,
        rowNo: this.salesInvoicesLines.length + 1,
        recID: Util.uid(),
        transID: '00000000-0000-0000-0000-000000000000',
      },
      this.salesInvoicesLines.length
    );
  }
  //#endregion

  //#region Method
  save(closeAfterSaving: boolean): void {
    this.salesInvoice.status = '1';

    if (this.masterService.hasSaved) {
      this.masterService.updateDatas.set(
        this.salesInvoice.recID,
        this.salesInvoice
      );
    }

    this.masterService.save().subscribe((res: any) => {
      if (res.save.data || res.update.data) {
        if (closeAfterSaving) {
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

          this.detailService.addNew().subscribe((res: ISalesInvoicesLine) => {
            console.log(res);

            let index = this.salesInvoicesLines.length;
            res.rowNo = index + 1;
            res.transID = this.salesInvoice.recID;

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
                    gvs: this.gvsSalesInvoicesLines,
                    hiddenFields: this.hiddenFields,
                  },
                  '',
                  dialogModel
                )
                .closed.pipe(tap((t) => console.log(t)))
                .subscribe(({ event }) => {
                  this.salesInvoicesLines = [
                    ...this.salesInvoicesLines,
                    ...event,
                  ];
                });
            }
          });
        }
      });
  }

  resetForm(): void {
    this.masterService
      .addNew(() =>
        this.api.exec('SM', 'SalesInvoicesBusiness', 'GetDefaultAsync', [
          this.dialogData.data?.journalNo,
        ])
      )
      .subscribe((res: ISalesInvoice) => {
        console.log(res);
        this.salesInvoice.recID = res.recID;
        this.salesInvoice.status = res.status;
        this.form.formGroup.patchValue(res);

        this.masterService.hasSaved = false;

        // after implementing addNew(), both this.masterService.dataSelected and this.masterService.addDatas
        // no longer point to the object referenced by this.salesInvoice,
        // so I reassign it here
        this.masterService.dataSelected = this.salesInvoice;
        this.masterService.addDatas.set(
          this.salesInvoice.recID,
          this.salesInvoice
        );

        this.salesInvoicesLines = [];
      });
  }
  //#endregion

  //#region Function
  //#endregion
}
