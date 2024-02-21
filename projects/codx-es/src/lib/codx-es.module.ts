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
import { PopupAddAutoNumberComponent } from './setting/category/popup-add-auto-number/popup-add-auto-number.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { ViewDetailComponent } from './sign-file/view-detail/view-detail.component';
import { PopupAddSignFileComponent } from './sign-file/popup-add-sign-file/popup-add-sign-file.component';
import { ApprovalStepComponent } from './setting/approval-step/approval-step.component';
import { PopupSignatureComponent } from './setting/signature/popup-signature/popup-signature.component';
//import { PopupAddEmailTemplateComponent } from './setting/approval-step/popup-add-email-template/popup-add-email-template.component';
import { SettingComponent } from './setting/setting.component';
import { PopupADRComponent } from './sign-file/popup-adr/popup-adr.component';
import { PopupSignForApprovalComponent } from './sign-file/popup-sign-for-approval/popup-sign-for-approval.component';
import { ViewApprovalProcessComponent } from './setting/view-approval-process/view-approval-process.component';
import { ListViewAllModule } from '@syncfusion/ej2-angular-lists';
import { LayoutNoAsideComponent } from 'projects/codx-common/src/lib/_layout/_noAside/_noAside.component';
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
import { PopupConfirmSaveLabelComponent } from './sign-file/popup-select-label/popup-confirm-save-label/popup-confirm-save-label.component';
import { PopupCommentComponent } from './sign-file/popup-comment/popup-comment.component';
import { PopupAddSegmentComponent } from './setting/category/popup-add-segment/popup-add-segment.component';
import { DynamicFormComponent } from 'projects/codx-share/src/lib/components/dynamic-form/dynamic-form.component';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { ApprovalStepSignComponent } from './sign-file/approval-step/approval-step.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { LayoutComponent } from 'projects/codx-share/src/lib/components/layout/layout.component';
import { PopupAddTemplateSignFileComponent } from './template-sign-file/popup-add-template-sign-file.component';
import { DealsComponent } from 'projects/codx-cm/src/lib/deals/deals.component';
import { CasesComponent } from 'projects/codx-cm/src/lib/cases/cases.component';
import { LeadsComponent } from 'projects/codx-cm/src/lib/leads/leads.component';
import { ViewInstancesComponent } from 'projects/codx-dp/src/lib/view-instances/view-instances.component';
import { ContractsComponent } from 'projects/codx-cm/src/lib/contracts/contracts.component';
import { PopupSupplierComponent } from './sign-file/popup-sign-for-approval/popup-supplier/popup-supplier.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'report/:funcID',
        component: CodxReportViewsComponent,
      },
      {
        path: 'report/detail/:funcID',
        component: CodxReportViewDetailComponent,
      },
      {
        path: 'signfiles/:funcID',
        data: { noReuse: true },
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
        data: { noReuse: true },
        loadChildren: () =>
          import('projects/codx-es/src/lib/codx-approvel.module').then(
            (m) => m.ApprovelModule
          ),
      },
      {
        path: 'share/dynamic/:funcID',
        component: DynamicFormComponent,
      },
      {
        path: 'set',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./setting/setting-routing.modules').then(
            (m) => m.SettingRoutingModule
          ),
      },
      //----phát hành quy trình DP-CRM----//
      {
        path: 'deals/:funcID',
        component: DealsComponent,
        data: { noReuse: true },
      },
      {
        path: 'cases/:funcID',
        component: CasesComponent,
        data: { noReuse: true },
      },
      {
        path: 'leads/:funcID',
        component: LeadsComponent,
        data: { noReuse: true },
      },
      {
        path: 'contracts/:funcID',
        component: ContractsComponent,
        data: { noReuse: true },
      },
      {
        path: 'instances/:funcID/:processID',
        component: ViewInstancesComponent,
        data: { noReuse: true },
      },
      //-----------end--------------//

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
        data: { noReuse: true },
      },
    ],
  },
];
@NgModule({
  declarations: [
    DashboardComponent,
    CodxEsComponent,
    PopupAddSignatureComponent,
    PopupAddAutoNumberComponent,
    PopupAddCategoryComponent,
    PopupAddSignFileComponent,
    //PopupAddEmailTemplateComponent,
    ApprovalStepComponent,
    ViewDetailComponent,
    SignFileComponent,
    PopupSignatureComponent,
    SignatureComponent,
    SettingComponent,
    PopupADRComponent,
    PopupSignForApprovalComponent,
    PopupSupplierComponent,
    ViewApprovalProcessComponent,
    ESApprovelComponent,
    SearchingComponent,
    PopupCaPropsComponent,
    ESTemplateComponent,
    PopupSelectLabelComponent,
    ExternalSigningComponent,
    PopupAddApproverComponent,
    WarningMissImgComponent,
    PopupConfirmSaveLabelComponent,
    PopupCommentComponent,
    PopupAddSegmentComponent,
    ApprovalStepSignComponent,
    PopupAddTemplateSignFileComponent,
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
    ProgressBarModule,
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
