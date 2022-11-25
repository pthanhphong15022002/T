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
  selector: 'lib-employee-family-relationship-detail',
  templateUrl: './employee-family-relationship-detail.component.html',
  styleUrls: ['./employee-family-relationship-detail.component.css']
})
export class EmployeeFamilyRelationshipDetailComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  employId;
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
    this.employId = data?.data?.employeeId;
  }

  initForm(){
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item
      this.hrService.getEmployeeFamilyRelationshipInfo(this.employId).subscribe(p => {
        console.log('thong tin ng than', p)
        this.data = p
        this.data.iDCardNo = this.data.idCardNo
        this.data.iDIssuedOn = this.data.idIssuedOn 
        this.data.iDIssuedBy = this.data.idIssuedBy
        this.data.pITNumber = this.data.pitNumber
        this.data.sIRegisterNo = this.data.siRegisterNo
        this.formModel.currentData = this.data
        this.formGroup.patchValue(this.data)
        
        console.log('formGroup', this.formGroup);
        
        this.isAfterRender = true
      })
    })
  }
  onInit(): void {
    this.initForm();
  }

  onSaveForm(){

    this.data.idCardNo = this.data.iDCardNo
    this.data.idIssuedOn = this.data.iDIssuedOn 
    this.data.idIssuedBy = this.data.iDIssuedBy
    this.data.pitNumber = this.data.pITNumber
    this.data.siRegisterNo = this.data.sIRegisterNo

    delete this.data.recID
    delete this.data.iDCardNo
    delete this.data.iDIssuedOn
    delete this.data.iDIssuedBy
    delete this.data.pITNumber
    delete this.data.sIRegisterNo
    this.hrService.saveEmployeeFamilyRelationshipInfo(this.data).subscribe(p => {
      if(p === "True"){
        this.notify.notifyCode('SYS007')
        this.dialog.close();
      }
    })
  }

}
