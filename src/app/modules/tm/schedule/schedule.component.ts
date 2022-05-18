import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { VIEW_ACTIVE } from '@shared/constant/enum';
import { AuthStore, ApiHttpService, CallFuncService, NotificationsService, CodxScheduleComponent, DataRequest, CodxListviewComponent } from 'codx-core';
import { environment } from 'src/environments/environment';
import { InfoOpenForm } from '../models/task.model';
import { TmService } from '../tm.service';
import * as moment from "moment";
import { EventSettingsModel } from '@syncfusion/ej2-angular-schedule';
import { SelectweekComponent } from '@shared/components/selectweek/selectweek.component';
import { CbxpopupComponent } from '../controls/cbxpopup/cbxpopup.component';
import { TaskInfoComponent } from '../controls/task-info/task-info.component';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ViewListDetailsComponent } from '../view-list-details/view-list-details.component';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { Calendar } from '@syncfusion/ej2-angular-calendars';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit, AfterViewInit {
  @Input('taskInfo') taskInfo: TaskInfoComponent;
  @Input() viewPreset: string = "weekAndDay";
  @Input() calendarID: string;
  @Input('listview') listview: CodxListviewComponent;

  moment = moment().locale("en");
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
  status = [
    { id: 1, status: '0', color: '#ff0000' },
    { id: 2, status: '1', color: '#ff8c1a' },
    { id: 3, status: '2', color: '#3399ff' },
    { id: 4, status: '3', color: '#ff0000' },
    { id: 5, status: '4', color: '#ff0000' },
    { id: 6, status: '5', color: '#010102' },
    { id: 7, status: '9', color: '#030333' },
    { id: 8, status: '8', color: '#420233' },

  ]

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

  constructor(
    private tmSv: TmService,
    private api: ApiHttpService,
    private auStore: AuthStore,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef
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
    let fied = this.gridView?.dateControl || 'DueDate';
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.predicate = '';
    this.model.funcID = "TM003"//this.viewBase.funcID ;
    this.model.page = 1;
    this.model.pageSize = 100;
    if (this.startDate && this.endDate) {
      this.model.filter = {
        logic: 'and',
        filters: [
          { operator: 'gte', field: fied, value: this.startDate, logic: 'and', }, ///cho mac dinh cho filter
          { operator: 'lte', field: fied, value: this.endDate, logic: 'and' },
        ],
      };
    }

    const t = this;
    // this.lstItems = [];
    t.tmSv.loadTaskByAuthen(this.model).subscribe((res) => {
      if (res && res.length) {
        this.data = res[0];
        this.itemSelected = res[0][0];
        this.api
          .execSv<any>(
            'TM',
            'ERM.Business.TM',
            'TaskBusiness',
            'GetTaskByParentIDAsync',
            [this.itemSelected?.id]
          )
          .subscribe((res) => {
            if (res && res.length > 0) {
              let objectId = res[0].owner;
              let objectState = res[0].status;
              for (let i = 1; i < res?.length; i++) {
                objectId += ';' + res[i].owner;
                objectState += ';' + res[i].status;
              }
              this.objectAssign = objectId;
            }
          });

      }
    });

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

  addNew(evt: any) {
    console.log(evt);
    this.taskInfo.openTask();
  }

  edit(taskAction) {
    this.taskInfo.openInfo(taskAction.id, "edit");
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

    } else
      this.notiService.notify('Bạn chưa được cấp quyền này !');
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
        { operator: 'lte', field: fied, value: this.endDate, logic: 'and' }
      ]
    }
    //reload data
    this.schedule.reloadDataSource();
    this.schedule.reloadResource();

  }
  close(e: any, t: ScheduleComponent) {
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
          return '<icon class="'+ this.dayoff[i].symbol+'"></icon>'+'<span>'+this.dayoff[i].note+'</span>'
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
