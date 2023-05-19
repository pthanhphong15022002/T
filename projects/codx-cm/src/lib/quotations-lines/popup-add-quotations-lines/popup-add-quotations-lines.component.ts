import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CacheService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
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
  constructor(
    private codxCM: CodxCmService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.quotationsLine = JSON.parse(JSON.stringify(dt?.data?.quotationsLine));
    this.listQuotationLines = dt?.data?.listQuotationLines ?? [];
    this.headerText = dt?.data?.headerText;
    this.action = dt?.data?.action;
  }

  ngOnInit(): void {}
  onSave() {
    this.quotationsLine['netAmt'] =
      (this.quotationsLine['salesAmt'] ?? 0) -
      (this.quotationsLine['discAmt'] ?? 0) +
      (this.quotationsLine['vatAmt'] ?? 0);
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
  }

  loadItem(itemID) {
    this.codxCM.getItem(itemID).subscribe((items) => {
      if (items) {
        this.quotationsLine['onhand'] = items.quantity;
        this.quotationsLine['idiM4'] = items.warehouseID; // kho
        this.quotationsLine['costPrice'] = items.costPrice; // gia von
        this.quotationsLine['umid'] = items.umid; // don vi tinh
        this.quotationsLine['quantity'] = items.minSettledQty; //so luong mua nhieu nhat
        this.quotationsLine['idiM0'] = items.minSettledQty;
        this.quotationsLine['idiM1'] = items.minSettledQty;
        this.quotationsLine['idiM2'] = items.minSettledQty;
        this.quotationsLine['idiM3'] = items.minSettledQty;
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

      //       8	ItemNote	String	500	1						1					Ghi chú mặt hàng	Riêng của mặt hàng (từ products)	Ghi chú mặt hàng		No UI
      // 9	IDIM0	String	30	1						1					Quy cách đóng gói		Quy cách đóng gói		No UI
      // 10	IDIM1	String	30	1						1					Thuộc tính		Thuộc tính		No UI
      // 11	IDIM2	String	30	1						1					Màu sắc		Màu sắc		x
      // 12	IDIM3	String	30	1						1					Quy cách		Quy cách		x
      // 13	IDIM4	String	30	1						1					Kho		Kho		No UI
      // 14	CostPrice	decimal	50	0						1					Giá vốn		Giá vốn		No UI
      // 15	UMID	String	20	0						1					Đơn vị tính		Đơn vị tính		x

      this.form.formGroup.patchValue(this.quotationsLine);
    });
  }
}
