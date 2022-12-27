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
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-popup-eaccidents',
  templateUrl: './popup-eaccidents.component.html',
  styleUrls: ['./popup-eaccidents.component.css']
})
export class PopupEaccidentsComponent  extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  grvSetup
  headerText: ''
  dialog: DialogRef;
  accidentObj;
  lstAccident;
  actionType;
  data;
  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notitfy: NotificationsService,
    private hrSevice: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    if (!this.formModel) {
      this.formModel = new FormModel();
      this.formModel.entityName = 'HR_EAccidents';
      this.formModel.formName = 'EAccidents';
      this.formModel.gridViewName = 'grvEAccidents';
    }
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.formModel = dialog?.formModel;
    if(this.formModel){
      this.isAfterRender = true
    }
    this.data = dialog?.dataService?.dataSelected
   }

   initForm() {
    this.hrSevice
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        console.log('fromGroup acci', item);
        
        this.formGroup = item;  
        if(this.actionType == 'add'){
          this.hrSevice.getEmployeeAccidentModel().subscribe(p => {
            console.log('thong tin ho chieu', p);
            this.accidentObj = p;
            this.formModel.currentData = this.accidentObj
            // this.dialog.dataService.dataSelected = this.data
            console.log('du lieu formmodel',this.formModel.currentData);
          })  
        }
        this.formGroup.patchValue(this.accidentObj)
        this.isAfterRender = true
      }); 
  }

  onInit(): void {
    this.initForm();
    // this.cache
    // .gridViewSetup(
    //   this.dialog?.formModel?.formName,
    //   this.dialog?.formModel?.gridViewName
    // )
    // .subscribe((res) => {
    //   // this.grvSetup = res;
    //   // console.log('form model', this.formModel);
    // });
  }

  onSaveForm(){
    console.log('fromGroup acci', this.formGroup);

    this.hrSevice.AddEmployeeAccidentInfo(this.data).subscribe(p => {
      if(p === "True"){
        this.notitfy.notifyCode('SYS007')
        this.dialog.close()
      }
      else this.notitfy.notifyCode('DM034')
    })
  }

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

}
