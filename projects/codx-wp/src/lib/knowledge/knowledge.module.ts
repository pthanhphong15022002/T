import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '@core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { LayoutComponent } from './_layout/layout/layout.component';
import { KnowledgeComponent } from './knowledge.component';
import { NewComponent } from './new/new.component';
import { PopupAddKnowledgeComponent } from './popup/popup-add-knowledge/popup-add-knowledge.component';

const routes:Routes = [
  {
    path: '',
    component: LayoutComponent,
    children:[
      {
        path: 'knowledge/:funcID',
        component: KnowledgeComponent
      },
      {
        path: 'knowledge/:funcID/:category',
        component: KnowledgeComponent
      },
      {
        path: 'news/:funcID/:category',
        component: NewComponent
      },
      {
        path: '**',
        redirectTo: 'wp4/knowledge/WP401/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'wp4/knowledge/WP401/home',
    pathMatch: 'full'
  }
]

const Component: Type<any>[] = [
  LayoutComponent,
  KnowledgeComponent,
  PopupAddKnowledgeComponent,
  NewComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    CodxCoreModule,
    CodxShareModule,
    LazyLoadImageModule,
    NgbModule,
    CoreModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  declarations: [Component],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxKnowledgeModule {
  public static forRoot(config?: EnvironmentConfig): ModuleWithProviders<CodxCoreModule> 
  {
    return {
      ngModule: CodxCoreModule,
      providers: [HttpClientModule,{ provide: EnvironmentConfig, useValue: config }]
    };
  }
}