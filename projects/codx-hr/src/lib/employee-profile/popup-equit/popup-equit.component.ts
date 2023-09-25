import { Component, Injector, Optional } from '@angular/core';
import {
  CallFuncService,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-popup-equit',
  templateUrl: './popup-equit.component.html',
  styleUrls: ['./popup-equit.component.css'],
})
export class PopupEquitComponent extends UIComponent {
  dialog: DialogRef;
  formModel: FormModel;
  headerText;
  actionType;
  data;
  disabledInput: boolean = false;
  employeeObj;
  formGroup: FormGroup;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.formGroup = data.data.formGroup;
    this.actionType = data?.data?.actionType;

    this.data = JSON.parse(JSON.stringify(data?.data?.dataObj));
    console.log(this.data);
    this.employeeObj = data?.data?.empObj
      ? JSON.parse(JSON.stringify(data?.data?.empObj))
      : {};

    this.headerText = data?.data?.headerText;

    this.funcID = data?.data?.funcID;

    // this.cache
    //   .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
    //   .subscribe((res) => {
    //     if (res) {
    //       this.gridViewSetup = res;
    //     }
    //   });
  }

  initFormAdd() {
    this.hrSevice
      .getDataDefault(this.formModel.funcID, this.formModel.entityName, 'RecID')
      .subscribe((res: any) => {
        if (res) {
          if (this.employeeObj) {
            res.data.employeeID = this.employeeObj.employeeID;
          }
          this.data = res.data;
          console.log(this.data);
          this.formModel.currentData = res.data;
          this.formGroup.patchValue(res.data);
        }
      });
  }

  onInit(): void {
    if (this.actionType == 'view') {
      this.disabledInput = true;
    }
    if (this.actionType == 'add') {
      this.initFormAdd();
    }
    if (this.actionType == 'edit') {
      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
    }
  }

  //#region Get Employee
  handleSelectEmp(evt) {
    if (!!evt.data) {
      this.getEmployeeInfoById(evt.data, evt.field);
    } else {
      delete this.employeeObj;
    }
  }

  getEmployeeInfoById(empId: string, fieldName: string) {
    let empRequest = new DataRequest();
    empRequest.entityName = 'HR_Employees';
    empRequest.dataValues = empId;
    empRequest.predicates = 'EmployeeID=@0';
    empRequest.pageLoading = false;
    this.hrSevice.loadData('HR', empRequest).subscribe((res) => {
      if (res[1] > 0) {
        if (fieldName === 'employeeID') {
          var tmpEmployee = res[0][0];

          this.formGroup.patchValue({
            employeeID: tmpEmployee.employeeID,
            positionID: tmpEmployee.positionID,
            orgUnitID: tmpEmployee.orgUnitID,
            divisionID: tmpEmployee.divisionID,
            parentUnit: tmpEmployee.parentUnit,
            companyID: tmpEmployee.companyID,
            departmentID: tmpEmployee.departmentID,
          });

          this.employeeObj.employeeID = tmpEmployee.employeeID;
          this.employeeObj.employeeName = tmpEmployee.employeeName;
          this.employeeObj.phone = tmpEmployee.phone;
          this.employeeObj.email = tmpEmployee.email;

          this.hrSevice
            .getOrgUnitID(tmpEmployee?.orgUnitID)
            .subscribe((res) => {
              if (res) {
                this.employeeObj.orgUnitName = res?.orgUnitName || null;
              }
            });

          this.hrSevice
            .getPositionByID(tmpEmployee?.positionID)
            .subscribe((res) => {
              if (res) {
                this.employeeObj.positionName = res?.positionName || null;
              }
            });
        }
      }
    });
  }
  //#endregion

  onSaveForm() {
    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.hrSevice.AddEQuit(this.formGroup.value).subscribe((res: object) => {
        if (res) {
          let data = {
            ...res,
            emp: this.employeeObj,
          };
          this.dialog && this.dialog.close(data);
          this.notify.notifyCode('SYS006');
        }
      });
    } else if (this.actionType == 'edit') {
      this.hrSevice.EditEQuit(this.formGroup.value).subscribe((res: object) => {
        if (res) {
          let data = {
            ...res,
            emp: this.employeeObj,
          };
          this.dialog && this.dialog.close(data);
          this.notify.notifyCode('SYS007');
        }
      });
    }
    this.detectorRef.detectChanges();
  }
}
