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
  selector: 'lib-popup-edegrees',
  templateUrl: './popup-edegrees.component.html',
  styleUrls: ['./popup-edegrees.component.css']
})
export class PopupEDegreesComponent extends UIComponent implements OnInit {
  formModel : FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  degreeObj;
  indexSelected
  lstDegrees
  funcID;
  actionType;
  employId;
  isAfterRender = false;
  headerText: ''
  @ViewChild('form') form:CodxFormComponent;
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
        this.formModel.formName = 'EDegrees'
        this.formModel.entityName = 'HR_EDegrees'
        this.formModel.gridViewName = 'grvEDegrees'
      }
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = this.dialog.formModel.funcID
    this.employId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.lstDegrees = data?.data?.lstEDegrees
    this.indexSelected = data?.data?.indexSelected != undefined?data?.data?.indexSelected:-1
    
    if(this.actionType === 'edit' || this.actionType === 'copy'){
      this.degreeObj = JSON.parse(JSON.stringify(this.lstDegrees[this.indexSelected]));
      this.formModel.currentData = this.degreeObj
    }
    console.log('empId', this.employId)
    console.log('formmodel', this.formModel)
  }
  
  initForm(){
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    .then((item) => {
      this.formGroup = item;
      if(this.actionType == 'add'){
      this.hrService.getEmployeeDegreeModel().subscribe(p => {
        console.log('du lieu form', p);
        this.degreeObj = p;
        this.formModel.currentData = this.degreeObj;        
      })
    }
      this.formGroup.patchValue(this.degreeObj)
      this.isAfterRender = true;
      console.log('du lieu form grouppppp', this.formGroup);
    });

  }

  onInit(): void {
    this.initForm()
  }

  onSaveForm(){
    if(this.actionType === 'copy' || this.actionType === 'add'){
      delete this.degreeObj.recID
    }
    this.degreeObj.employeeID = this.employId 
    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.hrService.AddEmployeeDegreeInfo(this.degreeObj).subscribe(p => {
        if(p != null){
          this.degreeObj = p
          this.notify.notifyCode('SYS007')
          this.lstDegrees.push(JSON.parse(JSON.stringify(this.degreeObj)));
          if(this.listView){
            (this.listView.dataService as CRUDService).add(this.degreeObj).subscribe();
          }
          // this.dialog.close(p)
        }
        else this.notify.notifyCode('DM034')
      });
    } 
    else{
      this.hrService.updateEmployeeDegreeInfo(this.formModel.currentData).subscribe(p => {
        if(p != null){
          this.notify.notifyCode('SYS007')
        this.lstDegrees[this.indexSelected] = p;
        if(this.listView){
          (this.listView.dataService as CRUDService).update(this.lstDegrees[this.indexSelected]).subscribe()
        }
          // this.dialog.close(this.data)
        }
        else this.notify.notifyCode('DM034')
      });
    }}

    click(data) {
      console.log('formdata', data);
      this.degreeObj = data;
      this.formModel.currentData = JSON.parse(JSON.stringify(this.degreeObj)) 
      this.indexSelected = this.lstDegrees.findIndex(p => p.recID = this.degreeObj.recID);
      this.actionType ='edit'
      this.formGroup?.patchValue(this.degreeObj);
      this.cr.detectChanges();
    }
  
    
    afterRenderListView(evt){
      this.listView = evt;
      console.log(this.listView);
    }
 }

