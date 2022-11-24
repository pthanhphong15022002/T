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
import { InlineSVGModule } from 'ng-inline-svg';
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

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'pop-add-survey',
        component: AddSurveyComponent,
      },
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
];

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    HttpClientModule,
    CodxCoreModule,
    CodxShareModule,
    CoreModule,
    NgbModule,
    InPlaceEditorModule,
    DragDropModule,
    FormsModule,
    ChartAllModule,
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
