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
import { NgbModule, NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';
import { DiagramAllModule } from '@syncfusion/ej2-angular-diagrams';
import { ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DealsComponent } from 'projects/codx-cm/src/lib/deals/deals.component';
import { CasesComponent } from 'projects/codx-cm/src/lib/cases/cases.component';
import { LeadsComponent } from 'projects/codx-cm/src/lib/leads/leads.component';
import { ViewInstancesComponent } from 'projects/codx-dp/src/lib/view-instances/view-instances.component';
import { SalcoeffempComponent } from './salcoeffemp/salcoeffemp.component';
import { KowdsComponent } from './kowds/kowds.component';
import { KowdsScheduleComponent } from './kowds/kowds-schedule/kowds-schedule.component';
import { PopupCopyEkowdsComponent } from './kowds/popup/popup-copy-ekowds/popup-copy-ekowds.component';
import { PopupEkowdsComponent } from './kowds/popup/popup-ekowds/popup-ekowds.component';
import { ContractsComponent } from 'projects/codx-cm/src/lib/contracts/contracts.component';
import { ViewDetailRequestKowDsComponent } from './request-kowds/view-detail-request-kowds/view-detail-request-kowds.component';
import { RequestKowDsComponent } from './request-kowds/request-kowds.component';
import { TotalKowDsComponent } from './request-kowds/total-kowds/total-kowds.component';
import { ViewKowcodeComponent } from './request-kowds/view-kowcode/view-kowcode.component';

import { PopupAddSalCoeffEmpComponent } from './salcoeffemp/popup/popup-add-salcoeffemp/popup-add-salcoeffemp.component';
import { PopupCoppySalCoeffEmpComponent } from './salcoeffemp/popup/popup-coppy-salcoeffemp/popup-coppy-salcoeffemp.component';
import { PayTExceptComponent } from './pay-texcept/pay-texcept.component';
import { PopupAddPayTexceptComponent } from './pay-texcept/popup/popup-add-pay-texcept/popup-add-pay-texcept.component';
import { PopupKowdMonthComponent } from './kowds/popup/popup-kowd-month/popup-kowd-month.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'KowDs/:funcID',
        component: KowdsComponent,
      },
      {
        path: 'RequestPro18/:funcID',
        component: RequestKowDsComponent,
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
        path: 'contracts/:funcID',
        component: ContractsComponent,
        data: { noReuse: true },
      },
      {
        path: 'instances/:funcID/:processID',
        component: ViewInstancesComponent,
        data: { noReuse: true },
      },
      //-----------end--------------//
      {
        path: 'SalCoeffEmp/:funcID',
        component: SalcoeffempComponent,
      },
      {
        path: 'PayTExcept/:funcID',
        component: PayTExceptComponent,
      },
    ],
  },
];

const T_Component: Type<any>[] = [
  LayoutComponent,
  KowdsComponent,
  SalcoeffempComponent,
  KowdsScheduleComponent,
  PopupCopyEkowdsComponent,
  PopupEkowdsComponent,
  ViewDetailRequestKowDsComponent,
  RequestKowDsComponent,
  TotalKowDsComponent,
  ViewKowcodeComponent,
  PopupAddSalCoeffEmpComponent,
  PopupCoppySalCoeffEmpComponent,
  PayTExceptComponent,
  PopupAddPayTexceptComponent,
  PopupKowdMonthComponent
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
  exports: [T_Component],
  declarations: [T_Component],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxPrModule {
  // public static forRoot(
  //   config?: EnvironmentConfig
  // ): ModuleWithProviders<CodxCoreModule> {
  //   return {
  //     ngModule: CodxCoreModule,
  //     providers: [
  //       HttpClientModule,
  //       { provide: EnvironmentConfig, useValue: config },
  //     ],
  //   };
  // }
}
