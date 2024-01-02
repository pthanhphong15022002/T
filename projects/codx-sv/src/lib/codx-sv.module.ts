import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule,
  Type,
} from '@angular/core';
import { CoreModule } from '@core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { LayoutComponent } from './_layout/layout.component';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { InPlaceEditorModule } from '@syncfusion/ej2-angular-inplace-editor';
import { LayoutHomeComponent } from './_layout-home/layout-home.component';
import { FormsModule } from '@angular/forms';
import { AnswersComponent } from './add-survey/answers/answers.component';
import { SettingComponent } from './add-survey/setting/setting.component';
import { PopupQuestionOtherComponent } from './add-survey/questions/template-survey-other.component/popup-question-other/popup-question-other.component';
import { TemplateSurveyOtherComponent } from './add-survey/questions/template-survey-other.component/template-survey-other.component';
import { SortSessionComponent } from './add-survey/questions/sort-session/sort-session.component';
import { PopupUploadComponent } from './add-survey/questions/popup-upload/popup-upload.component';
import { AddSurveyComponent } from './add-survey/add-survey.component';
import { QuestionsComponent } from './add-survey/questions/questions.component';
import { ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { ReviewComponent } from './add-survey/review/review.component';
import { NgxCaptureModule } from 'ngx-capture';
import { CopylinkComponent } from './copylink/copylink.component';
import { SearchSuggestionsComponent } from './home/search-suggestions/search-suggestions.component';
import { AccordionModule } from '@syncfusion/ej2-angular-navigations';
import { SharelinkComponent } from './sharelink/sharelink.component';
import { ViewFileComponent } from './add-survey/questions/view-file/view-file.component';
import { PopupViewFileComponent } from './add-survey/questions/view-file/popup-view-file/popup-view-file.component';
import { CarouselAllModule } from '@syncfusion/ej2-angular-navigations';
import { PopupViewFileFullComponent } from './add-survey/questions/view-file/popup-view-file/popup-view-file-full/popup-view-file-full.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { DealsComponent } from 'projects/codx-cm/src/lib/deals/deals.component';
import { CasesComponent } from 'projects/codx-cm/src/lib/cases/cases.component';
import { LeadsComponent } from 'projects/codx-cm/src/lib/leads/leads.component';
import { ViewInstancesComponent } from 'projects/codx-dp/src/lib/view-instances/view-instances.component';
import { ContractsComponent } from 'projects/codx-cm/src/lib/contracts/contracts.component';
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'add-survey',
        component: AddSurveyComponent,
      },
      {
        path: 'review',
        component: ReviewComponent,
      },
      {
        path: 'report/:funcID',
        component: CodxReportViewsComponent,
      },
      {
        path: 'report/detail/:funcID',
        component: CodxReportViewDetailComponent,
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
    ],
  },
  {
    path: '',
    component: LayoutHomeComponent,
    children: [
      {
        path: 'surveys/:funcID',
        component: HomeComponent,
      },
    ],
  },
];

const Component: Type<any>[] = [
  LayoutComponent,
  LayoutHomeComponent,
  HomeComponent,
  AddSurveyComponent,
  PopupUploadComponent,
  SortSessionComponent,
  TemplateSurveyOtherComponent,
  PopupQuestionOtherComponent,
  SettingComponent,
  AnswersComponent,
  QuestionsComponent,
  ReviewComponent,
  CopylinkComponent,
  SearchSuggestionsComponent,
  SharelinkComponent,
  ViewFileComponent,
  PopupViewFileComponent,
  PopupViewFileFullComponent,
];

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    HttpClientModule,
    CodxCoreModule,
    CodxShareModule,
    CoreModule,
    NgbModule,
    InPlaceEditorModule,
    DragDropModule,
    FormsModule,
    ChartAllModule,
    NgxCaptureModule,
    AccordionModule,
    CarouselAllModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  declarations: Component,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxSVModule {
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
