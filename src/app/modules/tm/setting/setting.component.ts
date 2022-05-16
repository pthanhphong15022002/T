import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { VIEW_ACTIVE } from '@shared/constant/enum';
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
  functionList: any;
  fromDate: any;
  toDate: any;
  configParam = null;
  gridView: any;
  grvSetup: any;
  user: any;
  combobox: any;

  readonly VIEW_ACTIVE = VIEW_ACTIVE;
  //Setting kanban
  kanbanSetting = new KanbanSetting();
  //Calendar setting
  calendarSetting: any;

  @ViewChild("calendar") calendar;
  @ViewChild("kanban") kanban;
  @ViewChild("dateCtl") dateCtl;
  @ViewChild("panel") panel;

  constructor(
    injector: Injector,
    private tmSv: TmService,
    private cache: CacheService,
    private df: ChangeDetectorRef,
    private authStore: AuthStore
  ) {
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    if (this.tmSv.myTaskComponent) {
      this.tmSv.myTaskComponent = false;
    }
    this.cache.functionList("TM001").subscribe((res)=>{
      const {formName, gridViewName} = res;
      console.log("FormName", formName)
      console.log("GridViewName", gridViewName)
    this.cache.gridViewSetup(formName, gridViewName).subscribe((res)=>{
      console.log("GridViewSetup", res);
    })
    })
  }
  ngAfterViewInit() {
    // this.cache.functionList(this.modelPage.functionID).subscribe((res) => {
    //   if (res) {
    //     this.functionList = res;
    //   }
    // });
    this.cache.gridView("grvTasks").subscribe((res) => {
      if (res) {
        this.gridView = res;
      }
    });
    this.cache.gridViewSetup("Tasks", "grvTasks").subscribe((res) => {
      if (res) this.grvSetup = res;
    });
  }

  changeView(view) {
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
    debugger;
    if (this.kanbanSetting?.ColumnField) {
      this.view = view;
      return;
    }

    this.cache.viewSettings("TM001").subscribe((res) => {
      if (res) {
        let data = res.find((e) => e.view == view);
        if (data) {
          this.kanbanSetting = JSON.parse(data.settings);
          this.view = view;
        }
      }
    });
  }

  
  //#region Settings
  onKanbanCbxChange(data) {
    if (
      data.field == "column" &&
      data.data &&
      data.data.FieldName &&
      this.kanbanSetting?.ColumnField != data.data.FieldName
    ) {
      this.kanbanSetting.ColumnField = data.data.FieldName;
      this.kanbanSetting.DateType = data.data.DataType;
      this.kanbanSetting.ShowDateBy =
        data.data.DataType == "DateTime" ? true : false;
      this.kanbanSetting.AllowDrag = data.data.AllowDrag;
      this.kanbanSetting.IsChangeColumn = true;
      this.kanbanSetting.TaskDrap =
        this.grvSetup[data.data.FieldName].allowDrag;
    }

    if (data.field == "customRange")
      this.kanbanSetting.CustomRange = data.data.RangeID;

    if (
      data.field == "swimlanes" &&
      data.data &&
      data.data.FieldName &&
      this.kanbanSetting.ColumnField != data.data.FieldName
    ) {
      this.kanbanSetting.SwimlanesField = data.data.FieldName;
      this.kanbanSetting.IsChangeSwimlanes = true;
    }
  }

  onKanbanValueChange({ data }, field) {
    if (field == "breakDateBy") {
      this.kanbanSetting.BreakDateBy = data.value;
      this.kanbanSetting.ShowCustomRange = data.value === "9" ? true : false;
    }

    let ss = ["progressBar", "tags", "countObjects", "resourceAvatar"];
    if (ss.includes(field)) this.kanbanSetting[field] = data.value;
  }

  applySetting() {
    if (!this.kanbanSetting.GrvName || !this.kanbanSetting.FormName) {
      // this.kanbanSetting.GrvName = this.modelPage.gridViewName;
      // this.kanbanSetting.FormName = this.modelPage.formName;
    }
    this.kanban.loadSetting(this.kanbanSetting);
    this.closeSetting();
  }

  openSetting(): void {
    this.panel.nativeElement.classList.add("offcanvas-on");
    //$('#canvas_Setting').addClass('offcanvas-on');
  }

  closeSetting(): void {
    this.panel.nativeElement.classList.remove("offcanvas-on");
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
  tabChange(a:string){}

  ngOnDestroy() {
    this.tmSv.myTaskComponent = true;
    this.tmSv.changeData.next(null);
    this.tmSv.showPanel.next(null);
  }
}
