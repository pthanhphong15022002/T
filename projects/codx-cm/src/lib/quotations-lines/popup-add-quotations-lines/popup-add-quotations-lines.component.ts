import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-quotations-lines',
  templateUrl: './popup-add-quotations-lines.component.html',
  styleUrls: ['./popup-add-quotations-lines.component.css'],
})
export class PopupAddQuotationsLinesComponent implements OnInit {
  dialog: DialogRef;
  headerText: any;
  quotationsLine: any;
  quotationsLines =[]
  constructor(@Optional() dt?: DialogData, @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    this.quotationsLine = JSON.parse(JSON.stringify(dt?.data?.quotationsLine));
    this.quotationsLines = dt?.data?.quotationsLines??[]
    this.headerText = dt?.data?.headerText;
  }

  ngOnInit(): void {}
  onSave() {
    this.dialog.close(this.quotationsLine);
  }

  valueChange(e){
    this.quotationsLine[e.field] = e.data
  }
}
