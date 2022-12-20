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
  selector: 'lib-popup-eskills',
  templateUrl: './popup-eskills.component.html',
  styleUrls: ['./popup-eskills.component.css']
})
export class PopupESkillsComponent extends UIComponent implements OnInit {
  formModel: FormModel
  formGroup: FormGroup
  dialog: DialogRef
  data
  skillObj;
  lstSkills
  indexSelected
  actionType
  funcID;
  employId
  isAfterRender = false
  headerText: ''
  @ViewChild('form') form: CodxFormComponent
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector)
    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'ESkills'
      this.formModel.entityName = 'HR_ESkills'
      this.formModel.gridViewName = 'grvESkills'
    }
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = this.dialog.formModel.funcID
    this.employId = data?.data?.employeeId
    this.lstSkills = data?.data?.lstSkills
    this.indexSelected = data?.data?.indexSelected != undefined?data?.data?.indexSelected:-1
    console.log('employId', this.employId);
    console.log('formmodel', this.formModel);
      if(this.actionType === 'edit' || this.actionType ==='copy'){
      this.skillObj = JSON.parse(JSON.stringify(this.lstSkills[this.indexSelected]));
      this.formModel.currentData = this.skillObj
    }
  }

  initForm(){
    this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.formGroup = item;  
        if(this.actionType == 'add'){
          this.hrService.getEmployeeSkillModel().subscribe(p => {
            this.skillObj = p;
            this.formModel.currentData = this.skillObj
            // this.dialog.dataService.dataSelected = this.data
            console.log('du lieu formmodel',this.formModel.currentData);
          })  
        }
        this.formGroup.patchValue(this.skillObj)
        this.isAfterRender = true
      }); 
  }

  onInit(): void {
    this.initForm()
  }

  onSaveForm(){
    if(this.actionType === 'copy' || this.actionType === 'add'){
      delete this.skillObj.recID
    }
    this.skillObj.employeeID = this.employId 
    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.hrService.addEmployeePassportInfo(this.skillObj).subscribe(p => {
        if(p != null){
          this.skillObj.recID = p.recID
          this.notify.notifyCode('SYS007')
          this.skillObj.push(JSON.parse(JSON.stringify(this.skillObj)));
          if(this.listView){
            (this.listView.dataService as CRUDService).add(this.skillObj).subscribe();
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
        this.skillObj[this.indexSelected] = p;
        if(this.listView){
          (this.listView.dataService as CRUDService).update(this.lstSkills[this.indexSelected]).subscribe()
        }
          // this.dialog.close(this.data)
        }
        else this.notify.notifyCode('DM034')
      });
    }
  }

  click(data) {
    console.log('formdata', data);
    this.skillObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.skillObj)) 
    this.indexSelected = this.skillObj.findIndex(p => p.recID = this.skillObj.recID);
    this.actionType ='edit'
    this.formGroup?.patchValue(this.skillObj);
    this.cr.detectChanges();
  }

  
  afterRenderListView(evt){
    this.listView = evt;
    console.log(this.listView);
  }

}
