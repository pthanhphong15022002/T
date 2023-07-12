import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CacheService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';

@Component({
  selector: 'lib-popup-add-quotations-lines',
  templateUrl: './popup-add-quotations-lines.component.html',
  styleUrls: ['./popup-add-quotations-lines.component.css'],
})
export class PopupAddQuotationsLinesComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('idiM0') idiM0: CodxInputComponent;
  @ViewChild('idiM1') idiM1: CodxInputComponent;
  @ViewChild('idiM2') idiM2: CodxInputComponent;
  @ViewChild('idiM3') idiM3: CodxInputComponent;
  @ViewChild('idiM4') idiM4: CodxInputComponent;

  dialog: DialogRef;
  headerText: any;
  quotationsLine: any;
  listQuotationLines = [];
  action: string = 'add';
  grvSetup: any;

  constructor(
    private codxCM: CodxCmService,
    private notiService: NotificationsService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.quotationsLine = JSON.parse(JSON.stringify(dt?.data?.quotationsLine));
    this.listQuotationLines = dt?.data?.listQuotationLines ?? [];
    this.headerText = dt?.data?.headerText;
    this.action = dt?.data?.action;
    this.grvSetup = dt?.data?.grvSetup;
    if (!this.grvSetup) {
      this.cache
        .gridViewSetup(
          this.dialog.formModel.formName,
          this.dialog.formModel.gridViewName
        )
        .subscribe((res) => {
          this.grvSetup = res;
        });
    }
  }

  ngOnInit(): void {}
  onSave() {
    let count = this.codxCM.checkValidateForm(
      this.grvSetup,
      this.quotationsLine,
      0
    );
    if (count > 0) return;

    if (!this.quotationsLine.quantity || this.quotationsLine.quantity <= 0) {
      this.notiService.notifyCode('CM025');
    }
    this.dialog.close(this.quotationsLine);
  }

  valueChange(e) {
    if (!e.field || !e.data) return;
    this.quotationsLine[e.field] = e.data;
    switch (e.field) {
      case 'itemID':
        this.loadItem(e.data);
        break;
      case 'VATID':
        let crrtaxrate = e?.component?.itemsSelected[0]?.TaxRate;
        this.quotationsLine['vatRate'] = crrtaxrate ?? 0;
        this.loadChange();
        break;
      case 'discPct':
      case 'quantity':
      case 'salesPrice':
        this.loadChange();
        break;
    }

    this.form.formGroup.patchValue(this.quotationsLine);
  }

  loadChange() {
    this.quotationsLine['salesAmt'] =
      (this.quotationsLine['quantity'] ?? 0) *
      (this.quotationsLine['salesPrice'] ?? 0);

    this.quotationsLine['discAmt'] =
      ((this.quotationsLine['discPct'] ?? 0) *
        (this.quotationsLine['salesAmt'] ?? 0)) /
      100;

    this.quotationsLine['vatBase'] =
      (this.quotationsLine['salesAmt'] ?? 0) -
      (this.quotationsLine['discAmt'] ?? 0);

    this.quotationsLine['vatAmt'] =
      (this.quotationsLine['vatRate'] ?? 0) *
      (this.quotationsLine['vatBase'] ?? 0);

    this.quotationsLine['netAmt'] =
      (this.quotationsLine['salesAmt'] ?? 0) -
      (this.quotationsLine['discAmt'] ?? 0) +
      (this.quotationsLine['vatAmt'] ?? 0);
  }

  loadItem(itemID) {
    this.codxCM.getItem(itemID).subscribe((items) => {
      if (items) {
        this.quotationsLine['onhand'] = items.quantity;
        this.quotationsLine['idiM4'] = items.warehouseID; // kho

        this.quotationsLine['umid'] = items.umid; // don vi tinh
        this.quotationsLine['quantity'] = items.minSettledQty; //so luong mua nhieu nhat
        // this.quotationsLine['idiM0'] = items.idiM0;
        // this.quotationsLine['idiM1'] = items.idiM1;
        // this.quotationsLine['idiM2'] = items.idiM2;
        // this.quotationsLine['idiM3'] = items.idiM3;

        let priceDefaut =
          items.costPrice /
          (this.quotationsLine.exchangeRate != 0
            ? this.quotationsLine.exchangeRate
            : 1); // gia von chai ti giá
        this.quotationsLine['costPrice'] = priceDefaut;
        this.quotationsLine['salesPrice'] = priceDefaut;
      }
      (this.idiM0.ComponentCurrent as CodxComboboxComponent).dataService.data =
        [];
      (this.idiM1.ComponentCurrent as CodxComboboxComponent).dataService.data =
        [];
      (this.idiM2.ComponentCurrent as CodxComboboxComponent).dataService.data =
        [];
      (this.idiM3.ComponentCurrent as CodxComboboxComponent).dataService.data =
        [];
      (this.idiM4.ComponentCurrent as CodxComboboxComponent).dataService.data =
        [];
      this.idiM0.crrValue = null;
      this.idiM1.crrValue = null;
      this.idiM2.crrValue = null;
      this.idiM3.crrValue = null;
      this.idiM4.crrValue = null;

      this.quotationsLine.idiM0 = null;
      this.quotationsLine.idiM1 = null;
      this.quotationsLine.idiM2 = null;
      this.quotationsLine.idiM3 = null;
      this.quotationsLine.idiM4 = null;

      this.quotationsLine['salesAmt'] = 0;
      // this.quotationsLine['salesPrice'] = 0;
      this.quotationsLine['vatAmt'] = 0;
      this.quotationsLine['discPct'] = 0;
      this.quotationsLine['discAmt'] = 0;
      this.quotationsLine['vatBase'] = 0;
      this.form.formGroup.patchValue(this.quotationsLine);
    });
  }
}
