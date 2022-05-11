import { map } from 'rxjs';
import { TmService } from './../tm.service';
import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CardSettingsModel,
  DialogSettingsModel,
  SwimlaneSettingsModel,
} from '@syncfusion/ej2-angular-kanban';
import { CoDxKanbanComponent, AuthStore, CacheService } from 'codx-core';
import { DataRequest } from '@shared/models/data.request';
import { KanbanSetting } from '../models/settings.model';
import { ViewBaseComponent } from 'codx-core/lib/layout/views/view-base/view-base.component';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss'],
})
export class TestKanbanComponent implements OnInit {
  @Input('viewBase') viewBase: ViewBaseComponent;
  dataSource: any = [];
  data: any;
  setCalendar = true;
  mode: string;
  view: string;
  isAdd = false;
  fromDate: Date = new Date(2022, 4, 1);
  toDate: Date = new Date(2022, 5, 31);
  configParam = null;
  gridView: any;
  grvSetup: any;
  user: any;
  item: any = {};
  showSumary = false;
  Sumary: string = '';
  columns: any = [];
  settings: any;
  kanbanSetting = new KanbanSetting();

  @ViewChild('kanban') kanban!: CoDxKanbanComponent;
  @ViewChild('popupAdd') modalContent: any;
  constructor(
    private modalService: NgbModal,
    private tmSv: TmService,
    private authStore: AuthStore,
    private cache: CacheService,
    private cr: ChangeDetectorRef
  ) {
    this.user = this.authStore.get();
  }
  public swimlaneSettings: SwimlaneSettingsModel = {
    keyField: 'userName',
    showEmptyRow: false,
  };

  ngOnInit() {
    this.cache.viewSettings('TM001').subscribe((res) => {
      if (res) {
        this.settings = JSON.parse(res[0].settings);
        this.getColumnKanban();
      }
    });
    if (this.tmSv.myTaskComponent) {
      this.tmSv.myTaskComponent = false;
    }
    this.getData();
  }

  ngAfterViewInit() {}

  public cardSettings: CardSettingsModel = {
    headerField: 'taskID',
    template: '#cardTemplate',
    selectionType: 'Multiple',
  };

  public dialogSettings: DialogSettingsModel = {
    fields: [
      { text: 'ID', key: 'Description', type: 'TextBox' },
      { key: 'Status', type: 'DropDown' },
      { key: 'Assignee', type: 'DropDown' },
      { key: 'RankId', type: 'TextBox' },
      { key: 'Summary', type: 'TextArea' },
    ],
  };

  public contextMenuSetting = {
    enable: true,
    menuItem: [],
  };

  clickme() {
    console.log('aloooo');
  }

  public getString(assignee: any) {
    return assignee
      .match(/\b(\w)/g)
      .join('')
      .toUpperCase();
  }

  openPopup(evt: any, action: string = 'add') {
    this.modalService
      .open(this.modalContent, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (res) => {
          if (res) {
            if (action == 'add')
              this.kanban.addCard({
                Id: 'Task 100',
                Description: 'Task - BigData',
                Status: '1',
                Summary: 'Big data is so cool',
                Priority: 'High',
                Tags: 'Bug, Release Bug',
                RankId: 1,
                Assignee: 'Nancy Davloio',
              });
          }
        },
        (reason) => {
          if (reason) {
          }
        }
      );
  }

  onDataDrag(evt: any) {
    this.item = evt;
  }

  submit(e: any, modal: any) {
    const completed = new Date(2022, 5, 9, 12, 0, 0);
    const { id, status, comment } = this.item;
    this.tmSv
      .setStatusTask(id, status, completed, '8', comment)
      .subscribe((res) => {
        console.log(res);
      });
    modal.close(true);
  }

  getData() {
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
        if (this.kanbanSetting.BreakDateBy == '1') {
          const today = new Date();
          res[0].map((data) => {
            if (this.isSameWeek(today, new Date(data.dueDate))) {
              data.dayOfWeek = this.getDayOfWeek(
                new Date(data.dueDate)
              ).toString();
            }
          });
        }
        if (this.kanbanSetting.BreakDateBy == '3') {
          const today = new Date();
          res[0].map((data) => {
            if (
              this.isSameMonth(
                today,
                new Date(data.dueDate)
              )
            ) {
              data.weekOfMonth = this.getWeekOfMonth(
                new Date(data.dueDate)
              ).toString();
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
      //ColumnField,
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
    this.kanbanSetting.BreakDateBy = '3';
    this.kanbanSetting.ColumnField = 'DueDate';
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
        this.columns = res.column;
        // this.kanban.columns = res.column
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
