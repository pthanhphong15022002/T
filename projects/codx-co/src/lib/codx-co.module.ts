import { ModuleWithProviders, NgModule } from '@angular/core';
import { CodxCoComponent } from './codx-co.component';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { CodxCalendarComponent } from 'projects/codx-share/src/lib/components/codx-calendar/codx-calendar.component';
import { LayoutComponent } from './_layout/layout.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';

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
  declarations: [CodxCoComponent, LayoutComponent],
  imports: [RouterModule.forChild(routes), CodxCoreModule, CodxShareModule],
  exports: [CodxCoComponent],
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
