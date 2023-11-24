import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule,
  Type,
} from '@angular/core';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from 'projects/codx-pr/src/lib/_layout/layout.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { CoreModule } from '@core/core.module';
import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DiagramAllModule } from '@syncfusion/ej2-angular-diagrams';
import { ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { OverTimeComponent } from './over-time/over-time.component';
import { PopupOverTimeComponent } from './over-time/popup-over-time/popup-over-time.component';
import { ViewDetailOtComponent } from './over-time/view-detail-over-time/view-detail-ot.component';
import { EmployeeKowdsComponent } from './employee-kowds/employee-kowds.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'TimeKeepingRequestOT/:funcID',
        component: OverTimeComponent,
      },
      {
        path: 'KowDs/:funcID',
        component: EmployeeKowdsComponent,
      },
    ],
  },
];

const T_Component: Type<any>[] = [
  LayoutComponent,
  OverTimeComponent,
  PopupOverTimeComponent,
  ViewDetailOtComponent,
  EmployeeKowdsComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    HttpClientModule,
    CodxCoreModule,
    RouterModule.forChild(routes),
    CoreModule,
    SliderModule,
    CodxShareModule,
    ChartAllModule,
    DiagramAllModule,
    NgbModule,
  ],
  exports: [RouterModule],
  declarations: [T_Component, EmployeeKowdsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxPrModule {
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
