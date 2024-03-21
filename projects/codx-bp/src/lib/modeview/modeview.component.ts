import { CDK_DRAG_CONFIG, CdkDrag, CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef, Util } from 'codx-core';
import { count } from './modeview.variable';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';
const DragConfig = {
  dragStartThreshold: 0,
  pointerDirectionChangeThreshold: 5,
  zIndex: 10000
};

@Component({
  selector: 'lib-modeview',
  templateUrl: './modeview.component.html',
  styleUrls: ['./modeview.component.scss'],
  providers: [{ provide: CDK_DRAG_CONFIG, useValue: DragConfig }]
})

export class ModeviewComponent implements OnInit {
  @Input() data:any;
  @Input() stepNo:any;
  vllBP002:any;
  table: Array<any> = [];
  basic = ["Text","ValueList","ComboBox","DateTime","Attachment","Number","YesNo","User","Share","UserInfo"];
  lstDataAdd = [];
  count = count;
  dataSelected: any;
  dialog:any;
  viewType = 1;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private shareService: CodxShareService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  )
  {
    this.data = this.data || dt?.data?.extendInfo;
    this.stepNo = this.stepNo || dt?.data?.stepNo;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.resetCount();
    this.getVll();
  }

  resetCount()
  {
    if(this.data.length > 2) return; 
    this.count.text = 0,
    this.count.valueList = 0,
    this.count.combobox = 0,
    this.count.attachment = 0,
    this.count.number = 0,
    this.count.yesNo = 0,
    this.count.share = 0,
    this.count.rank = 0,
    this.count.table = 0,
    this.count.progress = 0,
    this.count.phone = 0,
    this.count.email = 0,
    this.count.address = 0,
    this.count.expression = 0;
    this.count.userInfo = 0;
  }

  btnClick()
  {
    // $('#group_period input').on("click", function() {
    //   alert(this.id);
    //   });
  }

  getVll()
  {
    let vll = this.shareService.loadValueList("BP002");

    if(isObservable(vll))
    {
      vll.subscribe(item=>{
        if(item) this.perform(item)
      })
    }
    else this.perform(vll);
  }

  perform(item:any)
  {
    let data1 =[];
    let data2 =[];
    let data3 =[];
    item.datas.forEach(elm => {
      if(this.basic.includes(elm.value)) {
        elm.groupType = 0;
        data1.push(elm);
      }
      else if(elm.value != 'Title' && elm.value != 'SubTitle') {
        elm.groupType = 1;
        data2.push(elm);
      }
      else 
      {
        data3.push(elm);
      }
    }); 
    item.datas = data1.concat(data2.concat(data3));
    this.vllBP002 = item;
    if(!this.data) this.default();
    else this.formatData(this.data);
  }

  formatData(data:any)
  {
    var vlls = this.vllBP002.datas;
    data.forEach(elm => {
      var indexs = vlls.findIndex(x=>x.value == elm.fieldType);
      elm.value = vlls[indexs].value;

      if(elm.fieldType == "Title") 
      {
        elm.columnOrder = 0;
        elm.columnNo = 0;
      }
      else if(elm.fieldType == "SubTitle")
      {
        elm.columnOrder = 1;
        elm.columnNo = 0;
        elm.text = vlls[indexs].text;
        elm.icon = vlls[indexs].icon;
        elm.textColor = vlls[indexs].textColor;
      }
      else
      {
        if(elm.fieldType == "Table")
        {
          elm.dataFormat = typeof elm.dataFormat == 'string' ? JSON.parse(elm.dataFormat) :  elm.dataFormat;
        }
        else if(elm.fieldType == "Attachment")
        {
          elm.documentControl = typeof elm.documentControl == 'string' ? JSON.parse(elm.documentControl) :  elm.documentControl;
        }
        elm.text = vlls[indexs].text;
        elm.icon = vlls[indexs].icon;
        elm.textColor = vlls[indexs].textColor;
      }

      if(!this.table.some(x=>x.columnOrder == elm.columnOrder))
      {
        let object = 
        {
          name: "",
          columnOrder: elm.columnOrder,
          children: [
            elm
          ]
        }
        this.table.push(object);
      }
      else
      {
        var index = this.table.findIndex(x=>x.columnOrder == elm.columnOrder);
        this.table[index].children.push(elm);
        this.table[index].children.sort((a,b) => a.columnNo - b.columnNo);
      }
    });
    this.table.sort((a,b) => a.columnOrder - b.columnOrder);
    this.selectedItem(this.table[0].children[0])
  }

  default()
  {
    var index = this.vllBP002.datas.findIndex(x=>x.value == "Title");
    var index2 = this.vllBP002.datas.findIndex(x=>x.value == "SubTitle");
    let data = this.vllBP002.datas[index];
    let data2 = this.vllBP002.datas[index2];
    data = this.genData(data);
    data2 = this.genData(data2);
    let object = 
    {
      name: "",
      columnOrder: 0,
      children: [
        data
      ]
    };
    let object2 = 
    {
      name: "",
      columnOrder: 1,
      children: [
        data2
      ]
    }
    object2.children[0].columnOrder = 1;
    this.table.push(object,object2);
    this.selectedItem(object.children[0])
  }

  trackByFn(i: number) {
    return i;
  }

  drop(event: any) {
    if (event.previousContainer !== event.container) {
      let data = JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex]));
      data = this.genData(data);
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

      let i = 0;
      this.table.forEach(elm=>{
        elm.columnOrder = i;
        if(elm.children && elm.children.length>0)
        {
          elm.children.forEach(elm2 => {
            elm2.columnOrder = i;
          });
        }
        i++;
      })
      debugger
      let objectIndex = JSON.parse(JSON.stringify(this.table[event.currentIndex]));
      this.selectedItem(objectIndex.children[0]);
      //moveItemInArray( this.table, (event.currentIndex + 1), event.currentIndex);
      //this.setTimeoutSaveData(data);
    } else {
      // this.table[event.currentIndex].columnOrder = event.previousIndex;
      // this.table[event.previousIndex].columnOrder = event.currentIndex;
      // this.table[event.currentIndex].children.forEach(elm=>{
      //   elm.columnOrder = event.previousIndex;
      // })
      // this.table[event.previousIndex].children.forEach(elm=>{
      //   elm.columnOrder = event.currentIndex;
      // })
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }


  genData(data:any)
  {
    delete data.color;
    delete data.default;
    delete data.groupType;
    delete data.idx;

    data.title = data.text;
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
      case "Text":
      {
        this.count.text ++;
        data.controlType = "TextBox";
        data.title += " " + this.count.text;
        break
      }
      case "ValueList":
      {
        this.count.valueList ++;
        data.title += " " + this.count.valueList;
        data.refType = "2";
        data.refValue = null;
        data.dataType = "String";
        break;
      }
      case "ComboBox":
      {
        this.count.combobox ++;
        data.title += " " + this.count.combobox;
        data.refType = "3";
        data.dataType = "String";
        break;
      }
      case "DateTime":
      {
        this.count.datetime ++;
        data.title += " " + this.count.datetime;
        data.controlType = "MaskBox";
        data.dataFormat = "d";
        data.dataType = "DateTime";
        //data.defaultValue = new Date();
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
        data.dataType = "String"
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
        data.dataFormat = [];
        data.tableFormat = 
        {
          hasIndexNo: false,
          sum : 0
        }
        var vllText = this.vllBP002.datas.filter(x=>x.value == "Text")[0];
        for(var i = 0 ; i<3 ; i++)
        {
          var col = 
          {
            title : "Cột " + (i+1),
            fieldName: "cot_" + (i+1),
            description: null,
            dataType: "String",
            controlType: "TextBox",
            isRequired: false,
            defaultValue: null,
            columnNo:0,
            icon: vllText.icon,
            text: vllText.text,
            textColor : vllText.textColor,
            value : vllText.value,
            fieldType: "Text"
          }
          data.dataFormat.push(col);
        }
        
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
      case "UserInfo":
      {
        this.count.userInfo ++;
        data.title += " " + this.count.userInfo;
        break;
      }
    }
    data.recID = Util.uid();
    data.width = "";
    data.fieldName = this.formatTitle(data.title.toLowerCase());
    data.description  =  data.description || "Câu trả lời";
    data.columnOrder = this.table.length;
    data.columnNo = 0;
    data.isRequired = data?.isRequired != null ? data.isRequired : false;
    data.dataType = data?.dataType ? data.dataType : (data.controlType || "String");
    data.controlType = data.controlType || data.value;
    data.dataFormat = data.dataFormat || "";
    data.defaultValue = data.defaultValue || null;
    data.fieldType = data.fieldType || data.value;
    //data.text = data.title; //Lát bỏ
    return data;
  }

  formatTitle(str:any)
  {
    str = str.toLowerCase();
    return this.xoa_dau(str.replaceAll(" ","_").replaceAll("/","_")) + "_" + this.stepNo;
  }

  drop2(event:any)
  {
    let data = JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex]));
    if(event.previousContainer === event.container && event.event.target.id == event.container.id) 
    {
      //delete this.table[data.parentID].children[event.previousIndex];
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      for(var i = 0 ; i < event.container.data.length ; i++)
      {
        event.container.data[i].columnNo = i;
      }
    } 
    else if(event.event.target.id != event.container.id)
    {
      let object = 
      {
        name: "",
        columnOrder: this.table.length,
        children: [ 
          data
        ]
      }

      let index = this.table.findIndex(x=>x.columnOrder == data.columnOrder);
      this.table[index].children.splice(event.previousIndex, 1);
      this.table = this.table.filter(x=>x.children != null && x.children.length>0);
      var ds = false;
      if(event.event.target.id != event.container.id) {
        
        if(this.dataSelected.columnOrder == object.children[0].columnOrder && this.dataSelected.columnNo == object.children[0].columnNo) ds = true;
        object.columnOrder = object.children[0].columnOrder = this.table[this.table.length - 1].columnOrder + 1;
        this.table.push(object);
        
        if(ds) this.selectedItem(object.children[0])
        
      }
      else {
        if(this.dataSelected.columnOrder == object.children[0].columnOrder && this.dataSelected.columnNo == object.children[0].columnNo) ds = true;
        object.columnOrder = object.children[0].columnOrder = data.columnOrder + 1;
        if(ds) this.selectedItem(object.children[0])
        this.table.splice((data.columnOrder + 1),0,object);
      }

      if(this.table[index].children.length > 0)
        {
          for(var i = 0 ; i < this.table[index].children.length ; i++)
          {
            this.table[index].children[i].columnNo = i;
          }
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
      
      for(var i = 0 ; i < this.table[event.container.data[0].columnOrder].children.length ; i++)
      {
        this.table[event.container.data[0].columnOrder].children[i].columnNo = i;
      }
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
    if(this.dataSelected?.columnOrder == data.columnOrder && this.dataSelected?.columnNo == data.columnNo) return;
    this.dataSelected = data;
  }

  close()
  {
    this.resetIndex();
    var result = [];
    this.table.forEach(elm=>{
      result = result.concat(elm.children);
    })
    result.forEach(elm=>{
      
      if(elm.fieldType == "Table")
      {
        elm.dataFormat.forEach(elm2=>{
          delete elm2.icon
          delete elm2.text;
          delete elm2.textColor;
          delete elm2.value;
        })
      }
      
      delete elm.icon
      delete elm.text;
      delete elm.textColor;
      delete elm.value;
    })
 
    this.dialog.close(result);
  }

  dataChange(e:any)
  {
    if(e?.isDelete == true) {
      this.table[e?.columnOrder].children = this.table[e?.columnOrder].children.filter(x=>x.columnNo != e.columnNo);
      this.table = this.table.filter(x=>x.children != null && x.children.length>0);
      this.resetIndex();
      if(this.table[e?.columnOrder]?.children && this.table[e?.columnOrder].children.length > 0)
      {
        var stt = e.columnNo - 1;
        if(stt < 0) stt = 0;
        this.selectedItem(this.table[e?.columnOrder].children[stt]);
      }
      else {
        var stt = (this.table[e?.columnOrder - 1].children.length) - 1;
        if(stt < 0) stt = 0;
        this.selectedItem(this.table[e?.columnOrder - 1].children[stt]);
      }
    }
    else {
      e.fieldName = this.formatTitle(e.title);
      this.table[e?.columnOrder].children[e.columnNo] = e;
    }
  }

  resetIndex()
  {
    for(var i = 0 ; i < this.table.length ; i++)
    {
      this.table[i].columnOrder = i;
      for(var y = 0 ; y < this.table[i].children.length ; y ++)
      {
        this.table[i].children[y].columnNo = y;
        this.table[i].children[y].columnOrder = i;
      }
    }
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

  changeView(e:any)
  {
    this.viewType = e;
  }

  getField(key: string): string {
    if (!key) return '';

    return Util.camelize(key);
  }
}
