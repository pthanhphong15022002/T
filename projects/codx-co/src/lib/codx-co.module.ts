import { ModuleWithProviders, NgModule } from '@angular/core';
import { CodxCoComponent } from './codx-co.component';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { CodxCalendarComponent } from 'projects/codx-share/src/lib/components/codx-calendar/codx-calendar.component';
import { LayoutOnlyHeaderComponent } from 'projects/codx-share/src/lib/_layout/_onlyHeader/_onlyHeader.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutOnlyHeaderComponent,
    children: [
      {
        path: 'calendar/:funcID',
        component: CodxCalendarComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [CodxCoComponent],
  imports: [RouterModule.forChild(routes)],
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
