import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { isObservable } from 'rxjs';
import { Thickness } from 'ngx-basic-primitives';

@Component({
  selector: 'lib-property-table',
  templateUrl: './property-table.component.html',
  styleUrls: ['./property-table.component.scss']
})
export class PropertyTableComponent extends BasePropertyComponent implements OnInit , OnChanges{
  
  isEdit = false;
  vllBP008:any;
  dataEdit:any;
  indexSelected = 0;

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
        this.data = this.formatData(this.data);
      })
    }
    else {
      this.vllBP008 = vll;
      this.data = this.formatData(this.data);
    }
  }

  formatData(data:any)
  {
    if(data.dataFormat)
    {
      data.dataFormat.forEach(elm => {
        var vllText = this.vllBP008.datas.filter(x=>x.value == elm.fieldType)[0];
        elm.icon = vllText.icon;
        elm.text = vllText.text;
        elm.value = vllText.value;
      });
    }
    return data;
  }

  addCol()
  {
    var object = this.genData({value:"Text"});
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
      this.data.dataFormat.splice(this.indexSelected,1);
      this.isEdit = false;
    }
  }

  genData(data:any)
  {
    var vllText = this.vllBP008.datas.filter(x=>x.value == data.value)[0];
    
    switch(data.value)
    {
      case "Title":
        {
          data.controlType = "TextBox";
          data.isRequired = true;
          data.description = "Nhập mô tả biểu mẫu"
          break;
        }
        case "SubTitle":
        {
          data.controlType = "TextBox";
          data.isRequired = true;
          break;
        }
        case "ValueList":
        {
          data.refType = "2";
          break;
        }
        case "ComboBox":
        {
          data.refType = "3";
          break;
        }
        case "DateTime":
        {
          data.controlType = "MaskBox";
          data.dataFormat = "d";
          break;
        }
        case "Attachment":
        {
          data.documentControl = [];
          break;
        }
        case "Number":
        {
          data.controlType = "TextBox";
          data.dataFormat = "I";
          data.dataType = "Decimal"
          break;
        }
        case "YesNo":
        {
          data.controlType = "Switch";
          data.dataType = "Bool";
          data.defaultValue = false;
          break;
        }
        case "User":
        {
          data.controlType = "ComboBox";
          data.defaultValue = false;
          data.refType = "3";
          data.refValue = "Users";
          break;
        }
        case "Rank":
        {
          data.dataType = "Decimal";
          data.rank= 
          {
            type: "1",
            icon: "icon-i-star-fill",
            minValue: 1,
            maxValue: 5,
            color: '#0078FF'
          }
          break;
        }
        case "Progress":
        {
          data.dataType = "Decimal";
          data.rank= 
          {
            type: "3",
            icon: null,
            minValue: 0,
            maxValue: 5,
            color: '#0078FF'
          }
          break;
        }
        case "Email":
        {
          data.dataFormat = "Email";
          data.controlType = "TextBox";
          break;
        }
        case "Address":
        {
          data.dataFormat = "Address";
          data.controlType = "TextBox";
          break;
        }
        case "Expression":
        {
          data.dataFormat = "Expression";
          data.controlType = "TextBox";
          data.referedType = "E";
          break;
        }
        case "Phone":
        {
          data.dataFormat = "Phone";
          data.controlType = "TextBox";
          break;
        }
    }

    data.title =  data.title || "Cột 1";
    data.fieldName = data.fieldName || "Cot_1";
    data.description = data.description || null;
    data.dataType = data.dataType || "String";
    data.Format = data?.Format || "";
    data.controlType = data?.controlType || data.value;
    data.isRequired = data?.isRequired != null ? data?.isRequired : false;
    data.defaultValue = data.defaultValue || null;
    data.columnNo = 0;
    data.fieldType = data.value;
    data.icon = vllText.icon;
    data.text = vllText.text;
    data.value = vllText.value;
    return data;
  }

  selectedItem(e:any , index:any)
  {
    if(e?.value != this.data.dataFormat[index].value)
    {
      this.data.dataFormat[index].value = e?.value;
      this.data.dataFormat[index] = this.genData(this.data.dataFormat[index]);
    }
  }

  edit(e:any, index:any)
  {
    this.isEdit = !this.isEdit;
    this.dataEdit = e;
    this.indexSelected = index;
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