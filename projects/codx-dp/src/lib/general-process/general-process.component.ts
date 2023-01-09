import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'codx-general-process',
  templateUrl: './general-process.component.html',
  styleUrls: ['./general-process.component.css'],
})
export class GeneralProcessComponent implements OnInit {
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
