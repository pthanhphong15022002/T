import { HomeSettingComponent } from './settings/home-setting/home-setting.component';
import { AssignTaskDetailsComponent } from './assign-tasks/assign-tasks-details/assign-tasks-details.component';

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccumulationChartAllModule, ChartAllModule } from '@syncfusion/ej2-angular-charts';
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
import { DashboardComponent } from './tmdashnoard/dashboard/dashboard.component';
import { ControlsModule } from './controls/controls.module';
import { SettingCalendarComponent } from './settings/setting-calendar/setting-calendar.component';
import { AssignTaskComponent } from './assign-tasks/assign-tasks.component';
import { TaskGroupComponent } from './settings/task-group/task-group.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        component: DashboardComponent,
      },
      {
        path: 'mytasks',
        component: OwnerTaskComponent,
      },
      {
        path: 'assigntasks',
        component: AssignTaskComponent,
      },
      {
        path: 'setting',
        component: SettingsComponent,
        children: [
          {
            path: '',
            component: HomeSettingComponent
          },
          {
            path: 'task-group',
            component: TaskGroupComponent
          },
          {
            path: 'ranges-kanban',
            component: RangesKanbanComponent
          }
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
    HomeSettingComponent,
    TaskGroupComponent,
    RangesKanbanComponent,
    SettingsComponent
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TMModule { }
