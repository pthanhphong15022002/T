import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { Injector, inject, ChangeDetectorRef, Input } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DataRequest,
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
  EBasicSalaryObj: any | null;
  // lstEBSalary
  // indexSelected
  idField = 'RecID';
  actionType: string;
  funcID: string;
  employeeId: string | null;
  isAfterRender = false;
  headerText: ' ';
  @ViewChild('form') form: CodxFormComponent;

  //check where to open the form
  employeeObj: any | null;
  actionArray = ['add', 'edit', 'copy'];
  fromListView: boolean = false; //check where to open the form
  showEmpInfo: boolean = true;
  //end
  constructor(
    injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    //catch input data
    // debugger
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.EBasicSalaryObj = JSON.parse(JSON.stringify(data?.data?.salaryObj));
    this.formModel = dialog?.formModel;
    this.employeeObj = data?.data?.empObj;
    this.fromListView = data?.data?.fromListView;
  }

  allowToViewEmp(): boolean {
    //check if show emp info or not
    if (this.actionType == 'edit') {
      if (this.fromListView) return true;
      else return false;
    }
    if (this.actionType == 'copy') {
      if (this.fromListView) return true;
      else return false;
    }
    if (this.actionType == 'add') {
      if (this.fromListView) return true; // add new from list view
      else return false;
    }
    return true;
  }

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
    //get emp from beginning
    if (this.employeeId != null) this.getEmployeeInfoById(this.employeeId);
    this.showEmpInfo = this.allowToViewEmp();
  }

  //change employee
  handleSelectEmp(evt) {
    if (evt.data != null) {
      this.employeeId = evt.data;
      this.getEmployeeInfoById(this.employeeId);
    }
  }
  //
  getEmployeeInfoById(empId: string) {
    let empRequest = new DataRequest();
    empRequest.entityName = 'HR_Employees';
    empRequest.dataValues = empId;
    empRequest.predicates = 'EmployeeID=@0';
    empRequest.pageLoading = false;
    this.hrService.loadData('HR', empRequest).subscribe((emp) => {
      if (emp[1] > 0) {
        this.employeeObj = emp[0][0];
        //console.log('employee cua form', this.employeeObj);
        this.cr.detectChanges();
      }
    });
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
    // if (this.formGroup.invalid) {
    //   this.hrService.notifyInvalid(this.formGroup, this.formModel);
    //   return;
    // }

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
            p[0].emp = this.employeeObj;
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS023');
        });
    } else {
      this.hrService
        .UpdateEmployeeBasicSalariesInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            p[0].emp = this.employeeObj;
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  valueChange(event) {
    if (event?.field === 'signerID' && event?.component && event?.data != '') {
      let employee = event?.component?.itemsSelected[0];
      if (employee) {
        if (employee.PositionID) {
          this.hrService
            .getPositionByID(employee.PositionID)
            .subscribe((res) => {
              if (res) {
                this.EBasicSalaryObj.signerPosition = res.positionName;
                this.formGroup.patchValue({
                  signerPosition: this.EBasicSalaryObj.signerPosition,
                });
                this.cr.detectChanges();
              }
            });
        } else {
          this.EBasicSalaryObj.signerPosition = null;
          this.formGroup.patchValue({
            signerPosition: this.EBasicSalaryObj.signerPosition,
          });
        }
      }
      this.cr.detectChanges();
    }
  }
}
