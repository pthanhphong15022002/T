import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { CodxHrService } from './../../codx-hr.service';
import { ChangeDetectorRef, Injector } from '@angular/core';
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
  selector: 'lib-popup-eself-info',
  templateUrl: './popup-eself-info.component.html',
  styleUrls: ['./popup-eself-info.component.css'],
})
export class PopupESelfInfoComponent extends UIComponent implements OnInit {
  funcID;
  idField = 'RecID';
  formGroup: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  data;
  saveflag = false;
  isAfterRender = false;
  headerText: '';
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notitfy: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.formModel = dialog.FormModel;
    this.data = JSON.parse(JSON.stringify(data?.data?.dataObj));
  }

  initForm() {
    debugger
    this.formGroup.patchValue(this.data);
    this.formModel.currentData = this.data;
    this.cr.detectChanges();
    this.isAfterRender = true;
  }

  onInit(): void {
    if (!this.formModel) {
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
    } else {
      this.hrService
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
    }
  }

  ngAfterViewInit() {
    this.dialog.closed.subscribe((res) => {
      if (!res.event) {
        if(this.saveflag){
          this.dialog && this.dialog.close(this.data);
        }
      }
    });
  }

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  HandleValueChangeIDCard(e){
    if(e.data.length > 12){
      e.data = e.data.substring(0, 12);
    }
    this.data.idCardNo = e.data;
    this.formGroup.patchValue({ idCardNo: this.data.idCardNo });
    this.cr.detectChanges();
  }

  updateDegreeName() {
    let trainFieldId = this.data.trainFieldID;
    let trainLev = this.data.trainLevel;
    if (trainFieldId != null && trainLev != null) {
      this.data.degreeName = trainLev + ' ' + trainFieldId;
    } else if (trainFieldId) {
      this.data.degreeName = trainFieldId;
    } else if (trainLev) {
      this.data.degreeName = trainLev;
    }
    this.formGroup.patchValue({ degreeName: this.data.degreeName });
  }

  handleOnSaveEmployeeContactInfo() {
    this.hrService.saveEmployeeContactInfo(this.data).subscribe((p) => {
      if (p != null) {
        this.notitfy.notifyCode('SYS006');
        this.dialog.close();
      } else this.notitfy.notifyCode('SYS021');
    });
  }

  handleOnSaveEmployeeSelfInfo(e?: any) {
    // if(this.formGroup.invalid){
    //   this.hrService.notifyInvalid(this.formGroup, this.formModel);
    //   return;
    // }
    //Xu li validate thong tin ngay sinh nhan vien
    if (
      new Date().getFullYear() - new Date(this.data.birthday).getFullYear() <
      18
    ) {
      this.notitfy.notifyCode('HR001');
      return;
    }

    if(this.data.email && !this.hrService.checkEmail(this.data.email)){
      this.notitfy.notifyCode('SYS037');
      return;
    }

    let ddd = new Date();
    if(this.data.issuedOn > ddd.toISOString()){
      this.notitfy.notifyCode('HR014');
      return;
    }

    if(this.data.personalEmail && !this.hrService.checkEmail(this.data.personalEmail)){
      this.notitfy.notifyCode('SYS037');
      return;
    }
    const date = new Date()
    //Ngay cap CMND ko dc lon hon ngay hien hanh
    if (date.toJSON() < this.data.issuedOn) {
      this.notitfy.notifyCode('HR012');
      return 
      }


    //Xu li validate thong tin CMND nhan vien
    if (this.data.idExpiredOn < this.data.issuedOn) {
      this.hrService.notifyInvalidFromTo(
        'ExpiredDate',
        'IssuedOn',
        this.formModel
        )
        return;
      }
      
    this.hrService.saveEmployeeSelfInfo(this.data).subscribe((p) => {
      if (p != null) {
        this.notitfy.notifyCode('SYS007');
        this.saveflag = true;
        this.dialog && this.dialog.close(p);
      } else this.notitfy.notifyCode('SYS021');
    });
  }

  handleProvinceChange(value) {}
}
