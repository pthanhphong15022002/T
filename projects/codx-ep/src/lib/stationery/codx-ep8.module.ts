import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import {
  AccumulationChartAllModule,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { AuthGuard, CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { ApprovalStationeryViewDetailComponent } from './approval/approval-stationery-view-detail/approval-stationery-view-detail.component';
import { ApprovalStationeryComponent } from './approval/approval-stationery.component';
import { BookingStationeryComponent } from './booking/booking-stationery.component';
import { StationeryDashboardComponent } from './booking/dashboard/dashboard.component';
import { PopupRequestStationeryComponent } from './booking/popup-request-stationery/popup-request-stationery.component';
import { BookingStationeryViewDetailComponent } from './booking/view-detail/view-detail.component';
import { PopupAddQuotaComponent } from './settings/stationery/popup-add-quota/popup-add-quota.component';
import { PopupAddStationeryComponent } from './settings/stationery/popup-add-stationery/popup-add-stationery.component';
import { PopupUpdateQuantityComponent } from './settings/stationery/popup-update-quantity/popup-update-quantity.component';
import { StationeryComponent } from './settings/stationery/stationery.component';
import { Layout8Component } from './_layout8/layout8.component';

const routes: Route[] = [
  {
    path: '',
    component: Layout8Component,
    children: [
      {
        path: 'bookingstationery/:funcID',
        component: BookingStationeryComponent,
      },
      {
        path: 'approvestationery/:funcID',
        component: ApprovalStationeryComponent,
      },
      {
        path: 'settings',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./settings/_layout/layout.modules').then(
            (m) => m.LayoutModule
          ),
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
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'stationery/:funcID',
        component: StationeryComponent,
      },
    ],
  },
];

const Components: Type<any>[] = [
  Layout8Component,
  BookingStationeryComponent,
  ApprovalStationeryComponent,
  StationeryComponent,
  PopupAddStationeryComponent,
  PopupUpdateQuantityComponent,
  PopupAddQuotaComponent,
  PopupRequestStationeryComponent,
  BookingStationeryViewDetailComponent,
  ApprovalStationeryViewDetailComponent,
  StationeryDashboardComponent,
];

@NgModule({
  declarations: [Components],
  imports: [
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ChartAllModule,
    AccumulationChartAllModule,
    ProgressBarAllModule,
    TabModule,
    CodxShareModule,
    CodxReportModule,
  ],
  exports: [RouterModule],
})
export class CodxEp8Module {
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
