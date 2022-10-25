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
import { AddSurveyComponent } from './add-survey/add-survey.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { InPlaceEditorModule } from '@syncfusion/ej2-angular-inplace-editor';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'surveys/:funcID',
        component: AddSurveyComponent,
      },
    ],
  },
];

const Component: Type<any>[] = [
  LayoutComponent,
  HomeComponent,
  AddSurveyComponent,
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
