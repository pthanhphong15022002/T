import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { Injector, ChangeDetectorRef } from '@angular/core';
import { CalendarView } from '@syncfusion/ej2-calendars';
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
  selector: 'lib-popup-eexperiences',
  templateUrl: './popup-eexperiences.component.html',
  styleUrls: ['./popup-eexperiences.component.css'],
})
export class PopupEexperiencesComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  // formGroup: FormGroup;
  dialog: DialogRef;
  data: any;
  successFlag = false;
  start: CalendarView = 'Year';
  depth: CalendarView = 'Year';
  format: string = 'MM/yyyy';
  fromdateVal: any;
  todateVal: any;
  idField = 'RecID';
  changedInForm = false;
  employId: string;
  actionType: string;
  disabledInput = false;
  headerText: string;
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.employId = data?.data?.employeeId;
    this.formModel = dialog?.formModel;
    this.actionType = data?.data?.actionType;
    if (this.actionType == 'view') {
      this.disabledInput = true;
    }
    this.data = JSON.parse(JSON.stringify(data?.data?.eExperienceObj));
    if (this.data) {
      this.fromdateVal = this.data.fromDate;
      this.todateVal = this.data.toDate;
    }
    this.funcID = data?.data?.funcID;
  }

  ClickCalendar(event) {
    this.changedInForm = true;
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
            this.data = res?.data;
            this.data.beginDate = null;
            this.data.endDate = null;
            this.data.employeeID = this.employId;
            this.cr.detectChanges();
          }
        });
    } else {
      this.cr.detectChanges();
    }
  }

  onInit(): void {
    this.initForm();
  }

  onSaveForm() {
    if (this.data.companyName) {
      if (this.data.companyName.trim().length == 0) {
        this.data.companyName = null;
        this.form.formGroup.patchValue(this.data);
      }
    }
    this.data.fromDate = this.fromdateVal;
    this.data.toDate = this.todateVal;

    this.form.formGroup.patchValue({ fromDate: this.data.fromDate });
    this.form.formGroup.patchValue({ toDate: this.data.toDate });
    if (this.form.formGroup.invalid) {
      this.hrService.notifyInvalid(this.form.formGroup, this.formModel);
      this.form.validation(false);
      return;
    }

    this.data.employeeID = this.employId;
    console.log('employeeId', this.data.employeeID);

    //Xu li validate thong tin from-to
    if (this.data.toDate && this.data.fromDate) {
      if (this.data.toDate < this.data.fromDate) {
        this.hrService.notifyInvalidFromTo(
          'ToDate',
          'FromDate',
          this.formModel
        );
        return;
      }
    }

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.AddEmployeeExperienceInfo(this.data).subscribe((p) => {
        if (p != null) {
          this.data.recID = p.recID;
          this.notify.notifyCode('SYS006');
          this.successFlag = true;
          this.dialog && this.dialog.close(this.data);
        } else this.notify.notifyCode('SYS023');
      });
    } else {
      this.hrService
        .UpdateEmployeeExperienceInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.successFlag = true;
            this.dialog && this.dialog.close(this.data);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  UpdateFromDate(e) {
    if (
      new Date(this.fromdateVal).toJSON() != new Date(e).toJSON() &&
      this.fromdateVal
    ) {
      this.changedInForm = true;
    }
    this.fromdateVal = e;
  }

  UpdateToDate(e) {
    if (
      new Date(this.todateVal).toJSON() != new Date(e).toJSON() &&
      this.todateVal
    ) {
      this.changedInForm = true;
    }
    this.todateVal = e;
  }
}
