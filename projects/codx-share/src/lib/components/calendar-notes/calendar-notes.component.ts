import { CO_Meetings } from './../../../../../codx-tm/src/lib/models/CO_Meetings.model';
import { DataRequest } from './../../../../../../src/shared/models/data.request';
import { EventEmitter, Output } from '@angular/core';
import {
  UIComponent,
  DialogRef,
  DialogModel,
  AuthStore,
  CRUDService,
  CodxListviewComponent,
  ResourceModel,
  Util,
} from 'codx-core';
import {
  Component,
  ViewEncapsulation,
  OnInit,
  Input,
  ViewChild,
  AfterViewInit,
  Injector,
  TemplateRef,
  ChangeDetectorRef,
  ComponentRef,
} from '@angular/core';
import { Notes } from '@shared/models/notes.model';
import { AddNoteComponent } from 'projects/codx-wp/src/lib/dashboard/home/add-note/add-note.component';
import { UpdateNotePinComponent } from 'projects/codx-wp/src/lib/dashboard/home/update-note-pin/update-note-pin.component';
import { SaveNoteComponent } from 'projects/codx-wp/src/lib/dashboard/home/add-note/save-note/save-note.component';
import { NoteServices } from 'projects/codx-wp/src/lib/services/note.services';
import moment from 'moment';
import { CodxShareService } from '../../codx-share.service';
import console from 'console';
@Component({
  selector: 'app-calendar-notes',
  templateUrl: './calendar-notes.component.html',
  styleUrls: ['./calendar-notes.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarNotesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  message: any;
  x;
  listNote: any[] = [];
  type: any;
  itemUpdate: any;
  transID: any;
  countNotePin = 0;
  maxPinNotes: any;
  checkUpdateNotePin = false;
  TM_Tasks: any = [];
  WP_Notes: any = [];
  CO_Meetings: any = [];
  EP_BookingRooms: any = [];
  EP_BookingCars: any = [];
  TM_TasksParam: any;
  WP_NotesParam: any;
  CO_MeetingsParam: any;
  EP_BookingRoomsParam: any;
  EP_BookingCarsParam: any;
  @Output() settingValue: any;
  checkTM_TasksParam: any;
  checkWP_NotesParam: any;
  checkCO_MeetingsParam: any;
  checkEP_BookingRoomsParam: any;
  checkEP_BookingCarsParam: any;
  daySelected: any;
  checkWeek = true;
  typeList = 'notes-home';
  dataValue = '';
  predicate = '';
  userID = '';
  data: any;
  toDate: any;
  dataObj: any;
  editMF: any;
  deleteMF: any;
  pinMF: any;
  saveMF: any;
  functionList: any;
  dialog: DialogRef;

  @Input() showHeader = true;
  @Input() typeCalendar = 'week';
  @Input() showList = true;
  @Input() showListParam = false;
  @Output() dataResourceModel: any[] = [];

  @ViewChild('listview') lstView: CodxListviewComponent;
  @ViewChild('dataPara') dataPara: TemplateRef<any>;
  @ViewChild('calendar') calendar: any;
  componentRef!: ComponentRef<CalendarNotesComponent>;
  constructor(
    private injector: Injector,
    private change: ChangeDetectorRef,
    private auth: AuthStore,
    private noteService: NoteServices,
    private codxShareSV: CodxShareService
  ) {
    super(injector);
    this.userID = this.auth.get().userID;
    this.cache
      .moreFunction('PersonalNotes', 'grvPersonalNotes')
      .subscribe((res) => {
        if (res) {
          this.editMF = res[2];
          this.deleteMF = res[3];
          this.pinMF = res[0];
          this.saveMF = res[1];
        }
      });
    this.cache.functionList('WPT08').subscribe((res) => {
      if (res) this.functionList = res;
    });
  }

  onInit(): void {
    if (this.typeCalendar == 'month') {
      let myInterVal = setInterval(() => {
        if (this.calendar) {
          clearInterval(myInterVal);
          var tempCalendar = this.calendar.element;
          var htmlE = tempCalendar as HTMLElement;
          var eleFromDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
            ?.childNodes[0]?.childNodes[0]?.childNodes[0] as HTMLElement;
          let numbF = this.convertStrToDate(eleFromDate);
          const fDayOfMonth = moment(numbF).toISOString();
          let eleToDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
            ?.childNodes[4]?.childNodes[6].childNodes[0] as HTMLElement;
          let numbL = this.convertStrToDate(eleToDate);
          const lDayOfMonth = moment(numbL).toISOString();
          this.getFirstParam(fDayOfMonth, lDayOfMonth);
        }
      }, 200);
    }
    this.getMaxPinNote();
    this.loadData();
  }

  ngAfterViewInit() {}

  loadData() {
    this.noteService.data.subscribe((res) => {
      if (res) {
        var data = res[0]?.data;
        var type = res[0]?.type;
        if (this.lstView) {
          if (type == 'add-otherDate') {
            (this.lstView.dataService as CRUDService).remove(data).subscribe();
            this.WP_Notes.push(data);
            this.dataResourceModel.unshift(data);
          } else if (type == 'add-currentDate') {
            (this.lstView.dataService as CRUDService).add(data, 0).subscribe();
            this.WP_Notes.push(data);
            this.dataResourceModel.unshift(data);
          } else if (type == 'delete') {
            // (this.lstView.dataService as CRUDService).remove(data).subscribe();
            this.lstView.dataService.data =
              this.lstView.dataService.data.filter(
                (x) => x.transID != data.transID
              );
            this.WP_Notes = this.WP_Notes.filter(
              (x) => x.transID != data.transID
            );
            this.dataResourceModel = this.dataResourceModel.filter(
              (x) => x.transID != data.transID
            );
          } else if (type == 'edit-otherDate') {
            (this.lstView.dataService as CRUDService).remove(data).subscribe();
            this.countNotePin = 0;
            for (let i = 0; i < this.WP_Notes.length; i++) {
              if (this.WP_Notes[i].transID == data?.transID) {
                this.WP_Notes[i].calendarDate = data.calendarDate;
                this.WP_Notes[i].isPin = data.isPin;
              }
              if (
                this.WP_Notes[i].isPin == true ||
                this.WP_Notes[i].isPin == '1'
              ) {
                this.countNotePin++;
              }
            }
            for (let i = 0; i < this.dataResourceModel.length; i++) {
              if (this.dataResourceModel[i].transID == data?.transID) {
                this.dataResourceModel[i].calendarDate = data.calendarDate;
                this.dataResourceModel[i].isPin = data.isPin;
              }
            }
          } else if (type == 'edit-currentDate') {
            (this.lstView.dataService as CRUDService).update(data).subscribe();
            if (data?.showCalendar == false) {
              for (let i = 0; i < this.WP_Notes.length; i++) {
                if (this.WP_Notes[i].transID == data?.transID) {
                  this.WP_Notes[i].calendarDate = null;
                }
              }
              for (let i = 0; i < this.dataResourceModel.length; i++) {
                if (this.dataResourceModel[i].transID == data?.transID) {
                  this.dataResourceModel[i].calendarDate = null;
                }
              }
            }
            var index = this.WP_Notes.findIndex(
              (x) => x.transID == data?.transID
            );
            this.WP_Notes[index].isPin = data.isPin;
            if (this.WP_Notes) {
              this.countNotePin = 0;
              this.WP_Notes.forEach((res) => {
                if (res.isPin == true || res.isPin == '1') {
                  this.countNotePin++;
                }
              });
            }
          } else if (type == 'edit') {
            (this.lstView.dataService as CRUDService).update(data).subscribe();
          } else if (type == 'add-note-drawer') {
            (this.lstView.dataService as CRUDService).load().subscribe();
            (this.lstView.dataService as CRUDService).add(data, 0).subscribe();
            this.WP_Notes.push(data);
            this.dataResourceModel.unshift(data);
          } else if (type == 'edit-note-drawer') {
            this.countNotePin = this.maxPinNotes;
            (this.lstView.dataService as CRUDService).data.forEach((x) => {
              if (x.transID == data.transID) {
                x.isPin = data.isPin;
                x.isNote = data.isNote;
                x.noteType = data.noteType;
                x.memo = data.memo;
                x.title = data.title;
                x.checkList = data.checkList;
                x.showCalendar = data.showCalendar;
              }
            });
            this.WP_Notes.forEach((x) => {
              if (x.transID == data.transID) {
                x.isPin = data.isPin;
                x.isNote = data.isNote;
                x.noteType = data.noteType;
                x.memo = data.memo;
                x.title = data.title;
                x.checkList = data.checkList;
                x.showCalendar = data.showCalendar;
              }
            });
            this.dataResourceModel.forEach((x) => {
              if (x.transID == data.transID) {
                x.isPin = data.isPin;
                x.isNote = data.isNote;
                x.noteType = data.noteType;
                x.memo = data.memo;
                x.title = data.title;
                x.checkList = data.checkList;
                x.showCalendar = data.showCalendar;
              }
            });
            (this.lstView.dataService as CRUDService).load().subscribe();
          }
          this.setEventWeek();
          var today: any = document.querySelector(
            ".e-footer-container button[aria-label='Today']"
          );
          if (today) {
            today.click();
          }
        }
        this.change.detectChanges();
      }
    });
  }

  getFirstParam(fDayOfMonth, lDayOfMonth) {
    this.getParamCalendar(fDayOfMonth, lDayOfMonth);
  }

  requestEnded(evt: any) {
    this.view.currentView;
    this.data = this.lstView.dataService.data;
  }

  getMaxPinNote() {
    this.api
      .exec<any>(
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetOneFieldByCalendarNote',
        'WPCalendars'
      )
      .subscribe((res) => {
        if (res[0]) {
          var dataValue = res[0].dataValue;
          var json = JSON.parse(dataValue);
          this.maxPinNotes = parseInt(json.MaxPinNotes, 10);
        }
      });
  }

  onLoad(args): void {
    let myInterVal = setInterval(() => {
      if (this.calendar) {
        clearInterval(myInterVal);
        this.setEvent(args.element, args);
      }
    }, 300);
  }

  setEventWeek() {
    this.toDate = new Date();
    var datePare = new Date(Date.parse(this.toDate));
    this.toDate = datePare.toLocaleDateString();
    var ele = document.querySelectorAll('.week-item[data-date]');
    let myInterval = setInterval(() => {
      if (ele && ele.length > 0) {
        clearInterval(myInterval);
        for (var i = 0; i < ele.length; i++) {
          let htmlEle = ele[i] as HTMLElement;
          var date = htmlEle?.dataset?.date;
          let obj = { date: date };
          var eleEvent = htmlEle.querySelector('.week-item-event');
          eleEvent.innerHTML = '';
          this.setEvent(eleEvent, obj);
        }
      }
    }, 500);
  }

  compareDate(calendarDate, daySelected) {
    var date = new Date(Date.parse(calendarDate));
    var dateParse = date.toLocaleDateString();
    if (dateParse == daySelected) {
      return dateParse;
    } else {
      return null;
    }
  }

  getDataByToDay(calendarDate, toDate) {
    var date = new Date(Date.parse(calendarDate));
    var dateParse = date.toLocaleDateString();
    if (dateParse == toDate) {
      return dateParse;
    } else {
      return null;
    }
  }

  changeDayOfWeek(e) {
    var data = JSON.parse(JSON.stringify(e.daySelected));
    let myInterval = setInterval(() => {
      if (this.lstView) {
        clearInterval(myInterval);
        this.setDate(data, this.lstView);
      }
    }, 100);
  }

  dateOfMonth: any;
  changeDayOfMonth(args: any) {
    if (!this.dateOfMonth) {
      var dateCrr = new Date();
      var monthCrr = 1 + moment(dateCrr).month();
      var nextMonth = 1 + moment(args.value).month();
      if (monthCrr != nextMonth) {
        if (this.calendar) {
          var tempCalendar = this.calendar.element;
          var htmlE = tempCalendar as HTMLElement;
          var eleFromDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
            ?.childNodes[0]?.childNodes[0]?.childNodes[0] as HTMLElement;
          let numbF = this.convertStrToDate(eleFromDate);
          const fDayOfMonth = moment(numbF).toISOString();
          let eleToDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
            ?.childNodes[4]?.childNodes[6].childNodes[0] as HTMLElement;
          let numbL = this.convertStrToDate(eleToDate);
          const lDayOfMonth = moment(numbL).toISOString();
          this.getFirstParam(fDayOfMonth, lDayOfMonth);
        }
      }
    } else {
      var monthCrr = 1 + moment(this.dateOfMonth).month();
      var nextMonth = 1 + moment(args.value).month();
      if (monthCrr != nextMonth) {
        if (this.calendar) {
          var tempCalendar = this.calendar.element;
          var htmlE = tempCalendar as HTMLElement;
          var eleFromDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
            ?.childNodes[0]?.childNodes[0]?.childNodes[0] as HTMLElement;
          let numbF = this.convertStrToDate(eleFromDate);
          const fDayOfMonth = moment(numbF).toISOString();
          let eleToDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
            ?.childNodes[4]?.childNodes[6].childNodes[0] as HTMLElement;
          let numbL = this.convertStrToDate(eleToDate);
          const lDayOfMonth = moment(numbL).toISOString();
          this.getFirstParam(fDayOfMonth, lDayOfMonth);
        }
      }
    }
    this.dateOfMonth = args.value;
    var data = JSON.parse(JSON.stringify(args.value));
    this.setDate(data, this.lstView);
    this.change.detectChanges();
  }

  changeNewMonth(args: any) {
    if (this.calendar) {
      var tempCalendar = this.calendar.element;
      var htmlE = tempCalendar as HTMLElement;
      var eleFromDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
        ?.childNodes[0]?.childNodes[0]?.childNodes[0] as HTMLElement;
      let numbF = this.convertStrToDate(eleFromDate);
      const fDayOfMonth = moment(numbF).toISOString();
      let eleToDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
        ?.childNodes[4]?.childNodes[6].childNodes[0] as HTMLElement;
      let numbL = this.convertStrToDate(eleToDate);
      const lDayOfMonth = moment(numbL).toISOString();
      this.getFirstParam(fDayOfMonth, lDayOfMonth);
    }
  }

  changeNewWeek(args: any) {
    if (this.lstView) {
      this.lstView.dataService.data = [];
    }
    this.getParamCalendar(
      args.fromDate.toISOString(),
      args.toDate.toISOString()
    );
    this.fDayOfWeek = args.fromDate;
    this.lDayOfWeek = args.toDate;
    this.change.detectChanges();
  }

  FDdate: any;
  TDate: any;
  fDayOfWeek: any;
  lDayOfWeek: any;
  setDate(data, lstView) {
    var dateT = moment(data).toISOString();
    var fromDate = dateT;
    this.daySelected = fromDate;
    var toDate = moment(dateT).add(1, 'day').toISOString();
    if (this.showList && lstView) {
      let myInterval = setInterval(() => {
        if (
          this.dataResourceModel.length > 0 &&
          this.countDataOfE == this.countEvent
        ) {
          clearInterval(myInterval);
          var dataTemp = JSON.parse(JSON.stringify(this.dataResourceModel));
          dataTemp = dataTemp.filter(
            (x) => x.calendarDate >= fromDate && x.calendarDate < toDate
          );
          (lstView.dataService as CRUDService).data = dataTemp;
          this.change.detectChanges();
        }
      });
    }
    this.FDdate = fromDate;
    this.TDate = toDate;
  }

  convertStrToDate(eleDate) {
    let str: any = eleDate.title.split(',');
    let strMonth: any = str[1].split('Tháng');
    let numb: any = strMonth[1] + '-' + strMonth[0];
    numb = numb + '-' + str[2];
    return numb.replaceAll(' ', '');
  }

  valueChangeTypeCalendar(e) {
    if (e) {
      if (e.data == true) {
        this.typeCalendar = 'week';
      } else {
        this.typeCalendar = 'month';
        let myInterval = setInterval(() => {
          if (this.calendar) {
            clearInterval(myInterval);
            var tempCalendar = this.calendar.element;
            var htmlE = tempCalendar as HTMLElement;
            var eleFromDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
              ?.childNodes[0]?.childNodes[0]?.childNodes[0] as HTMLElement;
            let numbF = this.convertStrToDate(eleFromDate);
            const fDayOfMonth = moment(numbF).toISOString();
            let eleToDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
              ?.childNodes[4]?.childNodes[6].childNodes[0] as HTMLElement;
            let numbL = this.convertStrToDate(eleToDate);
            const lDayOfMonth = moment(numbL).toISOString();
            this.getFirstParam(fDayOfMonth, lDayOfMonth);
          }
        }, 100);
      }
    }
  }

  @Input() countEvent = 0;
  @Input() countDataOfE = 0;
  getParamCalendar(fDayOfMonth, lDayOfMonth, updateCheck = true) {
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
            this.checkEP_BookingCarsParam = this.EP_BookingCarsParam?.ShowEvent;
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
        this.getModelShare(res, param.Template, 'WP_Notes');
      }
    });
  }

  getModelShare(lstData, param, transType) {
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
          if (this.WP_Notes && this.WP_Notes.length > 0) {
            this.WP_Notes.forEach((res) => {
              if (res.IsPin == true || res.IsPin == '1') {
                this.countNotePin++;
              }
            });
          }
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
    this.dataResourceModel = [
      ...this.TM_Tasks,
      ...this.WP_Notes,
      ...this.CO_Meetings,
      ...this.EP_BookingRooms,
      ...this.EP_BookingCars,
    ];
    this.onSwitchCountEven(transType);
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

  getParam(fromDate, toDate, updateCheck = true) {
    // this.api
    //   .callSv(
    //     'SYS',
    //     'ERM.Business.SYS',
    //     'SettingValuesBusiness',
    //     'GetDataInCalendarAsync',
    //     ['WPCalendars', fromDate, toDate]
    //   )
    //   .subscribe((res) => {
    //     if (res && res?.msgBodyData[0]) {
    //       var dt = res.msgBodyData[0];
    //       this.TM_TasksParam = dt[5]?.TM_Tasks
    //         ? JSON.parse(dt[5]?.TM_Tasks)
    //         : null;
    //       this.WP_NotesParam = dt[5]?.WP_Notes
    //         ? JSON.parse(dt[5]?.WP_Notes)
    //         : null;
    //       this.CO_MeetingsParam = dt[5]?.CO_Meetings
    //         ? JSON.parse(dt[5]?.CO_Meetings)
    //         : null;
    //       this.EP_BookingRoomsParam = dt[5]?.EP_BookingRooms
    //         ? JSON.parse(dt[5]?.EP_BookingRooms)
    //         : null;
    //       this.EP_BookingCarsParam = dt[5]?.EP_BookingCars
    //         ? JSON.parse(dt[5]?.EP_BookingCars)
    //         : null;
    //       this.settingValue = dt[5];
    //       if (updateCheck == true) {
    //         this.checkTM_TasksParam = this.TM_TasksParam?.ShowEvent;
    //         this.checkWP_NotesParam = this.WP_NotesParam?.ShowEvent;
    //         this.checkCO_MeetingsParam = this.CO_MeetingsParam?.ShowEvent;
    //         this.checkEP_BookingRoomsParam =
    //           this.EP_BookingRoomsParam?.ShowEvent;
    //         this.checkEP_BookingCarsParam = this.EP_BookingCarsParam?.ShowEvent;
    //       }
    //       this.WP_Notes = dt[0];
    //       this.TM_Tasks = dt[1];
    //       this.CO_Meetings = dt[2];
    //       this.EP_BookingRooms = dt[3];
    //       this.EP_BookingCars = dt[4];
    //       this.dataResourceModel = [
    //         ...this.WP_Notes,
    //         ...this.TM_Tasks,
    //         ...this.CO_Meetings,
    //         ...this.EP_BookingRooms,
    //         ...this.EP_BookingCars,
    //       ];
    //       if (this.WP_Notes && this.WP_Notes.length > 0) {
    //         this.WP_Notes.forEach((res) => {
    //           if (res.IsPin == true || res.IsPin == '1') {
    //             this.countNotePin++;
    //           }
    //         });
    //       }
    //     }
    //   });
  }

  setEvent(ele = null, args = null) {
    let calendarWP = 0;
    let calendarTM = 0;
    let calendarCO = 0;
    let calendarEP_Room = 0;
    let calendarEP_Car = 0;
    let countShowCalendar = 0;
    let countTmp = 0;
    if (args) {
      var date = args.date;
      if (typeof args.date !== 'string') date = date.toLocaleDateString();
      let myInterval = setInterval(() => {
        if (
          this.dataResourceModel.length > 0 &&
          this.countDataOfE == this.countEvent
        ) {
          clearInterval(myInterval);
          for (let y = 0; y < this.TM_Tasks?.length; y++) {
            var dateParse = new Date(this.TM_Tasks[y]?.calendarDate);
            var dataLocal = dateParse.toLocaleDateString();
            if (date == dataLocal) {
              calendarTM++;
              countTmp++;
              break;
            }
          }
          for (let y = 0; y < this.CO_Meetings?.length; y++) {
            var dateParse = new Date(this.CO_Meetings[y]?.calendarDate);
            var dataLocal = dateParse.toLocaleDateString();
            if (date == dataLocal) {
              calendarCO++;
              countTmp++;
              break;
            }
          }
          for (let y = 0; y < this.WP_Notes?.length; y++) {
            var dateParse = new Date(
              Date.parse(this.WP_Notes[y]?.calendarDate)
            );
            if (date == dateParse.toLocaleDateString()) {
              if (this.WP_Notes[y]?.showCalendar == true) {
                calendarWP++;
                countTmp++;
                if (this.WP_Notes[y]?.showCalendar == false) {
                  countShowCalendar += 1;
                } else {
                  countShowCalendar = 0;
                }
                break;
              }
            }
          }
          for (let y = 0; y < this.EP_BookingRooms?.length; y++) {
            var dateParse = new Date(this.EP_BookingRooms[y]?.calendarDate);
            var dataLocal = dateParse.toLocaleDateString();
            if (date == dataLocal) {
              calendarEP_Room++;
              countTmp++;
              break;
            }
          }
          for (let y = 0; y < this.EP_BookingCars?.length; y++) {
            var dateParse = new Date(this.EP_BookingCars[y]?.calendarDate);
            var dataLocal = dateParse.toLocaleDateString();
            if (date == dataLocal) {
              calendarEP_Car++;
              countTmp++;
              break;
            }
          }
          var day = moment(date).date();
          var month = moment(date).month();
          var year = moment(date).year();
          var classDate = `${day}-${month}-${year}`;

          var spanWP: HTMLElement = document.createElement('span');
          spanWP.className = `note-pointed-${classDate}`;
          var spanTM: HTMLElement = document.createElement('span');
          spanTM.className = `note-pointed-${classDate}`;
          var spanCO: HTMLElement = document.createElement('span');
          spanCO.className = `note-pointed-${classDate}`;
          var spanEP_Room: HTMLElement = document.createElement('span');
          spanEP_Room.className = `note-pointed-${classDate}`;
          var spanEP_Car: HTMLElement = document.createElement('span');
          spanEP_Car.className = `note-pointed-${classDate}`;
          var spanPlus: HTMLElement = document.createElement('span');
          var flex: HTMLElement = document.createElement('span');
          flex.className = 'd-flex note-point';
          ele.append(flex);
          if (calendarWP >= 1 && countShowCalendar < 1) {
            if (this.typeCalendar == 'week') {
              spanWP.setAttribute(
                'style',
                `width: 6px;height: 6px;background-color: ${this.WP_NotesParam?.ShowColor};border-radius: 50%;margin-left: 2px;margin-top: 0px;`
              );
            } else {
              spanWP.setAttribute(
                'style',
                `width: 6px;height: 6px;background-color: ${this.WP_NotesParam?.ShowColor};margin-left: 2px;border-radius: 50%`
              );
            }
            flex.append(spanWP);
          }

          if (calendarTM >= 1) {
            if (this.typeCalendar == 'week') {
              spanTM.setAttribute(
                'style',
                `width: 6px;background-color: ${this.TM_TasksParam?.ShowColor};height: 6px;border-radius: 50%;margin-left: 2px;margin-top: 0px;`
              );
            } else {
              spanTM.setAttribute(
                'style',
                `width: 6px;background-color: ${this.TM_TasksParam?.ShowColor};height: 6px;margin-left: 2px;border-radius: 50%;`
              );
            }
            flex.append(spanTM);
          }

          if (calendarCO >= 1) {
            if (this.typeCalendar == 'week') {
              spanCO.setAttribute(
                'style',
                `width: 6px;background-color: ${this.CO_MeetingsParam?.ShowColor};height: 6px;border-radius: 50%;margin-left: 2px;margin-top: 0px;`
              );
            } else {
              spanCO.setAttribute(
                'style',
                `width: 6px;background-color: ${this.CO_MeetingsParam?.ShowColor};height: 6px;margin-left: 2px;border-radius: 50%;`
              );
            }
            flex.append(spanCO);
          }
          if (calendarEP_Room >= 1) {
            if (this.typeCalendar == 'week') {
              spanEP_Room.setAttribute(
                'style',
                `width: 6px;background-color: ${this.EP_BookingRoomsParam?.ShowColor};height: 6px;border-radius: 50%;margin-left: 2px;margin-top: 0px;`
              );
            } else {
              spanEP_Room.setAttribute(
                'style',
                `width: 6px;background-color: ${this.EP_BookingRoomsParam?.ShowColor};height: 6px;margin-left: 2px;border-radius: 50%;`
              );
            }
            flex.append(spanEP_Room);
          }
          if (calendarEP_Car >= 1) {
            if (this.typeCalendar == 'week') {
              spanEP_Car.setAttribute(
                'style',
                `width: 6px;background-color: ${this.EP_BookingCarsParam?.ShowColor};height: 6px;border-radius: 50%;margin-left: 2px;margin-top: 0px;`
              );
            } else {
              spanEP_Car.setAttribute(
                'style',
                `width: 6px;background-color: ${this.EP_BookingCarsParam?.ShowColor};height: 6px;margin-left: 2px;border-radius: 50%;`
              );
            }
            flex.append(spanEP_Car);
          }
          if (
            calendarWP >= 1 &&
            calendarTM >= 1 &&
            calendarCO >= 1 &&
            calendarEP_Room >= 1 &&
            calendarEP_Car >= 1 &&
            countShowCalendar < 1
          ) {
            if (this.typeCalendar == 'week') {
              spanWP.setAttribute(
                'style',
                `width: 6px;height: 6px;background-color: ${this.WP_NotesParam?.ShowColor};border-radius: 50%`
              );
              spanTM.setAttribute(
                'style',
                `width: 6px;height: 6px;background-color: ${this.TM_TasksParam?.ShowColor};border-radius: 50%;margin-left: 2px;margin-top: 0px;`
              );
              spanCO.setAttribute(
                'style',
                `width: 6px;height: 6px;background-color: ${this.CO_MeetingsParam?.ShowColor};border-radius: 50%;margin-left: 2px;margin-top: 0px;`
              );
              spanEP_Room.setAttribute(
                'style',
                `width: 6px;height: 6px;background-color: ${this.EP_BookingRoomsParam?.ShowColor};border-radius: 50%;margin-left: 2px;margin-top: 0px;`
              );
              spanEP_Car.setAttribute(
                'style',
                `width: 6px;height: 6px;background-color: ${this.EP_BookingCarsParam?.ShowColor};border-radius: 50%;margin-left: 2px;margin-top: 0px;`
              );
            } else {
              spanWP.setAttribute(
                'style',
                `width: 6px;height: 6px;background-color: ${this.WP_NotesParam?.ShowColor};border-radius: 50%`
              );
              spanTM.setAttribute(
                'style',
                `width: 6px;height: 6px;background-color: ${this.TM_TasksParam?.ShowColor};border-radius: 50%;margin-left: 2px`
              );
              spanCO.setAttribute(
                'style',
                `width: 6px;height: 6px;background-color: ${this.CO_MeetingsParam?.ShowColor};border-radius: 50%;margin-left: 2px;margin-top: 0px;`
              );
              spanEP_Room.setAttribute(
                'style',
                `width: 6px;height: 6px;background-color: ${this.EP_BookingRoomsParam?.ShowColor};border-radius: 50%;margin-left: 2px;margin-top: 0px;`
              );
              spanEP_Car.setAttribute(
                'style',
                `width: 6px;height: 6px;background-color: ${this.EP_BookingCarsParam?.ShowColor};border-radius: 50%;margin-left: 2px;margin-top: 0px;`
              );
            }
            flex.append(spanWP);
            flex.append(spanTM);
            flex.append(spanCO);
            flex.append(spanEP_Room);
            flex.append(spanEP_Car);
          }
          var eleTest = ele.querySelectorAll(`.note-pointed-${classDate}`);
          let interVal = setInterval(() => {
            if (eleTest && eleTest.length > 0) {
              clearInterval(interVal);
              var plusNo = 0;
              if (eleTest.length > 3) {
                eleTest.forEach((x, index) => {
                  if (index >= 2) {
                    x.remove();
                    if (index == eleTest.length - 2) {
                      spanPlus.insertAdjacentText(
                        'afterbegin',
                        `+${eleTest.length - 2}`
                      );
                      spanPlus.setAttribute(
                        'style',
                        `font-size: 10px; margin-left: 2px; margin-top: -3px;`
                      );
                      flex.append(spanPlus);
                    }
                  }
                });
              }
            }
          });
        }
      });
    }
  }

  openFormUpdateNote(data) {
    var obj = {
      data: this.WP_Notes,
      dataUpdate: data,
      formType: 'edit',
      maxPinNotes: this.maxPinNotes,
      currentDate: this.daySelected,
      dataSelected: this.lstView.dataService.dataSelected,
    };
    let option = new DialogModel();
    option.DataService = this.lstView.dataService as CRUDService;
    option.FormModel = this.lstView.formModel;
    this.callfc.openForm(
      AddNoteComponent,
      'Cập nhật ghi chú',
      700,
      500,
      '',
      obj,
      '',
      option
    );
    this.itemUpdate = data;
    this.listNote = this.itemUpdate.checkList;
    this.type = data.noteType;
    this.transID = data?.transID;
  }

  checkNumberNotePin(data) {
    if (data?.isPin == '1' || data?.isPin == true) {
      this.countNotePin -= 1;
      this.checkUpdateNotePin = false;
    } else if (data?.isPin == '0' || data?.isPin == false) {
      if (this.countNotePin + 1 <= this.maxPinNotes) {
        this.countNotePin += 1;
        this.checkUpdateNotePin = false;
      } else {
        this.checkUpdateNotePin = true;
      }
    }
    this.openFormUpdateIsPin(data, this.checkUpdateNotePin);
  }

  openFormUpdateIsPin(data, checkUpdateNotePin) {
    if (checkUpdateNotePin == true) {
      var obj = {
        data: this.WP_Notes,
        itemUpdate: data,
        maxPinNotes: this.maxPinNotes,
        formType: 'edit',
      };
      this.callfc.openForm(
        UpdateNotePinComponent,
        'Cập nhật ghi chú đã ghim',
        500,
        600,
        '',
        obj
      );
    } else {
      this.onEditIsPin(data);
    }
  }

  openFormAddNote() {
    var obj = {
      data: this.WP_Notes,
      typeLst: this.typeList,
      formType: 'add',
      currentDate: this.daySelected,
      component: 'calendar-notes',
      maxPinNotes: this.maxPinNotes,
    };
    let option = new DialogModel();
    option.DataService = this.lstView.dataService as CRUDService;
    option.FormModel = this.lstView.formModel;
    this.callfc.openForm(
      AddNoteComponent,
      'Thêm mới ghi chú',
      700,
      500,
      '',
      obj,
      '',
      option
    );
  }

  valueChange(e, transID = null, item = null) {
    if (e) {
      var field = e.field;
      if (field == 'textarea') this.message = e.data.checked.checked;
      else if (item) {
        this.message = '';
        item[field] = e.data.checked;
      }
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
          if (this.typeCalendar == 'week') {
            // this.getParam(this.fDayOfWeek, this.lDayOfWeek, false);
            this.getParamCalendar(this.fDayOfWeek, this.lDayOfWeek);
          } else {
            let myInterVal = setInterval(() => {
              if (this.calendar) {
                clearInterval(myInterVal);
                var tempCalendar = this.calendar.element;
                var htmlE = tempCalendar as HTMLElement;
                var eleFromDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
                  ?.childNodes[0]?.childNodes[0]?.childNodes[0] as HTMLElement;
                let numbF = this.convertStrToDate(eleFromDate);
                const fDayOfMonth = moment(numbF).toISOString();
                let eleToDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
                  ?.childNodes[4]?.childNodes[6].childNodes[0] as HTMLElement;
                let numbL = this.convertStrToDate(eleToDate);
                const lDayOfMonth = moment(numbL).toISOString();
                this.getFirstParam(fDayOfMonth, lDayOfMonth);
                var today: any = document.querySelector(
                  ".e-footer-container button[aria-label='Today']"
                );
                if (today) {
                  today.click();
                }
              }
            });
          }
          this.setEventWeek();
          // var obj = {
          //   transType: transType,
          //   value: value,
          // };
          // this.codxShareSV.dataUpdateShowEvent.next(obj);
          this.componentRef.destroy();
          if (value == true && this.showList) {
            (this.lstView.dataService as CRUDService).dataObj = `WPCalendars`;
            (this.lstView.dataService as CRUDService).predicates =
              'CreatedOn >= @0 && CreatedOn < @1';
            (
              this.lstView.dataService as CRUDService
            ).dataValues = `${this.FDdate};${this.TDate}`;
            this.lstView.dataService
              .setPredicate(this.predicate, [this.dataValue])
              .subscribe((res) => {
                if (res) {
                  this.change.detectChanges();
                }
              });
          }
        }
      });
  }

  onEditIsPin(data: Notes) {
    var isPin = !data.isPin;
    data.isPin = isPin;
    data.isNote = true;
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        data?.transID,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          var object = [{ data: data, type: 'edit' }];
          this.noteService.data.next(object);
          for (let i = 0; i < this.WP_Notes.length; i++) {
            if (this.WP_Notes[i].transID == data?.transID) {
              this.WP_Notes[i].isPin = res.isPin;
            }
          }
        }
        this.change.detectChanges();
      });
  }

  onDelete(item) {
    (this.lstView.dataService as CRUDService)
      .delete([item], true, (opt) => {
        opt.service = 'WP';
        opt.assemblyName = 'ERM.Business.WP';
        opt.className = 'NotesBusiness';
        opt.methodName = 'DeleteNoteAsync';
        opt.data = item?.transID;
        return true;
      })
      .subscribe((res: any) => {
        if (res) {
          if (item.isPin) this.countNotePin--;
          if (res.fileCount > 0) this.deleteFile(res.transID, true);
          let dtNew = res;
          dtNew['transType'] = 'WP_Notes';
          dtNew['title'] = res.memo;
          dtNew['transID'] = res.recID;
          dtNew['calendarDate'] = res.createdOn;
          var object = [{ data: dtNew, type: 'delete' }];
          this.noteService.data.next(object);
        }
      });
  }

  deleteFile(fileID: string, deleted: boolean) {
    if (fileID) {
      this.api
        .execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'DeleteByObjectIDAsync',
          [fileID, 'WP_PersonalNotes', deleted]
        )
        .subscribe();
    }
  }

  openFormNoteBooks(item) {
    var obj = {
      itemUpdate: item,
    };
    this.callfc.openForm(SaveNoteComponent, '', 900, 650, '', obj);
  }

  valueChangeCB(e, note, index) {
    for (let i = 0; i < note.checkList.length; i++) {
      if (index == i) note.checkList[i].status = e.data;
    }
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        note?.transID,
        note,
      ])
      .subscribe();
  }
}
