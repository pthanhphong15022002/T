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
import {
  AccumulationChartAllModule,
  AccumulationChartModule,
  AccumulationDataLabelService,
  AccumulationTooltipService,
  ChartAllModule,
  LegendService,
  TooltipService,
} from '@syncfusion/ej2-angular-charts';
import {
  ProgressAnnotationService,
  ProgressBarModule,
} from '@syncfusion/ej2-angular-progressbar';
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
import { PopupShareSprintsComponent } from './sprints/popup-share-sprints/popup-share-sprints.component';
import {
  AnnotationsService,
  CircularGaugeModule,
  GaugeTooltipService,
  LegendService as LegendCircularGaugeService,
} from '@syncfusion/ej2-angular-circulargauge';
import { TMMeetingsComponent } from './tmmeetings/tmmeetings.component';
import { TaskExtendsComponent } from './taskextends/taskextends.component';
import { SplitterModule } from '@syncfusion/ej2-angular-layouts';
import { LayoutNoAsideComponent } from 'projects/codx-common/src/lib/_layout/_noAside/_noAside.component';
import { SprintDetailsComponent } from './sprints/sprintdetails/sprintdetails.component';
import { DashboardComponent } from './sprints/sprintdetails/dashboard/dashboard.component';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { CoreModule } from '@core/core.module';
import { PopupTabsViewsDetailsComponent } from './popup-tabs-views-details/popup-tabs-views-details.component';

import {
  TreeMapModule,
  TreeMapTooltipService,
} from '@syncfusion/ej2-angular-treemap';
import { TMDashboardComponent } from './tmdashboard/tmdashboard.component';
import { LayoutNoToolbarComponent } from './tmdashboard/_noToolbar/_noToolbar.component';
import { MeetingDetailComponent } from 'projects/codx-share/src/lib/components/codx-tmmeetings/meeting-detail/meeting-detail.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { DynamicFormComponent } from 'projects/codx-share/src/lib/components/dynamic-form/dynamic-form.component';
import { SearchingComponent } from './searching/searching.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import { LayoutNoAsideToolbarFluidComponent } from 'projects/codx-common/src/lib/_layout/_noAsideToolbarFluid/_noAsideToolbarFluid.component';
import { LayoutComponent } from './_layout/layout.component';
import { DealsComponent } from 'projects/codx-cm/src/lib/deals/deals.component';
import { CasesComponent } from 'projects/codx-cm/src/lib/cases/cases.component';
import { LeadsComponent } from 'projects/codx-cm/src/lib/leads/leads.component';
import { ViewInstancesComponent } from 'projects/codx-dp/src/lib/view-instances/view-instances.component';
import { CodxDashboardViewsComponent } from 'projects/codx-share/src/lib/components/codx-dashboard/dashboard-view/dashboard-view.component';
import { InstancesComponent } from 'projects/codx-dp/src/lib/instances/instances.component';
import { ContractsComponent } from 'projects/codx-cm/src/lib/contracts/contracts.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'report/:funcID',
        component: CodxReportViewsComponent,
      },
      {
        path: 'report/detail/:funcID',
        component: CodxReportViewDetailComponent,
      },
      {
        path: 'dashboard/:funcID',
        component: TMDashboardComponent,
      },
      {
        path: 'dashboard-view/:funcID',
        component: CodxDashboardViewsComponent,
      },
      {
        path: 'share/dynamic/:funcID',
        component: DynamicFormComponent,
      },
      {
        path: 'searching/:funcID',
        component: SearchingComponent,
      },
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
      //----phát hành quy trình DP-CRM----//
      {
        path: 'deals/:funcID',
        component: DealsComponent,
        data: { noReuse: true },
      },
      {
        path: 'cases/:funcID',
        component: CasesComponent,
        data: { noReuse: true },
      },
      {
        path: 'leads/:funcID',
        component: LeadsComponent,
        data: { noReuse: true },
      },
      {
        path: 'contracts/:funcID',
        component: ContractsComponent,
        data: { noReuse: true },
      },
      {
        path: 'instances/:funcID/:processID',
        component: ViewInstancesComponent,
        data: { noReuse: true },
      },
      //-----------end--------------//
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
  TMDashboardComponent,
  TMMeetingsComponent,
  TaskExtendsComponent,
  SprintDetailsComponent,
  DashboardComponent,
  PopupTabsViewsDetailsComponent,
  LayoutNoToolbarComponent,
  SearchingComponent,
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    HttpClientModule,
    CodxCoreModule,
    CoreModule,
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
    SplitterModule,
    CodxReportModule,
    AccumulationChartModule,
  ],
  exports: [RouterModule],
  declarations: T_Component,
  providers: [
    AccumulationTooltipService,
    ProgressAnnotationService,
    AnnotationsService,
    TreeMapTooltipService,
    TooltipService,
    GaugeTooltipService,
    LegendService,
    LegendCircularGaugeService,
    AccumulationDataLabelService,
  ],
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
