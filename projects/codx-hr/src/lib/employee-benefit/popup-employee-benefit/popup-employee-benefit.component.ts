import { CodxHrService } from './../../codx-hr.service';
import { ChangeDetectorRef, Injector } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { FormGroup } from '@angular/forms';
import moment from 'moment';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'lib-popup-employee-benefit',
  templateUrl: './popup-employee-benefit.component.html',
  styleUrls: ['./popup-employee-benefit.component.css'],
})
export class PopupEmployeeBenefitComponent
  extends UIComponent
  implements OnInit
{
  console = console;
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  idField = 'RecID';
  currentEJobSalaries: any;
  funcID: string;
  lstJobSalaries;
  actionType: string;
  employeeId: string;
  isAfterRender = false;
  headerText: string;
  employeeObj: any;
  useForQTNS: boolean = false;
  // decisionNoDisable: boolean = false;
  autoNumField: string;
  data: any;
  loaded: boolean = false;
  employeeSign;
  moment = moment;
  dateNow = moment().format('YYYY-MM-DD');
  // @ViewChild('form') form: CodxFormComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    private df: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.funcID = data?.data?.funcID;
    this.employeeId = data?.data?.employeeId;
    this.headerText = data?.data?.headerText;
    this.useForQTNS = data?.data?.useForQTNS;
    if (data.data.empObj) {
      this.employeeObj = JSON.parse(JSON.stringify(data?.data?.empObj));
    }
    this.actionType = data?.data?.actionType;
    this.currentEJobSalaries = JSON.parse(JSON.stringify(data?.data?.dataObj));
  }

  initForm() {
    this.hrSevice
      .getOrgUnitID(
        this.employeeObj?.orgUnitID ?? this.employeeObj?.emp?.orgUnitID
      )
      .subscribe((res) => {
        if (res.orgUnitName) {
          this.employeeObj.orgUnitName = res.orgUnitName;
        }
      });

    this.hrSevice
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        if (item) {
          this.formGroup = item;
          if (this.actionType == 'add') {
            this.hrSevice
              .getDataDefault(
                this.formModel.funcID,
                this.formModel.entityName,
                this.idField
              )
              .subscribe((res) => {
                if (res) {
                  if (res.key) {
                    this.autoNumField = res.key;
                  }

                  this.currentEJobSalaries = res?.data;
                  if (
                    this.currentEJobSalaries.effectedDate ==
                    '0001-01-01T00:00:00'
                  ) {
                    this.currentEJobSalaries.effectedDate = null;
                  }
                  this.currentEJobSalaries.employeeID = this.employeeId;
                  this.currentEJobSalaries.effectedDate = null;
                  this.currentEJobSalaries.expiredDate = null;
                  this.formModel.currentData = this.currentEJobSalaries;
                  this.formGroup.patchValue(this.currentEJobSalaries);
                  this.isAfterRender = true;
                  this.cr.detectChanges();
                }
              });
          } else {
            if (this.actionType === 'edit' || this.actionType === 'copy') {
              if (this.actionType === 'copy') {
                if (
                  this.currentEJobSalaries.effectedDate == '0001-01-01T00:00:00'
                ) {
                  this.currentEJobSalaries.effectedDate = null;
                }
              }

              if (this.currentEJobSalaries.signerID) {
                this.getEmployeeInfoById(
                  this.currentEJobSalaries.signerID,
                  'SignerID'
                );
              }
              this.formGroup.patchValue(this.currentEJobSalaries);
              this.formModel.currentData = this.currentEJobSalaries;
              this.isAfterRender = true;
              this.cr.detectChanges();
            }
          }
        }
      });
  }

  getEmployeeInfoById(empId: string, fieldName: string) {
    let empRequest = new DataRequest();
    empRequest.entityName = 'HR_Employees';
    empRequest.dataValues = empId;
    empRequest.predicates = 'EmployeeID=@0';
    empRequest.pageLoading = false;
    this.hrSevice.loadData('HR', empRequest).subscribe((emp) => {
      if (emp[1] > 0) {
        if (fieldName === 'employeeID') {
          this.employeeObj = emp[0][0];
          this.hrSevice
            .getOrgUnitID(
              this.employeeObj?.orgUnitID ?? this.employeeObj?.emp?.orgUnitID
            )
            .subscribe((res) => {
              this.employeeObj.orgUnitName = res.orgUnitName;
            });
        }
        if (fieldName === 'SignerID') {
          this.hrSevice.loadData('HR', empRequest).subscribe((emp) => {
            this.employeeSign = emp[0][0];
            if (emp[1] > 0) {
              let positionID = emp[0][0].positionID;

              if (positionID) {
                this.hrSevice.getPositionByID(positionID).subscribe((res) => {
                  if (res) {
                    this.employeeSign.positionName = res.positionName;
                    this.currentEJobSalaries.signerPosition = res.positionName;
                    this.formGroup.patchValue({
                      signerPosition: this.currentEJobSalaries.signerPosition,
                    });
                    this.cr.detectChanges();
                  }
                });
              } else {
                this.currentEJobSalaries.signerPosition = null;
                this.formGroup.patchValue({
                  signerPosition: this.currentEJobSalaries.signerPosition,
                });
              }
              this.loaded = true;
              this.df.detectChanges();
            }
          });
        }
      }
      this.cr.detectChanges();
    });
  }

  onInit(): void {
    if (!this.formModel) {
      this.hrSevice.getFormModel(this.funcID).then((formModel) => {
        if (formModel) {
          this.formModel = formModel;
          this.initForm();
        }
      });
    } else {
    }
    this.initForm();

    //Update Employee Information when CRUD then render
    if (this.employeeId != null)
      this.getEmployeeInfoById(this.employeeId, 'employeeID');
  }

  handleSelectEmp(evt) {
    if (!!evt.data) {
      this.employeeId = evt.data;
      this.getEmployeeInfoById(this.employeeId, evt.field);
    } else {
      delete this.employeeObj;
    }
  }

  valueChange(event) {
    if (!event.data) {
      this.currentEJobSalaries.signerPosition = '';
      this.formGroup.patchValue({
        signerPosition: '',
      });
    }

    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'SignerID': {
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

  async onSaveForm() {
    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if (
      this.currentEJobSalaries.expiredDate <
      this.currentEJobSalaries.effectedDate
    ) {
      this.hrSevice.notifyInvalidFromTo(
        'ExpiredDate',
        'EffectedDate',
        this.formModel
      );
      return;
    }

    this.currentEJobSalaries.employeeID = this.employeeId;

    if (this.attachment.fileUploadList.length !== 0) {
      (await this.attachment.saveFilesObservable()).subscribe((item2: any) => {
        if (item2?.status == 0) {
          this.fileAdded(item2);
        }
      });
    }

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrSevice.AddEBenefit(this.currentEJobSalaries).subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS006');
          this.dialog && this.dialog.close(p);
          p[0].emp = this.employeeObj;
          if (p[1]) {
            p[1].emp = this.employeeObj;
          }
        } else {
          this.notify.notifyCode('SYS023');
        }
      });
    } else {
      this.hrSevice.EditEBenefit(this.formModel.currentData).subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS007');
          this.dialog && this.dialog.close(p);
        } else this.notify.notifyCode('SYS021');
      });
    }
  }

  //Files handle
  fileAdded(event: any) {
    this.data.attachments = event.data.length;
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }
}
