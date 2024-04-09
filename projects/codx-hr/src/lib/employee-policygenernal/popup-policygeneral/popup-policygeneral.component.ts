import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild, inject } from '@angular/core';
import { ApiHttpService, CallFuncService, CodxFormComponent, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
@Component({
  selector: 'lib-popup-policygeneral',
  templateUrl: './popup-policygeneral.component.html',
  styleUrls: ['./popup-policygeneral.component.css']
})
export class PopupPolicygeneralComponent  
  extends UIComponent
  implements OnInit
{
  idField = 'PolicyID';
  ActionAdd = 'add'
  ActionEdit = 'edit'
  ActionCopy = 'copy'
  dialog: DialogRef;
  //grvSetup
  headerText: '';
  actionType;
  formModel: any;
  benefitFormModel: any;
  isHidden = true;
  policyGeneralObj?: any;
  //formGroup: any;
  //originPolicyId = '';
  benefitFuncID = 'HRTEM0403'
  // isAfterRender = false;
  fieldHeaderTexts: object;
  lstBenefit: any = [];
  autoNumField: any;
  loadedAutoField = false;
  
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private df: ChangeDetectorRef,
    private hrSevice: CodxHrService,
    public override api: ApiHttpService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ){
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.formModel = dialog.formModel;
    this.funcID = data?.data?.funcID;
    this.policyGeneralObj =  JSON.parse(JSON.stringify(data?.data?.dataObj));
    console.log('data input', this.policyGeneralObj);
    this.actionType = data?.data?.actionType;
    // if(this.policyGeneralObj && this.actionType == 'edit'){
    //   this.originPolicyId = this.policyGeneralObj.policyID;
    // }
  }

  onInit(): void {
    if(!this.benefitFormModel){
      this.hrSevice.getFormModel(this.benefitFuncID).then((formModel) => {
        if(formModel){
          this.benefitFormModel = formModel;
        }
      })
    }

    this.initForm();


    // if(!this.formModel){
    //   this.hrSevice.getFormModel(this.funcID).then((formModel) => {
    //     if(formModel){
    //       this.formModel = formModel;
    //       this.hrSevice
    //       .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
    //       .then((fg) => {
    //         if(fg) {
    //           this.formGroup = fg;
    //           this.initForm();
    //         }
    //       })
    //     }
    //   })
    // }
    // else{
    //   this.hrSevice
    //   .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
    //   .then((fg) => {
    //     if(fg) {
    //       this.formGroup = fg;
    //       this.initForm();
    //     }
    //   })
    // }
  }

  initForm(){
    this.hrSevice.getHeaderText(this.funcID).then((res) => {
      console.log('headerText lay ve ne', res);
      this.fieldHeaderTexts = res;
    })

    //
    // this.cache
    // .gridViewSetup(
    //   this.formModel.formName,
    //   this.formModel.gridViewName
    // )
    // .subscribe((res) => {
    //   this.grvSetup = res;
    //   console.log('grv setup ne', this.grvSetup);
    // });

    if (this.actionType == this.ActionAdd) {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.autoNumField = res.key ? res.key : null;
            this.loadedAutoField = true;

            this.policyGeneralObj = res?.data;
            if (this.policyGeneralObj?.activeOn == '0001-01-01T00:00:00') {
              this.policyGeneralObj.activeOn = null;
              //this.form.setValue('activeOn', null,{onlySelf: true,emitEvent: false,});
            //this.form.formGroup.patchValue(this.policyGeneralObj);

            }
            // this.formModel.currentData = this.policyGeneralObj;
            // this.form.formGroup.patchValue(this.policyGeneralObj);
            this.cr.detectChanges();
            // this.isAfterRender = true;
          }
        });
    } else {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.autoNumField = res.key ? res.key : null;
            this.loadedAutoField = true;
            this.df.detectChanges();
          }}
          )
          
      if (this.actionType === this.ActionEdit || this.actionType === this.ActionCopy) {
        if (this.policyGeneralObj?.activeOn == '0001-01-01T00:00:00') {
          this.policyGeneralObj.activeOn = null;
        }
        //this.form.formGroup.patchValue(this.policyGeneralObj);
        //this.formModel.currentData = this.policyGeneralObj;
        if(this.policyGeneralObj.includeBenefits){
          this.lstBenefit = this.policyGeneralObj.includeBenefits.split(';');
        }
        this.cr.detectChanges();
        // this.isAfterRender = true;
      }
    }
  }

  // onAfterInitForm(evt){
  //   this.initForm();
  //   debugger
  // }

  deleteBenefitInclude(benefit){
    let index = this.lstBenefit.indexOf(benefit);
    this.lstBenefit.splice(index,1);
    this.policyGeneralObj.includeBenefits = this.lstBenefit.join(';');
    debugger
  }

  onSaveForm(){

    // if(this.form.validation(true) == true){
    //   return;
    // }
    
    if(this.form.formGroup.invalid){
      this.hrSevice.notifyInvalid(this.form.formGroup, this.formModel);
      this.form.validation(false);
      return;
    }
    
    // if (this.formGroup.invalid) {
    //   this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
    //   this.form.validation(false);
    //   return;
    // }
    
    if( this.policyGeneralObj.hasIncludeBenefits == false){
        this.policyGeneralObj.includeBenefits = null;
    }
    else{
      if(this.policyGeneralObj.includeBenefits == null || this.policyGeneralObj.includeBenefits == ""){
        this.notify.notifyCode('HR018');
        return;
      }
    }

    if(this.policyGeneralObj.expiredOn && this.policyGeneralObj.activeOn){
      if (this.policyGeneralObj.expiredOn < this.policyGeneralObj.activeOn) {
        this.hrSevice.notifyInvalidFromTo(
          'ExpiredOn',
          'ActiveOn',
          this.formModel
          )
          return;
        }
    }

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.AddPolicyGeneral().subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS006');
          this.dialog && this.dialog.close(p);
        }
        //  else this.notify.notifyCode('SYS023');
      });
    } else {
      debugger
      if(this.form.data.policyID != '' && this.form.data.policyID != this.form.preData.policyID){
        this.DeletePolicyGeneral(this.form.preData.policyID).subscribe((res) => {
          this.AddPolicyGeneral().subscribe((p) => {
            if (p != null) {
              p.editPrimaryKey = true;
              p.oldData = this.form.preData;
              //p.oldData.policyID = this.originPolicyId;
              this.notify.notifyCode('SYS007');
              this.dialog && this.dialog.close(p);
            }
          });
      });
        
        // this.UpdatePolicyGeneralIDChanged().subscribe((res) => {
        //   if (res != null) {
        //     debugger
        //     this.notify.notifyCode('SYS007');
        //     this.dialog && this.dialog.close(res);
        //   } 
        // })
      }
      else{
        this.UpdatePolicyGeneral()
          .subscribe((p) => {
            debugger
            if (p != null) {
              this.notify.notifyCode('SYS007');
              this.dialog && this.dialog.close(p);
            } 
            // else this.notify.notifyCode('SYS021');
          });
      }
    }
  }

  UpdatePolicyGeneralIDChanged(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyGeneralBusiness_Old',
      'UpdatePolicyGeneralIDChangedAsync',
      [this.policyGeneralObj, this.form.preData.policyID]
    );
  }

  DeletePolicyGeneral(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyGeneralBusiness_Old',
      'DeletePolicyGeneralAsync',
      [data]
    );
  }

  ValChangeHasBenefit(event){
    let hasBenefit = event.data;
    if(hasBenefit == false){
      this.policyGeneralObj.hasIncludeBenefits = false;
      this.isHidden = true;
    }
    else{
      this.policyGeneralObj.hasIncludeBenefits = true;
      this.isHidden = false;
    }
  }

  AddPolicyGeneral(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyGeneralBusiness_Old',
      'AddPolicyGeneralAsync',
      this.formModel.currentData
    );
  }

  UpdatePolicyGeneral(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyGeneralBusiness_Old',
      'UpdatePolicyGeneralAsync',
      this.formModel.currentData
    );
  }

  onClickHideComboboxPopup(e): void {
    if(e == null){
      this.isHidden = true;
    this.detectorRef.detectChanges();
      return;
    }
    if(e.id){
        this.policyGeneralObj.includeBenefits = e.id;
    }
    else{
      this.policyGeneralObj.includeBenefits = null;
    }
    this.isHidden = true;

    if(this.policyGeneralObj.includeBenefits){
      this.lstBenefit = this.policyGeneralObj.includeBenefits.split(';')
    }
    else{
      this.lstBenefit = [];
    }
    this.detectorRef.detectChanges();
  }

  onClickOpenCbxBenefit(){
    if(this.policyGeneralObj.hasIncludeBenefits){
      this.isHidden = false;
    }
  }
}
