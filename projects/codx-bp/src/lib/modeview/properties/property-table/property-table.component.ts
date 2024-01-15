import { Component, OnInit } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-property-table',
  templateUrl: './property-table.component.html',
  styleUrls: ['./property-table.component.css']
})
export class PropertyTableComponent extends BasePropertyComponent implements OnInit{
  isEdit = false;
  vllBP008:any;
  selectItem:any;
  ngOnInit(): void {
    this.default();
  }

  default()
  {
    var vll = this.shareService.loadValueList("BP008") as any;
    if(isObservable(vll))
    {
      vll.subscribe(item=>{
        this.vllBP008 = item;
      })
    }
    else this.vllBP008 = vll;
  }

  addCol()
  {
    var object = this.genData("Text");
    this.data.dataFormat.push(object);
  }

  changeValueTable(e:any)
  {
    this.data.tableFormat[e?.field] = e?.data;
    this.dataChange.emit(this.data);
  }

  genData(type:any)
  {
    var data = {} as any;
    switch(type)
    {
      case "Text":
        {
          
        }
    }

    data.title = "Cột 1";
    data.fieldName = "Cot_1";
    data.description = null;
    data.dataType = "String";
    data.Format = "";
    data.controlType = "TextBox";
    data.isRequired = false;
    data.defaultValue = null;
    data.columnNo = 0;
    return data;
  }

  selectedItem(e:any)
  {
    this.selectItem = e;
  }
  edit()
  {
    this.isEdit = !this.isEdit;
  }

  back()
  {
    this.isEdit = !this.isEdit;
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