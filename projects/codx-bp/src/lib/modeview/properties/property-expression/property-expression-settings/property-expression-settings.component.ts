import { CDK_DRAG_CONFIG, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';
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
  constructor(
    private shareService: CodxShareService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  )
  {
    this.dialog = dialog;
    this.listField = JSON.parse(JSON.stringify(dt?.data?.listField));
  }
  ngOnInit(): void {
    this.getVll()
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
      let data = (event.previousContainer.data[event.previousIndex] as any)?.value ;
      if(!data && (event.previousContainer.data[event.previousIndex] as any)?.fieldName) data = "[" + (event.previousContainer.data[event.previousIndex] as any)?.fieldName + "]";
      this.data.push(data);
      // transferArrayItem(
      //   event.previousContainer.data,
      //   event.container.data,
      //   event.previousIndex,
      //   event.currentIndex,
      // );
    }
  }
}
