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
  fieldHeaderTexts;
  formModel: FormModel;
  dialog: DialogRef;
  data;
  oldDistrictID: any;
  oldTDistrictID: any;

  oldProvinceID: any;
  oldTProvinceID: any;
  saveflag = false;
  isAfterRender = false;
  action: '';
  trainFieldStr: '';
  trainLevelStr: '';
  @ViewChild('form') form: CodxFormComponent;

  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin bản thân',
      name: 'selfInfo',
    },
    {
      icon: 'icon-info',
      text: 'Liên hệ',
      name: 'contactInfo',
    },
  ];

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
    this.action = data?.data?.action;
    debugger
    this.funcID = data?.data?.funcID;
    this.formModel = dialog.FormModel;
    this.data = JSON.parse(JSON.stringify(data?.data?.dataObj));
  }

  initForm() {
    this.formGroup.patchValue(this.data);
    this.oldDistrictID = this.data.districtID;
    this.oldTDistrictID = this.data.tDistrictID;
    this.oldProvinceID = this.data.provinceID;
    this.oldTProvinceID = this.data.tProvinceID;
    this.formModel.currentData = this.data;
    this.cr.detectChanges();
    this.isAfterRender = true;
  }

  onChangeProvince(evt){
    let newVal = evt.data
    if(newVal != this.oldProvinceID){
      this.oldProvinceID = newVal;
      this.data.districtID = null;
      this.data.wardID = null;
      this.formGroup.patchValue(this.data);
    }
  }

  onChangeTProvince(evt){
    let newVal = evt.data
    if(newVal != this.oldTProvinceID){
      this.oldTProvinceID = newVal;
      this.data.tDistrictID = null;
      this.data.tWardID = null;
      this.formGroup.patchValue(this.data);
    }
  }

  onChangeDistrict(evt){
    debugger
    let newVal = evt.data
    if(newVal != this.oldDistrictID){
      this.oldDistrictID = newVal;
      this.data.wardID = null;
      this.formGroup.patchValue(this.data);
    }
  }

  onChangeTDistrict(evt){
    debugger
    let newVal = evt.data
    if(newVal != this.oldTDistrictID){
      this.oldTDistrictID = newVal;
      this.data.tWardID = null;
      this.formGroup.patchValue(this.data);
    }
  }

  renderTrainFieldID(event){
    if(event.component?.itemsSelected){
      this.trainFieldStr = event.component.itemsSelected[0]?.TrainFieldName;
    }
  }

  renderTrainLevel(event){
    this.trainLevelStr = event.itemsSelected[0].text;
  }

  valChangeTrainLevel(event){
    debugger
    let id = event.data
    for(let i = 0; i<event.component.dataSource.length; i++){
      if(event.component.dataSource[i].value == id){
        this.trainLevelStr = event.component.dataSource[i].text
      }
    }

    let trainFieldId = this.data.trainFieldID;
    let trainLev = this.data.trainLevel;

    if (trainFieldId != null && trainLev != null) {
      this.data.degreeName = this.trainLevelStr + ' ' + this.trainFieldStr;
    } else if (trainFieldId) {
      this.data.degreeName = this.trainFieldStr;
    } else if (trainLev) {
      this.data.degreeName = this.trainLevelStr;
    }
    this.formGroup.patchValue({ degreeName: this.data.degreeName });
  }

  valChangeTrainFieldId(event){
    this.trainFieldStr = event.component.itemsSelected[0]?.TrainFieldName;

    let trainFieldId = this.data.trainFieldID;
    let trainLev = this.data.trainLevel;

    if (trainFieldId != null && trainLev != null) {
      this.data.degreeName = this.trainLevelStr + ' ' + this.trainFieldStr;
    } else if (trainFieldId) {
      this.data.degreeName = this.trainFieldStr;
    } else if (trainLev) {
      this.data.degreeName = this.trainLevelStr;
    }
    this.formGroup.patchValue({ degreeName: this.data.degreeName });
  }

  setTitle(evt: any){
    this.action += " " +  evt;
    this.cr.detectChanges();
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
            console.log('formGroup ne', this.formGroup);
                
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
            console.log('formGroup ne', this.formGroup);
          }
        });
    }
    this.hrService.getHeaderText(this.funcID).then((res) => {
      this.fieldHeaderTexts = res;
    })
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

  handleOnSaveEmployeeSelfInfo(e?: any) {
    debugger
    if(this.formGroup.invalid){
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }
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
      this.notitfy.notifyCode('HR014',0,this.fieldHeaderTexts['IssuedOn']);
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
    if(this.data.idExpiredOn && this.data.issuedOn){
      if (this.data.idExpiredOn < this.data.issuedOn) {
        this.hrService.notifyInvalidFromTo(
          'IDExpiredOn',
          'IssuedOn',
          this.formModel
          )
          return;
        }
    }
      
    this.hrService.saveEmployeeSelfInfo(this.data).subscribe((p) => {
      if (p != null) {
        this.notitfy.notifyCode('SYS007');
        this.saveflag = true;
        this.dialog && this.dialog.close(p);
      } else this.notitfy.notifyCode('SYS021');
    });
  }

}
