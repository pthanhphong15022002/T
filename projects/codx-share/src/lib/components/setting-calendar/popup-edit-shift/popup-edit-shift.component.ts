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
  title = 'Thiết lập thời gian ca làm việc';
  subHeader = 'Cho phép thiết lập thời gian ca làm việc';
  dialog!: DialogRef;
  data;
  shiftType: string;
  calendarID: string;
  startTime;
  endTime;
  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.data = dt?.data;
    this.dialog = dialog;
    this.calendarID = this.data[0];
    this.shiftType = this.data[1];
    this.startTime = this.data[2];
    this.endTime = this.data[3];
  }

  onInit(): void {}

  valueChange(event: any, field: string = '') {
    if (event?.data) {
      if (this.startTime > this.endTime) {
        this.notificationsService.notifyCode('TM036');
        return;
      }

      if (field == 'startTime') {
        this.startTime = event.data.fromDate;
      }

      if (field == 'endTime') {
        this.endTime = event.data.fromDate;
      }
    }
  }

  onSaveForm() {
    if (this.startTime > this.endTime) {
      this.notificationsService.notifyCode('TM036');
      return;
    }
    this.api
      .exec('BS', 'CalendarWeekdaysBusiness', 'UpdateShiftAsync', [
        this.calendarID,
        this.shiftType,
        this.startTime,
        this.endTime,
      ])
      .subscribe((res) => {
        this.detectorRef.detectChanges();
        this.dialog.close({ test: 'test' });
      });
  }
}
