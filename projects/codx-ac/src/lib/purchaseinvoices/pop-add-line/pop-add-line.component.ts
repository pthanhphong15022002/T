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
} from 'codx-core';
import { PurchaseInvoicesLines } from '../../models/PurchaseInvoicesLines.model';

@Component({
  selector: 'lib-pop-add-line',
  templateUrl: './pop-add-line.component.html',
  styleUrls: ['./pop-add-line.component.css'],
})
export class PopAddLineComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText: string;
  formModel: FormModel;
  gridViewSetup: any;
  validate: any = 0;
  type: any;
  itemName: any;
  lsVatCode: any;
  journals: any;
  objectIdim: any;
  lockFields:any;
  purchaseInvoicesLines: PurchaseInvoicesLines;
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
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
          this.gridViewSetup = res;
        }
      });
    this.api
      .exec('IV', 'ItemsBusiness', 'LoadDataAsync', [
        this.purchaseInvoicesLines.itemID,
      ])
      .subscribe((res: any) => {
        if (res != null) {
          this.itemName = res.itemName;
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
          this.api
            .exec('IV', 'ItemsBusiness', 'LoadDataAsync', [e.data])
            .subscribe((res: any) => {
              if (res != null) {
                this.itemName = res.itemName;
              }
            });
          break;
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
        case 'vatid':
          var vat = e.component.itemsSelected[0];
          this.purchaseInvoicesLines.vatAmt =
            vat.TaxRate * this.purchaseInvoicesLines.netAmt;
          this.form.formGroup.patchValue(this.purchaseInvoicesLines);
          break;
      }
    }
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.purchaseInvoicesLines);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
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
                '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }
  close() {
    this.dialog.close();
  }
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      window.localStorage.setItem(
        'dataline',
        JSON.stringify(this.purchaseInvoicesLines)
      );
      this.dialog.close();
    }
  }
  loadControl(value){
    let index = this.lockFields.findIndex(
      (x) => x  == value
    );
    if (index == -1) {
      return true;
    }else{
      return false;
    }
  }
}
