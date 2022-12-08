import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { Injector, ChangeDetectorRef } from '@angular/core';
import { CalendarView, DatePicker } from '@syncfusion/ej2-calendars';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
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
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
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
    if(this.actionType === 'edit'){
      this.data = JSON.parse(JSON.stringify(data?.data?.experienceSelected))
      this.formModel.currentData = this.data
    }
  }

  initForm(){
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item;
      if(this.actionType == 'add'){
        this.hrService.GetEmployeeExperienceModel().subscribe(p => {
          this.data = p;
          console.log('du lieu form', p);
          this.formModel.currentData = this.data
        })
      }
      this.formGroup.patchValue(this.data)
      this.isAfterRender = true
    })
  }

  onInit(): void {
    this.initForm()
  }

  onSaveForm(){
    this.data.employeeID = this.employeeId
    console.log('employeeId', this.data.employeeID);
    
    this.data.fromDate = this.fromdateVal
    this.data.toDate = this.todateVal
    if(this.actionType === 'add'){
      this.hrService.AddEmployeeExperienceInfo(this.data).subscribe(p => {
        if(p != null){
          this.notify.notifyCode('SYS007')
          if(this.listView){
            (this.listView.dataService as CRUDService).add(p).subscribe();
          }
          // this.dialog.close(p)
        }
        else this.notify.notifyCode('DM034')
      })
    }
    else{
      this.hrService.UpdateEmployeeExperienceInfo(this.formModel.currentData).subscribe(p => {
        console.log('this.data', this.data);
        
        if(p != null){
          this.notify.notifyCode('SYS007')
          if(this.listView){
            (this.listView.dataService as CRUDService).update(p).subscribe();
          }
          // this.dialog.close(this.data);
        }
        else this.notify.notifyCode('DM034')
      });
    }
  }

  UpdateFromDate(e){
    this.fromdateVal = e
  }

  UpdateToDate(e){
    this.todateVal = e
  }

  click(data) {
    console.log(data);
    this.data = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.data)) 
    this.actionType ='edit'
    this.fromdateVal = this.data.fromDate
    this.todateVal = this.data.toDate
    this.formGroup?.patchValue(this.data);
    this.cr.detectChanges();
  }

  afterRenderListView(evt){
    this.listView = evt;
    console.log(this.listView);
  }
}
