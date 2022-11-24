import { FormGroup } from '@angular/forms';
import { UIComponent, FormModel, DialogRef, CodxFormComponent, NotificationsService, DialogData } from 'codx-core';
import { Component, Injector, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'lib-employee-awards-detail',
  templateUrl: './employee-awards-detail.component.html',
  styleUrls: ['./employee-awards-detail.component.css']
})
export class EmployeeAwardsDetailComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data;
  headerText: ''
  funcID;
  employId;
  valueYear;
  isAfterRender = false;
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
    this.headerText = data?.data?.headerText;
    // this.formModel = dialog?.formModel;
    // if(this.formModel){
    //   this.isAfterRender = true
    // }
    // this.data = dialog?.dataService?.dataSelected
    if(!this.formModel)
      {
        this.formModel = new FormModel();
        this.formModel.formName = 'EAwards'
        this.formModel.entityName = 'HR_EAwards'
        this.formModel.gridViewName = 'grvEAwards'
      }
      this.funcID = this.dialog.formModel.funcID
      this.employId = data?.data?.employeeId
      console.log('employid', this.employId);
      console.log('formmodel', this.formModel);
  }

  initForm(){
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item;
      console.log('formGroup award', this.formGroup)
      this.hrService.getEmployeeAwardInfo(this.employId).subscribe( p => {
        console.log('thong tin khen thuong')
        this.data = p
        this.formModel.currentData = this.data
        console.log('du lieu formmodel', this.formModel.currentData);
        this.formGroup.patchValue(this.data)
        this.isAfterRender = true
      })
    })
  }

  onInit(): void {
    this.initForm();
  }

  onSaveForm(){
    this.hrService.updateEmployeeAwardInfo(this.data).subscribe(p => {
      if(p === "True"){
        this.notify.notifyCode('SYS007')
        this.dialog.close()
      }
      else this.notify.notifyCode('DM034')
    })
  }

  handleSelectAwardDate(event){
    this.data.inYear = new Date(event.data).getFullYear();
    this.valueYear = this.data.inYear
  }

  inYearSelect(event){
    this.data.inYear = new Date(event.value).getFullYear()
    console.log('cap nhat inyear', this.data.inYear);
  }

}
