import { update } from '@syncfusion/ej2-angular-inplace-editor';
import { T } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CallFuncService,
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxHrService } from '../../codx-hr.service';
import { PopupSubEContractComponent } from '../../employee-profile/popup-sub-econtract/popup-sub-econtract.component';

@Component({
  selector: 'lib-popup-eprocess-contract',
  templateUrl: './popup-eprocess-contract.component.html',
  styleUrls: ['./popup-eprocess-contract.component.css']
})
export class PopupEProcessContractComponent extends UIComponent implements OnInit{
  formModel: FormModel;
  formModelPL: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data: any;
  funcID: string;
  actionType: string;
  employeeId: string;
  isAfterRender = false;
  lstSubContract: any;
  headerText: string;
  employeeObj: any;
  fmSubContract: FormModel;
  

  dataCbxContractType: any;
  @ViewChild('form') form: CodxFormComponent;
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
    this.actionType = data?.data?.actionType;
    this.data = JSON.parse(JSON.stringify(data?.data?.dataObj));
    if(this.actionType == 'edit'){
      this.employeeObj = this.data.emp
    }

    this.fmSubContract = new FormModel();
    this.fmSubContract.entityName = 'HR_EContracts';
    this.fmSubContract.gridViewName = 'grvEContractsPL';
    this.fmSubContract.formName = 'EContracts';
  }

  onInit(): void {
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

  initForm() {
    if (this.actionType == 'add') {
      this.hrSevice.getEContractDefault().subscribe((res) => {
        if (res) {
          this.data = res;
          this.data.employeeID = this.employeeId;
          this.data.signedDate = null;
          this.data.effectedDate = null;

          this.formModel.currentData = this.data;
          this.formGroup.patchValue(this.data);
          this.cr.detectChanges();
          this.isAfterRender = true;
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
            console.log('aaaaaaaaaaaaaaaaaaaaaaa', res);
          }
        });
      }
      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
      this.cr.detectChanges();
      this.isAfterRender = true;
    }
  }

  onSaveForm() {
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

    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.hrSevice.validateBeforeSaveContract(this.data, true).subscribe((res) => {
        console.log('result', res);
        if (res && res[0]) {
          //code test
          this.notify.notifyCode('SYS006');
          res[0].emp = this.employeeObj;
          this.dialog && this.dialog.close(res);
          this.data = res;
        }
      });
    } else if (this.actionType == 'edit') {
      this.hrSevice.editEContract(this.data).subscribe((res) => {
        if (res && res[0]) {
          this.notify.notifyCode('SYS007');
          res[0].emp = this.employeeObj;
          this.dialog && this.dialog.close(res);
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
    if (event?.field && event?.component && event?.data != '') {
      switch (event.field) {
        case 'contractTypeID': {
          this.data.limitMonths =
            event?.component?.itemsSelected[0]?.LimitMonths;
          this.formGroup.patchValue({ limitMonths: this.data.limitMonths });
          this.setExpiredDate();
          break;
        }
        case 'effectedDate': {
          this.data.effectedDate = event.data;
          this.formGroup.patchValue({ effectedDate: this.data.effectedDate });
          this.setExpiredDate();
          break;
        }
        case 'signerID': {
          let employee = event?.component?.itemsSelected[0];
          if (employee) {
            if (employee.PositionID) {
              this.hrSevice
                .getPositionByID(employee.PositionID)
                .subscribe((res) => {
                  if (res) {
                    this.data.signerPosition = res.positionName;
                    this.formGroup.patchValue({
                      signerPosition: this.data.signerPosition,
                    });
                    this.cr.detectChanges();
                  }
                });
            } else {
              this.data.signerPosition = null;
              this.formGroup.patchValue({
                signerPosition: this.data.signerPosition,
              });
            }
          }
          break;
        }
      }

      this.cr.detectChanges();
    }
  }

  setExpiredDate() {
    if (this.data.effectedDate) {
      let date = new Date(this.data.effectedDate);
      this.data.expiredDate = new Date(date.setMonth(date.getMonth() + 14));
      this.formGroup.patchValue({ expiredDate: this.data.expiredDate });
      this.cr.detectChanges();
    }
  }

  handleSelectEmp(evt){
    if(evt.data != null){
      this.employeeId = evt.data
      let empRequest = new DataRequest();
      empRequest.entityName = 'HR_Employees';
      empRequest.dataValues = this.employeeId;
      empRequest.predicates = 'EmployeeID=@0';
      empRequest.pageLoading = false;
      this.hrSevice.loadData('HR', empRequest).subscribe((emp) => {
        if (emp[1] > 0) {
          this.employeeObj = emp[0][0]
          console.log('employee cua form', this.employeeObj);
          
        }
      });
    }
  }

  clickMFSubContract(evt, data){
      switch (evt.functionID) {
        case 'SYS02':
          this.notify.alertCode('SYS030').subscribe((x) => {
            if (x.event?.status == 'Y') {
              this.hrSevice.deleteEContract(data).subscribe((res) => {
                if(res != null){
                  this.notify.notifyCode('SYS008');
                  let i = this.lstSubContract.indexOf(data)
                  if(i != -1){
                    this.lstSubContract.splice(i, 1);
                  }
                  this.df.detectChanges();
                }
              })
            }
          })

          break;
        case 'SYS03':
          this.handleSubContract(evt.text, 'edit', data)
          break;
        case 'SYS04':
          this.copyValue(evt.text, data)
          break;
    }
  }


  copyValue(actionHeaderText, data){
    this.hrSevice
    .copy(data, this.fmSubContract, 'RecID')
    .subscribe((res) => {
      this.handleSubContract(actionHeaderText, 'copy', res);
    });
  }

  handleSubContract(actionHeaderText: string, actionType: string, data: any) {
    let optionSub = new SidebarModel();
    optionSub.Width = '550px';
    optionSub.zIndex = 1001;
    let popupSubContract = this.callfc.openForm(
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
        if(actionType == 'add'){
          this.lstSubContract.push(res.event[0]);
          this.df.detectChanges();
        }
        else if(actionType == 'edit'){
          debugger
          let index = this.lstSubContract.indexOf(data);
          this.lstSubContract[index] = res.event[0];
          this.df.detectChanges();
        }
      }
    });
  }
}
