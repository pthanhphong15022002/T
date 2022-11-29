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
  selector: 'lib-employee-working-lisence-detail',
  templateUrl: './employee-working-lisence-detail.component.html',
  styleUrls: ['./employee-working-lisence-detail.component.css']
})
export class EmployeeWorkingLisenceDetailComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  dialog: DialogRef;
  data;
  isAdd;
  formGroup: FormGroup
  funcID;
  employId;
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
    // this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    // if(this.formModel){
    //   this.isAfterRender = true
    // }
    // this.data = dialog?.dataService?.dataSelected
    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'EWorkPermits'
      this.formModel.entityName = 'HR_EWorkPermits'
      this.formModel.gridViewName = 'grvEWorkPermits'
    }
    this.funcID = this.dialog.formModel.funcID
    this.employId = data?.data?.employeeId;
    this.isAdd = data?.data?.isAdd;
    if(this.isAdd == false){
      this.data = data?.data?.selectedWorkPermit;
      this.formModel.currentData = this.data
    }
    console.log('employeeId', this.employId);
    console.log('formModel', this.formModel);
  }

  initForm(){
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item;
      console.log('formGroup', this.formGroup);
      if(this.isAdd == true){
        this.hrService.getEmployeeWorkingLisenceModel().subscribe(p => {
          console.log('thong tin giay phep lao dong', p);
          this.data = p;
          this.formModel.currentData = this.data
          console.log('du lieu formmodel', this.formModel.currentData);
        })
      }
      this.formGroup.patchValue(this.data)
      this.isAfterRender = true
    })
  }

  onInit(): void {
    this.initForm();
  }

  onSaveForm(){
    this.data.employeeID = this.employId
    if(this.isAdd == true){
      this.hrService.addEmployeeWorkPermitDetail(this.data).subscribe(p => {
        if(p == true){
          this.notify.notifyCode('SYS007')
          this.dialog.close();
        }
        else this.notify.notifyCode('DM034')
      })
    }
    else{
      this.hrService.updateEmployeeWorkPermitDetail(this.data).subscribe(p => {
        if(p == true){
          this.notify.notifyCode('SYS007')
          this.dialog.close()
        }
        else this.notify.notifyCode('DM034')
      });
    }

  }
}
