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
  selector: 'lib-popup-foreign-worker',
  templateUrl: './popup-foreign-worker.component.html',
  styleUrls: ['./popup-foreign-worker.component.css']
})
export class PopupForeignWorkerComponent extends UIComponent implements OnInit{
  formModel: FormModel;
  dialog: DialogRef;
  // lstWorkPermit: any;
  data: any;
  actionType: string;
  formGroup: FormGroup;
  idField = 'RecID';
  employId: string;
  isAfterRender = false;
  headerText: string = '';
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ){
    super(injector);
    this.formModel = dialog?.FormModel;
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.data = JSON.parse(JSON.stringify(data?.data?.dataObj));
  }
  
  ngAfterViewInit() {
  }

  initForm() {
    this.formGroup.patchValue(this.data);
    this.formModel.currentData = this.data;
    this.cr.detectChanges();
    this.isAfterRender = true;
  }

  onInit(): void {
    if (!this.formModel) {
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
    } else {
      this.hrService
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
    }
  }

  onSaveForm() {
    if(this.formGroup.invalid){
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }
    this.hrService.saveEmployeeForeignWorkerInfo(this.data).subscribe((p) => {
      if (p != null) {
        this.notify.notifyCode('SYS007');
        this.dialog && this.dialog.close(p);
      } else this.notify.notifyCode('SYS021');
    });
  }
}
