import { UserComponent } from './users/user.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { AccumulationChartAllModule, ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { TreeMapModule } from '@syncfusion/ej2-angular-treemap';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import path from 'path';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxAdComponent } from './codx-ad.component';
import { LayoutComponent } from './_layout/layout.component';
import { CompanySettingComponent } from './company-setting/company-setting.component';
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path:'users/:funcID',
        component: UserComponent,
      }
      ,{
        path:'users/companysetting/:funcID',
        component: CompanySettingComponent
      }

    ]
  }
];

const T_Component: Type<any>[] = [
  LayoutComponent,
  UserComponent,
  CompanySettingComponent
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    HttpClientModule,
    CodxCoreModule,
    RouterModule.forChild(routes),
    CodxShareModule,
    ChartAllModule,
    AccumulationChartAllModule,
    ProgressBarModule,
    CircularGaugeModule,
    TreeMapModule,
    DatePickerModule,
    TabModule,
    FormsModule,
    NgbModule,
  ],
  exports: [RouterModule],
  declarations: T_Component,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ADModule {
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
