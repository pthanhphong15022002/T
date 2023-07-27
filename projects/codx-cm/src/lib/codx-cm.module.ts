import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { CodxCmComponent } from './codx-cm.component';
import { LayoutComponent } from './_layout/layout.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  AccumulationChartAllModule,
  AccumulationTooltipService,
  BubbleSeriesService,
  ChartAllModule,
  ChartModule,
} from '@syncfusion/ej2-angular-charts';
import { SharedModule } from '@shared/shared.module';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { CmCustomerComponent } from './cmcustomer/cmcustomer.component';
import { CmCustomerDetailComponent } from './cmcustomer/cmcustomer-detail/cmcustomer-detail.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { InformationComponent } from './cmcustomer/cmcustomer-detail/information/information.component';
import { PopupAddCmCustomerComponent } from './cmcustomer/popup-add-cmcustomer/popup-add-cmcustomer.component';
import { PopupAddressComponent } from './cmcustomer/cmcustomer-detail/codx-address-cm/popup-address/popup-address.component';
import { ViewListCmComponent } from './cmcustomer/view-list-cm/view-list-cm.component';
import { PopupListContactsComponent } from './cmcustomer/cmcustomer-detail/codx-list-contacts/popup-list-contacts/popup-list-contacts.component';
import { PopupQuickaddContactComponent } from './cmcustomer/cmcustomer-detail/codx-list-contacts/popup-quickadd-contact/popup-quickadd-contact.component';
import { QuotationsComponent } from './quotations/quotations.component';
import { PopupAddQuotationsComponent } from './quotations/popup-add-quotations/popup-add-quotations.component';
import { DealsComponent } from './deals/deals.component';
import { PopupAddDealComponent } from './deals/popup-add-deal/popup-add-deal.component';
import { DealDetailComponent } from './deals/deal-detail/deal-detail.component';
import { TabDetailCustomComponent } from './deals/deal-detail/tab-detail-custom/tab-detail-custom.component';
import { AddContractsComponent } from './contracts/add-contracts/add-contracts.component';
import { ListContractsComponent } from './contracts/list-contracts/list-contracts.component';
import { QuotationsLinesComponent } from './quotations-lines/quotations-lines.component';
import { PopupAddQuotationsLinesComponent } from './quotations-lines/popup-add-quotations-lines/popup-add-quotations-lines.component';
import { CodxListContactsComponent } from './cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';
import { CodxListDealsComponent } from './cmcustomer/cmcustomer-detail/codx-list-deals/codx-list-deals.component';
import { CodxTabDealcompetitorsComponent } from './deals/deal-detail/codx-tab-dealcompetitors/codx-tab-dealcompetitors.component';
import { PopupAddDealcompetitorComponent } from './deals/deal-detail/codx-tab-dealcompetitors/popup-add-dealcompetitor/popup-add-dealcompetitor.component';
import { ViewDealcompetitorsComponent } from './cmcustomer/cmcustomer-detail/view-dealcompetitors/view-dealcompetitors.component';
import { QuotationsViewDetailComponent } from './quotations/quotations-view-detail/quotations-view-detail.component';
import { CasesComponent } from './cases/cases.component';
import { CodxAddressCmComponent } from './cmcustomer/cmcustomer-detail/codx-address-cm/codx-address-cm.component';
import { LeadsComponent } from './leads/leads.component';
import { PopupAddLeadComponent } from './leads/popup-add-lead/popup-add-lead.component';
import { TabLeadDetailComponent } from './leads/lead-detail/tab-lead-detail/tab-lead-detail.component';
import { LeadDetailComponent } from './leads/lead-detail/lead-detail.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { PopupAddCampaignComponent } from './campaigns/popup-add-campaign/popup-add-campaign.component';
import { PopupStatusCompetitorComponent } from './deals/deal-detail/codx-tab-dealcompetitors/popup-status-competitor/popup-status-competitor.component';
import { CampaignsDetailComponent } from './campaigns/campaigns-detail/campaigns-detail.component';
import { PopupConvertLeadComponent } from './leads/popup-convert-lead/popup-convert-lead.component';
import { CodxAsideCustomComponent } from './_layout/codx-aside-custom/codx-aside-custom.component';
import { PopupAddPaymentComponent } from './contracts/payment/popup-add-payment/popup-add-payment.component';
import { PopupAddPaymentHistoryComponent } from './contracts/payment/popup-add-payment-history/popup-add-payment-history.component';
import { PopupViewPaymentHistoryComponent } from './contracts/payment/popup-view-payment-history/popup-view-payment-history.component';
import { PopupMergeLeadsComponent } from './leads/popup-merge-leads/popup-merge-leads.component';
import { ViewImgContactComponent } from './leads/popup-merge-leads/view-img-contact/view-img-contact.component';
import { PopupRemoveAddContactComponent } from './leads/popup-merge-leads/popup-remove-add-contact/popup-remove-add-contact.component';
import { ViewPaymentComponent } from './contracts/payment/view-payment/view-payment.component';
import { CasesDetailComponent } from './cases/case-detail/cases-detail.component';
import { GanttChartComponent } from './deals/gantt-chart/gantt-chart.component';
import { TabCasesDetailComponent } from './cases/case-detail/tab-cases-detail/tab-cases-detail.component';
import { PopupAddCasesComponent } from './cases/popup-add-cases/popup-add-cases.component';
import { StepTaskComponent } from './deals/step-task/step-task.component';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { QuotationsTabViewComponent } from './quotations/quotations-tab-view/quotations-tab-view.component';
import { ContractsComponent } from './contracts/contracts.component';
import { ContractsViewDetailComponent } from './contracts/contracts-view-detail/contracts-view-detail.component';
import { TaskComponent } from './deals/step-task/task/task.component';
import { PopupOwnerDealComponent } from './deals/popup-owner-deal/popup-owner-deal.component';
import { ViewIconGroupComponent } from './quotations/view-icon-group/view-icon-group.component';
import { CmDashboardComponent } from './cm-dashboard/cm-dashboard.component';
import { TargetsComponent } from './targets/targets.component';
import { PopupAddTargetComponent } from './targets/popup-add-target/popup-add-target.component';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { CoreModule } from '@core/core.module';
import { CodxTabCmComponent } from './codx-tab-cm/codx-tab-cm.component';
import {
  TreeMapAllModule,
  TreeMapModule,
} from '@syncfusion/ej2-angular-treemap';
import {
  CategoryService,
  LineSeriesService,
} from '@syncfusion/ej2-angular-charts';
import { ViewTreeTargetsComponent } from './targets/view-tree-targets/view-tree-targets.component';
import { PopupAssginDealComponent } from './deals/popup-assgin-deal/popup-assgin-deal.component';
import { InstanceDashboardComponent } from './deals/instance-dashboard/instance-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'customers/:funcID',
        component: CmCustomerComponent,
        data: { noReuse: true },
      },
      {
        path: 'deals/:funcID',
        component: DealsComponent,
      },
      {
        path: 'marketings/:funcID',
        component: CampaignsComponent,
      },
      {
        path: 'quotations/:funcID',
        component: QuotationsComponent,
        // data: { noReuse: true },
      },
      {
        path: 'contracts/:funcID',
        component: ContractsComponent,
      },
      {
        path: 'cases/:funcID',
        component: CasesComponent,
      },
      {
        path: 'leads/:funcID',
        component: LeadsComponent,
      },
      {
        path: 'dashboard/:funcID',
        component: CmDashboardComponent,
      },
      {
        path: 'targets/:funcID',
        component: TargetsComponent,
        data: { noReuse: true },
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },

  {
    path: '',
    loadChildren: () =>
      import('./settings/settings.module').then((m) => m.SettingsCmModule),
  },
];

const T_Component: Type<any>[] = [
  CodxCmComponent,
  LayoutComponent,
  CmCustomerComponent,
  CmCustomerDetailComponent,
  InformationComponent,
  PopupAddCmCustomerComponent,
  PopupAddressComponent,
  ViewListCmComponent,
  PopupListContactsComponent,
  PopupQuickaddContactComponent,
  QuotationsComponent,
  PopupAddQuotationsComponent,
  DealsComponent,
  PopupAddDealComponent,
  DealDetailComponent,
  TabDetailCustomComponent,
  AddContractsComponent,
  ListContractsComponent,
  QuotationsLinesComponent,
  PopupAddQuotationsLinesComponent,
  CodxListContactsComponent,
  CodxListDealsComponent,
  CodxTabDealcompetitorsComponent,
  PopupAddDealcompetitorComponent,
  ViewDealcompetitorsComponent,
  QuotationsViewDetailComponent,
  CasesComponent,
  CasesDetailComponent,
  PopupAddCasesComponent,
  TabCasesDetailComponent,
  CodxAddressCmComponent,
  LeadsComponent,
  PopupAddLeadComponent,
  TabLeadDetailComponent,
  LeadDetailComponent,
  CampaignsComponent,
  PopupAddCampaignComponent,
  PopupStatusCompetitorComponent,
  CampaignsDetailComponent,
  PopupConvertLeadComponent,
  ContractsComponent,
  // CustomergroupsComponent,
  // PopupAddCustgroupComponent,
  //test
  CodxAsideCustomComponent,
  PopupAddPaymentComponent,
  PopupAddPaymentHistoryComponent,
  PopupViewPaymentHistoryComponent,
  PopupMergeLeadsComponent,
  ViewImgContactComponent,
  PopupRemoveAddContactComponent,
  ViewPaymentComponent,
  GanttChartComponent,
  StepTaskComponent,
  QuotationsTabViewComponent,
  ContractsViewDetailComponent,
  TaskComponent,
  PopupOwnerDealComponent,
  ViewIconGroupComponent,
  CmDashboardComponent,
  TargetsComponent,
  PopupAddTargetComponent,
  CodxTabCmComponent,
  ViewTreeTargetsComponent,
  PopupAssginDealComponent,
  InstanceDashboardComponent,
];

@NgModule({
  declarations: [T_Component],
  imports: [
    CodxCoreModule.forRoot({ environment }),
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ChartAllModule,
    AccumulationChartAllModule,
    ProgressBarAllModule,
    TabModule,
    CodxShareModule,
    CodxReportModule,
    NgbModule,
    SliderModule,
    DragDropModule,
    CoreModule,
    CommonModule,
    TreeMapModule,
    TreeMapAllModule,
    ChartModule,
  ],
  exports: [RouterModule],
  providers: [
    AccumulationTooltipService,
    CategoryService,
    LineSeriesService,
    BubbleSeriesService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxCmModule {
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
