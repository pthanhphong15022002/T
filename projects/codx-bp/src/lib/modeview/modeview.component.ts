import { CdkDrag, CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { CacheService } from 'codx-core';
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
  constructor(
    private cache: CacheService
  )
  {

  }
  
  table: Array<any> = [];

  ngOnInit(): void {
    this.getVll();
  }

  getVll()
  {
    let basic = ["Text","ValueList","Combobox","Datetime","Attachment","Number","YesNo","User","Share"];
    let advanced = ["Rank","Table","Progress","Phone","Email","Address","Expression"];
    this.cache.valueList("BP002").subscribe(item=>{
      if(item)
      {
        item.datas.forEach(elm => {
          if(basic.includes(elm.value)) elm.groupType = 0;
          else if(advanced.includes(elm.value)) elm.groupType = 1;
        }); 
        this.vllBP002 = item;
      }
    })
  }

  trackByFn(i: number) {
    return i;
  }

  drop(event: any) {
    if (event.previousContainer !== event.container) {
      // copyArrayItem(
      //   event.previousContainer.data,
      //   event.container.data,
      //   event.previousIndex,
      //   event.currentIndex
      // );
      let data = JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex]));
      data.parentID =  this.table.length;
      let object = 
      {
        name: "",
        id: this.table.length,
        children: [
          data
        ]
      }

      this.table.splice(event.currentIndex,0,object);
    } else {
      this.table[event.currentIndex].id = event.previousIndex;
      this.table[event.previousIndex].id = event.currentIndex;
      this.table[event.currentIndex].children.forEach(elm=>{
        elm.parentID = event.previousIndex;
      })
      this.table[event.previousIndex].children.forEach(elm=>{
        elm.parentID = event.currentIndex;
      })
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  drop2(event:any)
  {
    let data = JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex]));
    if(event.previousContainer === event.container && event.event.target.id == event.container.id) {
      //delete this.table[data.parentID].children[event.previousIndex];
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } 
    else if(event.event.target.id != event.container.id)
    {
      var object = 
      {
        name: "",
        id: 0,
        children: [ 
          data
        ]
      }

      let index = this.table.findIndex(x=>x.id == data.parentID);
      this.table[index].children.splice(event.previousIndex, 1);
      if(event.event.target.id != event.container.id) {
        object.id = object.children[0].parentID = this.table.length,
        this.table.push(object);
      }
      else {
        object.id = object.children[0].parentID = data.parentID + 1,
        this.table.splice((data.parentID + 1),0,object);
      }
    }
    else {
      event.previousContainer.data[event.previousIndex].parentID = event.container.data[0].parentID,
      
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
    alert(data.text);
  }

  exited(event: any) {
    // const currentIdx = event.container.data.findIndex(
    //   (f) => f.id === event.item.data.id
    // );
    // this.menu.splice(currentIdx + 1, 0, {
    //   ...event.item.data,
    //   temp: true,
    // });
  }
  entered() {
    //this.menu = this.menu.filter((f) => !f.temp);
  }
}
