import { FormGroup } from '@angular/forms';
import { CodxHrService } from '../../codx-hr.service';
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
  selector: 'lib-popup-eappointions',
  templateUrl: './popup-eappointions.component.html',
  styleUrls: ['./popup-eappointions.component.css'],
})
export class PopupEappointionsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  EAppointionObj;
  //lstEAppointions;
  //indexSelected;
  headerText;
  successFlag = false;
  actionType;
  idField = 'RecID';
  funcID;
  isAfterRender = false;
  employId: string;
  genderGrvSetup: any;
  isUseEmployee: boolean;
  employeeObj: any;
  decisionNoDisable: boolean = false;
  autoNumField: string;
  @ViewChild('form') form: CodxFormComponent;
  //@ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.isUseEmployee = data?.data?.isUseEmployee;
    if(data?.data?.appointionObj)
      this.EAppointionObj = JSON.parse(JSON.stringify(data.data.appointionObj));

    if(data?.data?.empObj)
      this.employeeObj = JSON.parse(JSON.stringify(data.data.empObj));
    this.formModel = dialog.formModel;

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
          if (res)
          {
            debugger
            if (res.key) 
              this.autoNumField = res.key;
            this.EAppointionObj = res.data;
            this.EAppointionObj.effectedDate = null;
            if(this.employeeObj){
              this.EAppointionObj.employeeID = this.employeeObj.employeeID;
              this.EAppointionObj.orgUnitID = this.employeeObj.positionID;
              this.EAppointionObj.orgUnitID = this.employeeObj.orgUnitID;
              this.EAppointionObj.jobLevel = this.employeeObj.jobLevel;
              this.EAppointionObj.locationID = this.employeeObj.locationID;
            }
            this.formModel.currentData = this.EAppointionObj;
            this.formGroup.patchValue(this.EAppointionObj);
            this.isAfterRender = true;
            this.cr.detectChanges();
          }
        });
    } 
    else if (this.actionType === 'edit' || this.actionType === 'copy')
    {
      this.formGroup.patchValue(this.EAppointionObj);
      this.formModel.currentData = this.EAppointionObj;
      this.isAfterRender = true;
      this.cr.detectChanges();
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
        if (fieldName === 'SignerID') {
          this.hrService.loadData('HR', empRequest).subscribe((emp) => {
            if (emp[1] > 0) {
              let positionID = emp[0][0].positionID;

              if (positionID) {
                this.hrService.getPositionByID(positionID).subscribe((res) => {
                  if (res) {
                    this.EAppointionObj.signerPosition = res.positionName;
                    this.formGroup.patchValue({
                      signerPosition: this.EAppointionObj.signerPosition,
                    });
                    this.cr.detectChanges();
                  }
                });
              } else {
                this.EAppointionObj.signerPosition = null;
                this.formGroup.patchValue({
                  signerPosition: this.EAppointionObj.signerPosition,
                });
              }
              this.df.detectChanges();
            }
          });
        }
      }
      this.cr.detectChanges();
    });
  }

  onInit(): void {
    this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((fg) => {
        if (fg) {
          this.formGroup = fg;
          this.initForm();
        }
      });
    //Load data field gender from database
    this.cache
      .gridViewSetup('EmployeeInfomation', 'grvEmployeeInfomation')
      .subscribe((res) => {
        this.genderGrvSetup = res?.Gender;
      });

    //Update Employee Information when CRUD then render
    if (this.employId != null)
      this.getEmployeeInfoById(this.employId, 'employeeID');

  
  }

  handleSelectEmp(evt) {
    if (!!evt.data) {
      this.employId = evt.data;
      this.getEmployeeInfoById(this.employId, evt.field);
    } else {
      delete this.employeeObj;
    }
  }

  valueChange(event) {
    if (!event.data) {
      this.EAppointionObj.signerPosition = '';
      this.formGroup.patchValue({
        signerPosition: '',
      });
    }

    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'signerID': {
          let employee = event.data;

          if (employee) {
            this.getEmployeeInfoById(employee, 'SignerID');
          }
          break;
        }
      }

      this.cr.detectChanges();
    }
  }

  onSaveForm() {
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if (this.EAppointionObj.expiredDate && this.EAppointionObj.effectedDate) {
      if (this.EAppointionObj.expiredDate < this.EAppointionObj.effectedDate) {
        this.hrService.notifyInvalidFromTo(
          'ExpiredDate',
          'EffectedDate',
          this.formModel
        );
        return;
      }
    }

    // if (this.actionType === 'copy' || this.actionType === 'add') {
    //   delete this.EAppointionObj.recID;
    // }
    this.EAppointionObj.employeeID = this.employId;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService
        .AddEmployeeAppointionsInfo(this.EAppointionObj)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS006');
            // this.successFlag = true;
            this.dialog && this.dialog.close(p);
            p.emp = this.employeeObj;
          } else this.notify.notifyCode('SYS023');
        });
    } else {
      this.hrService
        .UpdateEmployeeAppointionsInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.dialog && this.dialog.close(this.EAppointionObj);

            // this.lstEAppointions[this.indexSelected] = p;
            // if (this.listView) {
            //   (this.listView.dataService as CRUDService)
            //     .update(this.lstEAppointions[this.indexSelected])
            //     .subscribe();
            // }
            // this.dialog.close(this.data)
          } else this.notify.notifyCode('SYS021');
        });
    }
  }
}
