import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DialogData, DialogRef, FormModel } from 'codx-core';
import { CodxShareService } from '../../../codx-share.service';
import { CodxEsService } from 'projects/codx-es/src/lib/codx-es.service';

@Component({
  selector: 'popup-add-person-signer',
  templateUrl: './popup-add-person-signer.component.html',
  styleUrls: ['./popup-add-person-signer.component.scss'],
})
export class PopupAddPersonSignerComponent implements OnInit {
  fgroupApprover: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  data: any = {};
  lstApprover: any = [];
  isAddNew: boolean = true;
  isAfterRender: boolean = false;
  headerText = 'Thông tin người ký';
  subHeaderText = '';
  cbxEmail = 'SignatureParners';
  currSignature: any;
  isNewSignature =true ;

  constructor(
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private codxShareService: CodxShareService,

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
    this.codxShareService.setCacheFormModel(this.formModel);
    this.getOrCreateSignature();
    this.codxShareService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((fg) => {
        if (fg) {
          this.fgroupApprover = fg;
          this.formModel.currentData = this.data;
          this.fgroupApprover.patchValue(this.data);
          this.isAfterRender = true;
        }
      });
  }
  getOrCreateSignature(){
    this.codxShareService.getOrCreateSignature(this.data?.email, this.data?.signatureType,null,null).subscribe(res=>{
      if(res){
        this.currSignature = res[0];  
        this.isNewSignature = res[1];      
      }
    })
  }
  saveSignature(){
    this.currSignature.fullName = this.data.name;
    this.currSignature.phone = this.data.phone;
    this.currSignature.idCardType = this.data.idCardType;
    this.currSignature.idCardNo = this.data.idCardNo;
    this.currSignature.email = this.data.email;
    this.currSignature.category = "1";
    this.currSignature.signatureType = this.data.signatureType;
    if(this.isNewSignature){
      this.esService.addNewSignature(this.currSignature).subscribe(res=>{

      });
    }
    else{
      this.esService.editSignature(this.currSignature).subscribe(res=>{

      });
    }
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
  cardTypeChange(evt:any,data){
    if(data != null && evt?.field){      
      this.data.idCardType = data;
    }
  }

  onSaveForm() {
    if (this.fgroupApprover.invalid) {
      this.codxShareService.notifyInvalid(this.fgroupApprover, this.formModel);
      return;
    }
    this.saveSignature();
    //Kiểm tra Insert thêm 1 dòng trong danh mục chữ ký số
    // this.esService
    //   .getDataDefault('ESS21', 'ES_Signatures', 'RecID')
    //   .subscribe((res) => {
    //     let oSignature = res.data;
    //     oSignature.signatureType = '3';
    //     oSignature.fullName = this.data.name;
    //     oSignature.email = this.data.email;
    //     oSignature.position = this.data.position;
    //     oSignature.userID = this.data.email;
    //     oSignature.phone = this.data.phone;

    //     this.esService
    //     .getSettingByPredicate(
    //       'FormName=@0 and Category=@1',
    //       'ESParameters;1'
    //       )
    //       .subscribe((setting) => {
    //         if (setting) {
    //           let format = JSON.parse(setting?.dataValue);
    //           console.log('res', oSignature);

    //           oSignature.otpControl = format?.ParnerOTPControl;

    //         }
    //         //this.esService.addNewSignature(oSignature).subscribe((res) => {});
    //       });
    //   });

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
