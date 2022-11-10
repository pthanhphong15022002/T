import { TestOMComponent } from './testOM/testOM.component';
import { PopupAddQuotaComponent } from './settings/stationery/popup-add-quota/popup-add-quota.component';
import { BookingStationeryViewDetailComponent } from './booking/stationery/view-detail/view-detail.component';
import { PopupRequestStationeryComponent } from './booking/stationery/popup-request-stationery/popup-request-stationery.component';
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
import { ApprovalCarsComponent } from './approval/car/approval-car.component';
import { ApprovalRoomsComponent } from './approval/room/approval-room.component';
import { ApprovalStationeryComponent } from './approval/stationery/approval-stationery.component';
import { TabsComponent } from './approval/tabs/tabs.component';
import { BookingCarComponent } from './booking/car/booking-car.component';
import { CarDashboardComponent } from './booking/car/dashboard/dashboard.component';
import { PopupAddBookingCarComponent } from './booking/car/popup-add-booking-car/popup-add-booking-car.component';
import { BookingRoomComponent } from './booking/room/booking-room.component';
import { RoomDashboardComponent } from './booking/room/dashboard/dashboard.component';
import { PopupAddBookingRoomComponent } from './booking/room/popup-add-booking-room/popup-add-booking-room.component';
import { BookingStationeryComponent } from './booking/stationery/booking-stationery.component';
import { StationeryDashboardComponent } from './booking/stationery/dashboard/dashboard.component';
import { CarsComponent } from './settings/cars/cars.component';
import { PopupAddCarsComponent } from './settings/cars/popup-add-cars/popup-add-cars.component';
import { DriversComponent } from './settings/drivers/drivers.component';
import { PopupAddDriversComponent } from './settings/drivers/popup-add-drivers/popup-add-drivers.component';
import { PopupAddRoomsComponent } from './settings/rooms/popup-add-rooms/popup-add-rooms.component';
import { RoomsComponent } from './settings/rooms/rooms.component';
import { PopupAddStationeryComponent } from './settings/stationery/popup-add-stationery/popup-add-stationery.component';
import { StationeryComponent } from './settings/stationery/stationery.component';
import { LayoutComponent } from './_layout/layout.component';
import { EpCardsComponent } from './settings/epCards/epCards.component';
import { PopupAddEpCardsComponent } from './settings/epCards/popup-add-epCards/popup-add-epCards.component';
import { ApprovalRoomViewDetailComponent } from './approval/room/approval-room-view-detail/approval-room-view-detail.component';
import { ApprovalCarViewDetailComponent } from './approval/car/approval-car-view-detail/approval-car-view-detail.component';
import { BookingRoomViewDetailComponent } from './booking/room/view-detail/booking-room-view-detail.component';
import { BookingCarViewDetailComponent } from './booking/car/view-detail/booking-car-view-detail.component';
import { ApprovalStationeryViewDetailComponent } from './approval/stationery/approval-stationery-view-detail/approval-stationery-view-detail.component';
import { HistoryCardsComponent } from './settings/historyCards/historyCards.component';
import { CardTransComponent } from './booking/cardTran/cardTrans.component';
import { MeetingComponent } from './meeting/meeting.component';
import { PopupUpdateQuantityComponent } from './settings/stationery/popup-update-quantity/popup-update-quantity.component';
import { PopupAddCardTransComponent } from './booking/cardTran/popup-add-cardTrans/popup-add-cardTrans.component';
import { PopupDriverAssignComponent } from './approval/car/popup-driver-assign/popup-driver-assign.component';

const routes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'bookingrooms/:funcID',
        component: BookingRoomComponent,
      },
      {
        path: 'bookingcars/:funcID',
        component: BookingCarComponent,
      },
      {
        path: 'bookingstationery/:funcID',
        component: BookingStationeryComponent,
      },
      {
        path: 'approverooms/:funcID',
        component: ApprovalRoomsComponent,
      },
      {
        path: 'approvecars/:funcID',
        component: ApprovalCarsComponent,
      },
      {
        path: 'approvestationery/:funcID',
        component: ApprovalStationeryComponent,
      },
      {
        path: 'cardtrans/:funcID',
        component: CardTransComponent,
      },
      {
        path: 'testOM/:funcID',
        component: TestOMComponent,
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
        path: 'rooms/:funcID',
        component: RoomsComponent,
      },
      {
        path: 'cars/:funcID',
        component: CarsComponent,
      },
      {
        path: 'drivers/:funcID',
        component: DriversComponent,
      },
      {
        path: 'stationery/:funcID',
        component: StationeryComponent,
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
  LayoutComponent,
  BookingRoomComponent,
  BookingCarComponent,
  BookingStationeryComponent,
  BookingStationeryViewDetailComponent,
  ApprovalStationeryComponent,
  ApprovalCarsComponent,
  ApprovalRoomsComponent,
  PopupAddBookingRoomComponent,
  PopupAddBookingCarComponent,
  PopupRequestStationeryComponent,
  PopupAddCarsComponent,
  PopupAddRoomsComponent,
  PopupAddStationeryComponent,
  PopupAddDriversComponent,
  PopupAddEpCardsComponent,
  PopupAddQuotaComponent,
  StationeryComponent,
  CarsComponent,
  DriversComponent,
  RoomsComponent,
  EpCardsComponent,
  HistoryCardsComponent,
  RoomDashboardComponent,
  CarDashboardComponent,
  StationeryDashboardComponent,
  TabsComponent,
  ApprovalRoomViewDetailComponent,
  ApprovalCarViewDetailComponent,
  ApprovalStationeryViewDetailComponent,
  BookingRoomViewDetailComponent,
  BookingCarViewDetailComponent,
  CardTransComponent,
  PopupUpdateQuantityComponent,
  PopupAddCardTransComponent,
  PopupDriverAssignComponent,
  TestOMComponent,
];

@NgModule({
  declarations: [Components, MeetingComponent],
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
