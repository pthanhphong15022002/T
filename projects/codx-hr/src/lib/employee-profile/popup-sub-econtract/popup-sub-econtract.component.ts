import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { DialogData, DialogRef, FormModel } from 'codx-core';
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
  constructor(
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,

    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    //this.fgSubContract = JSON.parse(JSON.stringify(data?.data?.formGroup));
    this.fmSubContract = JSON.parse(JSON.stringify(data?.data?.formModel));
    this.employeeID = data?.data?.employeeId;
    this.contractNo = data?.data?.contractNo;
    this.dialog = dialog;
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
    this.hrService.getEContractDefault().subscribe((res) => {
      if (res) {
        this.oSubContract = res;
        this.oSubContract.employeeID = this.employeeID;
        this.oSubContract.refContractNo = this.contractNo;
        this.oSubContract.isAppendix = 1;
        this.fmSubContract.currentData = this.oSubContract;
        this.fgSubContract.patchValue(this.oSubContract);
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    });
  }

  onSaveForm(isCloseForm: boolean) {
    this.oSubContract.contractTypeID = '1';
    this.hrService.addEContract(this.oSubContract).subscribe((res) => {
      if (res) {
        this.dialog && this.dialog.close(res);
      }
    });
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
