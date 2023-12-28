import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DialogData, DialogRef, FormModel, ImageViewerComponent, NotificationsService } from 'codx-core';
import { CodxShareService } from '../../../codx-share.service';
import { CodxEsService } from 'projects/codx-es/src/lib/codx-es.service';

@Component({
  selector: 'popup-add-person-signer',
  templateUrl: './popup-add-person-signer.component.html',
  styleUrls: ['./popup-add-person-signer.component.scss'],
})
export class PopupAddPersonSignerComponent implements OnInit {
  @ViewChild('imgSignature2') imgSignature2: ImageViewerComponent;
  @ViewChild('imgSignature1') imgSignature1: ImageViewerComponent;
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
    private notiService: NotificationsService,

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
  valueChange(event: any, field: string = '') {
    if (!field) field = event?.field;
    if (field && event.component) {
      this.data[field] = event.data;
      if (field == 'email') {
        this.data.approver = this.data.email;
        this.fgroupApprover.patchValue({ approver: this.data.approver });        
        this.currSignature =null;
        this.getOrCreateSignature()
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
    this.codxShareService.getOrCreateSignature(this.data?.email, this.data?.signatureType,null,null).subscribe(res=>{
      if(res){
        this.currSignature = res[0];  
        this.isNewSignature = res[1];  
        
        this.currSignature.fullName = this.data.name;
        this.currSignature.phone = this.data.phone;
        this.currSignature.idCardType = this.data.idCardType;
        this.currSignature.idCardNo = this.data.idCardNo;
        this.currSignature.email = this.data.email;
        this.currSignature.category = "1";
        this.currSignature.signatureType = this.data.signatureType;
        
        this.esService.addEditSignature(this.currSignature,this.isNewSignature).subscribe((signature:any)=>{
          if(signature){
            if (this.imgSignature1?.imageUpload?.item) {
              this.imgSignature1
                .updateFileDirectReload(signature.recID)
                .subscribe((result) => {
                  if (result) {                    
                  }
                });
            }
            if (this.imgSignature2?.imageUpload?.item) {
              this.imgSignature2
                .updateFileDirectReload(signature.recID)
                .subscribe((result) => {
                  if (result) {                    
                  }
                });
            }
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
        })
        
      }
    })    
    
  }
}
