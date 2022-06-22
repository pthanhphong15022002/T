import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { RoomsComponent } from './settings/rooms/rooms.component';
import { CarResourceComponent } from './settings/cars/cars.component';
import { LayoutComponent } from './_layout/layout.component';
import { StationeryComponent } from './settings/stationery/stationery.component';
import { BookingStationeryComponent } from './booking-stationery/booking-stationery.component';
import { StationeryDashboardComponent } from './booking-stationery/dashboard/dashboard.component';
import { DialogStationeryComponent } from './settings/stationery/dialog/dialog-stationery.component';
import { EditRoomBookingComponent } from './booking-room/edit-room-booking/edit-room-booking.component';
import { BookingRoomComponent } from './booking-room/booking-room.component';
import { BookingCarComponent } from './booking-car/booking-car.component';
import { RoomDashboardComponent } from './booking-room/dashboard/dashboard.component';
import { CarDashboardComponent } from './booking-car/dashboard/dashboard.component';
import { PopupAddBookingCarComponent } from './booking-car/popup-add-booking-car/popup-add-booking-car.component';

const routes: Routes = [
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
        path: 'room-resources',
        component: RoomsComponent,
      },
      {
        path: 'bookingstationery/:funcID',
        component: BookingStationeryComponent,
      },
      {
        path: 'room-resources',
        component: RoomsComponent,
      },
      {
        path: 'booking-edit',
        component: EditRoomBookingComponent,
      },
      {
        path: 'cars/:funcID',
        component: CarResourceComponent,
      },
      {
        path: 'rooms/:funcID',
        component: RoomsComponent,
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
  EditRoomBookingComponent,
  BookingCarComponent,
  PopupAddBookingCarComponent,
  RoomDashboardComponent,
  CarDashboardComponent,
  StationeryComponent,
  BookingStationeryComponent,
  StationeryDashboardComponent,
  DialogStationeryComponent,
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
