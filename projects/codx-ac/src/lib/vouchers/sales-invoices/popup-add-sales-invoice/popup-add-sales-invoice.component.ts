import { Component, Injector, Optional, ViewChild } from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import {
  CodxFormComponent,
  CodxGridviewV2Component,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  RequestOption,
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
  deletedSalesInvoicesLines: ISalesInvoicesLine[] = [];
  formTitle: string;
  isEdit: boolean = false;
  voucherNoPlaceholderText$: Observable<string>;
  journal: IJournal;
  customerName: string;
  gvsSalesInvoices: any;
  gvsSalesInvoicesLines: any;
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
  };

  constructor(
    private injector: Injector,
    private acService: CodxAcService,
    private journalService: JournalService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.formTitle = dialogData.data.formTitle;
    this.isEdit = dialogData.data.formType === 'edit';
    this.salesInvoice = this.dialogRef.dataService?.dataSelected;
  }
  //#endregion

  //#region Init
  override onInit(): void {
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

      // if (this.isEdit) {
      //   this.hiddenFields = this.journalService.getHiddenFields(this.journal);
      // }
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

    let ignoredFields = [];
    if (this.journal.voucherNoRule === '2') {
      ignoredFields.push('VoucherNo');
    }

    if (
      !this.acService.validateFormData(
        this.form.formGroup,
        this.gvsSalesInvoices,
        [],
        ignoredFields
      )
    ) {
      return;
    }

    for (const salesInvoiceLine of this.salesInvoicesLines) {
      if (
        !this.acService.validateFormDataUsingGvs(
          this.gvsSalesInvoicesLines,
          salesInvoiceLine,
          ['umid', 'vatid', 'idiM4']
        )
      ) {
        return;
      }
    }

    // if this voucherNo already exists,
    // the system will automatically suggest another voucherNo
    this.journalService.handleVoucherNoAndSave(
      this.journal,
      this.salesInvoice,
      'SM',
      'SM_SalesInvoices',
      this.form,
      this.isEdit,
      () => this.save(closeAfterSaving)
    );
  }

  onClickClose(): void {
    this.dialogRef.close();
  }

  onInputChange(e): void {
    if (e.field.toLowerCase() === 'objectid') {
      this.customerName = e.component.itemsSelected[0].ObjectName;
    }
  }

  onCreate(e): void {}

  onCellChange(e): void {
    console.log('onCellChange', e);
  }

  onClickDeleteRow(data): void {
    this.deletedSalesInvoicesLines.push(data);
    this.grid.deleteRow(data, true);
  }

  onClickAddRow(): void {
    this.api
      .exec('SM', 'SalesInvoicesLinesBusiness', 'GetDefault')
      .subscribe((res: ISalesInvoicesLine) => {
        console.log(res);

        let index = this.salesInvoicesLines.length;
        res.rowNo = index + 1;

        if (this.editSettings.mode === 'Normal') {
          this.grid.addRow(res, index);
        } else {
          const dialogModel = new DialogModel();
          dialogModel.FormModel = this.fmSalesInvoicesLines;

          this.callfc
            .openForm(
              PopupAddSalesInvoicesLineComponent,
              'This param is not working',
              500,
              700,
              '',
              {
                formType: 'add',
                salesInvoicesLine: res,
                index: index,
                gvs: this.gvsSalesInvoicesLines,
              },
              '',
              dialogModel
            )
            .closed.pipe(tap((t) => console.log(t)))
            .subscribe(({ event }) => {
              if (this.editSettings.mode === 'Normal') {
                for (const line of event) {
                  this.grid.addRow(line, this.salesInvoicesLines.length);
                }
              } else {
                this.salesInvoicesLines = [
                  ...this.salesInvoicesLines,
                  ...event,
                ];
              }
            });
        }
      });
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

  // dialog mode only
  onDeleteRow(e): void {
    console.log(e);
    this.deletedSalesInvoicesLines.push(e);
    this.salesInvoicesLines = this.salesInvoicesLines.filter(
      (l) => l.recID !== e.recID
    );
  }

  onUpdateRow(e): void {
    const index = this.salesInvoicesLines.findIndex((l) => l.recID === e.recID);
    this.salesInvoicesLines[index] = e;
  }

  onCopyRow(e): void {
    this.salesInvoicesLines = [...this.salesInvoicesLines, ...e];
  }
  //#endregion

  //#region Method
  save(closeAfterSaving: boolean): void {
    this.dialogRef.dataService
      .save((req: RequestOption) => {
        req.methodName = !this.isEdit ? 'AddAsync' : 'UpdateAsync';
        req.className = 'SalesInvoicesBusiness';
        req.assemblyName = 'ERM.Business.SM';
        req.service = 'SM';
        req.data = !this.isEdit
          ? [this.salesInvoice, this.salesInvoicesLines]
          : [
              this.salesInvoice,
              this.salesInvoicesLines,
              this.deletedSalesInvoicesLines,
            ];

        return true;
      })
      .subscribe((res) => {
        if (res.save || res.update) {
          if (closeAfterSaving) {
            this.dialogRef.close();
          } else {
            this.dialogRef.dataService
              .addNew(() =>
                this.api.exec(
                  'SM',
                  'SalesInvoicesBusiness',
                  'GetDefaultAsync',
                  [this.dialogData.data?.journalNo]
                )
              )
              .subscribe((res: ISalesInvoice) => {
                console.log(res);
                this.form.formGroup.patchValue(res);

                this.salesInvoicesLines = [];
              });
          }
        }
      });
  }
  //#endregion

  //#region Function
  //#endregion
}
