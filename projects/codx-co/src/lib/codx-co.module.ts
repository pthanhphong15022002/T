import { ModuleWithProviders, NgModule } from '@angular/core';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './_layout/layout.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { SpeedDialModule } from '@syncfusion/ej2-angular-buttons';
import { PopupSettingsComponent } from './popup/popup-settings/popup-settings.component';
import { COCalendarComponent } from './calendar/calendar.component';
import { CalendarCenterComponent } from './calendar/calendar-center/calendar-center.component';
import { ScheduleCenterComponent } from './calendar/schedule-center/schedule-center.component';
import { NgbModule, NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { PopupAddMeetingsComponent } from './popup/popup-add-meeting/popup-add-meeting.component';
import { PopupTemplateComponent } from './popup/popup-template/popup-template.component';


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
    PopupAddMeetingsComponent,
    PopupTemplateComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule,
    CodxShareModule,
    SpeedDialModule,
    NgbPopoverModule,
    NgbModule,
    NgbNavModule
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
