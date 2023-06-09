
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodxOmComponent } from './codx-om.component';
import { LayoutComponent } from './_layout/layout.component';
import { OKRComponent } from './okr/okr.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportsComponent } from './reports/reports.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { PopupAddKRComponent } from './popup/popup-add-kr/popup-add-kr.component';
import { OkrTargetsComponent } from './okr/okr-targets/okr-targets.component';
import { OkrReviewsComponent } from './okr/okr-reviews/okr-reviews.component';
import { PopupSaveVersionComponent } from './popup/popup-save-version/popup-save-version.component';
import { PopupShowKRComponent } from './popup/popup-show-kr/popup-show-kr.component';
import { PopupCheckInComponent } from './popup/popup-check-in/popup-check-in.component';
import { PopupOKRWeightComponent } from './popup/popup-okr-weight/popup-okr-weight.component';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { PopupShowOBComponent } from './popup/popup-show-ob/popup-show-ob.component';
import { PopupDistributeOKRComponent } from './popup/popup-distribute-okr/popup-distribute-okr.component';
import { PopupAssignmentOKRComponent } from './popup/popup-assignment-okr/popup-assignment-okr.component';
import { OkrTreesComponent } from './okr/okr-trees/okr-trees.component';
import { PopupAddOBComponent } from './popup/popup-add-ob/popup-add-ob.component';
import { PopupAddOKRPlanComponent } from './popup/popup-add-okr-plan/popup-add-okr-plan.component';
import { PopupShareOkrPlanComponent } from './popup/popup-share-okr-plans/popup-share-okr-plans.component';
import { ViewOKRComponent } from './component/view-okr/view-okr.component';
import {
  ProgressAnnotationService,
  ProgressBarModule,
} from '@syncfusion/ej2-angular-progressbar';
import { PopupAddRoleComponent } from './popup/popup-add-role/popup-add-role.component';
import { AccumulationChartModule, AccumulationTooltipService } from '@syncfusion/ej2-angular-charts';
import { PopupViewVersionComponent } from './popup/popup-view-version/popup-view-version.component';
import { PopupAddVersionComponent } from './popup/popup-add-version/popup-add-version.component';
import { PopupViewOKRLinkComponent } from './popup/popup-view-okr-link/popup-view-okr-link.component';
import { PopupCheckInHistoryComponent } from './popup/popup-check-in-history/popup-check-in-history.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';

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
        path: 'okr/:funcID',
        component: OKRComponent,
      },
      {
        path: 'dashboard/:funcID',
        component: DashboardComponent,
      },
      {
        path: 'reports/:funcID',
        component: ReportsComponent,
      },
      {
        path: 'reviews/:funcID',
        component: ReviewsComponent,
      },
      {
        path: '',
        redirectTo: 'home',
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
    CodxOmComponent,
    OKRComponent,
    DashboardComponent,
    ReportsComponent,
    ReviewsComponent,
    PopupAddKRComponent,
    PopupAddOBComponent,
    PopupShowKRComponent,
    PopupShowOBComponent,
    PopupDistributeOKRComponent,
    PopupAssignmentOKRComponent,
    OkrTargetsComponent,
    OkrReviewsComponent,
    PopupCheckInComponent,
    PopupSaveVersionComponent,
    PopupViewVersionComponent,
    PopupAddVersionComponent,
    PopupOKRWeightComponent,
    PopupShareOkrPlanComponent,
    OkrTreesComponent,
    PopupAddOKRPlanComponent,
    ViewOKRComponent,
    PopupAddRoleComponent,
    PopupViewOKRLinkComponent,
    PopupCheckInHistoryComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CodxShareModule,
    CircularGaugeModule,
    ProgressBarModule,
    AccumulationChartModule,
  ],
  exports: [RouterModule],
  providers: [ProgressAnnotationService, AccumulationTooltipService],
})
export class CodxOmModule {}
