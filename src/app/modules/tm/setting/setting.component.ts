import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import { VIEW_ACTIVE } from '@shared/constant/enum';
import { ok } from 'assert';
import { AuthStore, CacheService, DataRequest } from 'codx-core';
import { KanbanSetting } from '../models/settings.model';
import { TmService } from '../tm.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit {
  const_modes = { d: 'day', w: 'week', m: 'month', y: 'year' };

  data: any;
  setCalendar = true;
  mode: string;
  view: string;
  isAdd = false;
  functionList: any = null;
  fromDate: any;
  toDate: any;
  configParam = null;
  gridView: any;
  grvSetup: any;
  user: any;
  checked: boolean = true;
  settings: any;
  columnField: any;
  readonly VIEW_ACTIVE = VIEW_ACTIVE;
  //Setting kanban
  kanbanSetting: KanbanSetting = new KanbanSetting();
  //Calendar setting
  calendarSetting: any;

  @ViewChild('calendar') calendar;
  @ViewChild('kanban') kanban;
  @ViewChild('dateCtl') dateCtl;
  @ViewChild('panel') panel;

  constructor(
    private tmSv: TmService,
    private cache: CacheService,
    private df: ChangeDetectorRef,
    private authStore: AuthStore
  ) {
    this.user = this.authStore.get();
    this.cache.functionList('TM001').subscribe((res) => {
      if (res) {
        this.functionList = res;
        this.df.detectChanges();
      }
    });
  }

  ngOnInit(): void {
    if (this.tmSv.myTaskComponent) {
      this.tmSv.myTaskComponent = false;
    }
    this.cache.gridViewSetup('Tasks', 'grvTasks').subscribe((res) => {
      if (res) {
        let oValues = Object.values(res);
        var kbColumns = oValues.filter(
          (x: any) => x.kbColumn == true
        ) as Array<object>;
        this.columnField = this.tmSv.convertListToObject(
          kbColumns,
          'fieldName',
          'referedValue'
        );
      }
    });
  }
  ngAfterViewInit() {
    this.cache.gridView('grvTasks').subscribe((res) => {
      if (res) {
        this.gridView = res;
      }
    });
    // this.cache.gridViewSetup('Tasks', 'grvTasks').subscribe((res) => {
    //   if (res) this.grvSetup = res;
    // });
    this.getSettingView(VIEW_ACTIVE.Kanban);
  }

  changeView(view) {
    debugger;
    switch (view) {
      // case VIEW_ACTIVE.Calendar:
      //   this.getCalendarSetting(view);
      //   break;
      case VIEW_ACTIVE.Kanban:
        this.getSettingView(view);
        break;
      case VIEW_ACTIVE.List:
        break;
      case VIEW_ACTIVE.ListDetails:
        break;
    }
    this.df.detectChanges();
  }

  getSettingView(view) {
    if (this.kanbanSetting?.ColumnField) {
      this.view = view;
      return;
    }

    this.cache.viewSettings('TM001').subscribe((res) => {
      if (res) {
        let data = JSON.parse(res.find((e) => e.view == view).settings);
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
        } = data;
        if (data) {
          this.kanbanSetting.BreakDateBy = '1';
          this.kanbanSetting.ColumnField = 'Status';
          this.kanbanSetting.CustomRange = [
            '<=2 ngày',
            '<=5 ngày',
            '<=7 ngày',
            'Trước đó',
          ];
          this.kanbanSetting.ColumnField = ColumnField;
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
          this.view = view;
        }
      }
    });
  }

  //#region Settings
  onKanbanCbxChange(data) {
    if (
      data.field == 'column' &&
      data.data &&
      data.data.FieldName &&
      this.kanbanSetting?.ColumnField != data.data.FieldName
    ) {
      this.kanbanSetting.ColumnField = data.data.FieldName;
      this.kanbanSetting.DateType = data.data.DataType;
      this.kanbanSetting.ShowDateBy =
        data.data.DataType == 'DateTime' ? true : false;
      this.kanbanSetting.AllowDrag = data.data.AllowDrag;
      this.kanbanSetting.IsChangeColumn = true;
      this.kanbanSetting.TaskDrap =
        this.grvSetup[data.data.FieldName].allowDrag;
    }

    if (data.field == 'customRange')
      this.kanbanSetting.CustomRange = data.data.RangeID;

    if (
      data.field == 'swimlanes' &&
      data.data &&
      data.data.FieldName &&
      this.kanbanSetting.ColumnField != data.data.FieldName
    ) {
      this.kanbanSetting.SwimlanesField = data.data.FieldName;
      this.kanbanSetting.IsChangeSwimlanes = true;
    }
  }

  onKanbanValueChange({ data }, field) {
    if (field == 'breakDateBy') {
      this.kanbanSetting.BreakDateBy = data;
      //this.kanbanSetting.ShowCustomRange = data.value === '9' ? true : false;
      this.kanbanSetting.ShowCustomRange = true;
      this.df.detectChanges();
    }

    let ss = ['ProcessBar', 'Tags', 'CountObjects', 'Resources'];
    if (ss.includes(field)) {
      this.kanbanSetting[field] = data;
      this.df.detectChanges();
    }
  }

  applySetting() {
    // if (!this.kanbanSetting.GrvName || !this.kanbanSetting.FormName) {
    //   // this.kanbanSetting.GrvName = this.modelPage.gridViewName;
    //   // this.kanbanSetting.FormName = this.modelPage.formName;
    // }
    //this.kanban.loadSetting(this.kanbanSetting);
    // this.closeSetting();
    console.log(this.kanbanSetting);
  }

  openSetting(): void {
    this.panel.nativeElement.classList.add('offcanvas-on');
    //$('#canvas_Setting').addClass('offcanvas-on');
  }

  closeSetting(): void {
    this.panel.nativeElement.classList.remove('offcanvas-on');
  }

  trackByFn(index: number, item): string {
    return item.taskID;
  }

  // onChangeStatusTask(data) {
  //   if (data.actionType == ActionTypeOnTask.ChangeStatus) {
  //     this.tmSv.onChangeStatusTask(data.data.taskID, data.value);
  //   }
  // }

  // action(para: any) {
  //   console.log("change action my task:" + this.tmSv.myTaskComponent);
  //   if (this.tmSv?.myTaskComponent == false) {
  //     switch (para.type) {
  //       case ActionType.refreshData:
  //         this.getData();
  //         break;
  //       case ActionType.add:
  //         this.tmSv.showPanel.next(new InfoOpenForm("", "TM001", this.view));
  //         break;
  //       case ActionType.changeModeView:
  //         if (this.view != para.arg) this.getSettingView(para.arg);
  //         break;
  //       case ActionType.setup:
  //         this.openSetting();
  //         break;
  //       case ActionType.changeTime:
  //         this.changeTime(para.arg);
  //     }
  //   }
  // }
  tabChange(a: string) {}

  ngOnDestroy() {
    this.tmSv.myTaskComponent = true;
    this.tmSv.changeData.next(null);
    this.tmSv.showPanel.next(null);
  }
}
