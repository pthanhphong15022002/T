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
  selector: 'lib-popup-edisciplines',
  templateUrl: './popup-edisciplines.component.html',
  styleUrls: ['./popup-edisciplines.component.css']
})
export class PopupEDisciplinesComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  disciplineObj;
  lstDiscipline;
  indexSelected
  actionType
  notitfy: NotificationsService;
  funcID;
  employId;
  isAfterRender = false;
  headerText: ''

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

    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'EDisciplines'
      this.formModel.entityName = 'HR_EDisciplines'
      this.formModel.gridViewName = 'grvEDisciplines'
    }
    this.employId = data?.data?.employeeId;
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = this.dialog.formModel.funcID;
    this.actionType = data?.data?.actionType;
    this.lstDiscipline = data?.data?.lstDiscipline
    this.indexSelected = data?.data?.indexSelected != undefined?data?.data?.indexSelected:-1

    if(this.actionType === 'edit' || this.actionType ==='copy'){
      this.disciplineObj = JSON.parse(JSON.stringify(this.lstDiscipline[this.indexSelected]));
      this.formModel.currentData = this.disciplineObj
    }
  }
  
  initForm(){
    this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.formGroup = item;  
        if(this.actionType == 'add'){
          this.hrService.getEmployeeAwardModel().subscribe(p => {
            this.disciplineObj = p;
            this.formModel.currentData = this.disciplineObj
            // this.dialog.dataService.dataSelected = this.data
            console.log('du lieu formmodel',this.formModel.currentData);
          })  
        }
        this.formGroup.patchValue(this.disciplineObj)
        this.isAfterRender = true
      }); 
  }

  onInit(): void {
      this.initForm()
  }
  
  onSaveForm(){
    if(this.actionType === 'copy' || this.actionType === 'add'){
      delete this.disciplineObj.recID
    }
    this.disciplineObj.employeeID = this.employId 
    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.hrService.AddEmployeeDisciplineInfo(this.disciplineObj).subscribe(p => {
        if(p != null){
          this.disciplineObj.recID = p.recID
          this.notify.notifyCode('SYS007')
          this.lstDiscipline.push(JSON.parse(JSON.stringify(this.disciplineObj)));
          if(this.listView){
            (this.listView.dataService as CRUDService).add(this.disciplineObj).subscribe();
          }
          // this.dialog.close(p)
        }
        else this.notify.notifyCode('DM034')
      });
    } 
    else{
      this.hrService.UpdateEmployeeDisciplineInfo(this.formModel.currentData).subscribe(p => {
        if(p != null){
          this.notify.notifyCode('SYS007')
        this.lstDiscipline[this.indexSelected] = p;
        if(this.listView){
          (this.listView.dataService as CRUDService).update(this.lstDiscipline[this.indexSelected]).subscribe()
        }
          // this.dialog.close(this.data)
        }
        else this.notify.notifyCode('DM034')
      });
    }
  }

  click(data) {
    console.log('formdata', data);
    this.disciplineObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.disciplineObj)) 
    this.indexSelected = this.lstDiscipline.findIndex(p => p.recID == this.disciplineObj.recID);
    this.actionType ='edit'
    this.formGroup?.patchValue(this.disciplineObj);
    this.cr.detectChanges();
  }

  
  afterRenderListView(evt){
    this.listView = evt;
    console.log(this.listView);
  }

}
