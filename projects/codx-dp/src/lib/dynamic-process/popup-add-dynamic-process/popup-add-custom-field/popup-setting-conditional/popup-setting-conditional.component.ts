import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { CodxFormComponent, DialogData, DialogRef } from 'codx-core';
import { DP_Condition_Reference_Fields } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'lib-popup-setting-conditional',
  templateUrl: './popup-setting-conditional.component.html',
  styleUrls: ['./popup-setting-conditional.component.css']
})
export class PopupSettingConditionalComponent implements OnInit, AfterViewInit {
  @ViewChild('form') form: CodxFormComponent;
  v: string = ''
  dialog: DialogRef
  titleAction = '';
  fieldsCondition: any[];
  fields = { text: 'fieldName', value: 'recID' };

  data: DP_Condition_Reference_Fields;
  placeholder = 'Chọn điều kiện tham chiếu'
  placeholderType = 'Chọn kiểu tham chiếu'
  vllCompare = 'DP054';  //them sau; vll kieu so sanh
  vllTypeMess = 'DP055';//vll kieu canh bao - bắt buộc hay canh báo
  action = '';
  viewOnly = false
  constructor(

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.action = dt?.data?.action
    this.titleAction = dt?.data?.titleAction
    this.fieldsCondition = dt?.data?.fieldsCondition
    this.data = dt?.data?.data
    this.viewOnly = this.action == 'view'
  }
  ngOnInit(): void {

  }
  ngAfterViewInit(): void {

  }
  cbxChangeCondition(e) {
    this.data.refID = e
  }

  saveData() {
    this.dialog.close(this.data)
  }

  changeVll(e) {
    this.data[e.field] = e.data
  }

  valueChange(e) {
    this.data.messageText = e.data
  }
}


