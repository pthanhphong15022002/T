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
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { SharedModule } from '@shared/shared.module';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { CmCustomerComponent } from './cmcustomer/cmcustomer.component';
import { CmcustomerDetailComponent } from './cmcustomer/cmcustomer-detail/cmcustomer-detail.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { InformationComponent } from './cmcustomer/cmcustomer-detail/information/information.component';
import { PopupAddCmCustomerComponent } from './cmcustomer/popup-add-cmcustomer/popup-add-cmcustomer.component';
import { PopupAddressComponent } from './cmcustomer/cmcustomer-detail/codx-address-cm/popup-address/popup-address.component';
import { ViewListCmComponent } from './cmcustomer/view-list-cm/view-list-cm.component';
import { PopupListContactsComponent } from './cmcustomer/cmcustomer-detail/codx-list-contacts/popup-list-contacts/popup-list-contacts.component';
import { PopupQuickaddContactComponent } from './cmcustomer/cmcustomer-detail/codx-list-contacts/popup-quickadd-contact/popup-quickadd-contact.component';
import { QuotationsComponent } from './quotations/quotations.component';
import { PopupAddQuotationsComponent } from './quotations/popup-add-quotations/popup-add-quotations.component';
import { CodxDpModule } from 'projects/codx-dp/src/lib/codx-dp.module';
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
import { CodxComboboxComponent } from './contracts/component/codx-combobox/codx-combobox.component';
import { CodxTableComponent } from './contracts/component/codx-table/codx-table.component';
import { NoDataComponent } from './contracts/component/no-data/no-data.component';
import { ViewsContractsComponent } from './contracts/views-contracts/views-contracts.component';
import { ProductComponent } from './contracts/component/product/product.component';
import { CasesComponent } from './cases/cases.component';
import { CaseDetailComponent } from './cases/case-detail/case-detail.component';
import { PopupAddCaseComponent } from './cases/popup-add-case/popup-add-case.component';
import { TabCaseDetailComponent } from './cases/case-detail/tab-case-detail/tab-case-detail.component';
import { PaymentsComponent } from './contracts/component/payments/payments.component';
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

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'customers/:funcID',
        component: CmCustomerComponent,
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
          // gán tạm để làm UI
        path: 'contracts/:funcID',
        component: ViewsContractsComponent,
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
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

const T_Component: Type<any>[] = [LayoutComponent];

@NgModule({
  declarations: [
    CodxCmComponent,
    LayoutComponent,
    CmCustomerComponent,
    CmcustomerDetailComponent,
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
    ProductComponent,
    CodxTabDealcompetitorsComponent,
    PopupAddDealcompetitorComponent,
    ViewDealcompetitorsComponent,
    CodxComboboxComponent,
    CodxTableComponent,
    QuotationsViewDetailComponent,
    NoDataComponent,
    ViewsContractsComponent,
    CasesComponent,
    CaseDetailComponent,
    PopupAddCaseComponent,
    TabCaseDetailComponent,
    PaymentsComponent,
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
    //test
    CodxAsideCustomComponent
  ],
  imports: [
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
    CodxDpModule,
  ],
  exports: [RouterModule,ListContractsComponent],
  providers: [AccumulationTooltipService],
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
