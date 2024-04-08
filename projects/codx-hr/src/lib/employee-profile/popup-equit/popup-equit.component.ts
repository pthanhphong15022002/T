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
import moment from 'moment';

@Component({
  selector: 'lib-popup-equit',
  templateUrl: './popup-equit.component.html',
  styleUrls: ['./popup-equit.component.css'],
})
export class PopupEquitComponent extends UIComponent {
  console = console;
  dialog: DialogRef;
  formModel: FormModel;
  headerText;
  actionType;
  data;
  disabledInput: boolean = false;
  employeeObj;
  formGroup: FormGroup;
  currentContract;
  fmContract: FormModel;
  createdOn;
  stoppedOn;

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
    this.employeeObj = data?.data?.empObj
      ? JSON.parse(JSON.stringify(data?.data?.empObj))
      : {};

    this.fmContract = data.data.fmContract;
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
      .getDataDefault(
        this.formModel.funcID.includes('WS')
          ? 'HRTPro08'
          : this.formModel.funcID,
        this.formModel.entityName,
        'RecID'
      )
      .subscribe((res: any) => {
        if (res) {
          if (this.employeeObj) {
            res.data.employeeID = this.employeeObj.employeeID;
          }
          this.data = res.data;

          this.formModel.currentData = res.data;
          this.formGroup.patchValue(res.data);

          this.getInforContract(this.employeeObj.employeeID);
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
      if (this.employeeObj) {
        this.data.employeeID = this.employeeObj.employeeID;
      }

      this.createdOn = this.data.createdOn;
      this.stoppedOn = this.data.stoppedOn;
      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);

      if (this.employeeObj?.employeeID) {
        this.getInforContract(this.employeeObj.employeeID);
      }
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

  //Calc ViolatedDays
  functionCalcViolatedDays() {
    var violatedDays = 0;

    if (this.createdOn && this.stoppedOn) {
      violatedDays =
        this.currentContract?.quitForetellDays -
        (moment(this.stoppedOn).diff(moment(this.createdOn), 'days') +
          (moment(this.stoppedOn).format('yyyy-MM-dd') ==
          moment(this.createdOn).format('yyyy-MM-dd')
            ? 0
            : 1));
      if (!isNaN(violatedDays)) {
        this.currentContract = {
          ...this.currentContract,
          violatedDays: violatedDays >= 0 ? violatedDays : 0,
        };
      }
    } else {
      this.currentContract = null;
    }
  }

  getInforContract(id) {
    this.api
      .execSv(
        'HR',
        'ERM.Business.HR',
        'EQuitBusiness_Old',
        'GetContractCurrentAsync',
        id
      )
      .subscribe((res: any) => {
        if (res) {
          this.currentContract = res;
          this.functionCalcViolatedDays();
        } else {
          this.currentContract = null;
        }
      });
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

          this.getInforContract(tmpEmployee.employeeID);

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

  valueChange(event) {
    switch (event.field) {
      case 'createdOn': {
        this.createdOn = event.data;
        this.functionCalcViolatedDays();
        break;
      }
      case 'stoppedOn': {
        this.stoppedOn = event.data;
        this.functionCalcViolatedDays();
        break;
      }
      default:
        break;
    }
  }

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
