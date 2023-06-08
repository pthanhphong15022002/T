import { Component, Injector, Optional, ViewChild } from '@angular/core';
import { SwitchComponent } from '@syncfusion/ej2-angular-buttons';
import {
  CRUDService,
  CodxFormComponent,
  CodxInputComponent,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  UIComponent,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Observable, map } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';
import { ICashTransfer } from '../interfaces/ICashTransfer.interface';
import { IVATInvoice } from '../interfaces/IVATInvoice.interface';
import { CashTransferService } from '../cash-transfers.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-popup-add-cash-transfer',
  templateUrl: './popup-add-cash-transfer.component.html',
  styleUrls: ['./popup-add-cash-transfer.component.css'],
})
export class PopupAddCashTransferComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('cbxCashAcctID') cbxCashAcctID: CodxInputComponent;
  @ViewChild('cbxOffsetAcctID') cbxOffsetAcctID: CodxInputComponent;
  @ViewChild('switchHasInvoice') switchHasInvoice: SwitchComponent;
  @ViewChild('diM1') diM1: CodxInputComponent;
  @ViewChild('diM2') diM2: CodxInputComponent;
  @ViewChild('diM3') diM3: CodxInputComponent;

  cashTransfer: ICashTransfer = {} as ICashTransfer;
  vatInvoice: IVATInvoice = {} as IVATInvoice;
  masterService: CRUDService;
  invoiceService: CRUDService;
  formTitle: string;
  hasInvoice: boolean = false;
  cashBookName1: string = '';
  cashBookName2: string = '';
  tabs: TabModel[] = [
    { name: 'history', textDefault: 'Lịch sử', isActive: false },
    { name: 'comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'link', textDefault: 'Liên kết', isActive: false },
  ];
  fmVATInvoice: FormModel = {
    entityName: 'AC_VATInvoices',
    formName: 'VATInvoices',
    gridViewName: 'grvVATInvoices',
    entityPer: 'AC_VATInvoices',
  };
  fgVatInvoice: FormGroup;
  cashBooks: any[];
  gvsCashTransfers: any;
  gvsVATInvoices: any;
  isEdit: boolean = false;
  voucherNoPlaceholderText$: Observable<string>;
  journal: IJournal;
  hiddenFields: string[] = [];
  ignoredFields: string[] = [];

  constructor(
    injector: Injector,
    private acService: CodxAcService,
    private journalService: JournalService,
    private cashTransferService: CashTransferService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.formTitle = dialogData.data.formTitle;
    this.isEdit = dialogData.data.formType === 'edit';
    this.masterService = this.dialogRef.dataService;
    this.masterService.hasSaved = this.isEdit;
    this.cashTransfer = this.masterService?.dataSelected;
    this.cashTransfer.feeControl = Boolean(
      Number(this.cashTransfer.feeControl)
    );

    this.invoiceService = acService.createCrudService(
      injector,
      this.fmVATInvoice,
      'AC'
    );

    this.fgVatInvoice = this.codxService.buildFormGroup(
      this.fmVATInvoice.formName,
      this.fmVATInvoice.gridViewName,
      this.fmVATInvoice.entityName
    );
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.acService
      .loadComboboxData('CashBooks', 'AC')
      .subscribe((cashBooks) => {
        if (cashBooks) {
          this.cashBookName1 = this.getCashBookNameById(
            cashBooks,
            this.cashTransfer?.cashBookID
          );
          this.cashBookName2 = this.getCashBookNameById(
            cashBooks,
            this.cashTransfer?.cashBookID2
          );
        }
      });

    this.cache
      .gridViewSetup(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .subscribe((res) => {
        this.gvsCashTransfers = res;
      });

    this.cache
      .gridViewSetup(this.fmVATInvoice.formName, this.fmVATInvoice.gridViewName)
      .subscribe((res) => {
        console.log(res);
        this.gvsVATInvoices = res;
      });

    this.voucherNoPlaceholderText$ =
      this.journalService.getVoucherNoPlaceholderText();

    this.journalService
      .getJournal(this.cashTransfer.journalNo)
      .subscribe((res) => {
        this.journal = res?.dataValue
          ? { ...res, ...JSON.parse(res.dataValue) }
          : res;

        this.journalService.loadComboboxBy067(
          this.journal,
          'drAcctControl',
          'drAcctID',
          this.cbxCashAcctID,
          'AccountID',
          this.form.formGroup,
          'cashAcctID',
          this.isEdit
        );
        this.journalService.loadComboboxBy067(
          this.journal,
          'crAcctControl',
          'crAcctID',
          this.cbxOffsetAcctID,
          'AccountID',
          this.form.formGroup,
          'offsetAcctID',
          this.isEdit
        );

        if (this.journal.assignRule === '2') {
          this.ignoredFields.push('VoucherNo');
        }

        this.hiddenFields = this.journalService.getHiddenFields(this.journal);

        if (this.isEdit) {
          // load vatInvoice
          const options = new DataRequest();
          options.entityName = 'AC_VATInvoices';
          options.pageLoading = false;
          this.acService
            .loadDataAsync('AC', options)
            .pipe(
              map((invoices) =>
                invoices.find((i) => i.transID === this.cashTransfer.recID)
              )
            )
            .subscribe((res) => {
              if (res) {
                this.hasInvoice = true;
                this.invoiceService.dataSelected = res;
                this.invoiceService.edit(res).subscribe();
                this.vatInvoice = this.fmVATInvoice.currentData = res;
                this.fgVatInvoice.patchValue(res);

                this.loadDims(this.journal, true);
              } else {
                this.invoiceService.addNew().subscribe((res) => {
                  this.vatInvoice = this.fmVATInvoice.currentData = res;
                  this.fgVatInvoice.patchValue(res);

                  this.loadDims(this.journal, false);
                });
              }
            });
        } else {
          this.invoiceService.addNew().subscribe((res) => {
            this.vatInvoice = this.fmVATInvoice.currentData = res;
            this.fgVatInvoice.patchValue(res);

            this.loadDims(this.journal, false);
          });
        }
      });
  }

  ngAfterViewInit(): void {
    console.log(this.form.formGroup);
    console.log(this.form.formModel);
    console.log(this.fgVatInvoice);
    console.log(this.fmVATInvoice);
  }
  //#endregion

  //#region Event
  onInputChange(e): void {
    let field: string = e.field.toLowerCase();

    if (field === 'cashbookid2') {
      this.cashBookName2 = e.component.itemsSelected[0]?.CashBookName;
      return;
    }

    if (field === 'cashbookid') {
      this.cashBookName1 = e.component.itemsSelected[0]?.CashBookName;
    }

    if (['currencyid', 'cashbookid', 'exchangeamt'].includes(field)) {
      this.api
        .exec('AC', 'CashTranfersBusiness', 'ValueChangedAsync', [
          field,
          this.cashTransfer,
        ])
        .subscribe((res: ICashTransfer) => {
          if (res) {
            this.form.formGroup.patchValue({
              currencyID: res.currencyID,
              exchangeRate: res.exchangeRate,
              multi: res.multi,
              exchangeAmt2: res.exchangeAmt2,
            });
          }
        });
    }
  }

  /** Switch is checked if master data was saved successfully.*/
  onSwitchChange(e): void {
    console.log('onSwitchChange', e);

    // on off on => loi
    if (e.checked) {
      if (
        !this.acService.validateFormData(
          this.form.formGroup,
          this.gvsCashTransfers,
          [],
          this.ignoredFields
        )
      ) {
        this.switchHasInvoice.toggle();
        return;
      }

      this.handleDataBeforeSavingCashTransfer();

      this.journalService.handleVoucherNoAndSave(
        this.journal,
        this.cashTransfer,
        'AC',
        'AC_CashTranfers',
        this.form,
        this.masterService.hasSaved,
        () => {
          if (this.masterService.hasSaved) {
            this.masterService.updateDatas.set(
              this.cashTransfer.recID,
              this.cashTransfer
            );
          }
          this.masterService
            .save(null, null, null, null, false)
            .subscribe((res: any) => {
              const tempCashTransfer = res.save.data || res.update.data;
              if (tempCashTransfer) {
                this.masterService.hasSaved = true;
                this.vatInvoice.transID = tempCashTransfer.recID;
                this.vatInvoice.lineID = tempCashTransfer.recID;
              }
            });
        }
      );
    }
  }

  onClickClose() {
    this.dialogRef.close();
  }

  onDiscard() {
    this.masterService
      .delete(
        [this.cashTransfer],
        true,
        null,
        null,
        'AC0010',
        null,
        null,
        false
      )
      .subscribe((res: any) => {
        if (res?.data) {
          this.cashTransferService.deleteVatInvoiceByTransID(
            this.vatInvoice.recID
          );

          this.dialogRef.close();
        }
      });
  }

  onClickSave(closeAfterSave: boolean): void {
    console.log(this.cashTransfer);
    console.log(this.vatInvoice);
    console.log(this.form);
    console.log(this.fgVatInvoice);

    if (
      !this.acService.validateFormData(
        this.form.formGroup,
        this.gvsCashTransfers,
        [],
        this.ignoredFields
      )
    ) {
      return;
    }

    if (
      this.hasInvoice &&
      !this.acService.validateFormData(this.fgVatInvoice, this.gvsVATInvoices)
    ) {
      return;
    }

    this.handleDataBeforeSavingCashTransfer();

    this.journalService.handleVoucherNoAndSave(
      this.journal,
      this.cashTransfer,
      'AC',
      'AC_CashTranfers',
      this.form,
      this.masterService.hasSaved,
      () => this.save(closeAfterSave)
    );
  }
  //#endregion

  //#region Method
  save(closeAfterSave: boolean): void {
    this.cashTransfer.status = '1';

    if (this.masterService.hasSaved) {
      this.masterService.updateDatas.set(
        this.cashTransfer.recID,
        this.cashTransfer
      );
    }

    this.masterService.save().subscribe((res: any) => {
      console.log(res);
      if (res.save.data || res.update.data) {
        // handle invoice
        if (this.hasInvoice) {
          // add or update
          this.invoiceService
            .save(null, null, null, null, false)
            .subscribe((res) => console.log(res));
        } else {
          // delete
          this.invoiceService
            .delete(
              [this.vatInvoice],
              false,
              null,
              null,
              null,
              null,
              null,
              false
            )
            .subscribe();
        }

        // handle closing
        if (closeAfterSave) {
          this.dialogRef.close();
        } else {
          this.resetForm();
        }
      }
    });
  }

  resetForm(): void {
    this.masterService
      .addNew(() =>
        this.api.exec('AC', 'CashTranfersBusiness', 'SetDefaultAsync', [
          this.dialogData.data.journalNo,
        ])
      )
      .subscribe((res: ICashTransfer) => {
        this.cashBookName1 = '';
        this.cashBookName2 = '';

        // reset master
        this.form.formGroup.patchValue(res);
        this.form.formModel.currentData = this.cashTransfer = res;
        this.masterService.hasSaved = false;

        // reset detail
        if (this.hasInvoice) {
          this.switchHasInvoice.toggle();
        }
        this.invoiceService.addNew().subscribe((res) => {
          this.vatInvoice = this.fmVATInvoice.currentData = res;
          this.fgVatInvoice.patchValue(res);

          setTimeout(() => {
            this.loadDims(this.journal, false); // bùa
          });
        });
      });
  }
  //#endregion

  //#region Function
  getCashBookNameById(cashBooks: any[], id: string): string {
    return cashBooks?.find((c) => c.CashBookID === id)?.CashBookName;
  }

  handleDataBeforeSavingCashTransfer(): void {
    this.cashTransfer.feeControl = +this.cashTransfer.feeControl;
    this.cashTransfer.totalAmt =
      (this.cashTransfer.exchangeAmt || 0) +
      (this.cashTransfer.fees || 0) +
      (this.hasInvoice ? this.vatInvoice?.taxAmt || 0 : 0);
    this.cashTransfer.voucherNo = this.cashTransfer.voucherNo ?? '';
  }

  loadDims(journal: IJournal, isEdit: boolean) {
    this.journalService.loadComboboxBy067(
      journal,
      'diM1Control',
      'diM1',
      this.diM1,
      'DepartmentID',
      this.fgVatInvoice,
      'diM1',
      isEdit
    );
    this.journalService.loadComboboxBy067(
      journal,
      'diM2Control',
      'diM2',
      this.diM2,
      'CostCenterID',
      this.fgVatInvoice,
      'diM2',
      isEdit
    );
    this.journalService.loadComboboxBy067(
      journal,
      'diM3Control',
      'diM3',
      this.diM3,
      'CostItemID',
      this.fgVatInvoice,
      'diM3',
      isEdit
    );
  }
  //#endregion
}
