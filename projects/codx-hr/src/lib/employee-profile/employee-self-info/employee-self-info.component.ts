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
  dialog: DialogRef;

  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = new FormModel();
    this.formModel.entityName = 'HR_Employees';
    this.formModel.formName = 'Employees';
    this.formModel.gridViewName = 'grvEmployees';
    this.formModel.funcID = 'HRT03a1';
    this.formModel.entityPer = 'HR_Employees';
  }

  onInit(): void {}

  ngAfterViewInit() {
    console.log('check form', this.form);
  }
}
