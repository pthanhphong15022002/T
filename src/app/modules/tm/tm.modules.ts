
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
import { TaskGroupComponent } from './task-group/task-group.component';

import { RangesKanbanComponent } from './ranges-kanban/ranges-kanban.component';
import { SettingsComponent } from './settings/settings/settings.component';
import { SettingComponent } from './controls/setting-panel/setting-panel.component';
import { DashboardComponent } from './tmdashnoard/dashboard/dashboard.component';
import { ControlsModule } from './controls/controls.module';
import { CalendarComponent } from './calendar/calendar.component';
import { AssignTaskComponent } from './assign-tasks/assign-tasks.component';

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
      },
      {
        path: 'task-group',
        component: TaskGroupComponent
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
    SettingComponent,
    TreeviewComponent,
    CalendarComponent,
    TaskGroupComponent,
    RangesKanbanComponent,
    LayoutComponent,
    AssignTaskComponent,
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
    DatePickerModule, TabModule, ControlsModule
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TMModule { }
