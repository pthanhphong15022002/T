import { TaskGroupComponent } from './setting/taskgroups/task-group.component';
import { SettingComponent } from './setting/setting.component';
import { FormsModule } from '@angular/forms';
import { OwnerTasksComponent } from './ownertasks/ownertasks.component';

import { CodxShareModule } from './../../../codx-share/src/lib/codx-share.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewDetailComponent } from './ownertasks/view-detail/view-detail.component';
import { PopupAddComponent } from './ownertasks/popup-add/popup-add.component';
import { LayoutComponent } from './_layout/layout.component';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { InlineSVGModule } from 'ng-inline-svg';
import { AccumulationChartAllModule, ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { TreeMapModule } from '@syncfusion/ej2-angular-treemap';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { SprintsComponent } from './sprints/sprints.component';
import { PopupAddSprintsComponent } from './sprints/popup-add-sprints/popup-add-sprints.component';
import { ListCardSprintsComponent } from './sprints/list-card-sprints/list-card-sprints.component';
import { SprintsTasksComponent } from './sprints/sprints-tasks/sprints-tasks.component';
import { ViewDetailsTaskComponent } from './sprints/sprints-tasks/view-details-task/view-details-task.component';
import { UpdateStatusPopupComponent } from './ownertasks/update-status-popup/update-status-popup.component';
import { PopAddTaskgroupComponent } from './setting/taskgroups/pop-add-taskgroup/pop-add-taskgroup.component';
import { RangesKanbanComponent } from './setting/rangeskanban/ranges-kanban.component';
import { HomeSettingComponent } from './setting/homesetting/home-setting.component';
import { PopAddRangesComponent } from './setting/rangeskanban/pop-add-ranges/pop-add-ranges.component';
import { AssignTasksComponent } from './assigntasks/assigntasks.component';
import { ViewDetailAssignTasksComponent } from './assigntasks/view-detail-assign-tasks/view-detail-assign-tasks.component';
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'mytasks/:funcID',
        component: OwnerTasksComponent,
      },
      {
        path: 'viewboards/:funcID',
        component: SprintsComponent,
      },
      {
        path: 'assigntasks/:funcID',
        component: AssignTasksComponent,
      },
      {
        path: 'sprinttasks/:funcID',
        component: SprintsTasksComponent,
        // children: [
        //   {
        //     path: ':id',
        //     component: SprintsTasksComponent,
        //   }]
      },
      {
        path: 'setting',
        component: SettingComponent,
        children: [
          {
            path: ':funcID',
            component: HomeSettingComponent
          },
          {
            path: 'taskgroups/:funcID',
            component: TaskGroupComponent
          },
          {
            path: 'rangeskanban/:funcID',
            component: RangesKanbanComponent
          },
        ]
      },
      {
        path: 'home/:funcID',
        component: DashboardComponent
      },
      {
        path: '**',
        redirectTo: 'error/404',
      }
    ]
  }
];

const T_Component: Type<any>[] = [
  LayoutComponent,
  OwnerTasksComponent,
  PopupAddComponent,
  ViewDetailComponent,
  DashboardComponent,
  SprintsComponent,
  PopupAddSprintsComponent,
  ListCardSprintsComponent,
  SprintsTasksComponent,
  ViewDetailsTaskComponent,
  UpdateStatusPopupComponent,
  HomeSettingComponent,
  SettingComponent,
  TaskGroupComponent,
  PopAddTaskgroupComponent,
  RangesKanbanComponent,
  PopAddRangesComponent,
  AssignTasksComponent,
  ViewDetailAssignTasksComponent
]
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
    TreeMapModule,
    DatePickerModule,
    TabModule,
    FormsModule
  ],
  exports: [
    RouterModule
  ],
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
