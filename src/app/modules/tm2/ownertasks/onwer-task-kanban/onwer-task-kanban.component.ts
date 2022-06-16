import { ActivatedRoute } from '@angular/router';
import { TmService } from '../../tm.service';
import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ChangeDetectorRef,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  CardSettingsModel,
  DialogSettingsModel,
  SwimlaneSettingsModel,
} from '@syncfusion/ej2-angular-kanban';
import {
  CoDxKanbanComponent,
  AuthStore,
  CacheService,
  CallFuncService,
  NotificationsService,
  CodxListviewComponent,
} from 'codx-core';
import { DataRequest } from '@shared/models/data.request';
import { TaskInfoComponent } from '@modules/tm/controls/task-info/task-info.component';
import { KanbanSetting } from '@modules/tm/models/settings.model';
import { ViewBaseComponent } from 'codx-core/lib/layout/views/view-base/view-base.component';

@Component({
  selector: 'onwer-task-kanban',
  templateUrl: './onwer-task-kanban.component.html',
  styleUrls: ['./onwer-task-kanban.component.scss'],
})
export class KanbanComponent implements OnInit {
  @ViewChild('kanban') kanban!: CoDxKanbanComponent;
  @ViewChild('listview') listview: CodxListviewComponent;
  @ViewChild('popupAdd') modalContent: any;
  @ViewChild('content') content: any;
  @Input('viewBase') viewBase: ViewBaseComponent;
  functionID: string;

  //@Input('taskInfo') taskInfo: TaskInfoComponent;

  @Output() taskInfo = new EventEmitter();

  dataSource: Object[] = [];
  data: any;
  setCalendar: boolean = true;
  mode: string;
  view: string;
  isAdd = false;
  today: Date = new Date();
  fromDate: Date = new Date(2022, 3, 1);
  toDate: Date = new Date(2022, 12, 30);
  configParam = null;
  gridView: any;
  grvSetup: any;
  user: any;
  item: any = {};
  showSumary = false;
  Sumary: string = '';
  columns: any = [];
  settings: any;
  taskAction: any;
  kanbanSetting: KanbanSetting = new KanbanSetting();
  contextMenuSetting = {
    enable: true,
    menuItem: [],
  };
  cardSettings: CardSettingsModel = {
    headerField: 'taskID',
    template: '#cardTemplate',
    selectionType: 'Single',
  };
  dialogSettings: DialogSettingsModel = {
    fields: [
      { text: 'ID', key: 'Description', type: 'TextBox' },
      { key: 'Status', type: 'DropDown' },
      { key: 'Assignee', type: 'DropDown' },
      { key: 'RankId', type: 'TextBox' },
      { key: 'Summary', type: 'TextArea' },
    ],
  };
  swimlaneSettings: SwimlaneSettingsModel = {
    keyField: 'userName',
    showEmptyRow: false,
  };
  cardId: string;

  constructor(
    private tmSv: TmService,
    private authStore: AuthStore,
    private cache: CacheService,
    private cr: ChangeDetectorRef,
    private cf: CallFuncService,
    private router: ActivatedRoute,
    private notiService: NotificationsService
  ) {
    this.user = this.authStore.get();
    this.functionID = this.router.snapshot.params["funcID"];
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.cache.viewSettings(this.functionID).subscribe((res) => {
      if (res) {
        this.settings = JSON.parse(res[0].settings);
        this.getColumnKanban();
      }
    });
    if (this.tmSv.myTaskComponent) {
      this.tmSv.myTaskComponent = false;
    }
    this.getListDetailTask();
  }

  viewMemo(id: string) {
    this.cardId == id ? (this.cardId = '') : (this.cardId = id);
  }

  getString(assignee: any) {
    return assignee
      .match(/\b(\w)/g)
      .join('')
      .toUpperCase();
  }

  editTask(data) {
    this.taskAction = data;
    if (!this.taskAction.write) {
      this.notiService.notify('Bạn chưa được cấp quyền này !');
      return;
    }
    if (this.taskAction.status < 8) {
      this.taskInfo.emit({ id: 'edit', data: this.taskAction });
      this.cr.detectChanges();
    } else {
      var message = 'Không thể chỉnh sửa công việc này !';
      if (this.taskAction.status == 8) {
        message = 'Công việc này đã bị hủy ! ' + message;
      }
      if (this.taskAction.status == 9) {
        message = 'Công việc này đã hoàn thành ! ' + message;
      }
      this.notiService.notify(message);
    }
  }

  onDataDrag(evt: Event) {
    if (!this.kanbanSetting.AllowDrag) {
      return;
    }
    this.item = evt;
  }

  onDataDrop(evt: Event) {
    this.item = evt;
    //  this.cf.openForm(this.content, 'Drag & Drop', 300, 300).subscribe(() => { });
  }

  submit(e: any) {
    const completed = new Date(2022, 5, 26, 18, 0, 0);
    const { id, status, comment } = this.item;
    this.tmSv
      .setStatusTask(id, status, completed, '8', comment)
      .subscribe((res) => { });
  }

  getListDetailTask() {
    let field = this.gridView?.dateControl || 'DueDate';
    let model = new DataRequest();
    model.formName = 'Tasks';
    model.gridViewName = 'grvTasks';
    model.entityName = 'TM_Tasks';
    model.predicate = 'Owner=@0';
    model.page = 1;
    model.pageSize = 100;
    model.dataValue = this.user.userID;
    model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: field, value: this.fromDate },
        { operator: 'lte', field: field, value: this.toDate },
      ],
    };
    let dataObj = { view: this.view, viewBoardID: '' };

    model.dataObj = JSON.stringify(dataObj);

    this.tmSv.loadTaskByAuthen(model).subscribe((res) => {
      if (res && res.length) {
        if (
          this.kanbanSetting.BreakDateBy == '1' &&
          this.kanbanSetting.ColumnField != 'status'
        ) {
          const today = new Date();
          res[0].map((data) => {
            if (this.isSameWeek(today, new Date(data.dueDate))) {
              data.dayOfWeek = this.getDayOfWeek(
                new Date(data.dueDate)
              ).toString();
            }
          });
        }
        if (
          this.kanbanSetting.BreakDateBy == '3' &&
          this.kanbanSetting.ColumnField != 'status'
        ) {
          const today = new Date();
          res[0].map((data) => {
            if (this.isSameMonth(today, new Date(data.dueDate))) {
              data.weekOfMonth = this.getWeekOfMonth(
                new Date(data.dueDate)
              ).toString();
            }
          });
        }
        if (
          this.kanbanSetting.BreakDateBy == '9' &&
          this.kanbanSetting.ColumnField != 'status'
        ) {
          const today = new Date();
          res[0].map((data) => {
            const diffTime = Math.abs(
              today.getTime() - new Date(data.dueDate).getTime()
            );
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (data.status == '1') {
              if (today.getTime() <= new Date(data.dueDate).getTime()) {
                if (diffDays <= 2) {
                  data.diffDays = '2';
                }
                if (diffDays >= 3 && diffDays <= 5) {
                  data.diffDays = '5';
                }
                if (diffDays >= 6 && diffDays <= 7) {
                  data.diffDays = '7';
                }
                if (diffDays > 7) {
                  data.diffDays = '8';
                }
              } else {
                if (diffDays <= 2) {
                  data.diffDays = '-2';
                }
                if (diffDays >= 3 && diffDays <= 5) {
                  data.diffDays = '-5';
                }
                if (diffDays >= 6 && diffDays <= 7) {
                  data.diffDays = '-7';
                }
                if (diffDays > 7) {
                  data.diffDays = '-8';
                }
              }
            }
          });
        }
        this.dataSource = res[0];
        this.kanban.setDataSource(res[0]);
        this.cr.detectChanges();
      }
    });
  }

  getColumnKanban() {
    const {
      ColumnField,
      ColumnMenu,
      ColumnToolbars,
      CountObjects,
      DragColumn,
      DragSwimlanes,
      DateType,
      ProcessBar,
      Tags,
      Resources,
      SwimlanesControl,
      SwimlanesField,
    } = this.settings;
    this.kanbanSetting.BreakDateBy = '1';
    this.kanbanSetting.ColumnField = 'Status';
    this.kanbanSetting.CustomRange = [
      '<=2 ngày',
      '<=5 ngày',
      '<=7 ngày',
      'Trước đó',
    ];
    this.kanbanSetting.ColumnMenu = JSON.parse(ColumnMenu);
    this.kanbanSetting.ColumnToolbars = JSON.parse(ColumnToolbars);
    this.kanbanSetting.IsChangeColumn = true;
    this.kanbanSetting.CountObjects = JSON.parse(CountObjects);
    this.kanbanSetting.DragColumn = JSON.parse(DragColumn);
    this.kanbanSetting.DragSwimlanes = JSON.parse(DragSwimlanes);
    this.kanbanSetting.DateType = DateType;
    this.kanbanSetting.ProcessBar = JSON.parse(ProcessBar);
    this.kanbanSetting.Tags = JSON.parse(Tags);
    this.kanbanSetting.Resources = JSON.parse(Resources);
    this.kanbanSetting.SwimlanesControl = JSON.parse(SwimlanesControl);
    this.kanbanSetting.IsChangeSwimlanes = true;
    this.kanbanSetting.SwimlanesField = SwimlanesField;
    this.kanbanSetting.FormName = 'Tasks';
    this.kanbanSetting.GrvName = 'grvTasks';
    this.tmSv.loadColumnsKanban(this.kanbanSetting).subscribe((res) => {
      if (res) {
        this.kanban.columns = res.column;
        this.cr.detectChanges();
      }
    });
  }

  private getDayOfWeek(date: Date) {
    return date.getDay();
  }

  private getWeekOfMonth(date: Date) {
    return Math.ceil((date.getDate() - 1 - date.getDay()) / 7) + 1;
  }

  private getWeek(date: Date) {
    const janFirst = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(
      ((date.getTime() - janFirst.getTime()) / 86400000 +
        janFirst.getDay() +
        1) /
      7
    );
  }

  private isSameWeek(dateA: Date, dateB: Date) {
    return this.getWeek(dateA) === this.getWeek(dateB);
  }

  private isSameMonth(dateA: Date, dateB: Date) {
    return dateA.getMonth() === dateB.getMonth();
  }
}
