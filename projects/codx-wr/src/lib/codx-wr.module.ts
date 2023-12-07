import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { CodxWrComponent } from './codx-wr.component';
import { LayoutComponent } from './_layout/layout.component';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../../src/core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { environment } from 'src/environments/environment';
import { WarrantiesComponent } from './warranties/warranties.component';
import { ViewListWrComponent } from './warranties/view-list-wr/view-list-wr.component';
import { PopupAddWarrantyComponent } from './warranties/popup-add-warranty/popup-add-warranty.component';
import { PopupAddCustomerWrComponent } from './warranties/popup-add-warranty/popup-add-customerwr/popup-add-customerwr.component';
import { PopupAddServicetagComponent } from './warranties/popup-add-servicetag/popup-add-servicetag.component';
import { PopupUpdateReasonCodeComponent } from './warranties/popup-update-reasoncode/popup-update-reasoncode.component';
import { ViewDetailWrComponent } from './warranties/view-detail-wr/view-detail-wr.component';
import { PopupAssignEngineerComponent } from './warranties/popup-assign-engineer/popup-assign-engineer.component';
import { ViewTabUpdateComponent } from './warranties/view-detail-wr/view-tab-update/view-tab-update.component';
import { ViewTabPartsComponent } from './warranties/view-detail-wr/view-tab-parts/view-tab-parts.component';
import { ImportpartsComponent } from './importparts/importparts.component';
import { PopupDetailImportPartsComponent } from './importparts/popup-detail-import-parts/popup-detail-import-parts.component';
import { DealsComponent } from 'projects/codx-cm/src/lib/deals/deals.component';
import { CasesComponent } from 'projects/codx-cm/src/lib/cases/cases.component';
import { LeadsComponent } from 'projects/codx-cm/src/lib/leads/leads.component';
import { ViewInstancesComponent } from 'projects/codx-dp/src/lib/view-instances/view-instances.component';
import { FormatDatePipe } from './pipes/format-date.pipe';

var routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'warranties/:funcID',
        component: WarrantiesComponent,
        data: { noReuse: true },
      },
      {
        path: 'importparts/:funcID',
        component: ImportpartsComponent,
        data: { noReuse: true },
      },
      // //----phát hành quy trình DP-CRM----//
      // {
      //   path: 'deals/:funcID',
      //   component: DealsComponent,
      //   data: { noReuse: true },
      // },
      // {
      //   path: 'cases/:funcID',
      //   component: CasesComponent,
      //   data: { noReuse: true },
      // },
      // {
      //   path: 'leads/:funcID',
      //   component: LeadsComponent,
      //   data: { noReuse: true },
      // },
      // {
      //   path: 'instances/:funcID/:processID',
      //   component: ViewInstancesComponent,
      //   data: { noReuse: true },
      // },
      // //-----------end--------------//
    ],
  },
];
@NgModule({
  declarations: [
    LayoutComponent,
    CodxWrComponent,
    WarrantiesComponent,
    ViewListWrComponent,
    PopupAddWarrantyComponent,
    PopupAddCustomerWrComponent,
    PopupAddServicetagComponent,
    PopupUpdateReasonCodeComponent,
    ViewDetailWrComponent,
    PopupAssignEngineerComponent,
    ViewTabUpdateComponent,
    ViewTabPartsComponent,
    ImportpartsComponent,
    PopupDetailImportPartsComponent,
    FormatDatePipe
  ],
  imports: [
    CodxCoreModule.forRoot({ environment }),
    RouterModule.forChild(routes),
    SharedModule,
    CodxShareModule,
    NgbModule,
    CoreModule,
    CommonModule,
  ],
  exports: [RouterModule],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxWrModule {
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
