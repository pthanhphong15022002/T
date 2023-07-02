import { extend } from '@syncfusion/ej2-base';
import { CodxHrService } from './../../codx-hr.service';
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
  selector: 'lib-popup-ecalculate-salary',
  templateUrl: './popup-ecalculate-salary.component.html',
  styleUrls: ['./popup-ecalculate-salary.component.css'],
})
export class PopupECalculateSalaryComponent
  extends UIComponent
  implements OnInit
{
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data;
  isAfterRender = false;
  headerText: '';
  @ViewChild('form') form: CodxFormComponent;
  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    private cr: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.data = JSON.parse(JSON.stringify(data?.data?.dataObj));
  }
  onInit(): void {
    if (this.formModel) {
      this.hrService
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((res) => {
          if (res) {
            this.formGroup = res;
            this.formModel.currentData = this.data;
            this.formGroup.patchValue(this.data);
            this.isAfterRender = true;
          }
        });
    }
  }

  onSaveForm() {
    if(this.formGroup.invalid){
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }
    this.hrService.saveEmployeeSelfInfo(this.data).subscribe((p) => {
      if (p != null) {
        this.notify.notifyCode('SYS007');
        this.dialog && this.dialog.close(p);
      } else this.notify.notifyCode('SYS023');
    });
  }
}
