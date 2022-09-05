import { PopupEditCalendarComponent } from './popup-edit-calendar/popup-edit-calendar.component';
import { PopupAddCalendarComponent } from './popup-add-calendar/popup-add-calendar.component';
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
  Injector,
} from '@angular/core';
import {
  AuthStore,
  NotificationsService,
  CodxScheduleComponent,
  DataRequest,
  UIComponent,
} from 'codx-core';

import { CalendarModel, CalendarWeekModel } from '../../models/calendar.model';
import { APICONSTANT } from '@shared/constant/api-const';
import 'lodash';
import { SelectweekComponent } from 'projects/codx-share/src/lib/components/selectweek/selectweek.component';
import { CodxTMService } from '../../codx-tm.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'setting-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() viewPreset: string = 'weekAndDay';
  @Input() calendarID: string;
  @ViewChild(SelectweekComponent) selectweekComponent: SelectweekComponent;
  @ViewChild('schedule') schedule: CodxScheduleComponent;

  stShift = new CalendarWeekModel();
  ndShift = new CalendarWeekModel();
  modelCalendar = new CalendarModel();
  model = new DataRequest();
  today: Date = new Date();
  daySelected: Date;
  user: any;
  minHeight = 525;
  height: number;
  gridView: any;
  dayWeek = [];
  daysoff = [];
  calendateDate: any;
  scheduleObj: any = undefined;
  vlls: any;
  funcID: string;
  param: any = 'STD';
  selectedDate = new Date();
  viewBase: any;
  formModel: any;
  cbxName: any;
  currentView = 'TimelineYear';
  constructor(
    private injector: Injector,
    private tmService: CodxTMService,
    private authService: AuthStore,
    private route: ActivatedRoute
  ) {
    super(injector);
    this.user = this.authService.get();
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.route.params.subscribe((routeParams) => {
      var state = history.state;
      if (state) {
        this.calendarID = state.dataValue || '';
        this.cache.valueList('L1481').subscribe((res) => {
          this.vlls = res.datas;
        });
        this.tmService.getFormModel(this.funcID).then((res) => {
          this.formModel = res;
          const { formName, gridViewName } = this.formModel;
          this.tmService
            .getComboboxName(formName, gridViewName)
            .then((res) => {});
        });
        this.getParams();
      }
    });
  }

  ngAfterViewInit(): void {
    this.scheduleObj = this.schedule.scheduleObj;
  }

  getParams() {
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.SYS,
        APICONSTANT.ASSEMBLY.CM,
        APICONSTANT.BUSINESS.CM.Parameters,
        'GetOneField',
        ['TMParameters', null, 'CalendarID']
      )
      .subscribe((res) => {
        if (res) {
          this.param = res;
          this.calendarID = res.fieldValue;
          this.getDayWeek(this.calendarID);
          this.getDaysOff(this.calendarID);
          this.detectorRef.detectChanges();
        }
      });
  }

  getDayWeek(id) {
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.Calendars,
        'GetDayWeekAsync',
        [id]
      )
      .subscribe((res) => {
        if (res) {
          this.dayWeek = res;
        }
      });
  }

  getDaysOff(id) {
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.CalendarDate,
        'GetDateOffAsync',
        [id]
      )
      .subscribe((res) => {
        if (res) {
          this.daysoff = res;
        }
      });
  }

  getCellContent(evt: any) {
    if (this.daysoff.length > 0) {
      for (let i = 0; i < this.daysoff.length; i++) {
        let day = new Date(this.daysoff[i].calendarDate);
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
              (item as any).style.backgroundColor = this.daysoff[i].color;
            });
          }
          return `<div class="d-flex justify-content-around">
              <div>${this.daysoff[i].note}</div>
              <div class="${this.daysoff[i].symbol}"
            [ngStyle]="{'color': ${this.daysoff[i].dayoffColor}}"></div>
            </div>`;
        }
      }
    }

    return ``;
  }

  // modal
  addCalendar() {
    this.callfc.openForm(
      PopupAddCalendarComponent,
      'Tạo lịch làm việc',
      500,
      400,
      '',
      [this.formModel, this.calendarID]
    );
  }

  //Modal setting
  openCalendarSettings() {
    this.callfc.openForm(
      PopupEditCalendarComponent,
      'Lịch làm việc chuẩn',
      1200,
      1000,
      '',
      [this.formModel, this.calendarID]
    );
  }

  changeCombobox(e) {
    e['data'][0] == ''
      ? this.calendarID == 'STD'
      : (this.calendarID = e['data'][0]);
  }
}
