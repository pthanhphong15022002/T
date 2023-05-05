declare var window: any;
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
  @ViewChild('calendar_mini') calendar_mini!: CalendarComponent;
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
  countNotePin = 0;
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

  constructor(injector: Injector, private codxShareSV: CodxShareService) {
    super(injector);
  }

  onInit(): void {
    let myInterVal = setInterval(() => {
      if (this.calendar_mini) {
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
        this.getCalendarNotes(
          this.TM_TasksParam,
          this.WP_NotesParam,
          this.CO_MeetingsParam,
          this.EP_BookingRoomsParam,
          this.EP_BookingCarsParam
        );
      }
    }, 200);
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

  loadData() {
    let tempCalendar = this.calendar_mini.element;
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
    this.codxShareSV.dateChange.subscribe((res) => {
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
            this.loadData();
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
        if (changeWeek && this.calendar_mini) {
          let eleCalendar = this.calendar_mini.element as HTMLElement;
          this.getDayOfWeek(eleCalendar);
        }
      }
    }
  }

  changeNewMonth(args) {
    this.FDdate = args.date;
    // let myInterVal = setInterval(() => {
    //   console.log('this.calendar_center', this.calendar_center);
    //   if (this.calendar_center && this.calendar_center.instance) {
    //     clearInterval(myInterVal);
    //     this.calendar_center.instance.changeNewMonth(this.FDdate);
    //   }
    // }, 100);

    // let myInterVal1 = setInterval(() => {
    //   clearInterval(myInterVal1);
    //   this.loadData();
    // }, 100);
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
          } else {
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
              if (this.calendar_mini) {
                let tempCalendar = this.calendar_mini.element;
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

          if (this.calendar_mini) {
            this.calendar_mini.refresh();
            this.calendar_mini.value = this.FDdate;
          }
          this.codxShareSV.dataResourceModel.next(this.dataResourceModel);
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
            const lDayTimeOfMonth = moment(lDayOfMonth)
              .endOf('date')
              .toISOString();
            const dataValueTM = fDayOfMonth + ';' + lDayTimeOfMonth;
            this.getRequestTM(
              TM_Tasks[0],
              dataValueTM,
              this.TM_TasksParam,
              this.TM_TasksParam?.ShowEvent
            );
            this.getRequestWP(
              WP_Notes[0],
              dataValue,
              this.WP_NotesParam,
              this.WP_NotesParam?.ShowEvent
            );
            this.getRequestCO(
              CO_Meetings[0],
              dataValue,
              this.CO_MeetingsParam,
              this.CO_MeetingsParam?.ShowEvent
            );
            this.getRequestEP_BookingRoom(
              EP_BookingRooms[0],
              dataValue,
              this.EP_BookingRoomsParam,
              this.EP_BookingRoomsParam?.ShowEvent
            );
            this.getRequestEP_BookingCar(
              EP_BookingCars[0],
              dataValue,
              this.EP_BookingCarsParam,
              this.EP_BookingCarsParam?.ShowEvent
            );
          }
        });
    }
  }

  getRequestTM(predicate, dataValue, param, showEvent) {
    if (!showEvent || showEvent === 'false') {
      return;
    }

    this.TM_Tasks = [];

    let requestDataTM: DataRequest = {
      predicate: predicate,
      dataValue: dataValue,
      funcID: 'TMT0201',
      formName: 'MyTasks',
      gridViewName: 'grvMyTasks',
      pageLoading: true,
      page: 1,
      pageSize: 1000,
      entityName: 'TM_Tasks',
      entityPermission: 'TM_MyTasks',
    };

    this.codxShareSV.getDataTM_Tasks(requestDataTM).subscribe((res) => {
      this.getModelShare(res[0], param.Template, 'TM_Tasks');
    });
  }

  getRequestCO(predicate, dataValue, param, showEvent) {
    if (!showEvent || showEvent === 'false') {
      return;
    }

    this.CO_Meetings = [];

    let requestDataCO: DataRequest = {
      predicates: predicate,
      dataValues: dataValue,
      funcID: 'TMT0501',
      formName: 'TMMeetings',
      gridViewName: 'grvTMMeetings',
      pageLoading: true,
      page: 1,
      pageSize: 1000,
      entityName: 'CO_Meetings',
      entityPermission: 'CO_TMMeetings',
    };

    this.codxShareSV.getDataCO_Meetings(requestDataCO).subscribe((res) => {
      this.getModelShare(res[0], param.Template, 'CO_Meetings');
    });
  }

  getRequestEP_BookingRoom(predicate, dataValue, param, showEvent) {
    if (!showEvent || showEvent === 'false') {
      return;
    }

    this.EP_BookingRooms = [];

    let requestDataEP_Room: DataRequest = {
      predicates: predicate,
      dataValues: dataValue,
      funcID: 'EP4T11',
      formName: 'BookingRooms',
      gridViewName: 'grvBookingRooms',
      pageLoading: true,
      page: 1,
      pageSize: 1000,
      entityName: 'EP_Bookings',
      entityPermission: 'EP_BookingRooms',
    };

    this.codxShareSV.getDataEP_Bookings(requestDataEP_Room).subscribe((res) => {
      this.getModelShare(res[0], param.Template, 'EP_BookingRooms');
    });
  }

  getRequestEP_BookingCar(predicate, dataValue, param, showEvent) {
    if (!showEvent || showEvent === 'false') {
      return;
    }

    this.EP_BookingCars = [];

    let requestDataEP_Car: DataRequest = {
      predicates: predicate,
      dataValues: dataValue,
      funcID: 'EP7T11',
      formName: 'BookingCars',
      gridViewName: 'grvBookingCars',
      pageLoading: true,
      page: 1,
      pageSize: 1000,
      entityName: 'EP_Bookings',
      entityPermission: 'EP_BookingCars',
    };

    this.codxShareSV.getDataEP_Bookings(requestDataEP_Car).subscribe((res) => {
      this.getModelShare(res[0], param.Template, 'EP_BookingCars');
    });
  }

  getRequestWP(predicate, dataValue, param, showEvent) {
    if (showEvent == '0' || showEvent == 'false') return;
    this.WP_Notes = [];
    this.codxShareSV.getDataWP_Notes(predicate, dataValue).subscribe((res) => {
      this.countNotePin = res[1];
      this.getModelShare(res[0], param.Template, 'WP_Notes');
    });
  }

  getModelShare(lstData, param, transType) {
    this.onSwitchCountEvent(transType);
    if (lstData && lstData.length > 0) {
      lstData.forEach((item) => {
        let paramValue = JSON.parse(JSON.stringify(Util.camelizekeyObj(param)));
        paramValue['data'] = {};
        let data = JSON.parse(JSON.stringify(item));
        for (const key in data) {
          for (const keyValue of Object.keys(paramValue)) {
            if (
              paramValue[keyValue] &&
              typeof paramValue[keyValue] === 'string'
            ) {
              let value = Util.camelize(paramValue[keyValue]);
              if (data[value] || typeof data[value] == 'boolean')
                paramValue[keyValue] = data[value];
              if (paramValue[keyValue] == 'CheckList')
                paramValue[keyValue] = data.checkList;
              else if (paramValue[keyValue] == 'StartDate') {
                paramValue[keyValue] = data.startDate;
              } else if (paramValue[keyValue] == 'EndDate')
                paramValue[keyValue] = data.endDate;
            } else {
              paramValue['data'][key] = data[key];
            }
          }
        }
        if (!paramValue['StartDate'] && !paramValue['EndDate']) {
          paramValue['startDate'] = moment(paramValue?.calendarDate).startOf(
            'date'
          );
          paramValue['endDate'] = paramValue?.calendarDate;
        }
        switch (transType) {
          case 'TM_Tasks':
            this.TM_Tasks.push(paramValue);
            break;
          case 'WP_Notes':
            this.WP_Notes.push(paramValue);
            break;
          case 'CO_Meetings':
            this.CO_Meetings.push(paramValue);
            break;
          case 'EP_BookingRooms':
            this.EP_BookingRooms.push(paramValue);
            break;
          case 'EP_BookingCars':
            this.EP_BookingCars.push(paramValue);
            break;
        }
      });
      if (this.countDataOfE == this.countEvent) {
        this.dataResourceModel = [
          ...this.TM_Tasks,
          ...this.WP_Notes,
          ...this.CO_Meetings,
          ...this.EP_BookingRooms,
          ...this.EP_BookingCars,
        ];
        this.TM_TasksTemp = JSON.parse(JSON.stringify(this.TM_Tasks));
        this.WP_NotesTemp = JSON.parse(JSON.stringify(this.WP_Notes));
        this.CO_MeetingsTemp = JSON.parse(JSON.stringify(this.CO_Meetings));
        this.EP_BookingRoomsTemp = JSON.parse(
          JSON.stringify(this.EP_BookingRooms)
        );
        this.EP_BookingCarsTemp = JSON.parse(
          JSON.stringify(this.EP_BookingCars)
        );
        this.codxShareSV.dataResourceModel.next(this.dataResourceModel);
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

  resource:any;

  getCalendarNotes(TM_, WP_, CO_, EP_Room_, EP_Ca_) {
    let TM_Params = [
      {
        color: TM_.ShowBackground,
        borderColor: TM_.ShowColor,
        text: 'TM_MyTasks',
        status: 'TM_MyTasks',
      },
    ];
    let WP_Params = [
      {
        color: WP_.ShowBackground,
        borderColor: WP_.ShowColor,
        text: 'WP_Notes',
        status: 'WP_Notes',
      },
    ];
    let CO_Params = [
      {
        color: CO_.ShowBackground,
        borderColor: CO_.ShowColor,
        text: 'CO_Meetings',
        status: 'CO_Meetings',
      },
    ];
    let EP_BookingRoomParams = [
      {
        color: EP_Room_.ShowBackground,
        borderColor: EP_Room_.ShowColor,
        text: 'EP_BookingRooms',
        status: 'EP_BookingRooms',
      },
    ];
    let EP_BookingCarParams = [
      {
        color: EP_Ca_.ShowBackground,
        borderColor: EP_Ca_.ShowColor,
        text: 'EP_BookingCars',
        status: 'EP_BookingCars',
      },
    ];
    let resources = [
      ...TM_Params,
      ...WP_Params,
      ...CO_Params,
      ...EP_BookingRoomParams,
      ...EP_BookingCarParams,
    ];
    let myInterval = setInterval(() => {
      if (this.dataResourceModel.length > 0) {
        clearInterval(myInterval);
        this.resource = resources;
        this.codxShareSV.dataResourceModel.subscribe((res) => {
          if (res) {
            this.calendarCenter && this.calendarCenter.updateData(res)
          }
        });

        //this.getCalendarSetting(resources, this.dataResourceModel);
      }
    });
  }

  getCalendarSetting(resource, dataResourceModel) {
    //let a = this.calendar_setting.createComponent(CalendarCenterComponent);
    //a.instance.resources = resource;
    //a.instance.resourceModel = dataResourceModel;
    // this.codxShareSV.dataResourceModel.subscribe((res) => {
    //   if (res) {
    //     a.instance.updateData(res);
    //   }
    // });
  }

  onLoad(args) {
    let myInterval = setInterval(() => {
      if (this.dataResourceModel.length > 0) {
        clearInterval(myInterval);
        if (this.dataResourceModel.length > 0) {
          for (let i = 0; i < this.dataResourceModel.length; i++) {
            let day = new Date(this.dataResourceModel[i].startDate);
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
}
