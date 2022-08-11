import { CommonModule, DatePipe } from '@angular/common';
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
import { SignFileComponent } from './sign-file/sign-file.component';
import { LayoutComponent } from './_layout/layout.component';
import { PopupAddAutoNumberComponent } from './setting/category/popup-add-auto-number/popup-add-auto-number.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { ViewDetailComponent } from './sign-file/view-detail/view-detail.component';
import { PopupAddSignFileComponent } from './sign-file/popup-add-sign-file/popup-add-sign-file.component';
import { ApprovalStepComponent } from './setting/approval-step/approval-step.component';
import { PopupSignatureComponent } from './setting/signature/popup-signature/popup-signature.component';
import {
  LinkAnnotationService,
  BookmarkViewService,
  MagnificationService,
  ThumbnailViewService,
  ToolbarService,
  NavigationService,
  TextSearchService,
  TextSelectionService,
  PrintService,
  AnnotationService,
  FormFieldsService,
  PdfViewerModule,
} from '@syncfusion/ej2-angular-pdfviewer';
import { PopupAddEmailTemplateComponent } from './setting/approval-step/popup-add-email-template/popup-add-email-template.component';
import { SettingComponent } from './setting/setting.component';
import { PdfViewComponent } from './sign-file/pdf-view/pdf-view.component';
import { PopupADRComponent } from './sign-file/popup-adr/popup-adr.component';
import { PopupSignForApprovalComponent } from './sign-file/popup-sign-for-approval/popup-sign-for-approval.component';

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
        path: 'pdf/:funcID',
        component: PopupSignForApprovalComponent,
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
        path: 'setting/:funcID',
        component: SettingComponent,
      },
      {
        path: 'set',
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
  declarations: [
    LayoutComponent,
    DashboardComponent,
    CodxEsComponent,
    PopupAddAutoNumberComponent,
    PopupAddSignFileComponent,
    PopupAddEmailTemplateComponent,
    ApprovalStepComponent,
    ViewDetailComponent,
    SignFileComponent,
    PopupSignatureComponent,
    SignatureComponent,
    SettingComponent,
    PdfViewComponent,
    PopupADRComponent,
    PopupSignForApprovalComponent,
  ],
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
    CodxShareModule,
    PdfViewerModule,
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
    //pdfService (NQBuu)
    LinkAnnotationService,
    BookmarkViewService,
    MagnificationService,
    ThumbnailViewService,
    ToolbarService,
    NavigationService,
    AnnotationService,
    TextSearchService,
    TextSelectionService,
    PrintService,
    FormFieldsService,
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
        DatePipe,
      ],
    };
  }
}
