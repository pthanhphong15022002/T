import { FormGroup } from '@angular/forms';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxHrService } from '../../codx-hr.service';
import { Injector } from '@angular/core';
import{
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
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
  lstFamilyMembers;
  indexSelected;
  familyMemberObj;
  funcID;
  headerText: ''
  isAfterRender = false;
  @ViewChild('form') form:CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.lstFamilyMembers = data?.data?.lstFamilyMembers
    this.indexSelected = data?.data?.indexSelected != undefined?data?.data?.indexSelected:-1
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
      this.familyMemberObj = JSON.parse(JSON.stringify(this.lstFamilyMembers[this.indexSelected]))
      this.formModel.currentData = this.familyMemberObj
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
          this.familyMemberObj = p
          this.familyMemberObj.iDCardNo = this.familyMemberObj.idCardNo
      this.familyMemberObj.iDIssuedOn = this.familyMemberObj.idIssuedOn 
      this.familyMemberObj.iDIssuedBy = this.familyMemberObj.idIssuedBy
      this.familyMemberObj.pITNumber = this.familyMemberObj.pitNumber
      this.familyMemberObj.sIRegisterNo = this.familyMemberObj.siRegisterNo
      this.formGroup.patchValue(this.familyMemberObj)
      this.isAfterRender = true
          this.formModel.currentData = this.familyMemberObj
        })
      }
      else{
        this.familyMemberObj.iDCardNo = this.familyMemberObj.idCardNo
      this.familyMemberObj.iDIssuedOn = this.familyMemberObj.idIssuedOn 
      this.familyMemberObj.iDIssuedBy = this.familyMemberObj.idIssuedBy
      this.familyMemberObj.pITNumber = this.familyMemberObj.pitNumber
      this.familyMemberObj.sIRegisterNo = this.familyMemberObj.siRegisterNo
      this.formGroup.patchValue(this.familyMemberObj)
      this.isAfterRender = true
      }
    })
  }
  onInit(): void {
    this.initForm();
  }

  onSaveForm(){
    if(this.actionType === 'copy' || this.actionType === 'add'){
      delete this.familyMemberObj.recID
    }
    this.familyMemberObj.employeeID = this.employId

    this.familyMemberObj.idCardNo = this.familyMemberObj.iDCardNo
    this.familyMemberObj.idIssuedOn = this.familyMemberObj.iDIssuedOn 
    this.familyMemberObj.idIssuedBy = this.familyMemberObj.iDIssuedBy
    this.familyMemberObj.pitNumber = this.familyMemberObj.pITNumber
    this.familyMemberObj.siRegisterNo = this.familyMemberObj.sIRegisterNo

    delete this.familyMemberObj.iDCardNo
    delete this.familyMemberObj.iDIssuedOn
    delete this.familyMemberObj.iDIssuedBy
    delete this.familyMemberObj.pITNumber
    delete this.familyMemberObj.sIRegisterNo

    if(this.actionType === 'add' || this.actionType === 'copy'){
      console.log('data luu xuong be', this.familyMemberObj);
      
      this.hrService.AddEmployeeFamilyInfo(this.familyMemberObj).subscribe(p => {
        if(p != null){
          this.familyMemberObj.recID = p.recID
          this.notify.notifyCode('SYS007')
          this.lstFamilyMembers.push(JSON.parse(JSON.stringify(this.familyMemberObj)));
          if(this.listView){
            (this.listView.dataService as CRUDService).add(this.familyMemberObj).subscribe();
          }
          // this.dialog.close(p)
        }
        else this.notify.notifyCode('DM034')
      })
    }
    else{
      this.hrService.UpdateEmployeeFamilyInfo(this.formModel.currentData).subscribe(p => {
        
        if(p != null){
          this.notify.notifyCode('SYS007')
          this.lstFamilyMembers[this.indexSelected] = p
          if(this.listView){
            (this.listView.dataService as CRUDService).update(this.lstFamilyMembers[this.indexSelected]).subscribe()
          }
          // this.dialog.close(this.familyMemberObj);
        }
        else this.notify.notifyCode('DM034')
      })
    }
  }

  click(data) {
    console.log('formdata', data);
    this.familyMemberObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.familyMemberObj)) 
    this.indexSelected = this.lstFamilyMembers.findIndex(p => p.recID = this.familyMemberObj.recID);
    this.actionType ='edit'
    this.formGroup?.patchValue(this.familyMemberObj);
    this.cr.detectChanges();
  }

  
  afterRenderListView(evt){
    this.listView = evt;
    console.log(this.listView);
  }

}
