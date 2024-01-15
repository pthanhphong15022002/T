import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-property-table',
  templateUrl: './property-table.component.html',
  styleUrls: ['./property-table.component.scss']
})
export class PropertyTableComponent extends BasePropertyComponent implements OnInit , OnChanges{
  
  isEdit = false;
  vllBP008:any;
  dataEdit:any;

  ngOnInit(): void {
    this.default();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.isEdit = false;
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

  dataChangeTable(e:any)
  {
    if(e?.isDelete == true)
    {
      debugger
    }
  }

  genData(type:any)
  {
    var data = {} as any;
    var vllText = this.vllBP008.datas.filter(x=>x.value == type)[0];
    
    switch(type)
    {
      case "Text":
        {
          data.icon = vllText.icon;
          data.text = vllText.text;
          data.value = vllText.value;
          break;
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

  selectedItem(e:any , index:any)
  {
    this.data.dataFormat[index].icon = e?.icon;
    this.data.dataFormat[index].text = e?.text;
    this.data.dataFormat[index].value = e?.value;
  }
  edit(e:any)
  {
    this.isEdit = !this.isEdit;
    this.dataEdit = e;
    this.ref.detectChanges();
  }

  backChange()
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