import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '@core/core.module';

import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { ApproveDetailComponent } from './approve/approve-detail/approve-detail.component';
import { ApproveComponent } from './approve/approve.component';
import { CodxWpComponent } from './codx-wp.component';
import { CompanyInforComponent } from './company-infor/company-infor.component';
import { PopupEditComponent } from './company-infor/popup-edit/popup-edit/popup-edit.component';
import { NewsComponent } from './news/news.component';
import { PopupAddComponent } from './news/popup/popup-add/popup-add.component';
import { ElecticSearchComponent } from './news/popup/popup-search/electic-search/electic-search.component';
import { PopupSearchComponent } from './news/popup/popup-search/popup-search.component';
import { ViewDetailComponent } from './news/view-detail/view-detail.component';
import { LayoutComponent } from './_layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path:'companyinfo/:funcID',
        component: CompanyInforComponent
      },
      {
        path:'approvals/:funcID',
        component: ApproveComponent
      },
      {
        path:':category/:funcID',
        component: NewsComponent
      },
      {
        path:':category/view-detail/:recID/:funcID',
        component: ViewDetailComponent
      },
      
      {
        path:'',
        redirectTo:'news/WPT02',
        pathMatch: 'full'
      }
    ],
  },
];

const Component: Type<any>[] = 
[
  LayoutComponent, 
  CodxWpComponent,
  NewsComponent,
  PopupAddComponent,
  ViewDetailComponent,
  CompanyInforComponent,
  PopupEditComponent,
  ApproveComponent,
  PopupSearchComponent,
  ElecticSearchComponent,
  ApproveDetailComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    HttpClientModule,
    CodxCoreModule,
    CodxShareModule,
    CoreModule,
    RouterModule.forChild(routes),
    
  ],
  exports: [
    RouterModule
  ],
  declarations: Component,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxWpModule {
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
