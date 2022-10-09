import { Component, Injector, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'popup-edit-shift',
  templateUrl: './popup-edit-shift.component.html',
  styleUrls: ['./popup-edit-shift.component.scss'],
})
export class PopupEditShiftComponent extends UIComponent {
  title = '';
  //title = 'Thiết lập thời gian ca làm việc';
  subHeader = '';
  //subHeader = 'Cho phép thiết lập thời gian ca làm việc';
  dialogEditShift: FormGroup;
  dialog!: DialogRef;
  data;
  startTime;
  endTime;
  beginHour = 0;
  beginMinute = 0;
  endHour = 24;
  endMinute = 59;
  isAfterRender: boolean = false;
  constructor(
    private injector: Injector,
    private fb: FormBuilder,
    private notificationsService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.data = dt?.data;
    this.dialog = dialog;
    this.startTime = this.data[0];
    this.endTime = this.data[1];
  }

  onInit(): void {
    this.initForm();
  }

  initForm() {
    this.dialogEditShift = this.fb.group({
      startTime: ['', Validators.compose([Validators.required])],
      endTime: ['', Validators.compose([Validators.required])],
    });
    this.dialogEditShift.patchValue({ startTime: this.startTime });
    this.dialogEditShift.patchValue({ endTime: this.endTime });
    this.isAfterRender = true;
  }

  checkLoopS: boolean;
  checkLoopE: boolean;

  valueStartTimeChange(event: any) {
    if (event?.data) {
      this.startTime = event.data.fromDate;
      this.beginHour = parseInt(this.startTime.split(':')[0]);
      this.beginMinute = parseInt(this.startTime.split(':')[1]);
    }
    if (this.beginHour > this.endHour) {
      this.checkLoopS = !this.checkLoopS;
      if (!this.checkLoopS) {
        this.notificationsService.notifyCode('EP003');
        return;
      }
    } else if (
      this.beginHour == this.endHour &&
      this.beginMinute >= this.endMinute
    ) {
      this.checkLoopS = !this.checkLoopS;
      if (!this.checkLoopS) {
        this.notificationsService.notifyCode('EP003');
        return;
      }
    }
  }

  valueEndTimeChange(event: any) {
    if (event?.data) {
      this.endTime = event.data.toDate;
      this.endHour = parseInt(this.endTime.split(':')[0]);
      this.endMinute = parseInt(this.endTime.split(':')[1]);
    }
    if (this.beginHour > this.endHour) {
      this.checkLoopE = !this.checkLoopE;
      if (!this.checkLoopE) {
        this.notificationsService.notifyCode('EP003');
        return;
      }
    } else if (
      this.beginHour == this.endHour &&
      this.beginMinute >= this.endMinute
    ) {
      this.checkLoopE = !this.checkLoopE;
      if (!this.checkLoopE) {
        this.notificationsService.notifyCode('EP003');
        return;
      }
    }
  }

  onSaveForm() {
    console.log(this.dialogEditShift.value);
    this.api
      .exec('EP', 'ResourceQuotaBusiness', 'AddResourceQuotaAsync', [
        this.dialogEditShift.value,
      ])
      .subscribe((res) => {
        console.log(res);
      });
  }
}
