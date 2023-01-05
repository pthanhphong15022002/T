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
  lstWorkPermit: any;
  data;
  actionType;
  formGroup: FormGroup;
  idField = 'RecID';
  funcID;
  employId;
  isAfterRender = false;
  headerText: '';
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;
  indexSelected: any;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    // if(!this.formModel){
    //   this.formModel = new FormModel();
    //   this.formModel.formName = 'EWorkPermits'
    //   this.formModel.entityName = 'HR_EWorkPermits'
    //   this.formModel.gridViewName = 'grvEWorkPermits'
    // }
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    this.employId = data?.data?.employeeId;
    this.lstWorkPermit = data?.data?.lstWorkPermit;
    this.indexSelected =
      data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;
    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.data = JSON.parse(
        JSON.stringify(this.lstWorkPermit[this.indexSelected])
      );
      // console.log('dataselected ', this.data);

      // this.formModel.currentData = this.data
    }
    // console.log('employeeId', this.employId);
    // console.log('formModel', this.formModel);
  }

  initForm() {
    // this.hrService
    // .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    // .then((item) => {
    //   this.formGroup = item;
    //   console.log('formGroup', this.formGroup);
    //   if(this.actionType === 'add'){
    //     this.hrService.getEmployeeWorkingLisenceModel().subscribe(p => {
    //       console.log('thong tin giay phep lao dong', p);
    //       this.data = p;
    //       this.formModel.currentData = this.data
    //       console.log('du lieu formmodel', this.formModel.currentData);
    //     })
    //   }
    //   this.formGroup.patchValue(this.data)
    //   this.isAfterRender = true
    // })

    if (this.actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res) => {
          if (res) {
            this.data = res?.data;
            this.data.employeeID = this.employId;
            this.formModel.currentData = this.data;
            this.formGroup.patchValue(this.data);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.data);
        this.formModel.currentData = this.data;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
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

  onSaveForm() {
    // if (this.formGroup.invalid) {
    //   this.hrService.notifyInvalid(this.formGroup, this.formModel);
    //   return;
    // }

    if (this.actionType == 'copy' || this.actionType === 'add') {
      delete this.data.recID;
    }
    this.data.employeeID = this.employId;
    if (this.actionType == 'add' || this.actionType == 'copy') {
      this.hrService.addEmployeeWorkPermitDetail(this.data).subscribe((p) => {
        if (p != null) {
          this.data.recID = p.recID;
          this.notify.notifyCode('SYS007');
          this.lstWorkPermit.push(JSON.parse(JSON.stringify(this.data)));

          if (this.listView) {
            (this.listView.dataService as CRUDService)
              .add(this.data)
              .subscribe();
          }
          // this.dialog.close(p);
        } else this.notify.notifyCode('DM034');
      });
    } else {
      this.hrService
        .updateEmployeeWorkPermitDetail(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.lstWorkPermit[this.indexSelected] = p;
            if (this.listView) {
              (this.listView.dataService as CRUDService)
                .update(this.lstWorkPermit[this.indexSelected])
                .subscribe();
            }
            // this.dialog.close(this.data)
          } else this.notify.notifyCode('DM034');
        });
    }
  }

  afterRenderListView(evt) {
    this.listView = evt;
    console.log(this.listView);
  }

  click(data) {
    console.log('formdata', data);
    this.data = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.data));
    this.indexSelected = this.lstWorkPermit.findIndex(
      (p) => p.recID == this.data.recID
    );
    this.actionType = 'edit';
    this.formGroup?.patchValue(this.data);
    this.cr.detectChanges();
  }
}
