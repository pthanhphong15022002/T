import { FormGroup } from '@angular/forms';
import { UIComponent, FormModel, DialogService, DialogRef, CodxFormComponent, NotificationsService, DialogData } from 'codx-core';
import { Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'lib-employee-disciplines-detail',
  templateUrl: './employee-disciplines-detail.component.html',
  styleUrls: ['./employee-disciplines-detail.component.css']
})
export class EmployeeDisciplinesDetailComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data;
  funcID;
  employeeId;
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
      this.formModel.formName = 'EDisciplines'
      this.formModel.entityName = 'HR_EDisciplines'
      this.formModel.gridViewName = 'grvEDisciplines'
    }
    this.employeeId = data?.data?.employeeId;
    
    
  }
  
  initForm(){
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item;
      console.log('form group edisciplins', this.formGroup);
      this.hrService.getEmployeeDesciplinesInfo(this.employeeId).subscribe(p => {
        console.log('thong tin ky luat nhan vien', p);
        this.data = p;
        this.formModel.currentData = this.data
        console.log('du lieu formmodel', this.formModel.currentData);
        this.formGroup.patchValue(this.data)
        this.isAfterRender = true
      })
      
    })
  }

  onInit(): void {
      this.initForm()
  }
  
  onSaveForm(){
    this.hrService.updateEmployeeDisciplinesInfo(this.data).subscribe( p=> {
      if(p === "True"){
        this.notify.notifyCode('SYS007')
        this.dialog.close();
      }
    })
  }
}
