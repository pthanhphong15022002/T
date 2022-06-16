import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { TaskInfoComponent } from '@modules/tm/controls/task-info/task-info.component';
import { TmService } from '@modules/tm/tm.service';
import { SelectweekComponent } from '@shared/components/selectweek/selectweek.component';
import { Calendar } from '@syncfusion/ej2-angular-calendars';
import { ApiHttpService, AuthStore, CallFuncService, CodxListviewComponent, CodxScheduleComponent, DataRequest, NotificationsService } from 'codx-core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { VIEW_ACTIVE } from '@shared/constant/enum';
import { InfoOpenForm } from '@modules/tm/models/task.model';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sprints-task-calendar',
  templateUrl: './sprints-task-calendar.component.html',
  styleUrls: ['./sprints-task-calendar.component.scss']
})
export class SprintsTaskCalendarComponent implements OnInit {

  @Input('taskInfo') taskInfo: TaskInfoComponent;
  @Input() viewPreset: string = "weekAndDay";
  @Input() calendarID: string;
  @Input('listview') listview: CodxListviewComponent;

  moment = moment().locale("en");
  today: Date;
  startDate: Date;
  endDate: Date;
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
  @ViewChild("schedule") schedule: CodxScheduleComponent;
  private calendar = new Calendar();
  model = new DataRequest();
  dayoff = [];
  resourceDataSource: any;

  fields = {
    id: 'taskID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: "userID" },
  }
  resourceField = {
    Name: 'Resources',
    Field: 'userID',
    IdField: 'userID',
    TextField: 'userName',
    Title: 'Resources',
  };
  selectedDate = new Date();

  columns = [
    {
      text: 'Tên thành viên', field: 'name', width: 200, htmlEncode: false,
      renderer: (data: any) => {
        if (!data?.value) {
          return "";
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
  </div>`

      }
    }
  ];
  features: {
    headerZoom: false
  };
  viewBase: any;
  iterationID: string = "";
  funcID: string
  group = {
    enableCompactView: false,
    resources: ['Resources'],
  };
  scheduleObj: any = undefined;
  constructor(
    private tmSv: TmService,
    private api: ApiHttpService,
    private auStore: AuthStore,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    private activedRouter: ActivatedRoute
  ) {
    this.user = this.auStore.get();
    this.activedRouter.firstChild?.params.subscribe(data => this.iterationID = data.id);
    this.funcID = this.activedRouter.snapshot.params["funcID"];
    var dataObj = { view: '', calendarID: '', viewBoardID: this.iterationID };
    this.model.dataObj = JSON.stringify(dataObj);
  }

  ngAfterViewInit(): void {
    this.scheduleObj = this.schedule.scheduleObj;
  }

  ngOnInit(): void {
    this.getParams();
    let fied = this.gridView?.dateControl || 'DueDate';
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.predicate = '';
    this.model.page = 1;
    this.model.pageSize = 100;
    if (this.startDate && this.endDate) {
      this.model.filter = {
        logic: 'and',
        filters: [
          { operator: 'gte', field: fied, value: this.startDate, logic: 'and', },
          { operator: 'lte', field: fied, value: this.endDate, logic: 'and' },
        ],
      };
    }

  }

  getParams() {
    this.api.execSv<any>('SYS', 'ERM.Business.CM', 'ParametersBusiness', 'GetOneField', ['TM_Parameters', null, 'CalendarID']).subscribe(res => {
      if (res) {
        this.calendarID = res.fieldValue;
        this.getDayOff(this.calendarID);
      }
    })
  }

  getDayOff(id = null) {
    if (id)
      this.calendarID = id;
    this.api.execSv<any>('BS', 'ERM.Business.BS', 'CalendarsBusiness', 'GetDayWeekAsync', [this.calendarID]).subscribe(res => {
      if (res) {
        console.log(res);
        res.forEach(ele => {
          this.dayoff = res;
        });
      }
    })
  }

  // addNew(evt: any) {
  //   console.log(evt);
  //   this.taskInfo.openTask();
  // }

  // edit(taskAction) {
  //   this.taskInfo.openInfo(taskAction.id, "edit");
  // }

  // deleteTask(taskAction) {
  //   if (!taskAction.delete) {
  //     if (taskAction.status == 9) {
  //       // this.notiService.notifyCode("TM001")
  //       this.notiService.notify(
  //         'Không thể xóa công việc này. Vui lòng kiểm tra lại!'
  //       );
  //       return;
  //     }
  //     var message = 'Bạn có chắc chắn muốn xóa task này !';
  //     this.notiService
  //       .alert('Cảnh báo', message, { type: 'YesNo' })
  //       .subscribe((dialog: Dialog) => {
  //         var that = this;
  //         dialog.close = function (e) {
  //           return that.close(e, that);
  //         };
  //       });

  //   } else
  //     this.notiService.notify('Bạn chưa được cấp quyền này !');
  // }

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
        { operator: 'lte', field: fied, value: this.endDate, logic: 'and' }
      ]
    }
    //reload data
    // this.schedule.reloadDataSource();
    // this.schedule.reloadResource();

  }
  // close(e: any, t: SprintsTaskCalendarComponent) {
  //   if (e?.event?.status == 'Y') {
  //     var isCanDelete = true;
  //     t.api
  //       .execSv<any>(
  //         'TM',
  //         'ERM.Business.TM',
  //         'TaskBusiness',
  //         'GetListTaskChildDetailAsync',
  //         t.taskAction.taskID
  //       )
  //       .subscribe((res: any) => {
  //         if (res) {
  //           res.forEach((element) => {
  //             if (element.status != '1') {
  //               isCanDelete = false;
  //               return;
  //             }
  //           });
  //           if (!isCanDelete) {
  //             // this.notiService.notifyCode("TM001")
  //             t.notiService.notify(
  //               'Đã có phát sinh công việc liên quan, không thể xóa công việc này. Vui lòng kiểm tra lại!'
  //             );
  //           } else {
  //             t.tmSv.deleteTask(t.taskAction.taskID).subscribe((res) => {
  //               if (res) {
  //                 // this.notiService.notifyCode("TM004")
  //                 this.listview.removeHandler(this.taskAction, 'recID');
  //                 this.notiService.notify('Xóa task thành công !');
  //                 return;
  //               }
  //               t.notiService.notify(
  //                 'Xóa task không thành công. Vui lòng kiểm tra lại !'
  //               );
  //             });
  //           }
  //         }
  //       });
  //   }
  // }

  onCellDblClickScheduler(data) {
    let taskID = data.event.eventRecord.data.id;
    if (taskID) {
      this.viewDetailTask(taskID);
    }
  }
  viewDetailTask(taskID) {
    this.tmSv.showPanel.next(new InfoOpenForm(taskID, "TM003", VIEW_ACTIVE.Schedule, 'edit'));
  }

  testEvent(evt: any) {
    console.log(evt)
  }
  getCellContent(evt: any) {
    if (this.dayoff.length > 0) {
      for (let i = 0; i < this.dayoff.length; i++) {
        let day = new Date(this.dayoff[i].startDate);
        if (day && evt.getFullYear() == day.getFullYear() &&
          evt.getMonth() == day.getMonth() &&
          evt.getDate() == day.getDate()) {
          var time = evt.getTime();
          var ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach(item => {
              (item as any).style.backgroundColor = this.dayoff[i].color;
            })
          }
          return '<icon class="' + this.dayoff[i].symbol + '"></icon>' + '<span>' + this.dayoff[i].note + '</span>'
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
}
