import {
  DialogData,
  FormModel,
  DialogRef,
  UIComponent,
  CodxScheduleComponent,
} from 'codx-core';
import { Component, Injector, Optional, ViewChild } from '@angular/core';
import { APICONSTANT } from '@shared/constant/api-const';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { SettingCalendarService } from '../setting-calender.service';

@Component({
  selector: 'popup-add-event',
  templateUrl: './popup-add-event.component.html',
  styleUrls: ['./popup-add-event.component.scss'],
})
export class PopupAddEventComponent extends UIComponent {
  @ViewChild('schedule') schedule: CodxScheduleComponent;
  dialogAddEvent: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  user: any;
  funcID: string;
  evtData: any;
  dayOff: any;
  set = false;
  data: any;
  isAdd: boolean = false;

  constructor(
    private injector: Injector,
    private settingCalendar: SettingCalendarService,
    private fb: FormBuilder,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.dialog = dialog;
    this.data = dt?.data[0];
    this.isAdd = dt?.data[1];
  }

  onInit(): void {
    this.initForm();
  }

  initForm() {
    this.dialogAddEvent = this.fb.group({
      calendar: [Validators.compose([Validators.required])],
      day: [Validators.compose([Validators.required])],
      month: [Validators.compose([Validators.required])],
      color: [Validators.compose([Validators.required])],
      symbol: [Validators.compose([Validators.required])],
      note: [Validators.compose([Validators.required])],
      set: [Validators.compose([Validators.required])],
    });

    if (this.isAdd) {
      this.dialogAddEvent.addControl('dayoffCode', new FormControl(''));
      this.dialogAddEvent.patchValue({
        dayoffCode: this.data.calendarID,
        calendar: '',
        day: 1,
        month: 1,
        color: '#0078FF',
        symbol: '',
        note: '',
      });
    } else {
      const { calendar, day, month, color, symbol, note } = this.data;
      this.dialogAddEvent.addControl('recID', new FormControl(true));
      this.dialogAddEvent.patchValue({
        recID: this.data.recID,
        calendar: calendar,
        day: day,
        month: month,
        color: color,
        symbol: symbol,
        note: note,
      });
    }
  }

  saveDayOff() {
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.DaysOff,
        'SaveDayOffAsync',
        [this.dialogAddEvent.value, this.set]
      )
      .subscribe((res) => {
        if (res) {
          this.dialog.close();
          this.detectorRef.detectChanges();
        }
      });
  }

  valueChange(event) {
    if (event?.field) {
      if (event?.data === Object(event?.data)) {
        if (event.data.value) {
          this.dialogAddEvent.patchValue({
            [event['field']]: event.data.value,
          });
        } else {
          this.dialogAddEvent.patchValue({
            [event['field']]: event.data.fromDate,
          });
        }
      } else this.dialogAddEvent.patchValue({ [event['field']]: event.data });
      if (event?.field == 'set') {
        this.set = event.data;
      }
    }
    this.detectorRef.detectChanges();
  }
}
