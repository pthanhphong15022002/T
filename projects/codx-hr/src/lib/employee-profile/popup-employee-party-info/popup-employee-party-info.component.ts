import { CodxHrService } from './../../codx-hr.service'; 
import { ChangeDetectorRef, Injector } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import{
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,

} from 'codx-core';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'lib-popup-employee-party-info',
  templateUrl: './popup-employee-party-info.component.html',
  styleUrls: ['./popup-employee-party-info.component.css']
})
export class PopupEmployeePartyInfoComponent extends UIComponent implements OnInit {
  funcID;
  idField = 'RecID';
  formGroup: FormGroup
  formModel: FormModel
  employId;
  dialog: DialogRef
  data
  isAfterRender = false
  headerText: ''
  @ViewChild('form') form: CodxFormComponent;
  
  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector)
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected))
   }

   ngAfterViewInit() {
    this.dialog.closed.subscribe(res => {
      if(!res.event){
        this.dialog && this.dialog.close(this.data);
      }
    })
  }

  initForm(){
    this.formGroup.patchValue(this.data);
    this.formModel.currentData = this.data;
    this.cr.detectChanges();
    this.isAfterRender = true;
  }

  onInit(): void {
    this.hrService.getFormModel(this.funcID).then((formModel) => {
      if (formModel) {
        this.formModel = formModel;
        this.hrService
          .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
          .then((fg) => {
            if (fg) {
              this.formGroup = fg;
              this.initForm();
            }
          });
      }
    });
  }

onSaveForm(){
  this.hrService.saveEmployeeUnionAndPartyInfo(this.data).subscribe(p => {
    if(p != null){
      this.notify.notifyCode('SYS007')
      this.dialog.close()
    } else this.notify.notifyCode('SYS021');
  }) 
}
}
