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
  CodxComboboxComponent,
  CodxFormComponent,
  CodxInputComponent,
  CodxService,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  UIComponent,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { BehaviorSubject } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import {
  IJournal,
  Vll075,
} from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';

@Component({
  selector: 'lib-cashtransfers-add',
  templateUrl: './cashtransfers-add.component.html',
  styleUrls: ['./cashtransfers-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashtransferAddComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('switchHasInvoice') switchHasInvoice: SwitchComponent;
  @ViewChild('diM1') diM1: CodxInputComponent;
  @ViewChild('diM2') diM2: CodxInputComponent;
  @ViewChild('diM3') diM3: CodxInputComponent;

  cashTransfer: any = {};
  vatInvoice: any = {} as any;
  masterService: CRUDService;
  invoiceService: CRUDService;

  fmVATInvoice: FormModel;
  fgVatInvoice: FormGroup;
  gvsVATInvoices: any;

  hasInvoice: boolean = false;
  isEdit: boolean = false;

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

  journalSubject = new BehaviorSubject<boolean>(false);
  vatInvoiceSubject = new BehaviorSubject<boolean>(false);

  constructor(
    injector: Injector,
    private acService: CodxAcService,
    private journalService: JournalService,
    codxService: CodxService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.isEdit = dialogData.data.formType === 'edit';
    this.masterService = this.dialogRef.dataService;
    this.cashTransfer = this.masterService?.dataSelected;
    this.cashTransfer.feeControl = Boolean(
      Number(this.cashTransfer.feeControl)
    );

    // this.fmVATInvoice = fmVATInvoice;
    // this.fgVatInvoice = codxService.buildFormGroup(
    //   fmVATInvoice.formName,
    //   fmVATInvoice.gridViewName,
    //   fmVATInvoice.entityName
    // );
    // this.invoiceService = acService.createCRUDService(
    //   injector,
    //   this.fmVATInvoice,
    //   'AC'
    // );
  }
  //#endregion

  //#region Init
  onInit(): void {
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
        this.journalSubject.next(true);

        this.hiddenFields = this.journalService.getHiddenFields(this.journal);

        if (this.isEdit) {
          // load vatInvoice
          const options = new DataRequest();
          options.entityName = 'AC_VATInvoices';
          options.pageLoading = false;
          options.predicates = 'TransID=@0';
          options.dataValues = this.cashTransfer.recID;
          this.acService.loadData$('AC', options).subscribe((res: any) => {
            if (res[0]) {
              this.hasInvoice = true;
              this.detectorRef.markForCheck();

              this.invoiceService.dataSelected = res[0];
              this.invoiceService.edit(res[0]).subscribe();
              this.vatInvoice = this.fmVATInvoice.currentData = res[0];
              this.fgVatInvoice.patchValue(res[0]);

              this.vatInvoiceSubject.next(true);
            } else {
              this.invoiceService.addNew().subscribe((res) => {
                this.vatInvoice = this.fmVATInvoice.currentData = res;
                this.fgVatInvoice.patchValue(res);

                this.vatInvoiceSubject.next(true);
              });
            }
          });
        } else {
          this.invoiceService.addNew().subscribe((res) => {
            this.vatInvoice = this.fmVATInvoice.currentData = res;
            this.fgVatInvoice.patchValue(res);

            this.vatInvoiceSubject.next(true);
          });
        }
      });
  }

  ngAfterViewInit(): void {
    this.detectorRef.markForCheck();
  }
  //#endregion

  //#region Event
  onAfterFormInit(): void {
    this.journalSubject.subscribe((loaded) => {
      if (loaded && this.journal.assignRule === Vll075.TuDongKhiLuu) {
        this.form.setRequire([
          {
            field: 'voucherNo',
            require: false,
          },
        ]);
      }
    });

    let predicates: string = '';
    let dataValues: string[] = [];
    if (this.cashTransfer.cashBookID) {
      dataValues.push(this.cashTransfer.cashBookID);
    }
    if (this.cashTransfer.cashBookID2) {
      dataValues.push(this.cashTransfer.cashBookID2);
    }

    if (dataValues.length === 0) {
      return;
    }

    for (let i = 0; i < dataValues.length; i++) {
      predicates +=
        `CashBookID=@${i}` + (i !== dataValues.length - 1 ? ' or ' : '');
    }

    this.acService
      .loadComboboxData$(
        this.form.gridviewSetup.CashBookID.referedValue,
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
          this.detectorRef.markForCheck();
        }
      });
  }

  onAfterRendering(cbx: CodxComboboxComponent, field: string): void {
    if (field === 'cashAcctID') {
      this.journalSubject.subscribe((loaded) => {
        if (!loaded) {
          return;
        }

        this.journalService.loadComboboxBy067(
          this.journal,
          'drAcctControl',
          'drAcctID',
          'AccountID',
          cbx,
          this.form.formGroup,
          'cashAcctID',
          this.isEdit
        );
      });
    } else if (field === 'offsetAcctID') {
      this.journalSubject.subscribe((loaded) => {
        if (!loaded) {
          return;
        }

        this.journalService.loadComboboxBy067(
          this.journal,
          'crAcctControl',
          'crAcctID',
          'AccountID',
          cbx,
          this.form.formGroup,
          'offsetAcctID',
          this.isEdit
        );
      });
    } else if (field === 'diM1') {
      this.vatInvoiceSubject.subscribe((loaded) => {
        if (!loaded) {
          return;
        }

        this.journalService.loadComboboxBy067(
          this.journal,
          'diM1Control',
          'diM1',
          'DepartmentID',
          cbx,
          this.fgVatInvoice,
          'diM1',
          this.isEdit
        );
      });
    } else if (field === 'diM2') {
      this.vatInvoiceSubject.subscribe((loaded) => {
        if (!loaded) {
          return;
        }

        this.journalService.loadComboboxBy067(
          this.journal,
          'diM2Control',
          'diM2',
          'CostCenterID',
          cbx,
          this.fgVatInvoice,
          'diM2',
          this.isEdit
        );
      });
    } else if (field === 'diM3') {
      this.vatInvoiceSubject.subscribe((loaded) => {
        if (!loaded) {
          return;
        }

        this.journalService.loadComboboxBy067(
          this.journal,
          'diM3Control',
          'diM3',
          'CostItemID',
          cbx,
          this.fgVatInvoice,
          'diM3',
          this.isEdit
        );
      });
    }
  }

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
        .subscribe((res: any) => {
          this.form.formGroup.patchValue({
            currencyID: res.currencyID,
            exchangeRate: res.exchangeRate,
            multi: res.multi,
            cashAcctID: res.cashAcctID,
          });
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
      this.form.save(null, null, null, null, false).subscribe((res: any) => {
        if (res === false || res.save?.error || res.update?.error) {
          this.switchHasInvoice.toggle();
          return;
        }

        this.detectorRef.markForCheck();

        const tempCashTransfer = res.save?.data || res.update?.data || res;
        if (tempCashTransfer) {
          this.vatInvoice.transID = tempCashTransfer.recID;
          this.vatInvoice.lineID = tempCashTransfer.recID;
        }
      });
    }
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  onDiscardClick() {
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

  onAfterValidation(): void {
    this.cashTransfer.feeControl = +this.cashTransfer.feeControl;
    this.cashTransfer.totalAmt =
      (this.cashTransfer.exchangeAmt || 0) +
      (this.cashTransfer.fees || 0) +
      (this.hasInvoice ? this.vatInvoice?.taxAmt || 0 : 0);
  }

  onSaveClick(closeAfterSave: boolean): void {
    console.log(this.cashTransfer);
    console.log(this.vatInvoice);

    if (
      this.hasInvoice &&
      !this.acService.isFormDataValid(this.fgVatInvoice, this.gvsVATInvoices)
    ) {
      return;
    }

    this.form.save(null, null, null, null, false).subscribe((res: any) => {
      if (res === false || res.save?.error || res.update?.error) {
        return;
      }

      // handle invoice
      if (this.hasInvoice) {
        // add or update
        this.invoiceService
          .save(null, null, null, null, false)
          .subscribe((res) => console.log(res));
      } else {
        // delete
        this.invoiceService
          .delete([this.vatInvoice], false, null, null, null, null, null, false)
          .subscribe();
      }

      this.api
        .exec('AC', 'CashTranfersBusiness', 'UpdateAsync', [
          this.cashTransfer,
          this.journal,
        ])
        .subscribe((master) => {
          if (!master) {
            return;
          }

          if (closeAfterSave) {
            this.masterService.update(master).subscribe();
            this.dialogRef.close();
          } else {
            this.resetForm();
          }
        });
    });
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
  resetForm(): void {
    this.masterService
      .addNew(() =>
        this.api.exec('AC', 'CashTranfersBusiness', 'GetDefaultAsync', [
          this.cashTransfer.journalNo,
        ])
      )
      .subscribe((res: any) => {
        this.cashBookName1 = '';
        this.cashBookName2 = '';

        // reset master
        this.form.data =
          this.form.formModel.currentData =
          this.cashTransfer =
            res;
        this.form.formGroup.patchValue(res);

        // reset detail
        if (this.hasInvoice) {
          this.switchHasInvoice.toggle();
        }
        this.invoiceService.addNew().subscribe((res) => {
          this.vatInvoice = this.fmVATInvoice.currentData = res;
          this.fgVatInvoice.patchValue(res);

          setTimeout(() => {
            this.loadDims(); // bùa
          });
        });
      });
  }
  //#endregion

  //#region Function
  getCashBookNameById(cashBooks: any[], id: string): string {
    return cashBooks?.find((c) => c.CashBookID === id)?.CashBookName;
  }

  loadDims(): void {
    if (!this.hiddenFields.includes('DIM1')) {
      this.journalService.loadComboboxBy067(
        this.journal,
        'diM1Control',
        'diM1',
        'DepartmentID',
        this.diM1.ComponentCurrent as CodxComboboxComponent,
        this.fgVatInvoice,
        'diM1',
        this.isEdit
      );
    }
    
    if (!this.hiddenFields.includes("DIM2")) {
      this.journalService.loadComboboxBy067(
        this.journal,
        'diM2Control',
        'diM2',
        'CostCenterID',
        this.diM2.ComponentCurrent as CodxComboboxComponent,
        this.fgVatInvoice,
        'diM2',
        this.isEdit
      );
    }
    
    if (!this.hiddenFields.includes("DIM3")) {
      this.journalService.loadComboboxBy067(
        this.journal,
        'diM3Control',
        'diM3',
        'CostItemID',
        this.diM3.ComponentCurrent as CodxComboboxComponent,
        this.fgVatInvoice,
        'diM3',
        this.isEdit
      );
    }
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
