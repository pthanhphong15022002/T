import { ChangeDetectorRef, Component, Injector, OnInit, Optional, inject } from '@angular/core';
import { CallFuncService, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
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
  ActionAdd = 'add'
  ActionEdit = 'edit'
  ActionCopy = 'copy'
  formModel: any;
  formGroup: any;
  funcID
  
  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private df: ChangeDetectorRef,
    private hrSevice: CodxHrService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ){
    super(injector);
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

  }

  onSaveForm(){
    
  }

}
