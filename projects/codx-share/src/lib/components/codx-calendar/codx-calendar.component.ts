import { addClass } from '@syncfusion/ej2-base';
import {
  AfterViewInit,
  Component,
  ComponentRef,
  Injector,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { CalendarComponent } from '@syncfusion/ej2-angular-calendars';
import {
  DataRequest,
  ResourceModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import moment from 'moment';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CalendarCenterComponent } from './calendar-center/calendar-center.component';
import { Query } from '@syncfusion/ej2-data';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { CodxCalendarService } from './codx-calendar.service';

@Component({
  selector: 'app-codx-calendar',
  templateUrl: './codx-calendar.component.html',
  styleUrls: ['./codx-calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxCalendarComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('ejCalendar') ejCalendar!: CalendarComponent;
  @ViewChild('calendar_setting', { read: ViewContainerRef })
  calendar_setting!: ViewContainerRef;
  @ViewChild('calendar_setting')
  calendar_center!: ComponentRef<CalendarCenterComponent>;
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('calendarCenter') calendarCenter!: CalendarCenterComponent;

  dataResourceModel = [];
  request?: ResourceModel;
  views: Array<ViewModel> = [];
  listNote = [];
  checkUpdateNotePin = false;
  TM_Tasks = [];
  WP_Notes = [];
  CO_Meetings = [];
  EP_BookingRooms = [];
  EP_BookingCars = [];
  TM_TasksParam;
  WP_NotesParam;
  CO_MeetingsParam;
  EP_BookingRoomsParam;
  EP_BookingCarsParam;
  checkTM_TasksParam;
  checkWP_NotesParam;
  checkCO_MeetingsParam;
  checkEP_BookingRoomsParam;
  checkEP_BookingCarsParam;
  dateChange;
  countEvent = 0;
  countDataOfE = 0;
  FDdate = new Date();
  WP_NotesTemp = [];
  TM_TasksTemp = [];
  CO_MeetingsTemp = [];
  EP_BookingRoomsTemp = [];
  EP_BookingCarsTemp = [];
  lstDOWeek = [];
  typeNavigate = 'Month';
  isCollapsed = false;
  defaultCalendar;
  calendarData = [];

  locale = 'vi';

  fields: Object = { text: 'defaultName', value: 'functionID' };

  calendarTypes: string;
  celendarTypes = [];

  resources = [];

  constructor(
    injector: Injector,
    private calendarService: CodxCalendarService,
    private codxShareSV: CodxShareService
  ) {
    super(injector);
  }

  onInit(): void {
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetParamMyCalendarAsync',
        'WPCalendars'
      )
      .subscribe((res: any) => {
        if (res) {
          for (const prop in res) {
            let param = JSON.parse(res[prop]);
            this.resources.push({
              color: param.ShowBackground,
              borderColor: param.ShowColor,
              text: param.Template.TransType,
              status: param.Template.TransType,
            });
          }
        }
      });

    this.api
      .exec('CO', 'CalendarsBusiness', 'GetListCalendarAsync')
      .subscribe((res: any) => {
        if (res) {
          this.calendarTypes = res;
          this.defaultCalendar = 'COT03';
          this.api
            .exec('CO', 'CalendarsBusiness', 'GetCalendarDataAsync', [
              this.defaultCalendar,
            ])
            .subscribe((res: any) => {
              if (res) {
                this.calendarData = res;

                let myInterVal = setInterval(() => {
                  if (this.ejCalendar) {
                    clearInterval(myInterVal);
                    this.loadData();
                    this.navigate();
                  }
                }, 200);
                let myInterval_Calendar = setInterval(() => {
                  if (
                    this.TM_TasksParam &&
                    this.WP_NotesParam &&
                    this.CO_MeetingsParam &&
                    this.CO_MeetingsParam &&
                    this.EP_BookingCarsParam &&
                    this.EP_BookingRoomsParam
                  ) {
                    clearInterval(myInterval_Calendar);
                    this.getCalendarNotes();
                  }
                }, 200);
              }
            });
        }
        this.detectorRef.detectChanges();
      });
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.templateLeft,
        },
      },
    ];
  }

  onCreate() {
    let footerElement: HTMLElement = document.getElementsByClassName(
      'e-icon-container'
    )[0] as HTMLElement;
    let btn: HTMLElement = document.createElement('button');
    let proxy = this;

    //remove footer of ejs-calendar
    document
      .querySelector('ejs-calendar')
      .removeChild(document.querySelector('.e-footer-container'));

    //creates the custom element for setToday button
    btn.className = 'e-btn e-today e-flat e-css';
    btn.setAttribute('type', 'button');
    btn.textContent = 'Today';
    footerElement.appendChild(btn);
    footerElement.insertBefore(btn, footerElement.children[1]);

    // custom click handler to update the value property with null values.
    document
      .querySelector('.e-icon-container .e-today')
      .addEventListener('click', function () {
        proxy.ejCalendar.value = new Date();
      });
  }

  loadData() {
    let tempCalendar = this.ejCalendar.element;
    let htmlE = tempCalendar as HTMLElement;
    let eleFromDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
      ?.childNodes[0]?.childNodes[0]?.childNodes[0] as HTMLElement;
    let numbF = this.convertStrToDate(eleFromDate);
    const fDayOfMonth = moment(numbF).add(1, 'day').toISOString();
    let length =
      htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]?.childNodes.length;
    let eleClass = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
      ?.childNodes[length - 1] as HTMLElement;
    let indexLast = length - 1;
    if (eleClass.className == 'e-month-hide') indexLast = length - 2;
    let eleToDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
      ?.childNodes[indexLast]?.childNodes[6].childNodes[0] as HTMLElement;
    let numbL = this.convertStrToDate(eleToDate);

    const lDayOfMonth = moment(numbL).add(1, 'day').toISOString();
    this.getParamCalendar(fDayOfMonth, lDayOfMonth, true);
    this.getDayOfWeek(htmlE);
  }

  getDayOfWeek(htmlE) {
    this.lstDOWeek = [];
    if (htmlE) {
      let eleWeek = (
        htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1] as HTMLElement
      ).querySelectorAll('span.e-day');
      let DOMWeek;
      eleWeek.forEach((x) => {
        if (+x.textContent == moment(this.FDdate).date())
          DOMWeek = x.parentNode.parentNode;
      });
      if (DOMWeek) {
        DOMWeek.childNodes.forEach((x) => {
          this.lstDOWeek.push(+x.childNodes[0].textContent);
        });
      }
    }
  }

  navigate() {
    this.calendarService.dateChange$.subscribe((res) => {
      if (res?.fromDate == 'Invalid Date' && res?.toDate == 'Invalid Date')
        return;
      if (res?.fromDate && res?.toDate) {
        if (res?.type) this.typeNavigate = res.type;
        if (this.typeNavigate == 'Year') this.dateChange = this.FDdate;
        else this.dateChange = res.fromDate;
        if (this.typeNavigate == 'Year' && res.type == undefined) {
          this.dateChange = res?.toDate;
          return;
        }
        if (
          this.typeNavigate != 'Month' &&
          this.typeNavigate != 'MonthAgenda'
        ) {
          let myInterVal = setInterval(() => {
            clearInterval(myInterVal);
            //this.loadData();
          }, 100);
        }
      }
    });
  }

  changeDayOfMonth(args) {
    args['date'] = args.value;
    let crrDate = moment(this.FDdate)
      .startOf('month')
      .add(1, 'day')
      .toISOString();
    let newDate = moment(args.value)
      .startOf('month')
      .add(1, 'day')
      .toISOString();
    this.FDdate = args.value;
    if (crrDate != newDate) this.changeNewMonth(args);
    else {
      let day = moment(args.value).date();
      let changeWeek = true;
      this.lstDOWeek.forEach((x) => {
        if (x == day) {
          changeWeek = false;
          return;
        }
      });
      if (this.typeNavigate == 'Week' || this.typeNavigate == 'WorkWeek') {
        if (changeWeek && this.ejCalendar) {
          let eleCalendar = this.ejCalendar.element as HTMLElement;
          this.getDayOfWeek(eleCalendar);
        }
      }
    }
  }

  changeNewMonth(args) {
    this.FDdate = args.date;
  }

  valueChangeSetting(e) {
    if (e) {
      let field = e.field;
      this.updateSettingValue(field, e.data);
    }
  }

  updateSettingValue(transType, value) {
    if (value == false) value = '0';
    else value = '1';

    this.api
      .exec<any>(
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'AddUpdateByUserIDAsync',
        ['WPCalendars', transType, value]
      )
      .subscribe((res) => {
        if (res) {
          if (value == '0') {
            if (transType == 'WP_Notes') {
              this.WP_Notes = [];
            }

            if (transType == 'TM_Tasks') {
              this.TM_Tasks = [];
            }
            if (transType == 'CO_Meetings') {
              this.CO_Meetings = [];
            }
            if (transType == 'EP_BookingRooms') {
              this.EP_BookingRooms = [];
            }
            if (transType == 'EP_BookingCars') {
              this.EP_BookingCars = [];
            }

            this.dataResourceModel = this.dataResourceModel.filter((x) => {
              if (transType == 'TM_Tasks') {
                transType = 'TM_MyTasks';
              }
              return x.transType != transType;
            });
          }
          if (value == '1') {
            if (this.checkWP_NotesParam)
              if (transType == 'WP_Notes') {
                this.WP_Notes = this.WP_NotesTemp;
              }

            if (transType == 'TM_Tasks') {
              this.TM_Tasks = this.TM_TasksTemp;
            }
            if (transType == 'CO_Meetings') {
              this.CO_Meetings = this.CO_MeetingsTemp;
            }
            if (transType == 'EP_BookingRooms') {
              this.EP_BookingRooms = this.EP_BookingRoomsTemp;
            }
            if (transType == 'EP_BookingCars') {
              this.EP_BookingCars = this.EP_BookingCarsTemp;
            }

            if (
              this.checkWP_NotesParam == '0' ||
              this.checkTM_TasksParam == '0' ||
              this.checkCO_MeetingsParam == '0' ||
              this.checkEP_BookingCarsParam == '0' ||
              this.checkEP_BookingRoomsParam == '0'
            ) {
              if (this.ejCalendar) {
                let tempCalendar = this.ejCalendar.element;
                let htmlE = tempCalendar as HTMLElement;
                let eleFromDate = htmlE?.childNodes[1]?.childNodes[0]
                  ?.childNodes[1]?.childNodes[0]?.childNodes[0]
                  ?.childNodes[0] as HTMLElement;
                let numbF = this.convertStrToDate(eleFromDate);
                const fDayOfMonth = moment(numbF).add(1, 'day').toISOString();
                let length =
                  htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]?.childNodes
                    .length;
                let eleClass = htmlE?.childNodes[1]?.childNodes[0]
                  ?.childNodes[1]?.childNodes[length - 1] as HTMLElement;
                let indexLast = length - 1;
                if (eleClass.className == 'e-month-hide')
                  indexLast = length - 2;
                let eleToDate = htmlE?.childNodes[1]?.childNodes[0]
                  ?.childNodes[1]?.childNodes[indexLast]?.childNodes[6]
                  .childNodes[0] as HTMLElement;
                let numbL = this.convertStrToDate(eleToDate);
                const lDayOfMonth = moment(numbL).add(1, 'day').toISOString();
                this.getParamCalendar(fDayOfMonth, lDayOfMonth, false);
              }
            } else {
              if (transType == 'WP_Notes')
                this.dataResourceModel = [
                  ...this.WP_NotesTemp,
                  ...this.dataResourceModel,
                ];

              if (transType == 'TM_Tasks') {
                this.dataResourceModel = [
                  ...this.dataResourceModel,
                  ...this.TM_TasksTemp,
                ];
              }
              if (transType == 'CO_Meetings')
                this.dataResourceModel = [
                  ...this.dataResourceModel,
                  ...this.CO_MeetingsTemp,
                ];
              if (transType == 'EP_BookingRooms')
                this.dataResourceModel = [
                  ...this.dataResourceModel,
                  ...this.EP_BookingRoomsTemp,
                ];
              if (transType == 'EP_BookingCars')
                this.dataResourceModel = [
                  ...this.dataResourceModel,
                  ...this.EP_BookingCarsTemp,
                ];
            }
          }

          if (this.ejCalendar) {
            this.ejCalendar.refresh();
            this.ejCalendar.value = this.FDdate;
          }
          this.calendarService.calendarData$.next(this.dataResourceModel);
        }
      });
  }

  convertStrToDate(eleDate) {
    if (eleDate) {
      let str = eleDate.title.split(',');
      let strMonth: any = str[1].split('Tháng');
      let numb: any = strMonth[1] + '-' + strMonth[0];
      numb = numb + '-' + str[2];
      return numb.replaceAll(' ', '');
    }
  }

  getParamCalendar(fDayOfMonth, lDayOfMonth, updateCheck = true) {
    if (fDayOfMonth && lDayOfMonth) {
      this.countDataOfE = 0;
      this.api
        .execSv(
          'SYS',
          'ERM.Business.SYS',
          'SettingValuesBusiness',
          'GetParamCalendarAsync',
          'WPCalendars'
        )
        .subscribe((res) => {
          if (res) {
            const {
              TM_Tasks,
              WP_Notes,
              CO_Meetings,
              EP_BookingRooms,
              EP_BookingCars,
            } = res[0];
            this.countEvent = res[1];
            const dataValue = fDayOfMonth + ';' + lDayOfMonth;
            this.TM_TasksParam = JSON.parse(TM_Tasks[1]) ?? null;
            this.WP_NotesParam = JSON.parse(WP_Notes[1]) ?? null;
            this.CO_MeetingsParam = JSON.parse(CO_Meetings[1]) ?? null;
            this.EP_BookingRoomsParam = JSON.parse(EP_BookingRooms[1]) ?? null;
            this.EP_BookingCarsParam = JSON.parse(EP_BookingCars[1]) ?? null;
            if (updateCheck == true) {
              this.checkTM_TasksParam = this.TM_TasksParam?.ShowEvent;
              this.checkWP_NotesParam = this.WP_NotesParam?.ShowEvent;
              this.checkCO_MeetingsParam = this.CO_MeetingsParam?.ShowEvent;
              this.checkEP_BookingRoomsParam =
                this.EP_BookingRoomsParam?.ShowEvent;
              this.checkEP_BookingCarsParam =
                this.EP_BookingCarsParam?.ShowEvent;
            }

            this.getRequestTM(
              this.TM_TasksParam,
              this.TM_TasksParam?.ShowEvent
            );
            this.getRequestWP(
              this.WP_NotesParam,
              this.WP_NotesParam?.ShowEvent
            );
            this.getRequestCO(
              this.CO_MeetingsParam,
              this.CO_MeetingsParam?.ShowEvent
            );
            this.getRequestEP_BookingRoom(
              this.EP_BookingRoomsParam,
              this.EP_BookingRoomsParam?.ShowEvent
            );
            this.getRequestEP_BookingCar(
              this.EP_BookingCarsParam,
              this.EP_BookingCarsParam?.ShowEvent
            );
          }
        });
    }
  }

  getRequestTM(param, showEvent) {
    if (!showEvent || showEvent === 'false') {
      return;
    }

    this.TM_Tasks = [];

    this.TM_Tasks = this.calendarData.filter(
      (x) => x.transType == 'TM_MyTasks'
    );

    this.getModelShare(this.TM_Tasks, param.Template, 'TM_Tasks');
  }

  getRequestCO(param, showEvent) {
    if (!showEvent || showEvent === 'false') {
      return;
    }

    this.CO_Meetings = [];

    this.CO_Meetings = this.calendarData.filter(
      (x) => x.transType == 'CO_Meetings'
    );

    this.getModelShare(this.CO_Meetings, param.Template, 'CO_Meetings');
  }

  getRequestEP_BookingRoom(param, showEvent) {
    if (!showEvent || showEvent === 'false') {
      return;
    }

    this.EP_BookingRooms = [];

    this.EP_BookingRooms = this.calendarData.filter(
      (x) => x.transType == 'EP_BookingRooms'
    );

    this.getModelShare(this.EP_BookingRooms, param.Template, 'EP_BookingRooms');
  }

  getRequestEP_BookingCar(param, showEvent) {
    if (!showEvent || showEvent === 'false') {
      return;
    }

    this.EP_BookingCars = [];

    this.EP_BookingCars = this.calendarData.filter(
      (x) => x.transType == 'EP_BookingCars'
    );

    this.getModelShare(this.EP_BookingCars, param.Template, 'EP_BookingCars');
  }

  getRequestWP(param, showEvent) {
    if (showEvent == '0' || showEvent == 'false') return;
    this.WP_Notes = [];

    this.WP_Notes = this.calendarData.filter((x) => x.transType == 'WP_Notes');

    this.getModelShare(this.WP_Notes, param.Template, 'WP_Notes');
  }

  getModelShare(lstData, param, transType) {
    this.onSwitchCountEvent(transType);
    if (lstData && lstData.length > 0) {
      if (this.countDataOfE == this.countEvent) {
        this.dataResourceModel = [
          ...this.TM_Tasks,
          ...this.WP_Notes,
          ...this.CO_Meetings,
          ...this.EP_BookingRooms,
          ...this.EP_BookingCars,
        ];
        this.TM_TasksTemp = [...this.TM_Tasks];
        this.WP_NotesTemp = [...this.WP_Notes];
        this.CO_MeetingsTemp = [...this.CO_Meetings];
        this.EP_BookingRoomsTemp = [...this.EP_BookingRooms];
        this.EP_BookingCarsTemp = [...this.EP_BookingCars];

        this.calendarService.calendarData$.next(this.dataResourceModel);
      }
    }
  }

  onSwitchCountEvent(transType) {
    switch (transType) {
      case 'TM_Tasks':
        this.countDataOfE++;
        break;
      case 'WP_Notes':
        this.countDataOfE++;
        break;
      case 'CO_Meetings':
        this.countDataOfE++;
        break;
      case 'EP_BookingRooms':
        this.countDataOfE++;
        break;
      case 'EP_BookingCars':
        this.countDataOfE++;
        break;
    }
  }

  getCalendarNotes() {
    let myInterval = setInterval(() => {
      if (this.dataResourceModel.length > 0) {
        clearInterval(myInterval);
        this.calendarCenter.resources = this.resources;
        this.calendarCenter.resourceModel = this.dataResourceModel;
        this.calendarService.calendarData$.subscribe((res) => {
          if (res) {
            this.calendarCenter && this.calendarCenter.updateData(res);
          }
        });
      }
    });
  }

  onLoad(args) {
    let a = document.getElementsByClassName('highlight');
    let myInterval = setInterval(() => {
      if (this.calendarData.length > 0) {
        clearInterval(myInterval);
        if (this.calendarData.length > 0) {
          for (let i = 0; i < this.calendarData.length; i++) {
            let day = new Date(this.calendarData[i].startDate);
            if (
              day &&
              args.date.getFullYear() == day.getFullYear() &&
              args.date.getMonth() == day.getMonth() &&
              args.date.getDate() == day.getDate()
            ) {
              let span: HTMLElement;
              span = document.createElement('span');
              span.setAttribute('class', 'e-icons highlight');
              addClass([args.element], ['special', 'e-day']);
              args.element.appendChild(span);
              return;
            }
          }
        }
      }
    });
  }

  getCalendarData(event): void {
    let calendarType = event.value;
    this.api
      .exec('CO', 'CalendarsBusiness', 'GetCalendarDataAsync', [calendarType])
      .subscribe((res: any) => {
        if (res) {
          this.calendarData = res;
          this.calendarService.calendarData$.next(this.calendarData);
          this.ejCalendar.refresh();
        }
        this.detectorRef.detectChanges();
      });
  }

  onFiltering(e: FilteringEventArgs) {
    let query = new Query();
    //frame the query based on search string with filter type.
    query =
      e.text != ''
        ? query.where('defaultName', 'startswith', e.text, true)
        : query;
    //pass the filter data source, filter query to updateData method.
    e.updateData(this.celendarTypes, query);
  }
}
