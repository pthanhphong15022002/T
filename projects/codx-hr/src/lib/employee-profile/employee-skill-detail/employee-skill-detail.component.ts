import { itemMove } from '@syncfusion/ej2-angular-treemap';
import { CodxHrService } from './../../codx-hr.service'; 
import { Injector } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import{
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { FormGroup } from '@angular/forms';
import { ThumbSettings } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'lib-employee-skill-detail',
  templateUrl: './employee-skill-detail.component.html',
  styleUrls: ['./employee-skill-detail.component.css']
})
export class EmployeeSkillDetailComponent extends UIComponent implements OnInit {

  formModel: FormModel
  formGroup: FormGroup
  dialog: DialogRef
  data
  funcID;
  employId
  isAfterRender = false
  headerText: ''
  @ViewChild('form') form: CodxFormComponent

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector)
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    // this.formModel = dialog?.formModel;
    // if(this.formModel){
    //   this.isAfterRender = true
    // }
    // this.data = dialog?.dataService?.dataSelected
    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'ESkills'
      this.formModel.entityName = 'HR_ESkills'
      this.formModel.gridViewName = 'grvESkills'
    }
    this.funcID = this.dialog.formModel.funcID
    this.employId = data?.data?.employeeId
    console.log('employId', this.employId);
    console.log('formmodel', this.formModel);
  }

  initForm(){
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item;
      this.hrService.getEmployeeSkillsInfo(this.employId).subscribe(p => {
        console.log('thong tin ki nang', p)
        this.data = p;
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
    this.hrService.saveEmployeeSkillsInfo(this.data).subscribe(p => {
      if(p === "True"){
        this.notify.notifyCode('SYS007')
        this.dialog.close();
      }
    })
  }
}
