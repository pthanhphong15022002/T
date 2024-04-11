import { Component, Injector, Optional, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import {
  AuthService,
  AuthStore,
  CacheService,
  CodxFormComponent,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import moment from 'moment';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'tr-popup-over-time',
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
  @ViewChild('form') form: CodxFormComponent;
  registerForm: '1' | '2';
  private destroy$ = new Subject<void>();

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

    //data employee login if exists
    // if (dialogData?.data[4]) {
    //   this.employeeObj = dialogData?.data[4];
    // }

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

    if (this.funcType != 'add') {
      let tmpStartTime = new Date(this.data?.fromTime);
      let tmpEndTime = new Date(this.data?.toTime);
      this.fromTime =
        ('0' + tmpStartTime.getHours()).toString().slice(-2) +
        ':' +
        ('0' + tmpStartTime.getMinutes()).toString().slice(-2);
      this.toTime =
        ('0' + tmpEndTime.getHours()).toString().slice(-2) +
        ':' +
        ('0' + tmpEndTime.getMinutes()).toString().slice(-2);
    }
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

    if (this.funcType == 'edit' || this.funcType == 'copy') {
      this.getEmployeeInfoById(this.data.employeeID);
      this.registerForm = this.data.registerForm;
      this.fromTime = this.data.fromTime;
      this.toTime = this.data.toTime;
    } else {
      this.registerForm = '1';
      if (this.optionalData?.resource) {
        var employeeID = this.optionalData.resource.employeeID;
        this.getEmployeeInfoById(employeeID);
        this.data.employeeID = employeeID;
      }
    }
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
        'EmployeesBusiness_Old',
        'GetEmployeeByUserIDAsync',
        [empId, 'getEmployee']
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.employeeObj = res;

        //Set employee data to field

        this.data.orgUnitID = this.employeeObj.orgUnitID;

        this.data.positionID = this.employeeObj.positionID;
      });
  }

  valueFromTimeChange(e) {
    if (e?.data) {
      this.fromTime = e.data.fromDate;
      this.validateFromToTime(this.fromTime, this.toTime);
    }
  }
  valueToTimeChange(e) {
    if (e?.data) {
      this.toTime = e.data.fromDate;
      this.validateFromToTime(this.fromTime, this.toTime);
    }
  }
  validateFromToTime(fromTime: any, toTime: any) {
    let tmpDay = new Date(this.data.createdOn);

    if (fromTime != null) {
      let tempFromTime = fromTime.split(':');

      this.data.fromTime = new Date(
        tmpDay.getFullYear(),
        tmpDay.getMonth(),
        tmpDay.getDate(),
        tempFromTime[0],
        tempFromTime[1],
        0
      );
    }
    if (toTime != null) {
      let tempToTime = toTime.split(':');

      this.data.toTime = new Date(
        tmpDay.getFullYear(),
        tmpDay.getMonth(),
        tmpDay.getDate(),
        tempToTime[0],
        tempToTime[1],
        0
      );
    }
    return true;
  }
  changeRegisterForm() {
    this.registerForm = this.registerForm == '1' ? '2' : '1';
  }

  // Add(data: any) {
  //   return this.api.execSv<any>(
  //     'PR',
  //     'ERM.Business.PR',
  //     'TimeKeepingRequest',
  //     'AddAsync',
  //     data
  //   );
  // }

  validateForm() {
    if (!this.data.employeeID) {
      console.log(this.grView['employeeID']);
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + 'Nhân viên' + '"'
      );
      return false;
    }

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
    if (this.data.fromDate > this.data.toDate) {
      this.hrService.notifyInvalidFromTo('FromDate', 'ToDate', this.formModel);
      return false;
    }
    if (this.registerForm == '1') {
      if (!this.data.fromTime) {
        this.notificationsService.notifyCode(
          'SYS009',
          0,
          '"' + this.grView['fromTime']['headerText'] + '"'
        );
        return false;
      }
      if (!this.data.toTime) {
        this.notificationsService.notifyCode(
          'SYS009',
          0,
          '"' + this.grView['toTime']['headerText'] + '"'
        );
        return false;
      }
    } else {
      if (!this.data.hours) {
        this.notificationsService.notifyCode(
          'SYS009',
          0,
          '"' + this.grView['hours']['headerText'] + '"'
        );
        return false;
      }
    }
    if (!this.data.reason) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.grView['reason']['headerText'] + '"'
      );
      return false;
    }
    return true;
  }

  beforeSave(option: RequestOption) {
    if (this.funcType === 'add' || this.funcType == 'copy') {
      this.data.requestType = 'OT';
      option.methodName = 'AddAsync';
      this.data.registerForm = this.registerForm;
    } else {
      option.methodName = 'EditAsync';
    }
    option.className = 'TimeKeepingRequestBusiness';
    option.assemblyName = 'PR';
    option.service = 'PR';
    option.data = this.data;
    return true;
  }

  onSaveForm() {
    // if (this.data.fromDate > this.data.toDate) {
    //   this.hrService.notifyInvalidFromTo('FromDate', 'ToDate', this.formModel);
    //   return;
    // }
    // this.form?.formGroup.patchValue(this.data);
    // if (this.form?.formGroup.invalid == true) {
    //   this.hrService.notifyInvalid(this.form?.formGroup, this.formModel);
    //   return;
    // }
    if (this.validateForm()) {
      this.dialogRef.dataService
        .save((opt: RequestOption) => this.beforeSave(opt), 0, null, null, true)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if(res?.save){
            this.dialogRef && this.dialogRef.close(res.save);
          }else{
            this.dialogRef && this.dialogRef.close(res.update);
          }
        });
    }
  }

  getHour(data) {
    if (data) {
      return moment(data).format('HH : mm');
    } else {
      return null;
    }
  }
}
