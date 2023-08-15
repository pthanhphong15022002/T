import {
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  CodxFormComponent,
  DialogRef,
  FormModel,
  NotificationsService,
  DialogData,
  CodxInputComponent,
  CodxComboboxComponent,
} from 'codx-core';
import { PurchaseInvoicesLines } from '../../../models/PurchaseInvoicesLines.model';
import { PurchaseInvoices } from '../../../models/PurchaseInvoices.model';

@Component({
  selector: 'lib-purchaseinvoiceslines-add',
  templateUrl: './purchaseinvoiceslines-add.component.html',
  styleUrls: ['./purchaseinvoiceslines-add.component.css'],
})
export class PurchaseinvoiceslinesAddComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('idiM0') idiM0: CodxInputComponent;
  @ViewChild('idiM1') idiM1: CodxInputComponent;
  @ViewChild('idiM2') idiM2: CodxInputComponent;
  @ViewChild('idiM3') idiM3: CodxInputComponent;
  @ViewChild('idiM6') idiM6: CodxInputComponent;
  @ViewChild('idiM7') idiM7: CodxInputComponent;
  dialog!: DialogRef;
  headerText: string;
  formModel: FormModel;
  grvPurchaseInvoicesLines: any;
  validate: any = 0;
  type: any;
  lsVatCode: any;
  journals: any;
  objectIdim: any;
  lockFields: any;
  hasSave: boolean = false;
  purchaseInvoicesLines: PurchaseInvoicesLines;
  purchaseInvoices: PurchaseInvoices;
  objectPurchaseInvoicesLines: Array<PurchaseInvoicesLines> = [];
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.objectPurchaseInvoicesLines = dialogData.data?.dataline;
    this.purchaseInvoices = dialogData.data?.dataPurchaseinvoices;
    this.purchaseInvoicesLines = dialogData.data?.data;
    this.lockFields = dialogData.data?.lockFields;
    if (this.lockFields == null) {
      this.lockFields = [];
    }
    this.headerText = dialogData.data?.headerText;
    this.type = dialogData.data?.type;
    this.cache
      .gridViewSetup('PurchaseInvoicesLines', 'grvPurchaseInvoicesLines')
      .subscribe((res) => {
        if (res) {
          this.grvPurchaseInvoicesLines = res;
        }
      });
    this.api
      .exec('BS', 'VATCodesBusiness', 'LoadAllDataAsync')
      .subscribe((res: any) => {
        if (res != null) {
          this.lsVatCode = res;
        }
      });
  }

  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.purchaseInvoicesLines);
  }

  valueChange(e) {
    if (e.data) {
      this.purchaseInvoicesLines[e.field] = e.data;
      switch (e.field) {
        case 'itemID':
          this.loadItemNameAndItemUMID(e.data);
          (
            this.idiM0.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          (
            this.idiM1.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          (
            this.idiM2.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          (
            this.idiM3.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          (
            this.idiM6.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          (
            this.idiM7.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.idiM0.crrValue = null;
          this.idiM1.crrValue = null;
          this.idiM2.crrValue = null;
          this.idiM3.crrValue = null;
          this.idiM6.crrValue = null;
          this.idiM7.crrValue = null;
          this.purchaseInvoicesLines.idiM0 = null;
          this.purchaseInvoicesLines.idiM1 = null;
          this.purchaseInvoicesLines.idiM2 = null;
          this.purchaseInvoicesLines.idiM3 = null;
          this.purchaseInvoicesLines.idiM6 = null;
          this.purchaseInvoicesLines.idiM7 = null;
          this.form.formGroup.patchValue(this.purchaseInvoicesLines);
          break;
        case 'vatid':
          var vat = e.component.itemsSelected[0];
          this.purchaseInvoicesLines.vatAmt =
            vat.TaxRate * this.purchaseInvoicesLines.netAmt;
          this.form.formGroup.patchValue(this.purchaseInvoicesLines);
          break;
      }
    }
  }

  calculateAtm(e: any) {
    if (e.crrValue) {
      this.purchaseInvoicesLines[e.ControlName] = e.crrValue;
      switch (e.ControlName) {
        case 'unitPrice':
        case 'quantity':
          this.purchaseInvoicesLines.netAmt =
            this.purchaseInvoicesLines.quantity *
            this.purchaseInvoicesLines.unitPrice;
          this.lsVatCode.forEach((element) => {
            if (element.vatid == this.purchaseInvoicesLines.vatid) {
              this.purchaseInvoicesLines.vatAmt =
                element.taxRate * this.purchaseInvoicesLines.netAmt;
            }
          });
          this.form.formGroup.patchValue(this.purchaseInvoicesLines);
          break;
      }
    }
  }
  checkValidate() {
    var keygrid = Object.keys(this.grvPurchaseInvoicesLines);
    var keymodel = Object.keys(this.purchaseInvoicesLines);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.grvPurchaseInvoicesLines[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.purchaseInvoicesLines[keymodel[i]] === null ||
              String(this.purchaseInvoicesLines[keymodel[i]]).match(/^ *$/) !==
                null ||
              this.purchaseInvoicesLines[keymodel[i]] == 0
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' +
                  this.grvPurchaseInvoicesLines[keygrid[index]].headerText +
                  '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }
  close() {
    if (this.hasSave == false) {
      this.dialog.close();
    }
    this.dialog.close({
      add: true,
    });
  }
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      switch (this.type) {
        case 'copy':
        case 'add':
          this.api
            .execAction<any>(
              'AC_PurchaseInvoicesLines',
              [this.purchaseInvoicesLines],
              'SaveAsync'
            )
            .subscribe((res) => {
              if (res) {
                this.dialog.close({ data: this.purchaseInvoicesLines });
              }
            });
          break;
        case 'edit':
          this.api
            .execAction<any>(
              'Ac_PurchaseInvoicesLines',
              [this.purchaseInvoicesLines],
              'UpdateAsync'
            )
            .subscribe((res) => {
              if (res) {
                this.dialog.close({ data: this.purchaseInvoicesLines });
              }
            });
          break;
      }
    }
  }

  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.api
        .execAction<any>(
          'AC_PurchaseInvoicesLines',
          [this.purchaseInvoicesLines],
          'SaveAsync'
        )
        .subscribe((res) => {
          if (res) {
            this.hasSave = true;
            this.objectPurchaseInvoicesLines.push({
              ...this.purchaseInvoicesLines,
            });
            this.clearInventoryJournalLines();
          }
        });
    }
  }

  clearInventoryJournalLines() {
    let idx = this.objectPurchaseInvoicesLines.length;
    let data = new PurchaseInvoicesLines();
    this.api
      .exec<any>('AC', 'PurchaseInvoicesLinesBusiness', 'SetDefaultAsync', [
        this.purchaseInvoices,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          res.rowNo = idx + 1;
          this.purchaseInvoicesLines = res;
          this.form.formGroup.patchValue(res);
        }
      });
  }

  loadControl(value) {
    let index = this.lockFields.findIndex((x) => x == value);
    if (index == -1) {
      return true;
    } else {
      return false;
    }
  }

  loadItemNameAndItemUMID(itemID: any) {
    this.api
      .exec('IV', 'ItemsBusiness', 'LoadDataAsync', [itemID])
      .subscribe((res: any) => {
        if (res) {
          this.purchaseInvoicesLines.itemName = res.itemName;
          this.purchaseInvoicesLines.umid = res.umid;
          this.form.formGroup.patchValue(this.purchaseInvoicesLines);
        }
      });
  }
}
