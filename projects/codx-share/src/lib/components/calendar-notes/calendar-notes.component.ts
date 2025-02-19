import { DataRequest } from './../../../../../../src/shared/models/data.request';
import { Output } from '@angular/core';
import { DatePipe } from '@angular/common';

import {
  UIComponent,
  DialogRef,
  DialogModel,
  AuthStore,
  CRUDService,
  CodxListviewComponent,
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
} from '@angular/core';
import { Notes, tmpBookingCalendar } from '@shared/models/notes.model';
import moment from 'moment';
import { CodxShareService } from '../../codx-share.service';
import { CalendarComponent } from '@syncfusion/ej2-angular-calendars';
import { tmpTransType } from './model/tmpTransType.model';
import { NoteService } from './note.service';
import { AddNoteComponent } from './add-note/add-note.component';
import { UpdateNotePinComponent } from './update-note-pin/update-note-pin.component';
import { SaveNoteComponent } from './add-note/save-note/save-note.component';
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
  dateSelected: any;
  typeList = 'notes-home';
  dataValue = '';
  predicate = '';
  userID = '';
  editMF: any;
  deleteMF: any;
  pinMF: any;
  saveMF: any;
  functionList: any;
  dialog: DialogRef;
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
  curHoverItem;
  //transtype list
  lstTransType: tmpTransType[] = [];
  lstWeekEvents = [];
  //

  @Input() typeCalendar = 'week';
  @Output() dataResourceModel: any[] = [];
  @Output() settingValue: any;

  @ViewChild('listview') lstView: CodxListviewComponent;
  @ViewChild('dataPara') dataPara: TemplateRef<any>;
  @ViewChild('calendar') calendar!: CalendarComponent;
  constructor(
    injector: Injector,
    private change: ChangeDetectorRef,
    private auth: AuthStore,
    private noteService: NoteService,
    private codxShareSV: CodxShareService,
    private datePipe: DatePipe
  ) {
    super(injector);
    let dataSv = new CRUDService(injector);
    dataSv.idField = 'transID';
    this.dtService = dataSv;
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
    this.getDataByModeMonth();
  }

  onInit(): void {
    this.getMaxPinNote();
    this.loadData();
    this.getCalendarSetting();
  }

  ngAfterViewInit() {}

  getDataByModeMonth() {
    if (this.typeCalendar == 'month') {
      let myInterVal = setInterval(() => {
        if (this.calendar) {
          clearInterval(myInterVal);
          var tempCalendar = this.calendar.element;
          var htmlE = tempCalendar as HTMLElement;
          var eleFromDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
            ?.childNodes[0]?.childNodes[0]?.childNodes[0] as HTMLElement;
          let numbF = this.convertStrToDate(eleFromDate);
          const fDayOfMonth = moment(numbF).add(1, 'day').toJSON();
          let length =
            htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]?.childNodes
              .length;
          let eleClass = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
            ?.childNodes[length - 1] as HTMLElement;
          let indexLast = length - 1;
          if (eleClass.className == 'e-month-hide') indexLast = length - 2;
          let eleToDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
            ?.childNodes[indexLast]?.childNodes[6].childNodes[0] as HTMLElement;
          let numbL = this.convertStrToDate(eleToDate);
          const lDayOfMonth = moment(numbL).add(1, 'day').toJSON();
          this.getParamCalendar(fDayOfMonth, lDayOfMonth, true);
        }
      }, 500);
    }
  }

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
            (this.lstView.dataService as CRUDService).remove(data).subscribe();
            this.WP_Notes = this.WP_Notes.filter(
              (x) => x.transID != data.transID
            );
            this.dataResourceModel = this.dataResourceModel.filter(
              (x) => x.transID != data.transID
            );
          } else if (type == 'edit-otherDate') {
            (this.lstView.dataService as CRUDService).remove(data).subscribe();
            for (let i = 0; i < this.WP_Notes.length; i++) {
              if (this.WP_Notes[i].transID == data?.transID) {
                this.WP_Notes[i].calendarDate = data.calendarDate;
                this.WP_Notes[i].isPin = data.isPin;
                this.WP_Notes[i].memo = data.memo;
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
                this.dataResourceModel[i].memo = data.memo;
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
              this.codxShareSV.getDataWP_Notes_IsPin().subscribe((res: any) => {
                if (res?.length > 0) this.countNotePin = res.length;
              });
            }
          } else if (type == 'edit') {
            (this.lstView.dataService as CRUDService).update(data).subscribe();
          } else if (type == 'add-note-drawer') {
            (this.lstView.dataService as CRUDService).load().subscribe();
            (this.lstView.dataService as CRUDService).add(data, 0).subscribe();
            this.WP_Notes.push(data);
            this.dataResourceModel.unshift(data);
          } else if (
            type == 'edit-note-drawer-otherDate' ||
            type == 'edit-note-drawer-currentDate' ||
            type == 'edit-note-drawer'
          ) {
            this.countNotePin = this.maxPinNotes;
            if (
              type == 'edit-note-drawer-currentDate' ||
              type == 'edit-note-drawer'
            ) {
              (this.lstView.dataService as CRUDService)
                .update(data)
                .subscribe();
            } else
              (this.lstView.dataService as CRUDService)
                .remove(data)
                .subscribe();
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
                x.calendarDate = data.calendarDate;
              }
            });
          }
          if (this.typeCalendar == 'month' && this.calendar) {
            this.calendar.refresh();
            this.calendar.value = this.FDdate;
          } else this.setEventWeek();
        }
        this.WP_NotesTemp = JSON.parse(JSON.stringify(this.WP_Notes));
        this.lstView.dataService.data.sort(this.orderByStartTime);

        this.change.detectChanges();
      }
    });
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
    // let myInterval = setInterval(() => {
    //   let ele = document.querySelectorAll('.week-item[data-date]');
    //   if (ele && ele.length > 0) {
    //     clearInterval(myInterval);
    //     for (var i = 0; i < ele.length; i++) {
    //       let htmlEle = ele[i] as HTMLElement;
    //       var date = htmlEle?.dataset?.date;
    //       let obj = { date: date };
    //       var eleEvent = htmlEle.querySelector('.week-item-event');
    //       eleEvent.innerHTML = '';
    //       this.setEvent(eleEvent, obj);
    //     }
    //   }
    // }, 200);
  }

  changeDayOfWeek(e) {
    this.dateSelected = e.daySelected;
    this.drawData();
    this.changeNewWeek(null, this.dateSelected);
  }

  curStartDateOfWeek;
  curEndDateOfWeek;
  changeWeekQueue = new Map<string, any>();

  clickChangeWeek(args) {
    clearTimeout(this.changeWeekQueue.get('0'));
    this.changeWeekQueue.set(
      '0',
      setTimeout(this.changeNewWeek.bind(this), 300, args)
    );
  }

  changeNewWeek(args: any, setDate = null) {
    if (args) {
      let startDate = moment(args.fromDate).toJSON();
      let endDate = moment(args.toDate).toJSON();
      this.curStartDateOfWeek = startDate;
      this.curEndDateOfWeek = endDate;
      this.getParamCalendar(startDate, endDate);
    }
    let myInterval = setInterval(() => {
      if (
        this.lstView.dataService.data.length > 0 &&
        this.countDataOfE == this.countEvent
      ) {
        clearInterval(myInterval);
        if (args) this.setEventWeek();
        if (setDate) {
          if (this.lstView) {
            let date = setDate;
            clearInterval(myInterval);
            this.setDate(date, this.lstView);
            this.detectorRef.detectChanges();
          }
        }
      }
    }, 100);
  }

  changeDayOfMonth(args: any) {
    args['date'] = args.value;
    let crrDate = moment(this.FDdate).startOf('month').add(1, 'day').toJSON();
    let newDate = moment(args.value).startOf('month').add(1, 'day').toJSON();
    if (crrDate != newDate) this.changeNewMonth(args);
    else {
      this.FDdate = args.value;
      var data = args.value;
      this.setDate(data, this.lstView);
      this.change.detectChanges();
    }
  }

  changeNewMonth(args: any) {
    if (this.lstView) {
      this.lstView.dataService.data = [];
    }
    if (this.calendar) {
      var tempCalendar = this.calendar.element;
      var htmlE = tempCalendar as HTMLElement;
      var eleFromDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
        ?.childNodes[0]?.childNodes[0]?.childNodes[0] as HTMLElement;
      let numbF = this.convertStrToDate(eleFromDate);
      const fDayOfMonth = moment(numbF).add(1, 'day').toJSON();
      let length =
        htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]?.childNodes.length;
      let eleClass = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
        ?.childNodes[length - 1] as HTMLElement;
      let indexLast = length - 1;
      if (eleClass.className == 'e-month-hide') indexLast = length - 2;
      let eleToDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
        ?.childNodes[indexLast]?.childNodes[6].childNodes[0] as HTMLElement;
      let numbL = this.convertStrToDate(eleToDate);
      const lDayOfMonth = moment(numbL).add(1, 'day').toJSON();
      this.getParamCalendar(fDayOfMonth, lDayOfMonth, false);
      var data = args.date;
      this.setDate(data, this.lstView);
      this.change.detectChanges();
    }
  }

  setDate(date, lstView: CodxListviewComponent) {
    if (date) {
      //let dateT = new Date(date).toLocaleDateString();
      var fromDate = date;
      this.dateSelected = date;
      var toDate = moment(date).add(1, 'day').toDate(); //;.toJSON();
      if (lstView) {
        let myInterval = setInterval(() => {
          if (
            this.dataResourceModel.length > 0 &&
            this.countDataOfE == this.countEvent
          ) {
            clearInterval(myInterval);
            //var dataTemp = JSON.parse(JSON.stringify(this.dataResourceModel));
            //dataTemp.forEach((x) => {
            //let calendarDate = new Date(x.calendarDate).toLocaleDateString();
            //x.calendarDate = this.dateSelected;
            //});
            //let dataTemp = dataTemp.filter((x) => x.calendarDate == fromDate);
            this.lstView.dataService.data =
              this.lstView.dataService.data.filter(
                (x) =>
                  new Date(x.calendarDate) >= fromDate &&
                  new Date(x.calendarDate) < toDate
              );
            this.dataListViewTemp = JSON.parse(
              JSON.stringify(lstView.dataService.data)
            );
            this.change.detectChanges();
          }
        });
      }
      this.FDdate = fromDate;
      this.TDate = toDate;
    }
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
            const fDayOfMonth = moment(numbF).add(1, 'day').toJSON();
            let length =
              htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]?.childNodes
                .length;
            let eleClass = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
              ?.childNodes[length - 1] as HTMLElement;
            let indexLast = length - 1;
            if (eleClass.className == 'e-month-hide') indexLast = length - 2;
            let eleToDate = htmlE?.childNodes[1]?.childNodes[0]?.childNodes[1]
              ?.childNodes[indexLast]?.childNodes[6]
              .childNodes[0] as HTMLElement;
            let numbL = this.convertStrToDate(eleToDate);
            const lDayOfMonth = moment(numbL).add(1, 'day').toJSON();
            this.getParamCalendar(fDayOfMonth, lDayOfMonth, false);
            this.setDate(this.FDdate, this.lstView);
            this.change.detectChanges();
          }
        }, 100);
      }
    }
  }

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
          const lDayTimeOfMonth = moment(lDayOfMonth).endOf('date').toJSON();
          const dataValueTM = fDayOfMonth + ';' + lDayTimeOfMonth;

          if (dt[0]?.TM_Tasks && dt[0]?.TM_Tasks.length) {
            if (dt[0]?.TM_Tasks.length > 1)
              this.TM_TasksParam = dt[0]?.TM_Tasks[1]
                ? JSON.parse(dt[0]?.TM_Tasks[1])
                : null;

            this.getRequestTM(
              dt[0]?.TM_Tasks[0],
              dataValueTM,
              this.TM_TasksParam,
              this.TM_TasksParam?.ShowEvent
            );
          }

          if (dt[0]?.WP_Notes && dt[0]?.WP_Notes.length) {
            if (dt[0]?.WP_Notes.length > 1)
              this.WP_NotesParam = dt[0]?.WP_Notes[1]
                ? JSON.parse(dt[0]?.WP_Notes[1])
                : null;

            this.getRequestWP(
              dt[0]?.WP_Notes[0],
              dataValue,
              this.WP_NotesParam,
              this.WP_NotesParam?.ShowEvent
            );
          }

          if (dt[0]?.CO_Meetings && dt[0]?.CO_Meetings.length) {
            if (dt[0]?.CO_Meetings.length > 1)
              this.CO_MeetingsParam = dt[0]?.CO_Meetings[1]
                ? JSON.parse(dt[0]?.CO_Meetings[1])
                : null;

            this.getRequestCO(
              dt[0]?.CO_Meetings[0],
              dataValue,
              this.CO_MeetingsParam,
              this.CO_MeetingsParam?.ShowEvent
            );
          }

          if (dt[0]?.EP_BookingRooms && dt[0]?.EP_BookingRooms.length) {
            if (dt[0]?.EP_BookingRooms.length > 1)
              this.EP_BookingRoomsParam = dt[0]?.EP_BookingRooms[1]
                ? JSON.parse(dt[0]?.EP_BookingRooms[1])
                : null;

            this.getRequestEP_BookingRoom(
              dt[0]?.EP_BookingRooms[0],
              dataValue,
              this.EP_BookingRoomsParam,
              this.EP_BookingRoomsParam?.ShowEvent
            );
          }

          if (dt[0]?.EP_BookingCars && dt[0]?.EP_BookingCars.length) {
            if (dt[0]?.EP_BookingCars.length > 1)
              this.EP_BookingCarsParam = dt[0]?.EP_BookingCars[1]
                ? JSON.parse(dt[0]?.EP_BookingCars[1])
                : null;

            this.getRequestEP_BookingCar(
              dt[0]?.EP_BookingCars[0],
              dataValue,
              this.EP_BookingCarsParam,
              this.EP_BookingCarsParam?.ShowEvent
            );
          }
          this.lstTransType = [
            {
              transType: 'TM_Tasks',
              isActive: this.TM_TasksParam?.ShowEvent,
              color: this.TM_TasksParam?.ShowColor,
            },
            {
              transType: 'WP_Notes',
              isActive: this.WP_NotesParam?.ShowEvent,
              color: this.WP_NotesParam?.ShowColor,
            },
            {
              transType: 'CO_Meetings',
              isActive: this.CO_MeetingsParam?.ShowEvent,
              color: this.CO_MeetingsParam?.ShowColor,
            },
            {
              transType: 'EP_BookingRooms',
              isActive: this.EP_BookingRoomsParam?.ShowEvent,
              color: this.EP_BookingRoomsParam?.ShowColor,
            },
            {
              transType: 'EP_BookingCars',
              isActive: this.EP_BookingCarsParam?.ShowEvent,
              color: this.EP_BookingCarsParam?.ShowColor,
            },
          ];

          this.settingValue = dt[0];
          if (updateCheck == true) {
            this.checkTM_TasksParam = this.TM_TasksParam?.ShowEvent;
            this.checkWP_NotesParam = this.WP_NotesParam?.ShowEvent;
            this.checkCO_MeetingsParam = this.CO_MeetingsParam?.ShowEvent;
            this.checkEP_BookingRoomsParam =
              this.EP_BookingRoomsParam?.ShowEvent;
            this.checkEP_BookingCarsParam = this.EP_BookingCarsParam?.ShowEvent;
          }
        }
      });
  }

  //#region GetData each Types

  getRequestTM(predicate, dataValue, param, showEvent) {
    if (showEvent == '0' || showEvent == 'false') return;
    this.TM_Tasks = [];
    this.onSwitchCountEven('TM_Tasks');
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
    this.onSwitchCountEven('CO_Meetings');
    let requestDataEP_Room: DataRequest = new DataRequest();
    requestDataEP_Room.predicates = predicate;
    requestDataEP_Room.dataValues = dataValue;
    requestDataEP_Room.funcID = 'TMT0501';
    requestDataEP_Room.formName = 'Meetings';
    requestDataEP_Room.gridViewName = 'grvMeetings';
    requestDataEP_Room.pageLoading = true;
    requestDataEP_Room.page = 1;
    requestDataEP_Room.pageSize = 1000;
    requestDataEP_Room.entityName = 'CO_Meetings';
    this.codxShareSV
      .getRequestDataCO_Meetings(requestDataEP_Room)
      .subscribe((res) => {
        if (res) {
          this.getModelShare(res[0], param.Template, 'CO_Meetings');
        }
      });
    // let setting = this.settingCalendar.find(x => x.transType == "CO_Meetings");
    // if(setting)
    // {
    //   let json = JSON.parse(setting.dataValue);
    //   let date = new Date();
    //   let funcID = "COT03"; // lịch cá nhân
    //   let predicates = json.Predicate;
    //   let startDate = new Date(date.getFullYear(),date.getMonth(),1);
    //   let endDate = moment(date).add(1, 'M').add(-1,'s').toDate();
    //   this.codxShareSV.getDataCO_Meetings(funcID,predicates,"","",startDate,endDate).subscribe((res) => {
    //     if (res)
    //     {
    //       this.getModelShare(res[0], param.Template, 'CO_Meetings');
    //     }
    //   });
    // }
  }

  getRequestEP_BookingRoom(predicate, dataValue, param, showEvent) {
    if (showEvent == '0' || showEvent == 'false') return;
    this.onSwitchCountEven('EP_BookingRooms');
    this.EP_BookingRooms = [];
    let requestDataEP_Room: DataRequest = new DataRequest();
    requestDataEP_Room.predicates = predicate;
    requestDataEP_Room.dataValues = dataValue;
    requestDataEP_Room.funcID = 'EP4T11';
    requestDataEP_Room.formName = 'BookingRooms';
    requestDataEP_Room.gridViewName = 'grvBookingRooms';
    requestDataEP_Room.pageLoading = true;
    requestDataEP_Room.page = 1;
    requestDataEP_Room.pageSize = 1000;
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
    this.onSwitchCountEven('EP_BookingCars');
    this.EP_BookingCars = [];
    let requestDataEP_Car: DataRequest = new DataRequest();
    requestDataEP_Car.predicates = predicate;
    requestDataEP_Car.dataValues = dataValue;
    requestDataEP_Car.funcID = 'EP7T11';
    requestDataEP_Car.formName = 'BookingCars';
    requestDataEP_Car.gridViewName = 'grvBookingCars';
    requestDataEP_Car.pageLoading = true;
    requestDataEP_Car.page = 1;
    requestDataEP_Car.pageSize = 1000;
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
    this.onSwitchCountEven('WP_Notes');
    this.WP_Notes = [];
    this.codxShareSV.getDataWP_Notes(predicate, dataValue).subscribe((res) => {
      // this.countNotePin = 0;
      this.countNotePin = res[1];
      if (res) {
        this.getModelShare(res[0], param.Template, 'WP_Notes');
      }
    });
  }

  getModelShare(lstData, template, transType) {
    if (lstData && lstData.length > 0) {
      lstData.forEach((item) => {
        var paramValue = JSON.parse(
          JSON.stringify(Util.camelizekeyObj(template))
        );
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
            if (paramValue.data && paramValue.data.createdOn) {
              paramValue.calendarDate = paramValue.data.createdOn;
            }
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
        this.drawData();
        this.TM_TasksTemp = JSON.parse(JSON.stringify(this.TM_Tasks));
        this.WP_NotesTemp = JSON.parse(JSON.stringify(this.WP_Notes));
        this.CO_MeetingsTemp = JSON.parse(JSON.stringify(this.CO_Meetings));
        this.EP_BookingRoomsTemp = JSON.parse(
          JSON.stringify(this.EP_BookingRooms)
        );
        this.EP_BookingCarsTemp = JSON.parse(
          JSON.stringify(this.EP_BookingCars)
        );
      }
    }
  }

  //#endregion
  drawData() {
    if (this.lstView) {
      this.lstView.dataService.data = [];
      let curDateSelected = new Date(this.dateSelected).toLocaleDateString();
      this.lstWeekEvents = [
        ...this.TM_Tasks,
        ...this.WP_Notes,
        ...this.CO_Meetings,
        ...this.EP_BookingRooms,
        ...this.EP_BookingCars,
      ];

      this.lstTransType.forEach((tmpTrans) => {
        if (tmpTrans.isActive == '1') {
          switch (tmpTrans.transType) {
            case 'TM_Tasks':
              this.lstView.dataService.data = [
                ...this.TM_Tasks.filter((x) => {
                  let xDate = new Date(x.calendarDate).toLocaleDateString();
                  return xDate == curDateSelected;
                }).sort(this.orderByStartTime),
                ...this.lstView.dataService.data,
              ];
              break;
            case 'WP_Notes':
              this.lstView.dataService.data = [
                ...this.WP_Notes.filter((x) => {
                  let xDate = new Date(x.calendarDate).toLocaleDateString();
                  return xDate == curDateSelected;
                }).sort(this.orderByStartTime),
                ...this.lstView.dataService.data,
              ];
              break;
            case 'CO_Meetings':
              this.lstView.dataService.data = [
                ...this.CO_Meetings.filter((x) => {
                  let xDate = new Date(x.calendarDate).toLocaleDateString();
                  return xDate == curDateSelected;
                }).sort(this.orderByStartTime),
                ...this.lstView.dataService.data,
              ];
              break;
            case 'EP_BookingRooms':
              let lst = this.EP_BookingRooms?.length > 0 ? JSON.parse(JSON.stringify(this.EP_BookingRooms)) : [];
              lst = this.lstTransType.some(
                (x) => x.transType == 'CO_Meetings' && x.isActive == '1'
              )
                ? lst.filter((x) =>
                    !this.CO_Meetings.some(
                      (c) =>
                        c?.data?.location != null &&
                        c?.data?.location?.trim() != '' &&
                        x?.data?.refID == c?.data?.recID &&
                        c?.data?.startDate == x?.data?.startDate &&
                        c?.data?.endDate == x?.data?.endDate
                    )
                  )
                : lst;
              this.lstView.dataService.data = [
                ...lst.filter((x) => {
                  let xDate = new Date(x.calendarDate).toLocaleDateString();
                  return xDate == curDateSelected;
                }).sort(this.orderByStartTime),
                ...this.lstView.dataService.data,
              ];
              break;
            case 'EP_BookingCars':
              this.lstView.dataService.data = [
                ...this.EP_BookingCars.filter((x) => {
                  let xDate = new Date(x.calendarDate).toLocaleDateString();
                  return xDate == curDateSelected;
                }).sort(this.orderByStartTime),
                ...this.lstView.dataService.data,
              ];
              break;
            default:
              break;
          }
        }
      });
      this.detectorRef.detectChanges();
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

  setEventVer2(dateString) {
    let uniqueTypes: tmpTransType[] = [];
    this.lstTransType.forEach((trans) => {
      if (trans.isActive == '1') {
        let idx = this.lstWeekEvents.findIndex((e) => {
          let tmpDate = new Date(e.calendarDate).toLocaleDateString();
          let tmpTransType =
            trans.transType == 'TM_Tasks' ? 'TM_MyTasks' : trans.transType;
          return e.transType == tmpTransType && dateString == tmpDate;
        });
        if (idx != -1 && !uniqueTypes.includes(trans)) {
          uniqueTypes.push(trans);
        }
      }
    });
    return uniqueTypes;
  }

  setEvent(ele = null, args = null) {}

  openFormUpdateNote(data) {
    var obj = {
      data: this.WP_Notes,
      dataUpdate: data,
      formType: 'edit',
      maxPinNotes: this.maxPinNotes,
      currentDate: this.dateSelected,
      dataSelected: this.lstView.dataService.dataSelected,
      countNotePin: this.countNotePin,
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
      currentDate: this.dateSelected,
      component: 'calendar-notes',
      maxPinNotes: this.maxPinNotes,
      countNotePin: this.countNotePin,
    };
    let option = new DialogModel();
    option.DataService = this.lstView.dataService as CRUDService;
    option.FormModel = this.lstView.formModel;
    let dialog = this.callfc.openForm(
      AddNoteComponent,
      'Thêm mới ghi chú',
      700,
      500,
      '',
      obj,
      '',
      option
    );
    dialog.closed.subscribe(() => {
      this.detectorRef.detectChanges();
    });
    // dialog.closed.subscribe((e) => {
    //   (this.lstView.dataService as CRUDService).addd(e.event).subscribe();
    // });
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
      let curTransType = this.lstTransType.find((x) => x.transType == e.field);
      if (!curTransType) {
        curTransType = new tmpTransType();
        this.lstTransType.push(curTransType);
      }

      curTransType.transType = e.field;
      curTransType.isActive = e.data ? '1' : '0';
      // var field = e.field;
      // this.updateSettingValue(field, e.data);
    }
    this.drawData();
  }

  convertDMY_MDY(dmyString: string) {
    let arr = dmyString.split('/');
    let tmp = arr[1];
    arr[1] = arr[0];
    arr[0] = tmp;
    let mdy = arr.join('/');
    let dateReturn = new Date(mdy).toDateString();
    return dateReturn;
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
          if (value == '0') {
            let tmpTransType = transType;
            if (transType == 'TM_Tasks') {
              tmpTransType = 'TM_MyTasks';
            }

            this.dataResourceModel = this.dataResourceModel.filter(
              (x) => x.transType != tmpTransType
            );
            if (this.dataListViewTemp && this.dataListViewTemp.length > 0)
              this.lstView.dataService.data =
                this.lstView.dataService.data.filter(
                  (x) => x.transType != tmpTransType
                );
          } else if (value == '1') {
            if (
              this.checkWP_NotesParam == '0' ||
              this.checkTM_TasksParam == '0' ||
              this.checkCO_MeetingsParam == '0' ||
              this.checkEP_BookingCarsParam == '0' ||
              this.checkEP_BookingRoomsParam == '0'
            ) {
              if (this.calendar) {
                var tempCalendar = this.calendar.element;
                var htmlE = tempCalendar as HTMLElement;
                var eleFromDate = htmlE?.childNodes[1]?.childNodes[0]
                  ?.childNodes[1]?.childNodes[0]?.childNodes[0]
                  ?.childNodes[0] as HTMLElement;
                let numbF = this.convertStrToDate(eleFromDate);
                const fDayOfMonth = moment(numbF).add(1, 'day').toJSON();
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
                const lDayOfMonth = moment(numbL).add(1, 'day').toJSON();
                this.getParamCalendar(fDayOfMonth, lDayOfMonth, false);
              } else {
                if (this.typeCalendar == 'week') {
                  let eleWeek = document.querySelectorAll(
                    '.week-item[data-date]'
                  );
                  let htmlEleFD = eleWeek[0] as HTMLElement;
                  // var fromDate = moment(htmlEleFD?.dataset?.date).toJSON();
                  let fromDate = this.convertDMY_MDY(htmlEleFD?.dataset?.date);
                  let htmlEleTD = eleWeek[eleWeek.length - 1] as HTMLElement;
                  // var toDate = moment(htmlEleTD?.dataset?.date).toJSON();
                  let toDate = this.convertDMY_MDY(htmlEleTD?.dataset?.date);
                  this.getParamCalendar(fromDate, toDate, false);
                  this.setDate(this.FDdate, this.lstView);
                  this.change.detectChanges();
                }
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
            let lstTemp: any = JSON.parse(
              JSON.stringify(this.dataListViewTemp)
            );
            let tmpTransType = transType;
            if (transType == 'TM_Tasks') {
              tmpTransType = 'TM_MyTasks';
            }
            lstTemp = lstTemp.filter((x) => x.transType == tmpTransType);
            if (transType == 'WP_Notes')
              this.lstView.dataService.data = [
                ...lstTemp,
                ...this.lstView.dataService.data,
              ];
            else
              this.lstView.dataService.data = [
                ...this.lstView.dataService.data,
                ...lstTemp,
              ];
          }
          this.lstView.dataService.data.sort(this.orderByStartTime);
        }
      });
  }

  updateSettingValueVer2() {
    this.api
      .exec<any>(
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'AddUpdateByUserIDVer2Async',
        ['WPCalendars', this.lstTransType]
      )
      .subscribe((res) => {
        this.getParamCalendar(
          this.curStartDateOfWeek,
          this.curEndDateOfWeek,
          false
        );
      });
  }

  orderByStartTime(a, b) {
    let aS = new Date(a.startTime);
    let bS = new Date(b.startTime);

    if (aS < bS) {
      return -1;
    }
    if (aS > bS) {
      return 1;
    }
    return 0;
  }

  onEditIsPin(data: Notes) {
    var isPin = !data.isPin;
    data.isPin = isPin;
    data.isNote = true;
    if ((data as any).data != null) {
      data.createdOn = (data as any).data.createdOn;
    }
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
    if ((note as any).data != null) {
      note.createdOn = (note as any).data.createdOn;
    }
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        note?.transID,
        note,
      ])
      .subscribe();
  }

  getStart_EndTime(sStart, sEnd) {
    if (sStart && sEnd) {
      let startDate = new Date(sStart);
      let endDate = new Date(sEnd);
      let rHtml =
        this.datePipe.transform(startDate, 'H:mm') +
        ' - ' +
        this.datePipe.transform(endDate, 'H:mm');
      return rHtml;
    }
    return '';
  }

  getFieldValue(field: string, data): tmpBookingCalendar {
    let arr = field.replace(/ /g, '').split('|');
    let tmpType_RefID: tmpBookingCalendar = new tmpBookingCalendar();
    if (arr.length >= 2) {
      field = arr[0];
      field = field[0].toLowerCase() + field.slice(1);
      let type_codeValue = arr[1].split(':');

      if (type_codeValue.length >= 2) {
        tmpType_RefID.type = type_codeValue[0];
        tmpType_RefID.refID = type_codeValue[1];
        tmpType_RefID.value = data[field];
      }
    }

    return tmpType_RefID;
  }

  redirectToFuncID(item) {
    let query: any = {
      predicate: 'RecID=@0',
      dataValue: item.transID,
    };
    this.api
      .exec('SYS', 'SettingValuesBusiness', 'GetParamMyCalendarAsync', [
        'WPCalendars',
      ])
      .subscribe((res: any) => {
        if (res) {
          for (const prop in res) {
            if (prop === item.transType) {
              let param = JSON.parse(res[prop]);
              if (param && param.View) {
                query.view = param.View;
              }
            }
          }
        }
        this.codxService.openUrlNewTab(item.functionID, '', query);
      });
  }

  curPopup;
  quickInfo(item) {
    console.log('item', item);

    this.curHoverItem = item;
  }
  // get setting calendar
  settingCalendar: any[] = [];
  getCalendarSetting() {
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetCalendarSettingAsync',
        ['WPCalendars']
      )
      .subscribe((res: any) => {
        if (res?.length > 0) {
          this.settingCalendar = res;
          this.detectorRef.detectChanges();
        }
      });
  }
}
