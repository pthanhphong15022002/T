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
  selector: 'lib-employee-self-info',
  templateUrl: './employee-self-info.component.html',
  styleUrls: ['./employee-self-info.component.css'],
})
export class EmployeeSelfInfoComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  grvSetup
  dialog: DialogRef;
  data;
  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notitfy: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    if(this.formModel){
      this.isAfterRender = true
    }
    this.data = dialog?.dataService?.dataSelected
    // this.formModel.entityName = 'HR_Employees';
    // this.formModel.formName = 'Employees';
    // this.formModel.gridViewName = 'grvEmployees';
    // this.formModel.funcID = 'HRT03a1';
    // this.formModel.entityPer = 'HR_Employees';
  }

  onInit(): void {
    console.log('form', this.form);
    
    this.cache
      .gridViewSetup(
        this.dialog?.formModel?.formName,
        this.dialog?.formModel?.gridViewName
      )
      .subscribe((res) => {
        // this.grvSetup = res;
        // console.log('form model', this.formModel);
      });
  }

  ngAfterViewInit() {
    console.log('check form', this.form);
    console.log('form', this.form);
  }

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  updateDegreeName(){
    let trainFieldId = this.data.trainFieldID
    let trainLev = this.data.trainLevel 
    if(trainFieldId!= null && trainLev != null){
      this.data.degreeName = trainLev + " " + trainFieldId
    }
    else if(trainFieldId){
      this.data.degreeName = trainFieldId
    }
    else if(trainLev){
      this.data.degreeName = trainLev
    }
    this.form?.formGroup.patchValue({degreeName: this.data.degreeName})
  }

  handleOnSaveEmployeeContactInfo(){
    this.hrService.saveEmployeeContactInfo(this.data).subscribe(p => {
      if(p === "True"){
        this.notitfy.notifyCode('SYS007')
        this.dialog.close()
      }
      else this.notitfy.notifyCode('DM034')
    })
  }

  handleOnSaveEmployeeSelfInfo(e?: any){
    //Xu li validate thong tin ngay sinh nhan vien
    if( new Date().getFullYear() - new Date(this.data.birthday).getFullYear() < 18){
      this.notitfy.notifyCode('HR001')
      return
    }

    //Xu li validate thong tin CMND nhan vien
    console.log(this.data.expiredOn)
    console.log(this.data.issuedOn)
    if(this.data.idExpiredOn < this.data.issuedOn){
      this.notitfy.notifyCode('HR002')
      return
    }

    this.hrService.saveEmployeeSelfInfo(this.data).subscribe(p => {
      if(p === "True"){
        this.notitfy.notifyCode('SYS007')
        this.dialog.close()
      }
      else this.notitfy.notifyCode('DM034')
    })
  }

  handleProvinceChange(value){

  }
}
