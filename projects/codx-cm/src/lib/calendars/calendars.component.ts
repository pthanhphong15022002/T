import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ResourceModel, UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-calendars',
  templateUrl: './calendars.component.html',
  styleUrls: ['./calendars.component.css'],
})
export class CalendarsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('cellTemplate') cellTemplate!: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp!: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>; //ressouce cuar schedule

  views: Array<ViewModel> = [];
  requestSchedule: ResourceModel;
  modelResource: ResourceModel;

  fields = {
    id: 'recID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'owner' }, //trung voi idField của resourceField
  };

  vllTypeTask = '';
  dayoff: any;
  calendarID = 'STD';
  resourceField: {
    Name: string;
    Field: string;
    IdField: string;
    TextField: string;
    Title: string;
  };
  funcID: any;

  constructor(private inject: Injector) {
    super(inject);
    this.router.params.subscribe((param: any) => {
      if (param.funcID) {
        this.funcID = param.funcID;
      }
    });
  }

  onInit(): void {
    this.afterLoad();
    this.getDayOff();
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.calendar,
        active: false,
        sameData: false,
        request: this.requestSchedule,
        showSearchBar: false,
        model: {
          eventModel: this.fields,
          //resourceModel: this.resourceModel,
          // resourceModel: this.resourceField, //ko có thang nay
          //template7: this.footerNone, ///footer
          template4: this.resourceHeader,
          /// template6: this.mfButton, //header morefun
          // template: this.eventTemplate,
          //template2: this.headerTemp,
          template3: this.cellTemplate,
          template8: this.contentTmp, //content  nội dung chính
          statusColorRef: this.vllTypeTask,
        },
      },
      {
        type: ViewType.schedule,
        active: false,
        sameData: false,
        request: this.requestSchedule,
        request2: this.modelResource,
        showSearchBar: false,
        showFilter: true,
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          //template7: this.footerNone, ///footer
          template4: this.resourceHeader, //temp ressources
          // template6: this.mfButton, //header // more
          // template: this.eventTemplate, lấy event của temo
          //template2: this.headerTemp,
          template3: this.cellTemplate, //tem cell
          template8: this.contentTmp, //content
          statusColorRef: this.vllTypeTask,
        },
      },
    ];
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

  onAction(e) {}

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

  afterLoad() {
    //lấy list step istances step task + Activities => tmpEvents
    this.requestSchedule = new ResourceModel();
    this.requestSchedule.assemblyName = 'DP';
    this.requestSchedule.className = 'ActivitiesBusiness';
    this.requestSchedule.service = 'DP';
    this.requestSchedule.method = 'GetListEventCalendarAsync';
    this.requestSchedule.idField = 'recID';

    //xu ly khi truyeefn vao 1 list resourece
    this.modelResource.assemblyName = 'HR';
    this.modelResource.className = 'OrganizationUnitsBusiness';
    this.modelResource.service = 'HR';
    this.modelResource.method = 'GetListUserBeLongToOrgOfAcountAsync';

    this.fields = {
      id: 'recID',
      subject: { name: 'taskName' },
      startTime: { name: 'startDate' },
      endTime: { name: 'endDate' },
      resourceId: { name: 'owner' },
    };

    this.resourceField = {
      Name: 'Resources',
      Field: 'owner',
      IdField: 'owner',
      TextField: 'userName',
      Title: 'Resources',
    };
  }
  //#endregion setting schedule
}
