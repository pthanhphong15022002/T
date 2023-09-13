import { FormGroup } from '@angular/forms';
import { CodxHrService } from '../../codx-hr.service';
import { Injector, ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';

import {
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

@Component({
  selector: 'lib-popup-eskills',
  templateUrl: './popup-eskills.component.html',
  styleUrls: ['./popup-eskills.component.css'],
})
export class PopupESkillsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  skillObj;
  lstSkills;
  actionType;
  idField = 'RecID';
  employId;
  isAfterRender = false;
  headerText: '';
  ops = ['d','m', 'y'];
  result;
  fromDateFormat;
  toDateFormat;
  headerTextCalendar: any = [];
  isNullFrom : boolean = true;
  disabledInput = false;

  initValueTrainFromDate :any;
  initValueTrainToDate :any;

  isNullTo: boolean = true;

  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType;
    if(this.actionType == 'view'){
      this.disabledInput = true;
    }
    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
    this.skillObj = JSON.parse(JSON.stringify(data?.data.dataInput));
    console.log('skill obj nhan vao', this.skillObj);
    
    this.headerTextCalendar[0] = data?.data?.trainFromHeaderText;
    this.headerTextCalendar[1] = data?.data?.trainToHeaderText;
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
            console.log(this.employId);

            this.skillObj = res?.data;
            this.skillObj.employeeID = this.employId;
            this.formModel.currentData = this.skillObj;
            this.formGroup.patchValue(this.skillObj);
            this.isAfterRender = true;
            this.isNullFrom = false;
            this.isNullTo = false;
            this.cr.detectChanges();
          }
        });
    } else {
      this.isNullFrom = true;
      this.isNullTo = true;
      if (this.actionType === 'edit' || this.actionType === 'copy' || this.actionType === 'view') {
        this.formGroup.patchValue(this.skillObj);
        this.formModel.currentData = this.skillObj;
        this.isAfterRender = true;
        this.cr.detectChanges();
        if(this.skillObj.trainFromDate == null)
          this.isNullFrom = false;
        if(this.skillObj.trainToDate == null)
          this.isNullTo = false;
      }
    }

  }

  onInit(): void {
    if (this.skillObj) {
      this.fromDateFormat = this.handleControlType(this.skillObj.trainFrom);
      this.toDateFormat = this.handleControlType(this.skillObj.trainTo);
    } else {
      this.fromDateFormat = 'd';
      this.toDateFormat = 'd';
    }
    if (!this.formModel) {
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
    } else {
      this.hrService
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
    }
  }

  onSaveForm() {
    this.formGroup.patchValue({
      trainFromDate: new Date(),
      trainToDate: new Date(),
    });
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      this.form.validation(false)

      return;
    }
    console.log('data chuan bi luu', this.skillObj);

    if(this.skillObj.trainTo && this.skillObj.trainFrom){
      if (Number(this.skillObj.trainTo) < Number(this.skillObj.trainFrom)) {
        this.hrService.notifyInvalidFromTo(
          'TrainTo',
          'TrainFrom',
          this.formModel
          )
          return;
      }
    }
    
    this.skillObj.employeeID = this.employId;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.addESlkillInfo(this.skillObj).subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS006');
          this.dialog && this.dialog.close(p);
        } else {
          // this.notify.notifyCode('SYS023');
        }
      });
    } else {
      this.hrService.updateEskillInfo(this.skillObj).subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS007');
          this.dialog && this.dialog.close(p);
        } else {
          this.notify.notifyCode('SYS021');
        }
      });
    }
  }

  // afterRenderListView(evt) {
  //   this.listView = evt;
  //   console.log(this.listView);
  // }

  Date(date) {
    return new Date(date);
  }

  // changeCalendar(event, changeType: string) {
  //   debugger
  //   let yearFromDate = event.fromDate.getFullYear();
  //   let monthFromDate = event.fromDate.getMonth() + 1;
  //   let dayFromDate = event.fromDate.getDate();
  //   var strYear = `${yearFromDate}`;
  //   var strMonth = `${yearFromDate}/${monthFromDate}`;
  //   var strDay = `${yearFromDate}/${monthFromDate}/${dayFromDate}`;
  //   // console.log('asdsadasdasdasdsad', strYear, strMonth, strDay);

  //   if (changeType === 'FromDate') {
  //     if (event.type === 'year') {
  //       this.skillObj.trainFrom = strYear;
  //     } else if (event.type === 'month') {
  //       this.skillObj.trainFrom = strMonth;
  //     } else {
  //       this.skillObj.trainFrom = strDay;
  //     }
  //     this.skillObj.trainFromDate = event.fromDate;
  //   } else if (changeType === 'ToDate') {
  //     if (event.type === 'year') {
  //       this.skillObj.trainTo = strYear;
  //     } else if (event.type === 'month') {
  //       this.skillObj.trainTo = strMonth;
  //     } else {
  //       this.skillObj.trainTo = strDay;
  //     }
  //     this.skillObj.trainToDate = event.fromDate;
  //   }
  //   this.formGroup.patchValue(this.skillObj);
  //   if (this.skillObj) {
  //     this.fromDateFormat = this.getFormatDate(this.skillObj.trainFrom);
  //     this.toDateFormat = this.getFormatDate(this.skillObj.trainTo);
  //   } else {
  //     this.fromDateFormat = this.getFormatDate(null);
  //     this.toDateFormat = this.getFormatDate(null);
  //   }
  // }

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

  changeCalendar(event, changeType: string) {
    debugger
    if (changeType === 'FromDate') {
      this.skillObj.trainFrom = event.type;
      this.skillObj.trainFromDate = event.fromDate;
      this.fromDateFormat = this.handleControlType(event.type);
    } else if (changeType === 'ToDate') {
      this.skillObj.trainTo = event.type;
      this.skillObj.trainToDate = event.fromDate;
      this.toDateFormat = this.handleControlType(event.type);
    }
    this.formGroup.patchValue(this.skillObj);
  }
  // getFormatDate(trainFrom: string) {
  //   let resultDate = '';
  //   if (trainFrom) {
  //     let arrDate = trainFrom.split('/');
  //     resultDate =
  //       arrDate.length === 1 ? 'y' : arrDate.length === 2 ? 'm' : 'd';
  //     return resultDate;
  //   } else return (resultDate = 'y');
  // }
}
