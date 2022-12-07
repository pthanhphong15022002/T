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
import { P } from '@angular/cdk/keycodes';

@Component({
  selector: 'lib-popup-evisas',
  templateUrl: './popup-evisas.component.html',
  styleUrls: ['./popup-evisas.component.css']
})
export class PopupEVisasComponent extends UIComponent implements OnInit {

  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data;
  actionType
  headerText: ''
  funcID;
  employId;
  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    //this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    // if(this.formModel){
    //   this.isAfterRender = true
    // }

    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'EVisas';
      this.formModel.entityName = 'HR_EVisas';
      this.formModel.gridViewName = 'grvEVisas';
    }
    this.funcID = this.dialog.formModel.funcID;
    this.actionType = data?.data?.actionType;
    this.employId = data?.data?.employeeId;
    if(this.actionType === 'edit' || this.actionType === 'copy'){
      this.data = JSON.parse(JSON.stringify(data?.data?.visaSelected));
      this.formModel.currentData = this.data
    }
    console.log('employid', this.employId)
    console.log('formmdel', this.formModel);
  }

    initForm(){
      this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.formGroup = item;  
        if(this.actionType === 'add'){
          this.hrService.getEmployeeVisaModel().subscribe(p => {
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

  onInit(): void {
    this.initForm();
  }

  onSaveForm(){
    if(this.actionType === 'copy'){
      delete this.data.recID
    }
    this.data.employeeID = this.employId 
    
    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.hrService.AddEmployeeVisaInfo(this.data).subscribe(p => {
        if(p != null){
          this.notify.notifyCode('SYS007')
          if(this.listView){
            (this.listView.dataService as CRUDService).add(p).subscribe();
          }
          // this.dialog.close(p)
        }
        else this.notify.notifyCode('DM034')
      });
    }
    else{
      this.hrService.updateEmployeeVisaInfo(this.data).subscribe(p => {
        if(p == true){
          this.notify.notifyCode('SYS007')
          if(this.listView){
            (this.listView.dataService as CRUDService).update(p).subscribe()
          }
          // this.dialog.close(this.data);
        }
        else this.notify.notifyCode('DM034')
      });
    }
    
  }

  click(data) {
    console.log(data);
    this.data = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.data)) 
    this.actionType ='edit'
    this.formGroup?.patchValue(this.data);
    this.cr.detectChanges();
  }

  afterRenderListView(evt){
    this.listView = evt;
    console.log(this.listView);
    
  }

}
