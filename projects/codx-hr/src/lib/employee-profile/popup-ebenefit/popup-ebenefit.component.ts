import { CodxHrService } from 'projects/codx-hr/src/public-api';
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
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import moment from 'moment';

@Component({
  selector: 'lib-popup-ebenefit',
  templateUrl: './popup-ebenefit.component.html',
  styleUrls: ['./popup-ebenefit.component.css'],
})
export class PopupEbenefitComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  // formGroup: FormGroup;
  dialog: DialogRef;
  benefitObj;
  //listBenefits;
  //indexSelected;
  employId: string;
  // isAfterRender = false;
  successFlag = false;
  actionType: string;
  disabledInput = false;
  useForQTNS: boolean = false;
  isMultiCopy: boolean = false;
  loaded: boolean = false;
  idField = 'RecID';
  autoNumField = '';
  employeeObj: any;
  headerText: '';
  employeeSign;
  data: any;
  originEmpID = '';
  originEmpBeforeSelectMulti: any;
  moment = moment;
  dateNow = moment().format('YYYY-MM-DD');

  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;

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
    this.useForQTNS = data?.data?.useForQTNS;
    if (data.data.empObj) {
      this.employeeObj = JSON.parse(JSON.stringify(data?.data?.empObj));
    }
    this.actionType = data?.data?.actionType;
    if (this.actionType == 'view') {
      this.disabledInput = true;
    } else if (this.actionType == 'copyMulti') {
      this.isMultiCopy = true;
      this.originEmpID = this.employId;
      this.originEmpBeforeSelectMulti = this.employeeObj;
    }
    this.headerText = data?.data?.headerText;
  }

  onInit(): void {
    this.initForm();
  }

  initForm() {
    this.hrService
      .getOrgUnitID(
        this.employeeObj?.orgUnitID ?? this.employeeObj?.emp?.orgUnitID
      )
      .subscribe((res) => {
        if (res.orgUnitName) {
          this.employeeObj.orgUnitName = res.orgUnitName;
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

            this.benefitObj = res?.data;
            this.benefitObj.effectedDate = null;
            this.benefitObj.expiredDate = null;
            this.benefitObj.employeeID = this.employId;
            // this.formModel.currentData = this.benefitObj;
            // this.form.formGroup.patchValue(this.benefitObj);
            this.cr.detectChanges();
            // this.isAfterRender = true;
          }
        });
    } else {
      if (
        this.actionType === 'edit' ||
        this.actionType === 'copy' ||
        this.actionType === 'view'
      ) {
        this.hrService
          .getDataDefault(
            this.formModel.funcID,
            this.formModel.entityName,
            this.idField
          )
          .subscribe((res) => {
            if (res) {
              this.autoNumField = res.key ? res.key : null;
            }
          });

        if (this.benefitObj.signerID) {
          this.getEmployeeInfoById(this.benefitObj.signerID, 'SignerID');
        }

        // this.form.formGroup.patchValue(this.benefitObj);
        // this.formModel.currentData = this.benefitObj;
        // this.isAfterRender = true;
        this.cr.detectChanges();
      }
    }
  }

  //Files handle
  fileAdded(event: any) {
    this.data.attachments = event.data.length;
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }

  async onSaveForm() {
    this.benefitObj.employeeID = this.employId;
    if (this.form.formGroup.invalid) {
      this.hrService.notifyInvalid(this.form.formGroup, this.formModel);
      this.form.validation(false);
      return;
    }

    this.benefitObj.attachments =
      this.attachment?.data?.length + this.attachment?.fileUploadList?.length;

    if (!this.benefitObj.attachments) {
      this.benefitObj.attachments = 0;
    }

    if (this.attachment.fileUploadList.length !== 0) {
      (await this.attachment.saveFilesObservable()).subscribe((item2: any) => {
        if (item2?.status == 0) {
          this.fileAdded(item2);
        }
      });
    }

    this.form.formGroup.patchValue({ benefitID: this.benefitObj.benefitID }); // test combobox chua co
    this.form.formGroup.patchValue({ employeeID: this.benefitObj.employeeID });
    if (this.benefitObj.expiredDate < this.benefitObj.effectedDate) {
      this.hrService.notifyInvalidFromTo(
        'ExpiredDate',
        'EffectedDate',
        this.formModel
      );
      return;
    }

    if (this.actionType == 'copyMulti') {
      this.hrService.AddEBenefitMultiEmp(this.form.data).subscribe((res) => {
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
        this.hrService.AddEBenefit(this.benefitObj).subscribe((p) => {
          if (this.useForQTNS) {
            if (p != null) {
              this.notify.notifyCode('SYS006');
              p.emp = this.employeeObj.emp ?? this.employeeObj;
              this.dialog && this.dialog.close(p);
            }
          } else {
            if (p != null) {
              if (p.length > 1) {
                this.benefitObj.recID = p[1].recID;
              } else this.benefitObj.recID = p.recID;
              this.notify.notifyCode('SYS006');
              this.successFlag = true;
              this.dialog && this.dialog.close(this.benefitObj);
            }
          }
        });
      } else {
        this.hrService
          .EditEBenefit(this.formModel.currentData)
          .subscribe((p) => {
            if (p != null) {
              this.notify.notifyCode('SYS007');
              if (this.useForQTNS) {
                p.emp = this.employeeObj.emp ?? this.employeeObj;
                this.dialog && this.dialog.close(p);
              } else {
                this.dialog && this.dialog.close(this.benefitObj);
              }
            }
          });
      }
    }
  }

  handleSelectEmp(evt) {
    if (!!evt.data) {
      this.employId = evt.data;
      this.getEmployeeInfoById(this.employId, evt.field);
    } else {
      delete this.employeeObj;
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
          this.employeeObj = emp[0][0];
          this.hrService
            .getOrgUnitID(
              this.employeeObj?.orgUnitID ?? this.employeeObj?.emp?.orgUnitID
            )
            .subscribe((res) => {
              this.employeeObj.orgUnitName = res.orgUnitName;
            });
        }
        if (fieldName === 'SignerID') {
          this.hrService.loadData('HR', empRequest).subscribe((emp) => {
            this.employeeSign = emp[0][0];
            if (emp[1] > 0) {
              let positionID = emp[0][0].positionID;

              if (positionID) {
                this.hrService.getPositionByID(positionID).subscribe((res) => {
                  if (res) {
                    this.employeeSign.positionName = res.positionName;
                    this.benefitObj.signerPosition = res.positionName;
                    this.form.formGroup.patchValue({
                      signerPosition: this.benefitObj.signerPosition,
                    });
                    this.cr.detectChanges();
                  }
                });
              } else {
                this.benefitObj.signerPosition = null;
                this.form.formGroup.patchValue({
                  signerPosition: this.benefitObj.signerPosition,
                });
              }
              this.loaded = true;
            }
          });
        }
      }
      this.cr.detectChanges();
    });
  }

  valueChange(event) {
    if (!event.data) {
      this.benefitObj.signerPosition = '';
      this.form.formGroup.patchValue({
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
        case 'BenefitID':
          this.benefitObj.benefitType =
            event.component.comboBoxObject.itemData.BenefitType;
          this.form.formGroup.patchValue({
            benefitType: event.component.comboBoxObject.itemData.BenefitType,
          });
          break;
        default:
          break;
      }

      this.cr.detectChanges();
    }
  }
}
