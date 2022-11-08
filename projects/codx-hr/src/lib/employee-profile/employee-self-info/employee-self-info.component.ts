import { Injector } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'lib-employee-self-info',
  templateUrl: './employee-self-info.component.html',
  styleUrls: ['./employee-self-info.component.css'],
})
export class EmployeeSelfInfoComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  grvSetup
  dialog: DialogRef;
  data;
  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    if(this.formModel){
      this.isAfterRender = true
    }
    this.data = dialog?.dataService?.dataSelected
    // this.formModel.entityName = 'HR_Employees';
    // this.formModel.formName = 'Employees';
    // this.formModel.gridViewName = 'grvEmployees';
    // this.formModel.funcID = 'HRT03a1';
    // this.formModel.entityPer = 'HR_Employees';
  }

  onInit(): void {
    console.log('form', this.form);
    
    this.cache
      .gridViewSetup(
        this.dialog?.formModel?.formName,
        this.dialog?.formModel?.gridViewName
      )
      .subscribe((res) => {
        this.grvSetup = res;
        console.log('form model', this.formModel);
      });
  }

  ngAfterViewInit() {
    console.log('check form', this.form);
    console.log('form', this.form);
  }
}
