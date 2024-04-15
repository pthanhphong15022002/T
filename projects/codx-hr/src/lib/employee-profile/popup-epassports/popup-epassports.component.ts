
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { Injector, ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';

import {
  CodxFormComponent,
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
})
export class PopupEPassportsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  // formGroup: FormGroup;
  dialog: DialogRef;
  passportObj;
  lstPassports;
  indexSelected;
  headerText;
  actionType;
  idField = 'RecID';
  // isAfterRender = false;
  employId: string;
  disabledInput = false;
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
    if (this.actionType == 'view') {
      this.disabledInput = true;
    }
    this.passportObj = JSON.parse(JSON.stringify(data?.data?.passportObj));
    this.passportObj.employeeID = this.employId;
  }

  onInit(): void {
    this.initForm();
  }

  initForm() {
    if (this.actionType == 'add') {
      this.dialog.dataService.addNew().subscribe((res: any) => {
        if (res) {
          this.passportObj = res;
          this.passportObj.issuedDate = null;
          this.passportObj.expiredDate = null;
          this.cr.detectChanges();
        }
      });
    } else {
      if (
        this.actionType === 'edit' ||
        this.actionType === 'copy' ||
        this.actionType === 'view'
      ) {
        if (this.actionType == 'copy') {
          if (this.passportObj.issuedDate == '0001-01-01T00:00:00') {
            this.passportObj.issuedDate = null;
          }
          if (this.passportObj.expiredDate == '0001-01-01T00:00:00') {
            this.passportObj.expiredDate = null;
          }
        }
        this.cr.detectChanges();
      }
    }
  }

  onSaveForm() {
    //Xu li validate thong tin CMND nhan vien
    if (this.passportObj.expiredDate && this.passportObj.issuedDate) {
      if (this.passportObj.expiredDate < this.passportObj.issuedDate) {
        this.hrService.notifyInvalidFromTo(
          'ExpiredDate',
          'IssuedDate',
          this.formModel
        );
        return;
      }
    }
    // if (this.actionType === 'add' || this.actionType === 'copy') {
    //   this.hrService
    //     .addEmployeePassportInfo(this.passportObj)
    //     .subscribe((p) => {
    //       if (p != null) {
    //         this.passportObj = p;
    //         this.notify.notifyCode('SYS006');
    //         this.dialog && this.dialog.close(this.passportObj);
    //       } else this.notify.notifyCode('SYS023');
    //     });
    // } else {
    //   this.hrService
    //     .updateEmployeePassportInfo(this.form.data)
    //     .subscribe((p) => {
    //       if (p != null) {
    //         this.notify.notifyCode('SYS007');
    //         this.dialog && this.dialog.close(this.passportObj);
    //       } else this.notify.notifyCode('SYS021');
    //     });
    // }

    this.form.save(null, 0, '', '', true).subscribe((res) => {
      if (res.hasOwnProperty('save')) {
        if (res.save.hasOwnProperty('data')) {
          if (res.save.data)
            return this.dialog && this.dialog.close(res.save.data);
        }
      }
      if (res.hasOwnProperty('update')) {
        if (res.update.hasOwnProperty('data')) {
          if (res.update.data)
            return this.dialog && this.dialog.close(res.update.data);
        }
      }
      this.dialog && this.dialog.close();
    });
  }
}
