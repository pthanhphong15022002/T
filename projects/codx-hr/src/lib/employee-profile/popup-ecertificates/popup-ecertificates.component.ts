
import { CodxHrService } from 'projects/codx-hr/src/public-api';
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
  LayoutAddComponent,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';

@Component({
  selector: 'lib-popup-ecertificates',
  templateUrl: './popup-ecertificates.component.html',
  styleUrls: ['./popup-ecertificates.component.css'],
})
export class PopupECertificatesComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  // formGroup: FormGroup;
  dialog: DialogRef;
  certificateObj;
  lstCertificates;
  indexSelected;
  actionType;
  idField = 'RecID';
  employId;
  // isAfterRender = false;
  headerText: '';
  ops = ['d', 'm', 'y'];
  dataVllSupplier: any;
  fromDateFormat;
  toDateFormat;
  headerTextCalendar: any = [];
  isNullFrom: boolean = true;
  isNullTo: boolean = true;
  changedInForm = false;
  disabledInput = false;

  displayForeignCert = false;

  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('form') form: LayoutAddComponent;
  @ViewChild('listView') listView: CodxListviewComponent;
  // @ViewChild('layout', { static: true }) layout: LayoutAddComponent;
  fieldHeaderTexts: any;

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
    this.formModel = dialog.formModel;
    if (this.actionType == 'view') {
      this.disabledInput = true;
    }
    this.lstCertificates = data?.data?.lstCertificates;
    this.certificateObj = JSON.parse(JSON.stringify(data.data.dataInput));
    if (this.certificateObj) {
      this.certificateObj.trainFromDate = new Date(
        this.certificateObj.trainFromDate
      );
      this.certificateObj.trainToDate = new Date(
        this.certificateObj.trainToDate
      );
    }
    // this.indexSelected =
    //   data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;
    this.headerTextCalendar[0] = data?.data?.trainFromHeaderText;
    this.headerTextCalendar[1] = data?.data?.trainToHeaderText;
  }

  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'cerOveralInf',
    },
    {
      icon: 'icon-info',
      text: 'Thông tin thêm',
      name: 'cerMoreInf',
    },
  ];

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
            console.log('certificateObj', this.certificateObj);

            this.certificateObj.employeeID = this.employId;
            // this.formModel.currentData = this.certificateObj;
            // this.form.formGroup.patchValue(this.certificateObj);
            this.cr.detectChanges();
            // this.isAfterRender = true;
            this.isNullFrom = false;
            this.isNullTo = false;
          }
        });
    } else {
      this.isNullFrom = true;
      this.isNullTo = true;
      if (
        this.actionType === 'edit' ||
        this.actionType === 'copy' ||
        this.actionType === 'view'
      ) {
        if (this.certificateObj.certificateType == '3') {
          this.displayForeignCert = true;
        }
        // this.form.formGroup.patchValue(this.certificateObj);
        // this.formModel.currentData = this.certificateObj;
        this.cr.detectChanges();
        // this.isAfterRender = true;
        if (this.certificateObj.trainFromDate == null) this.isNullFrom = false;
        if (this.certificateObj.trainToDate == null) this.isNullTo = false;
      }
    }
  }

  ClickCalendar(event) {
    this.changedInForm = true;
  }

  setTitle(evt: any) {
    this.headerText += ' ' + evt;
    this.cr.detectChanges();
  }

  handleControlType(evt) {
    if (evt == 'day') {
      return 'd';
    } else if (evt == 'month') {
      return 'm';
    } else if (evt == 'year') {
      return 'y';
    }
    return 'd';
  }

  onInit(): void {
    if (this.certificateObj) {
      this.fromDateFormat = this.handleControlType(
        this.certificateObj.trainFrom
      );
      this.toDateFormat = this.handleControlType(this.certificateObj.trainTo);
    } else {
      this.fromDateFormat = 'd';
      this.toDateFormat = 'd';
    }

    this.hrService.getHeaderText(this.funcID).then((res) => {
      this.fieldHeaderTexts = res;
    });
    this.initForm();

    // this.hrService.getFormModel(this.funcID).then((formModel) => {
    //   if (formModel) {
    //     this.formModel = formModel;
    //     this.hrService
    //       .getFormGroup(
    //         this.formModel.formName,
    //         this.formModel.gridViewName,
    //         this.formModel
    //       )
    //       .then((fg) => {
    //         if (fg) {
    //           this.form.formGroup = fg;
    //           this.initForm();
    //         }
    //       });
    //   }
    // });
  }

  async onSaveForm() {
    if (
      !this.certificateObj.foreignLanguage &&
      this.certificateObj.certificateType == '3'
    ) {
      this.notify.notifyCode(
        'SYS009',
        null,
        this.fieldHeaderTexts['ForeignLanguage']
      );
      return;
    }

    if (this.form.formGroup.invalid) {
      this.hrService.notifyInvalid(this.form.formGroup, this.formModel);
      this.form.form.validation(false);
      return;
    }

    if (this.certificateObj.trainTo && this.certificateObj.trainFrom) {
      if (
        Number(this.certificateObj.trainTo) <
        Number(this.certificateObj.trainFrom)
      ) {
        this.hrService.notifyInvalidFromTo(
          'TrainTo',
          'TrainFrom',
          this.formModel
        );
        return;
      }
    }

    this.certificateObj.attachments =
      this.attachment?.data?.length + this.attachment?.fileUploadList?.length;

    if (!this.certificateObj.attachments) {
      this.certificateObj.attachments = 0;
    }

    if (
      this.attachment.fileUploadList &&
      this.attachment.fileUploadList.length > 0
    ) {
      this.attachment.objectId = this.certificateObj?.recID;
      (await this.attachment.saveFilesObservable()).subscribe(
        (item2: any) => {}
      );
    }

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.AddECertificateInfo(this.certificateObj).subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS006');
          this.dialog && this.dialog.close(p);
        } else this.notify.notifyCode('SYS023');
      });
    } else {
      this.hrService
        .UpdateEmployeeCertificateInfo(this.certificateObj)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
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
    this.form.formGroup?.patchValue(this.certificateObj);
    this.cr.detectChanges();
  }

  afterRenderListView(evt) {
    this.listView = evt;
    console.log(this.listView);
  }

  openFormUploadFile() {
    this.attachment.uploadFile();
  }

  valueChange(event, cbxComponent: any = null) {
    if (event.data == '3') {
      this.displayForeignCert = true;
    }
    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'certificateType': {
          // (cbxComponent.ComponentCurrent.dataService as CRUDService).data = [];
          // cbxComponent.ComponentCurrent.predicates = 'CertificateType=@0';
          // cbxComponent.ComponentCurrent.dataValues = event.data;

          //(cbxComponent.ComponentCurrent.dataService as CRUDService).setPredicate('CertificateType=@0', [event.data]).subscribe();
          // console.log(cbxComponent);
          break;
        }
      }
    }
  }

  async addFiles(evt) {
    this.changedInForm = true;
    this.certificateObj.attachments = evt.data.length;
    this.form.formGroup.patchValue(this.certificateObj);
  }

  setIssuedPlace() {
    if (this.certificateObj.trainSupplierID) {
      if (this.dataVllSupplier) {
        let trainSupplier = this.dataVllSupplier.filter(
          (p) => p.TrainSupplierID == this.certificateObj.trainSupplierID
        );
        if (trainSupplier) {
          this.certificateObj.issuedPlace = trainSupplier[0]?.TrainSupplierName;
          this.form.formGroup.patchValue({
            issuedPlace: this.certificateObj.issuedPlace,
          });
          this.cr.detectChanges();
        }
      }
    }
  }

  Date(date) {
    return new Date(date);
  }

  changeCalendar(event, changeType: string) {
    if (changeType === 'FromDate') {
      this.certificateObj.trainFrom = event.type;
      this.certificateObj.trainFromDate = event.fromDate;
      this.fromDateFormat = this.handleControlType(event.type);
    } else if (changeType === 'ToDate') {
      this.certificateObj.trainTo = event.type;
      this.certificateObj.trainToDate = event.fromDate;
      this.toDateFormat = this.handleControlType(event.type);
    }
    this.form.formGroup.patchValue(this.certificateObj);
  }

  // changeCalendar(event, changeType: string) {
  //   let yearFromDate = event.fromDate.getFullYear();
  //   let monthFromDate = event.fromDate.getMonth() + 1;
  //   let dayFromDate = event.fromDate.getDate();
  //   var strYear = `${yearFromDate}`;
  //   var strMonth = `${yearFromDate}/${monthFromDate}`;
  //   var strDay = `${yearFromDate}/${monthFromDate}/${dayFromDate}`;

  //   if (changeType === 'FromDate') {
  //     if (event.type === 'year') {
  //       this.certificateObj.trainFrom = strYear;
  //     } else if (event.type === 'month') {
  //       this.certificateObj.trainFrom = strMonth;
  //     } else {
  //       this.certificateObj.trainFrom = strDay;
  //     }
  //     this.certificateObj.trainFromDate = event.fromDate;
  //   } else if (changeType === 'ToDate') {
  //     if (event.type === 'year') {
  //       this.certificateObj.trainTo = strYear;
  //     } else if (event.type === 'month') {
  //       this.certificateObj.trainTo = strMonth;
  //     } else {
  //       this.certificateObj.trainTo = strDay;
  //     }
  //     this.certificateObj.trainToDate = event.fromDate;
  //     this.form.formGroup.patchValue(this.certificateObj);
  //     if (this.certificateObj) {
  //       this.fromDateFormat = this.getFormatDate(this.certificateObj.trainFrom);
  //       this.toDateFormat = this.getFormatDate(this.certificateObj.trainTo);
  //     } else {
  //       this.fromDateFormat = this.getFormatDate(null);
  //       this.toDateFormat = this.getFormatDate(null);
  //     }
  //   }
  // }

  // getFormatDate(trainFrom: string) {
  //   let resultDate = '';
  //   if (trainFrom) {
  //     let arrDate = trainFrom.split('/');
  //     resultDate =
  //       arrDate.length === 1 ? 'y' : arrDate.length === 2 ? 'm' : 'd';
  //     return resultDate;
  //   } else return 'y';
  // }
}
