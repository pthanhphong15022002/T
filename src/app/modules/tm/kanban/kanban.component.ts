import { TmService } from './../tm.service';
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CardSettingsModel,
  DialogSettingsModel,
  SwimlaneSettingsModel,
} from '@syncfusion/ej2-angular-kanban';
import { CoDxKanbanComponent, AuthStore, CacheService } from 'codx-core';
import { DataRequest } from '@shared/models/data.request';
import { DataSv } from '../models/task.model';
import { KanbanSetting } from '../models/settings.model';
import { ViewBaseComponent } from 'codx-core/lib/layout/views/view-base/view-base.component';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss'],
})
export class TestKanbanComponent implements OnInit {
  @Input('viewBase') viewBase: ViewBaseComponent;
  dataSource = cardData;
  //dataSource: any = [];
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
  item: any;
  showSumary = false;
  Sumary: string = '';
  columns: any = [];
  settings: any;

  @ViewChild('kanban') kanban!: CoDxKanbanComponent;
  @ViewChild('popupAdd') modalContent: any;
  constructor(
    private modalService: NgbModal,
    private tmSv: TmService,
    private authStore: AuthStore,
    private df: ChangeDetectorRef,
    private cache: CacheService
  ) {
    this.user = this.authStore.get();
  }
  public swimlaneSettings: SwimlaneSettingsModel = {
    keyField: 'Assignee',
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
    //this.getData();
  }

  ngAfterViewInit() { }

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
    console.log(evt);
    this.item = evt;
  }

  submit(e: any, modal: any) {
    let t = this;
    setTimeout(function () {
      t.item.Summary = 'halo con cá rô 1234';
      t.kanban.itemUpdate = t.item;
      modal.close(true);
    }, 1000);
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
        this.dataSource = res[1];
        this.kanban.dataSource = res[1];
        this.kanban.refresh();
        this.tmSv.setChangeData(new DataSv(res[0], this.view));
        console.log(this.dataSource);
      }
    });
  }

  getColumnKanban() {
    let kanbanSetting = new KanbanSetting();
    const {
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
    kanbanSetting.BreakDateBy = '1';
    kanbanSetting.ColumnField = 'Status';
    kanbanSetting.ColumnMenu = JSON.parse(ColumnMenu);
    kanbanSetting.ColumnToolbars = JSON.parse(ColumnToolbars);
    kanbanSetting.IsChangeColumn = true;
    kanbanSetting.CountObjects = JSON.parse(CountObjects);
    kanbanSetting.DragColumn = JSON.parse(DragColumn);
    kanbanSetting.DragSwimlanes = JSON.parse(DragSwimlanes);
    kanbanSetting.DateType = DateType;
    kanbanSetting.ProcessBar = JSON.parse(ProcessBar);
    kanbanSetting.Tags = JSON.parse(Tags);
    kanbanSetting.Resources = JSON.parse(Resources);
    kanbanSetting.SwimlanesControl = JSON.parse(SwimlanesControl);
    kanbanSetting.IsChangeSwimlanes = true;
    kanbanSetting.SwimlanesField = SwimlanesField;
    kanbanSetting.FormName = 'Tasks';
    kanbanSetting.GrvName = 'grvTasks';
    this.tmSv.loadColumnsKanban(kanbanSetting).subscribe((res) => {
      if (res) {

        this.columns = res.column;
        // this.kanban.columns = res.column
        this.df.detectChanges();
      }
    });
  }
}

export let cardData: Object[] = [
  {
    id: 'Task 1',
    userName: 'Task - 29001',
    status: '1',
    memo:
      'Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.',
    priority: 'High',
  },
  {
    id: 'Task 2',
    userName: 'Task - 29001',
    status: '2',
    memo:
      'Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.',
    priority: 'High',
  }, {
    id: 'Task 3',
    userName: 'Task - 29001',
    status: '3',
    memo:
      'Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.',
    priority: 'High',
  }, {
    id: 'Task 4',
    userName: 'Task - 29001',
    status: '4',
    memo:
      'Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.Analyze customer requirements.',
    priority: 'High',
  },
];
