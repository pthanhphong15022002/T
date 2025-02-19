import { FormGroup } from '@angular/forms';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { Injector, ChangeDetectorRef } from '@angular/core';
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

@Component({
  selector: 'lib-popup-eawards',
  templateUrl: './popup-eawards.component.html',
  styleUrls: ['./popup-eawards.component.css'],
})
export class PopupEAwardsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  // formGroup: FormGroup;
  dialog: DialogRef;
  awardObj;
  employeeName: string;
  isMultiCopy: boolean = false;
  actionType;
  headerText: '';
  idField = 'RecID';
  originEmpID = '';
  originEmpBeforeSelectMulti: any;

  employId;
  empObj;
  valueYear;
  disabledInput = false;

  // isAfterRender = false;
  defaultAwardDate: string = '0001-01-01T00:00:00';
  autoNumField: string;
  @ViewChild('form') form: CodxFormComponent;
  // @ViewChild('listView') listView: CodxListviewComponent;

  fromListView: boolean = false; //check where to open the form
  // genderGrvSetup: any;
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
    this.actionType = data?.data?.actionType;

    if (this.awardObj?.employeeID && this.fromListView) {
      this.employId = this.awardObj?.employeeID;
    } else {
      this.employId = data?.data?.employeeId;
    }

    if (this.awardObj?.emp && this.fromListView) {
      this.empObj = this.awardObj?.emp;
    } else {
      this.empObj = data?.data?.empObj;
    }

    if(this.actionType == 'view'){
      this.disabledInput = true;
    }
    else if(this.actionType == 'copyMulti'){
      this.isMultiCopy = true;
      this.originEmpID = this.employId;
      this.originEmpBeforeSelectMulti = this.empObj;

    }
    this.fromListView = data?.data?.fromListView;
    this.formModel = this.dialog.formModel;
    if (data?.data?.dataInput) {
      this.awardObj = JSON.parse(JSON.stringify(data?.data?.dataInput));
    }
    if (this.awardObj) {
      this.valueYear = this.awardObj.inYear;
    }

  }

  allowToViewEmp(): boolean {
    //check if show emp info or not
    if (this.actionType == 'edit') {
      if (this.fromListView) return true;
      else return false;
    }
    if (this.actionType == 'copy') {
      if (this.fromListView) return true;
      else return false;
    }
    if (this.actionType == 'add') {
      if (this.fromListView) return true; // add new from list view
      else return false;
    }
    return true;
  }
  handleSelectEmp(evt) {
    switch (evt?.field) {
      case 'employeeID': //check if employee changed
        if (evt?.data && evt?.data.length > 0) {
          this.employId = evt?.data;
          this.getEmployeeInfoById(this.employId, evt?.field);
        } else {
          delete this.employId;
          delete this.empObj;
          this.form.formGroup.patchValue({
            employeeID: this.awardObj.employeeID,
          });
        }
        break;
      case 'signerID': // check if signer changed
        if (evt?.data && evt?.data.length > 0) {
          this.getEmployeeInfoById(evt?.data, evt?.field);
        } else {
          delete this.awardObj?.signerID;
          // delete this.awardObj.signer;
          // delete this.awardObj?.signerPosition;
          this.form.formGroup.patchValue({
            signerID: null,
            // signer: null,
            // signerPosition: null,
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
        if (fieldName === 'employeeID') {
          this.empObj = emp[0][0];
          this.hrService
            .getOrgUnitID(this.empObj?.orgUnitID ?? this.empObj?.emp?.orgUnitID)
            .subscribe((res) => {
              this.empObj.orgUnitName = res.orgUnitName;
            });
        } else if (fieldName === 'signerID') {
          this.awardObj.signer = emp[0][0]?.employeeName;
          if (emp[0][0]?.positionID) {
            this.hrService
              .getPositionByID(emp[0][0]?.positionID)
              .subscribe((res) => {
                if (res) {
                  this.awardObj.signerPosition = res.positionName;
                  this.form.formGroup.patchValue({
                    signer: this.awardObj.signer,
                    signerPosition: this.awardObj.signerPosition,
                  });
                  this.cr.detectChanges();
                }
              });
          } else {
            this.awardObj.signerPosition = null;
            this.form.formGroup.patchValue({
              signer: this.awardObj.signer,
              signerPosition: this.awardObj.signerPosition,
            });
          }
        }
      }
      this.cr.detectChanges();
    });
  }

  initForm() {
    this.hrService
      .getOrgUnitID(this.empObj?.orgUnitID ?? this.empObj?.emp?.orgUnitID)
      .subscribe((res) => {
        if (res?.orgUnitName) {
          this.empObj.orgUnitName = res.orgUnitName;
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
            if (res.key) {
              this.autoNumField = res.key;
            }

            this.awardObj = res?.data;
            if (this.awardObj.awardDate.toString() == this.defaultAwardDate)
              this.awardObj.awardDate = null;
            this.awardObj.employeeID = this.employId;
            // this.formModel.currentData = this.awardObj;
            // this.form.formGroup.patchValue(this.awardObj);
            // this.isAfterRender = true;
            this.cr.detectChanges();
          }
        });
    } else {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res) => {
          if (res) {
            this.autoNumField = res.key ? res.key : null}
        })
      if (
        this.actionType === 'copy' &&
        this.awardObj.awardDate == this.defaultAwardDate
      )
        this.awardObj.awardDate = null;
      // this.form.formGroup.patchValue(this.awardObj);
      // this.formModel.currentData = this.awardObj;
      // this.isAfterRender = true;
      this.cr.detectChanges();
    }
  }

  onInit(): void {
    this.initForm();

    // this.hrService
    //   .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
    //   .then((fg) => {
    //     if (fg) {
    //       this.form.formGroup = fg;
    //       this.initForm();
    //     }
    //   });

    // this.cache
    //   .gridViewSetup('EmployeeInfomation', 'grvEmployeeInfomation')
    //   .subscribe((res) => {
    //     this.genderGrvSetup = res?.Gender;
    //   });

    if (this.employId != null)
      this.getEmployeeInfoById(this.employId, 'employeeID');
  }

  onSaveForm() {
    this.form.formGroup.patchValue(this.formModel.currentData);
    if (this.form.formGroup.invalid) {
      this.hrService.notifyInvalid(this.form.formGroup, this.formModel);
      this.form.validation(false)
      return;
    }

    //Check valid
    // if (this.form.formGroup.invalid) {
    //   this.hrService.notifyInvalid(this.form.formGroup, this.formModel);
    //   return;
    // }
    if (this.actionType === 'copy') delete this.awardObj.recID;

    if(this.actionType == 'copyMulti'){
      this.hrService.AddMultiEAwardInfo(this.form.data).subscribe((res) => {
        debugger

        if(res.length > 0){
          let returnVal = [];
          for(let i = 0; i<res.length; i++){
            if(res[i].employeeID == this.originEmpID){
              returnVal.push(res[i]);
            }
          }
          if(returnVal){
            returnVal[0].emp = this.originEmpBeforeSelectMulti;
            this.dialog && this.dialog.close(returnVal);
          }
          else{
            this.dialog && this.dialog.close();
          }
        }
        else{
          this.dialog && this.dialog.close();
        }

        // if(res == true){
        //   this.notify.notifyCode('SYS006');
        //   this.dialog && this.dialog.close();
        // }
      })
    }
    else{
      if (this.actionType === 'add' || this.actionType === 'copy') {
        this.hrService
          .AddEmployeeAwardInfo(this.formModel.currentData)
          .subscribe((p) => {
            if (p != null) {
              this.notify.notifyCode('SYS006');
              p[0].emp = this.empObj;
              this.dialog && this.dialog.close(p);
            } else this.notify.notifyCode('SYS023');
            this.awardObj.isSuccess = true;
          });
      } else {
        this.hrService
          .UpdateEmployeeAwardInfo(this.formModel.currentData)
          .subscribe((p) => {
            if (p != null) {
              this.notify.notifyCode('SYS007');
              p[0].emp = this.empObj;
              this.dialog && this.dialog.close(p);
            } else this.notify.notifyCode('SYS021');
          });
      }
    }
  }

  handleSelectAwardDate(event) {
    this.awardObj.inYear = new Date(event.data).getFullYear();
    this.valueYear = this.awardObj.inYear;
  }

  inYearSelect(event) {
    this.awardObj.inYear = new Date(event.value).getFullYear();
    this.form.formGroup.patchValue(this.awardObj);
  }

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'awardID': {
          let award = event?.component?.itemsSelected[0];
          if (award) {
            if (award?.AwardFormCategory) {
              this.awardObj.awardFormCategory = award?.AwardFormCategory;

              this.form.formGroup.patchValue({
                awardFormCategory: this.awardObj.awardFormCategory,
              });
            }

            if (award?.AwardLevelCategory) {
              this.awardObj.awardLevelCategory = award?.AwardLevelCategory;

              this.form.formGroup.patchValue({
                awardLevelCategory: this.awardObj.awardLevelCategory,
              });
            }
          }
          break;
        }
        // case 'signerID': {
        //   this.awardObj[event.field] = event.data?.value[0];
        //   this.form.formGroup.patchValue({
        //     [event.field]: this.awardObj[event.field],
        //   });

        //   // let employee = event.data?.dataSelected[0]?.dataSelected[0];
        //   let employee = event.data?.dataSelected[0]?.dataSelected;

        //   if (employee) {
        //     this.awardObj.signer = employee.EmployeeName;
        //     this.employeeName = employee.EmployeeName;

        //     this.form.formGroup.patchValue({ signer: this.awardObj.signer });
        //     if (employee.PositionID) {
        //       this.hrService
        //         .getPositionByID(employee.PositionID)
        //         .subscribe((res) => {
        //           if (res) {
        //             this.awardObj.signerPosition = res.positionName;
        //             this.form.formGroup.patchValue({
        //               signerPosition: this.awardObj.signerPosition,
        //             });
        //             this.cr.detectChanges();
        //           }
        //         });
        //     } else {
        //       this.awardObj.signerPosition = null;
        //       this.form.formGroup.patchValue({
        //         signerPosition: this.awardObj.signerPosition,
        //       });
        //     }
        //   }
        //   break;
        // }
      }
      this.cr.detectChanges();
    }
  }
}
