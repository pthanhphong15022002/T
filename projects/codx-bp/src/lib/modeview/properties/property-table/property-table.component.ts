import { Component } from '@angular/core';
import { BasePropertyComponent } from '../base.component';

@Component({
  selector: 'lib-property-table',
  templateUrl: './property-table.component.html',
  styleUrls: ['./property-table.component.css']
})
export class PropertyTableComponent extends BasePropertyComponent{
  
  addCol()
  {
    var object = 
    {
      customName : "Văn bản 1"
    }

    this.data.dataFormat.push(object);
  }
}

// {
//   "title": "Văn bản 1",
//   "recID": "2f3a5bcf-ce95-481e-b470-8f0cad2d7df0",
//   "width": "",
//   "fieldName": "Van_ban_1",
//   "description": "Câu trả lời",
//   "columnOrder": 2,
//   "columnNo": 0,
//   "isRequired": false,
//   "dataType": "String",
//   "controlType": "Text",
//   "dataFormat": "",
//   "defaultValue": null,
//   "fieldType": "Text"
// }