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
import { PopupAddEmailTemplateComponent } from './setting/approval-step/popup-add-email-template/popup-add-email-template.component';
import { SettingComponent } from './setting/setting.component';
import { PopupADRComponent } from './sign-file/popup-adr/popup-adr.component';
import { PopupSignForApprovalComponent } from './sign-file/popup-sign-for-approval/popup-sign-for-approval.component';
import { ViewApprovalProcessComponent } from './setting/view-approval-process/view-approval-process.component';
import { ListViewAllModule } from '@syncfusion/ej2-angular-lists';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { ESApprovelComponent } from './sign-file/approval/approval.component';
import { SearchingComponent } from './searching/searching.component';
import {
  NgxExtendedPdfViewerModule,
  NgxExtendedPdfViewerService,
} from 'ngx-extended-pdf-viewer';
import { PopupCaPropsComponent } from './sign-file/popup-ca-props/popup-ca-props.component';
import { PopupAddSignatureComponent } from './setting/signature/popup-add-signature/popup-add-signature.component';
import { PopupAddCategoryComponent } from './setting/category/popup-add-category/popup-add-category.component';
import { ESTemplateComponent } from './templateHTML/template.component';
import { PopupSelectLabelComponent } from './sign-file/popup-select-label/popup-select-label.component';
import { ExternalSigningComponent } from './external-signing/external-signing.component';
import { PopupAddApproverComponent } from './setting/approval-step/popup-add-approver/popup-add-approver.component';
import { WarningMissImgComponent } from './sign-file/popup-sign-for-approval/warning-miss-img/warning-miss-img.component';

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
        path: 'home/:funcID',
        component: DashboardComponent,
      },
      {
        path: 'setting/:funcID',
        component: SettingComponent,
      },
      {
        path: 'searching/:funcID',
        component: SearchingComponent,
      },
      {
        path: 'template',
        component: ESTemplateComponent,
      },
      {
        path: 'approvals/:funcID',
        loadChildren: () =>
          import('projects/codx-es/src/lib/codx-approvel.module').then(
            (m) => m.ApprovelModule
          ),
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
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'signatures/:funcID',
        component: SignatureComponent,
      },
      {
        path: 'categories/:funcID',
        component: DocCategoryComponent,
      },
    ],
  },
];
@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    CodxEsComponent,
    PopupAddSignatureComponent,
    PopupAddAutoNumberComponent,
    PopupAddCategoryComponent,
    PopupAddSignFileComponent,
    PopupAddEmailTemplateComponent,
    ApprovalStepComponent,
    ViewDetailComponent,
    SignFileComponent,
    PopupSignatureComponent,
    SignatureComponent,
    SettingComponent,
    PopupADRComponent,
    PopupSignForApprovalComponent,
    ViewApprovalProcessComponent,
    ESApprovelComponent,
    SearchingComponent,
    PopupCaPropsComponent,
    ESTemplateComponent,
    PopupSelectLabelComponent,
    ExternalSigningComponent,
    PopupAddApproverComponent,
    WarningMissImgComponent,
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
    // PdfViewerAllModule,
    ListViewAllModule,
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
    //pdfService (NHBuu)
    // LinkAnnotationService,
    // BookmarkViewService,
    // MagnificationService,
    // ThumbnailViewService,
    // ToolbarService,
    // NavigationService,
    // AnnotationService,
    // TextSearchService,
    // TextSelectionService,
    // PrintService,
    // FormFieldsService,
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
