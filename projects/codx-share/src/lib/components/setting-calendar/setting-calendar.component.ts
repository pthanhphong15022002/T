import { CodxEpService } from 'projects/codx-ep/src/public-api';
import { SettingCalendarService } from './setting-calender.service';
import {
  Component,
  Injector,
  AfterViewInit,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import {
  CodxScheduleComponent,
  UIComponent,
  FormModel,
  ViewType,
  ViewModel,
  ResourceModel,
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
  @ViewChild('schedule') schedule: CodxScheduleComponent;
  @ViewChild('eventTemplate') eventTemplate: TemplateRef<any>;
  views: Array<ViewModel> | any = [];
  funcID: string;
  method: string;
  calendarID: string;
  calendarName: string;
  request: ResourceModel;
  fields;
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

    this.request = new ResourceModel();
    this.request.service = 'BS';
    this.request.assemblyName = 'BS';
    this.request.className = 'CalendarDateBusiness';
    this.request.method = 'GetDateOffAsync';
    this.request.idField = 'recID';

    this.fields = {
      note: 'note',
    };
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.calendar,
        active: true,
        sameData: true,
        model: {
          eventModel: this.fields,
          template: this.eventTemplate,
        },
      },
    ];
    this.detectorRef.detectChanges();
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
        this.settingCalendar
          .getCalendarName(this.calendarID)
          .subscribe((res: any) => {
            this.calendarName = res[0].recID;
          });
        //this.getDayWeek(this.calendarID);
        //this.getDaysOff(this.calendarID);
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
}
