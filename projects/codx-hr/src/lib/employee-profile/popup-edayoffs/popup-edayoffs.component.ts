import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import {
  Injector,
  ChangeDetectorRef,
  TemplateRef,
  ElementRef,
} from '@angular/core';
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
  showInfoDayoffType = false;
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
  disabledInput = false;
  // genderGrvSetup: any;
  allowToViewEmSelector: boolean = false;
  //@ViewChild('listView') listView: CodxListviewComponent;

  knowType = {
    type1: ['N20', 'N22', 'N23', 'N24', 'N25', 'N26', 'N35'],
    type2: ['N21'],
    type3: ['N31'],
    type4: ['N33'],
    type5: ['N34'],
  };
  groupKowTypeView: any;

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
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;

    if (data?.data?.dayoffObj) {
      this.dayoffObj = JSON.parse(JSON.stringify(data?.data?.dayoffObj));
    } else {
      this.dayoffObj = {};
    }

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

    this.actionType = data?.data?.actionType;
    if (this.actionType == 'view') {
      this.disabledInput = true;
    }
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

    if (this.employId) this.getEmployeeInfoById(this.employId, 'employeeID');
    this.getGroupKowTypeView();
    if (this.dayoffObj?.kowID) this.checkViewKowTyeGroup();
  }

  initForm() {
    this.hrSevice
      .getOrgUnitID(this.empObj?.orgUnitID ?? this.empObj?.emp?.orgUnitID)
      .subscribe((res) => {
        if (this?.empObj) {
          this.empObj.orgUnitName = res.orgUnitName;
        }
      });

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
            this.isAfterRender = true;
            this.cr.detectChanges();
          }
        });
    } else {
      if (
        this.actionType === 'edit' ||
        this.actionType === 'copy' ||
        this.actionType === 'view'
      ) {
        this.formGroup.patchValue(this.dayoffObj);
        this.formModel.currentData = this.dayoffObj;
        this.isAfterRender = true;
        this.cr.detectChanges();
      }
    }
  }

  UpdateFromDate(e) {
    this.pregnancyFromVal = e;
  }

  onSaveForm() {
    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      this.form.validation(false)
      return;
    }
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
    if (!this.dateCompare(this.dayoffObj.beginDate, this.dayoffObj.endDate)) {
      this.hrSevice.notifyInvalidFromTo('EndDate', 'BeginDate', this.formModel);
      return;
    }

    this.dayoffObj.employeeID = this.employId;
    this.dayoffObj.totalSubDays = 0;

    this.deletedKowGroupValue();

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrSevice.AddEmployeeDayOffInfo(this.dayoffObj).subscribe((p) => {
        if (p != null) {
          this.dayoffObj.recID = p.recID;
          this.notify.notifyCode('SYS006');
          p.emp = this.empObj;
          this.successFlag = true;
          this.dialog && this.dialog.close(p);
        }
        // else this.notify.notifyCode('SYS023');
      });
    } else {
      this.hrSevice.UpdateEmployeeDayOffInfo(this.dayoffObj).subscribe((p) => {
        if (p != null) {
          this.successFlag = true;
          this.notify.notifyCode('SYS007');
          p.emp = this.empObj;
          this.dialog && this.dialog.close(p);
          // this.lstDayoffs[this.indexSelected] = p;
          // if(this.listView){
          //   (this.listView.dataService as CRUDService).update(this.lstDayoffs[this.indexSelected]).subscribe()
          // }
        }
        // else this.notify.notifyCode('SYS021');
      });
    }
  }

  calTotalDayoff(evt) {
    this.dayoffObj.totalDaysOff = evt.data - this.dayoffObj.totalSubDays;
    this.formGroup.patchValue({ totalDaysOff: this.dayoffObj.totalDaysOff });
  }

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

  HandleTotalDaysVal(periodType: string) {
    let beginDate = new Date(this.dayoffObj.beginDate);
    let endDate = new Date(this.dayoffObj.endDate);
    let dif = endDate.getTime() - beginDate.getTime();
    if (periodType == '1') {
      this.dayoffObj.totalDays = dif / (1000 * 60 * 60 * 24) + 1;
    }
    if (
      (periodType == '2' || periodType == '3') &&
      this.dayoffObj.beginDate == this.dayoffObj.endDate
    ) {
      this.dayoffObj.totalDays = 0.5;
    }

    if (
      this.dayoffObj.endDate > this.dayoffObj.beginDate &&
      (periodType == '2' || periodType == '3')
    ) {
      this.dayoffObj.endDate = this.dayoffObj.beginDate;
      this.formGroup.patchValue({ endDate: this.dayoffObj.beginDate });
      this.dayoffObj.totalDays = 0.5;
    }

    this.formGroup.patchValue({
      totalDays:
        this.dayoffObj.endDate < this.dayoffObj.beginDate
          ? ''
          : this.dayoffObj.totalDays,
    });
  }

  //Change date and render days
  valueChangedDate(evt: any) {
    if (evt.field === 'beginDate') {
      this.dayoffObj.beginDate = evt.data;
      this.dayoffObj.endDate = evt.data;
      this.formGroup.patchValue({ endDate: evt.data });
    }
    if (evt.field === 'endDate') {
      this.dayoffObj.endDate = evt.data;
    }

    if (this.dayoffObj.endDate && this.dayoffObj.beginDate) {
      this.HandleTotalDaysVal(this.dayoffObj.periodType);
    }
  }

  dateCompare(beginDate, endDate) {
    if (beginDate && endDate) {
      let date1 = new Date(beginDate);
      let date2 = new Date(endDate);
      return date1 <= date2;
    }
    return false;
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
        if (fieldName === 'employeeID') {
          this.empObj = emp[0][0];

          this.hrSevice
            .getOrgUnitID(this.empObj?.orgUnitID ?? this.empObj?.emp?.orgUnitID)
            .subscribe((res) => {
              this.empObj.orgUnitName = res.orgUnitName;
            });
        } else if (fieldName === 'signerID') {
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

  kowIDValuechange() {
    this.checkViewKowTyeGroup();
  }
  getGroupKowTypeView() {
    this.groupKowTypeView = {
      groupA: {
        value: this.knowType.type1
          .concat(this.knowType.type2)
          .concat(this.knowType.type4)
          .concat(this.knowType.type5),
        isShow: false,
        field: ['siLeaveNo', 'hospitalLine'],
      },
      groupB: {
        value: this.knowType.type2,
        isShow: false,
        field: ['childID', 'childHICardNo'],
      },
      groupC: {
        value: this.knowType.type4.concat(this.knowType.type5),
        isShow: false,
        field: ['pregnancyFrom', 'pregnancyWeeks'],
      },
      groupD: {
        value: this.knowType.type3,
        isShow: false,
        field: [
          'newChildBirthDate',
          'newChildNum',
          'isNewChildUnder32W',
          'newChildBirthType',
          'wifeID',
          'wifeIDCardNo',
          'wifeSINo',
        ],
      },
    };
  }
  checkViewKowTyeGroup() {
    if (this.dayoffObj['kowID']) {
      this.showInfoDayoffType = false;
      for (let i in this.groupKowTypeView) {
        if (this.groupKowTypeView[i].value.includes(this.dayoffObj['kowID'])) {
          this.groupKowTypeView[i].isShow = true;
          this.showInfoDayoffType = true;
        }

        // this.groupKowTypeView[i].isShow = this.groupKowTypeView[
        //   i
        // ].value.includes(this.dayoffObj['kowID']);
      }
    } else this.getGroupKowTypeView();
  }
  deletedKowGroupValue() {
    for (let i in this.groupKowTypeView) {
      if (this.groupKowTypeView[i].isShow) continue;
      else {
        for (let j in this.groupKowTypeView[i].field) {
          this.dayoffObj[this.groupKowTypeView[i].field[j]] = null;
        }
      }
    }
  }
}
