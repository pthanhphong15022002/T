import { FormGroup } from '@angular/forms';
import { ChangeDetectorRef, Injector, SimpleChanges } from '@angular/core';
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
import { CodxHrService } from 'projects/codx-hr/src/public-api';

@Component({
  selector: 'lib-popup-employee-jobsalary',
  templateUrl: './popup-employee-jobsalary.component.html',
  styleUrls: ['./popup-employee-jobsalary.component.css'],
})
export class PopupEmployeeJobsalaryComponent
  extends UIComponent
  implements OnInit
{
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
  employeeObj: any;
  genderGrvSetup: any;

  //Employee object
  employeeID: string;
  employeeName: string;
  OrgUnitID: string;
  // PositionID: string;

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
    this.currentEJobSalaries = JSON.parse(JSON.stringify(data?.data?.dataObj));
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
                  if (
                    this.currentEJobSalaries.effectedDate ==
                    '0001-01-01T00:00:00'
                  ) {
                    this.currentEJobSalaries.effectedDate = null;
                  }
                  this.currentEJobSalaries.employeeID = this.employeeId;
                  this.currentEJobSalaries.effectedDate = null;
                  this.currentEJobSalaries.expiredDate = null;
                  this.formModel.currentData = this.currentEJobSalaries;
                  this.formGroup.patchValue(this.currentEJobSalaries);
                  this.isAfterRender = true;
                  this.cr.detectChanges();
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
              this.isAfterRender = true;
              this.cr.detectChanges();
            }
          }
        }
      });
  }

  getEmployeeInfoById(empId: string, isCheck: boolean) {
    let empRequest = new DataRequest();
    empRequest.entityName = 'HR_Employees';
    empRequest.dataValues = empId;
    empRequest.predicates = 'EmployeeID=@0';
    empRequest.pageLoading = false;
    if (isCheck === false) {
      this.hrSevice.loadData('HR', empRequest).subscribe((emp) => {
        if (emp[1] > 0) {
          this.employeeObj = emp[0][0];
          this.df.detectChanges();
        }
      });
    } else {
      this.hrSevice.loadData('HR', empRequest).subscribe((emp) => {
        if (emp[1] > 0) {
          let positionID = emp[0][0].positionID;

          if (positionID) {
            this.hrSevice.getPositionByID(positionID).subscribe((res) => {
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
          this.df.detectChanges();
        }
      });
    }
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

    //Load data field gender from database
    this.cache
      .gridViewSetup('EmployeeInfomation', 'grvEmployeeInfomation')
      .subscribe((res) => {
        this.genderGrvSetup = res?.Gender;
      });

    //Update Employee Information when CRUD then render
    if (this.employeeId != null)
      this.getEmployeeInfoById(this.employeeId, false);
  }

  ngOnChanges(changes: SimpleChanges) {}

  handleSelectEmp(evt) {
    if (!!evt.data) {
      this.employeeId = evt.data;
      this.getEmployeeInfoById(this.employeeId, false);
      // this.employeeId = null;
    } else {
      delete this.employeeObj;
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
    if (!event.data) {
      this.currentEJobSalaries.signerPosition = '';
      this.formGroup.patchValue({
        signerPosition: '',
      });
    }

    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        // case 'contractTypeID': {
        //   this.data.limitMonths =
        //     event?.component?.itemsSelected[0]?.LimitMonths;
        //   this.formGroup.patchValue({ limitMonths: this.data.limitMonths });
        //   this.setExpiredDate(this.data.limitMonths);
        //   break;
        // }
        // case 'effectedDate': {
        //   this.data.effectedDate = event.data;
        //   this.formGroup.patchValue({ effectedDate: this.data.effectedDate });
        //   this.setExpiredDate(this.data.limitMonths);
        //   break;
        // }
        case 'signerID': {
          // if (event.data.dataSelected.length === 0) {
          //   this.currentEJobSalaries.signerPosition = '';
          //   this.formGroup.patchValue({
          //     signerPosition: '',
          //   });
          // }
          // let employee = event.data?.dataSelected[0]?.dataSelected;

          let employee = event.data;

          if (employee) {
            this.getEmployeeInfoById(employee, true);
          }
          break;
        }
      }

      this.cr.detectChanges();
    }
  }

  onSaveForm() {
    //Validate use function from service
    if (this.formGroup.invalid == true) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

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
            this.dialog && this.dialog.close(p);
            // p[0].emp = this.employeeObj;
          } else this.notify.notifyCode('SYS023');
        });
    } else {
      this.hrSevice
        .UpdateEmployeeJobSalariesInfo(this.currentEJobSalaries)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }
}
