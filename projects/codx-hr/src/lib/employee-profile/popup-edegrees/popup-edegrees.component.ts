import { FormGroup } from '@angular/forms';
import { CodxHrService } from '../../codx-hr.service';
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
import { DateTime } from '@syncfusion/ej2-angular-charts';
@Component({
  selector: 'lib-popup-edegrees',
  templateUrl: './popup-edegrees.component.html',
  styleUrls: ['./popup-edegrees.component.css'],
})
export class PopupEDegreesComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  idField: string = 'recID';
  degreeObj;
  //indexSelected;
  //lstDegrees;
  successFlag = false;
  funcID: string;
  actionType;
  employId;
  isAfterRender = false;
  headerText: '';
  dataVllSupplier: any;
  defaultIssueDate: string = '0001-01-01T00:00:00';

  //default degreeName
  levelText: string;
  trainFieldText: string;
  @ViewChild('form') form: CodxFormComponent;
  //@ViewChild('listView') listView: CodxListviewComponent;
  ops = ['m', 'y'];
  date = new Date();
  fromDateFormat;
  toDateFormat;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.degreeObj = data?.data?.degreeObj;
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.formModel = dialog?.formModel;
    console.log(this.formModel);
  }

  changeCalendar(event, changeType: string) {
    let yearFromDate = event.fromDate.getFullYear();
    let monthFromDate = event.fromDate.getMonth() + 1;
    let dayFromDate = event.fromDate.getDate();
    var strYear = `${yearFromDate}`;
    var strMonth = `${yearFromDate}/${monthFromDate}`;
    var strDay = `${yearFromDate}/${monthFromDate}/${dayFromDate}`;

    if (changeType === 'FromDate') {
      if (event.type === 'year') {
        this.degreeObj.trainFrom = strYear;
      } else if (event.type === 'month') {
        this.degreeObj.trainFrom = strMonth;
      } else {
        this.degreeObj.trainFrom = strDay;
      }
      this.degreeObj.trainFromDate = event.fromDate;
    } else if (changeType === 'ToDate') {
      if (event.type === 'year') {
        this.degreeObj.trainTo = strYear;
      } else if (event.type === 'month') {
        this.degreeObj.trainTo = strMonth;
      } else {
        this.degreeObj.trainTo = strDay;
      }
      this.degreeObj.trainToDate = event.fromDate;
    }
  }

  ngAfterViewInit() {
    this.dialog &&
      this.dialog.closed.subscribe((res) => {
        if (!res.event) {
          if (this.successFlag) {
            this.dialog.close(this.degreeObj);
          } else {
            this.degreeObj.isSuccess = false;
            this.dialog.close(null);
          }
        }
      });
  }

  initForm() {
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((grvSetup) => {
        if (grvSetup) {
          console.log(grvSetup);
          let dataRequest = new DataRequest();
          dataRequest.comboboxName = grvSetup.TrainSupplierID.referedValue;
          dataRequest.pageLoading = false;

          this.hrService.loadDataCbx('HR', dataRequest).subscribe((data) => {
            if (data) {
              this.dataVllSupplier = JSON.parse(data[0]);
            }
            console.log(this.dataVllSupplier);
          });
        }
      });
    this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.formGroup = item;
        if (this.actionType == 'add') {
          this.hrService
            .getDataDefault(
              this.formModel.funcID,
              this.formModel.entityName,
              this.idField
            )
            .subscribe((res) => {
              if (res && res.data) {
                this.degreeObj = res?.data;
                if (
                  this.degreeObj.issuedDate.toString() == this.defaultIssueDate
                ) {
                  this.degreeObj.issuedDate = null;
                }

                this.degreeObj.employeeID = this.employId;
                this.formModel.currentData = this.degreeObj;
                this.formGroup.patchValue(this.degreeObj);
                this.cr.detectChanges();
                this.isAfterRender = true;
              } else {
                this.notify.notify('Error');
              }
            });
        } else {
          if (
            this.actionType == 'copy' &&
            this.degreeObj.issuedDate.toString() == this.defaultIssueDate
          ) {
            this.degreeObj.issuedDate = null;
          }

          this.formModel.currentData = this.degreeObj;
          this.formGroup.patchValue(this.degreeObj);
          this.cr.detectChanges();
          this.isAfterRender = true;
        }
      });
      this.fromDateFormat = this.getFormatDate(this.degreeObj.trainFrom);
      this.toDateFormat = this.getFormatDate(this.degreeObj.trainTo);
  }

  onInit(): void {
    console.log('data obj', this.degreeObj);
    if (!this.formModel)
      this.hrService.getFormModel(this.funcID).then((formModel) => {
        if (formModel) this.formModel = formModel;
        this.initForm();
      });
    else this.initForm();
  }

  onSaveForm() {
    // if (this.formGroup.invalid) {
    //   this.hrService.notifyInvalid(this.formGroup, this.formModel);
    //   return;
    // }

    if (this.actionType === 'copy') {
      delete this.degreeObj.recID;
    }
    this.degreeObj.employeeID = this.employId;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.AddEmployeeDegreeInfo(this.degreeObj).subscribe((p) => {
        if (p != null) {
          this.degreeObj = p;
          this.degreeObj.isSuccess = true;
          this.notify.notifyCode('SYS006');
          this.dialog && this.dialog.close(this.degreeObj);
        } else {
          this.notify.notifyCode('SYS023');
          this.degreeObj.isSuccess = false;
        }
      });
    } else {
      this.hrService
        .updateEmployeeDegreeInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.degreeObj.isSuccess = true;
            this.dialog && this.dialog.close(this.degreeObj);
          } else {
            this.notify.notifyCode('SYS021');
            this.degreeObj.isSuccess = false;
          }
        });
    }
  }

  // getSelectedType(data: string) {
  //   let arrStringDate = data?.split('/');
  //   let result =
  //     arrStringDate?.length == 1 ? 'y' : arrStringDate?.length == 2 ? 'm' : 'd';

  //   return result;
  // }

  Date(date) {
    return new Date(date);
  }

  // click(data) {
  //   this.degreeObj = data;
  //   this.formModel.currentData = JSON.parse(JSON.stringify(this.degreeObj));
  //   this.indexSelected = this.lstDegrees.findIndex(
  //     (p) => (p.recID = this.degreeObj.recID)
  //   );
  //   this.actionType = 'edit';
  //   this.formGroup?.patchValue(this.degreeObj);
  //   this.cr.detectChanges();
  // }

  // afterRenderListView(evt) {
  //   this.listView = evt;
  // }

  setIssuedPlace() {
    if (this.degreeObj.trainSupplierID) {
      if (this.dataVllSupplier) {
        let trainSupplier = this.dataVllSupplier.filter(
          (p) => p.TrainSupplierID == this.degreeObj.trainSupplierID
        );
        if (trainSupplier) {
          this.degreeObj.issuedPlace = trainSupplier[0]?.TrainSupplierName;
          this.formGroup.patchValue({
            issuedPlace: this.degreeObj.issuedPlace,
          });
          this.cr.detectChanges();
        }
      }
    } else {
      this.notify.notifyCode('Nhap thong tin noi dao tao');
    }
  }

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'trainLevel': {
          let objLevel = event.component?.dataSource.filter(
            (p) => p.value == event.data
          );
          this.levelText = objLevel[0]?.text;
          this.defaultDegreeName();
          break;
        }
        case 'trainFieldID': {
          this.trainFieldText =
            event.component?.itemsSelected[0]?.TrainFieldName;
          this.defaultDegreeName();
          break;
        }
      }
    }
  }

  defaultDegreeName() {
    if (
      (!this.degreeObj.degreeName || this.degreeObj.degreeName == '') &&
      this.levelText &&
      this.trainFieldText
    ) {
      this.degreeObj.degreeName = this.levelText + ' ' + this.trainFieldText;
      this.formGroup.patchValue({ degreeName: this.degreeObj.degreeName });
      this.cr.detectChanges();
    }
  }
  getFormatDate(trainFrom : string){
    let resultDate = '';
    if(trainFrom){
      let arrDate = trainFrom.split('/');
      resultDate = arrDate.length === 1 ? 'y' : arrDate.length === 2 ? 'm' : 'd';
      return resultDate
    } else return resultDate = 'y';
  }
}
