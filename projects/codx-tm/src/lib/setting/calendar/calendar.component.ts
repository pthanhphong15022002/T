import { PopupEditCalendarComponent } from './popup-edit-calendar/popup-edit-calendar.component';
import { PopupAddCalendarComponent } from './popup-add-calendar/popup-add-calendar.component';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
  Optional,
} from '@angular/core';
import {
  AuthStore,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
  CodxScheduleComponent,
  DataRequest,
  CacheService,
  DialogData,
  DialogRef,
} from 'codx-core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

import {
  CalendarModel,
  CalendarWeekModel,
} from '../../models/calendar.model';
import { APICONSTANT } from '@shared/constant/api-const';
import 'lodash';
import { SelectweekComponent } from 'projects/codx-share/src/lib/components/selectweek/selectweek.component';
import { CodxTMService } from '../../codx-tm.service';
declare var _;

@Component({
  selector: 'setting-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, AfterViewInit {
  //@Input('taskInfo') taskInfo: TaskInfoComponent;
  @Input() viewPreset: string = 'weekAndDay';
  @Input() calendarID: string;
  @ViewChild(SelectweekComponent) selectweekComponent: SelectweekComponent;
  @ViewChild('schedule') schedule: CodxScheduleComponent;

  stShift = new CalendarWeekModel();
  ndShift = new CalendarWeekModel();
  modelCalendar = new CalendarModel();
  model = new DataRequest();

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
  dayoff = [];
  resourceDataSource: any;
  calendateDate: any;
  dayOff: any;
  scheduleObj: any = undefined;
  dialog!: DialogRef;
  dayOffId: string;
  dataSelected: any;
  vlls: any;
  set = false;
  evtData: any;
  evtCDDate: any;
  entity = {
    Calendars: 'calendar',
    DayOffs: 'dayoff',
    CalendarDate: 'calendarDate',
  };
  param: any = 'STD';

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
    private tmSv: CodxTMService,
    private api: ApiHttpService,
    private cache: CacheService,
    private auStore: AuthStore,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private df: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.user = this.auStore.get();
    this.data = dt?.data;
    this.dialog = dialog;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.scheduleObj = this.schedule.scheduleObj;
  }

  group = {
    enableCompactView: false,
    resources: ['Resources'],
  };

  edit(taskAction) {
    //this.taskInfo.openInfo(taskAction.id, 'edit');
  }

  deleteTask(taskAction) {
    if (!taskAction.delete) {
      if (taskAction.status == 9) {
        this.notiService.notify(
          'Không thể xóa công việc này. Vui lòng kiểm tra lại!'
        );
        return;
      }
      var message = 'Bạn có chắc chắn muốn xóa task này !';
    } else this.notiService.notify('Bạn chưa được cấp quyền này !');
  }

  viewChange(evt: any) {
    let fied = this.gridView?.dateControl || 'DueDate';
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
    // this.schedule.reloadDataSource();
    // this.schedule.reloadResource();
  }
  close(e: any, t) {
    if (e.closedBy == 'user action') {
    }
  }

  onCellDblClickScheduler(data) {
    let taskID = data.event.eventRecord.data.id;
    if (taskID) {
      this.viewDetailTask(taskID);
    }
  }
  viewDetailTask(taskID) {
    //   this.tmSv.showPanel.next(
    //     new InfoOpenForm(taskID, 'TM003', VIEW_ACTIVE.Schedule, 'edit')
    //   );
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

  // modal
  addCalendar() {
    this.callfc.openForm(
      PopupAddCalendarComponent,
      'Tạo lịch làm việc',
      500,
      400,'',[]
    );
    //   .subscribe((res: Dialog) => {
    //     var _this = this;
    //     res.close = function (e) {
    //       return _this.close(e, _this);
    //     };
    //   });
  }

  //Modal setting
  openCalendarSettings() {
    this.callfc.openForm(
      PopupEditCalendarComponent,
      'Lịch làm việc chuẩn',
      1200,
      1000    );
    // .subscribe((res: Dialog) => {
    //   let _this = this;
    //   this.api
    //     .execSv<any>(
    //       APICONSTANT.SERVICES.BS,
    //       APICONSTANT.ASSEMBLY.BS,
    //       APICONSTANT.BUSINESS.BS.Calendars,
    //       'GetSettingCalendarAsync',
    //       this.calendarID
    //     )
    //     .subscribe((res) => {
    //       if (res) {
    //         _this.dayOff = res[0];
    //         _this.handleWeekDay(res[1]);
    //         _this.calendateDate = res[2];
    //       }
    //     });
    //   res.close = function (e) {
    //     return _this.close(e, _this);
    //   };
    // });
  }

  // modal

  //Method

  saveCalendar() {
    let test = {
      calendarName: 'Test Name',
      description: 'Test Description',
    };
    this.api
      .execSv<any>(
        APICONSTANT.SERVICES.BS,
        APICONSTANT.ASSEMBLY.BS,
        APICONSTANT.BUSINESS.BS.Calendars,
        'SaveCalendarAsync',
        [test]
      )
      .subscribe((res) => {});
  }

  valueChange(e, entity, element = null) {
    //Param for Calendars
    if (e.field == 'description' && entity == this.entity.Calendars)
      this.modelCalendar.description = e.data;
    if (e.field == 'calendarName' && entity == this.entity.Calendars)
      this.modelCalendar.calendarName = e.data;
    if (e.field == 'symbolCld') this.evtCDDate.symbol = e.data;
    if (e.field == 'symbolDayOff') this.evtData.symbol = e.data;
    //Param for DayOffs
    if (e.field == 'day') this.evtData.day = e.data;
    if (e.field == 'month') this.evtData.month = e.data;
    if (e.field == 'calendar' && entity == this.entity.DayOffs)
      this.evtData.calendar = e.data;
    if (e.field == 'set' && entity == this.entity.DayOffs)
      this.set = e.data.checked;
    //Param for CalendarDate & DayOff
    if (e.field == 'note1') this.evtData.note1 = e.data.value;
    if (e.field == 'note2') this.evtCDDate.note2 = e.data.value;
    if (e.field === 'color' || e.field === 'dayoffColor') {
      if (entity == this.entity.DayOffs) this.evtData.color = e.data;
      if (entity == this.entity.CalendarDate)
        this.evtCDDate.dayoffColor = e.data;
      this.df.detectChanges();
    } else {
      if (element) {
        //   var $parent = $(element.ele);
        //   if ($parent && $parent.length > 0) {
        //     var text = $('.k-selected-color', $parent);
        //     text.text(e.data);
        //     text.css('background-color', e);
        //     if (e.field == 'headerColor') $('.header-pattent').css('color', e);
        //     else if (e.field == 'textColor')
        //       $('.content-pattent').css('color', e);
        //   }
      }
    }
  }

  changeCombobox(e) {
    e['data'][0] == ''
      ? this.calendarID == 'STD'
      : (this.calendarID = e['data'][0]);
    //this.getDayOff(this.calendarID);
  }

  toggleMoreFunc(id: string) {
    this.dayOffId == id ? (this.dayOffId = '') : (this.dayOffId = id);
  }
}
