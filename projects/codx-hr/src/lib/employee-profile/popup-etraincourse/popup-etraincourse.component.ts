import { FormGroup, Validators } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { ChangeDetectorRef, Injector, ViewEncapsulation } from '@angular/core';
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
import { Thickness } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'lib-popup-etraincourse',
  templateUrl: './popup-etraincourse.component.html',
  styleUrls: ['./popup-etraincourse.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupETraincourseComponent extends UIComponent implements OnInit {
  formGroup: FormGroup;
  formModel: FormModel;
  // formGroup2: FormGroup;
  // formModel2: FormModel;
  dialog: DialogRef;
  headerText: string = '';
  idField: string = 'recID';
  funcID;
  employId;
  IsAfterRender = false;
  data;
  dataForm2;
  actionType: string;
  isSaved: boolean = false;
  trainCourseObj;
  dataVllSupplier: any;
  result;
  fromDateFormat;
  toDateFormat;
  ops = ['m', 'y'];

  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;
  // @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() dataDialog?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = dataDialog?.data?.headerText;
    this.actionType = dataDialog?.data?.actionType;
    this.formModel = dialog?.formModel;
    this.funcID = dataDialog?.data?.funcID;
    this.employId = dataDialog?.data?.employeeId;
    this.trainCourseObj = JSON.parse(
      JSON.stringify(dataDialog?.data?.dataInput)
    );
  }

  initForm() {
    if (this.formModel) {
      this.hrService
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.cache
              .gridViewSetup(
                this.formModel.formName,
                this.formModel.gridViewName
              )
              .subscribe((grvSetup) => {
                if (grvSetup) {
                  console.log(grvSetup);
                  let dataRequest = new DataRequest();
                  dataRequest.comboboxName =
                    grvSetup.TrainSupplierID.referedValue;
                  dataRequest.pageLoading = false;

                  this.hrService
                    .loadDataCbx('HR', dataRequest)
                    .subscribe((data) => {
                      if (data) {
                        this.dataVllSupplier = JSON.parse(data[0]);
                      }
                      console.log(this.dataVllSupplier);
                    });
                }
              });
            if (this.actionType == 'add') {
              this.hrService
                .getDataDefault(
                  this.formModel.funcID,
                  this.formModel.entityName,
                  this.idField
                )
                .subscribe((res) => {
                  if (res) {
                    console.log('dataaaaaa', res);
                    // this.data = res?.data;
                    this.trainCourseObj = res?.data;
                    this.trainCourseObj.employeeID = this.employId;
                    this.formModel.currentData = this.trainCourseObj;
                    this.formGroup.patchValue(this.trainCourseObj);
                    this.cr.detectChanges();
                    this.isAfterRender = true;
                  }
                });
            } else {
              this.formModel.currentData = this.trainCourseObj;
              this.formGroup.patchValue(this.trainCourseObj);
              this.cr.detectChanges();
              this.isAfterRender = true;
            }
          }
        });
    }
    if(this.trainCourseObj){
      this.fromDateFormat = this.getFormatDate(this.trainCourseObj.trainFrom);
      this.toDateFormat = this.getFormatDate(this.trainCourseObj.trainTo);
    } else {
      this.fromDateFormat = this.getFormatDate(null);
      this.toDateFormat = this.getFormatDate(null);
    }
  }

  onInit(): void {
    if (!this.formModel) {
      this.hrService.getFormModel(this.funcID).then((formModel) => {
        this.formModel = formModel;
        this.initForm();
      });
    } else {
      this.initForm();
    }
  }

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  save() {
    this.formGroup.patchValue({
      trainFromDate: new Date(),
      trainToDate: new Date(),
    });
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }
    if (this.actionType === 'copy') delete this.trainCourseObj.recID;
    this.employId = this.employId;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService
        .addETraincourse(this.trainCourseObj, this.funcID)
        .subscribe((p) => {
          if (p != null) {
            this.result = p;
            this.notify.notifyCode('SYS006');
            this.result.isSuccess = true;
            this.dialog && this.dialog.close(this.result);
          } else {
            this.notify.notifyCode('SYS023');
            this.result.isSuccess = false;
          }
        });
    } else {
      this.hrService
        .updateEmployeeTrainCourseInfo(this.trainCourseObj, this.funcID)
        .subscribe((p) => {
          if (p != null) {
            this.result = p;
            this.notify.notifyCode('SYS007');
            this.result.isSuccess = true;
            this.dialog && this.dialog.close(this.result);
          } else {
            this.notify.notifyCode('SYS021');
            this.result.isSuccess = false;
          }
        });
    }
  }

  click(data) {
    this.data = JSON.parse(JSON.stringify(data));
    this.formGroup.patchValue(this.data);
    this.formModel.currentData = this.data;
    this.actionType = 'edit';
    this.cr.detectChanges();
  }

  insertECertificate() {
    if (this.actionType == 'edit') {
      let modelECertificate = JSON.parse(JSON.stringify(this.data));
      modelECertificate.refTrainCource = this.data.recID;
      delete modelECertificate.recID;

      this.hrService.AddECertificateInfo(this.data).subscribe((res) => {
        if (res) {
          this.data.isUpdateCertificate = true;
          this.formGroup.patchValue({ isUpdateCertificate: true });
          this.hrService
            .updateEmployeeTrainCourseInfo(this.data, this.funcID)
            .subscribe((res) => {});
          this.cr.detectChanges();
        }
      });
    } else if (this.actionType == 'add' && this.isSaved == false) {
      //Thông báo lưu record trainning trước khi cập nhật Chứng chỉ
      this.notify.notifyCode('HR005');
    }
    this.cr.detectChanges();
  }

  setIssuedPlace() {
    if (this.data.trainSupplierID) {
      if (this.dataVllSupplier) {
        let trainSupplier = this.dataVllSupplier.filter(
          (p) => p.TrainSupplierID == this.data.trainSupplierID
        );
        if (trainSupplier) {
          this.data.issuedPlace = trainSupplier[0]?.TrainSupplierName;
          this.formGroup.patchValue({
            issuedPlace: this.data.issuedPlace,
          });
          this.cr.detectChanges();
        }
      }
    } else {
      this.notify.notifyCode('Chưa chọn nơi đào tạo');
    }
  }

  Date(date) {
    return new Date(date);
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
        this.trainCourseObj.trainFrom = strYear;
      } else if (event.type === 'month') {
        this.trainCourseObj.trainFrom = strMonth;
      } else {
        this.trainCourseObj.trainFrom = strDay;
      }
      this.trainCourseObj.trainFromDate = event.fromDate;
    } else if (changeType === 'ToDate') {
      if (event.type === 'year') {
        this.trainCourseObj.trainTo = strYear;
      } else if (event.type === 'month') {
        this.trainCourseObj.trainTo = strMonth;
      } else {
        this.trainCourseObj.trainTo = strDay;
      }
      this.trainCourseObj.trainToDate = event.fromDate;
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
