import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { Injector, ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'lib-popup-ework-permits',
  templateUrl: './popup-ework-permits.component.html',
  styleUrls: ['./popup-ework-permits.component.css'],
})
export class PopupEWorkPermitsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  dialog: DialogRef;
  // lstWorkPermit: any;
  data: any;
  actionType: string;
  // formGroup: FormGroup;
  disabledInput = false;
  idField = 'RecID';
  employId: string;
  // isAfterRender = false;
  headerText: string = '';
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    if(this.actionType == 'view'){
      this.disabledInput = true;
    }
    this.employId = data?.data?.employeeId;
    this.formModel = dialog.formModel;
    this.data = JSON.parse(JSON.stringify(data?.data?.workPermitObj));
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.data = res?.data;

            this.data.employeeID = this.employId;
            this.data.fromDate = null;
            this.data.toDate = null;

            // this.formModel.currentData = this.data;
            // this.form.formGroup.patchValue(this.data);
            this.cr.detectChanges();
            // this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy' || this.actionType === 'view') {
        if (this.actionType == 'copy') {
          if (this.data.fromDate == '0001-01-01T00:00:00') {
            this.data.fromDate = null;
          }
          if (this.data.toDate == '0001-01-01T00:00:00') {
            this.data.toDate = null;
          }
        }

        // this.form.formGroup.patchValue(this.data);
        // this.formModel.currentData = this.data;
        this.cr.detectChanges();
        // this.isAfterRender = true;
      }
    }

    // this.hrService
    //   .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
    //   .then((item) => {
    //     if (item) {
    //       this.form.formGroup = item;
    //       if (this.actionType == 'add') {
    //         this.hrService
    //           .getDataDefault(
    //             this.formModel.funcID,
    //             this.formModel.entityName,
    //             this.idField
    //           )
    //           .subscribe((res: any) => {
    //             if (res) {
    //               this.data = res?.data;

    //               this.data.employeeID = this.employId;
    //               this.data.fromDate = null;
    //               this.data.toDate = null;

    //               // this.formModel.currentData = this.data;
    //               this.form.formGroup.patchValue(this.data);
    //               this.cr.detectChanges();
    //               // this.isAfterRender = true;
    //             }
    //           });
    //       } else {
    //         if (this.actionType === 'edit' || this.actionType === 'copy' || this.actionType === 'view') {
    //           if (this.actionType == 'copy') {
    //             if (this.data.fromDate == '0001-01-01T00:00:00') {
    //               this.data.fromDate = null;
    //             }
    //             if (this.data.toDate == '0001-01-01T00:00:00') {
    //               this.data.toDate = null;
    //             }
    //           }

    //           this.form.formGroup.patchValue(this.data);
    //           // this.formModel.currentData = this.data;
    //           this.cr.detectChanges();
    //           // this.isAfterRender = true;
    //         }
    //       }
    //       // this.form.formGroup.patchValue(this.data);
    //       // this.formModel.currentData = this.data;
    //       // this.cr.detectChanges();
    //       // this.isAfterRender = true;
    //     } 
    //   });
  }

  onInit(): void {
    this.initForm();

    // if (!this.formModel)
    //   this.hrService.getFormModel(this.funcID).then((formModel) => {
    //     if (formModel) {
    //       this.formModel = formModel;
    //       console.log('formModel ne', this.formModel);
          
    //       this.hrService
    //         .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
    //         .then((fg) => {
    //           if (fg) {
    //             debugger
    //             this.form.formGroup = fg;
    //             this.initForm();
    //           }
    //         });
    //     }
    //   });
    // else this.initForm();
  }

  onSaveForm() {
    if (this.form.formGroup.invalid) {
      this.hrService.notifyInvalid(this.form.formGroup, this.formModel);
      this.form.validation(false)
      return;
    }

    this.data.employeeID = this.employId;
    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.hrService.addEmployeeWorkPermitDetail(this.data).subscribe((p) => {
        if (p != null) {
          this.data.recID = p.recID;
          this.notify.notifyCode('SYS006');
          this.dialog && this.dialog.close(p);
        } else this.notify.notifyCode('SYS023');
      });
    } else {
      this.hrService
        .updateEmployeeWorkPermitDetail(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  // afterRenderListView(evt) {
  //   this.listView = evt;
  //   console.log(this.listView);
  // }

  // click(data) {
  //   console.log('formdata', data);
  //   this.data = data;
  //   this.formModel.currentData = JSON.parse(JSON.stringify(this.data));
  //   this.indexSelected = this.lstWorkPermit.findIndex(
  //     (p) => p.recID == this.data.recID
  //   );
  //   this.actionType = 'edit';
  //   this.form.formGroup?.patchValue(this.data);
  //   this.cr.detectChanges();
  // }
}
