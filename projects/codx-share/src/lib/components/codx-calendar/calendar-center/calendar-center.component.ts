import {
  Component,
  OnInit,
  Injector,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import moment from 'moment';
import { CodxShareService } from '../../../codx-share.service';
import { CodxCalendarService } from '../codx-calendar.service';

@Component({
  selector: 'lib-calendar-center',
  templateUrl: './calendar-center.component.html',
  styleUrls: ['./calendar-center.component.scss'],
})
export class CalendarCenterComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  listRoom = [];
  listCar = [];
  listDriver = [];
  views: Array<ViewModel> | any = [];
  fields = {
    id: 'transID',
    subject: { name: 'title' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    status: 'transType',
  };
  resourceID: any;
  tempCarName = '';
  driverName = '';
  selectBookingAttendeesCar = '';
  selectBookingAttendeesRoom = '';
  tempDriverName = '';
  selectBookingItems = [];
  tempRoomName = '';
  funcID: string;
  startTime: any;
  month: any;
  day: any;
  daysOff = [];
  calendarID: string;
  vllPriority = 'TM005';
  dayWeek = [];

  @Input() resources!: any;
  @Input() resourceModel!: any;

  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('headerTemp') headerTemp?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  @ViewChild('view') viewOrg!: ViewsComponent;

  constructor(
    private injector: Injector,
    private codxShareSV: CodxShareService,
    private change: ChangeDetectorRef,
    private codxCalendarSV: CodxCalendarService
  ) {
    super(injector);
    this.router.params.subscribe((params) => {
      if (params) {
        this.funcID = params['funcID'];
        this.cache.functionList(this.funcID).subscribe((res) => {
          if (res) this.getParams(res.module + 'Parameters', 'CalendarID');
        });
      }
    });
  }

  onInit(): void {
    this.codxShareSV.getListResource('1').subscribe((res: any) => {
      if (res) {
        this.listRoom = [];
        this.listRoom = res;
      }
    });
    this.codxShareSV.getListResource('2').subscribe((res: any) => {
      if (res) {
        this.listCar = [];
        this.listCar = res;
      }
    });
    this.codxShareSV.getListResource('3').subscribe((res: any) => {
      if (res) {
        this.listDriver = [];
        this.listDriver = res;
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

  onAction(event: any) {
    if (event?.type == 'navigate' && event.data.fromDate && event.data.toDate) {
      var obj = { fromDate: event.data.fromDate, toDate: event.data.toDate};
      this.codxShareSV.dateChange.next(obj);
    }
  }

  getParams(formName: string, fieldName: string) {
    this.codxCalendarSV.getParams(formName, fieldName).subscribe((res) => {
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
        // this.detectorRef.detectChanges();
      }
    });
  }

  getDayWeek(calendarID: string) {
    // this.codxCalendarSV.getDayWeek(calendarID).subscribe((res) => {
    //   if (res) {
    //     this.dayWeek = res;
    //     (
    //       this.viewOrg?.currentView as any
    //     )?.schedule?.scheduleObj?.first?.refresh();
    //   }
    // });
  }

  getDaysOff(calendarID: string) {
    // this.codxCalendarSV.getDaysOff(calendarID).subscribe((res) => {
    //   if (res) {
    //     this.daysOff = res;
    //     (
    //       this.viewOrg?.currentView as any
    //     )?.schedule?.scheduleObj?.first?.refresh();
    //   }
    // });
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
  getResourceNameCar(resourceID: any) {
    this.tempCarName = '';
    this.listCar.forEach((r) => {
      if (r.resourceID == resourceID) {
        this.tempCarName = r.resourceName;
      }
    });
    return this.tempCarName;
  }

  getMoreInfoBookingCars(recID: any) {
    this.selectBookingAttendeesCar = '';
    this.driverName = ' ';
    this.codxShareSV.getListAttendees(recID).subscribe((attendees: any) => {
      if (attendees) {
        let lstAttendees = attendees;
        lstAttendees.forEach((element) => {
          if (element.roleType != '2') {
            this.selectBookingAttendeesCar =
              this.selectBookingAttendeesCar + element.userID + ';';
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

  getMoreInfoBookingRooms(recID: any) {
    this.selectBookingItems = [];
    this.selectBookingAttendeesRoom = '';

    this.codxShareSV.getListItems(recID).subscribe((item: any) => {
      if (item) {
        this.selectBookingItems = item;
      }
    });
    this.codxShareSV.getListAttendees(recID).subscribe((attendees: any) => {
      if (attendees) {
        let lstAttendees = attendees;
        lstAttendees.forEach((element) => {
          this.selectBookingAttendeesRoom =
            this.selectBookingAttendeesRoom + element.userID + ';';
        });
        this.selectBookingAttendeesRoom;
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

  //region EP_BookingRooms
  getResourceNameRoom(resourceID: any) {
    this.tempRoomName = '';
    this.listRoom.forEach((r) => {
      if (r.resourceID == resourceID) {
        this.tempRoomName = r.resourceName;
      }
    });
    return this.tempRoomName;
  }
  //endRegion EP_BookingRooms

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
}
