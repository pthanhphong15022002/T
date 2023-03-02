import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { Injector, inject, ChangeDetectorRef } from '@angular/core';
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
  selector: 'lib-popup-ebasic-salaries',
  templateUrl: './popup-ebasic-salaries.component.html',
  styleUrls: ['./popup-ebasic-salaries.component.css'],
})
export class PopupEBasicSalariesComponent
  extends UIComponent
  implements OnInit
{
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  EBasicSalaryObj: any;
  // lstEBSalary
  // indexSelected
  idField = 'RecID';
  actionType: string;
  funcID: string;
  employeeId: string;
  isAfterRender = false;
  headerText: ' ';
  @ViewChild('form') form: CodxFormComponent;

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
    injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.EBasicSalaryObj = JSON.parse(JSON.stringify(data?.data?.salaryObj));
    this.formModel = dialog?.formModel;
  }

  ngAfterViewInit() {}

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
            this.EBasicSalaryObj = res?.data;

            this.EBasicSalaryObj.effectedDate = null;
            this.EBasicSalaryObj.employeeID = this.employeeId;

            this.formModel.currentData = this.EBasicSalaryObj;
            this.formGroup.patchValue(this.EBasicSalaryObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        if (this.actionType == 'copy') {
          if (this.EBasicSalaryObj.effectedDate == '0001-01-01T00:00:00') {
            this.EBasicSalaryObj.effectedDate = null;
          }
        }
        this.formGroup.patchValue(this.EBasicSalaryObj);
        this.formModel.currentData = this.EBasicSalaryObj;
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

    if (this.EBasicSalaryObj.expiredDate < this.EBasicSalaryObj.effectedDate) {
      this.hrService.notifyInvalidFromTo(
        'ExpiredDate',
        'EffectedDate',
        this.formModel
      );
      return;
    }
    this.EBasicSalaryObj.employeeID = this.employeeId;

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService
        .AddEmployeeBasicSalariesInfo(this.EBasicSalaryObj)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS006');
            console.log(p);
            debugger;
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS023');
        });
    } else {
      this.hrService
        .UpdateEmployeeBasicSalariesInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            console.log(p);
            debugger;
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }
}
