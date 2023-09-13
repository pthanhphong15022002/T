import { ChangeDetectorRef, Component, Injector, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CallFuncService, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxHrService } from '../../../codx-hr.service';

@Component({
  selector: 'lib-popup-contractbenefit',
  templateUrl: './popup-contractbenefit.component.html',
  styleUrls: ['./popup-contractbenefit.component.css']
})
export class PopupContractbenefitComponent  extends UIComponent
implements OnInit{
  formGroup: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  headerText: any;
  actionType: any;
  data: any;
  idField = 'RecID';

  isAfterRender = false;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private df: ChangeDetectorRef,
    private hrSevice: CodxHrService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    debugger
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.formGroup = data?.data?.formGroup;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    if(this.actionType == 'edit'){
      // this.data = JSON.parse(JSON.stringify(data?.data?.dataObj));
      this.data = {
        benefitID : data?.data?.dataObj.BenefitID,
        benefitAmt : data?.data?.dataObj.BenefitAmt,
        benefitNorm : data?.data?.dataObj.BenefitNorm
      }
      // this.data.benefitID = data?.data?.dataObj.BenefitID
      // this.data.benefitAmt = data?.data?.dataObj.BenefitAmt
      // this.data.benefitNorm = data?.data?.dataObj.BenefitNorm
    }
    else{
      this.data = null;
    }
  }

  onInit(): void {
    this.initForm()
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.data = res?.data;
            this.data.effectedDate = null;
            this.data.expiredDate = null;
            this.formModel.currentData = this.data;
            this.formGroup.patchValue(this.data);
            this.df.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (
        this.actionType === 'edit' ||
        this.actionType === 'copy' ||
        this.actionType === 'view'
      ) 
        this.formGroup.patchValue(this.data);
        this.formModel.currentData = this.data;
        this.isAfterRender = true;
        this.df.detectChanges();
      }
    }
  

  onSaveForm(){
    debugger
    this.dialog && this.dialog.close(this.data);
  }
}
