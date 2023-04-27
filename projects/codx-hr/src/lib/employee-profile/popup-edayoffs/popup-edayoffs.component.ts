import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { Injector, ChangeDetectorRef } from '@angular/core';
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
import { CalendarView } from '@syncfusion/ej2-angular-calendars';

@Component({
  selector: 'lib-popup-edayoffs',
  templateUrl: './popup-edayoffs.component.html',
  styleUrls: ['./popup-edayoffs.component.css'],
})
export class PopupEdayoffsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  lstPregnantType;
  dayoffObj: any;
  //lstDayoffs: any;
  idField = 'RecID';
  successFlag = false;
  funcID: string;
  //indexSelected
  isnormalPregnant = false;
  isNotNormalPregnant = false;
  actionType: string;
  employId: string;
  isAfterRender = false;
  headerText: string;
  start: CalendarView = 'Year';
  depth: CalendarView = 'Year';
  format: string = 'MM/yyyy';
  pregnancyFromVal;
  @ViewChild('form') form: CodxFormComponent;
  empObj: any;
  genderGrvSetup: any;
  allowToViewEmSelector: boolean = false;
  //@ViewChild('listView') listView: CodxListviewComponent;

  fromListView: boolean = false;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    // if (!this.formModel) {
    //   this.formModel = new FormModel();
    //   this.formModel.formName = 'EDayOffs';
    //   this.formModel.entityName = 'HR_EDayOffs';
    //   this.formModel.gridViewName = 'grvEDayOffs';
    // }
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.dayoffObj = JSON.parse(JSON.stringify(data?.data?.dayoffObj));
    this.fromListView = data?.data?.fromListView;
    if (this.dayoffObj?.employeeID && this.fromListView) {
      this.employId = this.dayoffObj?.employeeID;
    } else this.employId = data?.data?.employeeID;
    if (this.dayoffObj?.emp && this.fromListView) {
      this.empObj = this.dayoffObj?.emp;
    } else this.empObj = data?.data?.empObj;

    if (this.dayoffObj) {
      this.pregnancyFromVal = this.dayoffObj.pregnancyFrom;
      if (this.dayoffObj.beginDate == '0001-01-01T00:00:00') {
        this.dayoffObj.beginDate = null;
      }
      if (this.dayoffObj.endDate == '0001-01-01T00:00:00') {
        this.dayoffObj.endDate = null;
      }
    }
    this.formModel = dialog.formModel;
    //this.lstDayoffs = data?.data?.lstDayOffs

    this.actionType = data?.data?.actionType;
    // if (this.actionType === 'edit' || this.actionType === 'copy') {
    //   this.dayoffObj = JSON.parse(
    //     JSON.stringify(this.lstDayoffs[this.indexSelected])
    //   );
    // }
  }

  onInit(): void {
    this.hrSevice
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((fg) => {
        if (fg) {
          this.formGroup = fg;
          this.initForm();
        }
      });

    this.cache
      .gridViewSetup('EmployeeInfomation', 'grvEmployeeInfomation')
      .subscribe((res) => {
        this.genderGrvSetup = res?.Gender;
      });
    if (this.employId)
      this.getEmployeeInfoById(this.employId, 'employeeID');

    // this.hrSevice.getFormModel(this.funcID).then((formModel) => {
    //   if (formModel) {
    //     this.formModel = formModel;
    //     this.hrSevice
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

  ngAfterViewInit() {
    this.dialog &&
      this.dialog.closed.subscribe((res) => {
        if (!res.event) {
          if (this.successFlag == true) {
            this.dialog.close(this.dayoffObj);
          } else {
            this.dialog.close(null);
          }
        }
      });
  }

  initForm() {
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((p) => {
        this.cache
          .valueList(p.NewChildBirthType.referedValue)
          .subscribe((p) => {
            this.lstPregnantType = p.datas;
            if (this.dayoffObj) {
              if (
                this.dayoffObj.newChildBirthType ==
                this.lstPregnantType[0].value
              ) {
                this.isnormalPregnant = true;
              } else if (
                this.dayoffObj.newChildBirthType ==
                this.lstPregnantType[1].value
              ) {
                this.isNotNormalPregnant = true;
              }
            }
          });
      });

    if (this.actionType == 'add') {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.dayoffObj = res?.data;
            this.dayoffObj.beginDate = null; //yêu cầu require, không default
            this.dayoffObj.endDate = null;
            this.dayoffObj.employeeID = this.employId;
            this.dayoffObj.periodType = '1';
            this.dayoffObj.totalSubDays = 0;
            this.formModel.currentData = this.dayoffObj;
            this.formGroup.patchValue(this.dayoffObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.dayoffObj);
        this.formModel.currentData = this.dayoffObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }

  UpdateFromDate(e) {
    this.pregnancyFromVal = e;
  }

  onSaveForm() {
    if (this.isnormalPregnant == true && this.isNotNormalPregnant == false) {
      this.dayoffObj.newChildBirthType = this.lstPregnantType[0].value;
    } else if (
      this.isNotNormalPregnant == true &&
      this.isnormalPregnant == false
    ) {
      this.dayoffObj.newChildBirthType = this.lstPregnantType[1].value;
    }
    this.dayoffObj.pregnancyFrom = this.pregnancyFromVal;
    if (this.actionType === 'copy' || this.actionType === 'add') {
      delete this.dayoffObj.recID;
    }
    this.dayoffObj.employeeID = this.employId;
    this.dayoffObj.totalSubDays = 0;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      if (this.dayoffObj.beginDate > this.dayoffObj.endDate) {
        this.hrSevice.notifyInvalidFromTo(
          'BeginDate',
          'EndDate',
          this.formModel
        );
        return;
      }

      this.hrSevice.AddEmployeeDayOffInfo(this.dayoffObj).subscribe((p) => {
        if (p != null) {
          this.dayoffObj.recID = p.recID;
          this.notify.notifyCode('SYS006');
          // if(p[0]){
          //   p[0].emp = this.empObj;
          // }else p.emp = this.empObj;
          p.emp = this.empObj;
          this.successFlag = true;
          this.dialog && this.dialog.close(p);

          // this.lstDayoffs.push(JSON.parse(JSON.stringify(this.dayoffObj)));
          // if(this.listView){
          //   (this.listView.dataService as CRUDService).add(this.dayoffObj).subscribe();
          // }
        } else this.notify.notifyCode('SYS023');
      });
    } else {
      this.hrSevice
        .UpdateEmployeeDayOffInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.successFlag = true;
            this.notify.notifyCode('SYS007');
            p.emp = this.empObj
            this.dialog && this.dialog.close(p);
            // this.lstDayoffs[this.indexSelected] = p;
            // if(this.listView){
            //   (this.listView.dataService as CRUDService).update(this.lstDayoffs[this.indexSelected]).subscribe()
            // }
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  // click(data) {
  //   console.log('formdata', data);
  //   this.dayoffObj = data;
  //   this.formModel.currentData = JSON.parse(JSON.stringify(this.dayoffObj))
  //   this.indexSelected = this.lstDayoffs.findIndex(p => p.recID == this.dayoffObj.recID);
  //   this.actionType ='edit'
  //   this.formGroup?.patchValue(this.dayoffObj);
  //   this.cr.detectChanges();
  // }

  // afterRenderListView(evt){
  //   this.listView = evt;
  //   console.log(this.listView);
  // }

  HandlePregnantTypeChange(e, pregnantType) {

    if (e.component.checked == true) {
      if (pregnantType.value == '1') {
        this.isnormalPregnant = true;
        this.isNotNormalPregnant = false;
      } else {
        this.isnormalPregnant = false;
        this.isNotNormalPregnant = true;
      }
    } else if (e.component.checked == false) {
      if (pregnantType.value == '1') {
        this.isnormalPregnant = false;
      } else if (pregnantType.value == '2') {
        this.isNotNormalPregnant = false;
      }
    }
  }

  HandleTotalDaysVal() {
    if (this.dayoffObj.periodType == '2' || this.dayoffObj.periodType == '3') {
      this.dayoffObj.totalDays = 0.5;
    } else {
      let beginDate = new Date(this.dayoffObj.beginDate);
      let endDate = new Date(this.dayoffObj.endDate);

      let dif = endDate.getTime() - beginDate.getTime();
      this.dayoffObj.totalDays = dif / (1000 * 60 * 60 * 24) + 1;
    }

    this.formGroup.patchValue({ totalDays: this.dayoffObj.totalDays });
  }

  HandleInputBeginDate(evt) {
    this.dayoffObj.beginDate = evt.data;
    if (this.dayoffObj.endDate != null && this.dayoffObj.periodType != null) {
      //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
      if (evt.data != this.dayoffObj.endDate) {
        this.dayoffObj.periodType = '1';
        this.formGroup.patchValue({ periodType: this.dayoffObj.periodType });
      }
      this.HandleTotalDaysVal();
    }
  }

  HandleInputEndDate(evt) {
    this.dayoffObj.endDate = evt.data;
    if (this.dayoffObj.beginDate != null && this.dayoffObj.periodType != null) {
      //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
      if (this.dayoffObj.beginDate != evt.data) {
        this.dayoffObj.periodType = '1';
        this.formGroup.patchValue({ periodType: this.dayoffObj.periodType });
      }
      this.HandleTotalDaysVal();
    }
  }

  HandleInputPeriodType(evt) {
    this.dayoffObj.periodType = evt.data;

    if (evt.data == '2' || evt.data == '3') {
      this.dayoffObj.endDate = this.dayoffObj.beginDate;
      this.formGroup.patchValue({ endDate: this.dayoffObj.endDate });
    }
    this.HandleTotalDaysVal();
  }

  allowToViewEmp() {
    //check if show emp info or not
    switch (this.actionType) {
      case 'edit':
        // if (this.fromListView) return true;
        // else return false;
        break;
      case 'add':
        break;
      case 'copy':
        break;
    }
  }
  getEmployeeInfoById(empId: string, fieldName: string) {
    let empRequest = new DataRequest();
    empRequest.entityName = 'HR_Employees';
    empRequest.dataValues = empId;
    empRequest.predicates = 'EmployeeID=@0';
    empRequest.pageLoading = false;
    this.hrSevice.loadData('HR', empRequest).subscribe((emp) => {
      if (emp[1] > 0) {
        if (fieldName === 'employeeID') this.empObj = emp[0][0];
        else if (fieldName === 'signerID') {
          this.dayoffObj.signer = emp[0][0]?.employeeName;
          if (emp[0][0]?.positionID) {
            this.hrSevice
              .getPositionByID(emp[0][0]?.positionID)
              .subscribe((res) => {
                if (res) {
                  this.dayoffObj.signerPosition = res.positionName;
                  this.formGroup.patchValue({
                    //signer: this.dayoffObj.signer,
                    signerPosition: this.dayoffObj.signerPosition,
                  });
                  this.cr.detectChanges();
                }
              });
          } else {
            this.dayoffObj.signerPosition = null;
            this.formGroup.patchValue({
              //signer: this.dayoffObj.signer,
              signerPosition: this.dayoffObj.signerPosition,
            });
          }
        }
      }
      this.cr.detectChanges();
    });
  }
  handleSelectEmp(evt) {
    switch (evt?.field) {
      case 'employeeID': //check if employee changed
        if (evt?.data && evt?.data.length > 0) {
          this.employId = evt?.data;
          this.getEmployeeInfoById(this.employId, evt?.field);
        } else {
          delete this.employId;
          delete this.empObj;
          this.formGroup.patchValue({
            employeeID: this.dayoffObj.employeeID,
          });
        }
        break;
      case 'signerID': // check if signer changed
        if (evt?.data && evt?.data.length > 0) {
          this.getEmployeeInfoById(evt?.data, evt?.field);
        } else {
          delete this.dayoffObj?.signerID;
          // delete this.awardObj.signer;
          // delete this.awardObj?.signerPosition;
          this.formGroup.patchValue({
            signerID: null,
            // signer: null,
            // signerPosition: null,
          });
        }
        break;
    }
  }
}
