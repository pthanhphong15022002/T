
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { LayoutComponent } from './_layout/layout.component';
import { TmComponent } from './tm.component';
import { FormsModule } from '@angular/forms';
import { ViewListDetailsComponent } from './view-list-details/view-list-details.component';
import { CommonModule } from '@angular/common';
import { ListTasksComponent } from './list-tasks/list-tasks.component';
import { SharedModule } from '@shared/shared.module';
import { MoreFuntionComponent } from './more-funtion/more-funtion.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { AccumulationChartAllModule, ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TaskInfoComponent } from './controls/task-info/task-info.component';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { DashboardComponent } from './dashboard/dashboard.component';
import { KanbanComponent } from './kanban/kanban.component';
import { SettingComponent } from './setting/setting.component';
import { TreeviewComponent } from './treeview/treeview.component';
import { TabModule } from '@syncfusion/ej2-angular-navigations';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: TmComponent,
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'subhome',
        component: HomeComponent,
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
    HomeComponent,
    KanbanComponent,
    TmComponent,
    ViewListDetailsComponent,
    ListTasksComponent,
    MoreFuntionComponent,
    ScheduleComponent,
    TaskInfoComponent,
    DashboardComponent,
    SettingComponent,
    TreeviewComponent,
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
    DatePickerModule,TabModule
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TmModule { }
