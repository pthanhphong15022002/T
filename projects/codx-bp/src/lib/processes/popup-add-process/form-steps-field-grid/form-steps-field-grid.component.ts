import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { CallFuncService, DialogData, DialogRef, SidebarModel } from 'codx-core';
import { StagesComponent } from './stages/stages.component';
import { AddDefaultComponent } from './add-default/add-default.component';

@Component({
  selector: 'lib-form-steps-field-grid',
  templateUrl: './form-steps-field-grid.component.html',
  styleUrls: ['./form-steps-field-grid.component.scss']
})
export class FormStepsFieldGridComponent implements OnInit, OnChanges{
  @Input() data: any;
  
  listStage = [];
  count = 0;
  constructor(
    private ref: ChangeDetectorRef,
    private callFunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  )
  {
    if(dt?.data) this.data = dt?.data
  }
  ngOnInit(): void {
    this.formatData();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] &&
      changes['data']?.currentValue != changes['data']?.previousValue
    ) 
    {
      this.data = changes['data']?.currentValue;
      this.formatData();
    }
  }
  
  formatData()
  {
    if(this.data && this.data.steps)
    {
      this.count = this.data.steps.length;
      this.listStage = this.data.steps.filter(x=>!x.parentID);
      this.count -= this.listStage.length;
      this.listStage.forEach(elm => {
        elm.child = this.getListChild(elm);
      });
    }
  }

  getListChild(elm:any)
  {
    if(this.count == 0) return; 
    
    let list = this.data.steps.filter(x=>x.parentID == elm.recID);
    this.count -= list.length;
    list.forEach(elm2 => {
      elm2.settings = typeof elm2?.settings === 'object' ? elm2.settings : (elm2?.settings ? JSON.parse(elm2.settings) : null);
      elm2.child = this.getListChild(elm2);
    });
    
    return list;
  }

  addEditStages(activityType:any,type:any,item:any = null,parent:any = null,stage:any = null)
  {
    let lstParent = JSON.parse(JSON.stringify(this.listStage));
    lstParent.forEach(elm=>{
      delete elm.child;
    })
    var obj = 
    {
      type: type,
      activityType: activityType,
      process: this.data,
      data: item,
      parent: parent,
      stage: stage,
      listStage: lstParent
    }
    let option = new SidebarModel();
    option.Width = "Auto"
    let popup = this.callFunc.openSide(AddDefaultComponent,obj,option);
    popup.closed.subscribe(res=>
      {
        debugger
        if(res?.event)
        {
          let dt = res?.event;
          if(dt.activityType == "Stage")
          {
            var index = this.listStage.findIndex(x=>x.recID == dt.recID);
            if(index >= 0) this.listStage[index] = dt;
            else this.listStage.push(dt);
          }
          else
          {
            var index = this.listStage.findIndex(x=>x.recID == dt.parentID);
            if(type == 'add') this.listStage[index].child.push(dt);
            else {
              var index2 = this.listStage[index].child.findIndex(x=>x.recID == dt.recID)
              if(index2 >= 0) this.listStage[index].child[index2] = dt;
            }
          }
          this.ref.detectChanges();
        }
      });
  }
}
