import 'lodash';
import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import { APICONSTANT } from '@shared/constant/api-const';
import {
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import {
  CalendarDateModel,
  CalendarWeekModel,
  DaysOffModel,
} from '../../../models/calendar.model';
import { PopupAddDayoffsComponent } from '../popup-add-dayoffs/popup-add-dayoffs.component';
import { PopupAddEventComponent } from '../popup-add-event/popup-add-event.component';
import { CodxTMService } from '../../../codx-tm.service';

declare var _;

@Component({
  selector: 'popup-edit-calendar',
  templateUrl: './popup-edit-calendar.component.html',
  styleUrls: ['./popup-edit-calendar.component.scss'],
})
export class PopupEditCalendarComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() calendarID: string = 'STD';
  stShift = new CalendarWeekModel();
  ndShift = new CalendarWeekModel();
  user: any;
  funcID: string;
  data: any;
  dayOffId: string;
  calendateDate: any;
  dayOff: any;
  dayoff = [];
  vlls: any;
  param: any;
  evtCDDate: any;
  dialog!: DialogRef;
  evtData: any;

  constructor(
    private injector: Injector,
    private tmService: CodxTMService,
    private authService: AuthStore,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.user = this.authService.get();
    this.funcID = this.router.snapshot.params['funcID'];
    this.dialog = dialog;
    this.data = dt?.data;
  }

  onInit(): void {
    this.getParams();
    this.cache.valueList('L0012').subscribe((res) => {
      this.vlls = res.datas;
    });
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.Calendars,
        'GetSettingCalendarAsync',
        this.calendarID
      )
      .subscribe((res) => {
        if (res) {
          console.log(res);
          this.dayOff = res[0];
          this.handleWeekDay(res[1]);
          this.calendateDate = res[2];
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

  handleWeekDay(dayOff) {
    this.stShift.startTime = dayOff.stShift.startTimeSt;
    this.stShift.endTime = dayOff.stShift.endTimeSt;
    this.stShift.data = [];
    this.ndShift.startTime = dayOff.ndShift.startTimeNd;
    this.ndShift.endTime = dayOff.ndShift.endTimeNd;
    this.ndShift.data = [];
    this.vlls.forEach((e, i) => {
      let y = (i + 1).toString();
      let stCheck = _.some(dayOff.stShift.data, { weekday: y });
      let ndCheck = _.some(dayOff.ndShift.data, { weekday: y });
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
    this.evtData = new DaysOffModel();
    if (data) this.evtData = { ...data };
    this.evtData.dayoffCode = this.calendarID;
    this.evtData.day = data?.day || 1;
    this.evtData.month = data?.month || 1;
    this.evtData.color = data?.color || '#0078ff';
    this.getDayOff();
    if (this.dayOffId) {
      this.callfc.openForm(
        PopupAddEventComponent,
        'Chỉnh sửa Lễ/Tết/Sự kiện',
        800,
        800,
        '',
        [this.evtData, true]
      );
    } else {
      this.callfc.openForm(
        PopupAddEventComponent,
        'Thêm Lễ/Tết/Sự kiện',
        800,
        800,
        '',
        [this.evtData, false]
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
    this.evtCDDate = new CalendarDateModel();
    if (data) this.evtCDDate = data;
    this.evtCDDate.calendarID = this.calendarID;
    this.evtCDDate.calendarDate = data?.calendarDate
      ? new Date(data.calendarDate)
      : new Date();
    this.evtCDDate.dayoffColor = data?.dayoffColor || '#0078ff';
    this.callfc.openForm(
      PopupAddDayoffsComponent,
      'Thêm ngày nghỉ',
      800,
      800,
      '',
      this.evtCDDate
    );
  }

  removeCalendarDate(item) {
    // this.api
    //   .exec(
    //     APICONSTANT.ASSEMBLY.BS,
    //     APICONSTANT.BUSINESS.BS.CalendarDate,
    //     'DeleteAsync',
    //     item
    //   )
    //   .subscribe((res) => {
    //     if (res) {
    //       this.calendateDate = _.filter(this.calendateDate, function (o) {
    //         return o.recID != item.recID;
    //       });
    //       this.notiService.notifyCode('E0408');
    //     }
    //   });
  }

  saveCalendarDate() {
    const t = this;
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.CalendarDate,
        'SaveCalendarDateAsync',
        this.evtCDDate
      )
      .subscribe((res) => {
        if (res) {
          if (res.isAdd) {
            t.calendateDate.push(res.data);
          } else {
            var index = t.calendateDate.findIndex(
              (p) => p.recID == t.evtCDDate.recID
            );
            t.calendateDate[index] = t.evtCDDate;
          }
          this.dialog.close();
        }
      });
  }

  weekdayChange(e, item) {
    let model = new CalendarWeekModel();
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
