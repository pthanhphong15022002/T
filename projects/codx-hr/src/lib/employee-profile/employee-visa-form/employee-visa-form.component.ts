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
  selector: 'lib-employee-visa-form',
  templateUrl: './employee-visa-form.component.html',
  styleUrls: ['./employee-visa-form.component.css']
})
export class EmployeeVisaFormComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data;
  headerText: ''
  funcID;
  employId;
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
    //this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    // if(this.formModel){
    //   this.isAfterRender = true
    // }

    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'EVisas';
      this.formModel.entityName = 'HR_EVisas';
      this.formModel.gridViewName = 'grvEVisas';
    }
    this.funcID = this.dialog.formModel.funcID;
    this.employId = data?.data?.employeeId;
    console.log('employid', this.employId)
    console.log('formmdel', this.formModel);
  }

    initForm(){
      this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.formGroup = item;  
        console.log('formgr test:', this.formGroup)  
        this.hrService.getEmployeeVisasInfo(this.employId).subscribe(p => {
          console.log('thong tin ho chieu', p);
          this.data = p;
          this.formModel.currentData = this.data
          // this.dialog.dataService.dataSelected = this.data
          console.log('du lieu formmodel',this.formModel.currentData);
          this.formGroup.patchValue(this.data)
          this.isAfterRender = true
      })
    });
  }

  onInit(): void {
    this.initForm();
  }

  onSaveForm(){
    this.hrService.updateEmployeeVisaInfo(this.data).subscribe(p => {
      if(p === "True"){
        this.notify.notifyCode('SYS007')
        this.dialog.close();
      }
      else this.notify.notifyCode('DM034')
    });
  }
}
