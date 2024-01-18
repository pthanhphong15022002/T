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
    debugger
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
        elm.child = this.data.steps.filter(x=>x.parentID == elm.recID);
      });
    }
  }

  addStages()
  {
    this.callFunc.openSide(AddDefaultComponent)
  }
}
