import { Component, Input, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { CallFuncService, DialogData, DialogRef } from 'codx-core';
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
  
  constructor(
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
      this.listStage = this.data.steps.filter(x=>!x.parentID);
      this.listStage.forEach(elm => {
        let list = this.data.steps.filter(x=>x.parentID == elm.recID);
        list.forEach(elm2 => {
          elm2.settings = typeof elm2?.settings === 'object' ? elm2.settings : (elm2?.settings ? JSON.parse(elm2.settings) : null);
        });
        elm.child = list;
      });
    }
  }

  addStages()
  {
    this.callFunc.openSide(AddDefaultComponent)
  }
}
