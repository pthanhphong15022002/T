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
