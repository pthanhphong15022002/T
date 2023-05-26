import { FormGroup } from '@angular/forms';
import { CodxHrService } from '../../codx-hr.service';
import { Injector, ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';

import {
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'lib-popup-edisciplines',
  templateUrl: './popup-edisciplines.component.html',
  styleUrls: ['./popup-edisciplines.component.css'],
})
export class PopupEDisciplinesComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  disciplineObj;
  lstDiscipline;
  indexSelected;
  actionType;
  notitfy: NotificationsService;
  employeeObj: any;
  funcID;
  openFrom: string;
  idField = 'RecID';
  genderGrvSetup: any;
  employId;
  isAfterRender = false;
  headerText: '';
  defaultDisciplineDate: string = '0001-01-01T00:00:00';

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
    // this.formModel = dialog?.formModel;

    // if(this.formModel){
    //   this.isAfterRender = true
    // }
    // this.data = dialog?.dataService?.dataSelected

    if (!this.formModel) {
      this.formModel = new FormModel();
      this.formModel.formName = 'EDisciplines';
      this.formModel.entityName = 'HR_EDisciplines';
      this.formModel.gridViewName = 'grvEDisciplines';
    }
    this.employId = data?.data?.employeeId;
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.openFrom = data?.data?.openFrom;
    this.employeeObj = JSON.parse(JSON.stringify(data?.data?.empObj));
    this.actionType = data?.data?.actionType;
    this.lstDiscipline = data?.data?.lstDiscipline;
    this.indexSelected = data?.data?.indexSelected ?? -1;
    this.disciplineObj = JSON.parse(JSON.stringify(data?.data?.dataInput));
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
            this.disciplineObj = res?.data;
            if (
              this.disciplineObj.disciplineDate.toString() ==
              this.defaultDisciplineDate
            ) {
              this.disciplineObj.disciplineDate = null;
            }
            this.disciplineObj.employeeID = this.employId;
            this.formModel.currentData = this.disciplineObj;
            this.formGroup.patchValue(this.disciplineObj);
            this.isAfterRender = true;
            this.cr.detectChanges();
          }
        });
    } else {
      if (
        this.actionType === 'copy' &&
        this.disciplineObj.disciplineDate.toString() ==
          this.defaultDisciplineDate
      ) {
        this.disciplineObj.disciplineDate = null;
      }
      this.formGroup.patchValue(this.disciplineObj);
      this.formModel.currentData = this.disciplineObj;
      this.isAfterRender = true;
      this.cr.detectChanges();
    }
  }

  handleSelectEmp(evt) {
    if (evt.data != null) {
      this.employId = evt.data;
      let empRequest = new DataRequest();
      empRequest.entityName = 'HR_Employees';
      empRequest.dataValues = this.employId;
      empRequest.predicates = 'EmployeeID=@0';
      empRequest.pageLoading = false;
      this.hrService.loadData('HR', empRequest).subscribe((emp) => {
        if (emp[1] > 0) {
          this.employeeObj = emp[0][0];
          console.log('employee cua form', this.employeeObj);
          this.cr.detectChanges();
        }
      });
    }
  }

  onInit(): void {
    this.cache
      .gridViewSetup('EmployeeInfomation', 'grvEmployeeInfomation')
      .subscribe((res) => {
        this.genderGrvSetup = res?.Gender;
      });
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
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }
    if (this.disciplineObj.fromDate > this.disciplineObj.toDate) {
      this.hrService.notifyInvalidFromTo('FromDate', 'ToDate', this.formModel);
      return;
    }

    this.disciplineObj.orgUnitID = this.employeeObj?.orgUnitID;
    this.disciplineObj.parentUnit = this.employeeObj?.parentUnit;
    this.disciplineObj.departmentID = this.employeeObj?.departmentID;
    this.disciplineObj.divisionID = this.employeeObj?.divisionID;
    this.disciplineObj.companyID = this.employeeObj?.companyID;
    this.disciplineObj.positionID = this.employeeObj?.positionID;
    console.log('ki luat chuan bi luuuu', this.disciplineObj);
    console.log('thong tin nhan viennn', this.employeeObj);

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService
        .AddEmployeeDisciplineInfo(this.disciplineObj)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS006');
            p.emp = this.employeeObj;
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS023');
        });
    } else {
      this.hrService
        .UpdateEmployeeDisciplineInfo(this.disciplineObj)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            p.emp = this.employeeObj;
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  click(data) {
    console.log('formdata', data);
    this.disciplineObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.disciplineObj));
    // this.indexSelected = this.lstDiscipline.findIndex(
    //   (p) => p.recID == this.disciplineObj.recID
    // );
    this.actionType = 'edit';
    this.formGroup?.patchValue(this.disciplineObj);
    this.cr.detectChanges();
  }

  afterRenderListView(evt) {
    this.listView = evt;
    console.log(this.listView);
  }

  getEmployeeInfoById(empId: string, fieldName: string) {
    let empRequest = new DataRequest();
    empRequest.entityName = 'HR_Employees';
    empRequest.dataValues = empId;
    empRequest.predicates = 'EmployeeID=@0';
    empRequest.pageLoading = false;
    this.hrService.loadData('HR', empRequest).subscribe((emp) => {
      if (emp[1] > 0) {
        if (fieldName === 'SignerID') {
          this.hrService.loadData('HR', empRequest).subscribe((emp) => {
            if (emp[1] > 0) {
              let positionID = emp[0][0].positionID;

              if (positionID) {
                this.hrService.getPositionByID(positionID).subscribe((res) => {
                  if (res) {
                    this.disciplineObj.signerPosition = res.positionName;
                    this.formGroup.patchValue({
                      signerPosition: this.disciplineObj.signerPosition,
                    });
                    this.cr.detectChanges();
                  }
                });
              } else {
                this.disciplineObj.signerPosition = null;
                this.formGroup.patchValue({
                  signerPosition: this.disciplineObj.signerPosition,
                });
              }
            }
          });
        }
      }
      this.cr.detectChanges();
    });
  }

  valueChange(event) {
    if (!event.data) {
      this.disciplineObj.signerPosition = '';
      this.formGroup.patchValue({
        signerPosition: '',
      });
    }

    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'disciplineID': {
          let itemSelected = event?.component?.itemsSelected[0];

          if (itemSelected?.DisciplineFormCategory) {
            this.disciplineObj.disciplineFormCategory =
              itemSelected?.DisciplineFormCategory;
            this.formGroup.patchValue({
              disciplineFormCategory: this.disciplineObj.disciplineFormCategory,
            });
          }

          break;
        }
        case 'signerID': {
          let employee = event.data;

          if (employee) {
            this.getEmployeeInfoById(employee, 'SignerID');
          }
          break;
          // let employee = event?.component?.itemsSelected[0];
          // if (employee) {
          //   if (employee?.PositionID) {
          //     this.hrService
          //       .getPositionByID(employee.PositionID)
          //       .subscribe((res) => {
          //         if (res) {
          //           this.disciplineObj.signerPosition = res.positionName;
          //           this.formGroup.patchValue({
          //             signerPosition: this.disciplineObj.signerPosition,
          //           });
          //           this.cr.detectChanges();
          //         }
          //       });
          //   } else {
          //     this.disciplineObj.signerPosition = null;
          //     this.formGroup.patchValue({
          //       signerPosition: this.disciplineObj.signerPosition,
          //     });
          //   }
          // }
          // break;
        }
      }
      this.cr.detectChanges();
    }
  }

  clickOpenPopup(codxInput) {
    codxInput.elRef.nativeElement.querySelector('button').click();
  }
}
