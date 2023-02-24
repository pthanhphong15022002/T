import { FormGroup } from '@angular/forms';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { CodxHrService } from '../../codx-hr.service';
import { Injector } from '@angular/core';
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
import { CalendarView } from '@syncfusion/ej2-angular-calendars';

@Component({
  selector: 'lib-popup-efamilies',
  templateUrl: './popup-efamilies.component.html',
  styleUrls: ['./popup-efamilies.component.css'],
})
export class PopupEFamiliesComponent extends UIComponent implements OnInit {
  start: CalendarView = 'Year';
  depth: CalendarView = 'Year';
  format: string = 'MM/yyyy';
  fromdateVal: any;
  todateVal: any;

  formModel: FormModel;
  formGroup: FormGroup;
  employId: string;
  actionType: string;
  dialog: DialogRef;
  // lstFamilyMembers;
  // indexSelected;
  isEmployee = false;
  idField = 'RecID';

  familyMemberObj;
  funcID: string;
  headerText: '';
  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;
  // @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    // this.lstFamilyMembers = data?.data?.lstFamilyMembers;
    // this.indexSelected =
    //   data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;
    this.dialog = dialog;
    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType;
    this.familyMemberObj = JSON.parse(JSON.stringify(data?.data?.familyMemberObj));
    this.formModel = dialog?.FormModel;

    // if (this.actionType == 'edit' || this.actionType == 'copy') {
    //   this.familyMemberObj = JSON.parse(
    //     JSON.stringify(this.lstFamilyMembers[this.indexSelected])
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
            this.familyMemberObj = res?.data;
            this.familyMemberObj.employeeID = this.employId;
            this.formModel.currentData = this.familyMemberObj;
            this.formGroup.patchValue(this.familyMemberObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.familyMemberObj);
        this.formModel.currentData = this.familyMemberObj;
        this.formGroup.patchValue(this.familyMemberObj);
        this.fromdateVal = this.familyMemberObj.registerFrom;
        this.todateVal = this.familyMemberObj.registerTo;
        this.isAfterRender = true;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
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
    } else
      this.hrService
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
  }

  onSaveForm() {
    let today = new Date();

    this.familyMemberObj.registerFrom = this.fromdateVal;
    this.familyMemberObj.registerTo = this.todateVal;

    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if (this.familyMemberObj.birthday >= today) {
      this.notify.notifyCode('HR004');
      return;
    }

    this.familyMemberObj.employeeID = this.employId;

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService
        .AddEmployeeFamilyInfo(this.familyMemberObj)
        .subscribe((p) => {
          if (p != null) {
            // this.familyMemberObj.recID = p.recID;
            this.notify.notifyCode('SYS006');
            // this.lstFamilyMembers.push(
            //   JSON.parse(JSON.stringify(this.familyMemberObj))
            // );
            // if (this.listView) {
            //   (this.listView.dataService as CRUDService)
            //     .add(this.familyMemberObj)
            //     .subscribe();
            // }
            // this.dialog.close(p)
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS023');
        });
    } else {
      this.hrService
        .UpdateEmployeeFamilyInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            // this.lstFamilyMembers[this.indexSelected] = p;
            // if (this.listView) {
            //   (this.listView.dataService as CRUDService)
            //     .update(this.lstFamilyMembers[this.indexSelected])
            //     .subscribe();
            // }
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  // click(data) {
  //   console.log('formdata', data);
  //   this.familyMemberObj = data;
  //   this.formModel.currentData = JSON.parse(
  //     JSON.stringify(this.familyMemberObj)
  //   );
  //   // this.indexSelected = this.lstFamilyMembers.findIndex(
  //   //   (p) => (p.recID = this.familyMemberObj.recID)
  //   // );
  //   this.fromdateVal = this.familyMemberObj.registerFrom;
  //   this.todateVal = this.familyMemberObj.registerTo;
  //   this.actionType = 'edit';
  //   this.formGroup?.patchValue(this.familyMemberObj);
  //   this.cr.detectChanges();
  // }

  focus(evt) {
    let isChecked = evt.checked;
    if (isChecked == true) {
      this.isEmployee = true;
    } else {
      this.isEmployee = false;
    }
    this.cr.detectChanges();
  }

  onSelectEmployee(evt) {
    console.log('sau khi chon nhan vien', evt);
    this.familyMemberObj.relationName =
      evt.component.itemsSelected[0].EmployeeName;
    this.familyMemberObj.gender = evt.component.itemsSelected[0].Gender;
    this.familyMemberObj.birthday = evt.component.itemsSelected[0].Birthday;
    this.familyMemberObj.nationalityID =
      evt.component.itemsSelected[0].NationalityID;
    this.familyMemberObj.mobile = evt.component.itemsSelected[0].Mobile;
    this.familyMemberObj.personalEmail =
      evt.component.itemsSelected[0].PersonalEmail;
    this.familyMemberObj.idIssuedOn = evt.component.itemsSelected[0].IssuedOn;
    this.familyMemberObj.idCardNo = evt.component.itemsSelected[0].IDCardNo;
    this.familyMemberObj.idIssuedBy = evt.component.itemsSelected[0].IssuedBy;
    this.familyMemberObj.pitNumber = evt.component.itemsSelected[0].PITNumber;
    this.familyMemberObj.siRegisterNo =
      evt.component.itemsSelected[0].SIRegisterNo;
    console.log('this family obj', this.familyMemberObj);
    this.formGroup.patchValue(this.familyMemberObj);
    this.cr.detectChanges();
  }

  // afterRenderListView(evt) {
  //   this.listView = evt;
  //   console.log(this.listView);
  // }

  UpdateRegisterFrom(e) {
    this.fromdateVal = e;
  }
  UpdateRegisterTo(e) {
    this.todateVal = e;
  }
}
