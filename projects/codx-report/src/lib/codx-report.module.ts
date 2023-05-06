import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { environment } from 'src/environments/environment';
import { CodxReportViewDetailComponent } from './codx-report-view-detail/codx-report-view-detail.component';
import { CodxReportViewsComponent } from './codx-report-views/codx-report-views.component';
import { CodxReportComponent } from './codx-report.component';
import { PopupAddReportComponent } from './popup-add-report/popup-add-report.component';
import { PopupEditParamComponent } from './popup-edit-param/popup-edit-param.component';
import { PopupParametersComponent } from './popup-parameters/popup-parameters.component';
import { CodxReportIframeComponent } from './report-iframe/report-iframe.component';
import { LayoutComponent } from './_layout/layout.component';


const routes: Routes = [
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'detail/:funcID',
        component: CodxReportViewDetailComponent,
      },
      {
        path: 'view/:funcID',
        component: CodxReportViewsComponent,
      },
      // {
      //   path: '',
      //   redirectTo: 'view/:funcID',
      //   pathMatch: 'full',
      // },
    ],
  },
];
@NgModule({
  declarations: [
    CodxReportComponent,
    LayoutComponent,
    PopupParametersComponent,
    PopupAddReportComponent,
    CodxReportIframeComponent,
    PopupEditParamComponent,
    CodxReportViewDetailComponent,
    CodxReportViewsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    CommonModule,
    SharedModule,
    TabModule,
    CodxShareModule,
  ],
  exports: [
    CodxReportComponent,
    PopupAddReportComponent,
    CodxReportIframeComponent,
    CodxReportViewDetailComponent,
    CodxReportViewsComponent
  ]
})
export class CodxReportModule {
  // public static forRoot(
  //   config?: EnvironmentConfig
  // ): ModuleWithProviders<CodxCoreModule> {
  //   return {
  //     ngModule: CodxCoreModule,
  //     providers: [
  //       HttpClientModule,
  //       { provide: EnvironmentConfig, useValue: config },
  //       DatePipe,
  //     ],
  //   };
  // }
 }
