
import { MwpComponent } from './mwp/mwp.component';
import { TasksComponent } from './tasks/tasks.component';
import { PopupAddDayoffsComponent } from './setting/calendar/popup-add-dayoffs/popup-add-dayoffs.component';
import { PopupEditCalendarComponent } from './setting/calendar/popup-edit-calendar/popup-edit-calendar.component';
import { PopupAddEventComponent } from './setting/calendar/popup-add-event/popup-add-event.component';
import { PopupAddCalendarComponent } from './setting/calendar/popup-add-calendar/popup-add-calendar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TaskGroupComponent } from './setting/taskgroups/task-group.component';
import { SettingComponent } from './setting/setting.component';
import { CodxShareModule } from './../../../codx-share/src/lib/codx-share.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewDetailComponent } from './tasks/view-detail/view-detail.component';
import { PopupAddComponent } from './tasks/popup-add/popup-add.component';
import { LayoutComponent } from './_layout/layout.component';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule,
  Type,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { InlineSVGModule } from 'ng-inline-svg';
import {
  AccumulationChartAllModule,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { TreeMapModule } from '@syncfusion/ej2-angular-treemap';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { SprintsComponent } from './sprints/sprints.component';
import { PopupAddSprintsComponent } from './sprints/popup-add-sprints/popup-add-sprints.component';
import { SprintsTasksComponent } from './sprints/sprints-tasks/sprints-tasks.component';
import { ViewDetailsTaskComponent } from './sprints/sprints-tasks/view-details-task/view-details-task.component';
import { UpdateStatusPopupComponent } from './tasks/update-status-popup/update-status-popup.component';
import { PopAddTaskgroupComponent } from './setting/taskgroups/pop-add-taskgroup/pop-add-taskgroup.component';
import { RangesKanbanComponent } from './setting/rangeskanban/ranges-kanban.component';
import { HomeSettingComponent } from './setting/homesetting/home-setting.component';
import { PopAddRangesComponent } from './setting/rangeskanban/ranges-add/ranges-add.component';
import { ProjectComponent } from './setting/project/project.component';
import { PopAddProjectComponent } from './setting/project/pop-add-project/pop-add-project.component';
import { ProjectgroupsComponent } from './setting/projectgroups/projectgroups.component';
import { PopAddProjectgroupComponent } from './setting/projectgroups/pop-add-projectgroup/pop-add-projectgroup.component';
import { ReportsComponent } from './reports/reports.component';
import { TaskDailyComponent } from './reports/task-daily/task-daily.component';
import { HomeReportComponent } from './reports/home-report/home-report.component';
import { TaskByProjectsComponent } from './reports/task-by-projects/task-by-projects.component';
import { ProjectChartComponent } from './reports/task-by-projects/project-chart/project-chart.component';
import { CalendarComponent } from './setting/calendar/calendar.component';
import { FormsModule } from '@angular/forms';
import { MyDashboardComponent } from './reports/mydashboard/mydashboard.component';
import { TeamDashboardComponent } from './reports/teamdashboard/teamdashboard.component';
import { PopupShareSprintsComponent } from './sprints/popup-share-sprints/popup-share-sprints.component';
import { MwpViewDetailComponent } from './mwp/mwp-view-detail/mwp-view-detail.component';
import { MwpPopupAddComponent } from './mwp/mwp-popup-add/mwp-popup-add.component';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: ':funcID',
        component: DashboardComponent
      },
      {
        path: 'mwp/:funcID',
        component: MwpComponent,
      },
      {
        path: 'assigntasks/:funcID',
        component: TasksComponent,
      },
      {
        path: 'viewboards/:funcID',
        component: SprintsComponent,
      },
      {
        path: 'sprinttasks/:funcID',
        component: SprintsTasksComponent,
        children: [
          {
            path: ':id',
            component: SprintsTasksComponent,
          },
        ],
      },
      {
        path: 'setting',
        component: SettingComponent,
        children: [
          {
            path: ':funcID',
            component: HomeSettingComponent,
          },
          {
            path: 'taskgroups/:funcID',
            component: TaskGroupComponent,
          },
          {
            path: 'rangeskanban/:funcID',
            component: RangesKanbanComponent,
          },
          {
            path: 'project/:funcID',
            component: ProjectComponent,
          },
          {
            path: 'projectgroups/:funcID',
            component: ProjectgroupsComponent,
          },
          {
            path: 'calendar/:funcID',
            component: CalendarComponent,
          },
        ],
      },
      {
        path: 'reports',
        component: ReportsComponent,
        children: [
          {
            path: ':funcID',
            component: HomeReportComponent,
          },
          {
            path: 'mydashboard/:funcID',
            component: MyDashboardComponent,
          },
          {
            path: 'teamdashboard/:funcID',
            component: TeamDashboardComponent,
          },
          {
            path: 'taskdaily/:funcID',
            component: TaskDailyComponent,
          },
          {
            path: 'taskbyprojects/:funcID',
            component: TaskByProjectsComponent,
          },
        ],
      },
      {
        path: '',
        redirectTo: 'null',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
  {
    path: 'setting',

  }
];

const T_Component: Type<any>[] = [
  LayoutComponent,
  PopupAddComponent,
  ViewDetailComponent,
  DashboardComponent,
  SprintsComponent,
  PopupAddSprintsComponent,
  SprintsTasksComponent,
  ViewDetailsTaskComponent,
  UpdateStatusPopupComponent,
  HomeSettingComponent,
  SettingComponent,
  TaskGroupComponent,
  PopAddTaskgroupComponent,
  RangesKanbanComponent,
  PopAddRangesComponent,
  ProjectComponent,
  PopAddProjectComponent,
  ProjectgroupsComponent,
  PopAddProjectgroupComponent,
  ReportsComponent,
  TaskDailyComponent,
  HomeReportComponent,
  TaskByProjectsComponent,
  ProjectChartComponent,
  CalendarComponent,
  PopupAddCalendarComponent,
  PopupAddEventComponent,
  PopupEditCalendarComponent,
  PopupAddDayoffsComponent,
  PopupShareSprintsComponent,
  TasksComponent,
  MyDashboardComponent,
  TeamDashboardComponent,
  MwpComponent,
  MwpViewDetailComponent,
  MwpPopupAddComponent,
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    HttpClientModule,
    CodxCoreModule,
    RouterModule.forChild(routes),
    CodxShareModule,
    ChartAllModule,
    AccumulationChartAllModule,
    ProgressBarModule,
    CircularGaugeModule,
    TreeMapModule,
    DatePickerModule,
    TabModule,
    FormsModule,
    NgbModule,
  ],
  exports: [RouterModule],
  declarations: T_Component,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TMModule {
  public static forRoot(
    config?: EnvironmentConfig
  ): ModuleWithProviders<CodxCoreModule> {
    return {
      ngModule: CodxCoreModule,
      providers: [
        HttpClientModule,
        { provide: EnvironmentConfig, useValue: config },
      ],
    };
  }
}
