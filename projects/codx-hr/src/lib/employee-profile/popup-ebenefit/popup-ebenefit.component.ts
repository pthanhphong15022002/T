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
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import moment from 'moment';

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
  useForQTNS: boolean = false;
  loaded: boolean = false;
  idField = 'RecID';
  autoNumField = '';
  employeeObj: any;
  headerText: '';
  funcID: string;
  employeeSign;
  data: any;
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
    // this.employeeId = data?.data?.employeeId;
    this.benefitObj = JSON.parse(JSON.stringify(data?.data?.benefitObj));
    this.useForQTNS = data?.data?.useForQTNS;
    if (data.data.empObj) {
      this.employeeObj = JSON.parse(JSON.stringify(data?.data?.empObj));
    }

    // this.indexSelected =
    //   data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;
    this.actionType = data?.data?.actionType;
    if (this.actionType == 'view') {
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
            this.formModel.currentData = this.benefitObj;
            this.formGroup.patchValue(this.benefitObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
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

        this.formGroup.patchValue(this.benefitObj);
        this.formModel.currentData = this.benefitObj;
        this.isAfterRender = true;
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
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if (this.attachment.fileUploadList.length !== 0) {
      (await this.attachment.saveFilesObservable()).subscribe((item2: any) => {
        if (item2?.status == 0) {
          this.fileAdded(item2);
        }
      });
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
        if (this.useForQTNS) {
          if (p != null) {
            this.notify.notifyCode('SYS006');
            p[0].emp = this.employeeObj;
            if (p[1]) {
              p[1].emp = this.employeeObj;
            }
            this.dialog && this.dialog.close(p);
          } else {
            this.notify.notifyCode('SYS023');
          }
        } else {
          if (p != null) {
            if (p.length > 1) {
              this.benefitObj.recID = p[1].recID;
            } else this.benefitObj.recID = p[0].recID;
            this.notify.notifyCode('SYS006');
            this.successFlag = true;
            this.dialog && this.dialog.close(this.benefitObj);
          }
        }
      });
    } else {
      this.hrService.EditEBenefit(this.formModel.currentData).subscribe((p) => {
        if (p[0] != null) {
          this.notify.notifyCode('SYS007');
          if (this.useForQTNS) {
            console.log(p);

            p[0].emp = this.employeeObj;
            if (p[1]) {
              p[1].emp = this.employeeObj;
            }

            console.log(p);
            this.dialog && this.dialog.close(p);
          } else {
            this.dialog && this.dialog.close(this.benefitObj);
          }
        }
      });
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
}
