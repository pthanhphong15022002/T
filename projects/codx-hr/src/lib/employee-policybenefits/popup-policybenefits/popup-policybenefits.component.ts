import { ChangeDetectorRef, Component, Injector, OnInit, Optional } from '@angular/core';
import { CallFuncService, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { FormGroup } from '@angular/forms';
import { PopupMultiselectvllComponent } from '../../employee-policyal/popup-multiselectvll/popup-multiselectvll.component';

@Component({
  selector: 'lib-popup-policybenefits',
  templateUrl: './popup-policybenefits.component.html',
  styleUrls: ['./popup-policybenefits.component.css']
})
export class PopupPolicybenefitsComponent 
extends UIComponent
implements OnInit{
  lstSelectedBenefits: any = []

  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  funcID: string;
  actionType: string;
  idField = 'PolicyID';
  isAfterRender = false;
  headerText: string;
  benefitPolicyObj: any;
  autoNumField: any;
  benefitFormModel: any;

  isHidden = true;

  grvSetup
  grvSetupPolicyDetail
  benefitFuncID = 'HRTEM0403'

  fieldHeaderTexts;
  policyIdEdited = false;
  originPolicyId = '';
  currentTab = '';

  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'overallInfo',
    },
    {
      icon: 'icon-info',
      text: 'Mô tả chính sách',
      name: 'policyInfo',
    },
    {
      icon: 'icon-settings',
      text: 'Thiết lập',
      name: 'setting',
    },
    {
      icon: 'icon-how_to_reg',
      text: 'Đối tượng áp dụng',
      name: 'applyObj',
    },
    {
      icon: 'icon-person_remove',
      text: 'Đối tượng loại trừ',
      name: 'subtractObj',
    },
  ];

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ){
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    this.benefitPolicyObj = JSON.parse(JSON.stringify(data?.data?.dataObj));
    if(this.benefitPolicyObj && this.actionType == 'edit'){
      this.originPolicyId = this.benefitPolicyObj.policyID;
    }
  }

  onInit(): void {
    if(!this.benefitFormModel){
      this.hrSevice.getFormModel(this.benefitFuncID).then((formModel) => {
        if(formModel){
          console.log('benefit form model', formModel);
          
          this.benefitFormModel = formModel;
        }
      })
    }

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

  changeTab(event){
    this.currentTab = event.nextId;
  }

  onInputPolicyID(evt){
    if(this.actionType == 'edit'){
      this.policyIdEdited = true;
    }
  }

  setTitle(evt: any){
    this.headerText += " " +  evt;
    this.cr.detectChanges();
  }

  initForm() {
    this.hrSevice.getHeaderText(this.formModel.funcID).then((res) => {
      this.fieldHeaderTexts = res;
    })
    this.cache
    .gridViewSetup(
      this.formModel.formName,
      this.formModel.gridViewName
    )
    .subscribe((res) => {
      this.grvSetup = res;
      console.log('grvSetup', this.grvSetup);
      
    });

    this.cache
    .gridViewSetup(
      'PolicyDetails',
      'grvPolicyDetails'
    )
    .subscribe((res) => {
      this.grvSetupPolicyDetail = res;

    });


    if (this.actionType == 'add') {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            if(res.key){
              this.autoNumField = res.key;
            }
            res.data.status = '1'
            
            if (res.data.activeOn == '0001-01-01T00:00:00') {
              res.data.activeOn = null;
            }
            this.benefitPolicyObj = res?.data;
            
            this.formModel.currentData = this.benefitPolicyObj;
            this.formGroup.patchValue(this.benefitPolicyObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {

      }
    }

  }

  ValChangeHasIncludeBenefits(event){
    let flag = event.data;

    if(flag == false){
      this.benefitPolicyObj.hasIncludeBenefits = false;
    }
  }

  onClickHideComboboxPopup(e): void {
    if(e == null){
      this.isHidden = true;
    this.detectorRef.detectChanges();
      return;
    }
    if(e.id){
        this.benefitPolicyObj.includeBenefits = e.id;
    }
    else{
      this.benefitPolicyObj.includeBenefits = null;
    }
    this.isHidden = true;

    if(this.benefitPolicyObj.includeBenefits){
      this.lstSelectedBenefits = this.benefitPolicyObj.includeBenefits.split(';')
    }
    else{
      this.lstSelectedBenefits = [];
    }
    this.detectorRef.detectChanges();
  }

  onClickOpenSelectIncludeBenefits(){
    if(this.benefitPolicyObj.hasIncludeBenefits){
      this.isHidden = false;
    }

    // if(this.benefitPolicyObj.hasIncludeBenefits){
    //   let opt = new DialogModel();
    //   let popup = this.callfunc.openForm(
    //     PopupMultiselectvllComponent,
    //     null,
    //     400,
    //     450,
    //     null,
    //     {
    //       headerText: 'Chọn đối tượng áp dụng',
    //       vllName : 'HRObject',
    //       formModel: this.formModel,
    //       dataSelected: this.benefitPolicyObj.includeBenefits
    //     },
    //     null,
    //     opt
    //   );
    //   popup.closed.subscribe((res) => {
    //     if(res.event){
    //       this.benefitPolicyObj.includeBenefits = res.event
    //       this.lstSelectedBenefits = res.event.split(';')
    //       this.cr.detectChanges();
    //     }
    //   });
    // }
  }

  async onSaveForm(){
    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if(this.benefitPolicyObj.activeOn && this.benefitPolicyObj.expiredOn){
      if (this.benefitPolicyObj.expiredOn < this.benefitPolicyObj.activeOn) {
        this.hrSevice.notifyInvalidFromTo(
          'ActiveOn',
          'ExpiredOn',
          this.formModel
          )
          return;
        }
    }

    if(this.benefitPolicyObj.hasIncludeBenefits == true && !this.benefitPolicyObj.includeBenefits){
      this.notify.notifyCode('HR018')
    }

    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.AddPolicyBenefits(this.benefitPolicyObj).subscribe((res) => {
        if(res){
            this.notify.notifyCode('SYS006');
            // for(let i = 0; i < this.lstPolicyBeneficiariesApply.length; i++){
            //   debugger
            //   this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesApply[i]).subscribe((res) => {
                
            //   })
            // }
            // for(let i = 0; i < this.lstPolicyBeneficiariesExclude.length; i++){
            //   this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesExclude[i]).subscribe((res) => {
                
            //   })
            // }
          this.dialog && this.dialog.close(this.benefitPolicyObj);
        }
        else{
          // this.notify.notifyCode('SYS023');
        }
      })
    }
    else if(this.actionType === 'edit'){
      if(this.originPolicyId != '' && this.originPolicyId != this.benefitPolicyObj.policyID){
        this.EditPolicyBenefitsIDChanged().subscribe((res) => {
          if(res){
            this.notify.notifyCode('SYS007');
            // this.DeletePolicyBeneficiaries(this.alpolicyObj.policyID).subscribe((res) => {
            //   for(let i = 0; i < this.lstPolicyBeneficiariesApply.length; i++){
            //     debugger
            //     this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesApply[i]).subscribe((res) => {
                  
            //     })
            //   }
            //   for(let i = 0; i < this.lstPolicyBeneficiariesExclude.length; i++){
            //     debugger
            //     this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesExclude[i]).subscribe((res) => {
                  
            //     })
            //   }
            //   this.dialog && this.dialog.close(this.alpolicyObj);
            // })
          }
          else{
            this.notify.notifyCode('SYS023');
          }
        })
      }
      else{
        this.EditPolicyBenefits(this.benefitPolicyObj).subscribe((res) => {
          if(res){
            this.notify.notifyCode('SYS007');
            // this.DeletePolicyBeneficiaries(this.alpolicyObj.policyID).subscribe((res) => {
            //   for(let i = 0; i < this.lstPolicyBeneficiariesApply.length; i++){
            //     this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesApply[i]).subscribe((res) => {
                  
            //     })
            //   }
            //   for(let i = 0; i < this.lstPolicyBeneficiariesExclude.length; i++){
            //     this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesExclude[i]).subscribe((res) => {
                  
            //     })
            //   }
            //   this.dialog && this.dialog.close(this.alpolicyObj);
            // })
          }
          else{
            this.notify.notifyCode('SYS023');
          }
        })
      }
    }
}

  //#region apis

  AddPolicyBenefits(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'AddPolicyBenefitsAsync',
      data
    );
  }

  EditPolicyBenefits(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'UpdateBenefitPolicyAsync',
      data
    );
  }

  EditPolicyBenefitsIDChanged(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'UpdatePolicyBenefitPolicyIDChangedAsync',
      [this.benefitPolicyObj, this.originPolicyId]
    );
  }

  //#endregion
}
