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
  funcID: string;
  idField: string = 'recID';
  actionType;
  data;
  isAfterRender = false;
  @ViewChild('listView') listView: CodxListviewComponent;
  @ViewChild('form') form: CodxFormComponent;

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
    this.formModel = dialog?.FormModel;
    this.headerText = data?.data?.headerText;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.funcID = data?.data?.funcID;

    this.accidentObj = JSON.parse(JSON.stringify(data?.data?.accidentObj));
  }

  onInit(): void {
    if (!this.formModel) {
      this.hrSevice.getFormModel(this.funcID).then((formModel) => {
        if (formModel) {
          this.formModel = formModel;
          this.hrSevice
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
      this.hrSevice
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
    }
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
    if(this.formGroup.invalid){
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrSevice.AddEmployeeAccidentInfo(this.accidentObj).subscribe((p) => {
        if (p != null) {
          this.accidentObj = p;
          this.notitfy.notifyCode('SYS006');
          this.dialog && this.dialog.close(p)
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

}
