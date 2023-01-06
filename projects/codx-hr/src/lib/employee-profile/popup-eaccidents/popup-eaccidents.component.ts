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
  selector: 'lib-popup-eaccidents',
  templateUrl: './popup-eaccidents.component.html',
  styleUrls: ['./popup-eaccidents.component.css'],
})
export class PopupEaccidentsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  grvSetup;
  headerText: '';
  indexSelected;
  dialog: DialogRef;
  accidentObj;
  employeeId: string;
  funcID: string;
  idField: string = 'recID';
  lstAccident;
  actionType;
  data;
  isAfterRender = false;
  @ViewChild('listView') listView: CodxListviewComponent;
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private cr: ChangeDetectorRef,
    private injector: Injector,
    private notitfy: NotificationsService,
    private hrSevice: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.lstAccident = data?.data?.lstAccident;
    this.funcID = data?.data?.funcID;
    this.indexSelected =
      data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;

    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.accidentObj = JSON.parse(
        JSON.stringify(this.lstAccident[this.indexSelected])
      );
    }
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrSevice
        .getDataDefault(this.funcID, this.formModel.entityName, this.idField)
        .subscribe((res) => {
          if (res && res.data) {
            this.accidentObj = res.data;
            this.accidentObj.employeeID = this.employeeId;
            this.formModel.currentData = this.accidentObj;
            this.formGroup.patchValue(this.accidentObj);
            this.isAfterRender = true;
            this.cr.detectChanges();
          }
        });
    } else {
      this.formModel.currentData = this.accidentObj;
      this.formGroup.patchValue(this.accidentObj);
      this.isAfterRender = true;
    }
  }

  onInit(): void {
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
  }

  onSaveForm() {
    
    if (this.actionType === 'copy' || this.actionType === 'add') {
      delete this.accidentObj.recID;
    }
    this.accidentObj.employeeID = this.employeeId;
    console.log(this.accidentObj.employeeID);

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrSevice.AddEmployeeAccidentInfo(this.accidentObj).subscribe((p) => {
        if (p != null) {
          this.accidentObj.recID = p.recID;
          this.notitfy.notifyCode('SYS007');
          this.lstAccident.push(JSON.parse(JSON.stringify(this.accidentObj)));
          if (this.listView) {
            (this.listView.dataService as CRUDService)
              .add(this.accidentObj)
              .subscribe();
          }
          // this.dialog.close(p)
        } else this.notitfy.notifyCode('DM034');
      });
    } else {
      this.hrSevice
        .UpdateEmployeeAccidentInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notitfy.notifyCode('SYS007');
            this.lstAccident[this.indexSelected] = p;
            if (this.listView) {
              (this.listView.dataService as CRUDService)
                .update(this.lstAccident[this.indexSelected])
                .subscribe();
            }
            // this.dialog.close(this.data)
          } else this.notitfy.notifyCode('DM034');
        });
    }
  }

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  afterRenderListView(event: any) {
    this.listView = event;
    console.log(this.listView);
  }

  click(data) {
    console.log('formdata', data);
    this.accidentObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.accidentObj));
    this.indexSelected = this.lstAccident.findIndex(
      (p) => p.recID == this.accidentObj.recID
    );
    this.actionType = 'edit';
    this.formGroup?.patchValue(this.accidentObj);
    this.cr.detectChanges();
  }
}
