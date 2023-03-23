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
import { PopupTaskComponent } from './task/popup-task/popup-task.component';
import { CrmCustomerComponent } from './crmcustomer/crmcustomer.component';
import { CrmcustomerDetailComponent } from './crmcustomer/crmcustomer-detail/crmcustomer-detail.component';
import { CodxShowTaskComponent } from './task/codx-show-task/codx-show-task.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CodxTaskComponent } from './task/codx-task/codx-task.component';
import { InformationComponent } from './crmcustomer/crmcustomer-detail/information/information.component';
import { PopupAddCrmcustomerComponent } from './crmcustomer/popup-add-crmcustomer/popup-add-crmcustomer.component';
import { PopupAddressComponent } from './crmcustomer/popup-address/popup-address.component';
import { PopupAddCrmcontactsComponent } from './crmcustomer/popup-add-crmcontacts/popup-add-crmcontacts.component';
import { ViewListCrmComponent } from './crmcustomer/view-list-crm/view-list-crm.component';
import { PopupListContactsComponent } from './crmcustomer/popup-add-crmcustomer/popup-list-contacts/popup-list-contacts.component';
import { PopupQuickaddContactComponent } from './crmcustomer/popup-add-crmcustomer/popup-quickadd-contact/popup-quickadd-contact.component';
import { CodxTableComponent } from './task/codx-table/codx-table.component';
import { OpportunityComponent } from './opportunity/opportunity.component';
import { OpportunityDetailComponent } from './opportunity/opportunity-detail/opportunity-detail.component';
import { TabDetailCustomComponent } from './opportunity/opportunity-detail/tab-detail-custom/tab-detail-custom.component';
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
        path: 'customermanagement/:funcID',
        component: CrmCustomerComponent,
      },
      {
        // gán tạm để làm UI
        path: 'opportunity/:funcID',
        component: OpportunityComponent,
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
    PopupTaskComponent,
    CrmCustomerComponent,
    CrmcustomerDetailComponent,
    CodxShowTaskComponent,
    InformationComponent,
    CodxTaskComponent,
    PopupAddCrmcustomerComponent,
    PopupAddressComponent,
    PopupAddCrmcontactsComponent,
    ViewListCrmComponent,
    PopupListContactsComponent,
    PopupQuickaddContactComponent,
    CodxTableComponent,
    OpportunityComponent,
    OpportunityDetailComponent,
    TabDetailCustomComponent,
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
