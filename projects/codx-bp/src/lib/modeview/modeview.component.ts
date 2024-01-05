import { CdkDrag, CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { ApiHttpService, CacheService, Util } from 'codx-core';
import { count } from './modeview.variable';
type IMenu = {
  title: string;
  id: number;
  price: number;
  temp?: boolean;
};

@Component({
  selector: 'lib-modeview',
  templateUrl: './modeview.component.html',
  styleUrls: ['./modeview.component.scss']
})

export class ModeviewComponent implements OnInit{
  vllBP002:any;
  table: Array<any> = [];
  basic = ["Text","ValueList","ComboBox","DateTime","Attachment","Number","YesNo","User","Share"];
  advanced = ["Rank","Table","Progress","Phone","Email","Address","Expression"];
  lstDataAdd = [];
  count = count;
  dataSelected: any;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService
  )
  {}

  ngOnInit(): void {
    this.getVll();
    this.default();
  }

  getVll()
  {
   
    this.cache.valueList("BP002").subscribe(item=>{
      if(item)
      {
        debugger
        item.datas.forEach(elm => {
          if(this.basic.includes(elm.value)) elm.groupType = 0;
          else if(this.advanced.includes(elm.value)) elm.groupType = 1;
        }); 
        this.vllBP002 = item;
      }
    })
  }

  default()
  {
    let object = 
    {
      name: "",
      columnOrder: this.table.length,
      children: [
        {
          icon:"icon-i-file-earmark-plus",
          title: "Tên biểu mẫu",
          dataType: "String",
          controlType: "Title",
          description : "Nhập mô tả biểu mẫu",
          columnOrder: this.table.length,
          columnNo: 0,
          value: "Title",
        }
      ]
    }

    this.table.push(object);
    this.selectedItem(object.children[0])
  }

  trackByFn(i: number) {
    return i;
  }

  drop(event: any) {
    if (event.previousContainer !== event.container) {
   
      let data = JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex]));
      this.genData(data);
      //this.selectedItem(data);
      let object = 
      {
        name: "",
        columnOrder: this.table.length,
        children: [
          data
        ]
      }

      this.table.splice(event.currentIndex,0,object);
      
      //this.setTimeoutSaveData(data);
    } else {
      this.table[event.currentIndex].columnOrder = event.previousIndex;
      this.table[event.previousIndex].columnOrder = event.currentIndex;
      this.table[event.currentIndex].children.forEach(elm=>{
        elm.columnOrder = event.previousIndex;
      })
      this.table[event.previousIndex].children.forEach(elm=>{
        elm.columnOrder = event.currentIndex;
      })
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }


  genData(data:any)
  {

    data.title = data.text;
    switch(data.value)
    {
      case "Text":
      {
        this.count.text ++;
        data.title += " " + this.count.text;
        break
      }
      case "ValueList":
      {
        this.count.valueList ++;
        data.title += " " + this.count.valueList;
        data.refType = "2";
        break;
      }
      case "ComboBox":
      {
        this.count.combobox ++;
        data.title += " " + this.count.combobox;
        data.refType = "3";
        break;
      }
      case "DateTime":
      {
        this.count.datetime ++;
        data.title += " " + this.count.datetime;
        data.controlType = "MaskBox";
        data.dataFormat = "d";
        break;
      }
      case "Attachment":
      {
        this.count.attachment ++;
        data.title += " " + this.count.attachment;
        data.documentControl = [];
        break;
      }
      case "Number":
      {
        this.count.number ++;
        data.title += " " + this.count.number;
        data.controlType = "TextBox";
        data.dataFormat = "I";
        data.dataType = "Decimal"
        break;
      }
      case "YesNo":
      {
        this.count.yesNo ++;
        data.title += " " + this.count.yesNo;
        data.controlType = "Switch";
        data.dataType = "Bool";
        data.defaultValue = false;
        break;
      }
      case "User":
      {
        this.count.user ++;
        data.title += " " + this.count.user;
        data.controlType = "ComboBox";
        data.defaultValue = false;
        data.refType = "3";
        data.refValue = "Users";
        break;
      }
      case "Share":
      {
        this.count.share ++;
        data.title += " " + this.count.share;
        break;
      }
      case "Rank":
      {
        this.count.rank ++;
        data.title += " " + this.count.rank;
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
      case "Table":
      {
        this.count.table ++;
        data.title += " " + this.count.table;
        break;
      }
      case "Progress":
      {
        this.count.progress ++;
        data.title += " " + this.count.progress;
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
        this.count.email ++;
        data.title += " " + this.count.email;
        data.dataFormat = "Email";
        data.controlType = "TextBox";
        break;
      }
      case "Address":
      {
        this.count.address ++;
        data.title += " " + this.count.address;
        data.dataFormat = "Address";
        data.controlType = "TextBox";
        break;
      }
      case "Expression":
      {
        this.count.expression ++;
        data.title += " " + this.count.expression;
        data.dataFormat = "Expression";
        data.controlType = "TextBox";
        data.referedType = "E";
        break;
      }
      case "Phone":
      {
        this.count.phone ++;
        data.title += " " + this.count.phone;
        data.dataFormat = "Phone";
        data.controlType = "TextBox";
        break;
      }
    }
    data.recID = Util.uid();
    data.width = "";
    data.fieldName = this.formatTitle(data.title);
    data.description  = "Câu trả lời";
    data.columnOrder = this.table.length;
    data.columnNo = 0;
    data.isRequired = false;
    data.dataType = data.controlType || "String";
    data.controlType = data.controlType || data.value;
    data.dataFormat = data.dataFormat || "";
    data.defaultValue = data.defaultValue || null;
    data.fieldType = data.fieldType || data.value;
    //data.text = data.title; //Lát bỏ
    return data;
  }

  formatTitle(str:any)
  {
    return this.xoa_dau(str.replaceAll(" ","_"));
  }

  drop2(event:any)
  {
    let data = JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex]));
    if(event.previousContainer === event.container && event.event.target.id == event.container.id) {
      //delete this.table[data.parentID].children[event.previousIndex];
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      for(var i = 0 ; i < event.container.data.length ; i++)
      {
        event.container.data[i].columnNo = i;
      }
    } 
    else if(event.event.target.id != event.container.id)
    {
      var object = 
      {
        name: "",
        columnOrder: 0,
        children: [ 
          data
        ]
      }

      let index = this.table.findIndex(x=>x.columnOrder == data.columnOrder);
      this.table[index].children.splice(event.previousIndex, 1);
      if(event.event.target.id != event.container.id) {
        object.columnOrder = object.children[0].columnOrder = this.table.length,
        this.table.push(object);
      }
      else {
        object.columnOrder = object.children[0].columnOrder = data.columnOrder + 1,
        this.table.splice((data.columnOrder + 1),0,object);
      }
    }
    else {
      event.previousContainer.data[event.previousIndex].columnOrder = event.container.data[0].columnOrder,
      event.previousContainer.data[event.previousIndex].columnNo = event.currentIndex
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    this.table = this.table.filter(x=>x.children != null && x.children.length>0);
  }

  evenPredicate(name:string){
    return (item: CdkDrag<any>)=>{
       return name==item.data
    }
  }
  
  selectedItem(data:any)
  {
    if(this.dataSelected == data) return;
    this.dataSelected = data;
  }

  save()
  {
    var a = this.table;
    debugger;
  }
  // saveDataTimeout = new Map();
  // setTimeoutSaveData(data) {
    
  //   this.lstDataAdd.push(data);

  //   clearTimeout(this.saveDataTimeout?.get("recID"));
  //   this.saveDataTimeout?.delete(
  //     this.saveDataTimeout?.get("recID")
  //   );
  //   this.saveDataTimeout.set(
  //     "recID",
  //     setTimeout(
  //       this.onSave.bind(this, this.lstDataAdd),
  //       2000
  //     )
  //   );
  // }

  // onSave(data:any) {
  //   this.api
  //     .execSv('BP', 'ERM.Business.BP', 'ProcessesStepsExtendInfoBusiness', 'SaveItemAsync', [
  //      data
  //     ])
  //     .subscribe((res) => {
  //       if (res) {
  //         this.lstDataAdd = []
  //       }
  //     });
  // }

  dataChange(e:any)
  {
    debugger
    this.table[e?.columnOrder].children[e.columnNo] = e;
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
}
