import 'lodash';
import { Component, Injector, Optional } from '@angular/core';
import { APICONSTANT } from '@shared/constant/api-const';
import {
  AuthStore,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { PopupAddDayoffsComponent } from '../popup-add-dayoffs/popup-add-dayoffs.component';
import { PopupAddEventComponent } from '../popup-add-event/popup-add-event.component';
import { BS_CalendarWeekdays } from '../models/BS_CalendarWeekdays.model';
import { BS_DaysOff } from '../models/BS_DaysOff.model';
import { BS_CalendarDate } from '../models/BS_CalendarDate.model';
import { PopupEditShiftComponent } from '../popup-edit-shift/popup-edit-shift.component';

declare var _;

@Component({
  selector: 'popup-edit-calendar',
  templateUrl: './popup-edit-calendar.component.html',
  styleUrls: ['./popup-edit-calendar.component.scss'],
})
export class PopupEditCalendarComponent extends UIComponent {
  calendarID: string;
  headerText: string;
  stShift = new BS_CalendarWeekdays();
  ndShift = new BS_CalendarWeekdays();
  user: any;
  funcID: string;
  data: any;
  dayOffId: string;
  calendarDate: any;
  dayOff: any;
  dayoff = [];
  days: any;
  param: any;
  evtCDDate: any;
  formModel: FormModel;
  dialog!: DialogRef;
  evtData: any;

  constructor(
    private injector: Injector,
    private authService: AuthStore,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.user = this.authService.get();
    this.funcID = this.router.snapshot.params['funcID'];
    this.dialog = dialog;
    const [formModel, calendarID] = dt?.data;
    this.formModel = formModel;
    this.calendarID = calendarID;
  }

  onInit(): void {
    this.getParams();
    this.cache.valueList('L0012').subscribe((res) => {
      this.days = res.datas;
    });
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.Calendars,
        'GetSettingCalendarAsync',
        'STD'
      )
      .subscribe((res) => {
        if (res) {
          debugger;
          this.handleWeekDay(res[0]);
          this.dayOff = res[1];
          this.calendarDate = res[2];
        }
      });
  }

  ngAfterViewInit(): void {}

  getParams() {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.CM',
        'ParametersBusiness',
        'GetOneField',
        ['TMParameters', null, 'CalendarID']
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

  getDayOff(id) {
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

  handleWeekDay(weekday) {
    debugger;
    this.stShift.startTime = weekday.stShift.startTimeSt;
    this.stShift.endTime = weekday.stShift.endTimeSt;
    this.stShift.data = [];
    this.ndShift.startTime = weekday.ndShift.startTimeNd;
    this.ndShift.endTime = weekday.ndShift.endTimeNd;
    this.ndShift.data = [];
    this.days.forEach((e, i) => {
      let y = i.toString();
      let stCheck = _.some(weekday.stShift.data, { weekday: y });
      let ndCheck = _.some(weekday.ndShift.data, { weekday: y });
      this.stShift.data.push({
        weekday: y,
        checked: stCheck,
        shiftType: 1,
      });
      this.ndShift.data.push({
        weekday: y,
        checked: ndCheck,
        shiftType: 2,
      });
    });
    this.detectorRef.detectChanges();
  }

  //Modal event dayoff
  openDayOffs(data = null) {
    this.evtData = new BS_DaysOff();
    if (data) this.evtData = { ...data };
    this.evtData.calendarID = this.calendarID;
    this.getDayOff(this.calendarID);
    if (this.dayOffId) {
      this.callfc.openForm(
        PopupAddEventComponent,
        'Chỉnh sửa Lễ/Tết/Sự kiện',
        550,
        550,
        '',
        [this.evtData, false]
      );
    } else {
      this.callfc.openForm(
        PopupAddEventComponent,
        'Thêm Lễ/Tết/Sự kiện',
        550,
        550,
        '',
        [this.evtData, true]
      );
    }
  }

  removeDayOff(item) {
    this.api
      .exec(
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.DaysOff,
        'DeleteAsync',
        item
      )
      .subscribe((res) => {
        if (res) {
          this.dayOff = _.filter(this.dayOff, function (o) {
            return o.recID != item.recID;
          });
          this.notiService.notifyCode('E0408');
        }
      });
  }

  //Modal calendarDate
  openCalendarDate(data = null) {
    this.evtCDDate = new BS_CalendarDate();
    if (data) this.evtCDDate = data;
    this.evtCDDate.calendarID = this.calendarID;
    if (!this.evtCDDate) {
      this.callfc.openForm(
        PopupAddDayoffsComponent,
        'Thêm ngày nghỉ',
        550,
        420,
        '',
        [this.evtCDDate, true]
      );
    } else {
      this.callfc.openForm(
        PopupAddDayoffsComponent,
        'Chỉnh sửa ngày nghỉ',
        550,
        420,
        '',
        [this.evtCDDate, false]
      );
    }
  }

  removeCalendarDate(item) {
    this.api
      .exec(
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.CalendarDate,
        'DeleteAsync',
        item
      )
      .subscribe((res) => {
        if (res) {
          this.calendarDate = _.filter(this.calendarDate, function (o) {
            return o.recID != item.recID;
          });
          this.notiService.notifyCode('E0408');
        }
      });
  }

  editShift(event, shiftType: string = '1') {
    let startTime, endTime;
    if (shiftType === '1') {
      startTime = this.stShift.startTime;
      endTime = this.stShift.endTime;
    } else {
      startTime = this.ndShift.startTime;
      endTime = this.ndShift.endTime;
    }
    this.callfc.openForm(PopupEditShiftComponent, '', 550, 200, '', [
      startTime,
      endTime,
    ]);
  }

  weekdayChange(e, item) {
    let model = new BS_CalendarWeekdays();
    model.wKTemplateID = this.calendarID;
    model.shiftType = item.shiftType;
    model.weekday = item.weekday;
    let check = e.data.checked;
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.CalendarWeekdays,
        'SaveWeekdaysAsync',
        [model, check]
      )
      .subscribe();
  }

  toggleMoreFunc(id: string) {
    this.dayOffId == id ? (this.dayOffId = '') : (this.dayOffId = id);
  }
}
