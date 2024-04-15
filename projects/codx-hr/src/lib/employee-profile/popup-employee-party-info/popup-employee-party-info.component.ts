import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { ChangeDetectorRef, Injector } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
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
  styleUrls: ['./popup-employee-party-info.component.css'],
})
export class PopupEmployeePartyInfoComponent
  extends UIComponent
  implements OnInit
{
  idField = 'RecID';
  // formGroup: FormGroup;
  formModel: FormModel;
  employId;
  dialog: DialogRef;
  data;
  // isAfterRender = false;
  headerText: '';
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    debugger
    this.formModel = dialog?.formModel;
    console.log('form model nhan vao', this.formModel);
    
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.data = JSON.parse(JSON.stringify(data?.data?.dataObj));
  }

  ngAfterViewInit() {
  }

  initForm() {
    // this.form.formGroup.patchValue(this.data);
    // this.formModel.currentData = this.data;
    this.cr.detectChanges();
    // this.isAfterRender = true;
  }

  onInit(): void {
    this.initForm();

    // if (!this.formModel) {
    //   this.hrService.getFormModel(this.funcID).then((formModel) => {
    //     if (formModel) {
    //       this.formModel = formModel;
    //       this.hrService
    //         .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
    //         .then((fg) => {
    //           if (fg) {
    //             this.formGroup = fg;
    //             this.initForm();
    //           }
    //         });
    //     }
    //   });
    // } else {
    //   this.hrService
    //     .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
    //     .then((fg) => {
    //       if (fg) {
    //         this.formGroup = fg;
    //         this.initForm();
    //       }
    //     });
    // }
  }

  onSaveForm() {
    if(this.form.formGroup.invalid){
      this.hrService.notifyInvalid(this.form.formGroup, this.formModel);
      this.form.validation(false);
      return;
    }
    this.hrService.saveEmployeeUnionAndPartyInfo(this.data).subscribe((p) => {
      if (p != null) {
        this.notify.notifyCode('SYS007');
        this.dialog && this.dialog.close(p);
      } else this.notify.notifyCode('SYS021');
    });
  }
}
