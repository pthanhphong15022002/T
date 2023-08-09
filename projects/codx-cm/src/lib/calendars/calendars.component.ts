import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  FormModel,
  ResourceModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';

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
  @ViewChild('eventTemplate') eventTemplate!: TemplateRef<any>; //event schedule
  @ViewChild('headerTempContent') headerTempContent!: TemplateRef<any>; //temp Content

  views: Array<ViewModel> = [];
  requestSchedule: ResourceModel;
  modelResource: ResourceModel;

  fields = {
    id: 'recID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'owner' },
    status: 'taskType',
  };

  resourceField = {
    Name: 'Resources',
    Field: 'owner',
    IdField: 'owner',
    TextField: 'userName',
    Title: 'Resources',
  };

  vllTypeTask = 'DP004';
  dayoff: any;
  calendarID = 'STD';
  // resourceField: {
  //   Name: string;
  //   Field: string;
  //   IdField: string;
  //   TextField: string;
  //   Title: string;
  // };
  funcID: any;
  user: any;

  formModelActivities: FormModel = {
    gridViewName: 'grvDPActivities',
    formName: 'DPActivities',
  };

  constructor(private inject: Injector, private authstore: AuthStore) {
    super(inject);
    this.router.params.subscribe((param: any) => {
      if (param.funcID) {
        this.funcID = param.funcID;
      }
    });
    this.user = this.authstore.get();
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
          // resourceModel: this.resourceField, //calendar  not take
          template: this.eventTemplate,
          //template2: this.headerTemp,
          template3: this.cellTemplate,
          template4: this.resourceHeader,
          template6: this.headerTempContent, //header morefun
          //template7: this.footerNone, ///footer
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
        showFilter: false, //filter ở dưới
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          template: this.eventTemplate, //lấy event của temo
          //template2: this.headerTemp,
          template3: this.cellTemplate, //tem cell
          template4: this.resourceHeader, //temp ressources
          template6: this.headerTempContent, //header // more
          //template7: this.footerNone, ///footer
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
    if (this.funcID == 'CM0702') {
      this.modelResource.assemblyName = 'HR';
      this.modelResource.className = 'OrganizationUnitsBusiness';
      this.modelResource.service = 'HR';
      this.modelResource.method = 'GetListUserBeLongToOrgOfAcountAsync';
    } else {
      //truyen lay resourse
      this.modelResource.assemblyName = 'HR';
      this.modelResource.className = 'OrganizationUnitsBusiness';
      this.modelResource.service = 'HR';
      this.modelResource.method = 'GetListUserByResourceAsync';
      this.modelResource.dataValue = this.user.userID;
    }
  }
  //#endregion setting schedule
}
