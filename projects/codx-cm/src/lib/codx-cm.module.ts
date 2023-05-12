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
import { TestComponetComponent } from './test-componet/test-componet.component';
import { CmCustomerComponent } from './cmcustomer/cmcustomer.component';
import { CmcustomerDetailComponent } from './cmcustomer/cmcustomer-detail/cmcustomer-detail.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { InformationComponent } from './cmcustomer/cmcustomer-detail/information/information.component';
import { PopupAddCmCustomerComponent } from './cmcustomer/popup-add-cmcustomer/popup-add-cmcustomer.component';
import { PopupAddressComponent } from './cmcustomer/popup-address/popup-address.component';
import { ViewListCmComponent } from './cmcustomer/view-list-cm/view-list-cm.component';
import { PopupListContactsComponent } from './cmcustomer/popup-add-cmcustomer/popup-list-contacts/popup-list-contacts.component';
import { PopupQuickaddContactComponent } from './cmcustomer/popup-add-cmcustomer/popup-quickadd-contact/popup-quickadd-contact.component';
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
import { ProductComponent } from './contracts/product/product.component';
import { CodxTabDealcompetitorsComponent } from './deals/deal-detail/codx-tab-dealcompetitors/codx-tab-dealcompetitors.component';
import { PopupAddDealcompetitorComponent } from './deals/deal-detail/codx-tab-dealcompetitors/popup-add-dealcompetitor/popup-add-dealcompetitor.component';
import { ViewDealcompetitorsComponent } from './cmcustomer/cmcustomer-detail/view-dealcompetitors/view-dealcompetitors.component';
import { QuotationsViewDetailComponent } from './quotations/quotations-view-detail/quotations-view-detail.component';
import { CodxComboboxComponent } from './contracts/component/codx-combobox/codx-combobox.component';
import { CodxTableComponent } from './contracts/component/codx-table/codx-table.component';
import { NoDataComponent } from './contracts/component/no-data/no-data.component';
import { CasesComponent } from './cases/cases.component';
import { CaseDetailComponent } from './cases/case-detail/case-detail.component';
import { PopupAddCaseComponent } from './cases/popup-add-case/popup-add-case.component';
import { TabCaseDetailComponent } from './cases/case-detail/tab-case-detail/tab-case-detail.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'test/:funcID',
        component: TestComponetComponent,
      },
      {
        path: 'customers/:funcID',
        component: CmCustomerComponent,
      },
      {
        path: 'deals/:funcID',
        component: DealsComponent,
      },
      {
        path: 'quotations/:funcID',
        component: QuotationsComponent,
      },
      {
        path: 'cases/:funcID',
        component: CasesComponent,
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
    TestComponetComponent,
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
    CasesComponent,
    CaseDetailComponent,
    PopupAddCaseComponent,
    TabCaseDetailComponent,
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
  exports: [RouterModule],
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
