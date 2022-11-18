import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service'
import { Injector } from '@angular/core';
import { 
  Component, 
  OnInit,
  Optional,
  ViewChild  
} from '@angular/core';

import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
 } from 'codx-core';
import { L } from '@angular/cdk/keycodes';

@Component({
  selector: 'lib-employee-legal-passport-form',
  templateUrl: './employee-legal-passport-form.component.html',
  styleUrls: ['./employee-legal-passport-form.component.css']
})
export class EmployeeLegalPassportFormComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data;
  headerText;
  funcID;
  isAfterRender = false;

  employId;
  @ViewChild('form') form: CodxFormComponent;
  onInit(): void {
    this.initForm();
    

  }

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    // this.formModel = dialog?.formModel
    this.headerText = data?.data?.headerText;
    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'EPassports';
      this.formModel.entityName = 'HR_EPassports';
      this.formModel.gridViewName = 'grvEPassports';
    }
    
    this.funcID = this.dialog.formModel.funcID;
    this.employId = data?.data?.employeeId;
    console.log('employid', this.employId)
    console.log('formmdel', this.formModel);
    // this.data = dialog?.dataService?.dataSelected
   }
   initForm() {
    this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.formGroup = item;  
        console.log('formgr test:', this.formGroup)  
        this.hrService.getEmployeePassportInfo(this.employId).subscribe(p => {
          console.log('thong tin ho chieu', p);
          this.data = p;
          this.formModel.currentData = this.data
          console.log('du lieu formmodel',this.formModel.currentData);
          
          this.isAfterRender = true
        })    
      }); 
  }

    onSaveForm(){
      console.log('du lieu form', this.formGroup.value);
      
      this.hrService.saveEmployeePassportInfo(this.data).subscribe(p => {
        if(p === "True"){
          this.notify.notifyCode('SYS007')
          this.dialog.close()
        }
        else this.notify.notifyCode('DM034')
      });
   }
}
