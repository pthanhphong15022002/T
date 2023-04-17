import { CodxHrService } from './../../codx-hr.service';
import { ChangeDetectorRef, Injector } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-popup-employee-benefit',
  templateUrl: './popup-employee-benefit.component.html',
  styleUrls: ['./popup-employee-benefit.component.css']
})

export class PopupEmployeeBenefitComponent extends UIComponent implements OnInit {
  console = console;
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  idField = 'RecID';
  currentEJobSalaries: any;
  funcID: string;
  lstJobSalaries;
  actionType: string;
  employeeId: string;
  isAfterRender = false;
  headerText: string;
  employeeObj: any;

  //Render Signer Position follow Singer ID
  data: any;

  @ViewChild('form') form: CodxFormComponent;
  // @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    private df: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.funcID = data?.data?.funcID;
    this.employeeId = data?.data?.employeeId;
    this.headerText = data?.data?.headerText;
    this.employeeObj = JSON.parse(JSON.stringify(data?.data?.empObj));
    this.actionType = data?.data?.actionType;
    this.currentEJobSalaries = JSON.parse(
      JSON.stringify(data?.data?.dataObj)
    );
  }

  ngAfterViewInit() {}

  initForm() {
    this.hrSevice
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
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

  handleSelectEmp(evt){
    if(evt.data != null){
      this.employeeId = evt.data
      let empRequest = new DataRequest();
      empRequest.entityName = 'HR_Employees';
      empRequest.dataValues = this.employeeId;
      empRequest.predicates = 'EmployeeID=@0';
      empRequest.pageLoading = false;
      this.hrSevice.loadData('HR', empRequest).subscribe((emp) => {
        if (emp[1] > 0) {
          this.employeeObj = emp[0][0]
          // console.log('employee cua form', this.employeeObj);
          this.df.detectChanges();
        }
      });
    }
  }

  //Render Signer Position follow Signer ID
  
  // setExpiredDate(month) {
  //   if (this.data.effectedDate) {
  //     let date = new Date(this.data.effectedDate);
  //     this.data.expiredDate = new Date(date.setMonth(date.getMonth() + month));
  //     this.formGroup.patchValue({ expiredDate: this.data.expiredDate });
  //     this.cr.detectChanges();
  //   }
  // }

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) { 
        case 'SignerID': {
          let employee = event?.component?.itemsSelected[0];
          if (employee) {
            if (employee.PositionID) {
              this.hrSevice
                .getPositionByID(employee.PositionID)
                .subscribe((res) => {
                  if (res) {
                    this.currentEJobSalaries.signerPosition = res.positionName;
                    this.formGroup.patchValue({
                      signerPosition: this.currentEJobSalaries.signerPosition,
                    });
                    this.cr.detectChanges();
                  }
                });
            } else {
              this.currentEJobSalaries.signerPosition = null;
              this.formGroup.patchValue({
                signerPosition: this.currentEJobSalaries.signerPosition,
              });
            }
          }
          break;
        }
      }

      this.cr.detectChanges();
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
        .AddEBenefit(this.currentEJobSalaries)
        .subscribe((p) => {
          console.log(p)
          if (p != null) { 
            this.notify.notifyCode('SYS006'); 
            this.dialog && this.dialog.close(p);
            p[0].emp = this.employeeObj;
          } else {
            this.notify.notifyCode('SYS023');
          }
        });
    } else {
      this.hrSevice
        .EditEBenefit(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007'); 
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }
}




