import { FormGroup } from '@angular/forms';
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

@Component({
  selector: 'lib-popup-ejob-salaries',
  templateUrl: './popup-ejob-salaries.component.html',
  styleUrls: ['./popup-ejob-salaries.component.css'],
})
export class PopupEJobSalariesComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data: any;
  funcID: string;
  actionType: string;
  employeeId: string;
  isAfterRender = false;
  headerText: string;
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    if (!this.formModel) {
      this.formModel = new FormModel();
      this.formModel.formName = 'EJobSalaries';
      this.formModel.entityName = 'HR_EJobSalaries';
      this.formModel.gridViewName = 'grvEJobSalaries';
    }
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.data = JSON.parse(JSON.stringify(data?.data?.salarySelected));
      this.formModel.currentData = this.data;
    }
  }

  initForm() {
    this.hrSevice
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.formGroup = item;
        if (this.actionType == 'add') {
          this.hrSevice.GetEmployeeJobSalariesModel().subscribe((p) => {
            this.data = p;
            this.formModel.currentData = this.data;
          });
        }
        this.formGroup.patchValue(this.data);
        this.isAfterRender = true;
      });
  }

  onInit(): void {
    this.initForm();
  }

  onSaveForm() {
    if (this.data.expiredDate < this.data.effectedDate) {
      this.notify.notifyCode('HR002');
      return;
    }
    if (this.actionType == 'copy') {
      delete this.data.recID;
    }
    this.data.employeeID = this.employeeId;
    console.log('du lieu luong goi be', this.data);

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrSevice.AddEmployeeJobSalariesInfo(this.data).subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS007');
          this.dialog.close(p);
        } else this.notify.notifyCode('DM034');
      });
    } else {
      this.hrSevice.UpdateEmployeeJobSalariesInfo(this.data).subscribe((p) => {
        if (p == true) {
          this.notify.notifyCode('SYS007');
          this.dialog.close(this.data);
        } else this.notify.notifyCode('DM034');
      });
    }
  }

  click(data) {
    console.log(data);
    this.data = data;
    this.formGroup?.patchValue(this.data);
    this.cr.detectChanges();
  }
}
