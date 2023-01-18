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
  selector: 'lib-popup-edayoffs',
  templateUrl: './popup-edayoffs.component.html',
  styleUrls: ['./popup-edayoffs.component.css']
})
export class PopupEdayoffsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  lstPregnantType;
  dayoffObj: any;
  lstDayoffs: any;
  funcID: string;
  indexSelected
  isnormalPregnant = false
  isNotNormalPregnant = false
  actionType: string;
  employId: string;
  isAfterRender = false;
  headerText: string;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  onInit(): void {
    this.initForm();
  }

  constructor(    
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
    ) { 
      super(injector);
      if (!this.formModel) {
        this.formModel = new FormModel();
        this.formModel.formName = 'EDayOffs';
        this.formModel.entityName = 'HR_EDayOffs';
        this.formModel.gridViewName = 'grvEDayOffs';
      }
      this.dialog = dialog;
      this.headerText = data?.data?.headerText;
      this.employId = data?.data?.employeeId;
      this.lstDayoffs = data?.data?.lstDayOffs
      this.actionType = data?.data?.actionType;
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.dayoffObj = JSON.parse(JSON.stringify(data?.data?.salarySelected));
        this.formModel.currentData = this.dayoffObj;
      }      
    }

    initForm() {
      this.cache.gridViewSetup(this.formModel.formName, this.formModel.gridViewName).subscribe(p => {
        this.cache.valueList(p.NewChildBirthType.referedValue).subscribe(p => {
          this.lstPregnantType = p.datas;
          console.log('pregnanttype', this.lstPregnantType);
          
        })
      })


      this.hrSevice
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((item) => {
          this.formGroup = item;  
          if(this.actionType == 'add'){
            this.hrSevice.getEmployeeDayOffModel().subscribe(p => {
              this.dayoffObj = p;
              this.formModel.currentData = this.dayoffObj
              console.log('du lieu formmodel',this.formModel.currentData);
            })  
          }
          this.formGroup.patchValue(this.dayoffObj)
          this.isAfterRender = true
        }); 
    }

    onSaveForm(){
      if(this.actionType === 'copy' || this.actionType === 'add'){
        delete this.dayoffObj.recID
      }
      this.dayoffObj.employeeID = this.employId 
      if(this.actionType === 'add' || this.actionType === 'copy'){
        if(this.dayoffObj.beginDate > this.dayoffObj.endDate){
          this.notify.notifyCode('HR002')
          return
        }

        this.hrSevice.AddEmployeeDayOffInfo(this.dayoffObj).subscribe(p => {
          if(p != null){
            this.dayoffObj.recID = p.recID
            this.notify.notifyCode('SYS007')
            this.lstDayoffs.push(JSON.parse(JSON.stringify(this.dayoffObj)));
            if(this.listView){
              (this.listView.dataService as CRUDService).add(this.dayoffObj).subscribe();
            }
          }
          else this.notify.notifyCode('DM034')
        });
      } 
      else{
        this.hrSevice.UpdateEmployeeDayOffInfo(this.formModel.currentData).subscribe(p => {
          if(p != null){
            this.notify.notifyCode('SYS007')
          this.lstDayoffs[this.indexSelected] = p;
          if(this.listView){
            (this.listView.dataService as CRUDService).update(this.lstDayoffs[this.indexSelected]).subscribe()
          }
          }
          else this.notify.notifyCode('DM034')
        });
      }
  }

  click(data) {
    console.log('formdata', data);
    this.dayoffObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.dayoffObj)) 
    this.indexSelected = this.lstDayoffs.findIndex(p => p.recID == this.dayoffObj.recID);
    this.actionType ='edit'
    this.formGroup?.patchValue(this.dayoffObj);
    this.cr.detectChanges();
  }

  
  afterRenderListView(evt){
    this.listView = evt;
    console.log(this.listView);
  }
  
  HandlePregnantTypeChange(e, pregnantType){
    console.log('e e ', e);
    console.log('type', pregnantType);
    
    if(e.component.checked == true){
      if(pregnantType.value == '1'){
        this.isnormalPregnant = true;
        this.isNotNormalPregnant = false;
      }
      else{
        this.isnormalPregnant = false;
        this.isNotNormalPregnant = true;
      }
    }else if(e.component.checked == false){
      if(pregnantType.value == '1'){
        this.isnormalPregnant = false;
      }
      else if(pregnantType.value == '2'){
        this.isNotNormalPregnant = false;
      }
    }
    console.log('sinh thuong', this.isnormalPregnant);
    console.log('sinh mo', this.isNotNormalPregnant);
    
  }
  HandleTotalDaysVal(){
  }

  HandleInputBeginDate(value){
    if(this.dayoffObj.endDate != null && this.dayoffObj.periodType != null){
      //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
    }
  }

  HandleInputEndDate(value){
    if(this.dayoffObj.beginDate != null && this.dayoffObj.periodType != null){
      //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
    }
  }

  HandleInputPeriodType(value){
    if(this.dayoffObj.endDate != null && this.dayoffObj.beginDate != null){
      //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
    }
  }
}
