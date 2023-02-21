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
import { I } from '@angular/cdk/keycodes';

@Component({
  selector: 'lib-popup-eawards',
  templateUrl: './popup-eawards.component.html',
  styleUrls: ['./popup-eawards.component.css'],
})
export class PopupEAwardsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  awardObj;
  employeeName: string;

  actionType;
  headerText: '';
  funcID;
  idField = 'RecID';
  employId;
  valueYear;
  isAfterRender = false;
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
    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
 
    this.awardObj = JSON.parse(JSON.stringify(data?.data?.dataInput));
      

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
            this.awardObj = res?.data;
            this.awardObj.employeeID = this.employId;
            this.formModel.currentData = this.awardObj;
            this.formGroup.patchValue(this.awardObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.awardObj);
        this.formModel.currentData = this.awardObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
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
    //Check SignerID
    if (this.awardObj.signerID && 
      this.awardObj.signer.replace(/\s/g, '') !=
      this.employeeName.replace(/\s/g, '')
    ) {
      this.awardObj.signerID = null;
      this.formGroup.patchValue({ signerID: this.awardObj.signerID });
    }

    //Check valid
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    } 
    this.awardObj.employeeID = this.employId;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.AddEmployeeAwardInfo(this.formModel.currentData).subscribe((p) => {
        if (p != null) {
          this.awardObj = p;
          this.notify.notifyCode('SYS006');
          this.dialog && this.dialog.close(this.awardObj);
        } else this.notify.notifyCode('SYS023');
      });
    } else {
      this.hrService
        .UpdateEmployeeAwardInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }


  handleSelectAwardDate(event) {
    this.awardObj.inYear = new Date(event.data).getFullYear();
    this.valueYear = this.awardObj.inYear;
  }

  inYearSelect(event) {
    this.awardObj.inYear = new Date(event.value).getFullYear();
    console.log('cap nhat inyear', this.awardObj.inYear);
  }

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'awardID': {
          let award = event?.component?.itemsSelected[0];
          if (award) {
            if (award?.AwardFormCategory) {
              this.awardObj.awardFormCategory = award?.AwardFormCategory;

              this.formGroup.patchValue({
                awardFormCategory: this.awardObj.awardFormCategory,
              });
            }

            if (award?.AwardLevelCategory) {
              this.awardObj.awardLevelCategory = award?.AwardLevelCategory;

              this.formGroup.patchValue({
                awardLevelCategory: this.awardObj.awardLevelCategory,
              });
            }
          }
          break;
        }
        case 'signerID': {
          this.awardObj[event.field] = event.data?.value[0];
          this.formGroup.patchValue({
            [event.field]: this.awardObj[event.field],
          });

          let employee = event.data?.dataSelected[0]?.dataSelected[0];
          if (employee) {
            this.awardObj.signer = employee.EmployeeName;
            this.employeeName = employee.EmployeeName;

            this.formGroup.patchValue({ signer: this.awardObj.signer });
            if (employee.PositionID) {
              this.hrService
                .getPositionByID(employee.PositionID)
                .subscribe((res) => {
                  if (res) {
                    this.awardObj.signerPosition = res.positionName;
                    this.formGroup.patchValue({
                      signerPosition: this.awardObj.signerPosition,
                    });
                    this.cr.detectChanges();
                  }
                });
            } else {
              this.awardObj.signerPosition = null;
              this.formGroup.patchValue({
                signerPosition: this.awardObj.signerPosition,
              });
            }
          }
          break;
        }
      }
      this.cr.detectChanges();
    }
  }
}
