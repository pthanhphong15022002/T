import { CDK_DRAG_CONFIG, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable, startWith } from 'rxjs';
const DragConfig = {
  dragStartThreshold: 0,
  pointerDirectionChangeThreshold: 5,
  zIndex: 10000
};
@Component({
  selector: 'lib-property-expression-settings',
  templateUrl: './property-expression-settings.component.html',
  styleUrls: ['./property-expression-settings.component.scss'],
  providers: [{ provide: CDK_DRAG_CONFIG, useValue: DragConfig }]
})
export class PropertyExpressionSettingsComponent implements OnInit{
  dialog:any;
  text = "";
  data = [];
  listField:any;
  vllCalculation=
  [
    {
      id: 1,
      value: '&'
    },
    {
      id: 2,
      value: '+'
    },
    {
      id: 3,
      value: '-'
    },
    {
      id: 3,
      value: '*'
    },
    {
      id: 3,
      value: '/'
    }
  ]
  referedValue:any;
  constructor(
    private notifySvr: NotificationsService,
    private shareService: CodxShareService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  )
  {
    this.dialog = dialog;
    this.listField = JSON.parse(JSON.stringify(dt?.data?.listField));
    this.referedValue = dt?.data?.referedValue && typeof dt?.data?.referedValue == 'string' ? JSON.parse(dt?.data?.referedValue) : dt?.data?.referedValue;
  }
  ngOnInit(): void {
    this.getVll();
    this.formatData();
  }
  formatData()
  {
    if(this.referedValue)
    {
      this.referedValue.forEach((elm,i)=>{
        this.data = this.data.concat(elm);
        if(i<this.referedValue.length-1)this.data.push("&");
      })
    }
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

  perform(vll:any)
  {
    this.listField.forEach(elm=>{
      let index = vll.datas.findIndex(x=>x.value == elm.value);
      if(index>=0)
      {
        elm.icon = vll.datas[index].icon;
      }
    })
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      let data = (event.previousContainer.data[event.previousIndex] as any)?.fieldName ;
      if(data) data = "[" + data + "]";
      else if(!data && (event.previousContainer.data[event.previousIndex] as any)?.value) data = (event.previousContainer.data[event.previousIndex] as any)?.value;
      this.data.splice(event.currentIndex, 0, data);
    }
  }
  
  del(index:any)
  {
    this.data.splice(index,1);
  }

  close()
  {
    if(!this.data || this.data.length == 0)
    {
      this.dialog.close(null);
    }
    else
    {
      let mss = this.checkValide();
      if(mss)
      {
        this.notifySvr.notify(mss,'2');
      }
      else
      {
        var arr = []
        var child = [];
        for(var i = 0 ; i < this.data.length ; i++)
        {
          if(this.data[i] != '&') child.push(this.data[i])
          else
          {
            arr.push(child);
            child = [];
          }
    
          if(i == this.data.length - 1) arr.push(child);
        }
        this.dialog.close(arr);
      }
    }
  }

  checkValide()
  {
    let mss = "";
    let str= "+-*/";
    for(var i = 0 ; i < this.data.length ; i++)
    {
      if(this.data[i].startsWith('['))
      {
        let field = this.data[i].slice(1,-1);
        let index = this.listField.findIndex(x=>x.fieldName == field);
        if(index>=0 && this.data[i - 1])
        {
          if(this.data[i-2])
          {
            let field2 = this.data[i-2].slice(1,-1);
            let index2 = this.listField.findIndex(x=>x.fieldName == field2);
            if(index2 >= 0)
            {
              if((this.listField[index].dataType == 'Decimal' && this.listField[index2].dataType != 'Decimal') || (this.listField[index].dataType != 'Decimal' && this.listField[index2].dataType == 'Decimal'))
              {
                if(this.data[i - 1] != '&')
                {
                  mss = this.data[i - 2] + " và " + this.data[i] + " không thực hiện được phép tính";
                  break;
                }
              }
              else if(this.listField[index].dataType == this.listField[index2].dataType)
              {
                if((this.data[i - 1] != '&' && this.listField[index].dataType != 'Decimal'))
                {
                  mss = this.data[i - 2] + " và " + this.data[i] + " không thực hiện được phép tính";
                  break;
                }
              }
            }
            else 
            {
              mss = this.data[i - 2] + " và " + this.data[i] + " không thực hiện được phép tính";
              break;
            }
          }
        }
      }
      // if()
      // let field =
      // if()
    }

    return mss;
  }
}
