import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
  TemplateRef,
} from '@angular/core';
import { VIEW_ACTIVE } from '@shared/constant/enum';
import {
  AuthStore,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
  CodxScheduleComponent,
  DataRequest,
  CodxListviewComponent,
  CacheService,
} from 'codx-core';
import { environment } from 'src/environments/environment';
import { InfoOpenForm } from '../models/task.model';
import { TmService } from '../tm.service';
import * as moment from 'moment';
import { EventSettingsModel } from '@syncfusion/ej2-angular-schedule';
import { SelectweekComponent } from '@shared/components/selectweek/selectweek.component';
import { CbxpopupComponent } from '../controls/cbxpopup/cbxpopup.component';
import { TaskInfoComponent } from '../controls/task-info/task-info.component';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ViewListDetailsComponent } from '../view-list-details/view-list-details.component';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { Calendar } from '@syncfusion/ej2-angular-calendars';
import {
  CalendarDateModel,
  CalendarModel,
  CalendarWeekModel,
  DaysOffModel,
} from '../models/calendar.model';
import { APICONSTANT } from '@shared/constant/api-const';
import 'lodash';
declare var _;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, AfterViewInit {
  @Input('taskInfo') taskInfo: TaskInfoComponent;
  @Input() viewPreset: string = 'weekAndDay';
  @Input() calendarID: string;
  @Input('listview') listview: CodxListviewComponent;

  moment = moment().locale('en');
  today: Date = new Date();
  startDate: Date = undefined;
  endDate: Date = undefined;
  daySelected: Date;
  user: any;
  minHeight = 525;
  height: number;
  events = [];
  resources: any;
  data: any = [];
  lstResource = [];
  gridView: any;
  itemSelected = null;
  dayWeeks = [];
  taskAction: any;
  objectAssign: any;
  @ViewChild(SelectweekComponent) selectweekComponent: SelectweekComponent;
  @ViewChild('schedule') schedule: CodxScheduleComponent;
  @ViewChild('add') add: TemplateRef<any>;
  @ViewChild('editCalendar') editCalendar: TemplateRef<any>;
  @ViewChild('editEvent') editEvent: TemplateRef<any>;
  @ViewChild('editCalendarDate') editCalendarDate: TemplateRef<any>;
  @ViewChild('calendar') calendar: TemplateRef<any>;
  model = new DataRequest();
  dayoff = [];
  resourceDataSource: any;
  calendateDate: any;
  dayOff: any;
  stShift = new CalendarWeekModel();
  ndShift = new CalendarWeekModel();
  vlls: any;
  set = false;
  evtData: any;
  evtCDDate: any;
  entity = {
    Calendars: 'calendar',
    DayOffs: 'dayoff',
    CalendarDate: 'calendarDate',
  };
  editTilte: string = 'Lịch làm việc chuẩn';
  param: any;

  fields = {
    id: 'taskID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'userID' },
  };
  resourceField = {
    Name: 'Resources',
    Field: 'userID',
    IdField: 'userID',
    TextField: 'userName',
    Title: 'Resources',
  };
  selectedDate = new Date();
  status = [
    { id: 1, status: '0', color: '#ff0000' },
    { id: 2, status: '1', color: '#ff8c1a' },
    { id: 3, status: '2', color: '#3399ff' },
    { id: 4, status: '3', color: '#ff0000' },
    { id: 5, status: '4', color: '#ff0000' },
    { id: 6, status: '5', color: '#010102' },
    { id: 7, status: '9', color: '#030333' },
    { id: 8, status: '8', color: '#420233' },
  ];

  columns = [
    {
      text: 'Tên thành viên',
      field: 'name',
      width: 200,
      htmlEncode: false,
      renderer: (data: any) => {
        if (!data?.value) {
          return '';
        }
        let arrayValue = data.value.split('|');
        let [userID, userName, position] = arrayValue;
        return ` <div class="d-flex align-items-center user-card py-4">
      <div class="symbol symbol-40 symbol-circle mr-4">
          <img  alt="Pic" src="${environment.apiUrl}/api/dm/img?objectID=${userID}&objectType=AD_Users&width=40&userId=${this.user.userID}&tenant=${this.user.tenant}&tk=${this.user.token}" />
      </div>
      <div class="d-flex flex-column flex-grow-1">
          <div class="text-dark font-weight-bold">${userName}</div>
          <div class="text-dark-75 font-weight-bold">${position}</div>
      </div>
  </div>`;
      },
    },
  ];
  features: {
    headerZoom: false;
  };
  viewBase: any;

  constructor(
    private tmSv: TmService,
    private api: ApiHttpService,
    private cache: CacheService,
    private auStore: AuthStore,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private df: ChangeDetectorRef
  ) {
    this.user = this.auStore.get();
  }
  scheduleObj: any = undefined;
  ngAfterViewInit(): void {
    this.scheduleObj = this.schedule.scheduleObj;
  }

  group = {
    enableCompactView: false,
    resources: ['Resources'],
  };

  ngOnInit(): void {
    this.getParams();
    this.cache.valueList('L1481').subscribe((res) => {
      this.vlls = res.datas;
    });
  }

  // close(e, t: ){

  // }

  getParams() {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.CM',
        'ParametersBusiness',
        'GetOneField',
        ['TM_Parameters', null, 'CalendarID']
      )
      .subscribe((res) => {
        if (res) {
          this.calendarID = res.fieldValue;
          this.getDayOff(this.calendarID);
        }
      });
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
          console.log(res);
          res.forEach((ele) => {
            this.dayoff = res;
          });
        }
      });
  }

  addNew(evt: any) {
    console.log(evt);
    this.taskInfo.openTask();
  }

  edit(taskAction) {
    this.taskInfo.openInfo(taskAction.id, 'edit');
  }

  deleteTask(taskAction) {
    if (!taskAction.delete) {
      if (taskAction.status == 9) {
        // this.notiService.notifyCode("TM001")
        this.notiService.notify(
          'Không thể xóa công việc này. Vui lòng kiểm tra lại!'
        );
        return;
      }
      var message = 'Bạn có chắc chắn muốn xóa task này !';
      this.notiService
        .alert('Cảnh báo', message, { type: 'YesNo' })
        .subscribe((dialog: Dialog) => {
          var that = this;
          dialog.close = function (e) {
            return that.close(e, that);
          };
        });
    } else this.notiService.notify('Bạn chưa được cấp quyền này !');
  }

  viewChange(evt: any) {
    let fied = this.gridView?.dateControl || 'DueDate';
    console.log(evt);
    // lấy ra ngày bắt đầu và ngày kết thúc trong evt
    this.startDate = evt?.fromDate;
    this.endDate = evt?.toDate;
    //Thêm vào option predicate
    this.model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.startDate, logic: 'and' },
        { operator: 'lte', field: fied, value: this.endDate, logic: 'and' },
      ],
    };
    //reload data
    this.schedule.reloadDataSource();
    this.schedule.reloadResource();
  }
  close(e: any, t: CalendarComponent) {
    if (e?.event?.status == 'Y') {
      var isCanDelete = true;
      t.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetListTaskChildDetailAsync',
          t.taskAction.taskID
        )
        .subscribe((res: any) => {
          if (res) {
            res.forEach((element) => {
              if (element.status != '1') {
                isCanDelete = false;
                return;
              }
            });
            if (!isCanDelete) {
              // this.notiService.notifyCode("TM001")
              t.notiService.notify(
                'Đã có phát sinh công việc liên quan, không thể xóa công việc này. Vui lòng kiểm tra lại!'
              );
            } else {
              t.tmSv.deleteTask(t.taskAction.taskID).subscribe((res) => {
                if (res) {
                  // this.notiService.notifyCode("TM004")
                  this.listview.removeHandler(this.taskAction, 'recID');
                  this.notiService.notify('Xóa task thành công !');
                  return;
                }
                t.notiService.notify(
                  'Xóa task không thành công. Vui lòng kiểm tra lại !'
                );
              });
            }
          }
        });
    }
  }

  onCellDblClickScheduler(data) {
    let taskID = data.event.eventRecord.data.id;
    if (taskID) {
      this.viewDetailTask(taskID);
    }
  }
  viewDetailTask(taskID) {
    this.tmSv.showPanel.next(
      new InfoOpenForm(taskID, 'TM003', VIEW_ACTIVE.Schedule, 'edit')
    );
  }

  testEvent(evt: any) {
    console.log(evt);
  }
  getCellContent(evt: any) {
    if (this.dayoff.length > 0) {
      for (let i = 0; i < this.dayoff.length; i++) {
        let day = new Date(this.dayoff[i].startDate);
        if (
          day &&
          evt.getFullYear() == day.getFullYear() &&
          evt.getMonth() == day.getMonth() &&
          evt.getDate() == day.getDate()
        ) {
          var time = evt.getTime();
          var ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach((item) => {
              (item as any).style.backgroundColor = '#ddd';
            });
          }
          return (
            '<icon class="' +
            this.dayoff[i].symbol +
            '"></icon>' +
            '<span>' +
            this.dayoff[i].note +
            '</span>'
          );
        }
      }
    }
    // var d = new Date();
    // if(evt.getMonth() == d.getMonth() && evt.getDate() == d.getDate()){
    //   var time = evt.getTime();
    //   var ele = document.querySelectorAll('[data-date="'+time+'"]');
    //   if(ele.length>0){
    //     ele.forEach(item => {
    //       (item as any).style.backgroundColor = '#ddd';
    //     })
    //   }
    //   return `<span >Nghỉ làm</span>`
    // }
    return ``;
  }

  setting() {
    this.openCalendarSettings();
  }

  // modal
  addCalendar() {
    this.callfc
      .openForm(this.add, 'Tạo lịch làm việc', 800, 500)
      .subscribe((res: Dialog) => {
        var that = this;
        res.close = function (e) {
          return that.close(e, that);
        };
      });
  }

  //Modal setting
  openCalendarSettings() {
    this.callfc
      .openForm(this.editCalendar, this.editTilte, 1200, 1000)
      .subscribe((res: Dialog) => {
        let _this = this;
        this.api
          .execSv<any>(
            APICONSTANT.SERVICES.BS,
            APICONSTANT.ASSEMBLY.BS,
            APICONSTANT.BUSINESS.BS.Calendars,
            'GetSettingCalendarAsync',
            this.calendarID
          )
          .subscribe((res) => {
            if (res) {
              _this.dayOff = res[0];
              _this.handleWeekDay(res[1]);
              _this.calendateDate = res[2];
            }
          });
        res.close = function (e) {
          return _this.close(e, _this);
        };
      });
  }

  //Modal event dayoff
  openDayOffs(data = null) {
    // const t = this;
    // t.evtData = new DaysOffModel();
    // if (data)
    //   t.evtData = { ...data };
    // t.evtData.dayoffCode = this.calendarID;
    // t.evtData.day = data?.day || 1;
    // t.evtData.month = data?.month || 1;
    // t.evtData.color = data?.color || '#0078ff'
    // t.dayOffModal = t.modalService.open(this.editEvent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
    // t.dayOffModal.result.then((result) => {
    //   t.evtData = new DaysOffModel();
    //   t.calendar.getDayOff();
    // }, (reason) => {
    //   t.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    // });

    this.callfc
      .openForm(this.editEvent, 'Thêm Lễ/Tết/Sự kiện', 800, 800)
      .subscribe((res: Dialog) => {
        let _this = this;
        if (data) _this.evtData = { ...data };
        _this.evtData.dayoffCode = this.calendarID;
        _this.evtData.day = data?.day || 1;
        _this.evtData.month = data?.month || 1;
        _this.evtData.color = data?.color || '#0078ff';
        _this.evtData = new DaysOffModel();
        //_this.calendar.getDayOff();
        res.close = function (e) {
          return _this.close(e, _this);
        };
      });
  }

  //Modal calendarDate
  openCalendarDate(data = null) {
    // const t = this;
    // t.evtCDDate = new CalendarDateModel();
    // if (data)
    //   t.evtCDDate = data;
    // t.evtCDDate.calendarID = this.calendarID;
    // t.evtCDDate.calendarDate = data?.calendarDate ? new Date(data.calendarDate) : new Date();
    // t.evtCDDate.dayoffColor = data?.dayoffColor || '#0078ff';
    // t.calendarModal = t.modalService.open(this.editCalendarDate, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
    // t.calendarModal.result.then((result) => {
    //   t.evtCDDate = new CalendarDateModel();
    //   t.calendar.getDayOff();
    // }, (reason) => {
    //   t.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    // });
  }
  // modal

  //Method
  saveAs() {
    // this.api.execSv<any>('BS', 'BS', 'CalendarsBusiness', 'SaveCalendarAsync', this.model).subscribe(res => {
    //   this.comboboxStd.data = [];
    //   this.comboboxStd.loadData();
    // })
  }

  savaDayOff() {
    // const t = this;
    // t.evtData.Day
    // let data = t.evtData;
    // this.api.execSv<any>(APICONSTANT.SERVICES.BS, APICONSTANT.ASSEMBLY.BS, APICONSTANT.BUSINESS.BS.DaysOff, 'SaveDayOffAsync', [this.evtData, this.set]).subscribe(res => {
    //   if (res) {
    //     if (res.isAdd)
    //       t.dayOff.push(res.data);
    //     else {
    //       t.dayOff.filter(function (o, i) {
    //         if (o.recID == data.recID)
    //           t.dayOff[i] = data;
    //       })
    //     }
    //     t.dayOffModal.close();
    //   }
    // })
  }

  savaCalendarDate() {
    // const t = this;
    // this.api.execSv<any>(APICONSTANT.SERVICES.BS, APICONSTANT.ASSEMBLY.BS, APICONSTANT.BUSINESS.BS.CalendarDate, 'SaveCalendarDateAsync', this.evtCDDate).subscribe(res => {
    //   if (res) {
    //     if (res.isAdd) {
    //       t.calendateDate.push(res.data);
    //     } else {
    //       var index = t.calendateDate.findIndex(p => p.recID == t.evtCDDate.recID);
    //       t.calendateDate[index] = t.evtCDDate;
    //     }
    //     t.calendarModal.close();
    //   }
    // })
  }

  removeDayOff(item) {
    // const t = this;
    // this.mainSv.confirmDialog('E0327').then(res => {
    //   if (res) {
    //     t.api.exec(APICONSTANT.ASSEMBLY.BS, APICONSTANT.BUSINESS.BS.DaysOff, 'DeleteAsync', item).subscribe(res => {
    //       if (res) {
    //         t.dayOff = _.filter(t.dayOff, function (o) {
    //           return o.recID != item.recID;
    //         })
    //         t.mainSv.notifyByMessageCode('E0408');
    //       }
    //     })
    //   }
    // });
  }

  removeCalendateDate(item) {
    // const t = this;
    // this.mainSv.confirmDialog('E0327').then(res => {
    //   if (res) {
    //     t.api.exec(APICONSTANT.ASSEMBLY.BS, APICONSTANT.BUSINESS.BS.CalendarDate, 'DeleteAsync', item).subscribe(res => {
    //       if (res) {
    //         t.calendateDate = _.filter(t.calendateDate, function (o) {
    //           return o.recID != item.recID;
    //         })
    //         t.mainSv.notifyByMessageCode('E0408');
    //       }
    //     })
    //   }
    // });
  }
  //Method

  handleWeekDay(dayOff) {
    const t = this;
    t.stShift.startTime = dayOff.stShift.startTimeSt;
    t.stShift.endTime = dayOff.stShift.endTimeSt;
    t.stShift.data = [];
    t.ndShift.startTime = dayOff.ndShift.startTimeNd;
    t.ndShift.endTime = dayOff.ndShift.endTimeNd;
    t.ndShift.data = [];
    this.vlls.forEach((e, i) => {
      let y = (i + 1).toString();
      let stCheck = _.some(dayOff.stShift.data, { weekday: y });
      let ndCheck = _.some(dayOff.ndShift.data, { weekday: y });
      t.stShift.data.push({
        Weekday: y,
        checked: stCheck,
        shiftType: 1,
      });
      t.ndShift.data.push({
        weekday: y,
        checked: ndCheck,
        shiftType: 2,
      });
    });
    this.df.detectChanges();
  }

  weekdayChange(e, item) {
    // var model = new CalendarWeekModel();
    // model.wKTemplateID = this.calendarID;
    // model.shiftType = item.shiftType;
    // model.weekday = item.weekday;
    // var check = e.data;
    // this.api.execSv<any>(APICONSTANT.SERVICES.BS, APICONSTANT.ASSEMBLY.BS, APICONSTANT.BUSINESS.BS.CalendarWeekdays, "SaveWeekdaysAsync", [model, check]).subscribe(res => {
    // })
  }

  valueChange(e, entity, element = null) {
    // //Param for Calendars
    // if (e.field == 'description' && entity == this.entity.Calendars)
    //   this.model.description = e.data;
    // if (e.field == 'calendarName' && entity == this.entity.Calendars)
    //   this.model.calendarName = e.data;
    // if (e.field == 'symbolCld')
    //   this.evtCDDate.symbol = e.data.value;
    // if (e.field == 'symbolDayOff')
    //   this.evtData.symbol = e.data.value;
    // //Param for DayOffs
    // if (e.field == "day")
    //   this.evtData.day = e.data;
    // if (e.field == "month")
    //   this.evtData.month = e.data;
    // if (e.field == 'calendar' && entity == this.entity.DayOffs)
    //   this.evtData.calendar = e.data.value;
    // if (e.field == 'set' && entity == this.entity.DayOffs)
    //   this.set = e.data;
    // //Param for CalendarDate & DayOff
    // if (e.field == 'note1')
    //   this.evtData.note = e.data;
    // if (e.field == 'note2')
    //   this.evtCDDate.note = e.data;
    // if (e.field === "color" || e.field === "dayoffColor") {
    //   if (entity == this.entity.DayOffs)
    //     this.evtData.color = e.data;
    //   if (entity == this.entity.CalendarDate)
    //     this.evtCDDate.dayoffColor = e.data;
    //   var $elm = $('.symbol-label[data-color]', $('.patternt'));
    //   $elm.removeClass('color-check');
    //   $('kendo-colorpicker.symbol-label', $(element)).addClass('color-check');
    //   this.df.detectChanges();
    // } else {
    //   if (element) {
    //     var $parent = $(element.ele);
    //     if ($parent && $parent.length > 0) {
    //       var text = $('.k-selected-color', $parent);
    //       text.text(e.data);
    //       text.css("background-color", e);
    //       if (e.field == "headerColor")
    //         $('.header-pattent').css('color', e);
    //       else if (e.field == "textColor")
    //         $('.content-pattent').css('color', e);
    //     }
    //   }
    // }
  }

  changeCombobox(e) {
    this.calendarID = e.data.CalendarID;
    this.editTilte = e.data.Description;
    //this.calendar.getDayOff(this.calendarID);
  }

  changeTime(e, entity) {
    if (e.field == 'calendarDate') this.evtCDDate.calendarDate = e.data;
  }
}
