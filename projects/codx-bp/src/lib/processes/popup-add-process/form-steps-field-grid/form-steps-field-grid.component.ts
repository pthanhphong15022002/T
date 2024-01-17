import { Component } from '@angular/core';
import { CallFuncService } from 'codx-core';
import { StagesComponent } from './stages/stages.component';
import { AddDefaultComponent } from './add-default/add-default.component';

@Component({
  selector: 'lib-form-steps-field-grid',
  templateUrl: './form-steps-field-grid.component.html',
  styleUrls: ['./form-steps-field-grid.component.scss']
})
export class FormStepsFieldGridComponent {
  listStage = [];
  
  constructor(
    private callFunc: CallFuncService
  )
  {

  }

  addStages()
  {
    this.callFunc.openSide(AddDefaultComponent)
  }
}
