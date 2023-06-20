import { ChangeDetectorRef, Component, Injector, OnInit, Optional, inject } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
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
  grvSetup
  headerText: '';
  actionType;
  formModel: any;
  policyGeneralObj: any;
  formGroup: any;
  funcID
  isAfterRender = false;
  fieldHeaderTexts: object;
  
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
    this.funcID = data?.data?.funcID;
    this.policyGeneralObj = data?.data?.dataObj;
    console.log('data input', this.policyGeneralObj);
    this.actionType = data?.data?.actionType;
  }

  onInit(): void {
    if(!this.formModel){
      this.hrSevice.getFormModel(this.funcID).then((formModel) => {
        if(formModel){
          this.formModel = formModel;
          this.hrSevice
          .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
          .then((fg) => {
            if(fg) {
              this.formGroup = fg;
              this.initForm();
            }
          })
        }
      })
    }
    else{
      this.hrSevice
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((fg) => {
        if(fg) {
          this.formGroup = fg;
          this.initForm();
        }
      })
    }
  }

  initForm(){
    this.hrSevice.getHeaderText(this.funcID).then((res) => {
      this.fieldHeaderTexts = res;
    })

    this.cache
    .gridViewSetup(
      this.formModel.formName,
      this.formModel.gridViewName
    )
    .subscribe((res) => {
      this.grvSetup = res;
      console.log('grv setup ne', this.grvSetup);
    });

    if (this.actionType == this.ActionAdd) {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.policyGeneralObj = res?.data;
            if (this.policyGeneralObj?.activeOn == '0001-01-01T00:00:00') {
              this.policyGeneralObj.activeOn = null;
            }
            this.formModel.currentData = this.policyGeneralObj;
            this.formGroup.patchValue(this.policyGeneralObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === this.ActionEdit || this.actionType === this.ActionCopy) {
        if (this.policyGeneralObj?.activeOn == '0001-01-01T00:00:00') {
          this.policyGeneralObj.activeOn = null;
        }
        this.formGroup.patchValue(this.policyGeneralObj);
        this.formModel.currentData = this.policyGeneralObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }

  onSaveForm(){
    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    let ddd = new Date();
    if(this.policyGeneralObj.activeOn > ddd.toISOString()){
      this.notify.notifyCode('HR014',0, this.fieldHeaderTexts['ActiveOn']);
      return;
    }

    if(this.policyGeneralObj.expiredOn && this.policyGeneralObj.activeOn){
      if (this.policyGeneralObj.expiredOn < this.policyGeneralObj.activeOn) {
        this.hrSevice.notifyInvalidFromTo(
          'expiredOn',
          'activeOn',
          this.formModel
          )
          return;
        }
    }

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.AddPolicyGeneral().subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS007');
          this.dialog && this.dialog.close(p);
        } else this.notify.notifyCode('SYS023');
      });
    } else {
      this.UpdatePolicyGeneral()
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  AddPolicyGeneral(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyGeneralBusiness',
      'AddPolicyGeneralAsync',
      this.formModel.currentData
    );
  }

  UpdatePolicyGeneral(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyGeneralBusiness',
      'UpdatePolicyGeneralAsync',
      this.formModel.currentData
    );
  }
}
