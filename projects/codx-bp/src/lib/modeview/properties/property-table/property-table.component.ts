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
    else
    {
      this.data.dataFormat[this.indexSelected]= e
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
    data.fieldName = this.formatTitle(data.title) || "cot_1";
    data.description = data.description || null;
    data.dataType = data.dataType || "String";
    data.Format = data?.Format || "";
    data.controlType = data.value; //data?.controlType || data.value
    data.isRequired = data?.isRequired != null ? data?.isRequired : false;
    data.defaultValue = data.defaultValue || null;
    data.columnNo = 0;
    data.fieldType = data.value;
    data.icon = vllText.icon;
    data.text = vllText.text;
    data.value = vllText.value;
    return data;
  }

  
  formatTitle(str:any)
  {
    str = str.toLowerCase();
    return this.xoa_dau(str.replaceAll(" ","_").replaceAll("/","_"));
  }

  xoa_dau(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
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
