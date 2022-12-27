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
import { I } from '@angular/cdk/keycodes';

@Component({
  selector: 'lib-popup-eawards',
  templateUrl: './popup-eawards.component.html',
  styleUrls: ['./popup-eawards.component.css']
})
export class PopupEAwardsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  awardObj;
  lstAwards;
  indexSelected
  actionType
  headerText: ''
  funcID;
  employId;
  valueYear;
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

    // this.formModel = dialog?.formModel;
    // if(this.formModel){
    //   this.isAfterRender = true
    // }
    // this.data = dialog?.dataService?.dataSelected
    if(!this.formModel)
      {
        this.formModel = new FormModel();
        this.formModel.formName = 'EAwards'
        this.formModel.entityName = 'HR_EAwards'
        this.formModel.gridViewName = 'grvEAwards'
      }

      this.dialog = dialog;
      this.headerText = data?.data?.headerText;
      this.funcID = this.dialog.formModel.funcID;
      this.employId = data?.data?.employeeId;
      this.actionType = data?.data?.actionType;
      this.lstAwards = data?.data?.lstAwards
      this.indexSelected = data?.data?.indexSelected != undefined?data?.data?.indexSelected:-1
  
      if(this.actionType === 'edit' || this.actionType ==='copy'){
        this.awardObj = JSON.parse(JSON.stringify(this.lstAwards[this.indexSelected]));
        this.formModel.currentData = this.awardObj
      }
  }

  initForm(){
    this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.formGroup = item;  
        if(this.actionType == 'add'){
          this.hrService.getEmployeeAwardModel().subscribe(p => {
            this.awardObj = p;
            this.formModel.currentData = this.awardObj
            // this.dialog.dataService.dataSelected = this.data
            console.log('du lieu formmodel',this.formModel.currentData);
          })  
        }
        this.formGroup.patchValue(this.awardObj)
        this.isAfterRender = true
      }); 
  }

  onInit(): void {
    this.initForm();
  }

  onSaveForm(){
    if(this.actionType === 'copy' || this.actionType === 'add'){
      delete this.awardObj.recID
    }
    this.awardObj.employeeID = this.employId 
    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.hrService.AddEmployeeAwardInfo(this.awardObj).subscribe(p => {
        if(p != null){
          this.awardObj.recID = p.recID
          this.notify.notifyCode('SYS007')
          this.lstAwards.push(JSON.parse(JSON.stringify(this.awardObj)));
          if(this.listView){
            (this.listView.dataService as CRUDService).add(this.awardObj).subscribe();
          }
          // this.dialog.close(p)
        }
        else this.notify.notifyCode('DM034')
      });
    } 
    else{
      this.hrService.UpdateEmployeeAwardInfo(this.formModel.currentData).subscribe(p => {
        if(p != null){
          this.notify.notifyCode('SYS007')
        this.lstAwards[this.indexSelected] = p;
        if(this.listView){
          (this.listView.dataService as CRUDService).update(this.lstAwards[this.indexSelected]).subscribe()
        }
          // this.dialog.close(this.data)
        }
        else this.notify.notifyCode('DM034')
      });
    }
  }

  click(data) {
    console.log('formdata', data);
    this.awardObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.awardObj)) 
    this.indexSelected = this.lstAwards.findIndex(p => p.recID == this.awardObj.recID);
    this.actionType ='edit'
    this.formGroup?.patchValue(this.awardObj);
    this.cr.detectChanges();
  }

  
  afterRenderListView(evt){
    this.listView = evt;
    console.log(this.listView);
  }

  handleSelectAwardDate(event){
    this.awardObj.inYear = new Date(event.data).getFullYear();
    this.valueYear = this.awardObj.inYear
  }

  inYearSelect(event){
    this.awardObj.inYear = new Date(event.value).getFullYear()
    console.log('cap nhat inyear', this.awardObj.inYear);
  }
}
