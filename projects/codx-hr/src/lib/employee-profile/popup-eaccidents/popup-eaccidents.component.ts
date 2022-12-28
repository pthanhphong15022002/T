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
  selector: 'lib-popup-eaccidents',
  templateUrl: './popup-eaccidents.component.html',
  styleUrls: ['./popup-eaccidents.component.css']
})
export class PopupEaccidentsComponent  extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  grvSetup
  headerText: ''
  indexSelected
  dialog: DialogRef;
  accidentObj;
  employeeId: string;
  lstAccident;
  actionType;
  data;
  isAfterRender = false;
  @ViewChild('listView') listView: CodxListviewComponent;
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private cr: ChangeDetectorRef,
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
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.lstAccident = data?.data?.lstAccident;
    this.indexSelected = data?.data?.indexSelected != undefined?data?.data?.indexSelected:-1

    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.accidentObj = JSON.parse(JSON.stringify(this.lstAccident[this.indexSelected]));
      this.formModel.currentData = this.accidentObj;
    }
   }

   initForm() {
    this.hrSevice
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
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
  }

  onSaveForm(){
    if(this.actionType === 'copy' || this.actionType === 'add'){
      delete this.accidentObj.recID
    }
    this.accidentObj.employeeID = this.employeeId 
    console.log(this.accidentObj.employeeID);
    
    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.hrSevice.AddEmployeeAccidentInfo(this.accidentObj).subscribe(p => {
        if(p != null){
          this.accidentObj.recID = p.recID
          this.notitfy.notifyCode('SYS007')
          this.lstAccident.push(JSON.parse(JSON.stringify(this.accidentObj)));
          if(this.listView){
            (this.listView.dataService as CRUDService).add(this.accidentObj).subscribe();
          }
          // this.dialog.close(p)
        }
        else this.notitfy.notifyCode('DM034')
      });
    } 
    else{
      this.hrSevice.UpdateEmployeeAccidentInfo(this.formModel.currentData).subscribe(p => {
        if(p != null){
          this.notitfy.notifyCode('SYS007')
        this.lstAccident[this.indexSelected] = p;
        if(this.listView){
          (this.listView.dataService as CRUDService).update(this.lstAccident[this.indexSelected]).subscribe()
        }
          // this.dialog.close(this.data)
        }
        else this.notitfy.notifyCode('DM034')
      });
    }
  }

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  afterRenderListView(event: any) {
    this.listView = event;
    console.log(this.listView);
  }

  click(data) {
    console.log('formdata', data);
    this.accidentObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.accidentObj)) 
    this.indexSelected = this.lstAccident.findIndex(p => p.recID == this.accidentObj.recID);
    this.actionType ='edit'
    this.formGroup?.patchValue(this.accidentObj);
    this.cr.detectChanges();
  }

}
