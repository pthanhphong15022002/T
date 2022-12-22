import { SettingCalendarService } from './setting-calender.service';
import {
  Component,
  Injector,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  Input,
  ChangeDetectorRef,
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
import moment from 'moment';
import { CodxShareService } from '../../codx-share.service';

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
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('headerTemp') headerTemp?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  views: Array<ViewModel> | any = [];
  calendarID: string;
  calendarName: string;
  dayWeek = [];
  daysOff = [];
  formModel: FormModel;
  request?: ResourceModel;
  vllPriority = 'TM005';
  startTime: any;
  month: any;
  day: any;
  resourceID: any;
  tempCarName = '';
  listCar = [];
  driverName = '';
  selectBookingAttendees = '';
  listDriver: any[];
  tempDriverName = '';

  @Input() fields = {
    id: 'recID',
    subject: { name: 'memo' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
  };
  @Input() resources!: any;
  @Input() resourceModel!: any;
  @Input() funcID: string;

  constructor(
    private injector: Injector,
    private settingCalendar: SettingCalendarService,
    private codxShareSV: CodxShareService,
    private change: ChangeDetectorRef
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
    this.views = [
      {
        type: ViewType.calendar,
        active: true,
        sameData: false,
        model: {
          eventModel: this.fields,
          template3: this.cellTemplate,
          template: this.cardTemplate,
          resources: this.resources,
          resourceModel: this.resourceModel,
          template8: this.contentTmp,
          template6: this.headerTemp,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  //region EP
  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }

  sameDayCheck(sDate: any, eDate: any) {
    return moment(new Date(sDate)).isSame(new Date(eDate), 'day');
  }
  //endRegion EP

  //region EP_BookingCars
  getResourceName(resourceID: any) {
    this.tempCarName = '';
    this.listCar.forEach((r) => {
      if (r.resourceID == resourceID) {
        this.tempCarName = r.resourceName;
      }
    });
    return this.tempCarName;
  }
  getMoreInfo(recID: any) {
    this.selectBookingAttendees = '';
    this.driverName = ' ';
    this.codxShareSV.getListAttendees(recID).subscribe((attendees: any) => {
      if (attendees) {
        let lstAttendees = attendees;
        lstAttendees.forEach((element) => {
          if (element.roleType != '2') {
            this.selectBookingAttendees =
              this.selectBookingAttendees + element.userID + ';';
          } else {
            this.driverName = this.getDriverName(element.userID);
          }
        });
        if (this.driverName == ' ') {
          this.driverName = null;
        }
        this.change.detectChanges();
      }
    });
  }
  getDriverName(resourceID: any) {
    this.tempDriverName = '';
    if (this.listDriver.length > 0) {
      this.listDriver.forEach((r) => {
        if (r.resourceID == resourceID) {
          this.tempDriverName = r.resourceName;
        }
      });
    }
    return this.tempDriverName;
  }
  //endRegion EP_BookingCars

  //region CO
  getDate(data) {
    if (data.startDate) {
      var date = new Date(data.startDate);
      this.month = this.addZero(date.getMonth() + 1);
      this.day = this.addZero(date.getDate());
      var endDate = new Date(data.endDate);
      let start =
        this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());
      let end =
        this.addZero(endDate.getHours()) +
        ':' +
        this.addZero(endDate.getMinutes());
      this.startTime = start + ' - ' + end;
    }
    return this.startTime;
  }

  addZero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }

  getResourceID(data) {
    var resources = [];
    this.resourceID = '';
    resources = data.resources;
    var id = '';
    if (resources != null) {
      resources.forEach((e) => {
        id += e.resourceID + ';';
      });
    }

    if (id != '') {
      this.resourceID = id.substring(0, id.length - 1);
    }
    return this.resourceID;
  }
  //endRegion CO

  getParams(formName: string, fieldName: string) {
    this.settingCalendar.getParams(formName, fieldName).subscribe((res) => {
      if (res) {
        let dataValue = res[0].dataValue;
        let json = JSON.parse(dataValue);
        if (json.CalendarID && json.CalendarID == '') {
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

  changeCombobox(event) {
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
    this.callfc.openForm(PopupSettingCalendarComponent, '', 1200, 1000, '', [
      this.formModel,
      this.calendarID,
    ]);
  }

  reloadCalendar() {
    alert('trigger');
    (this.viewOrg.currentView as any).schedule?.scheduleObj?.first?.refresh();
  }

  onAction(event: any) {
    if (event?.type == 'navigate') {
      this.codxShareSV.dateChange.next(event.data.fromDate);
    }
  }
}
