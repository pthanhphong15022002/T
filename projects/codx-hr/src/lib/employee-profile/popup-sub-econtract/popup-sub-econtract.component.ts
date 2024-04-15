import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';

@Component({
  selector: 'lib-popup-sub-econtract',
  templateUrl: './popup-sub-econtract.component.html',
  styleUrls: ['./popup-sub-econtract.component.css'],
})
export class PopupSubEContractComponent implements OnInit {
  fmSubContract: FormModel;
  dialog: DialogRef;
  oSubContract: any;
  isAfterRender: boolean = true;
  fgSubContract: FormGroup;
  employeeID: string;
  contractNo: string;
  actionType: string;
  headerText: string;
  constructor(
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    private notify: NotificationsService,
    private cache: CacheService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.employeeID = data?.data?.employeeId;
    this.contractNo = data?.data?.contractNo;
    this.actionType = data?.data?.actionType;
    this.headerText = data?.data?.headerText;
    this.dialog = dialog;
    this.oSubContract = JSON.parse(JSON.stringify(data?.data?.dataObj));

    this.fmSubContract = new FormModel();
    this.fmSubContract.entityName = 'HR_EContracts';
    this.fmSubContract.gridViewName = 'grvEContractsPL';
    this.fmSubContract.formName = 'EContractsPL';
  }

  ngOnInit(): void {
    // HRTPro01PL, HRTPro01A10

    // this.fmSubContract = res;

    this.hrService
      .getFormGroup(
        this.fmSubContract.formName,
        this.fmSubContract.gridViewName,
        this.fmSubContract
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
          this.oSubContract.contractTypeID = '1';

          this.fmSubContract.currentData = this.oSubContract;
          this.fgSubContract.patchValue(this.oSubContract);
          this.isAfterRender = true;
          this.cr.detectChanges();
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
      this.isAfterRender = true;
      this.cr.detectChanges();
    }
  }

  onSaveForm() {
    if (this.fgSubContract.invalid) {
      this.hrService.notifyInvalid(this.fgSubContract, this.fmSubContract);
      return;
    }

    if (
      this.fgSubContract.value.effectedDate >
      this.fgSubContract.value.expiredDate
    ) {
      this.hrService.notifyInvalidFromTo(
        'ExpiredDate',
        'EffectedDate',
        this.fmSubContract
      );
      return;
    }
    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.fgSubContract.value.contractTypeID = '1';
      this.fgSubContract.value.status = '1';
      this.hrService.addEContract(this.fgSubContract.value).subscribe((res) => {
        if (res) {
          this.notify.notifyCode('SYS006');
          this.dialog && this.dialog.close(res);
        }
      });
    } else if (this.actionType == 'edit') {
      //this.oSubContract.contractTypeID = '1';
      this.hrService
        .editEContract(this.fgSubContract.value)
        .subscribe((res) => {
          if (res) {
            this.notify.notifyCode('SYS007');
            this.dialog && this.dialog.close(res);
          }
        });
    }
  }

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      if (event.field == 'signerID') {
        //Get thong tin user

        this.fgSubContract.value.signerPosition = '';
        this.fgSubContract.patchValue({
          signerPosition: this.fgSubContract.value.signerPosition,
        });
      }
    }
    this.cr.detectChanges();
  }
}
