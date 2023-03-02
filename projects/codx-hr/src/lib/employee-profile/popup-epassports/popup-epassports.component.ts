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
  selector: 'lib-popup-epassports',
  templateUrl: './popup-epassports.component.html',
  styleUrls: ['./popup-epassports.component.css'],
})
export class PopupEPassportsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  passportObj;
  lstPassports;
  indexSelected;
  headerText;
  actionType;
  idField = 'RecID';
  funcID;
  isAfterRender = false;
  employId;
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.passportObj = JSON.parse(JSON.stringify(data?.data?.passportObj));
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
  initForm() {
    if (this.actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.passportObj = res?.data;

            this.passportObj.issuedDate = null;
            this.passportObj.expiredDate = null;

            this.passportObj.employeeID = this.employId;
            this.formModel.currentData = this.passportObj;
            this.formGroup.patchValue(this.passportObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        if (this.actionType == 'copy') {
          if (this.passportObj.issuedDate == '0001-01-01T00:00:00') {
            this.passportObj.issuedDate = null;
          }
          if (this.passportObj.expiredDate == '0001-01-01T00:00:00') {
            this.passportObj.expiredDate = null;
          }
        }
        this.formGroup.patchValue(this.passportObj);
        this.formModel.currentData = this.passportObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }

  onSaveForm() {
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }
    this.passportObj.employeeID = this.employId;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService
        .addEmployeePassportInfo(this.passportObj)
        .subscribe((p) => {
          if (p != null) {
            this.passportObj = p;
            this.notify.notifyCode('SYS006');
            this.dialog && this.dialog.close(this.passportObj);
          } else this.notify.notifyCode('SYS023');
        });
    } else {
      this.hrService
        .updateEmployeePassportInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.dialog && this.dialog.close(this.passportObj);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }
}
