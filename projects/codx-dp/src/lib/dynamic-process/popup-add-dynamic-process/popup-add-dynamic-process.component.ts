import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-dynamic-process',
  templateUrl: './popup-add-dynamic-process.component.html',
  styleUrls: ['./popup-add-dynamic-process.component.css']
})
export class PopupAddDynamicProcessComponent implements OnInit {

  dialog: any;
  currentTab = 0;
  isAddNew = true;
  constructor(
  @Optional() dialog: DialogRef,
  @Optional() data: DialogData) {
    this.dialog = dialog;

  }

  ngOnInit(): void {}

  clickTab(tabNo) {

  }

}
