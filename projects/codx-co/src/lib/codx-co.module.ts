import { ModuleWithProviders, NgModule } from '@angular/core';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './_layout/layout.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxCalendarComponent } from './codx-calendar/codx-calendar.component';
import { CalendarCenterComponent } from './codx-calendar/calendar-center/calendar-center.component';
import { SpeedDialModule } from '@syncfusion/ej2-angular-buttons';
import { PopupSettingsComponent } from './codx-calendar/popup-settings/popup-settings.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'calendar/:funcID',
        component: CodxCalendarComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    LayoutComponent,
    CalendarCenterComponent,
    CodxCalendarComponent,
    PopupSettingsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule,
    CodxShareModule,
    SpeedDialModule,
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
