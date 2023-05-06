import {
  Component,
  Injector,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  Input,
} from '@angular/core';
import { UIComponent, ViewModel, ViewType,ViewsComponent } from 'codx-core';
import { CodxShareService } from '../../../codx-share.service';

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
  @ViewChild('view') viewBase: ViewsComponent;
  @Input() resources!: any;
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
  vllPriority = 'TM005';
  calendar_center: any;

  constructor(injector: Injector, private shareService: CodxShareService) {
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
          resources: this.resources,
          resourceModel: this.resourceModel,
          template: this.eventTemplate,
          template6: this.headerTemp,
          template8: this.contentTmp,
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

  updateData(dataSource: any) {
    let myInterval = setInterval(() => {
      this.calendar_center = (this.viewBase?.currentView as any)?.schedule;
      if (this.calendar_center) {
        clearInterval(myInterval);
        this.calendar_center.dataSource = dataSource;
        this.calendar_center.setEventSettings();
        this.detectorRef.detectChanges();
      }
    });
  }

  // changeNewMonth(date: any) {
  //   let myInterval = setInterval(() => {
  //     this.calendar_center = (this.view.currentView as any).schedule;
  //     if (this.calendar_center) {
  //       clearInterval(myInterval);
  //       debugger;
  //       this.calendar_center.selectedDate = new Date(date);
  //       this.calendar_center.isNavigateInside = true;
  //       this.detectorRef.detectChanges();
  //     }
  //   });
  // }

  //region EP
  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
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
}
