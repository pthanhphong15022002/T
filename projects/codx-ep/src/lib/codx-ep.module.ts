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
import { LayoutComponent } from './_layout/layout.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
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
        component: EPBookingComponent,
      },
      {
        path: 'approvestationery/:funcID',
        component: EPApprovalComponent,
      },
      // {
      //   path: 'report/:funcID',
      //   component: ReportComponent,
      // },

      {
        path: 'bookingrooms/:funcID',
        component: EPBookingComponent,
      },
      {
        path: 'approverooms/:funcID',
        component: EPApprovalComponent,
      },

      {
        path: 'bookingcars/:funcID',
        component: EPBookingComponent,
      },
      {
        path: 'approvecars/:funcID',
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
  ],
  exports: [RouterModule],
  declarations: [
    LayoutComponent,
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
