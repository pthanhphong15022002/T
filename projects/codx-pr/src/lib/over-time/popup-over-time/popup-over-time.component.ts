import { Component, Injector, Optional, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  AuthService,
  AuthStore,
  CacheService,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-popup-over-time',
  templateUrl: './popup-over-time.component.html',
  styleUrls: ['./popup-over-time.component.css'],
})
export class PopupOverTimeComponent extends UIComponent {
  console = console;
  data: any;
  funcType: any;
  tmpTitle: any;
  optionalData: any;
  viewOnly = false;
  dialogRef: DialogRef;
  formModel: FormModel;
  // title: string;
  grView: any;
  fromTime: string;
  toTime: string;
  formGroup: FormGroup;
  employeeObj;
  @ViewChild('form') form: any;

  constructor(
    injector: Injector,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private hrService: CodxHrService,
    private authService: AuthService,
    private cacheService: CacheService,
    private authStore: AuthStore,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = { ...dialogData?.data[0] };
    this.funcType = dialogData?.data[1];
    this.tmpTitle = dialogData?.data[2];
    this.optionalData = dialogData?.data[3];

    console.log(this.data);

    //data employee login if exists
    if (dialogData?.data[4]) {
      this.employeeObj = dialogData?.data[4];
    }

    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;
    this.funcID = this.formModel?.funcID;

    if (
      this.funcType === 'add' &&
      this.data.fromDate == '0001-01-01T00:00:00' &&
      this.data.fromDate == '0001-01-01T00:00:00'
    ) {
      this.data.fromDate = null;
      this.data.toDate = null;
    }

    // if (this.funcType != 'add') {
    //   let tmpStartTime = new Date(this.data?.fromTime);
    //   let tmpEndTime = new Date(this.data?.toTime);
    //   this.fromTime =
    //     ('0' + tmpStartTime.getHours()).toString().slice(-2) +
    //     ':' +
    //     ('0' + tmpStartTime.getMinutes()).toString().slice(-2);
    //   this.toTime =
    //     ('0' + tmpEndTime.getHours()).toString().slice(-2) +
    //     ':' +
    //     ('0' + tmpEndTime.getMinutes()).toString().slice(-2);
    // }
  }

  getGrvSetup() {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
        }
      });
  }

  onInit(): void {
    this.getGrvSetup();

    this.hrService
      .getFormGroup(
        this.formModel.formName,
        this.formModel.gridViewName,
        this.formModel
      )
      .then((fg) => {
        if (fg) {
          this.formGroup = fg;
          this.formGroup.patchValue(this.data);
        }
      });
  }

  valueChange(e) {
    if (e?.field) {
      if (e.data instanceof Object) {
        this.data[e.field] = e.data.value;
      } else {
        this.data[e.field] = e.data;
      }
    }
  }

  handleSelectEmp(evt) {
    if (evt.data) {
      this.getEmployeeInfoById(evt.data);
    } else {
      delete this.employeeObj;
    }
  }

  getEmployeeInfoById(empId: string) {
    this.api
      .execSv<any>(
        'HR',
        'HR',
        'EmployeesBusiness',
        'GetEmployeeByUserIDAsync',
        [empId, 'getEmployee']
      )
      .subscribe((res) => {
        this.employeeObj = res;

        //Set employee data to field

        this.data.orgUnitID = this.employeeObj.orgUnitID;

        this.data.positionID = this.employeeObj.positionID;
      });
  }

  valueToTimeChange(e) {
    if (e.data.toDate) {
      this.data[e.field] = e.data.toDate;
    }
  }

  Add(data: any) {
    return this.api.execSv<any>(
      'PR',
      'ERM.Business.PR',
      'TimeKeepingRequest',
      'AddAsync',
      data
    );
  }

  validateForm() {
    if (!this.data.fromDate) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.grView['fromDate']['headerText'] + '"'
      );
      return false;
    }
    if (!this.data.toDate) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.grView['toDate']['headerText'] + '"'
      );
      return false;
    }
    if (!this.data.employeeID) {
      console.log(this.grView['employeeID']);
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + 'Nhân viên' + '"'
      );
      return false;
    } else return true;
  }

  beforeSave(option: RequestOption) {
    option.methodName = 'AddAsync';
    option.className = 'TimeKeepingRequest';
    option.assemblyName = 'PR';
    option.service = 'PR';
    option.data = this.data;
    return true;
  }

  onSaveForm() {
    if (this.validateForm() === true) {
      if (this.funcType === 'add') {
        this.data.requestType = 'OT';
        console.log(this.data);
        this.dialogRef.dataService
          .save(
            (opt: RequestOption) => this.beforeSave(opt),
            0,
            null,
            null,
            true
          )
          .subscribe(async (res) => {
            console.log(res);
            this.dialogRef && this.dialogRef.close(res.save);
          });
      }
    }
  }
}
