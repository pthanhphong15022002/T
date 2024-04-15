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
import moment from 'moment';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';

@Component({
  selector: 'lib-popup-ebasic-salaries',
  templateUrl: './popup-ebasic-salaries.component.html',
  styleUrls: ['./popup-ebasic-salaries.component.css'],
})
export class PopupEBasicSalariesComponent
  extends UIComponent
  implements OnInit
{
  formModel: FormModel;
  dialog: DialogRef;
  EBasicSalaryObj: any;
  idField = 'RecID';
  actionType: string;
  disabledInput = false;
  isMultiCopy: boolean = false;
  employeeId: string | null;
  headerText: ' ';
  autoNumField: string;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;

  //check where to open the form
  employeeObj: any | null;
  actionArray = ['add', 'edit', 'copy'];
  fromListView: boolean = false; //check where to open the form
  showEmpInfo: boolean = true;
  loaded: boolean = false;
  moment = moment;
  employeeSign;
  loadedAutoNum = false;
  originEmpID = '';
  originEmpBeforeSelectMulti: any;
  dateNow = moment().format('YYYY-MM-DD');
  // genderGrvSetup: any;
  //end
  constructor(
    injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);

    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;

    this.formModel = dialog?.formModel;
    this.fromListView = data?.data?.fromListView;
    if (data?.data?.salaryObj) {
      this.EBasicSalaryObj = JSON.parse(JSON.stringify(data?.data?.salaryObj));
    } else {
      this.EBasicSalaryObj = undefined;
    }
    if (this.EBasicSalaryObj?.employeeID && this.fromListView) {
      this.employeeId = this.EBasicSalaryObj?.employeeID;
    } else {
      this.employeeId = data?.data?.employeeId;
    }
    if (this.EBasicSalaryObj?.emp && this.fromListView) {
      this.employeeObj = this.EBasicSalaryObj?.emp;
    } else {
      this.employeeObj = data?.data?.empObj || null;
    }

    if (this.actionType == 'view') {
      this.disabledInput = true;
    } else if (this.actionType == 'copyMulti') {
      this.isMultiCopy = true;
      this.originEmpID = this.employeeId;
      this.originEmpBeforeSelectMulti = this.employeeObj;
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

  onInit(): void {
    this.initForm();
    if (this.employeeId != null)
      this.getEmployeeInfoById(this.employeeId, 'employeeID');
    this.showEmpInfo = this.allowToViewEmp();
  }

  //change employee
  handleSelectEmp(evt) {
    switch (evt?.field) {
      case 'employeeID': //check if employee changed
        if (evt?.data && evt?.data.length > 0) {
          this.employeeId = evt?.data;
          this.getEmployeeInfoById(this.employeeId, evt?.field);
        } else {
          delete this.employeeId;
          delete this.employeeObj;
          this.form.formGroup.patchValue({
            employeeID: this.EBasicSalaryObj.employeeID,
          });
        }
        break;
      case 'signerID': // check if signer changed
        if (evt?.data && evt?.data.length > 0) {
          this.getEmployeeInfoById(evt?.data, evt?.field);
        } else {
          this.form.formGroup.patchValue({
            signerID: null,
            signerPosition: null,
          });
        }
        break;
    }
  }
  //
  getEmployeeInfoById(empId: string, fieldName: string) {
    let empRequest = new DataRequest();
    empRequest.entityName = 'HR_Employees';
    empRequest.dataValues = empId;
    empRequest.predicates = 'EmployeeID=@0';
    empRequest.pageLoading = false;
    this.hrService.loadData('HR', empRequest).subscribe((emp) => {
      this.employeeSign = emp[0][0];
      if (emp[1] > 0) {
        if (fieldName === 'employeeID') {
          this.employeeObj = emp[0][0];

          this.hrService
            .getOrgUnitID(
              this.employeeObj?.orgUnitID ?? this.employeeObj?.emp?.orgUnitID
            )
            .subscribe((res) => {
              this.employeeObj.orgUnitName = res.orgUnitName;
            });
        } else if (fieldName === 'signerID') {
          if (emp[0][0]?.positionID) {
            this.hrService
              .getPositionByID(emp[0][0]?.positionID)
              .subscribe((res) => {
                if (res) {
                  this.employeeSign.positionName = res.positionName;
                  this.EBasicSalaryObj.signerPosition = res.positionName;
                  this.form.formGroup.patchValue({
                    signerPosition: this.EBasicSalaryObj.signerPosition,
                  });
                  this.cr.detectChanges();
                }
              });
          } else {
            this.EBasicSalaryObj.signerPosition = null;
            this.form.formGroup.patchValue({
              signerPosition: this.EBasicSalaryObj.signerPosition,
            });
          }
          this.loaded = true;
        }
      }
      this.cr.detectChanges();
    });
  }

  initForm() {
    this.hrService
      .getOrgUnitID(
        this.employeeObj?.orgUnitID ?? this.employeeObj?.emp?.orgUnitID
      )
      .subscribe((res) => {
        if (this.employeeObj) {
          this.employeeObj.orgUnitName = res.orgUnitName;
        }
      });
    if (
      this.actionType == 'add' ||
      this.actionType === 'edit' ||
      this.actionType === 'copy' ||
      this.actionType === 'view' ||
      this.actionType === 'copyMulti'
    ) {
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

            if (this.actionType != 'edit') {
              this.EBasicSalaryObj = res?.data;
              this.EBasicSalaryObj.effectedDate = new Date();
            }
            this.loadedAutoNum = true;

            if (this.EBasicSalaryObj.signerID) {
              this.getEmployeeInfoById(
                this.EBasicSalaryObj.signerID,
                'signerID'
              );
            }

            this.EBasicSalaryObj.employeeID = this.employeeId;
            this.cr.detectChanges();
          }
        });
    }
  }

  async onSaveForm() {
    if (this.form.formGroup.invalid) {
      this.hrService.notifyInvalid(this.form.formGroup, this.formModel);
      this.form.validation(false);
      return;
    }

    if (
      this.EBasicSalaryObj.expiredDate &&
      !this.dateCompare(
        this.EBasicSalaryObj.effectedDate,
        this.EBasicSalaryObj.expiredDate
      )
    ) {
      this.hrService.notifyInvalidFromTo(
        'ExpiredDate',
        'EffectedDate',
        this.formModel
      );
      return;
    }

    this.EBasicSalaryObj.attachments =
      this.attachment?.data?.length + this.attachment?.fileUploadList?.length;

    if (!this.EBasicSalaryObj.attachments) {
      this.EBasicSalaryObj.attachments = 0;
    }

    if (this.attachment.fileUploadList.length !== 0) {
      (await this.attachment.saveFilesObservable()).subscribe((item2: any) => {
        if (item2?.status == 0) {
          this.fileAdded(item2);
        }
      });
    }

    if (this.actionType == 'copyMulti') {
      this.hrService
        .AddMultiEmployeeBasicSalariesInfo(this.form.formGroup.value)
        .subscribe((res) => {
          if (res.length > 0) {
            let returnVal;
            for (let i = 0; i < res.length; i++) {
              if (res[i].employeeID == this.originEmpID) {
                returnVal = res[i];
              }
            }
            if (returnVal) {
              returnVal.emp = this.originEmpBeforeSelectMulti;
              this.dialog && this.dialog.close(returnVal);
            } else {
              this.dialog && this.dialog.close();
            }
          } else {
            this.dialog && this.dialog.close();
          }
        });
    } else {
      if (this.actionType === 'add' || this.actionType === 'copy') {
        this.hrService
          .AddEmployeeBasicSalariesInfo(this.EBasicSalaryObj)
          .subscribe((p) => {
            if (p != null) {
              this.notify.notifyCode('SYS006');
              p.emp = this.employeeObj;
              this.dialog && this.dialog.close(p);
            }
          });
      } else {
        this.hrService
          .UpdateEmployeeBasicSalariesInfo(this.formModel.currentData)
          .subscribe((p) => {
            if (p != null) {
              this.notify.notifyCode('SYS007');
              p.emp = this.employeeObj;
              this.dialog && this.dialog.close(p);
            }
          });
      }
    }
  }

  dateCompare(beginDate, endDate) {
    if (beginDate && endDate) {
      let date1 = new Date(beginDate);
      let date2 = new Date(endDate);
      return date1 <= date2;
    }
    return false;
  }

  fileAdded(event: any) {
    this.EBasicSalaryObj.attachments = event.data.length;
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }
}
