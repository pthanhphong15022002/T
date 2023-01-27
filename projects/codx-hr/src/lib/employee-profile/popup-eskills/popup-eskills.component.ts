import { FormGroup } from '@angular/forms';
import { CodxHrService } from '../../codx-hr.service';
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
  selector: 'lib-popup-eskills',
  templateUrl: './popup-eskills.component.html',
  styleUrls: ['./popup-eskills.component.css'],
})
export class PopupESkillsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  skillObj;
  lstSkills;
  indexSelected;
  actionType;
  funcID;
  idField = 'RecID';
  employId;
  isAfterRender = false;
  headerText: '';
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType;
    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
    this.lstSkills = data?.data?.lstESkill;
    this.indexSelected =
      data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;

    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.skillObj = JSON.parse(
        JSON.stringify(this.lstSkills[this.indexSelected])
      );
    }
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
            console.log(this.employId);

            this.skillObj = res?.data;
            this.skillObj.employeeID = this.employId;
            this.formModel.currentData = this.skillObj;
            this.formGroup.patchValue(this.skillObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.skillObj);
        this.formModel.currentData = this.skillObj;
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
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if (this.actionType === 'copy' || this.actionType === 'add') {
      delete this.skillObj.recID;
    }
    this.skillObj.employeeID = this.employId;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.addESlkillInfo(this.skillObj).subscribe((p) => {
        if (p != null) {
          this.skillObj.recID = p.recID;
          this.notify.notifyCode('SYS007');
          this.lstSkills.push(JSON.parse(JSON.stringify(this.skillObj)));
          if (this.listView) {
            (this.listView.dataService as CRUDService)
              .add(this.skillObj)
              .subscribe();
          }
          // this.dialog.close(p)
        } else this.notify.notifyCode('DM034');
      });
    } else {
      this.hrService
        .updateEskillInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.skillObj[this.indexSelected] = p;
            if (this.listView) {
              (this.listView.dataService as CRUDService)
                .update(this.lstSkills[this.indexSelected])
                .subscribe();
            }
            // this.dialog.close(this.data)
          } else this.notify.notifyCode('DM034');
        });
    }
  }

  click(data) {
    console.log('formdata', data);
    this.skillObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.skillObj));
    this.indexSelected = this.lstSkills.findIndex(
      (p) => (p.recID = this.skillObj.recID)
    );
    this.actionType = 'edit';
    this.formGroup?.patchValue(this.skillObj);
    this.cr.detectChanges();
  }

  afterRenderListView(evt) {
    this.listView = evt;
    console.log(this.listView);
  }
}
