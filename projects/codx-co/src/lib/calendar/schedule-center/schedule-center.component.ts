import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { UIComponent, ViewModel, ViewType, ViewsComponent } from 'codx-core';
import { CodxCoService } from '../../codx-co.service';

@Component({
  selector: 'co-schedule-center',
  templateUrl: './schedule-center.component.html',
  styleUrls: ['./schedule-center.component.scss'],
})
export class ScheduleCenterComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('headerTemp') headerTemp?: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader?: TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate?: TemplateRef<any>;
  @ViewChild('cellTemplate') cellTemplate?: TemplateRef<any>;
  @ViewChild('view')
  viewBase: ViewsComponent;

  @Input() events: any;
  @Input() resources!: any;

  views: Array<ViewModel> | any = [];
  fields = {
    id: 'transID',
    subject: { name: 'title' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'resourceID' },
    status: 'transType',
  };
  fields2 = {
    IdField: 'resourceID',
  };
  btnAdd = {
    id: 'btnAdd',
  };
  dayoff: any;
  calendarID = 'STD';
  schedule_center: any;

  constructor(injector: Injector, private coService: CodxCoService) {
    super(injector);
  }

  onInit() {
    this.getDayOff();
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.schedule,
        active: true,
        sameData: false,
        model: {
          eventModel: this.fields,
          resourceModel: this.fields2,
          resources: this.resources,
          resourceDataSource: this.resources,
          template: this.eventTemplate,
          template3: this.cellTemplate,
          template4: this.resourceHeader,
          template6: this.headerTemp,
          template8: this.contentTmp,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

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

      this.coService.dateChange$.next(obj);
    }
  }

  updateData(dataSource: any) {
    let myInterval = setInterval(() => {
      this.schedule_center = (this.viewBase?.currentView as any)?.schedule;
      if (this.schedule_center) {
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
        this.schedule_center.dataSource = dataSource;
        this.schedule_center.resourceDataSource = this.resources;
        this.schedule_center?.setEventSettings();
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
}
