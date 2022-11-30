import { ActionTypeOnTask } from './../../../../../codx-share/src/lib/components/codx-tasks/model/enum';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { FormGroup } from '@angular/forms';
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

@Component({
  selector: 'lib-popup-ejob-salaries',
  templateUrl: './popup-ejob-salaries.component.html',
  styleUrls: ['./popup-ejob-salaries.component.css']
})
export class PopupEJobSalariesComponent extends UIComponent implements OnInit {
  formModel: FormModel
  formGroup: FormGroup
  dialog: DialogRef
  data: any
  funcID: string
  employeeId: string
  isAfterRender = false
  headerText : string
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ){
    super(injector)
    this.dialog = dialog
    this.headerText = data?.data?.headerText
    if(!this.formModel){
      this.formModel = new FormModel()
      this.formModel.formName = 'EJobSalaries'
      this.formModel.entityName = 'HR_EJobSalaries'
      this.formModel.gridViewName = 'grvEJobSalaries'
    }
    this.employeeId = data?.data?.employeeId

  }

  initForm(){
    this.hrSevice
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item
      this.hrSevice.GetEmployeeJobSalariesModel().subscribe(p => {
        this.data = p
        this.formModel.currentData = this.data
      })
      this.formGroup.patchValue(this.data)
      this.isAfterRender = true
    })
  }

  onInit(): void {
    this.initForm()
  }

  onSaveForm(){
    if(this.data.expiredDate < this.data.effectedDate){
      this.notify.notifyCode('HR002')
      return
    }


    this.data.employeeID = this.employeeId
    this.hrSevice.AddEmployeeJobSalariesInfo(this.data).subscribe(p => {
      if(p != null){
        this.notify.notifyCode('SYS007')
        this.dialog.close(p);
      }
      else this.notify.notifyCode('DM034')
    })
  }
}
