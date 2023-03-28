import { Component, OnInit, ViewChild } from '@angular/core';
import { CodxFormComponent, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-quotations',
  templateUrl: './popup-add-quotations.component.html',
  styleUrls: ['./popup-add-quotations.component.css']
})
export class PopupAddQuotationsComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  quotations :any
  dialog: DialogRef;
  headerText ='Thêm báo giá- test nên thêm cứng'
  menuGeneralInfo = {
    icon: 'icon-info',
    text: 'Thông tin chung',
  };
  constructor() { }

  ngOnInit(): void {
  }

  onSave(){

  }
}
