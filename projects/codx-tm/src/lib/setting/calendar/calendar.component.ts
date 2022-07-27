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
  DialogRef,
  UIComponent,
} from 'codx-core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

import { CalendarModel, CalendarWeekModel } from '../../models/calendar.model';
import { APICONSTANT } from '@shared/constant/api-const';
import 'lodash';
import { SelectweekComponent } from 'projects/codx-share/src/lib/components/selectweek/selectweek.component';
import { CodxTMService } from '../../codx-tm.service';

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
  startDate: Date = undefined;
  endDate: Date = undefined;
  daySelected: Date;
  user: any;
  minHeight = 525;
  height: number;
  gridView: any;
  dayWeeks = [];
  dayoff = [];
  calendateDate: any;
  dayOff: any;
  scheduleObj: any = undefined;
  dayOffId: string;
  vlls: any;
  funcID: string;
  param: any = 'STD';
  selectedDate = new Date();
  viewBase: any;
  formModel: any;
  cbxName: any;

  constructor(
    private injector: Injector,
    private tmService: CodxTMService,
    private authService: AuthStore,
    private notiService: NotificationsService
  ) {
    super(injector);
    this.user = this.authService.get();
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.getParams();
    this.cache.valueList('L1481').subscribe((res) => {
      this.vlls = res.datas;
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      this.formModel = res;
    });
  }

  ngAfterViewInit(): void {
    this.scheduleObj = this.schedule.scheduleObj;
  }

  getParams() {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.CM',
        'ParametersBusiness',
        'GetOneField',
        ['TM_Parameters', null, 'CalendarID']
      )
      .subscribe((res) => {
        if (res) {
          this.param = res;
          this.calendarID = res.fieldValue;
          this.getDayOff(this.calendarID);
          this.detectorRef.detectChanges();
        }
      });
  }

  getDayOff(id = null) {
    if (id) this.calendarID = id;
    this.api
      .execSv<any>(
        'BS',
        'ERM.Business.BS',
        'CalendarsBusiness',
        'GetDayWeekAsync',
        [this.calendarID]
      )
      .subscribe((res) => {
        if (res) {
          res.forEach(() => {
            this.dayoff = res;
          });
        }
      });
  }

  viewChange(evt: any) {
    let fied = this.gridView?.dateControl || 'DueDate';
    // lấy ra ngày bắt đầu và ngày kết thúc trong evt
    this.startDate = evt?.fromDate;
    this.endDate = evt?.toDate;
    //Thêm vào option predicate
    this.model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.startDate, logic: 'and' },
        { operator: 'lte', field: fied, value: this.endDate, logic: 'and' },
      ],
    };
  }

  getCellContent(evt: any) {
    if (this.dayoff.length > 0) {
      for (let i = 0; i < this.dayoff.length; i++) {
        let day = new Date(this.dayoff[i].startDate);
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
              (item as any).style.backgroundColor = this.dayoff[i].color;
            });
          }
          return (
            '<icon class="' +
            this.dayoff[i].symbol +
            '"></icon>' +
            '<span>' +
            this.dayoff[i].note +
            '</span>'
          );
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
      [this.formModel]
    );
  }

  //Modal setting
  openCalendarSettings() {
    this.callfc.openForm(
      PopupEditCalendarComponent,
      'Lịch làm việc chuẩn',
      1200,
      1000
    );
  }

  changeCombobox(e) {
    // e['data'][0] == ''
    //   ? this.calendarID == 'STD'
    //   : (this.calendarID = e['data'][0]);
    //this.getDayOff(this.calendarID);
  }
}
