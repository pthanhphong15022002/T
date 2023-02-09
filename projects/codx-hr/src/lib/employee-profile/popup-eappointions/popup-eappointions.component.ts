import { FormGroup } from '@angular/forms';
import { CodxHrService } from '../../codx-hr.service';
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
  selector: 'lib-popup-eappointions',
  templateUrl: './popup-eappointions.component.html',
  styleUrls: ['./popup-eappointions.component.css'],
})
export class PopupEappointionsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  EAppointionObj;
  //lstEAppointions;
  //indexSelected;
  headerText;
  actionType;
  idField = 'RecID';
  funcID;
  isAfterRender = false;
  employId;
  @ViewChild('form') form: CodxFormComponent;
  //@ViewChild('listView') listView: CodxListviewComponent;

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

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    // if (!this.formModel) {
    //   this.formModel = new FormModel();
    //   this.formModel.formName = 'EAppointions';
    //   this.formModel.entityName = 'HR_EAppointions';
    //   this.formModel.gridViewName = 'grvEAppointions';
    // }

    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.EAppointionObj = data?.data?.appointionObj;
    this.employId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    //this.lstEAppointions = data?.data?.lstEAppointions;

    // this.indexSelected =
    //   data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;

    // if (this.actionType === 'edit' || this.actionType === 'copy') {
    //   this.EAppointionObj = JSON.parse(
    //     JSON.stringify(this.lstEAppointions[this.indexSelected])
    //   );
    //   // this.formModel.currentData = this.EAppointionObj
    // }
  }

  initForm() {
    // this.hrService
    //   .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    //   .then((item) => {
    //     this.formGroup = item;
    //     if(this.actionType == 'add'){
    //       this.hrService.getEmployeePassportModel().subscribe(p => {
    //         console.log('thong tin ho chieu', p);
    //         this.EAppointionObj = p;
    //         this.formModel.currentData = this.EAppointionObj
    //         // this.dialog.dataService.dataSelected = this.data
    //         console.log('du lieu formmodel',this.formModel.currentData);
    //       })
    //     }
    //     this.formGroup.patchValue(this.EAppointionObj)
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
            this.EAppointionObj = res?.data;
            this.EAppointionObj.employeeID = this.employId;
            this.formModel.currentData = this.EAppointionObj;
            this.formGroup.patchValue(this.EAppointionObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.EAppointionObj);
        this.formModel.currentData = this.EAppointionObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }

  onSaveForm() {
    // if (this.formGroup.invalid) {
    //   this.hrService.notifyInvalid(this.formGroup, this.formModel);
    //   return;
    // }

    if (this.actionType === 'copy' || this.actionType === 'add') {
      delete this.EAppointionObj.recID;
    }
    this.EAppointionObj.employeeID = this.employId;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService
        .AddEmployeeAppointionsInfo(this.EAppointionObj)
        .subscribe((p) => {
          if (p != null) {
            this.EAppointionObj.recID = p.recID;
            this.notify.notifyCode('SYS006');
            // this.lstEAppointions.push(
            //   JSON.parse(JSON.stringify(this.EAppointionObj))
            // );
            // console.log('lit e appoint', this.lstEAppointions);

            // if (this.listView) {
            //   (this.listView.dataService as CRUDService)
            //     .add(this.EAppointionObj)
            //     .subscribe();
            // }
            // this.dialog.close(p)
          } else this.notify.notifyCode('SYS023');
        });
    } else {
      this.hrService
        .UpdateEmployeeAppointionsInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            // this.lstEAppointions[this.indexSelected] = p;
            // if (this.listView) {
            //   (this.listView.dataService as CRUDService)
            //     .update(this.lstEAppointions[this.indexSelected])
            //     .subscribe();
            // }
            // this.dialog.close(this.data)
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  ngAfterViewInit(){
    this.dialog && this.dialog.closed.subscribe(res => {
      if(!res.event){
        this.dialog.close(this.EAppointionObj);
      }
    })
  }

  // click(data) {
  //   this.EAppointionObj = data;
  //   this.formModel.currentData = JSON.parse(
  //     JSON.stringify(this.EAppointionObj)
  //   );
  //   this.indexSelected = this.lstEAppointions.findIndex(
  //     (p) => p.recID == this.EAppointionObj.recID
  //   );
  //   this.actionType = 'edit';
  //   this.formGroup?.patchValue(this.EAppointionObj);
  //   this.cr.detectChanges();
  // }

  // afterRenderListView(evt) {
  //   this.listView = evt;
  //   console.log(this.listView);
  // }
}
