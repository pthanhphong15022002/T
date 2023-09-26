import {
  Component,
  Injector,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  Input,
} from '@angular/core';
import { UIComponent, ViewModel, ViewType, ViewsComponent } from 'codx-core';
import { CodxCalendarService } from '../codx-calendar.service';

@Component({
  selector: 'lib-calendar-center',
  templateUrl: './calendar-center.component.html',
  styleUrls: ['./calendar-center.component.scss'],
})
export class CalendarCenterComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('headerTemp') headerTemp?: TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate?: TemplateRef<any>;
  @ViewChild('cellTemplate') cellTemplate?: TemplateRef<any>;
  @ViewChild('view')
  viewBase: ViewsComponent;
  @Input() resources: any;
  @Input() resourceModel!: any;

  views: Array<ViewModel> | any = [];
  fields = {
    id: 'transID',
    subject: { name: 'title' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    status: 'transType',
  };
  startTime: any;
  month: any;
  day: any;
  btnAdd = {
    id: 'btnAdd',
  };
  calendar_center: any;
  dayoff: any;
  calendarID = 'STD';

  constructor(
    injector: Injector,
    private calendarService: CodxCalendarService
  ) {
    super(injector);
  }

  onInit(): void {
    this.getDayOff();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.calendar,
        active: true,
        sameData: false,
        model: {
          eventModel: this.fields,
          resources: this.resources,
          resourceModel: this.resourceModel,
          template: this.eventTemplate,
          template3: this.cellTemplate,
          template6: this.headerTemp,
          template8: this.contentTmp,
        },
      },
      {
        type: ViewType.schedule,
        active: true,
        sameData: true,
        model: {},
      },
    ];
    this.detectorRef.detectChanges();
  }

  //navigate scheduler
  onAction(event: any) {
    if (
      event.data.fromDate === 'Invalid Date' &&
      event.data.toDate === 'Invalid Date'
    ) {
      return;
    }
    if (
      (event?.type === 'navigate' &&
        event.data.fromDate &&
        event.data.toDate) ||
      event?.data?.type === undefined
    ) {
      let obj;
      if (event?.data.type === 'Week') {
        let fromDate = new Date(
          event.data.fromDate.setDate(event.data.fromDate.getDate() + 1)
        );
        let toDate = new Date(
          event.data.toDate.setDate(event.data.toDate.getDate() + 1)
        );
        obj = {
          fromDate: fromDate,
          toDate: toDate,
          type: event?.data.type,
        };
      } else {
        obj = {
          fromDate: event.data.fromDate,
          toDate: event.data.toDate,
          type: event?.data.type,
        };
      }

      this.calendarService.dateChange$.next(obj);
    }
  }

  updateData(dataSource: any) {
    let myInterval = setInterval(() => {
      this.calendar_center = (this.viewBase?.currentView as any)?.schedule;
      if (this.calendar_center) {
        clearInterval(myInterval);
        for (const data of dataSource) {
          if (
            data.transType === 'TM_AssignTasks' ||
            data.transType === 'TM_MyTasks'
          ) {
            let tempStartDate = new Date(data.startDate);
            let tempEndDate = new Date(data.endDate);
            data.startDate = new Date(
              tempStartDate.getFullYear(),
              tempStartDate.getMonth(),
              tempStartDate.getDate(),
              tempStartDate.getHours(),
              tempStartDate.getMinutes()
            ).toString();
            data.endDate = new Date(
              tempEndDate.getFullYear(),
              tempEndDate.getMonth(),
              tempEndDate.getDate(),
              tempEndDate.getHours(),
              tempEndDate.getMinutes()
            ).toString();
          }
        }
        this.calendar_center.dataSource = dataSource;
        this.calendar_center?.setEventSettings();
        this.detectorRef.detectChanges();
      }
    });
  }

  //region EP
  showHour(stringDate: any) {
    const date: Date = new Date(stringDate);
    const hours: number = date.getHours();
    const minutes: number = date.getMinutes();

    const timeString: string = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    return timeString;
  }

  //endRegion EP

  //region CO
  getDate(data) {
    if (data.startDate) {
      let date = new Date(data.startDate);
      this.month = this.addZero(date.getMonth() + 1);
      this.day = this.addZero(date.getDate());
      let endDate = new Date(data.endDate);
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
    const permissions = data.permissions;
    const permisstionIDs = permissions
      ? permissions.map((r) => r.objectID)
      : [];
    const res = permisstionIDs.join(';');
    return res;
  }
  //endRegion CO

  getCellContent(evt: any) {
    if (this.dayoff && this.dayoff.length > 0) {
      for (let i = 0; i < this.dayoff.length; i++) {
        let day = new Date(this.dayoff[i].startDate);
        if (
          day &&
          evt.getFullYear() === day.getFullYear() &&
          evt.getMonth() === day.getMonth() &&
          evt.getDate() === day.getDate()
        ) {
          let time = evt.getTime();
          let ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach((item) => {
              (item as any).style.backgroundColor = this.dayoff[i].color;
            });
            return (
              '<icon class="' +
              this.dayoff[i].symbol +
              '"></icon>' +
              '<span>' +
              this.dayoff[i].note +
              '</span>'
            );
          } else {
            return '';
          }
        }
      }
    }

    return ''; // Return a default value if no conditions are met
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
          this.dayoff = res;
        }
      });
  }

  valueChangeCB(e, note, index) {
    for (let i = 0; i < note.checkList.length; i++) {
      if (index == i) note.checkList[i].status = e.data;
    }
    note.createdOn = note.calendarDate;

    // if ((note as any).data != null) {
    //   note.createdOn = (note as any).data.createdOn;
    // }
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        note?.transID,
        note,
      ])
      .subscribe();
  }
}
