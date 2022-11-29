import { PopupRescheduleBookingComponent } from './booking/popup-reschedule-booking/popup-reschedule-booking.component';
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
import { MeetingComponent } from './meeting/meeting.component';
import { RoomDashboardComponent } from './booking/dashboard/dashboard.component';
import { Layout4Component } from './_layout4/layout4.component';
import { BookingRoomComponent } from './booking/booking-room.component';
import { BookingRoomViewDetailComponent } from './booking/view-detail/booking-room-view-detail.component';
import { PopupAddBookingRoomComponent } from './booking/popup-add-booking-room/popup-add-booking-room.component';
import { ApprovalRoomViewDetailComponent } from './approval/approval-room-view-detail/approval-room-view-detail.component';
import { ApprovalRoomsComponent } from './approval/approval-room.component';
import { PopupAddRoomsComponent } from './settings/rooms/popup-add-rooms/popup-add-rooms.component';
import { RoomsComponent } from './settings/rooms/rooms.component';
import { PopupAddAttendeesComponent } from './booking/popup-add-attendees/popup-add-attendees.component';

const routes: Route[] = [
  {
    path: '',
    component: Layout4Component,
    children: [
      {
        path: 'bookingrooms/:funcID',
        component: BookingRoomComponent,
      },
      {
        path: 'approverooms/:funcID',
        component: ApprovalRoomsComponent,
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
    ],
  },
];

const Components: Type<any>[] = [
  Layout4Component,
  BookingRoomComponent,
  ApprovalRoomsComponent,
  RoomsComponent,
  PopupAddRoomsComponent,
  PopupAddBookingRoomComponent,
  BookingRoomViewDetailComponent,
  RoomDashboardComponent,
  ApprovalRoomViewDetailComponent,
  PopupRescheduleBookingComponent,
  PopupAddAttendeesComponent,
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
export class CodxEp4Module {
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
