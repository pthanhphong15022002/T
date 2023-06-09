import { CodxHrService } from './../../codx-hr.service';
import { ChangeDetectorRef, Injector } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-popup-ebenefit',
  templateUrl: './popup-ebenefit.component.html',
  styleUrls: ['./popup-ebenefit.component.css'],
})
export class PopupEbenefitComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  benefitObj;
  //listBenefits;
  //indexSelected;
  employId: string;
  isAfterRender = false;
  successFlag = false;
  actionType: string;
  idField = 'RecID';
  headerText: '';
  funcID: string;

  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.employId = data?.data?.employeeId;
    this.funcID = data?.data?.funcID;
    this.formModel = dialog?.formModel;
    // this.benefitObj = JSON.parse(JSON.stringify(this.benefitObj));
    this.benefitObj = data?.data?.benefitObj;
    console.log('benefit obj nhan dc la', this.benefitObj);

    // this.indexSelected =
    //   data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;
    this.actionType = data?.data?.actionType;
    //this.listBenefits = data?.data?.listBenefits;
    this.headerText = data?.data?.headerText;
    // if (this.actionType === 'edit' || this.actionType === 'copy') {
    //   this.benefitObj = JSON.parse(
    //     JSON.stringify(this.listBenefits[this.indexSelected])
    //   );
    //   this.benefitObj = JSON.parse(JSON.stringify(this.benefitObj));
    // }
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

  // ngAfterViewInit() {
  //   this.dialog &&
  //     this.dialog.closed.subscribe((res) => {
  //       if (!res.event) {
  //         if (this.successFlag == true) {
  //           this.dialog.close(this.benefitObj);
  //         } else {
  //           this.dialog.close(null);
  //         }
  //       }
  //     });
  // }

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
            this.benefitObj = res?.data;
            this.benefitObj.effectedDate = null;
            this.benefitObj.expiredDate = null;
            this.benefitObj.employeeID = this.employId;
            this.formModel.currentData = this.benefitObj;
            this.formGroup.patchValue(this.benefitObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.benefitObj);
        this.formModel.currentData = this.benefitObj;
        this.isAfterRender = true;
        this.cr.detectChanges();
      }
    }
  }

  onSaveForm() {
    this.benefitObj.employeeID = this.employId;
    this.formGroup.patchValue({ benefitID: this.benefitObj.benefitID }); // test combobox chua co
    if (this.benefitObj.expiredDate < this.benefitObj.effectedDate) {
      // this.notify.notifyCode('HR002');
      this.hrService.notifyInvalidFromTo(
        'ExpiredDate',
        'EffectedDate',
        this.formModel
      );
      return;
    }

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.AddEBenefit(this.benefitObj).subscribe((p) => {
        if (p != null) {
          console.log('sau khi them moi benefit', p);
          if (p.length > 1) {
            this.benefitObj.recID = p[1].recID;
          } else this.benefitObj.recID = p[0].recID;
          this.notify.notifyCode('SYS006');
          this.successFlag = true;
          this.dialog && this.dialog.close(this.benefitObj);

          //this.benefitObj.push(JSON.parse(JSON.stringify(this.benefitObj)));
          // if(this.listView){
          //   (this.listView.dataService as CRUDService).add(this.benefitObj).subscribe();
          // }
          // this.hrService
          //   .GetCurrentBenefit(this.benefitObj.employeeID)
          //   .subscribe((res) => {
          //     //this.listBenefits = res;
          //     this.dialog && this.dialog.close(p);
          //   });
        }
      });
    } else {
      this.hrService.EditEBenefit(this.formModel.currentData).subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS007');
          this.dialog && this.dialog.close(this.benefitObj);
          //this.listBenefits[this.indexSelected] = p;
          // if(this.listView){
          //   (this.listView.dataService as CRUDService).update(this.lstPassports[this.indexSelected]).subscribe()
          // }
          // this.dialog.close(this.data)
        }
      });
    }
  }

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'SignerID': {
          let employee = event?.component?.itemsSelected[0];
          if (employee) {
            if (employee?.PositionID) {
              this.hrService
                .getPositionByID(employee.PositionID)
                .subscribe((res) => {
                  if (res) {
                    this.benefitObj.signerPosition = res.positionName;
                    this.formGroup.patchValue({
                      signerPosition: this.benefitObj.signerPosition,
                    });
                    this.cr.detectChanges();
                  }
                });
            } else {
              this.benefitObj.signerPosition = null;
              this.formGroup.patchValue({
                signerPosition: this.benefitObj.signerPosition,
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
