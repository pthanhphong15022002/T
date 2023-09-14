import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { ChangeDetectorRef, Injector } from '@angular/core';
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
  selector: 'lib-popup-ejob-salaries',
  templateUrl: './popup-ejob-salaries.component.html',
  styleUrls: ['./popup-ejob-salaries.component.css'],
})
export class PopupEJobSalariesComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  idField = 'RecID';
  currentEJobSalaries: any;
  lstJobSalaries;
  actionType: string;
  employeeId: string;
  isAfterRender = false;
  headerText: string;
  @ViewChild('form') form: CodxFormComponent;
  // @ViewChild('listView') listView: CodxListviewComponent;

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
    this.formModel = dialog?.formModel;
    this.funcID = data?.data?.funcID;
    this.headerText = data?.data?.headerText;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.currentEJobSalaries = JSON.parse(
      JSON.stringify(data?.data?.jobSalaryObj)
    );
  }

  ngAfterViewInit() {}

  initForm() {
    this.hrSevice
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
      .then((item) => {
        if (item) {
          this.formGroup = item;
          if (this.actionType == 'add') {
            this.hrSevice
              .getDataDefault(
                this.formModel.funcID,
                this.formModel.entityName,
                this.idField
              )
              .subscribe((res: any) => {
                if (res) {
                  this.currentEJobSalaries = res?.data;
                  if (this.currentEJobSalaries.effectedDate == '0001-01-01T00:00:00') {
                    this.currentEJobSalaries.effectedDate = null;
                  }
                  this.currentEJobSalaries.employeeID = this.employeeId;
                  this.currentEJobSalaries.effectedDate = null;
                  this.currentEJobSalaries.expiredDate = null;
                  this.formModel.currentData = this.currentEJobSalaries;
                  this.formGroup.patchValue(this.currentEJobSalaries);
                  this.cr.detectChanges();
                  this.isAfterRender = true;
                }
              });
          } else {
            if (this.actionType === 'edit' || this.actionType === 'copy') {
              if (this.actionType === 'copy') {
                if (
                  this.currentEJobSalaries.effectedDate == '0001-01-01T00:00:00'
                ) {
                  this.currentEJobSalaries.effectedDate = null;
                }
              }
              this.formGroup.patchValue(this.currentEJobSalaries);
              this.formModel.currentData = this.currentEJobSalaries;
              this.cr.detectChanges();
              this.isAfterRender = true;
            }
          }
        }
      });
  }

  onInit(): void {
    if (!this.formModel) {
      this.hrSevice.getFormModel(this.funcID).then((formModel) => {
        if (formModel) {
          this.formModel = formModel;
          this.initForm();
        }
      });
    } else {
      this.initForm();
    }
  }

  onSaveForm() {
    if (
      this.currentEJobSalaries.expiredDate <
      this.currentEJobSalaries.effectedDate
    ) {
      this.hrSevice.notifyInvalidFromTo(
        'ExpiredDate',
        'EffectedDate',
        this.formModel
      );
      return;
    }

    this.currentEJobSalaries.employeeID = this.employeeId;

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrSevice
        .AddEmployeeJobSalariesInfo(this.currentEJobSalaries)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS006');
            // if (this.currentEJobSalaries) {
            //   if (this.currentEJobSalaries.effectedDate < p.effectedDate) {
            //     this.currentEJobSalaries.isCurrent = 'false';
            //     (this.listView.dataService as CRUDService)
            //       .update(this.currentEJobSalaries)
            //       .subscribe();
            //     this.currentEJobSalaries = p;
            //   }
            // } else {
            //   this.currentEJobSalaries = p;
            // }

            // if (this.listView) {
            //   (this.listView.dataService as CRUDService).add(p).subscribe();
            // }
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS023');
        });
    } else {
      this.hrSevice
        .UpdateEmployeeJobSalariesInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            // if (p.isCurrent == true) {
            //   var tempCurrent = this.listView.dataService.data.find(
            //     (p) => p.isCurrent == true
            //   );
            //   console.log('temp current', tempCurrent);
            //   if (tempCurrent.recID != p.recID) {
            //     tempCurrent.isCurrent = false;
            //     (this.listView.dataService as CRUDService)
            //       .update(tempCurrent)
            //       .subscribe();
            //   }
            // }
            // if (this.listView) {
            //   (this.listView.dataService as CRUDService).update(p).subscribe();
            // }
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  // click(data) {
  //   console.log(data);
  //   this.currentEJobSalaries = data;
  //   this.formModel.currentData = JSON.parse(
  //     JSON.stringify(this.currentEJobSalaries)
  //   );
  //   this.actionType = 'edit';
  //   this.formGroup?.patchValue(this.currentEJobSalaries);
  //   this.cr.detectChanges();
  // }

  // afterRenderListView(evt) {
  //   this.listView = evt;
  //   console.log('lst view data', this.listView);
  // }
}
