import { SettingCalendarService } from './setting-calender.service';
import {
  Component,
  Injector,
  Input,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import {
  CodxScheduleComponent,
  DataRequest,
  UIComponent,
  FormModel,
} from 'codx-core';
import { PopupAddCalendarComponent } from './popup-add-calendar/popup-add-calendar.component';
import { PopupEditCalendarComponent } from './popup-edit-calendar/popup-edit-calendar.component';

@Component({
  selector: 'setting-calendar',
  templateUrl: './setting-calendar.component.html',
  styleUrls: ['./setting-calendar.component.scss'],
})
export class SettingCalendarComponent
  extends UIComponent
  implements AfterViewInit
{
  funcID: string;
  @ViewChild('schedule') schedule: CodxScheduleComponent;
  viewPreset: string = 'weekAndDay';
  calendarID: string;
  calendarName: string;
  currentView = 'Month';
  scheduleObj;
  model = new DataRequest();
  dayWeek = [];
  daysOff = [];
  formModel: FormModel;
  constructor(
    private injector: Injector,
    private settingCalendar: SettingCalendarService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.cache.functionList(this.funcID).subscribe((res) => {
      this.getParams(res.module + 'Parameters', 'CalendarID');
    });
  }

  ngAfterViewInit(): void {
    this.scheduleObj = this.schedule.scheduleObj;
  }

  getParams(formName: string, fieldName: string) {
    this.settingCalendar.getParams(formName, fieldName).subscribe((res) => {
      if (res) {
        let dataValue = res[0].dataValue;
        let json = JSON.parse(dataValue);
        if (json.CalendarID && json.Calendar == '') {
          this.calendarID = 'STD';
        } else {
          this.calendarID = json.CalendarID;
        }
        this.getDayWeek(this.calendarID);
        this.getDaysOff(this.calendarID);
        this.detectorRef.detectChanges();
      }
    });
  }

  getDayWeek(calendarID: string) {
    this.settingCalendar.getDayWeek(calendarID).subscribe((res) => {
      if (res) {
        this.dayWeek = res;
        this.detectorRef.detectChanges();
      }
    });
  }

  getDaysOff(calendarID: string) {
    this.settingCalendar.getDaysOff(calendarID).subscribe((res) => {
      if (res) {
        this.daysOff = res;
        this.detectorRef.detectChanges();
      }
    });
  }

  changeCombobox(event) {
    event.data == ''
      ? (this.calendarID = 'STD')
      : (this.calendarID = event.data);
    this.detectorRef.detectChanges();
  }

  addCalendar() {
    this.callfc.openForm(
      PopupAddCalendarComponent,
      'Tạo lịch làm việc',
      500,
      360,
      '',
      [this.formModel, this.calendarID]
    );
  }

  openCalendarSettings() {
    this.callfc.openForm(
      PopupEditCalendarComponent,
      this.calendarName,
      1200,
      1000,
      '',
      [this.formModel, this.calendarID]
    );
  }

  getCellContent(evt: any) {
    if (this.daysOff.length > 0) {
      for (let i = 0; i < this.daysOff.length; i++) {
        let day = new Date(this.daysOff[i].calendarDate);
        if (
          day &&
          evt.getFullYear() == day.getFullYear() &&
          evt.getMonth() == day.getMonth() &&
          evt.getDate() == day.getDate()
        ) {
          var time = evt.getTime();
          var ele = document.querySelectorAll(
            '[role="gridcell"][data-date="' + time + '"]'
          );
          if (ele.length > 0) {
            ele.forEach((item) => {
              (item as any).style.backgroundColor = this.daysOff[i].color;
            });
          }
          return `<div class="d-flex justify-content-around">
              <div>${this.daysOff[i].note}</div>
              <div class="${this.daysOff[i].symbol}"
            [ngStyle]="{'color': ${this.daysOff[i].dayoffColor}}"></div>
            </div>`;
        }
      }
    }

    return ``;
  }
}
