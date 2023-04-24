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
  startTime: any;
  month: any;
  day: any;
  daysOff = [];
  calendarID: string;
  vllPriority = 'TM005';
  dayWeek = [];
  btnAdd = {
    id: 'btnAdd',
  };

  @Input() resources!: any;
  @Input() resourceModel!: any;

  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('headerTemp') headerTemp?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  @ViewChild('view') viewOrg!: ViewsComponent;

  constructor(
    private injector: Injector,
    private shareService: CodxShareService,
    private codxCalendarSV: CodxCalendarService
  ) {
    super(injector);
  }

  onInit(): void {}

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
    if (
      event.data.fromDate == 'Invalid Date' &&
      event.data.toDate == 'Invalid Date'
    )
      return;
    if (
      (event?.type == 'navigate' && event.data.fromDate && event.data.toDate) ||
      event?.data?.type == undefined
    ) {
      var obj = {
        fromDate: event.data.fromDate,
        toDate: event.data.toDate,
        type: event?.data.type,
      };
      this.shareService.dateChange.next(obj);
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
      }
    });
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
