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
import { Layout7Component } from './_layout7/layout7.component';
import { BookingCarComponent } from './booking/booking-car.component';
import { PopupAddBookingCarComponent } from './booking/popup-add-booking-car/popup-add-booking-car.component';
import { BookingCarViewDetailComponent } from './booking/view-detail/booking-car-view-detail.component';
import { CarDashboardComponent } from './booking/dashboard/dashboard.component';
import { ApprovalCarViewDetailComponent } from './approval/approval-car-view-detail/approval-car-view-detail.component';
import { ApprovalCarsComponent } from './approval/approval-car.component';
import { PopupDriverAssignComponent } from './approval/popup-driver-assign/popup-driver-assign.component';
import { CardTransComponent } from './cardTran/cardTrans.component';
import { PopupAddCardTransComponent } from './cardTran/popup-add-cardTrans/popup-add-cardTrans.component';
import { CarsComponent } from './settings/cars/cars.component';
import { PopupAddCarsComponent } from './settings/cars/popup-add-cars/popup-add-cars.component';
import { DriversComponent } from './settings/drivers/drivers.component';
import { PopupAddDriversComponent } from './settings/drivers/popup-add-drivers/popup-add-drivers.component';
import { EpCardsComponent } from './settings/epCards/epCards.component';
import { PopupAddEpCardsComponent } from './settings/epCards/popup-add-epCards/popup-add-epCards.component';
import { HistoryCardsComponent } from './settings/historyCards/historyCards.component';

const routes: Route[] = [
  {
    path: '',
    component: Layout7Component,
    children: [
      {
        path: 'bookingcars/:funcID',
        component: BookingCarComponent,
      },
      {
        path: 'approvecars/:funcID',
        component: ApprovalCarsComponent,
      },
      {
        path: 'cardtrans/:funcID',
        component: CardTransComponent,
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
        path: 'cars/:funcID',
        component: CarsComponent,
      },
      {
        path: 'drivers/:funcID',
        component: DriversComponent,
      },
      {
        path: 'epcards/:funcID',
        component: EpCardsComponent,
      },
      {
        path: 'historycards/:funcID/:id',
        component: HistoryCardsComponent,
      },
    ],
  },
];

const Components: Type<any>[] = [
  Layout7Component,
  BookingCarComponent,
  ApprovalCarsComponent,
  CardTransComponent,
  CarsComponent,
  DriversComponent,
  EpCardsComponent,
  HistoryCardsComponent,
  PopupAddCarsComponent,
  PopupAddDriversComponent,
  PopupAddBookingCarComponent,
  PopupAddCardTransComponent,
  PopupAddEpCardsComponent,
  BookingCarViewDetailComponent,
  ApprovalCarViewDetailComponent,
  CarDashboardComponent,
  PopupDriverAssignComponent,
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
export class CodxEp7Module {
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
