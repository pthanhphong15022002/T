import { Component, Input } from '@angular/core';
import { FormModel } from 'codx-core';

@Component({
  selector: 'codx-properties-field',
  templateUrl: './properties-field.component.html',
  styleUrls: ['./properties-field.component.css']
})
export class PropertiesFieldComponent {
  @Input() dataCurrent: any;

  formModel: FormModel = {
    formName: 'DPStepsFields',
    gridViewName: 'grvDPStepsFields',
    entityName: 'DP_Steps_Fields'
  }

  dataField: any = {};
  constructor(){

  }

  valueTextField(e){
    this.dataField[e?.field] = e?.data;
    if(e?.field == 'title'){
      const str = e?.data;
      if (!str) {
        this.dataField.fieldName = '';
        return;
      }
      var format = str
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
      format = format.replaceAll(' ', '_');
      while (format.includes('__')) {
        format = format.replaceAll('__', '_');
      }
      this.dataField.fieldName = format;
    }
  }

  valueSwitchField(e){
    this.dataField[e?.field] = e?.data;
  }

  changeRadio(e, type) {
    if (e.field === 'dropDown' && e.component.checked === true) {
    } else {
    }
  }
}
