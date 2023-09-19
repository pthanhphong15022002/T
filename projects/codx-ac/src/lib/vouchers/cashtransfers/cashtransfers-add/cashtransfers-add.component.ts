import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
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
import { CodxAcService } from '../../../codx-ac.service';
import { IJournal, Vll075 } from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';
import { CashtransfersService } from '../cashtransfers.service';
import { ICashTransfer } from '../interfaces/ICashTransfer.interface';
import { IVATInvoice } from '../interfaces/IVATInvoice.interface';

@Component({
  selector: 'lib-cashtransfers-add',
  templateUrl: './cashtransfers-add.component.html',
  styleUrls: ['./cashtransfers-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashtransferAddComponent extends UIComponent {
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

  fmVATInvoice: FormModel;
  fgVatInvoice: FormGroup;
  gvsCashTransfers: any;
  gvsVATInvoices: any;

  hasInvoice: boolean = false;
  isEdit: boolean = false;

  formTitle: string;

  cashBookName1: string = '';
  cashBookName2: string = '';
  reasonName: string;
  baseCurr: string;
  tabs: TabModel[] = [
    { name: 'history', textDefault: 'Lịch sử', isActive: false },
    { name: 'comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'link', textDefault: 'Liên kết', isActive: false },
  ];
  journal: IJournal;
  hiddenFields: string[] = [];
  ignoredFields: string[] = [];

  constructor(
    injector: Injector,
    private acService: CodxAcService,
    private journalService: JournalService,
    cashTransferService: CashtransfersService,
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

    this.fmVATInvoice = cashTransferService.fmVATInvoice;
    this.fgVatInvoice = cashTransferService.fgVatInvoice;
    this.invoiceService = acService.createCRUDService(
      injector,
      this.fmVATInvoice,
      'AC'
    );
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .gridViewSetup(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .subscribe((gvs) => {
        this.gvsCashTransfers = gvs;

        if (this.isEdit) {
          let predicates: string = '';
          let dataValues: string[] = [];
          if (this.cashTransfer.cashBookID) {
            dataValues.push(this.cashTransfer.cashBookID);
          }
          if (this.cashTransfer.cashBookID2) {
            dataValues.push(this.cashTransfer.cashBookID2);
          }
          for (let i = 0; i < dataValues.length; i++) {
            predicates +=
              `CashBookID=@${i}` + (i !== dataValues.length - 1 ? ' or ' : '');
          }

          this.acService
            .loadComboboxData$(
              gvs.CashBookID.referedValue,
              'AC',
              predicates,
              dataValues.join(';')
            )
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
        }
      });

    this.cache
      .gridViewSetup(this.fmVATInvoice.formName, this.fmVATInvoice.gridViewName)
      .subscribe((res) => {
        this.gvsVATInvoices = res;
      });

    this.cache.companySetting().subscribe((res) => {
      this.baseCurr = res[0]?.baseCurr;
    });

    this.journalService
      .getJournal$(this.cashTransfer.journalNo)
      .subscribe((res) => {
        this.journal = res;

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

        if (this.journal.assignRule === Vll075.TuDongKhiLuu) {
          this.ignoredFields.push('VoucherNo');
        }

        this.hiddenFields = this.journalService.getHiddenFields(this.journal);

        if (this.isEdit) {
          // load vatInvoice
          const options = new DataRequest();
          options.entityName = 'AC_VATInvoices';
          options.pageLoading = false;
          options.predicates = 'TransID=@0';
          options.dataValues = this.cashTransfer.recID;
          this.acService.loadData$('AC', options).subscribe((res: any) => {
            if (res) {
              this.hasInvoice = true;
              this.detectorRef.markForCheck();

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
    this.detectorRef.markForCheck();
  }
  //#endregion

  //#region Event
  onInputChange(e): void {
    console.log('onInputChange', e);

    // e.data for valueChange and e.crrValue for controlBlur
    if (!e.data && !e.crrValue) {
      return;
    }

    const field: string = e.field.toLowerCase();

    if (field === 'cashbookid2') {
      this.cashBookName2 = e.component.itemsSelected[0]?.CashBookName;
      this.form.formGroup.patchValue({
        memo: this.generateMemo(),
      });
      return;
    }

    if (field === 'reasonid') {
      this.reasonName = e.component.itemsSelected[0]?.ReasonName;
      this.form.formGroup.patchValue({
        memo: this.generateMemo(),
      });
      return;
    }

    if (field === 'cashbookid') {
      this.cashBookName1 = e.component.itemsSelected[0]?.CashBookName;
      this.form.formGroup.patchValue({
        memo: this.generateMemo(),
      });
    }

    const postFields: string[] = ['currencyid', 'cashbookid'];
    if (postFields.includes(field)) {
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

  // for switch only
  onKeyUpEnter(): void {
    this.form.formGroup.patchValue({
      feeControl: !this.cashTransfer.feeControl,
    });
  }

  // for switch only
  onKeyUpEnter2(): void {
    this.switchHasInvoice.toggle();
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

      this.handleDataBeforeSavingMaster();

      this.journalService.checkVoucherNoBeforeSave(
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

  onClickDiscard() {
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

    this.handleDataBeforeSavingMaster();

    this.journalService.checkVoucherNoBeforeSave(
      this.journal,
      this.cashTransfer,
      'AC',
      'AC_CashTranfers',
      this.form,
      this.masterService.hasSaved,
      () => this.save(closeAfterSave)
    );
  }

  @HostListener('click', ['$event.target'])
  onClick(e: HTMLElement): void {
    if (!e.closest('.card-footer')) {
      const el = document.querySelector('#footer');
      el.classList.remove('expand');
      el.classList.add('collape');
    }
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
        this.api.exec('AC', 'CashTranfersBusiness', 'GetDefaultAsync', [
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

  handleDataBeforeSavingMaster(): void {
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

  generateMemo(): string {
    const memo: string[] = [];
    if (this.cashBookName1) {
      memo.push(this.cashBookName1);
    }

    if (this.reasonName) {
      memo.push(this.reasonName);
    }

    if (this.cashBookName2) {
      memo.push(this.cashBookName2);
    }

    return memo.join(' - ');
  }
  //#endregion
}
