import { SettingCalendarService } from './setting-calender.service';
import {
  Component,
  Injector,
  AfterViewInit,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import {
  UIComponent,
  FormModel,
  ViewType,
  ViewModel,
  ViewsComponent,
  ResourceModel,
} from 'codx-core';
import { PopupAddCalendarComponent } from './popup-add-calendar/popup-add-calendar.component';
import { PopupSettingCalendarComponent } from './popup-setting-calendar/popup-setting-calendar.component';

@Component({
  selector: 'setting-calendar',
  templateUrl: './setting-calendar.component.html',
  styleUrls: ['./setting-calendar.component.scss'],
})
export class SettingCalendarComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('view') viewOrg!: ViewsComponent;
  views: Array<ViewModel> | any = [];
  calendarName: string;
  dayWeek = [];
  daysOff = [];
  formModel: FormModel;
  request?: ResourceModel;
  calendarID: string;

  constructor(
    private injector: Injector,
    private settingCalendar: SettingCalendarService
  ) {
    super(injector);
  }

  onInit() {
    this.router.params.subscribe((params) => {
      if (params) {
        this.funcID = params['funcID'];
        this.cache.functionList(this.funcID).subscribe((res) => {
          if (res) {
            this.getParams(res.module);
          }
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.calendar,
        active: true,
        sameData: false,
        model: {
          template3: this.cellTemplate,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  getParams(module: string) {
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetDataValueOfSettingAsync',
        [`${module}Parameters`, null, '1']
      )
      .subscribe((res: any) => {
        if (res) {
          let json = JSON.parse(res);
          if (json.CalendarID && json.CalendarID == '') {
            this.calendarID = 'STD';
          } else {
            this.calendarID = json.CalendarID;
          }
          this.getDayWeek(this.calendarID);
          this.getDaysOff(this.calendarID);
        }
      });
  }

  getDayWeek(calendarID: string) {
    this.settingCalendar.getDayWeek(calendarID).subscribe((res) => {
      if (res) {
        this.dayWeek = res;
        (
          this.viewOrg.currentView as any
        )?.schedule?.scheduleObj?.first?.refresh();
      }
    });
  }

  getDaysOff(calendarID: string) {
    this.settingCalendar.getDaysOff(calendarID).subscribe((res) => {
      if (res) {
        this.daysOff = res;
        (
          this.viewOrg.currentView as any
        )?.schedule?.scheduleObj?.first?.refresh();
      }
    });
  }

  getCellContent(evt: any): string {
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
          var ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach((item) => {
              (item as any).style.color = this.daysOff[i].dayoffColor;
              (item as any).style.backgroundColor =
                this.daysOff[i].dayoffColor + '30';
            });
          }
          let content =
            '<div class="d-flex justify-content-between"><span >' +
            this.daysOff[i].note +
            '</span>' +
            '<span class="' +
            this.daysOff[i].symbol +
            '"></span></div>';
          return content;
        }
      }
    }
    return ``;
  }

  changeCalendar(event) {
    event.data == ''
      ? (this.calendarID = 'STD')
      : (this.calendarID = event.data);
    this.getDaysOff(this.calendarID);
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
    this.callfc.openForm(PopupSettingCalendarComponent, '', 800, 900, '', [
      this.formModel,
      this.calendarID,
    ]);
  }

  reloadCalendar() {
    (this.viewOrg.currentView as any).schedule?.scheduleObj?.first?.refresh();
  }
}
