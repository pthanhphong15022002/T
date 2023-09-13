import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
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
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'lib-popup-emp-business-travels',
  templateUrl: './popup-emp-business-travels.component.html',
  styleUrls: ['./popup-emp-business-travels.component.css'],
})
export class PopupEmpBusinessTravelsComponent
  extends UIComponent
  implements OnInit
{
  @ViewChild('form') form: CodxFormComponent;
  successFlag = false;
  formGroup: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  headerText: string = '';
  employId;
  data;
  isNotOverseaFlag: boolean;
  disabledInput = false;

  idField = 'RecID';

  // dataValues;
  predicates = 'EmployeeID=@0';

  isAfterRender = false;

  actionType: string;
  ops = ['y'];
  date = new Date('01-04-2040');
  useForQTNS = false;
  employeeObj;
  employeeSign;
  //Employee object
  employeeId: string;
  loaded: boolean = false;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notitfy: NotificationsService,
    private hrService: CodxHrService,
    private codxShareService: CodxShareService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog.formModel;
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType;
    this.employeeId = data?.data?.employeeId;
    this.useForQTNS = data?.data?.useForQTNS;
    if (data?.data?.empObj) {
      this.employeeObj = JSON.parse(JSON.stringify(data?.data?.empObj));
    }
    if (this.actionType == 'view') {
      this.disabledInput = true;
    }
    this.funcID = data?.data?.funcID;
    this.data = JSON.parse(JSON.stringify(data?.data?.businessTravelObj));

    if (this.data) {
      if (this.data.beginDate == '0001-01-01T00:00:00') {
        this.data.beginDate = null;
      }
      if (this.data.endDate == '0001-01-01T00:00:00') {
        this.data.endDate = null;
      }
    }

    // this.cache.functionList(this.funcID).subscribe((funcList) => {
    //   if (funcList) {
    //     console.log(funcList);
    //     this.headerText = this.headerText + ' 1 ' + funcList.description;
    //     console.log('headerText sau khi goi funcID', this.headerText);

    //   }
    // });

    // this.employId = data?.data?.employeeId;

    // this.dataValues = this.employId;
  }

  changOverSeaFlag(event) {
    this.isNotOverseaFlag = event.data;
    if (event.data === true) {
      this.data.country = null;
      this.formGroup.patchValue(this.data.country);
    }
  }

  onInit(): void {
    this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((fg) => {
        if (fg) {
          this.formGroup = fg;
          this.initForm();
        }
      });

    // this.hrService.getFormModel(this.funcID).then((formModel) => {
    //   if (formModel) {
    //     this.formModel = formModel;
    //     this.hrService
    //       .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    //       .then((fg) => {
    //         if (fg) {
    //           this.formGroup = fg;
    //           this.initForm();
    //         }
    //       });
    //   }
    // });
  }

  initForm() {
    this.hrService
      .getOrgUnitID(
        this.employeeObj?.orgUnitID ?? this.employeeObj?.emp?.orgUnitID
      )
      .subscribe((res) => {
        if (res.orgUnitName) {
          this.employeeObj.orgUnitName = res?.orgUnitName;
        }
      });

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
            //this.data.isOversea = false;
            this.data.country = null;
            this.data.endDate = null;
            this.data.employeeID = this.employeeId;
            this.formModel.currentData = this.data;
            this.data.periodType = '1';
            this.formGroup.patchValue(this.data);
            this.isAfterRender = true;
            this.cr.detectChanges();
          }
        });
    } else {
      if (this.data.signerID) {
        this.getEmployeeInfoById(this.data.signerID, true);
      }

      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
      this.isAfterRender = true;
      this.cr.detectChanges();
    }
  }

  getEmployeeInfoById(empId: string, isCheck: boolean) {
    let empRequest = new DataRequest();
    empRequest.entityName = 'HR_Employees';
    empRequest.dataValues = empId;
    empRequest.predicates = 'EmployeeID=@0';
    empRequest.pageLoading = false;
    if (isCheck === false) {
      this.hrService.loadData('HR', empRequest).subscribe((emp) => {
        if (emp[1] > 0) {
          this.employeeObj = emp[0][0];

          this.hrService
            .getOrgUnitID(
              this.employeeObj?.orgUnitID ?? this.employeeObj?.emp?.orgUnitID
            )
            .subscribe((res) => {
              this.employeeObj.orgUnitName = res.orgUnitName;
            });
        }
      });
    } else {
      this.hrService.loadData('HR', empRequest).subscribe((emp) => {
        this.employeeSign = emp[0][0];
        if (emp[1] > 0) {
          let positionID = emp[0][0].positionID;

          if (positionID) {
            this.hrService.getPositionByID(positionID).subscribe((res) => {
              if (res) {
                this.employeeSign.positionName = res.positionName;
                this.data.signerPosition = res.positionName;
                this.formGroup.patchValue({
                  signerPositionID: this.data.signerPosition,
                });
                this.cr.detectChanges();
              }
            });
          } else {
            this.data.signerPosition = null;
            this.formGroup.patchValue({
              signerPositionID: this.data.signerPosition,
            });
          }
          this.loaded = true;
          this.cr.detectChanges();
        }
      });
    }
  }

  //Employee
  handleSelectEmp(evt) {
    if (!!evt.data) {
      this.employeeId = evt.data;
      this.getEmployeeInfoById(this.employeeId, false);
      // this.employeeId = null;
    } else {
      delete this.employeeObj;
    }
  }

  HandleTotalDaysVal(periodType: string) {
    let beginDate = new Date(this.data.beginDate);
    let endDate = new Date(this.data.endDate);
    let dif = endDate.getTime() - beginDate.getTime();
    if (periodType == '1') {
      this.data.days = dif / (1000 * 60 * 60 * 24) + 1;
    }
    if (
      (periodType == '2' || periodType == '3') &&
      this.data.beginDate == this.data.endDate
    ) {
      this.data.days = 0.5;
    }

    if (
      this.data.endDate > this.data.beginDate &&
      (periodType == '2' || periodType == '3')
    ) {
      this.data.endDate = this.data.beginDate;
      this.formGroup.patchValue({ endDate: this.data.beginDate });
      this.data.days = 0.5;
    }

    this.formGroup.patchValue({
      days: this.data.endDate < this.data.beginDate ? '' : this.data.days,
    });
  }

  //Change date and render days
  valueChangedDate(evt: any) {
    if (evt.field === 'beginDate') {
      this.data.beginDate = evt.data;
      this.data.endDate = evt.data;
      this.formGroup.patchValue({ endDate: evt.data });
    }
    if (evt.field === 'endDate') {
      this.data.endDate = evt.data;
    }

    if (this.data.endDate && this.data.beginDate) {
      this.HandleTotalDaysVal(this.data.periodType);
    }
  }

  valueChange(event) {
    if (!event.data) {
      this.data.signerPositionID = '';
      this.formGroup.patchValue({
        signerPositionID: '',
      });
    }
    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'signerID': {
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
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if (this.data.endDate && this.data.beginDate) {
      if (this.data.endDate < this.data.beginDate) {
        this.hrService.notifyInvalidFromTo(
          'EndDate',
          'BeginDate',
          this.formModel
        );
        return;
      }
    }

    if (this.data.isOversea == true && this.data.country == null) {
      this.notitfy.notifyCode('HR011');
      return;
    }

    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.data.contractTypeID = '1';

      this.hrService.addEBusinessTravels(this.data).subscribe((res) => {
        if (res) {
          this.data = res;
          this.notitfy.notifyCode('SYS006');
          this.successFlag = true;
          this.dialog && this.dialog.close(this.data);
        }
      });
    } else if (this.actionType == 'edit') {
      this.hrService.editEBusinessTravels(this.data).subscribe((res) => {
        if (res) {
          this.notitfy.notifyCode('SYS007');
          this.dialog && this.dialog.close(this.data);
        }
      });
    }
    this.cr.detectChanges();
  }
}
