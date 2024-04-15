import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { Injector, AfterViewInit } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'lib-popup-efamilies',
  templateUrl: './popup-efamilies.component.html',
  styleUrls: ['./popup-efamilies.component.css'],
})
export class PopupEFamiliesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('imageUpLoad') imageUpLoad: ImageViewerComponent;
  fromdateVal: any;
  todateVal: any;
  deadMonthVal: any;
  formModel: FormModel;
  employId: string;
  actionType: string;
  disabledInput = false;
  dialog: DialogRef;
  fieldHeaderTexts;
  changedInForm = false;
  isEmployee = false;
  data: any;
  headerText: '';
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('registerFromDatePicker') registerFromDatePicker: ElementRef;
  @ViewChild('registerToDatePicker') registerToDatePicker: ElementRef;

  constructor(
    injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType;
    if (this.actionType == 'view') {
      this.disabledInput = true;
    }
    this.data = data?.data?.familyMemberObj;
    this.dialog.dataService.dataSelected = data;
    this.formModel = dialog?.formModel;
  }

  ngAfterViewInit(): void {}

  initForm() {
    if (this.actionType == 'add') {
      this.dialog.dataService.addNew().subscribe((res: any) => {
        if (res) {
          this.data = res;
          this.data.employeeID = this.employId;
        }
      });
    } else if (this.actionType == 'copy') {
      this.dialog.dataService.copy().subscribe((res: any) => {
        if (res) {
          this.data = res;
          this.data.employeeID = this.employId;
        }
      });
    } else if (this.actionType == 'edit') {
      this.dialog.dataService.edit(this.data).subscribe((res: any) => {
        if (res) {
          this.data = res;
          this.data.employeeID = this.employId;
        }
      });
    }
  }

  onInit(): void {
    this.initForm();
    this.hrService.getHeaderText(this.funcID).then((res) => {
      this.fieldHeaderTexts = res;
    });
  }

  onSaveForm() {
    let now = new Date();
    if (this.data.birthday >= now.toJSON()) {
      this.notify.notifyCode('HR004');
      return;
    }

    if (this.data.passportIssuedOn > now.toISOString()) {
      this.notify.notifyCode(
        'HR014',
        0,
        this.fieldHeaderTexts['PassportIssuedOn']
      );
      return;
    }

    if (this.data.IDIssuedOn > now.toISOString()) {
      this.notify.notifyCode('HR014', 0, this.fieldHeaderTexts['IDIssuedOn']);
      return;
    }

    if (this.data.isEmergency == true) {
      if (!this.data.mobile) {
        this.notify.notifyCode('HR013');
        return;
      }
    }
    this.form.save(null, 0, '', '', true).subscribe((res) => {
      if (res.save?.data || res.update?.data) {
        if (this.imageUpLoad?.imageUpload?.item) {
          this.imageUpLoad
            .updateFileDirectReload(this.data.recID)
            .subscribe((img) => {
              this.dialog &&
                this.dialog.close(res.save?.data || res.update?.data);
            });
        }
        return (
          this.dialog && this.dialog.close(res.save?.data || res.update?.data)
        );
      }

      if (this.imageUpLoad?.imageUpload?.item && this.actionType == 'edit') {
        this.imageUpLoad
          .updateFileDirectReload(this.data.recID)
          .subscribe((img) => {
            this.dialog &&
              this.dialog.close(res.save?.data || res.update?.data);
          });
      }
      this.dialog && this.dialog.close();
    });
  }

  changeAvatar(event: any) {
    if (event) {
      this.changedInForm = true;
    }
  }

  onSelectEmployee(evt) {
    this.data.relationName = evt.component.itemsSelected[0].EmployeeName;
    this.data.gender = evt.component.itemsSelected[0].Gender;
    this.data.birthday = evt.component.itemsSelected[0].Birthday;
    this.data.nationalityID = evt.component.itemsSelected[0].NationalityID;
    this.data.mobile = evt.component.itemsSelected[0].Mobile;
    this.data.personalEmail = evt.component.itemsSelected[0].PersonalEmail;
    this.data.idIssuedOn = evt.component.itemsSelected[0].IssuedOn;
    this.data.idCardNo = evt.component.itemsSelected[0].IDCardNo;
    this.data.idIssuedBy = evt.component.itemsSelected[0].IssuedBy;
    this.data.pitNumber = evt.component.itemsSelected[0].PITNumber;
    this.data.siRegisterNo = evt.component.itemsSelected[0].SIRegisterNo;
    this.form.formGroup.patchValue(this.data);
  }
}
