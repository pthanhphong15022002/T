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
  LayoutAddComponent,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'lib-popup-eaccidents',
  templateUrl: './popup-eaccidents.component.html',
  styleUrls: ['./popup-eaccidents.component.css'],
})
export class PopupEaccidentsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  grvSetup;
  headerText: '';
  dialog: DialogRef;
  accidentObj;
  employeeId: string;
  idField: string = 'recID';
  actionType;
  disabledInput = false;

  data;
  isAfterRender = false;
  @ViewChild('listView') listView: CodxListviewComponent;
  @ViewChild('form') form: LayoutAddComponent;

  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'overallInfo',
    },
    {
      icon: 'icon-info',
      text: 'Giám định y khoa',
      name: 'hospitalCheck',
    },
  ];

  constructor(
    private cr: ChangeDetectorRef,
    private injector: Injector,
    private notitfy: NotificationsService,
    private hrSevice: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    if(this.actionType == 'view'){
      this.disabledInput = true;
    }
    this.funcID = data?.data?.funcID;

    this.accidentObj = JSON.parse(JSON.stringify(data?.data?.accidentObj));
  }

  onInit(): void {
    if (!this.formModel) {
      this.hrSevice.getFormModel(this.funcID).then((formModel) => {
        if (formModel) {
          this.formModel = formModel;
          this.hrSevice
            .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
            .then((fg) => {
              if (fg) {
                this.formGroup = fg;
                this.initForm();
              }
            });
        }
      });
    } else {
      this.hrSevice
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
    }
    if (this.formModel) {
      this.cache
        .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
        .subscribe((grv) => {
          this.grvSetup = grv;
        });
    }
  }

  setTitle(evt: any){
    this.headerText += " " +  evt;
    this.cr.detectChanges();
  }


  initForm() {
    if (this.actionType == 'add') {
      this.hrSevice
        .getDataDefault(this.funcID, this.formModel.entityName, this.idField)
        .subscribe((res) => {
          if (res && res.data) {
            this.accidentObj = res.data;
            this.accidentObj.employeeID = this.employeeId;
            this.formModel.currentData = this.accidentObj;
            this.formGroup.patchValue(this.accidentObj);
            this.isAfterRender = true;
            this.cr.detectChanges();
          }
        });
    } else {
      this.formModel.currentData = this.accidentObj;
      this.formGroup.patchValue(this.accidentObj);
      this.isAfterRender = true;
    }
  }

  onSaveForm() {
    this.accidentObj.employeeID = this.employeeId;
    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      this.form.form.validation(false)

      return;
    }
    // if (this.accidentObj.accidentDate) {
    //   if (this.compareToDate(this.accidentObj.accidentDate)) {
    //     let toDate =  new Date().toLocaleDateString('en-AU');;
    //     let header = this.grvSetup['AccidentDate']?.headerText ??'AccidentDate';
    //     this.notitfy.notifyCode(
    //       'HR003',
    //       0,
    //       '"' + toDate + '"',
    //       '"' + header + '"'
    //     );
    //     return;
    //   }
    // }
    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrSevice.AddEmployeeAccidentInfo(this.accidentObj).subscribe((p) => {
        if (p != null) {
          this.accidentObj = p;
          this.notitfy.notifyCode('SYS006');
          this.dialog && this.dialog.close(p);
        } else this.notitfy.notifyCode('SYS023');
      });
    } else {
      this.hrSevice
        .UpdateEmployeeAccidentInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.accidentObj = p;
            this.notitfy.notifyCode('SYS007');
            this.dialog && this.dialog.close(p);
          } else this.notitfy.notifyCode('SYS021');
        });
    }
  }

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  compareToDate(date: any) {
    var compareDate = new Date(date).getTime();
    var toDate = new Date().getTime();
    return compareDate > toDate;
  }
}
