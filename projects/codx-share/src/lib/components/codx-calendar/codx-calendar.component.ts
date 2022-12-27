declare var window: any;
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CalendarComponent } from '@syncfusion/ej2-angular-calendars';
import {
  CodxScheduleComponent,
  CRUDService,
  DataRequest,
  DialogData,
  DialogRef,
  ResourceModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import moment from 'moment';
import { CalendarNotesComponent } from 'projects/codx-share/src/lib/components/calendar-notes/calendar-notes.component';
import { SettingCalendarComponent } from 'projects/codx-share/src/lib/components/setting-calendar/setting-calendar.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CalendarCenterComponent } from './calendar-center/calendar-center.component';

@Component({
  selector: 'app-codx-calendar',
  templateUrl: './codx-calendar.component.html',
  styleUrls: ['./codx-calendar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CodxCalendarComponent extends UIComponent implements OnInit {
  headerText: any;
  dialog: DialogRef;
  funcID: any;
  fields = {
    id: 'transID',
    subject: { name: 'title' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    status: 'transType',
  };
  request?: ResourceModel;
  tmpCalendarNote: any;
  views: Array<ViewModel> = [];
  functionList: any;

  message: any;
  listNote: any[] = [];
  itemUpdate: any;
  countNotePin = 0;
  maxPinNotes: any;
  checkUpdateNotePin = false;
  TM_Tasks: any = [];
  WP_Notes: any = [];
  CO_Meetings: any = [];
  EP_BookingRooms: any = [];
  EP_BookingCars: any = [];
  TM_TasksParam: any;
  checkWeek = true;
  WP_NotesParam: any;
  CO_MeetingsParam: any;
  EP_BookingRoomsParam: any;
  EP_BookingCarsParam: any;
  checkTM_TasksParam: any;
  checkWP_NotesParam: any;
  checkCO_MeetingsParam: any;
  checkEP_BookingRoomsParam: any;
  checkEP_BookingCarsParam: any;
  daySelected: any;
  typeList = 'notes-home';
  dataValue = '';
  predicate = '';
  userID = '';
  editMF: any;
  deleteMF: any;
  pinMF: any;
  saveMF: any;
  dateChange: any;
  countEvent = 0;
  countDataOfE = 0;
  FDdate: any;
  TDate: any;
  WP_NotesTemp: any = [];
  TM_TasksTemp: any = [];
  CO_MeetingsTemp: any = [];
  EP_BookingRoomsTemp: any = [];
  EP_BookingCarsTemp: any = [];
  dataListViewTemp: any;
  dtService: CRUDService;
  isCollapsed = false;

  @ViewChild('calendar_mini') calendar_mini!: CalendarComponent;
  @ViewChild('calendar_setting', { read: ViewContainerRef })
  calendar_setting!: ViewContainerRef;
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;

  @Output() dataResourceModel: any[] = [];
  @Output() settingValue: any;

  constructor(
    private injector: Injector,
    private change: ChangeDetectorRef,
    private route: ActivatedRoute,
    private codxShareSV: CodxShareService,
    @Optional() dialogRef: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.route.params.subscribe((params) => {
      if (params) {
        this.funcID = params['funcID'];
        this.cache.functionList(this.funcID).subscribe((res) => {
          if (res) this.functionList = res;
        });
      }
    });
  }

  onInit(): void {
    let myInterVal = setInterval(() => {
      if (this.calendar_mini) {
        clearInterval(myInterVal);
        this.loadData();
        this.navigate();
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

  loadData() {
    var tempCalendar = this.calendar_mini.element;
    var htmlE = tempCalendar as HTMLElement;
    var eleFromDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
      ?.childNodes[0]?.childNodes[0]?.childNodes[0] as HTMLElement;
    let numbF = this.convertStrToDate(eleFromDate);
    const fDayOfMonth = moment(numbF).toISOString();
    let indexLast =
      htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]?.childNodes.length - 1;
    let eleToDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
      ?.childNodes[indexLast]?.childNodes[6].childNodes[0] as HTMLElement;
    let numbL = this.convertStrToDate(eleToDate);
    const lDayOfMonth = moment(numbL).toISOString();
    this.getParamCalendar(fDayOfMonth, lDayOfMonth, true);
  }

  navigate() {
    this.codxShareSV.dateChange.subscribe((res) => {
      if (this.check) return;
      if (res?.fromDate == 'Invalid Date' && res?.toDate == 'Invalid Date')
        return;
      if (res?.fromDate && res?.toDate) {
        this.dateChange = res.fromDate;
        this.check = false;
        this.getParamCalendar(
          moment(res.fromDate).toISOString(),
          moment(res.toDate).toISOString(),
          false
        );
        if (this.calendar_mini) {
          this.calendar_mini.refresh();
          this.calendar_mini.value = this.dateChange;
        }
      }
    });
  }

  changeDayOfMonth(args: any) {
    this.FDdate = args.value;
    var data = args.value;
    this.change.detectChanges();
  }

  check = false;
  changeNewMonth(args: any) {
    if (this.calendar_mini) {
      var tempCalendar = this.calendar_mini.element;
      var htmlE = tempCalendar as HTMLElement;
      var eleFromDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
        ?.childNodes[0]?.childNodes[0]?.childNodes[0] as HTMLElement;
      let numbF = this.convertStrToDate(eleFromDate);
      const fDayOfMonth = moment(numbF).toISOString();
      let indexLast =
        htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]?.childNodes.length -
        1;
      let eleToDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
        ?.childNodes[indexLast]?.childNodes[6].childNodes[0] as HTMLElement;
      let numbL = this.convertStrToDate(eleToDate);
      const lDayOfMonth = moment(numbL).toISOString();
      this.getParamCalendar(fDayOfMonth, lDayOfMonth, false);
    }
    let ele = document.getElementsByTagName('codx-schedule')[0];
    if (ele) {
      this.dataResourceModel;
      let cmp = window.ng.getComponent(ele) as CodxScheduleComponent;
      cmp.selectedDate = args.date;
      //cmp.isNavigateInside = true;
      this.check = true;
      cmp.onNavigating(args);
    }
  }

  valueChangeSetting(e) {
    if (e) {
      var field = e.field;
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
            if (transType == 'WP_Notes') this.WP_Notes = [];
            else if (transType == 'TM_Tasks') this.TM_Tasks = [];
            else if (transType == 'CO_Meetings') this.CO_Meetings = [];
            else if (transType == 'EP_BookingRooms') this.EP_BookingRooms = [];
            else if (transType == 'EP_BookingCars') this.EP_BookingCars = [];
          } else {
            if (this.checkWP_NotesParam)
              if (transType == 'WP_Notes') this.WP_Notes = this.WP_NotesTemp;
              else if (transType == 'TM_Tasks')
                this.TM_Tasks = this.TM_TasksTemp;
              else if (transType == 'CO_Meetings')
                this.CO_Meetings = this.CO_MeetingsTemp;
              else if (transType == 'EP_BookingRooms')
                this.EP_BookingRooms = this.EP_BookingRoomsTemp;
              else if (transType == 'EP_BookingCars')
                this.EP_BookingCars = this.EP_BookingCarsTemp;
          }
          // this.componentRef.destroy();
          if (value == '0') {
            this.dataResourceModel = this.dataResourceModel.filter(
              (x) => x.transType != transType
            );
          } else if (value == '1') {
            if (
              this.checkWP_NotesParam == '0' ||
              this.checkTM_TasksParam == '0' ||
              this.checkCO_MeetingsParam == '0' ||
              this.checkEP_BookingCarsParam == '0' ||
              this.checkEP_BookingRoomsParam == '0'
            ) {
              if (this.calendar_mini) {
                var tempCalendar = this.calendar_mini.element;
                var htmlE = tempCalendar as HTMLElement;
                var eleFromDate = htmlE?.childNodes[1]?.childNodes[0]
                  ?.childNodes[1]?.childNodes[0]?.childNodes[0]
                  ?.childNodes[0] as HTMLElement;
                let numbF = this.convertStrToDate(eleFromDate);
                const fDayOfMonth = moment(numbF).toISOString();
                let indexLast =
                  htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]?.childNodes
                    .length - 1;
                let eleToDate = htmlE?.childNodes[1]?.childNodes[0]
                  ?.childNodes[1]?.childNodes[indexLast]?.childNodes[6]
                  .childNodes[0] as HTMLElement;
                let numbL = this.convertStrToDate(eleToDate);
                const lDayOfMonth = moment(numbL).toISOString();
                this.getParamCalendar(fDayOfMonth, lDayOfMonth, false);
              }
            } else {
              if (transType == 'WP_Notes')
                this.dataResourceModel = [
                  ...this.WP_NotesTemp,
                  ...this.dataResourceModel,
                ];
              else if (transType == 'TM_Tasks')
                this.dataResourceModel = [
                  ...this.dataResourceModel,
                  ...this.TM_TasksTemp,
                ];
              else if (transType == 'CO_Meetings')
                this.dataResourceModel = [
                  ...this.dataResourceModel,
                  ...this.CO_MeetingsTemp,
                ];
              else if (transType == 'EP_BookingRooms')
                this.dataResourceModel = [
                  ...this.dataResourceModel,
                  ...this.EP_BookingRoomsTemp,
                ];
              else if (transType == 'EP_BookingCars')
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
      let str: any = eleDate.title.split(',');
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
            let dt = res;
            this.countEvent = dt[1];
            const dataValue = fDayOfMonth + ';' + lDayOfMonth;
            this.TM_TasksParam = dt[0]?.TM_Tasks[1]
              ? JSON.parse(dt[0]?.TM_Tasks[1])
              : null;
            this.WP_NotesParam = dt[0]?.WP_Notes[1]
              ? JSON.parse(dt[0]?.WP_Notes[1])
              : null;
            this.CO_MeetingsParam = dt[0]?.CO_Meetings[1]
              ? JSON.parse(dt[0]?.CO_Meetings[1])
              : null;
            this.EP_BookingRoomsParam = dt[0]?.EP_BookingRooms[1]
              ? JSON.parse(dt[0]?.EP_BookingRooms[1])
              : null;
            this.EP_BookingCarsParam = dt[0]?.EP_BookingCars[1]
              ? JSON.parse(dt[0]?.EP_BookingCars[1])
              : null;
            this.settingValue = dt[0];
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
              dt[0]?.TM_Tasks[0],
              dataValueTM,
              this.TM_TasksParam,
              this.TM_TasksParam?.ShowEvent
            );
            this.getRequestWP(
              dt[0]?.WP_Notes[0],
              dataValue,
              this.WP_NotesParam,
              this.WP_NotesParam?.ShowEvent
            );
            this.getRequestCO(
              dt[0]?.CO_Meetings[0],
              dataValue,
              this.CO_MeetingsParam,
              this.CO_MeetingsParam?.ShowEvent
            );
            this.getRequestEP_BookingRoom(
              dt[0]?.EP_BookingRooms[0],
              dataValue,
              this.EP_BookingRoomsParam,
              this.EP_BookingRoomsParam?.ShowEvent
            );
            this.getRequestEP_BookingCar(
              dt[0]?.EP_BookingCars[0],
              dataValue,
              this.EP_BookingCarsParam,
              this.EP_BookingCarsParam?.ShowEvent
            );
          }
        });
    }
  }

  getRequestTM(predicate, dataValue, param, showEvent) {
    if (showEvent == '0' || showEvent == 'false') return;
    this.TM_Tasks = [];
    let requestDataTM: DataRequest = new DataRequest();
    requestDataTM.predicate = predicate;
    requestDataTM.dataValue = dataValue;
    requestDataTM.funcID = 'TMT0201';
    requestDataTM.formName = 'MyTasks';
    requestDataTM.gridViewName = 'grvMyTasks';
    requestDataTM.pageLoading = true;
    requestDataTM.page = 1;
    requestDataTM.pageSize = 1000;
    requestDataTM.entityName = 'TM_Tasks';
    requestDataTM.entityPermission = 'TM_MyTasks';
    this.codxShareSV.getDataTM_Tasks(requestDataTM).subscribe((res) => {
      if (res) {
        this.getModelShare(res[0], param.Template, 'TM_Tasks');
      }
    });
  }

  getRequestCO(predicate, dataValue, param, showEvent) {
    if (showEvent == '0' || showEvent == 'false') return;
    this.CO_Meetings = [];
    let requestDataCO: DataRequest = new DataRequest();
    requestDataCO.predicate = predicate;
    requestDataCO.dataValue = dataValue;
    requestDataCO.funcID = 'TMT0501';
    requestDataCO.formName = 'TMMeetings';
    requestDataCO.gridViewName = 'grvTMMeetings';
    requestDataCO.pageLoading = true;
    requestDataCO.page = 1;
    requestDataCO.pageSize = 20;
    requestDataCO.entityName = 'CO_Meetings';
    requestDataCO.entityPermission = 'CO_TMMeetings';
    this.codxShareSV.getDataCO_Meetings(requestDataCO).subscribe((res) => {
      if (res) {
        this.getModelShare(res[0], param.Template, 'CO_Meetings');
      }
    });
  }

  getRequestEP_BookingRoom(predicate, dataValue, param, showEvent) {
    if (showEvent == '0' || showEvent == 'false') return;
    this.EP_BookingRooms = [];
    let requestDataEP_Room: DataRequest = new DataRequest();
    requestDataEP_Room.predicate = predicate;
    requestDataEP_Room.dataValue = dataValue;
    requestDataEP_Room.funcID = 'EP4T11';
    requestDataEP_Room.formName = 'BookingRooms';
    requestDataEP_Room.gridViewName = 'grvBookingRooms';
    requestDataEP_Room.pageLoading = true;
    requestDataEP_Room.page = 1;
    requestDataEP_Room.pageSize = 20;
    requestDataEP_Room.entityName = 'EP_Bookings';
    requestDataEP_Room.entityPermission = 'EP_BookingRooms';
    this.codxShareSV.getDataEP_Bookings(requestDataEP_Room).subscribe((res) => {
      if (res) {
        this.getModelShare(res[0], param.Template, 'EP_BookingRooms');
      }
    });
  }

  getRequestEP_BookingCar(predicate, dataValue, param, showEvent) {
    if (showEvent == '0' || showEvent == 'false') return;
    this.EP_BookingCars = [];
    let requestDataEP_Car: DataRequest = new DataRequest();
    requestDataEP_Car.predicate = predicate;
    requestDataEP_Car.dataValue = dataValue;
    requestDataEP_Car.funcID = 'EP7T11';
    requestDataEP_Car.formName = 'BookingCars';
    requestDataEP_Car.gridViewName = 'grvBookingCars';
    requestDataEP_Car.pageLoading = true;
    requestDataEP_Car.page = 1;
    requestDataEP_Car.pageSize = 20;
    requestDataEP_Car.entityName = 'EP_Bookings';
    requestDataEP_Car.entityPermission = 'EP_BookingCars';
    this.codxShareSV.getDataEP_Bookings(requestDataEP_Car).subscribe((res) => {
      if (res) {
        this.getModelShare(res[0], param.Template, 'EP_BookingCars');
      }
    });
  }

  getRequestWP(predicate, dataValue, param, showEvent) {
    if (showEvent == '0' || showEvent == 'false') return;
    this.WP_Notes = [];
    this.codxShareSV.getDataWP_Notes(predicate, dataValue).subscribe((res) => {
      if (res) {
        this.countNotePin = 0;
        this.countNotePin = res[1];
        this.getModelShare(res[0], param.Template, 'WP_Notes');
      }
    });
  }

  getModelShare(lstData, param, transType) {
    if (lstData) {
      lstData.forEach((item) => {
        var paramValue = JSON.parse(JSON.stringify(Util.camelizekeyObj(param)));
        paramValue['data'] = {};
        let data: any = JSON.parse(JSON.stringify(item));
        for (const key in data) {
          for (const keyValue of Object.keys(paramValue)) {
            if (
              paramValue[keyValue] &&
              typeof paramValue[keyValue] === 'string'
            ) {
              var value = Util.camelize(paramValue[keyValue]);
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
      this.onSwitchCountEven(transType);
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

  onSwitchCountEven(transType) {
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

  getCalendarNotes(TM_, WP_, CO_, EP_Room_, EP_Ca_) {
    let TM_Params = [
      {
        color: TM_.ShowBackground,
        borderColor: TM_.ShowColor,
        text: 'TM_Tasks',
        status: 'TM_Tasks',
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
        this.getCalendarSetting(resources, this.dataResourceModel);
      }
    });
  }

  getCalendarSetting(resource, dataResourceModel) {
    let a = this.calendar_setting.createComponent(CalendarCenterComponent);
    a.instance.resources = resource;
    a.instance.resourceModel = dataResourceModel;
    this.codxShareSV.dataResourceModel.subscribe((res) => {
      if (res) {
        let ele = document.getElementsByTagName('codx-schedule')[0];
        if (ele) {
          let cmp = window.ng.getComponent(ele) as CodxScheduleComponent;
          cmp.dataSource = res;
          cmp.setEventSettings();
        }
      }
    });
  }
}
