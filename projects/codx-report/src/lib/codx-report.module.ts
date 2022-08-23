import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { environment } from 'src/environments/environment';
import { CodxReportViewerComponent } from './codx-report-viewer/codx-report-viewer.component';
import { CodxReportComponent } from './codx-report.component';
import { PopupAddReportComponent } from './popup-add-report/popup-add-report.component';
import { PopupParametersComponent } from './popup-parameters/popup-parameters.component';
import { LayoutComponent } from './_layout/layout.component';


const routes: Routes = [
  {
    path: '',
    component: CodxReportViewerComponent,
    children: [
      {
        path: 'report-viewer/:funcID',
        component: CodxReportViewerComponent,
      },
      {
        path: '',
        redirectTo: 'report-viewer',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];
@NgModule({
  declarations: [
    CodxReportComponent,
    LayoutComponent,
    CodxReportViewerComponent,
    PopupParametersComponent,
    PopupAddReportComponent
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
    CodxReportViewerComponent,
    PopupAddReportComponent
  ]
})
export class CodxReportModule {
  public static forRoot(
    config?: EnvironmentConfig
  ): ModuleWithProviders<CodxCoreModule> {
    return {
      ngModule: CodxCoreModule,
      providers: [
        HttpClientModule,
        { provide: EnvironmentConfig, useValue: config },
        DatePipe,
      ],
    };
  }
 }
