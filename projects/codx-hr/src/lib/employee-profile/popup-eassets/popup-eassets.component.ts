import { FormGroup } from '@angular/forms';
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

@Component({
  selector: 'lib-popup-eassets',
  templateUrl: './popup-eassets.component.html',
  styleUrls: ['./popup-eassets.component.css']
})
export class PopupEAssetsComponent extends UIComponent implements OnInit {

  formModel: FormModel
  formGroup: FormGroup
  grvSetup
  dialog: DialogRef
  data
  employeeId
  isAfterRender = false
  headerText: ''
  @ViewChild('form') form: CodxFormComponent;
  
  onInit(): void {
    this.InitForm()
  }

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector)
    this.dialog = dialog;
    // this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    // if(this.formModel){
    //   this.isAfterRender = true
    // }
    // this.data = dialog?.dataService?.dataSelected
    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'EAssets'
      this.formModel.entityName = 'HR_EAssets'
      this.formModel.gridViewName = 'grvEAssets'
    }
    this.employeeId = data?.data?.employeeId
  }

  InitForm(){
    this.hrService.getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item;
      console.log('formGroup', this.formGroup)
      this.hrService.getEmployeeAssetsInfo(this.employeeId).subscribe(p => {
        console.log('thong tin tai san', p)
        this.data = p
        this.formModel.currentData = this.data
        console.log('du lieu formmodel', this.formModel.currentData);
        this.formGroup.patchValue(this.data)
        this.isAfterRender = true
      })
    })
  }

  onSaveForm(){
    this.hrService.updateEmployeeAssetsInfo(this.data).subscribe(p => {
      if(p === "True"){
        this.notify.notifyCode('SYS007')
      }
    })
  }
}
