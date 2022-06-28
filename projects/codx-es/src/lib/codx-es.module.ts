import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import {
  AccumulationChartAllModule,
  CategoryService,
  ChartAnnotationService,
  ChartModule,
  ColumnSeriesService,
  DateTimeService,
  LegendService,
  LineSeriesService,
  RangeColumnSeriesService,
  ScrollBarService,
  StackingColumnSeriesService,
  TooltipService,
} from '@syncfusion/ej2-angular-charts';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { AuthGuard, CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxEsComponent } from './codx-es.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DocCategoryComponent } from './setting/category/category.component';
import { SignatureComponent } from './setting/signature/signature.component';
import { MarkSignatureComponent } from './sign-file/mark-signature/mark-signature.component';
import { SignFileComponent } from './sign-file/sign-file.component';
import { LayoutComponent } from './_layout/layout.component';
import { PopupAddAutoNumberComponent } from './setting/category/popup-add-auto-number/popup-add-auto-number.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'signfiles/:funcID',
        component: SignFileComponent,
      },
      {
        path: 'signatures/:funcID',
        component: SignatureComponent,
      },
      {
        path: 'categories/:funcID',
        component: DocCategoryComponent,
      },
      {
        path: 'home/:funcID',
        component: DashboardComponent,
      },
      
      {
        path: 'mark',
        component: MarkSignatureComponent,
      },
      {
        path: 'setting',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./setting/setting-routing.modules').then(
            (m) => m.SettingRoutingModule
          ),
      },

      {
        path: '',
        redirectTo: 'signfiles',
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
  declarations: [LayoutComponent, DashboardComponent, CodxEsComponent, PopupAddAutoNumberComponent],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    CommonModule,
    AccumulationChartAllModule,
    ChartModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TabModule,
  ],
  exports: [CodxEsComponent],
  providers: [
    CategoryService,
    DateTimeService,
    ScrollBarService,
    LineSeriesService,
    ColumnSeriesService,
    ChartAnnotationService,
    RangeColumnSeriesService,
    StackingColumnSeriesService,
    LegendService,
    TooltipService,
  ],
})
export class CodxEsModule {
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
