import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DialogData, DialogRef, FormModel } from 'codx-core';
import { CodxEsService } from 'projects/codx-es/src/lib/codx-es.service';
import { CodxShareService } from '../../../codx-share.service';

@Component({
  selector: 'lib-popup-add-approver',
  templateUrl: './popup-add-approver.component.html',
  styleUrls: ['./popup-add-approver.component.scss'],
})
export class PopupAddApproverComponent implements OnInit {
  fgroupApprover: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  data: any = {};
  lstApprover: any = [];
  isAddNew: boolean = true;
  isAfterRender: boolean = false;
  headerText = 'Thông tin đối tác';
  subHeaderText = '';
  cbxEmail = 'SignatureParners';

  constructor(
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private codxService: CodxShareService,

    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(data?.data?.approverData));
    this.lstApprover = data?.data?.lstApprover;
    this.dialog = dialog;
    this.isAddNew = data?.data?.isAddNew;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.formModel = new FormModel();
    this.formModel.entityName = 'ES_ApprovalSteps_Approvers';
    this.formModel.formName = 'ApprovalSteps_Approvers';
    this.formModel.gridViewName = 'grvApprovalSteps_Approvers';
    this.dialog.formModel = this.formModel;

    this.codxService.setCacheFormModel(this.formModel);
    this.codxService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((fg) => {
        console.log(fg);
        if (fg) {
          this.fgroupApprover = fg;
          this.formModel.currentData = this.data;
          this.fgroupApprover.patchValue(this.data);
          this.isAfterRender = true;
        }
      });
  }

  valueChange(event: any, field: string = '') {
    if (!field) field = event?.field;
    if (field && event.component) {
      this.data[field] = event.data;
      if (field == 'email') {
        this.data.approver = this.data.email;
        this.fgroupApprover.patchValue({ approver: this.data.approver });
      }
      this.cr.detectChanges();
    }
  }

  onSaveForm() {
    if (this.fgroupApprover.invalid) {
      this.codxService.notifyInvalid(this.fgroupApprover, this.formModel);
      return;
    }

    //Kiểm tra Insert thêm 1 dòng trong danh mục chữ ký số
    this.esService
      .getDataDefault('ESS21', 'ES_Signatures', 'RecID')
      .subscribe((res) => {
        let oSignature = res.data;
        oSignature.signatureType = '3';
        oSignature.fullName = this.data.name;
        oSignature.email = this.data.email;
        oSignature.position = this.data.position;
        oSignature.userID = this.data.email;
        oSignature.phone = this.data.phone;

        this.esService
        .getSettingByPredicate(
          'FormName=@0 and Category=@1',
          'ESParameters;1'
          )
          .subscribe((setting) => {
            if (setting) {
              let format = JSON.parse(setting?.dataValue);
              console.log('res', oSignature);

              oSignature.otpControl = format?.ParnerOTPControl;

            }
            //this.esService.addNewSignature(oSignature).subscribe((res) => {});
          });
      });

    let lstExisted = this.lstApprover.filter(
      (p) => p.email == this.data?.email
    );
    if (this.isAddNew && lstExisted.length > 0) {
      return;
    }

    if (!this.isAddNew && lstExisted.length > 1) {
      return;
    }

    this.data.approver = this.data.email;

    this.dialog && this.dialog.close(this.data);
  }
}
