import { PopupAddStationeryComponent } from './settings/stationery/popup-add-stationery/popup-add-stationery.component';
import { CarsComponent } from './settings/cars/cars.component';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import {
  AccumulationChartAllModule,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { AuthGuard, CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { HttpClientModule } from '@angular/common/http';
import { LayoutComponent } from './_layout/layout.component';
import { StationeryComponent } from './settings/stationery/stationery.component';
import { BookingStationeryComponent } from './booking-stationery/booking-stationery.component';
import { StationeryDashboardComponent } from './booking-stationery/dashboard/dashboard.component';
import { BookingCarComponent } from './booking-car/booking-car.component';
import { RoomDashboardComponent } from './booking-room/dashboard/dashboard.component';
import { CarDashboardComponent } from './booking-car/dashboard/dashboard.component';
import { PopupAddBookingCarComponent } from './booking-car/popup-add-booking-car/popup-add-booking-car.component';
import { RoomsComponent } from './settings/rooms/rooms.component';
import { BookingRoomComponent } from './booking-room/booking-room.component';
import { PopupAddBookingRoomComponent } from './booking-room/popup-add-booking-room/popup-add-booking-room.component';

const routes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'bookingcars/:funcID',
        component: BookingCarComponent,
      },
      {
        path: 'bookingrooms/:funcID',
        component: BookingRoomComponent,
      },
      {
        path: 'bookingstationery/:funcID',
        component: BookingStationeryComponent,
      },
      {
        path: 'rooms/:funcID',
        component: RoomsComponent,
      },
      {
        path: 'cars/:funcID',
        component: CarsComponent,
      },
      {
        path: 'stationery/:funcID',
        component: StationeryComponent,
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
];

const Components: Type<any>[] = [
  LayoutComponent,
  BookingRoomComponent,
  BookingCarComponent,
  BookingStationeryComponent,
  PopupAddBookingRoomComponent,
  PopupAddBookingCarComponent,
  StationeryComponent,
  CarsComponent,
  RoomsComponent,
  RoomDashboardComponent,
  CarDashboardComponent,
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
  ],
  exports: [RouterModule],
})
export class CodxEpModule {
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
