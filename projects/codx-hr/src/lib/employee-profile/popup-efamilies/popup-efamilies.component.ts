import { FormGroup } from '@angular/forms';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxHrService } from '../../codx-hr.service';
import { Injector } from '@angular/core';
import{
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'lib-popup-efamilies',
  templateUrl: './popup-efamilies.component.html',
  styleUrls: ['./popup-efamilies.component.css']
})
export class PopupEFamiliesComponent extends UIComponent implements OnInit {

  formModel: FormModel;
  formGroup: FormGroup;
  employId;
  actionType;
  dialog: DialogRef;
  data;
  funcID;
  headerText: ''
  isAfterRender = false;
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
    // this.formModel = dialog?.FormModel
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType
    // if(this.formModel){
    //   this.isAfterRender = true
    // }
    // this.funcID = this.dialog.formModel.funcID;
    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'EFamilies'
      this.formModel.gridViewName = 'grvEFamilies'
      this.formModel.entityName = 'HR_EFamilies'
    }
    if(this.actionType == 'edit' || this.actionType == 'copy'){
      this.data = JSON.parse(JSON.stringify(data?.data?.familyMemberSelected))
      this.formModel.currentData = this.data
      console.log('data dc truyen vao', this.formModel.currentData);
      
    }
    this.employId = data?.data?.employeeId;
  }

  initForm(){
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item
      if(this.actionType == 'add'){
        this.hrService.getEFamilyModel().subscribe(p => {
          console.log(this.formModel.currentData)
          console.log('thong tin ng than', p)
          this.data = p
          this.data.iDCardNo = this.data.idCardNo
      this.data.iDIssuedOn = this.data.idIssuedOn 
      this.data.iDIssuedBy = this.data.idIssuedBy
      this.data.pITNumber = this.data.pitNumber
      this.data.sIRegisterNo = this.data.siRegisterNo
      this.formGroup.patchValue(this.data)
      this.isAfterRender = true
          this.formModel.currentData = this.data
        })
      }
      else{
        this.data.iDCardNo = this.data.idCardNo
      this.data.iDIssuedOn = this.data.idIssuedOn 
      this.data.iDIssuedBy = this.data.idIssuedBy
      this.data.pITNumber = this.data.pitNumber
      this.data.sIRegisterNo = this.data.siRegisterNo
      this.formGroup.patchValue(this.data)
      this.isAfterRender = true
      }
    })
  }
  onInit(): void {
    this.initForm();
  }

  onSaveForm(){
    if(this.actionType === 'copy'){
      delete this.data.recID
    }
    this.data.employeeID = this.employId

    this.data.idCardNo = this.data.iDCardNo
    this.data.idIssuedOn = this.data.iDIssuedOn 
    this.data.idIssuedBy = this.data.iDIssuedBy
    this.data.pitNumber = this.data.pITNumber
    this.data.siRegisterNo = this.data.sIRegisterNo

    delete this.data.iDCardNo
    delete this.data.iDIssuedOn
    delete this.data.iDIssuedBy
    delete this.data.pITNumber
    delete this.data.sIRegisterNo

    if(this.actionType === 'add' || this.actionType === 'copy'){
      console.log('data luu xuong be', this.data);
      
      this.hrService.AddEmployeeFamilyInfo(this.data).subscribe(p => {
        if(p != null){
          this.notify.notifyCode('SYS007')
          this.dialog.close(p)
        }
      })
    }
    else{
      this.hrService.UpdateEmployeeFamilyInfo(this.data).subscribe(p => {
        
        if(p == true){
          this.notify.notifyCode('SYS007')
          this.dialog.close(this.data);
        }
        else this.notify.notifyCode('DM034')
      })
    }
  }

}
