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
  selector: 'lib-popup-eassur-tax-bank',
  templateUrl: './popup-eassur-tax-bank.component.html',
  styleUrls: ['./popup-eassur-tax-bank.component.css'],
})
export class PopupEAssurTaxBankComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  fieldHeaderTexts;
  formGroup: FormGroup;
  dialog: DialogRef;
  data;
  isAfterRender = false;
  headerText: '';
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.data = JSON.parse(JSON.stringify(data?.data?.dataObj));
  }

  onInit(): void {
    if (this.formModel) {
      this.hrService
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((res) => {
          if (res) {
            this.formGroup = res;
            this.formModel.currentData = this.data;
            this.formGroup.patchValue(this.data);
            this.isAfterRender = true;
          }
        });
    }
    this.hrService.getHeaderText(this.formModel.funcID).then((res) => {
      this.fieldHeaderTexts = res;
    })
  }

  ngAfterViewInit() {}

  onSaveForm() {
    console.log('du lieu chuan bi luu', this.data);
    
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.form.formGroup, this.formModel);
      return;
    }

    //Validate input BHXH date
    if(this.data.hiCardTo && this.data.hiCardFrom){
      if (this.data.hiCardTo < this.data.hiCardFrom) {
        this.hrService.notifyInvalidFromTo(
          'HICardTo',
          'HICardFrom',
          this.formModel
          )
          return;
        }
    }

    let ddd = new Date();
    if(this.data.pitIssuedOn > ddd.toISOString()){
      this.notify.notifyCode('HR014',0, this.fieldHeaderTexts['PITIssuedOn']);
      return;
    }

    if(this.data.siRegisterOn > ddd.toISOString()){
      this.notify.notifyCode('HR014',0, this.fieldHeaderTexts['SIRegisterOn']);
      return;
    }


    this.hrService
      .saveEmployeeAssureTaxBankInfo(this.data)
      .subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS007');
          this.dialog && this.dialog.close(p);
        } else this.notify.notifyCode('SYS021');
      });
  }
}
