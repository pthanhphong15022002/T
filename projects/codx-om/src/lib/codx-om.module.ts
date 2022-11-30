import { PopupAddTaskComponent } from './popup/popup-add-task/popup-add-task.component';
import { PopupViewVersionComponent } from './popup/popup-view-version/popup-view-version.component';
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
import { OKRTasksComponent } from './okr/okr-tasks/okr-tasks.component';
import { OkrAddComponent } from './okr/okr-add/okr-add.component';
import { OkrToolbarComponent } from './okr/okr-toolbar/okr-toolbar.component';
import { PopupAddKRComponent } from './popup/popup-add-kr/popup-add-kr.component';
import { PopupDistributeKRComponent } from './popup/popup-distribute-kr/popup-distribute-kr.component';
import { OkrTargetsComponent } from './okr/okr-targets/okr-targets.component';
import { OkrEditComponent } from './okr/okr-edit/okr-edit.component';
import { OkrReviewsComponent } from './okr/okr-reviews/okr-reviews.component';
import { PopupSaveVersionComponent } from './popup/popup-save-version/popup-save-version.component';
import { PopupShowKRComponent } from './popup/popup-show-kr/popup-show-kr.component';
import { PopupCheckInComponent } from './popup/popup-check-in/popup-check-in.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
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
    OKRTasksComponent,
    PopupAddTaskComponent,
    OkrAddComponent,
    OkrToolbarComponent,
    PopupAddKRComponent,
    PopupShowKRComponent,
    PopupDistributeKRComponent,
    OkrTargetsComponent,
    OkrEditComponent,
    OkrReviewsComponent,
    OKRTasksComponent,
    PopupCheckInComponent,
    PopupSaveVersionComponent,
    PopupViewVersionComponent,
    OKRTasksComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CodxShareModule,
  ],
  exports: [RouterModule],
})
export class CodxOmModule {}
