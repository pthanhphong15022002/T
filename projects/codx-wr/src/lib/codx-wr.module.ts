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
import { PopupAddServicetagComponent } from './warranties/popup-add-warranty/popup-add-servicetag/popup-add-servicetag.component';
import { PopupUpdateReasonCodeComponent } from './warranties/popup-update-reasoncode/popup-update-reasoncode.component';
import { ViewDetailWrComponent } from './warranties/view-detail-wr/view-detail-wr.component';
import { PopupAssignEngineerComponent } from './warranties/popup-assign-engineer/popup-assign-engineer.component';
import { ViewTabUpdateComponent } from './warranties/view-detail-wr/view-tab-update/view-tab-update.component';

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
