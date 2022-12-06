import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { Injector } from '@angular/core';
import { CalendarView, DatePicker } from '@syncfusion/ej2-calendars';
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
  selector: 'lib-popup-eexperiences',
  templateUrl: './popup-eexperiences.component.html',
  styleUrls: ['./popup-eexperiences.component.css']
})
export class PopupEexperiencesComponent extends UIComponent implements OnInit {
  formModel: FormModel
  formGroup: FormGroup
  dialog: DialogRef
  data: any
  start: CalendarView = 'Year';
  depth: CalendarView = 'Year';
  format: string = 'MM/yyyy'
  fromdateVal: any
  todateVal: any
  funcID: string
  employId: string
  actionType: string
  employeeId: string
  isAfterRender = false
  headerText: string
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
    this.employeeId = data?.data?.employeeId
    this.actionType = data?.data?.actionType
    if(!this.formModel){
      this.formModel = new FormModel()
      this.formModel.formName = 'EExperiences'
      this.formModel.entityName = 'HR_EExperiences'
      this.formModel.gridViewName = 'grvEExperiences'
    }
    this.funcID = this.dialog.formModel.funcID
    this.employId = data?.data?.employeeId;
  }

  initForm(){
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item;
      this.hrService.getEmployeeDregreesInfo(this.employId).subscribe(p => {
        this.data = p;
        console.log('du lieu form', p);
        
        this.formModel.currentData = this.data
        this.formGroup.patchValue(this.data)
        this.isAfterRender = true
      })
    })
  }

  onInit(): void {
    this.initForm()
  }

  onSaveForm(){
    
  }

  UpdateFromDate(e){
    console.log(e);

  }

  UpdateToDate(e){
    console.log(e);


  }
}
