import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
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
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-popup-evisas',
  templateUrl: './popup-evisas.component.html',
  styleUrls: ['./popup-evisas.component.css'],
})
export class PopupEVisasComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  lstVisas: any;
  visaObj;
  actionType;
  headerText: '';
  funcID;
  idField = 'RecID';
  indexSelected;
  employId;
  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;
  // @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    private codxShareService: CodxShareService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    this.employId = data?.data?.employeeId;
    this.visaObj = JSON.parse(JSON.stringify(data?.data?.visaObj));
  }

  ngAfterViewInit() {}

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
            this.visaObj = res?.data;
            this.visaObj.employeeID = this.employId;
            //xét null cho field dateTime required
            this.visaObj.effectedDate = null;
            this.visaObj.expiredDate = null;

            this.formModel.currentData = this.visaObj;
            this.formGroup.patchValue(this.visaObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        if (this.actionType == 'copy') {
          if (this.visaObj.effectedDate == '0001-01-01T00:00:00') {
            this.visaObj.effectedDate = null;
          }
          if (this.visaObj.expiredDate == '0001-01-01T00:00:00') {
            this.visaObj.expiredDate = null;
          }
        }
        this.formGroup.patchValue(this.visaObj);
        this.formModel.currentData = this.visaObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }

  onInit(): void {
    if (!this.formGroup)
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
    else
      this.hrService
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
  }

  onSaveForm() {
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.AddEmployeeVisaInfo(this.visaObj).subscribe((p) => {
        if (p != null) {
          this.visaObj.recID = p.recID;
          this.notify.notifyCode('SYS007');
          this.dialog && this.dialog.close(p);
        } else this.notify.notifyCode('SYS023');
      });
    } else {
      this.hrService
        .updateEmployeeVisaInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  click(data) {
    this.visaObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.visaObj));
    this.indexSelected = this.lstVisas.findIndex(
      (p) => p.recID == this.visaObj.recID
    );
    this.actionType = 'edit';
    this.formGroup?.patchValue(this.visaObj);
    this.cr.detectChanges();
  }
}
