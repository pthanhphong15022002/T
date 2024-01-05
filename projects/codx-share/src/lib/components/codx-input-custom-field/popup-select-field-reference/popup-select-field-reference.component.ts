import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-select-field-reference',
  templateUrl: './popup-select-field-reference.component.html',
  styleUrls: ['./popup-select-field-reference.component.css'],
})
export class PopupSelectFieldReferenceComponent implements OnInit {
  dialog: DialogRef;
  listField = [];
  field: any;
  fieldNameRef = '';
  constructor(@Optional() dt?: DialogData, @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    this.listField = dt?.data?.listField;
    this.field = JSON.parse(JSON.stringify(dt?.data?.field));
  }
  ngOnInit(): void {}
  valueChange(e, f) {
    if (e.data) {
      this.fieldNameRef = e.field;
      this.field.dataValue = f.dataValue;
    }
  }
  selected() {
    this.dialog.close(this.field);
  }
}
