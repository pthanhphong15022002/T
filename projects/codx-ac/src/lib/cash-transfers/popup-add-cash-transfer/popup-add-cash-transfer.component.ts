import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { map } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { ICashTransfer } from '../interfaces/ICashTransfer.interface';
import { IVATInvoice } from '../interfaces/IVATInvoice.interface';

@Component({
  selector: 'lib-popup-add-cash-transfer',
  templateUrl: './popup-add-cash-transfer.component.html',
  styleUrls: ['./popup-add-cash-transfer.component.css'],
})
export class PopupAddCashTransferComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  cashTransfer: ICashTransfer = {} as ICashTransfer;
  vatInvoice: IVATInvoice = {} as IVATInvoice;
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
    entityPer: 'VATInvoices',
  };
  cashBooks: any[];
  gvsCashTransfers: any;
  gvsVATInvoices: any;
  isEdit: boolean = false;

  constructor(
    private injector: Injector,
    private notiService: NotificationsService,
    private acService: CodxAcService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.formTitle = dialogData.data.formTitle;
    this.isEdit = dialogData.data.formType === 'edit';
    this.cashTransfer = this.dialogRef.dataService?.dataSelected;

    this.cashTransfer.feeControl = Boolean(
      Number(this.cashTransfer.feeControl)
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

    if (this.isEdit) {
      // load vatInvoice
      const options = new DataRequest();
      options.entityName = 'AC_VATInvoices';
      options.page = 1;
      this.api
        .execSv('AC', 'Core', 'DataBusiness', 'LoadDataAsync', options)
        .pipe(
          map((invoices) =>
            invoices[0].find((i) => i.transID === this.cashTransfer.recID)
          )
        )
        .subscribe((res) => {
          if (res) {
            this.vatInvoice = res;
            this.hasInvoice = true;
          }
        });
    }
  }

  ngAfterViewInit(): void {
    // this.form.formGroup.patchValue(this.cashTransfer);
  }
  //#endregion

  //#region Event
  handleInputChange(e, prop: string = 'cashTransfer') {
    let field = e.field.toLowerCase();

    if (e.field) {
      this[prop][e.field] =
        e.field === 'invoiceDate' ? e.data?.fromDate : e.data;
    } else {
      this[prop] = e.data;
    }

    if (e.field.toLowerCase() === 'cashbookid') {
      this.cashBookName1 = e.component.itemsSelected[0].CashBookName;
    }

    if (e.field.toLowerCase() === 'cashbookid2') {
      this.cashBookName2 = e.component.itemsSelected[0].CashBookName;
    }

    const fields: string[] = ['currencyid', 'cashbookid', 'payamount2'];

    if (fields.includes(field)) {
      this.api
        .exec('AC', 'CashTranfersBusiness', 'ValueChangedAsync', [
          e.field,
          this.cashTransfer,
        ])
        .subscribe((res: ICashTransfer) => {
          if (res) {
            this.form.formGroup.patchValue({
              currencyID: res.currencyID,
              exchangeRate: res.exchangeRate,
              multi: res.multi,
              payAmount2: res.payAmount2,
            });
          }
        });
    }
  }

  payAmountChanged(e) {
    console.log(e);

    this.api
      .exec('AC', 'CashTranfersBusiness', 'ValueChangedAsync', [
        e.field,
        this.cashTransfer,
      ])
      .subscribe((res: ICashTransfer) => {
        if (res) {
          this.form.formGroup.patchValue({
            exchangeRate: res.exchangeRate,
            multi: res.multi,
            payAmount2: res.payAmount2,
          });
        }
      });
  }

  close() {
    this.dialogRef.close();
  }
  //#endregion

  //#region Method
  save(closeAfterSaving: boolean): void {
    console.log(this.cashTransfer);
    console.log(this.vatInvoice);

    if (
      !this.acService.validateFormData(
        this.form.formGroup,
        this.gvsCashTransfers
      )
    ) {
      return;
    }

    if (
      this.hasInvoice &&
      !this.validateVATInvoice(this.gvsVATInvoices, this.vatInvoice)
    ) {
      return;
    }

    this.cashTransfer.feeControl = +this.cashTransfer.feeControl;
    this.cashTransfer.totalAmount =
      (this.cashTransfer?.payAmount || 0) +
      (this.cashTransfer?.paymentFees || 0) +
      (this.hasInvoice ? this.vatInvoice?.taxAmt || 0 : 0);

    this.dialogRef.dataService
      .save((req: RequestOption) => {
        req.methodName = !this.isEdit
          ? 'AddCashTransferAsync'
          : 'UpdateCashTransferAsync';
        req.className = 'CashTranfersBusiness';
        req.assemblyName = 'ERM.Business.AC';
        req.service = 'AC';
        req.data = [this.cashTransfer, this.vatInvoice];

        return true;
      })
      .subscribe((res) => {
        if (res.save || res.update) {
          const tempCashTransfer = res.save || res.update;

          // handle invoice
          if (this.hasInvoice) {
            this.vatInvoice.taxBase = this.vatInvoice.taxBase || 0;
            this.vatInvoice.taxAmt = this.vatInvoice.taxAmt || 0;

            if (this.vatInvoice.transID) {
              // update
              this.crudVatInvoice('UpdateVATInvoiceAsync', this.vatInvoice);
            } else {
              // add
              this.vatInvoice.transID = tempCashTransfer.recID;
              this.crudVatInvoice('AddVATInvoiceAsync', this.vatInvoice);
            }
          } else {
            if (this.vatInvoice.transID) {
              // delete
              this.crudVatInvoice('DeleteVATInvoiceAsync', this.vatInvoice);
            }
          }

          // handle closing
          if (closeAfterSaving) {
            this.dialogRef.close();
          } else {
            delete this.cashTransfer.recID;

            this.dialogRef.dataService
              .addNew(() =>
                this.api.exec('AC', 'CashTranfersBusiness', 'SetDefaultAsync', [
                  this.dialogData.data.parentID,
                ])
              )
              .subscribe((res: ICashTransfer) => {
                console.log(res);
                this.form.formGroup.patchValue(res);
              });

            this.vatInvoice = {} as IVATInvoice;
            this.hasInvoice = false;
          }
        }
      });
  }

  crudVatInvoice(methodName: string, vatInvoice: IVATInvoice) {
    this.api
      .exec('AC', 'VATInvoicesBusiness', methodName, vatInvoice)
      .subscribe((res) => {
        console.log(res);
      });
  }
  //#endregion

  //#region Function
  getCashBookNameById(cashBooks: any[], id: string): string {
    return cashBooks?.find((c) => c.CashBookID === id)?.CashBookName;
  }

  validateVATInvoice(gvsVATInvoices, vatInvoice): boolean {
    let isValid = true;
    for (const prop in gvsVATInvoices) {
      if (gvsVATInvoices[prop].isRequire) {
        console.log(prop);
        if (
          gvsVATInvoices[prop].datatype === 'String' &&
          !vatInvoice[this.acService.toCamelCase(prop)]?.trim()
        ) {
          this.notiService.notifyCode(
            'SYS009',
            0,
            `"${this.gvsVATInvoices[prop]?.headerText}"`
          );

          isValid = false;
        }
      }
    }

    return isValid;
  }
  //#endregion
}
