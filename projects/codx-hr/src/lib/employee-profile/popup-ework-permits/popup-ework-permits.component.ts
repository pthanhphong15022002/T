import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { Injector, ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
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
  selector: 'lib-popup-ework-permits',
  templateUrl: './popup-ework-permits.component.html',
  styleUrls: ['./popup-ework-permits.component.css']
})
export class PopupEWorkPermitsComponent extends UIComponent implements OnInit {

  formModel: FormModel;
  dialog: DialogRef;
  lstWorkPermit: any;
  data;
  actionType;
  formGroup: FormGroup
  funcID;
  employId;
  isAfterRender = false;
  headerText: ''
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent
  indexSelected: any;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) { 
    super(injector);
    // this.formModel = dialog?.formModel;
    // if(this.formModel){
    //   this.isAfterRender = true
    // }
    // this.data = dialog?.dataService?.dataSelected
    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'EWorkPermits'
      this.formModel.entityName = 'HR_EWorkPermits'
      this.formModel.gridViewName = 'grvEWorkPermits'
    }
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = this.dialog.formModel.funcID
    this.actionType = data?.data?.actionType;
    this.employId = data?.data?.employeeId;
    this.lstWorkPermit = data?.data?.lstWorkPermit
    this.indexSelected = data?.data?.indexSelected != undefined?data?.data?.indexSelected:-1
    if(this.actionType === 'edit' || this.actionType === 'copy'){
      this.data = JSON.parse(JSON.stringify(data?.data?.selectedWorkPermit));
      this.formModel.currentData = this.data
    }
    console.log('employeeId', this.employId);
    console.log('formModel', this.formModel);
  }

  initForm(){
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item;
      console.log('formGroup', this.formGroup);
      if(this.actionType == 'add'){
        this.hrService.getEmployeeWorkingLisenceModel().subscribe(p => {
          console.log('thong tin giay phep lao dong', p);
          this.data = p;
          this.formModel.currentData = this.data
          console.log('du lieu formmodel', this.formModel.currentData);
        })
      }
      this.formGroup.patchValue(this.data)
      this.isAfterRender = true
    })
  }

  onInit(): void {
    this.initForm();
  }

  onSaveForm(){
    if(this.actionType == 'copy' || this.actionType === 'add'){
      delete this.data.recID
    }
    this.data.employeeID = this.employId
    if(this.actionType == 'add' || this.actionType == 'copy'){
      this.hrService.addEmployeeWorkPermitDetail(this.data).subscribe(p => {
        if(p != null){
          this.data.recID = p.recID
          this.notify.notifyCode('SYS007')
          this.lstWorkPermit.push(JSON.parse(JSON.stringify(this.data)));
                    
          if(this.listView){
            (this.listView.dataService as CRUDService).add(this.data).subscribe();
          }
          // this.dialog.close(p);
        }
        else this.notify.notifyCode('DM034')
      })
    }
    else{
      this.hrService.updateEmployeeWorkPermitDetail(this.data).subscribe(p => {
        if(p == true){
          this.notify.notifyCode('SYS007')
          this.lstWorkPermit[this.indexSelected] = p;
          if(this.listView){
            (this.listView.dataService as CRUDService).update(this.lstWorkPermit[this.indexSelected]).subscribe()
          }
          // this.dialog.close(this.data)
        }
        else this.notify.notifyCode('DM034')
      });
    }

  }

}
