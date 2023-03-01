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
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

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
  ops = ['m', 'y'];

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
    this.skillObj = data?.data.dataInput;
    this.indexSelected =
      data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;

    // if (this.actionType === 'edit' || this.actionType === 'copy') {
    //   this.skillObj = JSON.parse(
    //     JSON.stringify(this.lstSkills[this.indexSelected])
    //   );
    // }
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
    this.formGroup.patchValue({
      trainFromDate: new Date(),
      trainToDate: new Date(),
    });
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    this.skillObj.employeeID = this.employId;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.addESlkillInfo(this.skillObj).subscribe((p) => {
        console.log('save eSkill', p);
        if (p != null) {
          this.skillObj = p[0];
          this.lstSkills = p[1];
          this.notify.notifyCode('SYS006');
          this.skillObj.isSuccess = true;
          console.log('skil OBJjjjjjjjjj', this.skillObj);
          console.log('lst e skilllllllllll', this.lstSkills);
          console.log('succcess', this.skillObj.isSuccess);
          this.dialog && this.dialog.close([this.skillObj, this.lstSkills]);
        } else {
          this.notify.notifyCode('SYS023');
          this.skillObj.isSuccess = false;
        }
      });
    } else {
      this.hrService
        .updateEskillInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.skillObj = p[0];
            this.lstSkills = p[1];
            this.notify.notifyCode('SYS007');
            this.skillObj.isSuccess = true;
            this.dialog && this.dialog.close(this.skillObj);
          } else {
            this.notify.notifyCode('SYS021');
            this.skillObj.isSuccess = false;
          }
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

  Date(date) {
    return new Date(date);
  }

  changeCalendar(event, changeType: string) {
    let yearFromDate = event.fromDate.getFullYear();
    let monthFromDate = event.fromDate.getMonth() + 1;
    let dayFromDate = event.fromDate.getDate();
    var strYear = `${yearFromDate}`;
    var strMonth = `${yearFromDate}/${monthFromDate}`;
    var strDay = `${yearFromDate}/${monthFromDate}/${dayFromDate}`;
    console.log('asdsadasdasdasdsad', strYear, strMonth, strDay);

    if (changeType === 'FromDate') {
      if (event.type === 'year') {
        this.skillObj.trainFrom = strYear;
      } else if (event.type === 'month') {
        this.skillObj.trainFrom = strMonth;
      } else {
        this.skillObj.trainFrom = strDay;
      }
      this.skillObj.trainFromDate = event.fromDate;
    } else if (changeType === 'ToDate') {
      if (event.type === 'year') {
        this.skillObj.trainTo = strYear;
      } else if (event.type === 'month') {
        this.skillObj.trainTo = strMonth;
      } else {
        this.skillObj.trainTo = strDay;
      }
      this.skillObj.trainToDate = event.fromDate;
    }
  }
}
