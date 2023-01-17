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
  selector: 'lib-popup-ecertificates',
  templateUrl: './popup-ecertificates.component.html',
  styleUrls: ['./popup-ecertificates.component.css']
})
export class PopupECertificatesComponent extends UIComponent implements OnInit {
  formModel : FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  certificateObj;
  lstCertificates;
  indexSelected;
  actionType
  funcID;
  idField = 'RecID';
  employId;
  isAfterRender = false;
  headerText: ''
  @ViewChild('form') form:CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;


  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    private cr: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID
    this.employId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType
    this.lstCertificates = data?.data?.lstCertificates
    this.indexSelected = data?.data?.indexSelected != undefined?data?.data?.indexSelected:-1
    
    if(this.actionType === 'edit' || this.actionType ==='copy'){
      this.certificateObj = JSON.parse(JSON.stringify(this.lstCertificates[this.indexSelected]));
      // this.formModel.currentData = this.certificateObj
    }
    // console.log('employid', this.employId)
    // console.log('formmdel', this.formModel);
    }

    initForm() {
    // this.hrService
    //   .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    //   .then((item) => {
    //     this.formGroup = item;  
    //     if(this.actionType == 'add'){
    //       this.hrService.getECertificateModel().subscribe(p => {
    //         this.certificateObj = p;
    //         this.formModel.currentData = this.certificateObj
    //         // this.dialog.dataService.dataSelected = this.data
    //         console.log('du lieu formmodel', this.formModel.currentData);
    //       })  
    //     }
    //     this.formGroup.patchValue(this.certificateObj)
    //     this.isAfterRender = true
    //   }); 

    if (this.actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.certificateObj = res?.data;
            this.certificateObj.employeeID = this.employId;
            this.formModel.currentData = this.certificateObj;
            this.formGroup.patchValue(this.certificateObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.certificateObj);
        this.formModel.currentData = this.certificateObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }

  onInit(): void {
    this.hrService.getFormModel(this.funcID).then((formModel) => {
      if (formModel) {
        this.formModel = formModel;
        this.hrService
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

  onSaveForm(){
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }
    
    if(this.actionType === 'copy' || this.actionType === 'add'){
      delete this.certificateObj.recID
    }
    this.certificateObj.employeeID = this.employId 
    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.hrService.AddECertificateInfo(this.certificateObj).subscribe(p => {
        if(p != null){
          this.certificateObj.recID = p.recID
          this.notify.notifyCode('SYS007')
          this.lstCertificates.push(JSON.parse(JSON.stringify(this.certificateObj)));
          if(this.listView){
            (this.listView.dataService as CRUDService).add(this.certificateObj).subscribe();
          }
          // this.dialog.close(p)
        }
        else this.notify.notifyCode('DM034')
      });
    } 
    else{
      this.hrService.UpdateEmployeeCertificateInfo(this.formModel.currentData).subscribe(p => {
        if(p != null){
          this.notify.notifyCode('SYS007')
        this.lstCertificates[this.indexSelected] = p;
        if(this.listView){
          (this.listView.dataService as CRUDService).update(this.lstCertificates[this.indexSelected]).subscribe()
        }
          // this.dialog.close(this.data)
        }
        else this.notify.notifyCode('DM034')
      });
    }
  }

  click(data) {
    console.log('formdata', data);
    this.certificateObj = data;
    console.log('certi obj', this.certificateObj);
    console.log('lit cert', this.lstCertificates);
    
    this.formModel.currentData = JSON.parse(JSON.stringify(this.certificateObj)) 
    this.indexSelected = this.lstCertificates.findIndex(p => p.recID == this.certificateObj.recID);
    console.log('index after click', this.indexSelected);
    this.actionType ='edit'
    this.formGroup?.patchValue(this.certificateObj);
    this.cr.detectChanges();
  }

  afterRenderListView(evt){
    this.listView = evt;
    console.log(this.listView);
  }

  valueChange(event, cbxComponent: any = null){
    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'certificateType':{
          (cbxComponent.ComponentCurrent.dataService as CRUDService).setPredicate('CertificateType==@0', [event.data]).subscribe();
          console.log(cbxComponent);
          break;
        }
      }
    }
  }
}
