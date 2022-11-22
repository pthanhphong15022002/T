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
  selector: 'lib-employee-certificate-detail',
  templateUrl: './employee-certificate-detail.component.html',
  styleUrls: ['./employee-certificate-detail.component.css']
})
export class EmployeeCertificateDetailComponent extends UIComponent implements OnInit {

  formModel : FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data;
  funcID;
  employId;
  isAfterRender = false;
  headerText: ''
  @ViewChild('form') form:CodxFormComponent;
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
      this.formModel.formName = 'ECertificates'
      this.formModel.entityName = 'HR_ECertificates'
      this.formModel.gridViewName = 'grvECertificates'
    }
    this.funcID = this.dialog.formModel.funcID
    this.employId = data?.data?.employeeId;
    console.log('employid', this.employId)
    console.log('formmodel', this.formModel)
  }

  initForm(){
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item;
      this.hrService.getEmployeeCertificatesInfo(this.employId).subscribe(p =>{
        console.log('thong tin chung chi', p);
        this.data = p;
        this.formModel.currentData = this.data
        this.formGroup.patchValue(this.data)
        this.isAfterRender = true
      })
    })
  }

  onInit(): void {
    this.initForm();
  }

  onSaveForm(){
    this.hrService.saveEmployeeCertificatesInfo(this.data).subscribe(p => {
      if(p === "True"){
        this.notify.notifyCode('SYS007')
        this.dialog.close();
      }
    })
  }

}
