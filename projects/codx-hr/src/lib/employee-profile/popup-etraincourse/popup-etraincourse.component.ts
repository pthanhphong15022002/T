import { FormGroup, Validators } from '@angular/forms';
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
  selector: 'lib-popup-etraincourse',
  templateUrl: './popup-etraincourse.component.html',
  styleUrls: ['./popup-etraincourse.component.css']
})
export class PopupETraincourseComponent extends UIComponent implements OnInit {

  formGroup: FormGroup;
  formModel: FormModel;
  formGroup2: FormGroup;
  formModel2 :FormModel;
  dialog: DialogRef;
  headerText: ''
  funcID;
  employId;
  IsAfterRender = false;
  data;
  dataForm2;

  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notitfy: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'ETrainCourses'
      this.formModel.entityName = 'HR_ETrainCourses'
      this.formModel.gridViewName = 'grvETrainCourses'
    }
    this.funcID = this.dialog.formModel.funcID
    this.employId = data?.data?.employeeId;
    console.log('employeeid', this.employId);
    console.log('formmodel', this.formModel);
      this.formModel2 = new FormModel();
      this.formModel2.formName = 'ECertificates'
      this.formModel2.entityName = 'HR_ECertificates'
      this.formModel2.gridViewName = 'grvECertificates'
      console.log('formmodel2', this.formModel2);
    
    }
    
  initForm(){
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item;
      console.log('form test:', this.formGroup);
      this.hrService.getEmployeeTrainCourse(this.employId).subscribe(p => {
        console.log('thong tin dao tao nhan vien', p);
        this.data = p;
        this.formModel.currentData = this.data
        this.formGroup.patchValue(this.data)
        this.isAfterRender = true
      })
    })

    this.hrService
    .getFormGroup(this.formModel2.formName, this.formModel2.gridViewName)
    .then((item) => {
      this.formGroup2 = item;
      console.log('form2 test', this.formGroup2);
      this.hrService.getEmployeeCertificatesInfo(this.employId).subscribe(p =>{
        console.log('thong tin chung chi nhan vien', p);
        this.dataForm2 = p;
        this.formModel2.currentData = this.dataForm2
        this.formGroup2.patchValue(this.dataForm2)
        this.isAfterRender = true
      })
    })
  }

  onInit(): void {
    this.initForm();
  }

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  onSaveForm(){
    this.hrService.updateEmployeeTrainCourseInfo(this.data).subscribe(p => {
      if(p === "True"){
        this.notitfy.notifyCode('SYS007')
        this.dialog.close()
      }
      else this.notitfy.notifyCode('DM034')
    })
  }

  onSaveForm2(){
    this.hrService.saveEmployeeCertificatesInfo(this.dataForm2).subscribe(p => {
      if(p === "True"){
        this.notitfy.notifyCode('SYS007')
        this.dialog.close()
      }
      else this.notitfy.notifyCode('DM034')
    })
  }

}
