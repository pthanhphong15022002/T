import { ProjectGroupComponent } from './settings/project-group/project-group.component';

import { HomeSettingComponent } from './settings/home-setting/home-setting.component';
import { AssignTaskDetailsComponent } from './assign-tasks/assign-tasks-details/assign-tasks-details.component';

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  AccumulationChartAllModule,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { AuthGuard, CodxCoreModule } from 'codx-core';

import { environment } from 'src/environments/environment';
import { OwnerTaskComponent } from './ownertasks/owner-task.component';
import { LayoutComponent } from './_layout/layout.component';
import { OnwerTaskDetailsComponent } from './ownertasks/owner-task-details/owner-task-details.component';
import { OwnerListTasksComponent } from './ownertasks/owner-list-tasks/owner-list-tasks.component';
import { SharedModule } from '@shared/shared.module';
import { MoreFuntionComponent } from './more-funtion/more-funtion.component';
import { OwnerTaskCalendarComponent } from './ownertasks/onwer-task-calendar/onwer-task-calendar.component';
import { KanbanComponent } from './ownertasks/onwer-task-kanban/onwer-task-kanban.component';
import { TreeviewComponent } from './treeview/treeview.component';
import { RangesKanbanComponent } from './settings/ranges-kanban/ranges-kanban.component';
import { DashboardComponent } from './tmdashboard/dashboard/dashboard.component';
import { ControlsModule } from './controls/controls.module';
import { SettingCalendarComponent } from './settings/setting-calendar/setting-calendar.component';
import { AssignTaskComponent } from './assign-tasks/assign-tasks.component';
import { TaskGroupComponent } from './settings/task-group/task-group.component';
import { SettingsComponent } from './settings/settings.component';
import { CbxpopupComponent } from './controls/cbxpopup/cbxpopup.component';
import { UpdateStatusPopupComponent } from './controls/update-status-popup/update-status-popup.component';
import { SettingPanelComponent } from './controls/setting-panel/setting-panel.component';
import { SprintsComponent } from './sprints/sprints.component';
import { SprintsInfoComponent } from './sprints/sprints-info/sprints-info.component';
import { ListSprintsComponent } from './sprints/list-sprints/list-sprints.component';
import { ProjectComponent } from './settings/project/project.component';
import { PopupShareSprintsComponent } from './sprints/popup-share-sprints/popup-share-sprints.component';
import { AssignTasksCalendarComponent } from './assign-tasks/assign-tasks-calendar/assign-tasks-calendar.component';
import { AssignListTasksComponent } from './assign-tasks/assign-list-tasks/assign-list-tasks.component';
import { StatisticalComponent } from './statistical/statistical.component';
import { HomeStatisticalComponent } from './statistical/home-statistical/home-statistical.component';
import { StatisticalProjectComponent } from './statistical/statistical-project/statistical-project.component';
import { StatisticalViewlistComponent } from './statistical/statistical-task/viewlist/statistical-viewlist.component';
import { StatisticalChartComponent } from './statistical/statistical-task/chart/statistical-chart.component';
import { ViewDetailsSprintsComponent } from './sprints/view-details-sprints/view-details-sprints.component';
import { SprintsTasksComponent } from './sprints/sprints-tasks/sprints-tasks.component';
import { SprintsTaskDetailsComponent } from './sprints/sprints-tasks/sprints-task-details/sprints-task-details.component';



const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home/:funcID',
        component: DashboardComponent,
      },
      {
        path: 'mytasks/:funcID',
        component: OwnerTaskComponent,
      },
      {
        path: 'assigntasks/:funcID',
        component: AssignTaskComponent,
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
          }]
      },   
      {
        path: 'setting',
        component: SettingsComponent,
        children: [
          {
            path: '',
            component: HomeSettingComponent,
          },
          {
            path: 'settingcalendar/:funcID',
            component: SettingCalendarComponent,
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
            path: 'projectgroup/:funcID',
            component: ProjectGroupComponent,
          },
        ],
      },
      {
        path: 'statistical',
        component: StatisticalComponent,
        children: [
          {
            path: '',
            component: HomeStatisticalComponent,
          },
          {
            path: 'statisticalviewlist/:funcID',
            component: StatisticalViewlistComponent
          },
          {
            path: 'statisticalproject/:funcID',
            component: StatisticalProjectComponent
          },    
          {
            path: 'statisticalchart/:funcID',
            component: StatisticalChartComponent
          },        
        ]
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

@NgModule({
  declarations: [
    OwnerTaskComponent,
    KanbanComponent,
    OnwerTaskDetailsComponent,
    OwnerListTasksComponent,
    MoreFuntionComponent,
    OwnerTaskCalendarComponent,
    DashboardComponent,
    TreeviewComponent,
    SettingCalendarComponent,
    RangesKanbanComponent,
    LayoutComponent,
    AssignTaskComponent,
    AssignTaskDetailsComponent,
    AssignTasksCalendarComponent,
    AssignListTasksComponent,
    HomeSettingComponent,
    TaskGroupComponent,
    RangesKanbanComponent,
    SettingsComponent,
    CbxpopupComponent,
    UpdateStatusPopupComponent,
    SettingPanelComponent,
    SprintsComponent,
    SprintsInfoComponent,
    ListSprintsComponent,
    ProjectComponent,
    TaskGroupComponent,
    ProjectGroupComponent,
    PopupShareSprintsComponent,
    StatisticalComponent,
    HomeStatisticalComponent,
    StatisticalProjectComponent,
    StatisticalViewlistComponent,
    StatisticalChartComponent,
    ViewDetailsSprintsComponent,  
    SprintsTasksComponent,
    SprintsTaskDetailsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    FormsModule,
    CodxCoreModule.forRoot({ environment }),
    CommonModule,
    SharedModule,
    ChartAllModule,
    AccumulationChartAllModule,
    ProgressBarModule,
    DatePickerModule,
    TabModule,
    ControlsModule,
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TMModule {}
