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
import {
  ChartAllModule,
  AccumulationChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { SplitterModule } from '@syncfusion/ej2-angular-layouts';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { TreeMapModule } from '@syncfusion/ej2-angular-treemap';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { EPReportComponent } from './report/report.component';
import { LayoutComponent } from './_layout/layout.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';

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
