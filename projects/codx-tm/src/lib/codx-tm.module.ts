import { LayoutNoAsideToolbarFluidComponent } from './../../../codx-share/src/lib/_layout/_noAsideToolbarFluid/_noAsideToolbarFluid.component';
import { AddEditComponent } from './setting/rangeskanban/addEdit/addEdit.component';
import { TasksComponent } from './tasks/tasks.component';
import { PopupAddDayoffsComponent } from './setting/calendar/popup-add-dayoffs/popup-add-dayoffs.component';
import { PopupEditCalendarComponent } from './setting/calendar/popup-edit-calendar/popup-edit-calendar.component';
import { PopupAddEventComponent } from './setting/calendar/popup-add-event/popup-add-event.component';
import { PopupAddCalendarComponent } from './setting/calendar/popup-add-calendar/popup-add-calendar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TaskGroupComponent } from './setting/taskgroups/task-group.component';
import { SettingComponent } from './setting/setting.component';
import { CodxShareModule } from './../../../codx-share/src/lib/codx-share.module';
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
  AccumulationTooltipService,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { SprintsComponent } from './sprints/sprints.component';
import { PopupAddSprintsComponent } from './sprints/popup-add-sprints/popup-add-sprints.component';
import { PopAddTaskgroupComponent } from './setting/taskgroups/pop-add-taskgroup/pop-add-taskgroup.component';
import { RangesKanbanComponent } from './setting/rangeskanban/ranges-kanban.component';
import { HomeSettingComponent } from './setting/homesetting/home-setting.component';
import { ProjectComponent } from './setting/project/project.component';
import { PopAddProjectComponent } from './setting/project/pop-add-project/pop-add-project.component';
import { ProjectgroupsComponent } from './setting/projectgroups/projectgroups.component';
import { PopAddProjectgroupComponent } from './setting/projectgroups/pop-add-projectgroup/pop-add-projectgroup.component';
import { ReportsComponent } from './reports/reports.component';
import { TaskDailyComponent } from './reports/task-daily/task-daily.component';
import { TaskByProjectsComponent } from './reports/task-by-projects/task-by-projects.component';
import { ProjectChartComponent } from './reports/task-by-projects/project-chart/project-chart.component';
import { CalendarComponent } from './setting/calendar/calendar.component';
import { FormsModule } from '@angular/forms';
import { MyDashboardComponent } from './dashboard/mydashboard/mydashboard.component';
import { TeamDashboardComponent } from './dashboard/teamdashboard/teamdashboard.component';
import { PopupShareSprintsComponent } from './sprints/popup-share-sprints/popup-share-sprints.component';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { TMMeetingsComponent } from './tmmeetings/tmmeetings.component';
import { PopupAddMeetingComponent } from './tmmeetings/popup-add-meeting/popup-add-meeting.component';
import { DeptDashboardComponent } from './dashboard/deptdashboard/deptdashboard.component';
import { CompDashboardComponent } from './dashboard/compdashboard/compdashboard.component';
import { ViewListMeetComponent } from './tmmeetings/view-list-meet/view-list-meet.component';
import { MeetingDetailComponent } from './tmmeetings/meeting-detail/meeting-detail.component';
import { TaskExtendsComponent } from './taskextends/taskextends.component';
import { TemplateComponent } from './tmmeetings/template/template.component';
import { SplitterModule } from '@syncfusion/ej2-angular-layouts';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { SprintDetailsComponent } from './sprints/sprintdetails/sprintdetails.component';
import { DashboardComponent } from './sprints/sprintdetails/dashboard/dashboard.component';
import { ViewWorkComponent } from './tmmeetings/view-work/view-work.component';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { PopupStatusMeetingComponent } from './tmmeetings/popup-status-meeting/popup-status-meeting.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // {
      //   path: 'tasks/:funcID',
      //   component: CodxTasksComponent,
      // },
      {
        path: 'tasks/:funcID',
        component: TasksComponent,
      },

      {
        path: 'taskextends/:funcID',
        component: TaskExtendsComponent,
      },
      {
        path: 'viewboards/:funcID',
        component: SprintsComponent,
      },
      {
        path: 'meeting/:funcID',
        component: TMMeetingsComponent,
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
        path: 'deptdashboard/:funcID',
        component: DeptDashboardComponent,
      },
      {
        path: 'compdashboard/:funcID',
        component: CompDashboardComponent,
      },

      // {
      //   path: 'reports',
      //   component: ReportsComponent,
      //   children: [
      //     {
      //       path: ':funcID',
      //       component: HomeReportComponent,
      //     },
      //     {
      //       path: 'taskdaily/:funcID',
      //       component: TaskDailyComponent,
      //     },
      //     {
      //       path: 'taskbyprojects/:funcID',
      //       component: TaskByProjectsComponent,
      //     },
      //   ],
      // },
      {
        path: 'taskdaily/:funcID',
        component: TaskDailyComponent,
      },
      {
        path: 'taskbyprojects/:funcID',
        component: TaskByProjectsComponent,
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
  {
    path: '',
    component: LayoutNoAsideToolbarFluidComponent,
    children: [   
      {
        path: 'meetingdetails/:funcID',
        component: MeetingDetailComponent,
      },
    ],
  },
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
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
            path: 'tmprojects/:funcID',
            component: ProjectComponent,
          },
          {
            path: 'projectgroups/:funcID',
            component: ProjectgroupsComponent,
          },
          {
            path: 'settingcalendar/:funcID',
            component: CalendarComponent,
          },
        ],
      },
      {
        path: 'sprintdetails/:funcID',
        component: SprintDetailsComponent,
      },
    ],
  },
];

const T_Component: Type<any>[] = [
  LayoutComponent,
  SprintsComponent,
  PopupAddSprintsComponent,
  HomeSettingComponent,
  SettingComponent,
  TaskGroupComponent,
  PopAddTaskgroupComponent,
  RangesKanbanComponent,
  AddEditComponent,
  ProjectComponent,
  PopAddProjectComponent,
  ProjectgroupsComponent,
  PopAddProjectgroupComponent,
  ReportsComponent,
  TaskDailyComponent,
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
  DeptDashboardComponent,
  CompDashboardComponent,
  TMMeetingsComponent,
  PopupAddMeetingComponent,
  ViewListMeetComponent,
  MeetingDetailComponent,
  TaskExtendsComponent,
  TemplateComponent,
  SprintDetailsComponent,
  ViewWorkComponent,
  DashboardComponent,
  PopupStatusMeetingComponent,
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
    DatePickerModule,
    TabModule,
    FormsModule,
    NgbModule,
    SplitterModule,
    CodxReportModule,
  ],
  exports: [RouterModule],
  declarations: T_Component,
  providers: [AccumulationTooltipService],
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
