import { FormGroup } from '@angular/forms';
import { CodxHrService } from '../../codx-hr.service'
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

@Component({
  selector: 'lib-popup-epassports',
  templateUrl: './popup-epassports.component.html',
  styleUrls: ['./popup-epassports.component.css']
})
export class PopupEPassportsComponent extends UIComponent implements OnInit {

  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data;
  headerText;
  actionType;
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
    this.actionType = data?.data?.actionType;
    if(this.actionType === 'edit' || this.actionType ==='copy'){
      this.data = JSON.parse(JSON.stringify(data?.data?.passPortSelected));
      this.formModel.currentData = this.data
    }
    console.log('employid', this.employId)
    console.log('formmdel', this.formModel);
   }
   initForm() {
    this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.formGroup = item;  
        if(this.actionType == 'add'){
          this.hrService.getEmployeePassportModel().subscribe(p => {
            console.log('thong tin ho chieu', p);
            this.data = p;
            this.formModel.currentData = this.data
            // this.dialog.dataService.dataSelected = this.data
            console.log('du lieu formmodel',this.formModel.currentData);
          })  
        }
        this.formGroup.patchValue(this.data)
        this.isAfterRender = true
      }); 
  }

    onSaveForm(){
      if(this.actionType === 'copy'){
        delete this.data.recID
      }
      this.data.employeeID = this.employId 
      console.log('du lieu form', this.formGroup.value);
      if(this.actionType === 'add' || this.actionType === 'copy'){
        this.hrService.addEmployeePassportInfo(this.data).subscribe(p => {
          if(p != null){
            this.notify.notifyCode('SYS007')
            this.dialog.close(p)
          }
          else this.notify.notifyCode('DM034')
        });
      } 
      else{
        this.hrService.updateEmployeePassportInfo(this.data).subscribe(p => {
          if(p == true){
            this.notify.notifyCode('SYS007')
            this.dialog.close(this.data)
          }
          else this.notify.notifyCode('DM034')
        });
      }
   }
}
