import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import {
  AccumulationChartAllModule,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { CarBookingComponent } from './car/car.component';
import { CarDashboardComponent } from './car/dashboard/dashboard.component';
import { DialogCarBookingComponent } from './car/dialog/editor.component';
import { EditRoomBookingComponent } from './room/edit-room-booking/edit-room-booking.component';
import { Home1Component } from './home1/home1.component';
import { RoomComponent } from './room/room.component';
import { SelectIconComponent } from './select-icon/select-icon.component';
import { RoomDashboardComponent } from './room/dashboard/dashboard.component';
import { StationeryComponent } from './stationery/stationery.component';
import { DialogStationeryComponent } from './stationery/dialog/dialog-stationery.component';
import { StationeryDashboardComponent } from './stationery/dashboard/dashboard.component';
import { AuthGuard, CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { HttpClientModule } from '@angular/common/http';
import { RoomsComponent } from './settings/rooms/rooms.component';
import { SettingsComponent } from './settings/settings.component';
import { CarResourceComponent } from './settings/cars/cars.component';
import { LayoutComponent } from './_layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home1',
        component: Home1Component,
      },
      {
        path: 'home1/:functionID',
        component: Home1Component,
      },
      {
        path: 'bookingrooms/:functionID',
        component: RoomComponent,
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
        path: 'bookingcars/:functionID',
        component: CarBookingComponent,
      },
      {
        path: 'setting/:functionID',
        component: SettingsComponent,
      },
      {
        path: 'cars/:functionID',
        component: CarResourceComponent,
      },
      {
        path: 'rooms/:functionID',
        component: RoomsComponent,
      },
      {
        path: 'stationery/:functionID',
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
@NgModule({
  declarations: [
    LayoutComponent,
    RoomComponent,
    SelectIconComponent,
    EditRoomBookingComponent,
    CarBookingComponent,
    DialogCarBookingComponent,
    RoomDashboardComponent,
    CarDashboardComponent,
    DialogStationeryComponent,
    Home1Component,
    StationeryComponent,
    StationeryDashboardComponent,
  ],
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
