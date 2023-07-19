import { CodxHrService } from './../../codx-hr.service';
import { ChangeDetectorRef, Injector } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DataRequest,
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
  disabledInput = false;
  idField = 'RecID';
  employeeObj;
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
    this.benefitObj = JSON.parse(JSON.stringify(data?.data?.benefitObj));
    console.log('benefit obj nhan dc la', this.benefitObj);

    // this.indexSelected =
    //   data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;
    this.actionType = data?.data?.actionType;
    if(this.actionType == 'view'){
      this.disabledInput = true;
    }
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
            console.log('get default benefit', res);

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
      if (this.actionType === 'edit' || this.actionType === 'copy' || this.actionType ==='view') {
        this.formGroup.patchValue(this.benefitObj);
        this.formModel.currentData = this.benefitObj;
        this.isAfterRender = true;
        this.cr.detectChanges();
      }
    }
  }

  onSaveForm() {
    this.benefitObj.employeeID = this.employId;
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    this.formGroup.patchValue({ benefitID: this.benefitObj.benefitID }); // test combobox chua co
    this.formGroup.patchValue({ employeeID: this.benefitObj.employeeID });
    if (this.benefitObj.expiredDate < this.benefitObj.effectedDate) {
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
        debugger
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

    //change employee
    handleSelectEmp(evt) {
      switch (evt?.field) {
        case 'signerID': // check if signer changed
          if (evt?.data && evt?.data.length > 0) {
            this.getEmployeeInfoById(evt?.data, evt?.field);
          } else {
            this.formGroup.patchValue({
              signerID: null,
              signerPosition: null,
            });
          }
          break;
      }
    }

    getEmployeeInfoById(empId: string, fieldName: string) {
      let empRequest = new DataRequest();
      empRequest.entityName = 'HR_Employees';
      empRequest.dataValues = empId;
      empRequest.predicates = 'EmployeeID=@0';
      empRequest.pageLoading = false;
      this.hrService.loadData('HR', empRequest).subscribe((emp) => {
        if (emp[1] > 0) {
          if (fieldName === 'employeeID') this.employeeObj = emp[0][0];
          else if (fieldName === 'signerID') {
            if (emp[0][0]?.positionID) {
              this.hrService
                .getPositionByID(emp[0][0]?.positionID)
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
        }
        this.cr.detectChanges();
      });
    }

  valueChange(event) {
    debugger
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
