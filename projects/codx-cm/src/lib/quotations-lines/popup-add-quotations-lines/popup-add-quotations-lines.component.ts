import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';

@Component({
  selector: 'lib-popup-add-quotations-lines',
  templateUrl: './popup-add-quotations-lines.component.html',
  styleUrls: ['./popup-add-quotations-lines.component.css'],
})
export class PopupAddQuotationsLinesComponent implements OnInit {
  dialog: DialogRef;
  headerText: any;
  quotationsLine: any;
  listQuotationLines = [];
  constructor(
    private codxCM: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.quotationsLine = JSON.parse(JSON.stringify(dt?.data?.quotationsLine));
    this.listQuotationLines = dt?.data?.listQuotationLines ?? [];
    this.headerText = dt?.data?.headerText;
  }

  ngOnInit(): void {}
  onSave() {
    this.dialog.close(this.quotationsLine);
  }

  valueChange(e) {
    if (!e.field || !e.data) return;
    this.quotationsLine[e.field] = e.data;
    switch (e.field) {
      case 'itemID':
        this.loadItem(e.data);
        break;
      case 'salesPrice':
        this.quotationsLine.costAmt =
          this.quotationsLine.quantity * this.quotationsLine.salesPrice;
        break;
    }
  }

  loadItem(itemID) {
    this.codxCM.getItem(itemID).subscribe((items) => {
      if (items) {
        this.quotationsLine.onhand = items.quantity;
        this.quotationsLine.iDIM4 = items.warehouseID; // kho
        this.quotationsLine.costPrice = items.costPrice; // gia von
        this.quotationsLine.uMID = items.umid; // don vi tinh
        this.quotationsLine.quantity = items.minSettledQty; //so luong mua nhieu nhat
      }
      // (this.idiM0.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
      // (this.idiM1.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
      // (this.idiM2.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
      // (this.idiM3.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
      // (this.idiM6.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
      // (this.idiM7.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
      // this.idiM0.crrValue = null;
      // this.idiM1.crrValue = null;
      // this.idiM2.crrValue = null;
      // this.idiM3.crrValue = null;
      // this.idiM6.crrValue = null;
      // this.idiM7.crrValue = null;
      // this.inventoryJournalLine.idiM0 = null;
      // this.inventoryJournalLine.idiM1 = null;
      // this.inventoryJournalLine.idiM2 = null;
      // this.inventoryJournalLine.idiM3 = null;
      // this.inventoryJournalLine.idiM6 = null;
      // this.inventoryJournalLine.idiM7 = null;
      // this.form.formGroup.patchValue(this.inventoryJournalLine);
    });
  }
}
