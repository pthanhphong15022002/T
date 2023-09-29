import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  FormModel,
  ResourceModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';

@Component({
  selector: 'lib-calendars',
  templateUrl: './calendars.component.html',
  styleUrls: ['./calendars.component.css'],
})
// extends UIComponent
// implements OnInit, AfterViewInit
export class CalendarsComponent {
  // @ViewChild('cellTemplate') cellTemplate!: TemplateRef<any>;
  // @ViewChild('contentTmp') contentTmp!: TemplateRef<any>;
  // @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>; //ressouce cuar schedule
  // @ViewChild('eventTemplate') eventTemplate!: TemplateRef<any>; //event schedule
  // @ViewChild('headerTempContent') headerTempContent!: TemplateRef<any>; //temp Content

  // views: Array<ViewModel> = [];
  // requestSchedule: ResourceModel;
  // modelResource: ResourceModel;

  // fields = {
  //   id: 'recID',
  //   subject: { name: 'taskName' },
  //   startTime: { name: 'startDate' },
  //   endTime: { name: 'endDate' },
  //   resourceId: { name: 'owner' },
  //   status: 'taskType',
  // };

  // resourceField = {
  //   Name: 'Resources',
  //   Field: 'owner',
  //   IdField: 'owner',
  //   TextField: 'userName',
  //   Title: 'Resources',
  // };

  // vllTypeTask = 'DP050';
  // dayoff: any;
  // calendarID = 'STD';
  // // resourceField: {
  // //   Name: string;
  // //   Field: string;
  // //   IdField: string;
  // //   TextField: string;
  // //   Title: string;
  // // };
  funcID: any;
  viewActiveType = '7';
  // user: any;
  // crrFuncID: any;

  // formModelActivities: FormModel = {
  //   gridViewName: 'grvDPActivities',
  //   formName: 'DPActivities',
  // };

  constructor(
    private router: ActivatedRoute,
    private cmService: CodxCmService,
    private cache: CodxCmService
  ) {
    // super(inject);&& this.funcID != param.funcID
    this.router.params.subscribe((param: any) => {
      if (param.funcID) {
        this.cmService.viewActiveType.subscribe((res) => {
          if (res && this.viewActiveType != res) {
            this.viewActiveType = res;
          } else this.viewActiveType = '';
          this.funcID = param.funcID;
        });
      }
    });

    // this.user = this.authstore.get();
    // this.afterLoad();
  }

  // onInit(): void {
  //   this.getDayOff();
  // }
  // ngAfterViewInit(): void {
  //   this.views = [
  //     {
  //       type: ViewType.calendar,
  //       active: true,
  //       sameData: false,
  //       request: this.requestSchedule,
  //       showSearchBar: false,
  //       model: {
  //         eventModel: this.fields,
  //         // resourceModel: this.resourceField, //calendar  not take
  //         // template4: this.resourceHeader,
  //         template6: this.headerTempContent, //header morefun
  //         //template7: this.footerNone, ///footer
  //         template: this.eventTemplate,
  //         //template2: this.headerTemp,
  //         template3: this.cellTemplate,
  //         template8: this.contentTmp, //content  nội dung chính
  //         statusColorRef: this.vllTypeTask,
  //       },
  //     },
  //     {
  //       type: ViewType.schedule,
  //       active: false,
  //       sameData: false,
  //       request: this.requestSchedule,
  //       request2: this.modelResource,
  //       showSearchBar: false,
  //       // showFilter: true,
  //       model: {
  //         eventModel: this.fields,
  //         resourceModel: this.resourceField,
  //         template4: this.resourceHeader, //temp ressources
  //         template6: this.headerTempContent, //header // more
  //         //template7: this.footerNone, ///footer
  //         template: this.eventTemplate, //lấy event của temo
  //         //template2: this.headerTemp,
  //         template3: this.cellTemplate, //tem cell
  //         template8: this.contentTmp, //content
  //         statusColorRef: this.vllTypeTask,
  //       },
  //     },
  //   ];
  // }

  // getDayOff(id = null) {
  //   if (id) this.calendarID = id;
  //   this.api
  //     .execSv<any>(
  //       'BS',
  //       'ERM.Business.BS',
  //       'CalendarsBusiness',
  //       'GetDayWeekAsync',
  //       [this.calendarID]
  //     )
  //     .subscribe((res) => {
  //       if (res) {
  //         this.dayoff = res;
  //       }
  //     });
  // }

  // onAction(e) {}

  // getCellContent(evt: any) {
  //   if (this.dayoff && this.dayoff.length > 0) {
  //     for (let i = 0; i < this.dayoff.length; i++) {
  //       let day = new Date(this.dayoff[i].startDate);
  //       if (
  //         day &&
  //         evt.getFullYear() === day.getFullYear() &&
  //         evt.getMonth() === day.getMonth() &&
  //         evt.getDate() === day.getDate()
  //       ) {
  //         let time = evt.getTime();
  //         let ele = document.querySelectorAll('[data-date="' + time + '"]');
  //         if (ele.length > 0) {
  //           ele.forEach((item) => {
  //             (item as any).style.backgroundColor = this.dayoff[i].color;
  //           });
  //           return (
  //             '<icon class="' +
  //             this.dayoff[i].symbol +
  //             '"></icon>' +
  //             '<span>' +
  //             this.dayoff[i].note +
  //             '</span>'
  //           );
  //         } else {
  //           return '';
  //         }
  //       }
  //     }
  //   }

  //   return ''; // Return a default value if no conditions are met
  // }

  // afterLoad() {
  //   //lấy list step istances step task + Activities => tmpEvents
  //   this.requestSchedule = new ResourceModel();
  //   this.requestSchedule.assemblyName = 'DP';
  //   this.requestSchedule.className = 'ActivitiesBusiness';
  //   this.requestSchedule.service = 'DP';
  //   this.requestSchedule.method = 'GetListEventCalendarAsync';
  //   this.requestSchedule.idField = 'recID';

  //   //xu ly khi truyeefn vao 1 list resourece
  //   this.modelResource = new ResourceModel();
  //   if (this.funcID == 'CM0702') {
  //     this.modelResource.assemblyName = 'HR';
  //     this.modelResource.className = 'OrganizationUnitsBusiness';
  //     this.modelResource.service = 'HR';
  //     this.modelResource.method = 'GetListUserBeLongToOrgOfAcountAsync';
  //   } else {
  //     //truyen lay resourse
  //     this.modelResource.assemblyName = 'HR';
  //     this.modelResource.className = 'OrganizationUnitsBusiness';
  //     this.modelResource.service = 'HR';
  //     this.modelResource.method = 'GetListUserByResourceAsync';
  //     this.modelResource.dataValue = this.user.userID;
  //   }
  // }
  // //#endregion setting

  // showHour(stringDate: any) {
  //   const date: Date = new Date(stringDate);
  //   const hours: number = date.getHours();
  //   const minutes: number = date.getMinutes();

  //   const timeString: string = `${hours.toString().padStart(2, '0')}:${minutes
  //     .toString()
  //     .padStart(2, '0')}`;

  //   return timeString;
  // }

  // viewChanged(e) {
  //   this.funcID = this.router.snapshot.params['funcID'];
  //   if (this.crrFuncID != this.funcID) {
  //     this.afterLoad();
  //     this.crrFuncID = this.funcID;
  //     this.view.load();
  //     this.view.currentView.refesh();
  //   }
  // }
}
