import { ModuleWithProviders, NgModule } from '@angular/core';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './_layout/layout.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { SpeedDialModule } from '@syncfusion/ej2-angular-buttons';
import { PopupSettingsComponent } from './popup/popup-settings/popup-settings.component';
import { COPopupAddBookingCarComponent } from './popup/popup-add-booking-car/popup-add-booking-car.component';
import { COPopupAddBookingRoomComponent } from './popup/popup-add-booking-room/popup-add-booking-room.component';
import { COCalendarComponent } from './calendar/calendar.component';
import { CalendarCenterComponent } from './calendar/calendar-center/calendar-center.component';
import { ScheduleCenterComponent } from './calendar/schedule-center/schedule-center.component';
import { NgbAccordionModule, NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'calendar/:funcID',
        component: COCalendarComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    LayoutComponent,
    CalendarCenterComponent,
    ScheduleCenterComponent,
    COCalendarComponent,
    PopupSettingsComponent,
    COPopupAddBookingCarComponent,
    COPopupAddBookingRoomComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule,
    CodxShareModule,
    SpeedDialModule,
    NgbAccordionModule,
    NgbPopoverModule
  ],
})
export class CodxCoModule {
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
