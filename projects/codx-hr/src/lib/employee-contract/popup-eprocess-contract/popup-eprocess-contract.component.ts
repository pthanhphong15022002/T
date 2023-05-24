import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CallFuncService,
  CodxFormComponent,
  CodxListviewComponent,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  LayoutAddComponent,
  NotificationsService,
  SidebarModel,
  UIComponent,
  Util,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxHrService } from '../../codx-hr.service';
import { PopupSubEContractComponent } from '../../employee-profile/popup-sub-econtract/popup-sub-econtract.component';

@Component({
  selector: 'lib-popup-eprocess-contract',
  templateUrl: './popup-eprocess-contract.component.html',
  styleUrls: ['./popup-eprocess-contract.component.css'],
})
export class PopupEProcessContractComponent
  extends UIComponent
  implements OnInit
{
  formModel: FormModel;
  formModelPL: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data: any;
  funcID: string;
  actionType: string;
  employeeId: string;
  idField = 'RecID';
  isAfterRender = false;
  lstSubContract: any;
  headerText: string;
  openFrom: string;
  genderGrvSetup: any;
  employeeObj: any;
  contractNoDisable: boolean = false;

  //#region EBenefitInfo Declaration
  benefitFuncID = 'HRTEM0403';
  benefitObj: any;
  benefitFormModel: FormModel;
  benefitFormGroup: FormGroup;
  dialogAddBenefit: any;
  editBenefitObj: any;
  tempBenefitArr: any = [];
  //#endregion

  fmSubContract: FormModel;
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'contractInfo',
    },
    {
      icon: 'icon-info',
      text: 'Chế độ làm việc',
      name: 'workingInfo',
    },
    {
      icon: 'icon-info',
      text: 'Lương & phụ cấp',
      name: 'empBenefit',
    },
  ];

  dataCbxContractType: any;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('layout', { static: true }) layout: LayoutAddComponent;
  @ViewChild('tmpAddBenefit', { static: true })
  tmpAddBenefit: TemplateRef<any>;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private df: ChangeDetectorRef,
    private hrSevice: CodxHrService,
    private codxShareService: CodxShareService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    if (!this.formModelPL) {
      this.formModelPL = new FormModel();
      this.formModelPL.entityName = 'HR_EContracts';
      this.formModelPL.formName = 'EContracts';
      this.formModelPL.gridViewName = 'grvEContracts';
    }

    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;

    this.employeeId = data?.data?.employeeId;
    this.funcID = data?.data?.funcID;
    this.openFrom = data?.data?.openFrom;
    this.actionType = data?.data?.actionType;
    this.data = JSON.parse(JSON.stringify(data?.data?.dataObj));
    this.employeeObj = JSON.parse(JSON.stringify(data?.data?.empObj));

    if (this.data) {
      if (this.data.benefits) {
        this.tempBenefitArr = JSON.parse(JSON.stringify(this.data?.benefits));
      }
    }

    if (this.dialog.dataService?.keyField === 'ContractNo') {
      this.contractNoDisable = false;
    } else {
      this.contractNoDisable = true;
    }

    this.fmSubContract = new FormModel();
    this.fmSubContract.entityName = 'HR_EContracts';
    this.fmSubContract.gridViewName = 'grvEContractsPL';
    this.fmSubContract.formName = 'EContracts';
  }

  onInit(): void {
    this.cache
      .gridViewSetup('EmployeeInfomation', 'grvEmployeeInfomation')
      .subscribe((res) => {
        this.genderGrvSetup = res?.Gender;
      });
    this.hrSevice.getFormModel(this.benefitFuncID).then((formModel) => {
      if (formModel) {
        this.benefitFormModel = formModel;
        this.hrSevice
          .getFormGroup(
            this.benefitFormModel.formName,
            this.benefitFormModel.gridViewName
          )
          .then((fg) => {
            if (fg) {
              this.benefitFormGroup = fg;
              this.initFormAddBenefit();
            }
          });
      }
    });
    if (!this.formModel)
      this.hrSevice.getFormModel(this.funcID).then((formModel) => {
        if (formModel) {
          this.formModel = formModel;
          this.hrSevice
            .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
            .then((fg) => {
              if (fg) {
                this.formGroup = fg;
                this.initForm();
              }
            });
        }
      });
    else
      this.hrSevice
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
  }

  initFormAddBenefit() {
    this.hrSevice
      .getDataDefault(
        this.benefitFormModel.funcID,
        this.benefitFormModel.entityName,
        'RecID'
      )
      .subscribe((res: any) => {
        if (res) {
          this.benefitObj = res?.data;
          this.benefitObj.effectedDate = null;
          this.benefitObj.expiredDate = null;
          // this.benefitObj.employeeID = this.employId;
          this.benefitFormModel.currentData = this.benefitObj;
          this.benefitFormGroup.patchValue(this.benefitObj);
        }
      });
  }

  addBenefit() {
    let option = new DialogModel();
    //option.zIndex = 999;
    option.FormModel = this.benefitFormModel;
    this.dialogAddBenefit = this.callfunc.openForm(
      this.tmpAddBenefit,
      '',
      550,
      350,
      '',
      null,
      '',
      option
    );
    this.dialogAddBenefit.closed.subscribe((res) => {
      if (res?.event) {
        this.tempBenefitArr.push({
          BenefitID: res.event.benefitID,
          BenefitAmt: res.event.benefitAmt,
          BenefitNorm: res.event.benefitNorm,
        });
        this.data.benefits = JSON.stringify(this.tempBenefitArr);
        this.df.detectChanges();
      }
    });
  }

  onSaveBenefitForm(dialog1) {
    this.dialogAddBenefit &&
      this.dialogAddBenefit.close(dialog1.formModel.currentData);
  }

  close2(dialog: DialogRef) {
    dialog.close();
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res) => {
          if (res) {
            this.data = res?.data;
            this.data.employeeID = this.employeeId;
            this.data.signedDate = null;
            this.data.effectedDate = null;

            this.formModel.currentData = this.data;
            this.formGroup.patchValue(this.data);
            this.isAfterRender = true;
            this.cr.detectChanges();
          }
        });
    } else if (this.actionType === 'edit' || this.actionType === 'copy') {
      if (this.actionType == 'copy') {
        if (this.data.signedDate == '0001-01-01T00:00:00') {
          this.data.signedDate = null;
        }
        if (this.data.effectedDate == '0001-01-01T00:00:00') {
          this.data.effectedDate = null;
        }
      }
      if (this.actionType == 'edit' && this.data.isAppendix == false) {
        let rqSubContract = new DataRequest();
        rqSubContract.entityName = this.formModel.entityName;
        rqSubContract.pageLoading = false;
        rqSubContract.predicates =
          'EmployeeID=@0 and RefContractNo=@1 and IsAppendix=@2';
        rqSubContract.dataValues =
          this.employeeId + ';' + this.data.contractNo + ';true';
        this.hrSevice.loadData('HR', rqSubContract).subscribe((res) => {
          if (res && res[1] > 0) {
            this.lstSubContract = res[0];
          }
        });
      }
      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
      this.isAfterRender = true;
      this.cr.detectChanges();
    }
  }

  onSaveForm() {
    if (this.data.payForm == null) this.data.payForm = '';
    if (this.data.benefits == null) this.data.benefits = '';

    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if (this.data.effectedDate > this.data.expiredDate) {
      this.hrSevice.notifyInvalidFromTo(
        'ExpiredDate',
        'EffectedDate',
        this.formModel
      );
      return;
    }

    this.data.orgUnitID = this.employeeObj?.orgUnitID;
    this.data.parentUnit = this.employeeObj?.parentUnit;
    this.data.departmentID = this.employeeObj?.departmentID;
    this.data.divisionID = this.employeeObj?.divisionID;
    this.data.companyID = this.employeeObj?.companyID;
    this.data.positionID = this.employeeObj?.positionID;

    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.hrSevice
        .validateBeforeSaveContract(this.data, true)
        .subscribe((res) => {
          console.log('result', res);
          if (res) {
            if (res[0]) {
              //code test
              this.notify.notifyCode('SYS006');
              res[0].emp = this.employeeObj;
              this.dialog && this.dialog.close(res[0]);
              this.data = res;
            } else if (res[1]) {
              this.notify.alertCode(res[1]).subscribe((stt) => {
                console.log('click', res);
                if (stt?.event.status == 'Y') {
                  if (res[1] == 'HR010') {
                    this.hrSevice
                      .addEContract(this.data)
                      .subscribe((result) => {
                        if (result && result[0]) {
                          this.notify.notifyCode('SYS006');
                          result[0].emp = this.employeeObj;
                          this.dialog && this.dialog.close(result[0]);
                        }
                      });
                  } else if (res[1] == 'HR009') {
                    this.data.hiredOn = this.data.effectedDate;
                    this.formGroup.patchValue({ hiredOn: this.data.hiredOn });

                    this.hrSevice
                      .addEContract(this.data)
                      .subscribe((result) => {
                        if (result && result[0]) {
                          this.notify.notifyCode('SYS006');
                          result[0].emp = this.employeeObj;
                          this.dialog && this.dialog.close(result[0]);
                        }
                      });
                  }
                }
              });
            }
          }
        });
    } else if (this.actionType == 'edit') {
      this.hrSevice.editEContract(this.data).subscribe((res) => {
        if (res && res[0]) {
          this.notify.notifyCode('SYS007');
          res[0].emp = this.employeeObj;
          this.dialog && this.dialog.close(res[0]);
        }
      });
    }

    this.cr.detectChanges();
  }

  click(data) {
    if (this.data) {
      this.actionType = 'edit';
      this.data = data;
      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
      this.cr.detectChanges();
    }
  }

  valueChange(event) {
    if (!event.data) {
      this.data.signerPosition = '';
      this.formGroup.patchValue({
        signerPosition: '',
      });
    }

    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'contractTypeID': {
          this.data.limitMonths =
            event?.component?.itemsSelected[0]?.LimitMonths;
          this.formGroup.patchValue({ limitMonths: this.data.limitMonths });
          this.setExpiredDate(this.data.limitMonths);
          break;
        }
        case 'effectedDate': {
          this.data.effectedDate = event.data;
          this.formGroup.patchValue({ effectedDate: this.data.effectedDate });
          this.setExpiredDate(this.data.limitMonths);
          break;
        }
        case 'signerID': {
          let employee = event.data;

          if (employee) {
            this.getEmployeeInfoById(employee, 'signerID');
          }
          break;
        }
      }

      this.cr.detectChanges();
    }
  }

  setExpiredDate(month) {
    if (this.data.effectedDate) {
      let date = new Date(this.data.effectedDate);
      this.data.expiredDate = new Date(date.setMonth(date.getMonth() + month));
      this.formGroup.patchValue({ expiredDate: this.data.expiredDate });
      this.cr.detectChanges();
    }
  }

  getEmployeeInfoById(empId: string, fieldName: string) {
    let empRequest = new DataRequest();
    empRequest.entityName = 'HR_Employees';
    empRequest.dataValues = empId;
    empRequest.predicates = 'EmployeeID=@0';
    empRequest.pageLoading = false;
    this.hrSevice.loadData('HR', empRequest).subscribe((emp) => {
      if (emp[1] > 0) {
        if (fieldName === 'employeeID') this.employeeObj = emp[0][0];
        if (fieldName === 'signerID') {
          this.hrSevice.loadData('HR', empRequest).subscribe((emp) => {
            if (emp[1] > 0) {
              let positionID = emp[0][0].positionID;

              if (positionID) {
                this.hrSevice.getPositionByID(positionID).subscribe((res) => {
                  if (res) {
                    this.data.signerPosition = res.positionName;
                    this.formGroup.patchValue({
                      signerPosition: this.data.signerPosition,
                    });
                  }
                });
              } else {
                this.data.signerPosition = null;
                this.formGroup.patchValue({
                  signerPosition: this.data.signerPosition,
                });
              }
            }
          });
        }
      }
      this.df.detectChanges();
    });
  }

  handleSelectEmp(evt) {
    if (!!evt.data) {
      this.employeeId = evt.data;
      this.getEmployeeInfoById(this.employeeId, evt.field);
    } else {
      delete this.employeeObj;
    }
  }

  clickOpenPopup(codxInput) {
    codxInput.elRef.nativeElement.querySelector('button').click();
  }
  clickMFSubContract(evt, data) {
    switch (evt.functionID) {
      case 'SYS02':
        this.notify.alertCode('SYS030').subscribe((x) => {
          if (x.event?.status == 'Y') {
            this.hrSevice.deleteEContract(data).subscribe((res) => {
              if (res != null) {
                this.notify.notifyCode('SYS008');
                let i = this.lstSubContract.indexOf(data);
                if (i != -1) {
                  this.lstSubContract.splice(i, 1);
                }
                this.df.detectChanges();
              }
            });
          }
        });

        break;
      case 'SYS03':
        this.handleSubContract(evt.text, 'edit', data);
        break;
      case 'SYS04':
        this.copyValue(evt.text, data);
        break;
    }
  }

  copyValue(actionHeaderText, data) {
    this.hrSevice.copy(data, this.fmSubContract, 'RecID').subscribe((res) => {
      this.handleSubContract(actionHeaderText, 'copy', res);
    });
  }

  handleSubContract(actionHeaderText: string, actionType: string, data: any) {
    let optionSub = new SidebarModel();
    optionSub.Width = '550px';
    optionSub.zIndex = 1001;
    let popupSubContract = this.callfunc.openForm(
      PopupSubEContractComponent,
      '',
      550,
      screen.height,
      '',
      {
        employeeId: this.data.employeeID,
        contractNo: this.data.contractNo,
        actionType: actionType,
        dataObj: data,
        headerText: actionHeaderText + 'Phụ lục hợp đồng lao động',
      }
    );
    popupSubContract.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add') {
          if (!this.lstSubContract) {
            this.lstSubContract = [];
          }
          this.lstSubContract.push(res.event[0]);
          this.df.detectChanges();
        } else if (actionType == 'edit') {
          let index = this.lstSubContract.indexOf(data);
          this.lstSubContract[index] = res.event[0];
          this.df.detectChanges();
        }
      }
    });
  }
}
