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
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
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
  actionType;
  disabledInput = false;

  employId;
  isAfterRender = false;
  headerText: '';
  dataVllSupplier: any;
  defaultIssueDate: string = '0001-01-01T00:00:00';
  fromDateFormat: string;
  toDateFormat: string;
  headerTextCalendar: any = [];
  isNullFrom: boolean = true;
  isNullTo: boolean = true;
  //default degreeName
  fieldHeaderTexts
  levelText: string;
  trainFieldText: string;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;

  //@ViewChild('listView') listView: CodxListviewComponent;
  ops = ['d', 'm', 'y'];
  date = new Date();

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.degreeObj = JSON.parse(JSON.stringify(data?.data?.degreeObj));
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    if(this.actionType == 'view'){
      this.disabledInput = true;
    }
    this.formModel = dialog?.formModel;
    this.headerTextCalendar[0] = data?.data?.trainFromHeaderText;
    this.headerTextCalendar[1] = data?.data?.trainToHeaderText;
  }

  handleControlType(evt){
    if(evt == 'day'){
      return 'd';
    }
    else if(evt == 'month'){
      return 'm';
    }
    else if(evt == 'year'){
      return 'y';
    }
    return 'd';
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
  //       this.degreeObj.trainFrom = strYear;
  //     } else if (event.type === 'month') {
  //       this.degreeObj.trainFrom = strMonth;
  //     } else {
  //       this.degreeObj.trainFrom = strDay;
  //     }
  //     this.degreeObj.trainFromDate = event.fromDate;
  //   } else if (changeType === 'ToDate') {
  //     if (event.type === 'year') {
  //       this.degreeObj.trainTo = strYear;
  //     } else if (event.type === 'month') {
  //       this.degreeObj.trainTo = strMonth;
  //     } else {
  //       this.degreeObj.trainTo = strDay;
  //     }
  //     this.degreeObj.trainToDate = event.fromDate;
  //   }
  //   this.formGroup.patchValue(this.degreeObj);
  //   if (this.degreeObj) {
  //     this.fromDateFormat = this.getFormatDate(this.degreeObj.trainFrom);
  //     this.toDateFormat = this.getFormatDate(this.degreeObj.trainTo);
  //   } else {
  //     this.fromDateFormat = this.getFormatDate(null);
  //     this.toDateFormat = this.getFormatDate(null);
  //   }
  // }

  changeCalendar(event, changeType: string) {
    debugger
    if (changeType === 'FromDate') {
      this.degreeObj.trainFrom = event.type;
      this.degreeObj.trainFromDate = event.fromDate;
      this.fromDateFormat = this.handleControlType(event.type);
    } else if (changeType === 'ToDate') {
      this.degreeObj.trainTo = event.type;
      this.degreeObj.trainToDate = event.fromDate;
      this.toDateFormat = this.handleControlType(event.type);
    }
    this.formGroup.patchValue(this.degreeObj);
  }

  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'degreeOveralInf',
    },
    {
      icon: 'icon-info',
      text: 'Thông tin thêm',
      name: 'degreeMoreInf',
    }
  ];

  async addFiles(evt){
    this.degreeObj.attachments = evt.data.length;
  }

  openFormUploadFile() {
    this.attachment.uploadFile();
  }

  setTitle(evt: any){
    this.headerText += " " +  evt;
    this.cr.detectChanges();
  }

  ngAfterViewInit() {
    // this.dialog &&
    //   this.dialog.closed.subscribe((res) => {
    //     if (!res.event) {
    //       if (this.successFlag) {
    //         this.dialog.close(this.degreeObj);
    //       } else {
    //         this.degreeObj.isSuccess = false;
    //         this.dialog.close(null);
    //       }
    //     }
    //   });
  }

  initForm() {
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((grvSetup) => {
        if (grvSetup) {
          let dataRequest = new DataRequest();
          dataRequest.comboboxName = grvSetup.TrainSupplierID.referedValue;
          dataRequest.pageLoading = false;

          this.hrService.loadDataCbx('HR', dataRequest).subscribe((data) => {
            if (data) {
              this.dataVllSupplier = JSON.parse(data[0]);
            }
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
                this.isNullFrom = false;
                this.isNullTo = false;
                this.degreeObj.employeeID = this.employId;
                this.formModel.currentData = this.degreeObj;
                this.formGroup.patchValue(this.degreeObj);
                this.isAfterRender = true;
                this.cr.detectChanges();
              } else {
                this.notify.notify('Error');
              }
            });
        } else {
          this.isNullFrom = true;
          this.isNullTo = true;
          if (
            this.actionType == 'copy' &&
            this.degreeObj.issuedDate.toString() == this.defaultIssueDate
          ) {
            this.degreeObj.issuedDate = null;
          }
          if (this.degreeObj.trainFromDate == null) this.isNullFrom = false;
          if (this.degreeObj.trainToDate == null) this.isNullTo = false;

          this.formGroup.patchValue(this.degreeObj);
          this.formModel.currentData = this.degreeObj;
          this.isAfterRender = true;
          this.cr.detectChanges();
        }
      });
  }

  onInit(): void {
    // if (this.degreeObj) {
    //   this.fromDateFormat = this.getFormatDate(this.degreeObj.trainFrom);
    //   this.toDateFormat = this.getFormatDate(this.degreeObj.trainTo);
    // } else {
    //   this.fromDateFormat = this.getFormatDate(null);
    //   this.toDateFormat = this.getFormatDate(null);
    // }

    if (this.degreeObj) {
      this.fromDateFormat = this.handleControlType(this.degreeObj.trainFrom);
      this.toDateFormat = this.handleControlType(this.degreeObj.trainTo);
    } else {
      this.fromDateFormat = 'd';
      this.toDateFormat = 'd';
    }
    if (!this.formModel)
      this.hrService.getFormModel(this.funcID).then((formModel) => {
        if (formModel) this.formModel = formModel;
        this.initForm();
      });
    else this.initForm();

    this.hrService.getHeaderText(this.funcID).then((res) => {
      this.fieldHeaderTexts = res;
    })
  }

  async onSaveForm() {
    this.degreeObj.employeeID = this.employId;
    
    let ddd = new Date();
    if(this.degreeObj.issuedDate > ddd.toISOString()){
      this.notify.notifyCode('HR014',0, this.fieldHeaderTexts['IssuedDate']);
      return;
    }

    if(this.degreeObj.trainTo && this.degreeObj.trainFrom){
      if (Number(this.degreeObj.trainTo) < Number(this.degreeObj.trainFrom)) {
        this.hrService.notifyInvalidFromTo(
          'TrainTo',
          'TrainFrom',
          this.formModel
          )
          return;
      }
    }

    // if(this.degreeObj.expiredDate && this.degreeObj.effectedDate){
    //   if (this.degreeObj.expiredDate < this.degreeObj.effectedDate) {
    //     this.hrService.notifyInvalidFromTo(
    //       'ExpiredDate',
    //       'EffectedDate',
    //       this.formModel
    //       )
    //       return;
    //   }
    // }
    if(this.formGroup.invalid){
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if(
      this.attachment.fileUploadList &&
      this.attachment.fileUploadList.length > 0
      ) {
      this.attachment.objectId=this.degreeObj?.recID;
      (await (this.attachment.saveFilesObservable())).subscribe(
      (item2:any)=>{
            debugger
          });
      }

    if (this.actionType === 'add' || this.actionType === 'copy') {
      if(this.actionType === 'add'){
        localStorage.setItem('add', JSON.stringify(this.degreeObj));
      }
      if(this.actionType === 'copy'){
        localStorage.setItem('copy', JSON.stringify(this.degreeObj));
      }
      
      this.hrService.AddEmployeeDegreeInfo(this.degreeObj).subscribe((p) => {
        if (p != null) {
          console.log(p);
          this.notify.notifyCode('SYS006');
          this.dialog && this.dialog.close(p);
        } else {
          this.notify.notifyCode('SYS023');
        }
      });
    } else {
      this.hrService
        .updateEmployeeDegreeInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
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
    } 
    // else {
    //   this.notify.notifyCode('Nhap thong tin noi dao tao');
    // }
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

  getFormatDate(trainFrom: string) {
    let resultDate = '';
    if (trainFrom) {
      let arrDate = trainFrom.split('/');
      resultDate =
        arrDate.length === 1 ? 'y' : arrDate.length === 2 ? 'm' : 'd';
      return resultDate;
    } else return (resultDate = 'y');
  }
}
