import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { Injector, inject } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,

} from 'codx-core';

@Component({
  selector: 'lib-popup-ebasic-salaries',
  templateUrl: './popup-ebasic-salaries.component.html',
  styleUrls: ['./popup-ebasic-salaries.component.css']
})
export class PopupEBasicSalariesComponent extends UIComponent implements OnInit {
  formModel: FormModel
  formGroup: FormGroup
  dialog: DialogRef
  data: any
  actionType: string
  funcID: string
  employeeId: string
  isAfterRender = false
  headerText: ' '
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ){
    super(injector)
    this.dialog = dialog
    this.headerText = data?.data?.headerText
    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'EWorkPermits'
      this.formModel.entityName = 'HR_EBasicSalaries'
      this.formModel.gridViewName = ''
    }
  }

  onInit(): void {
  }
}
