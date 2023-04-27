import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CoreModule } from '@core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { SplitterModule } from '@syncfusion/ej2-angular-layouts';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { EPReportComponent } from './report/report.component';
import { LayoutComponent } from './_layout/layout.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { BookingStationeryComponent } from './stationery/booking/booking-stationery.component';
import { ApprovalStationeryComponent } from './stationery/approval/approval-stationery.component';
import { ReportComponent } from './stationery/report/report.component';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { StationeryCategoryComponent } from './stationery/category/category.component';
import { RoomsComponent } from './room/settings/rooms/rooms.component';
import { BookingRoomComponent } from './room/booking/booking-room.component';
import { ApprovalRoomsComponent } from './room/approval/approval-room.component';
import { CarsComponent } from './car/settings/cars/cars.component';
import { DriversComponent } from './car/settings/drivers/drivers.component';
import { EpCardsComponent } from './car/settings/epCards/epCards.component';
import { HistoryCardsComponent } from './car/settings/historyCards/historyCards.component';
import { BookingCarComponent } from './car/booking/booking-car.component';
import { ApprovalCarsComponent } from './car/approval/approval-car.component';
import { CardTransComponent } from './car/cardTran/cardTrans.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'report/:funcID',
        component: EPReportComponent,
      },
      {
        path: 'report/detail/:funcID',
        component: CodxReportViewDetailComponent,
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },

      {
        path: 'bookingstationery/:funcID',
        component: BookingStationeryComponent,
      },
      {
        path: 'approvestationery/:funcID',
        component: ApprovalStationeryComponent,
      },
      {
        path: 'report/:funcID',
        component: ReportComponent,
      },

      {
        path: 'bookingrooms/:funcID',
        component: BookingRoomComponent,
      },
      {
        path: 'approverooms/:funcID',
        component: ApprovalRoomsComponent,
      },

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
      
    ],
  },
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'stationery/:funcID',
        component: StationeryCategoryComponent,
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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    HttpClientModule,
    CodxCoreModule,
    CoreModule,
    RouterModule.forChild(routes),
    CodxShareModule,
    DatePickerModule,
    TabModule,
    FormsModule,
    NgbModule,
    SplitterModule,
    CodxReportModule,
  ],
  exports: [RouterModule],
  declarations: [LayoutComponent, EPReportComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxEPModule {
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
