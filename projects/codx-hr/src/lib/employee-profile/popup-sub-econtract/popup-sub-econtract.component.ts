import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { DialogData, DialogRef, FormModel, NotificationsFCMService, NotificationsService } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'lib-popup-sub-econtract',
  templateUrl: './popup-sub-econtract.component.html',
  styleUrls: ['./popup-sub-econtract.component.css'],
})
export class PopupSubEContractComponent implements OnInit {
  fmSubContract: FormModel;
  dialog: DialogRef;
  oSubContract: any;
  isAfterRender: boolean = false;
  fgSubContract: FormGroup;
  employeeID: string;
  contractNo: string;
  actionType: string;
  constructor(
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    private notify: NotificationsService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.employeeID = data?.data?.employeeId;
    this.contractNo = data?.data?.contractNo;
    this.actionType = data?.data?.actionType;
    this.dialog = dialog;
    this.oSubContract = JSON.parse(JSON.stringify(data?.data?.dataObj));

    this.fmSubContract = new FormModel();
    this.fmSubContract.entityName = 'HR_EContracts';
    this.fmSubContract.gridViewName = 'grvEContractsPL';
    this.fmSubContract.formName = 'EContracts';
  }

  ngOnInit(): void {
    this.hrService
      .getFormGroup(
        this.fmSubContract.formName,
        this.fmSubContract.gridViewName
      )
      .then((fg) => {
        if (fg) {
          this.fgSubContract = fg;
          this.initForm();
        }
      });
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrService.getEContractDefault().subscribe((res) => {
        if (res) {
          this.oSubContract = res;
          this.oSubContract.employeeID = this.employeeID;
          this.oSubContract.refContractNo = this.contractNo;
          this.oSubContract.isAppendix = 1;

          this.oSubContract.signedDate = null;
          this.oSubContract.effectedDate = null;

          this.fmSubContract.currentData = this.oSubContract;
          this.fgSubContract.patchValue(this.oSubContract);
          this.cr.detectChanges();
          this.isAfterRender = true;
        }
      });
    } else if (this.actionType == 'edit' || this.actionType == 'copy') {
      if (this.actionType == 'copy') {
        if (this.oSubContract.signedDate == '0001-01-01T00:00:00') {
          this.oSubContract.signedDate = null;
        }
        if (this.oSubContract.effectedDate == '0001-01-01T00:00:00') {
          this.oSubContract.effectedDate = null;
        }
      }

      this.fmSubContract.currentData = this.oSubContract;
      this.fgSubContract.patchValue(this.oSubContract);
      this.cr.detectChanges();
      this.isAfterRender = true;
    }
  }

  onSaveForm() {
    if (this.oSubContract.effectedDate > this.oSubContract.expiredDate) {
      this.hrService.notifyInvalidFromTo(
        'ExpiredDate',
        'EffectedDate',
        this.fmSubContract
      );
      return;
    }
    if(this.actionType == 'add' || this.actionType == 'copy'){
      this.oSubContract.contractTypeID = '1';
      this.hrService.addEContract(this.oSubContract).subscribe((res) => {
        if (res) {
          this.notify.notifyCode('SYS006');
          this.dialog && this.dialog.close(res);
        }
      });
    }
    else if(this.actionType == 'edit'){
      this.oSubContract.contractTypeID = '1';
      this.hrService.editEContract(this.oSubContract).subscribe((res) => {
        if(res){
          this.notify.notifyCode('SYS007');
          debugger
          this.dialog && this.dialog.close(res);
        }
      })
    }
  }

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      if (event.field == 'signerID') {
        //Get thong tin user

        this.oSubContract.signerPosition = '';
        this.fgSubContract.patchValue({
          signerPosition: this.oSubContract.signerPosition,
        });
      }
    }
    this.cr.detectChanges();
  }
}
