import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CacheService } from 'codx-core';
import { DP_Steps_Fields } from '../../../models/models';

@Component({
  selector: 'codx-input-custom-field',
  templateUrl: './input-custom-field.component.html',
  styleUrls: ['./input-custom-field.component.css'],
})
export class InputCustomFieldComponent implements OnInit {
  @Input() customField: DP_Steps_Fields = new DP_Steps_Fields();
  @Output() valueChangeCustom = new EventEmitter<any>();
  errorMessage = '';
  showErrMess = false;
  //data tesst
  typeControl = 'text';
  currentRate = 1;
  hovered = 0;
  readonly = false;
  min = 0;
  max = 9999999;
  constructor(private cache: CacheService) {
    this.cache.message('SYS028').subscribe((res) => {
      this.errorMessage = res?.customName;
    });
  }

  ngOnInit(): void {
    this.customField.note = 'Nhập số lượng';
    this.customField.fieldName = 'số lượng';
    this.customField.title = 'Số lượng nhân viên làm việc';
    this.customField.rank = 10;
    this.customField.rankIcon = 'fas fa-ambulance';
  }

  valueChange(e, data) {
    this.valueChangeCustom.emit({ e: e, data: data });
  }
}
