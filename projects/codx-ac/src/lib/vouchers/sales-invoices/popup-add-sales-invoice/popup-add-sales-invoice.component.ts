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
  UIComponent
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Observable } from 'rxjs';
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
  styleUrls: ['./popup-add-sales-invoice.component.css'],
})
export class PopupAddSalesInvoiceComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('grid') grid: CodxGridviewV2Component;
  @ViewChild('tableLineDetail') tableLineDetail: TableLineDetailComponent;

  salesInvoice: ISalesInvoice = {} as ISalesInvoice;
  salesInvoicesLines: ISalesInvoicesLine[] = [];
  masterService: CRUDService;
  detailService: CRUDService;
  formTitle: string;
  isEdit: boolean = false;
  voucherNoPlaceholderText$: Observable<string>;
  journal: IJournal;
  gvsSalesInvoices: any;
  gvsSalesInvoicesLines: any;
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
  fmSalesInvoicesLines: FormModel;

  constructor(
    private injector: Injector,
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
    this.voucherNoPlaceholderText$ =
      this.journalService.getVoucherNoPlaceholderText();

    this.journalService
      .getJournal(this.salesInvoice.journalNo)
      .subscribe((res) => {
        this.journal = res?.dataValue
          ? { ...res, ...JSON.parse(res.dataValue) }
          : res;

        this.editSettings.mode =
          this.journal.inputMode == '2' ? 'Dialog' : 'Normal';

        if (this.journal.assignRule === '2') {
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
  }
  //#endregion

  //#region Event
  onClickSave(closeAfterSave: boolean): void {
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

    this.journalService.handleVoucherNoAndSave(
      this.journal,
      this.salesInvoice,
      'SM',
      'SM_SalesInvoices',
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
      this.form.formGroup.patchValue({
        objectName: e.component.itemsSelected[0].ObjectName,
      });
    }
  }

  onCreate(e): void {
    this.grid.disableField(this.hiddenFields);
    // this.grid.hideColums([this.gvsSalesInvoicesLines.ItemName.headerText]);
    // console.log(this.grid.columnsGrid);
  }

  onCellChange(e): void {
    console.log('onCellChange', e);
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

  onAddNew(e): void {
    console.log('onAddNew', e);

    this.detailService
      .save(null, null, null, null, false)
      .subscribe((res) => console.log(res));
  }

  onEdit(e): void {
    console.log('onEdit', e);

    this.detailService.updateDatas.set(e.recID, e);
    this.detailService
      .save(null, null, null, null, false)
      .subscribe((res) => console.log(res));
  }

  onFocusOut(e): void {
    // for copyRow ???
    delete this.grid.rowDataSelected.createdOn;
  }
  //#endregion

  //#region Method
  save(closeAfterSave: boolean): void {
    this.salesInvoice.status = '1';

    if (this.masterService.hasSaved) {
      this.masterService.updateDatas.set(
        this.salesInvoice.recID,
        this.salesInvoice
      );
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
                    hiddenFields: this.hiddenFields,
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

      let index = this.salesInvoicesLines.length;
      res.rowNo = index + 1;
      res.transID = this.salesInvoice.recID;

      this.grid.addRow(res, index);
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
