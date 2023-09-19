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
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  LayoutAddComponent,
  NotificationsService,
  SidebarModel,
  UIComponent,
} from 'codx-core';
import moment from 'moment';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxHrService } from '../../codx-hr.service';
import { PopupSubEContractComponent } from '../../employee-profile/popup-sub-econtract/popup-sub-econtract.component';
import { PopupContractbenefitComponent } from './popup-contractbenefit/popup-contractbenefit.component';

@Component({
  selector: 'lib-popup-eprocess-contract',
  templateUrl: './popup-eprocess-contract.component.html',
  styleUrls: ['./popup-eprocess-contract.component.css'],
})
export class PopupEProcessContractComponent
  extends UIComponent
  implements OnInit
{
  console = console;
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data: any;
  actionType: string;
  employeeId: string;
  idField = 'RecID';
  isAfterRender = false;
  autoNumField: string;
  // autoNumField2: string;
  lstSubContract: any;
  headerText: string;
  openFrom: string;
  employeeObj: any;

  loaded: boolean = false;
  disabledInput = false;
  changedInForm = false;

  //#region EBenefitInfo Declaration
  benefitFuncID = 'HRTEM0403';
  benefitObj: any;
  loadedAutoField = false;
  benefitFormModel: FormModel;
  benefitFormGroup: FormGroup;
  dialogAddBenefit: any;
  editBenefitObj: any;
  tempBenefitArr: any = [];
  gridViewSetup: any;
  //#endregion
  employeeSign;
  itemContractGroup: string;

  moment = moment;
  dateNow = moment().format('YYYY-MM-DD');

  fmSubContract: FormModel;
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'contractInfo',
    },
    {
      icon: 'icon-description',
      text: 'Chế độ làm việc',
      name: 'workingInfo',
    },
    {
      icon: 'icon-attach_money',
      text: 'Lương & phụ cấp',
      name: 'empBenefit',
    },
  ];

  dataCbxContractType: any;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('form') form: LayoutAddComponent;
  //@ViewChild('layout', { static: true }) layout: LayoutAddComponent;
  @ViewChild('tmpAddBenefit', { static: true })
  tmpAddBenefit: TemplateRef<any>;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private df: ChangeDetectorRef,
    private hrSevice: CodxHrService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;

    this.employeeId = data?.data?.employeeId;
    this.funcID = data?.data?.funcID;
    this.openFrom = data?.data?.openFrom;
    this.actionType = data?.data?.actionType;
    if (this.actionType == 'view') {
      this.disabledInput = true;
    }
    this.data = JSON.parse(JSON.stringify(data?.data?.dataObj));
    if (data?.data?.empObj) {
      this.employeeObj = JSON.parse(JSON.stringify(data?.data?.empObj));
    } else {
      this.employeeObj = {};
    }

    if (this.data?.benefits) {
      this.tempBenefitArr = JSON.parse(this.data.benefits);
    }

    this.fmSubContract = new FormModel();
    this.fmSubContract.entityName = 'HR_EContracts';
    this.fmSubContract.gridViewName = 'grvEContractsPL';
    this.fmSubContract.formName = 'EContracts';
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  initFormAddContract() {
    this.hrSevice
      .getDataDefault(
        this.benefitFormModel.funcID,
        this.benefitFormModel.entityName,
        'RecID'
      )
      .subscribe((res: any) => {
        if (res) {
          // if (res.key) {
          //   this.autoNumField2 = res.key;
          // }
          this.benefitObj = res?.data;
          this.benefitObj.effectedDate = null;
          this.benefitObj.expiredDate = null;
          // this.benefitObj.employeeID = this.employId;
          this.benefitFormModel.currentData = this.benefitObj;
          this.benefitFormGroup.patchValue(this.benefitObj);
        }
      });
  }

  setTitle(evt: any) {
    this.headerText += ' ' + evt;
    this.cr.detectChanges();
  }

  onInit(): void {
    this.hrSevice.getFormModel(this.benefitFuncID).then((formModel) => {
      if (formModel) {
        this.benefitFormModel = formModel;
        this.hrSevice
          .getFormGroup(
            this.benefitFormModel.formName,
            this.benefitFormModel.gridViewName,
            this.benefitFormModel
          )
          .then((fg) => {
            if (fg) {
              this.benefitFormGroup = fg;
              this.initFormAddContract();
            }
          });
      }
    });
    if (!this.formModel)
      this.hrSevice.getFormModel(this.funcID).then((formModel) => {
        if (formModel) {
          this.formModel = formModel;
          this.hrSevice
            .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
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
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
  }

  clickMF(event, data) {
    switch (event.functionID) {
      case 'SYS03': //edit
        this.addBenefit('edit', data);
        break;

      case 'SYS02': //delete
        this.notify.alertCode('SYS030').subscribe((x) => {
          if (x.event?.status == 'Y') {
            let index = this.tempBenefitArr.indexOf(data);
            // if (index) {
            this.tempBenefitArr.splice(index, 1);
            this.data.benefits = JSON.stringify(this.tempBenefitArr);
            this.df.detectChanges();
            // }
          }
        });
        break;
    }
  }

  handleShowHideMF(evt) {
    for (let i = 0; i < evt.length; i++) {
      let funcIDStr = evt[i].functionID;
      evt[i].disabled = true;
      if (funcIDStr == 'SYS02' || funcIDStr == 'SYS03') {
        evt[i].disabled = false;
      }
    }
  }

  // addBenefit() {
  //   let option = new DialogModel();
  //   option.FormModel = this.benefitFormModel;
  //   this.dialogAddBenefit = this.callfunc.openForm(
  //     this.tmpAddBenefit,
  //     '',
  //     550,
  //     350,
  //     '',
  //     null,
  //     '',
  //     option
  //   );
  //   this.dialogAddBenefit.closed.subscribe((res) => {
  //     if (res?.event) {
  //       this.tempBenefitArr.push({
  //         BenefitID: res.event.benefitID,
  //         BenefitAmt: res.event.benefitAmt,
  //         BenefitNorm: res.event.benefitNorm,
  //       });
  //       this.data.benefits = JSON.stringify(this.tempBenefitArr);
  //       this.df.detectChanges();
  //     }
  //   });
  // }

  addBenefit(actionType, data) {
    let option = new DialogModel();
    // option.zIndex = 999;
    option.FormModel = this.benefitFormModel;
    let dialogAdd = this.callfunc.openForm(
      PopupContractbenefitComponent,
      'null',
      550,
      350,
      this.benefitFuncID,
      {
        headerText: 'Thêm phụ cấp',
        formGroup: this.benefitFormGroup,
        funcID: this.benefitFuncID,
        actionType: this.actionType != 'view' ? actionType : 'view',
        dataObj: data,
      },
      '',
      option
    );
    dialogAdd.closed.subscribe((res) => {
      debugger
      if (res?.event) {
      this.changedInForm = true;
        if (actionType == 'add') {
          let index = this.tempBenefitArr.findIndex(
            (x: any) => x.BenefitID == res.event.benefitID
          );
          if (index > -1) {
            this.notify.notifyCode('HR028');
          } else {
            this.tempBenefitArr.push({
              BenefitID: res.event.benefitID,
              BenefitAmt: res.event.benefitAmt,
              BenefitNorm: res.event.benefitNorm,
            });
          }
        } else if (actionType == 'edit') {
          let index = this.tempBenefitArr.indexOf(data);
          this.tempBenefitArr[index].BenefitID = res.event.benefitID;
          this.tempBenefitArr[index].BenefitAmt = res.event.benefitAmt;
          this.tempBenefitArr[index].BenefitNorm = res.event.benefitNorm;
        }
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

  initFormAdd(res, dataContractType?) {
    this.data = res?.data;

    if (dataContractType) {
      this.data.contractTypeID = dataContractType.result?.nextContractTypeID;
    }
    this.data.employeeID = this.employeeId;
    this.data.signedDate = null;
    this.data.effectedDate = null;
    this.formModel.currentData = this.data;

    this.formGroup.patchValue(this.data);

    if (this.employeeObj) {
      this.formGroup.patchValue({
        orgUnitID: this.employeeObj.orgUnitID,
      });
      this.formGroup.patchValue({
        positionID: this.employeeObj.positionID,
      });
    }

    this.isAfterRender = true;
    this.cr.detectChanges();
  }

  initForm() {
    this.hrSevice.getOrgUnitID(this.employeeObj?.orgUnitID).subscribe((res) => {
      this.employeeObj.orgUnitName = res.orgUnitName;
    });

    if (this.actionType == 'add') {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res) => {
          if (res) {
            this.autoNumField = res.key ? res.key : null;
            this.loadedAutoField = true;
            //this.df.detectChanges();

            // de xuat hop dong tiep theo
            //Check ContractType have whether NextContractTypeID
            if (this.headerText.includes('Đề xuất')) {
              this.api
                .execSv<any>(
                  'HR',
                  'HR',
                  'ContractTypesBusiness',
                  'GetContractAsync',
                  this.data.contractTypeID
                )
                .subscribe((dataContractType) => {
                  this.initFormAdd(res, dataContractType);
                });
            } else {
              this.initFormAdd(res);
            }

            // if (this.headerText.includes('Đề xuất')) {
            // this.api
            //   .execSv<any>(
            //     'HR',
            //     'HR',
            //     'ContractTypesBusiness',
            //     'GetContractAsync',
            //     this.data.contractTypeID
            //   )
            //   .subscribe((dataContractType) => {
            //     this.data = res?.data;

            //       this.data.contractTypeID =
            //         dataContractType.result?.nextContractTypeID;

            //     this.data.employeeID = this.employeeId;
            //     this.data.signedDate = null;
            //     this.data.effectedDate = null;
            //     this.formModel.currentData = this.data;

            //     this.formGroup.patchValue(this.data);

            //     if (this.employeeObj) {
            //       this.formGroup.patchValue({
            //         orgUnitID: this.employeeObj.orgUnitID,
            //       });
            //       this.formGroup.patchValue({
            //         positionID: this.employeeObj.positionID,
            //       });
            //     }

            //     this.isAfterRender = true;
            //     this.cr.detectChanges();
            //   });
            // }
          }
        });
    } else if (
      this.actionType === 'edit' ||
      this.actionType === 'copy' ||
      this.actionType === 'view'
    ) {
      this.hrSevice
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
      this.loadedAutoField = true;
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

      if (this.data.signerID) {
        this.getEmployeeInfoById(this.data.signerID, 'signerID');
      }

      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
      this.isAfterRender = true;
      this.cr.detectChanges();
    }
  }

  async addFiles(evt){
    debugger
    this.changedInForm = true;
    this.data.attachments = evt.data.length;
    this.formGroup.patchValue(this.data);
  }

  async onSaveForm() {
    if (this.data.payForm == null) this.data.payForm = '';
    if (this.data.benefits == null) this.data.benefits = '';

    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      this.form.form.validation(false)

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

    if (
      this.data.limitMonths === null &&
      this.itemContractGroup !== '1' &&
      this.data.expiredDate === null
    ) {
      this.notify.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ExpiredDate']?.headerText + '"'
      );
      return;
    }

    if (this.itemContractGroup !== '1' && this.data.expiredDate === null) {
      this.setExpiredDate(this.data.limitMonths);
    }

    //Check limit month and expire date

    this.data.orgUnitID = this.employeeObj?.orgUnitID;
    this.data.parentUnit = this.employeeObj?.parentUnit;
    this.data.departmentID = this.employeeObj?.departmentID;
    this.data.divisionID = this.employeeObj?.divisionID;
    this.data.companyID = this.employeeObj?.companyID;
    this.data.positionID = this.employeeObj?.positionID;

    this.data.attachments =
      this.attachment.data.length + this.attachment.fileUploadList.length;

    if (this.attachment.fileUploadList.length !== 0) {
      (await this.attachment.saveFilesObservable()).subscribe((item2: any) => {
        if (item2?.status == 0) {
          this.fileAdded(item2);
        }
      });
    }

    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.hrSevice
        .validateBeforeSaveContract(this.data, true)
        .subscribe((res) => {
          if (res) {
            if (res[0]) {
              //code test
              this.notify.notifyCode('SYS006');
              res[0].inforEmployee = this.employeeObj;
              this.dialog && this.dialog.close(res[0]);
              this.data = res;
            } else if (res[1]) {
              this.notify.alertCode(res[1]).subscribe((stt) => {
                if (stt?.event?.status == 'Y') {
                  if (res[1] == 'HR010') {
                    this.hrSevice
                      .addEContract(this.data)
                      .subscribe((result) => {
                        if (result && result[0]) {
                          this.notify.notifyCode('SYS006');
                          result[0].inforEmployee = this.employeeObj;

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
                          result[0].inforEmployee = this.employeeObj;
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
          res[0].inforEmployee = this.employeeObj;
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

  renderChange(event) {
    let tmp = JSON.parse(event.dataTemp)[0]?.ContractGroup;
    if (tmp) {
      this.itemContractGroup = tmp;
    }
  }

  renderChangePosition(event) {
    if (
      event.itemsSelected
        ? event.itemsSelected[0].PositionName
        : event.component.itemsSelected[0].PositionName
    ) {
      this.employeeObj.positionName = event.itemsSelected
        ? event.itemsSelected[0].PositionName
        : event.component.itemsSelected[0].PositionNam;
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
          this.itemContractGroup =
            event.component.comboBoxObject.itemData.ContractGroup;
          this.data.limitMonths =
            event?.component?.itemsSelected[0]?.LimitMonths;
          this.formGroup.patchValue({ limitMonths: this.data.limitMonths });
          this.setExpiredDate(this.data.limitMonths);
          break;
        }
        case 'effectedDate': {
          //Fix bug when tab input field still error border
          // this.data.effectedDate = event.data;
          // this.formGroup.patchValue({ effectedDate: this.data.effectedDate });
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
        default:
          break;
      }

      this.cr.detectChanges();
    }
  }

  setExpiredDate(month) {
    if (this.data.effectedDate && month !== null) {
      let date = new Date(this.data.effectedDate);
      //Trừ một ngày theo thay đổi mới
      this.data.expiredDate = new Date(
        date.setMonth(date.getMonth() + month) - 1
      );
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
    this.hrSevice.loadData('HR', empRequest).subscribe((inforEmployee) => {
      if (inforEmployee[1] > 0) {
        if (fieldName === 'employeeID') {
          this.employeeObj = inforEmployee[0][0];

          this.hrSevice
            .getOrgUnitID(this.employeeObj?.orgUnitID)
            .subscribe((res) => {
              this.employeeObj.orgUnitName = res.orgUnitName;
            });

          //Set employee data to field
          this.formGroup.patchValue({
            orgUnitID: this.employeeObj.orgUnitID,
          });
          this.formGroup.patchValue({
            positionID: this.employeeObj.positionID,
          });
        }
        if (fieldName === 'signerID') {
          this.hrSevice
            .loadData('HR', empRequest)
            .subscribe((inforEmployee) => {
              this.employeeSign = inforEmployee[0][0];
              if (inforEmployee[1] > 0) {
                let positionID = inforEmployee[0][0].positionID;

                if (positionID) {
                  this.hrSevice.getPositionByID(positionID).subscribe((res) => {
                    if (res) {
                      this.employeeSign.positionName = res.positionName;
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
                this.loaded = true;
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

  // clickOpenPopup(codxInput) {
  //   codxInput.elRef.nativeElement.querySelector('button').click();
  // }
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
        headerText: actionHeaderText + ' ' + 'Phụ lục hợp đồng lao động',
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
  //Files handle
  fileAdded(event: any) {
    this.data.attachments = event.data.length;
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }
}
