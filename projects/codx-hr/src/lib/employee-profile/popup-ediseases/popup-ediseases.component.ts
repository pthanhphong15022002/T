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
  selector: 'lib-popup-ediseases',
  templateUrl: './popup-ediseases.component.html',
  styleUrls: ['./popup-ediseases.component.scss'],
})
export class PopupEDiseasesComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  ediseasesObj;
  lstEdiseases;
  indexSelected
  idField = 'RecID';
  funcID;
  actionType: string;
  employeeId: string;
  isAfterRender = false;
  headerText: string;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    // if (!this.formModel) {
    //   this.formModel = new FormModel();
    //   this.formModel.entityName = 'HR_EDiseases';
    //   this.formModel.formName = 'EDiseases';
    //   this.formModel.gridViewName = 'grvEDiseases';
    // }
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.lstEdiseases = data?.data?.lstEdiseases;
    this.indexSelected = data?.data?.indexSelected != undefined?data?.data?.indexSelected:-1

    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.ediseasesObj = JSON.parse(JSON.stringify(this.lstEdiseases[this.indexSelected]));
      // this.formModel.currentData = this.ediseasesObj;
    }
  }

  onInit(): void {
    this.hrSevice.getFormModel(this.funcID).then((formModel) => {
      if (formModel) {
        this.formModel = formModel;
        this.hrSevice
          .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
          .then((fg) => {
            if (fg) {
              this.formGroup = fg;
              this.initForm();
            }
          });
      }
    });
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.ediseasesObj = res?.data;
            this.ediseasesObj.employeeID = this.employeeId;
            this.formModel.currentData = this.ediseasesObj;
            this.formGroup.patchValue(this.ediseasesObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.ediseasesObj);
        this.formModel.currentData = this.ediseasesObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }

  onSaveForm() {
    if(this.actionType === 'copy' || this.actionType === 'add'){
      delete this.ediseasesObj.recID
    }
    this.ediseasesObj.employeeID = this.employeeId 
    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.hrSevice.AddEmployeeDiseasesInfo(this.ediseasesObj).subscribe(p => {
        if(p != null){
          this.ediseasesObj.recID = p.recID
          this.notify.notifyCode('SYS007')
          this.lstEdiseases.push(JSON.parse(JSON.stringify(this.ediseasesObj)));
          if(this.listView){
            (this.listView.dataService as CRUDService).add(this.ediseasesObj).subscribe();
          }
          // this.dialog.close(p)
        }
        else this.notify.notifyCode('DM034')
      });
    } 
    else{
      this.hrSevice.UpdateEmployeeDiseasesInfo(this.formModel.currentData).subscribe(p => {
        if(p != null){
          this.notify.notifyCode('SYS007')
        this.lstEdiseases[this.indexSelected] = p;
        if(this.listView){
          (this.listView.dataService as CRUDService).update(this.lstEdiseases[this.indexSelected]).subscribe()
        }
          // this.dialog.close(this.data)
        }
        else this.notify.notifyCode('DM034')
      });
    }
  }

  afterRenderListView(event: any) {
    this.listView = event;
    console.log(this.listView);
  }

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  click(data) {
    console.log('formdata', data);
    this.ediseasesObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.ediseasesObj)) 
    this.indexSelected = this.lstEdiseases.findIndex(p => p.recID == this.ediseasesObj.recID);
    this.actionType ='edit'
    this.formGroup?.patchValue(this.ediseasesObj);
    this.cr.detectChanges();
  }
}
