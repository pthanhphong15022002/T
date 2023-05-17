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
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  DataRequest,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'lib-popup-employee-business',
  templateUrl: './popup-employee-business.component.html',
  styleUrls: ['./popup-employee-business.component.css'],
})
export class PopupEmployeeBusinessComponent
  extends UIComponent
  implements OnInit
{
  @ViewChild('form') form: CodxFormComponent;
  successFlag = false;
  formGroup: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  headerText: string = '';
  funcID;
  // employId;
  data;
  isNotOverseaFlag: boolean;
  employeeObj: any;

  idField = 'RecID';

  // dataValues;
  predicates = 'EmployeeID=@0';

  isAfterRender = false;
  actionType: string;
  ops = ['y'];
  date = new Date('01-04-2040');
  genderGrvSetup: any;
  //Employee object
  employeeId: string;

  //Value check validate date
  beginDate: any;
  endDate: any;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notitfy: NotificationsService,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog.formModel;
    this.funcID = data?.data?.funcID;
    this.employeeId = data?.data?.employeeId;
    this.headerText = data?.data?.headerText;
    this.employeeObj = JSON.parse(JSON.stringify(data?.data?.empObj));
    this.actionType = data?.data?.actionType;
    this.data = JSON.parse(JSON.stringify(data?.data?.dataObj));

    if (this.data) {
      if (this.data.beginDate == '0001-01-01T00:00:00') {
        this.data.beginDate = null;
      }
      if (this.data.endDate == '0001-01-01T00:00:00') {
        this.data.endDate = null;
      }
    }
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
            // this.data.isOversea = false;
            this.data.country = null;
            this.data.endDate = null;
            this.data.employeeID = this.employeeId;
            this.formModel.currentData = this.data;
            this.formGroup.patchValue(this.data);
            //Attache value checked oversea
              this.formGroup.patchValue({
                IsOversea: false,
              });
            this.isAfterRender = true;
            this.cr.detectChanges();
          }
        });
    } else {
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
          this.df.detectChanges();
        }
      });
    } else {
      this.hrService.loadData('HR', empRequest).subscribe((emp) => {
        if (emp[1] > 0) {
          let positionID = emp[0][0].positionID;

          if (positionID) {
            this.hrService.getPositionByID(positionID).subscribe((res) => {
              if (res) {
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
          this.df.detectChanges();
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

  changOverSeaFlag(event) {
    this.isNotOverseaFlag = event.data;
    if (event.data === true) {
      this.data.country = null;
      this.formGroup.patchValue(this.data.country);
    }
  }

  ngAfterViewInit() {}

  onInit(): void {
    this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((fg) => {
        if (fg) {
          this.formGroup = fg;
          this.initForm();
        }
      });

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
  //Count days
  HandleCountDay(value: number) {
    return Math.ceil(value / (1000 * 3600 * 24));
  }

  //Change date and render days
  valueChangedDate(evt: any) {
    let days = 1;
    if (evt.field === 'beginDate') {
      this.data.beginDate = evt.data.fromDate;
    }
    if (evt.field === 'endDate') {
      this.data.endDate = evt.data.fromDate;
    }
    //All day = 1 , morning = 2 , afternoon = 3
    if (
      this.data.beginDate !== undefined &&
      this.data.endDate !== undefined &&
      this.data.periodType !== null
    ) {
      days = this.data.endDate - this.data.beginDate;
      if (this.data.periodType === '1') {
        this.formGroup.patchValue({
          days: this.HandleCountDay(days) + 1,
        });
      } else {
        this.formGroup.patchValue({
          days: this.HandleCountDay(days) + 0.5,
        });
      }
    }
  }

  onSaveForm(isCloseForm: boolean) {
    // if (this.formGroup.invalid) {
    //   this.hrService.notifyInvalid(this.formGroup, this.formModel);
    //   return;
    // }
    if (this.data.IsOversea == true && this.data.country == null) {
      this.notitfy.notifyCode('HR011');
      return;
    }

    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.data.contractTypeID = '1';

      this.hrService.addEBusinessTravels(this.data).subscribe((res) => {
        if (res) {
          this.notitfy.notifyCode('SYS006');
          this.dialog && this.dialog.close(res);
        }
      });
    } else if (this.actionType == 'edit') {
      this.hrService.editEBusinessTravels(this.data).subscribe((res) => {
        if (res) {
          this.notitfy.notifyCode('SYS007');
          this.dialog && this.dialog.close(res);
        }
      });
    }
    // this.cr.detectChanges();
  }
}
