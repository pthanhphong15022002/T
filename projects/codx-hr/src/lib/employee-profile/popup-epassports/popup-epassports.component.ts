import { FormGroup } from '@angular/forms';
import { CodxHrService } from '../../codx-hr.service'
import { Injector, ChangeDetectorRef } from '@angular/core';
import { 
  Component, 
  OnInit,
  Optional,
  ViewChild  
} from '@angular/core';

import {
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
  selector: 'lib-popup-epassports',
  templateUrl: './popup-epassports.component.html',
  styleUrls: ['./popup-epassports.component.css']
})
export class PopupEPassportsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  passportObj;
  lstPassports
  indexSelected
  headerText;
  actionType;
  funcID;
  isAfterRender = false;
  employId;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  onInit(): void {
    this.initForm();
  }
  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'EPassports';
      this.formModel.entityName = 'HR_EPassports';
      this.formModel.gridViewName = 'grvEPassports';
    }

    this.dialog = dialog;
    this.headerText = data?.data?.headerText;

    
    this.funcID = this.dialog.formModel.funcID;
    this.employId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.lstPassports = data?.data?.lstPassports
    this.indexSelected = data?.data?.indexSelected != undefined?data?.data?.indexSelected:-1

    if(this.actionType === 'edit' || this.actionType ==='copy'){
      this.passportObj = JSON.parse(JSON.stringify(this.lstPassports[this.indexSelected]));
      this.formModel.currentData = this.passportObj
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
            this.passportObj = p;
            this.formModel.currentData = this.passportObj
            // this.dialog.dataService.dataSelected = this.data
            console.log('du lieu formmodel',this.formModel.currentData);
          })  
        }
        this.formGroup.patchValue(this.passportObj)
        this.isAfterRender = true
      }); 
  }

    onSaveForm(){
      if(this.actionType === 'copy' || this.actionType === 'add'){
        delete this.passportObj.recID
      }
      this.passportObj.employeeID = this.employId 
      if(this.actionType === 'add' || this.actionType === 'copy'){
        this.hrService.addEmployeePassportInfo(this.passportObj).subscribe(p => {
          if(p != null){
            this.passportObj.recID = p.recID
            this.notify.notifyCode('SYS007')
            this.lstPassports.push(JSON.parse(JSON.stringify(this.passportObj)));
            if(this.listView){
              (this.listView.dataService as CRUDService).add(this.passportObj).subscribe();
            }
            // this.dialog.close(p)
          }
          else this.notify.notifyCode('DM034')
        });
      } 
      else{
        this.hrService.updateEmployeePassportInfo(this.formModel.currentData).subscribe(p => {
          if(p != null){
            this.notify.notifyCode('SYS007')
          this.lstPassports[this.indexSelected] = p;
          if(this.listView){
            (this.listView.dataService as CRUDService).update(this.lstPassports[this.indexSelected]).subscribe()
          }
            // this.dialog.close(this.data)
          }
          else this.notify.notifyCode('DM034')
        });
      }
   }

   click(data) {
    console.log('formdata', data);
    this.passportObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.passportObj)) 
    this.indexSelected = this.lstPassports.findIndex(p => p.recID = this.passportObj.recID);
    this.actionType ='edit'
    this.formGroup?.patchValue(this.passportObj);
    this.cr.detectChanges();
  }

  
  afterRenderListView(evt){
    this.listView = evt;
    console.log(this.listView);
  }
}
