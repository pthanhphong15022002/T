import { TmComponent } from './tm.component';
import { AuthGuard, CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: TmComponent,
    children: [
      // {
      //   path: 'home/:funcID',
      //   component: DashboardComponent,
      // },
      // {
      //   path: 'mytasks/:funcID',
      //   component: OwnerTaskComponent,
      // },
      // {
      //   path: 'assigntasks/:funcID',
      //   component: AssignTaskComponent,
      // },
      // {
      //   path: 'viewboards/:funcID',
      //   component: SprintsComponent,
      // },
      // {
      //   path: 'sprinttasks/:funcID',
      //   component: SprintsTasksComponent,
      //   children: [
      //     {
      //       path: ':id',
      //       component: SprintsTasksComponent,
      //     }]
      // },
      // {
      //   path: 'setting',
      //   component: SettingsComponent,
      //   children: [
      //     {
      //       path: '',
      //       component: HomeSettingComponent,
      //     },
      //     {
      //       path: 'settingcalendar/:funcID',
      //       component: SettingCalendarComponent,
      //     },
      //     {
      //       path: 'taskgroups/:funcID',
      //       component: TaskGroupComponent,
      //     },
      //     {
      //       path: 'rangeskanban/:funcID',
      //       component: RangesKanbanComponent,
      //     },
      //     {
      //       path: 'project/:funcID',
      //       component: ProjectComponent,
      //     },
      //     {
      //       path: 'projectgroup/:funcID',
      //       component: ProjectGroupComponent,
      //     },
      //   ],
      // },
      // {
      //   path: 'statistical',
      //   component: StatisticalComponent,
      //   children: [
      //     {
      //       path: '',
      //       component: HomeStatisticalComponent,
      //     },
      //     {
      //       path: 'statisticalviewlist/:funcID',
      //       component: StatisticalViewlistComponent
      //     },
      //     {
      //       path: 'statisticalproject/:funcID',
      //       component: StatisticalProjectComponent
      //     },
      //     {
      //       path: 'statisticalchart/:funcID',
      //       component: StatisticalChartComponent
      //     },

      //   ]
      // },
      // {
      //   path: '',
      //   redirectTo: 'home',
      //   pathMatch: 'full',
      // },
      // {
      //   path: '**',
      //   redirectTo: 'error/404',
      // },
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    HttpClientModule,
    CodxCoreModule
  ],
  exports: [
  ],
  declarations: [
    ViewsComponent
  ]
})
export class TmModule {
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
