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

@Component({
  selector: 'lib-popup-ecertificates',
  templateUrl: './popup-ecertificates.component.html',
  styleUrls: ['./popup-ecertificates.component.css'],
})
export class PopupECertificatesComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  certificateObj;
  lstCertificates;
  indexSelected;
  actionType;
  funcID;
  idField = 'RecID';
  employId;
  isAfterRender = false;
  headerText: '';
  ops = ['m', 'y'];
  dataVllSupplier: any;
  fromDateFormat;
  toDateFormat;

  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    private cr: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.lstCertificates = data?.data?.lstCertificates;
    this.certificateObj = data.data.dataInput; 
    this.indexSelected =
      data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;

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

    if (this.actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.certificateObj = res?.data;
            this.certificateObj.employeeID = this.employId;
            this.formModel.currentData = this.certificateObj;
            this.formGroup.patchValue(this.certificateObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.certificateObj);
        this.formModel.currentData = this.certificateObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
    if(this.certificateObj){
      this.fromDateFormat = this.getFormatDate(this.certificateObj.trainFrom);
      this.toDateFormat = this.getFormatDate(this.certificateObj.trainTo);
    } else {
      this.fromDateFormat = this.getFormatDate(null);
      this.toDateFormat = this.getFormatDate(null);
    }

  }

  onInit(): void {
    this.hrService.getFormModel(this.funcID).then((formModel) => {
      if (formModel) {
        this.formModel = formModel;
        this.hrService
          .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
          .then((fg) => {
            if (fg) {
              this.formGroup = fg;
              this.initForm();
            }
          });
      }
    });
  }

  onSaveForm() {
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }
    if (this.actionType === 'copy') delete this.certificateObj.recID;
    this.certificateObj.employeeID = this.employId;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.AddECertificateInfo(this.certificateObj).subscribe((p) => {
        if (p != null) {
          this.certificateObj = p;
          this.notify.notifyCode('SYS006');
          this.certificateObj.isSuccess = true;
          this.dialog && this.dialog.close(this.certificateObj);
        } else {
          this.notify.notifyCode('SYS023');
          this.certificateObj.isSuccess = false;
        }
      });
    } else {
      this.hrService
        .UpdateEmployeeCertificateInfo(this.certificateObj)
        .subscribe((p) => {
          if (p != null) {
            this.certificateObj = p;
            this.notify.notifyCode('SYS007');
            this.certificateObj.isSuccess = true;
            this.dialog && this.dialog.close(this.certificateObj);
          } else {
            this.notify.notifyCode('SYS021');
            this.certificateObj.isSuccess = false;
          }
        });
    }
  }
  click(data) {
    this.certificateObj = data;

    this.formModel.currentData = JSON.parse(
      JSON.stringify(this.certificateObj)
    );
    this.indexSelected = this.lstCertificates.findIndex(
      (p) => p.recID == this.certificateObj.recID
    );
    this.actionType = 'edit';
    this.formGroup?.patchValue(this.certificateObj);
    this.cr.detectChanges();
  }

  afterRenderListView(evt) {
    this.listView = evt;
    console.log(this.listView);
  }

  valueChange(event, cbxComponent: any = null) {
    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'certificateType': {
          (cbxComponent.ComponentCurrent.dataService as CRUDService).data = [];
          cbxComponent.ComponentCurrent.predicates = 'CertificateType=@0';
          cbxComponent.ComponentCurrent.dataValues = event.data;
          //(cbxComponent.ComponentCurrent.dataService as CRUDService).setPredicate('CertificateType=@0', [event.data]).subscribe();
          // console.log(cbxComponent);
          break;
        }
      }
    }
  }

  setIssuedPlace() {
    if (this.certificateObj.trainSupplierID) {
      if (this.dataVllSupplier) {
        let trainSupplier = this.dataVllSupplier.filter(
          (p) => p.TrainSupplierID == this.certificateObj.trainSupplierID
        );
        if (trainSupplier) {
          this.certificateObj.issuedPlace = trainSupplier[0]?.TrainSupplierName;
          this.formGroup.patchValue({
            issuedPlace: this.certificateObj.issuedPlace,
          });
          this.cr.detectChanges();
        }
      }
    } else {
      this.notify.notifyCode('Nhap thong tin noi dao tao');
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
        this.certificateObj.trainFrom = strYear;
      } else if (event.type === 'month') {
        this.certificateObj.trainFrom = strMonth;
      } else {
        this.certificateObj.trainFrom = strDay;
      }
      this.certificateObj.trainFromDate = event.fromDate;
    } else if (changeType === 'ToDate') {
      if (event.type === 'year') {
        this.certificateObj.trainTo = strYear;
      } else if (event.type === 'month') {
        this.certificateObj.trainTo = strMonth;
      } else {
        this.certificateObj.trainTo = strDay;
      }
      this.certificateObj.trainToDate = event.fromDate;
    }
  }
  getFormatDate(trainFrom : string){
    let resultDate = '';
    if(trainFrom){
      let arrDate = trainFrom.split('/');
      resultDate = arrDate.length === 1 ? 'y' : arrDate.length === 2 ? 'm' : 'd';
      return resultDate
    } else return 'y';
  }
}
