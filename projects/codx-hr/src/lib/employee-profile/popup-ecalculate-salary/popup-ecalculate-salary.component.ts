import { extend } from '@syncfusion/ej2-base';
import { CodxHrService } from './../../codx-hr.service';
import { Injector } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { onSave } from '@syncfusion/ej2-angular-spreadsheet';

@Component({
  selector: 'lib-popup-ecalculate-salary',
  templateUrl: './popup-ecalculate-salary.component.html',
  styleUrls: ['./popup-ecalculate-salary.component.css']
})
export class PopupECalculateSalaryComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  dialog: DialogRef;
  data;
  isAfterRender = false;
  headerText: ''
  @ViewChild('form') form: CodxFormComponent;
  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) { 
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    console.log('formModel ecalculate salary', this.formModel);
    this.headerText = data?.data?.headerText;
    if(this.formModel){
      this.isAfterRender = true
  }
  this.data = dialog?.dataService?.dataSelected
}
  onInit(): void{

  }

  onSaveForm(){

  }
}
