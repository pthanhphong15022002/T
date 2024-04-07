import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  Type,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CoreModule } from '@core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { SplitterModule } from '@syncfusion/ej2-angular-layouts';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { LayoutNoAsideComponent } from 'projects/codx-common/src/lib/_layout/_noAside/_noAside.component';
import { ResourcesComponent } from './resources/resources.component';
import { PopupAddResourcesComponent } from './resources/popup-add-resources/popup-add-resources.component';
import { EPHistoryCardComponent } from './resources/ep-history-card/ep-history-card.component';
import { PopupAddStationeryComponent } from './resources/popup-add-stationery/popup-add-stationery.component';
import { PopupUpdateQuantityComponent } from './resources/popup-update-quantity/popup-update-quantity.component';
import { PopupAddQuotaComponent } from './resources/popup-add-quota/popup-add-quota.component';
import { EPBookingComponent } from './booking/ep-booking.component';
import { EPApprovalComponent } from './approval/ep-approval.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import { CardTransComponent } from './booking/cardTran/cardTrans.component';
import { PopupAddCardTransComponent } from './booking/cardTran/popup-add-cardTrans/popup-add-cardTrans.component';
import { PopupDriverAssignComponent } from './approval/popup-driver-assign/popup-driver-assign.component';
import { DynamicFormComponent } from 'projects/codx-share/src/lib/components/dynamic-form/dynamic-form.component';
import { CodxViewContentComponent } from 'projects/codx-share/src/lib/components/codx-view-content/codx-view-content.component';
import { EPDashboardComponent } from './dashboard/dashboard.component';
import { TreeMapModule } from '@syncfusion/ej2-angular-treemap';
import { LayoutComponent } from 'projects/codx-share/src/lib/components/layout/layout.component';
import { CodxDashboardViewsComponent } from 'projects/codx-share/src/lib/components/codx-dashboard/dashboard-view/dashboard-view.component';
import { DealsComponent } from 'projects/codx-cm/src/lib/deals/deals.component';
import { CasesComponent } from 'projects/codx-cm/src/lib/cases/cases.component';
import { ViewInstancesComponent } from 'projects/codx-dp/src/lib/view-instances/view-instances.component';
import { LeadsComponent } from 'projects/codx-cm/src/lib/leads/leads.component';
import { ContractsComponent } from 'projects/codx-cm/src/lib/contracts/contracts.component';
import { PopupAdjustedAllocationComponent } from './approval/popup-adjusted-allocation/popup-adjusted-allocation.component';
import { ReceiptResourceComponent } from './receipt/receipt-resource.component';
import { AddReceiptResourceComponent } from './receipt/add-receipt-resource/add-receipt-resource.component';
import { BusinesstripComponent } from './businesstrip/businesstrip.component';
import { BusinesstripDetailComponent } from './businesstrip/businesstrip-detail/businesstrip-detail.component';
import { PopupAddBusinesstripComponent } from './businesstrip/popup/popup-add-businesstrip/popup-add-businesstrip.component';
import { AdvanceComponent } from './advance/advance.component';
import { AdvanceDetailComponent } from './advance/advance-detail/advance-detail.component';
import { PopupAddAdvanceComponent } from './advance/popup-add-advance/popup-add-advance.component';
import { PaymentDetailComponent } from './payment/payment-detail/payment-detail.component';
import { PaymentComponent } from './payment/payment.component';
import { PopupAddPaymentComponent } from './payment/popup/popup-add-payment/popup-add-payment.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'report/:funcID',
        component: CodxReportViewsComponent,
      },
      {
        path: 'report/detail/:funcID',
        component: CodxReportViewDetailComponent,
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
      {
        path: 'bookingstationery/:funcID',
        data: { noReuse: true },
        component: EPBookingComponent,
      },      
      
      {
        path: 'receiptstationery/:funcID',
        data: { noReuse: true },
        component: ReceiptResourceComponent,
      },
      {
        path: 'approvestationery/:funcID',
        data: { noReuse: true },
        component: EPApprovalComponent,
      },
      // {
      //   path: 'report/:funcID',
      //   component: ReportComponent,
      // },

      {
        path: 'bookingrooms/:funcID',
        data: { noReuse: true },
        component: EPBookingComponent,
      },
      {
        path: 'approverooms/:funcID',
        data: { noReuse: true },
        component: EPApprovalComponent,
      },

      {
        path: 'bookingcars/:funcID',
        data: { noReuse: true },
        component: EPBookingComponent,
      },
      {
        path: 'approvecars/:funcID',
        data: { noReuse: true },
        component: EPApprovalComponent,
      },
      {
        path: 'cardtrans/:funcID',
        component: CardTransComponent,
      },
      {
        path: 'share/dynamic/:funcID',
        component: DynamicFormComponent,
      },
      {
        path: 'dialog/:funcID',
        component: CodxViewContentComponent,
      },
      {
        path: 'dashboard/:funcID',
        component: EPDashboardComponent,
      },
      {
        path: 'dashboard-view/:funcID',
        component: CodxDashboardViewsComponent,
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
    ],
  },
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'stationery/:funcID',
        component: ResourcesComponent,
      },
      {
        path: 'rooms/:funcID',
        component: ResourcesComponent,
      },
      {
        path: 'cars/:funcID',
        component: ResourcesComponent,
      },
      {
        path: 'drivers/:funcID',
        component: ResourcesComponent,
      },
      {
        path: 'epcards/:funcID',
        component: ResourcesComponent,
      },
      {
        path: 'historycards/:funcID/:id',
        component: EPHistoryCardComponent,
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
    TreeMapModule,
  ],
  exports: [RouterModule],
  declarations: [
    ResourcesComponent,
    PopupAddResourcesComponent,
    EPHistoryCardComponent,
    PopupAddStationeryComponent,
    PopupUpdateQuantityComponent,
    PopupAddQuotaComponent,
    EPBookingComponent,
    EPApprovalComponent,
    PopupAddCardTransComponent,
    CardTransComponent,
    PopupDriverAssignComponent,
    PopupAdjustedAllocationComponent,
    EPDashboardComponent,
    ReceiptResourceComponent,
    AddReceiptResourceComponent,
    BusinesstripComponent,
    PopupAddBusinesstripComponent,
    BusinesstripDetailComponent,
    AdvanceComponent,
    AdvanceDetailComponent,
    PopupAddAdvanceComponent,
    PaymentComponent,
    PaymentDetailComponent,
    PopupAddPaymentComponent
  ],
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
