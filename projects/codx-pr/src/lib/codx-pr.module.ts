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
import { KowdsScheduleComponent } from './employee-kowds/kowds-schedule/kowds-schedule.component';
import { PopupEkowdsComponent } from './employee-kowds/popup-ekowds/popup-ekowds.component';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DealsComponent } from 'projects/codx-cm/src/lib/deals/deals.component';
import { CasesComponent } from 'projects/codx-cm/src/lib/cases/cases.component';
import { LeadsComponent } from 'projects/codx-cm/src/lib/leads/leads.component';
import { ViewInstancesComponent } from 'projects/codx-dp/src/lib/view-instances/view-instances.component';
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
      //----phát hành quy trình DP-CRM----//
      {
        path: 'deals/:funcID',
        component: DealsComponent,
        data: { noReuse: true },
      },
      {
        path: 'cases/:funcID',
        component: CasesComponent,
        data: { noReuse: true },
      },
      {
        path: 'leads/:funcID',
        component: LeadsComponent,
        data: { noReuse: true },
      },
      {
        path: 'instances/:funcID/:processID',
        component: ViewInstancesComponent,
        data: { noReuse: true },
      },
      //-----------end--------------//
    ],
  },
];

const T_Component: Type<any>[] = [
  LayoutComponent,
  OverTimeComponent,
  PopupOverTimeComponent,
  ViewDetailOtComponent,
  EmployeeKowdsComponent,
  KowdsScheduleComponent,
  PopupEkowdsComponent,
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
    DateRangePickerModule,
  ],
  exports: [RouterModule],
  declarations: [
    T_Component,
    EmployeeKowdsComponent,
    KowdsScheduleComponent,
    PopupEkowdsComponent,
  ],
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
