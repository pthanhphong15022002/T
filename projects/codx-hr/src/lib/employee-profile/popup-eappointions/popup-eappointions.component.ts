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
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { E } from '@angular/cdk/keycodes';

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
  eAppointionHeaderTexts: any;
  disabledInput = false;
  employeeSign;
  loaded: boolean = false;

  oldOrgUnitID: any;
  oldJobLevelID: any;
  oldPositionID: any;
  oldLocationID: any;

  newOrgUnitID: any;
  newJobLevelID: any;
  newPositionID: any;
  newLocationID: any;

  newOrgUnitStr: any;
  newJobLevelStr: any;
  newPositionStr: any;
  newLocationStr: any;

  oldOrgUnitStr: any;
  oldJobLevelStr: any;
  oldPositionStr: any;
  oldLocationStr: any;

  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
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
    if (this.actionType == 'view') {
      this.disabledInput = true;
    }
    this.isUseEmployee = data?.data?.isUseEmployee;
    if (data?.data?.appointionObj)
      this.EAppointionObj = JSON.parse(JSON.stringify(data.data.appointionObj));

    if (data?.data?.empObj && this.actionType == 'add') {
      this.employeeObj = JSON.parse(JSON.stringify(data.data.empObj));
      this.oldOrgUnitID = this.employeeObj.orgUnitID;
      this.oldJobLevelID = this.employeeObj.jobLevel;
      this.oldPositionID = this.employeeObj.positionID;
      this.oldLocationID = this.employeeObj.locationID;

      this.newOrgUnitID = this.employeeObj.orgUnitID;
      this.newJobLevelID = this.employeeObj.jobLevel;
      this.newPositionID = this.employeeObj.positionID;
      this.newLocationID = this.employeeObj.locationID;
    } else if (data?.data?.empObj && this.actionType == 'edit') {
      this.oldOrgUnitID = this.EAppointionObj.oldOrgUnitID;
      this.oldJobLevelID = this.EAppointionObj.oldJobLevel;
      this.oldPositionID = this.EAppointionObj.oldPositionID;
      this.oldLocationID = this.EAppointionObj.oldLocationID;

      this.newOrgUnitID = this.EAppointionObj.orgUnitID;
      this.newJobLevelID = this.EAppointionObj.jobLevel;
      this.newPositionID = this.EAppointionObj.positionID;
      this.newLocationID = this.EAppointionObj.locationID;
    }
    this.formModel = dialog.formModel;
  }

  initForm() {
    this.hrService
      .getOrgUnitID(
        this.employeeObj?.orgUnitID ?? this.employeeObj?.emp?.orgUnitID
      )
      .subscribe((res) => {
        if (this?.employeeObj) {
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
            if (res.key) this.autoNumField = res.key;
            this.EAppointionObj = res.data;
            this.EAppointionObj.effectedDate = null;
            if (this.employeeObj) {
              this.EAppointionObj.employeeID = this.employeeObj.employeeID;
              this.EAppointionObj.orgUnitID = this.employeeObj.positionID;
              this.EAppointionObj.orgUnitID = this.employeeObj.orgUnitID;
              this.EAppointionObj.jobLevel = this.employeeObj.jobLevel;
              this.EAppointionObj.locationID = this.employeeObj.locationID;
              this.EAppointionObj.positionID = this.employeeObj.positionID;
            }
            this.formModel.currentData = this.EAppointionObj;
            this.formGroup.patchValue(this.EAppointionObj);
            this.isAfterRender = true;
            this.cr.detectChanges();
          }
        });
    } else if (
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
      if (this.EAppointionObj.signerID) {
        this.getEmployeeInfoById(this.EAppointionObj.signerID, 'SignerID');
      }
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
    this.hrService.getHeaderText(this.funcID).then((res) => {
      this.eAppointionHeaderTexts = res;
    });
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

  onChangeOrgUnitID(event) {
    if (
      this.actionType == 'add' ||
      (this.actionType == 'edit' && !this.EAppointionObj.oldOrgUnitID)
    ) {
      this.EAppointionObj.oldOrgUnitID = this.newOrgUnitID;
      this.newOrgUnitID = event.data;
    } else if (this.actionType == 'edit' && this.oldOrgUnitID) {
      if (event.data == this.EAppointionObj.oldOrgUnitID) {
        this.EAppointionObj.oldOrgUnitID = null;
      }
      this.newOrgUnitID = event.data;
    }
    this.formGroup.patchValue(this.EAppointionObj);
    this.detectorRef.detectChanges();

    // let viewMem = event.component?.setting.viewMember
    // let newVal = event.component.itemsSelected[0][viewMem]
    // if(this.actionType == 'edit'){
    //   this.notify.alertCode('HR027',null,...[
    //     this.eAppointionHeaderTexts.OrgUnitID,
    //     this.newOrgUnitStr,
    //     newVal,
    //     this.EAppointionObj.oldOrgUnitID,
    //     this.EAppointionObj.oldOrgUnitID,
    //     this.oldOrgUnitID]).subscribe((x) => {
    //     if (x.event?.status == 'Y') {
    //       this.newOrgUnitStr = newVal;
    //     }
    //     else{
    //       if(event.data != this.oldOrgUnitID && this.oldOrgUnitID){
    //         this.EAppointionObj.oldOrgUnitID = this.oldOrgUnitID;
    //       }
    //       else if(event.data == this.oldOrgUnitID){
    //         this.EAppointionObj.oldOrgUnitID = '';
    //       }
    //       this.formGroup.patchValue(this.EAppointionObj);
    //       this.detectorRef.detectChanges();
    //     }})
    // }
    // else{
    //   if(event.data != this.oldOrgUnitID && this.oldOrgUnitID){
    //     this.EAppointionObj.oldOrgUnitID = this.oldOrgUnitID;
    //   }
    //   else if(event.data == this.oldOrgUnitID){
    //     this.EAppointionObj.oldOrgUnitID = '';
    //   }
    //   this.formGroup.patchValue(this.EAppointionObj);
    //   this.detectorRef.detectChanges();
    // }
    // this.newOrgUnitID = event.data;
  }

  onChangeJobLevel(event) {
    let valueTmp;
    if (
      this.actionType == 'add' ||
      (this.actionType == 'edit' && !this.EAppointionObj.oldJobLevel)
    ) {
      valueTmp = this.newJobLevelID;
      // this.EAppointionObj.oldJobLevel = this.newJobLevelID;
      this.newJobLevelID = event.data;
    } else if (this.actionType == 'edit' && this.oldJobLevelID) {
      if (event.data == this.EAppointionObj.oldJobLevel) {
        valueTmp = null;
        // this.EAppointionObj.oldJobLevel = null;
      }
      this.newJobLevelID = event.data;
    }
    this.formGroup.patchValue({
      oldJobLevel: valueTmp,
    });
    // this.formGroup.patchValue(this.EAppointionObj);
    this.detectorRef.detectChanges();
    // let viewMem = event.component?.setting.viewMember
    // let newVal = event.component.itemsSelected[0][viewMem]
    // debugger
    // if(this.actionType == 'edit'){
    //   this.notify.alertCode('HR027',null,...[
    //     this.eAppointionHeaderTexts.JobLevel,
    //     this.newJobLevelStr,
    //     newVal,
    //     this.oldJobLevelStr,
    //     this.oldJobLevelStr,
    //     this.newJobLevelStr]).subscribe((x) => {
    //     if (x.event?.status == 'Y') {
    //       debugger
    //       if(event.data == this.oldJobLevelID){
    //         this.EAppointionObj.oldJobLevel = '';
    //         this.oldJobLevelID = ''
    //         this.oldJobLevelStr = ''
    //       }
    //       this.newJobLevelStr = newVal;
    //     }
    //     else{
    //       this.EAppointionObj.oldJobLevel = this.newJobLevelID
    //       this.newJobLevelID = event.data;
    //       this.newJobLevelStr = newVal;
    //     }
    //     this.formGroup.patchValue(this.EAppointionObj);
    //     this.detectorRef.detectChanges();
    //   })
    // }
    // else{
    //   if(event.data != this.oldJobLevelID && this.oldJobLevelID){
    //     this.EAppointionObj.oldJobLevel = this.oldJobLevelID;
    //   }
    //   else if(event.data == this.oldJobLevelID){
    //     this.EAppointionObj.oldJobLevel = '';
    //   }
    //   this.formGroup.patchValue(this.EAppointionObj);
    //   this.detectorRef.detectChanges();
    // }
  }

  onChangePosition(event) {
    let valueTmp;
    if (
      this.actionType == 'add' ||
      (this.actionType == 'edit' && !this.EAppointionObj.oldPositionID)
    ) {
      valueTmp = this.newPositionID;
      // this.EAppointionObj.oldPositionID = this.newPositionID;
      this.newPositionID = event.data;
    } else if (this.actionType == 'edit' && this.oldPositionID) {
      if (event.data == this.EAppointionObj.oldPositionID) {
        valueTmp = null;
        // this.EAppointionObj.oldPositionID = null;
      }
      this.newPositionID = event.data;
    }
    this.formGroup.patchValue({
      oldPositionID: valueTmp,
    });
    // this.formGroup.patchValue(this.EAppointionObj);
    this.detectorRef.detectChanges();
    // let viewMem = event.component?.setting.viewMember;
    // let newVal = event.component.itemsSelected[0][viewMem];
    // if(this.actionType == 'edit'){
    //   this.notify.alertCode('HR027',null,...[
    //     this.eAppointionHeaderTexts.PositionID,
    //     this.newPositionStr,
    //     newVal,
    //     this.EAppointionObj.oldPositionID,
    //     this.EAppointionObj.oldPositionID,
    //     this.oldPositionID]).subscribe((x) => {
    //     if (x.event?.status == 'Y') {
    //       this.newPositionStr = newVal;
    //     }
    //     else{
    //       if(event.data != this.oldPositionID && this.oldPositionID){
    //         this.EAppointionObj.oldPositionID = this.oldPositionID;
    //       }
    //       else if(event.data == this.oldPositionID){
    //         this.EAppointionObj.oldPositionID = '';
    //       }
    //       this.formGroup.patchValue(this.EAppointionObj);
    //       this.detectorRef.detectChanges();
    //     }})
    // }
    // else{
    //   if(event.data != this.oldPositionID && this.oldPositionID){
    //     this.EAppointionObj.oldPositionID = this.oldPositionID;
    //   }
    //   else if(event.data == this.oldPositionID){
    //     this.EAppointionObj.oldPositionID = '';
    //   }
    //   this.formGroup.patchValue(this.EAppointionObj);
    //   this.detectorRef.detectChanges();
    // }
    // this.newPositionID = event.data;
  }

  onChangeLocation(event) {
    let valueTmp;
    if (
      this.actionType == 'add' ||
      (this.actionType == 'edit' && !this.EAppointionObj.oldLocationID)
    ) {
      valueTmp = this.newLocationID;
      this.newLocationID = event.data;
      //this.EAppointionObj.oldLocationID = this.newLocationID;
    } else if (this.actionType == 'edit' && this.oldLocationID) {
      if (event.data == this.EAppointionObj.oldLocationID) {
        valueTmp = null;
        //this.EAppointionObj.oldLocationID = null;
      }
      this.newLocationID = event.data;
    }
    this.formGroup.patchValue({
      oldLocationID: valueTmp,
    });
    this.detectorRef.detectChanges();
    // let viewMem = event.component?.setting.viewMember;
    // let newVal = event.component.itemsSelected[0][viewMem];
    // if(this.actionType == 'edit'){
    //   this.notify.alertCode('HR027',null,...[
    //     this.eAppointionHeaderTexts.LocationID,
    //     this.newLocationStr,
    //     newVal,
    //     this.oldLocationStr,
    //     this.oldLocationStr,
    //     this.newLocationStr]).subscribe((x) => {
    //     if (x.event?.status == 'Y') {
    //       this.newLocationStr = newVal;
    //     }
    //     else{
    //       if(event.data != this.oldLocationID && this.oldLocationID){
    //         this.EAppointionObj.oldLocationID = this.oldLocationID;
    //       }
    //       else if(event.data == this.oldLocationID){
    //         this.EAppointionObj.oldLocationID = '';
    //       }
    //       this.formGroup.patchValue(this.EAppointionObj);
    //       this.detectorRef.detectChanges();
    //     }})
    // }
    // else{
    //   if(event.data != this.oldLocationID && this.oldLocationID){
    //     this.EAppointionObj.oldLocationID = this.oldLocationID;
    //   }
    //   else if(event.data == this.oldLocationID){
    //     this.EAppointionObj.oldLocationID = '';
    //   }
    //   this.formGroup.patchValue(this.EAppointionObj);
    //   this.detectorRef.detectChanges();
    // }
    // this.newLocationID = event.data;
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

  async onSaveForm() {
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

    if (this.attachment.fileUploadList.length !== 0) {
      (await this.attachment.saveFilesObservable()).subscribe((item2: any) => {
        if (item2?.status == 0) {
          this.fileAdded(item2);
        }
      });
    }

    this.EAppointionObj.employeeID = this.employId;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService
        .AddEmployeeAppointionsInfo(this.EAppointionObj)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS006');
            // this.successFlag = true;
            p.emp = this.employeeObj;
            this.dialog && this.dialog.close(p);
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

  onRenderOrgUnitID(event) {
    this.newOrgUnitStr = event.itemsSelected[0]?.text;
  }

  onRenderOldOrgUnitID(event) {
    this.oldOrgUnitStr = event.itemsSelected[0]?.OrgUnitName;
  }

  onRenderJobLevel(event) {
    this.newJobLevelStr = event.itemsSelected[0]?.Description;
  }

  onRenderOldJobLevel(event) {
    this.oldJobLevelStr = event.itemsSelected[0]?.Description;
  }

  onRenderPositionID(event) {
    this.newPositionStr = event.itemsSelected[0]?.PositionName;
  }

  onRenderOldPositionID(event) {
    this.oldPositionStr = event.itemsSelected[0]?.PositionName;
  }

  onRenderLocationID(event) {
    this.newLocationStr = event.itemsSelected[0]?.LocationName;
  }

  onRenderOldLocationID(event) {
    this.oldLocationStr = event.itemsSelected[0]?.LocationName;
  }

  //Files handle
  fileAdded(event: any) {
    this.EAppointionObj.attachments = event.data.length;
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }
}
