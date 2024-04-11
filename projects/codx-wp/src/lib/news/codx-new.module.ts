import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '@core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { AppropvalNewsDetailComponent } from './appropval-news/appropval-news-detail/appropval-news-detail.component';
import { AppropvalNewsComponent } from './appropval-news/appropval-news.component';
import { LayoutNewsComponent } from './layout-news/layout-news.component';
import { NewsDetailComponent } from './news-detail/news-detail.component';
import { NewsComponent } from './news.component';
import { PopupAddComponent } from './popup/popup-add/popup-add.component';
import { PopupSearchComponent } from './popup/popup-search/popup-search.component';
import { NewsTagComponent } from './news-tag/view-tag.component';
import { ViewVideoComponent } from './view-video/view-video.component';
import { PopupAddCommentComponent } from './popup/popup-add-comment/popup-add-comment.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { LayoutComponent } from '../knowledge/_layout/layout/layout.component';
export const routes: Routes = [
  {
    path: 'news',
    component: LayoutNewsComponent,
    children: [
        {
        path: 'settings/:funcID',
        loadChildren: () =>
            import(
            'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting.module'
            ).then((m) => m.DynamicSettingModule),
        },
        {
          path: 'approvals/:funcID',
          data: { noReuse: true },
          component: AppropvalNewsComponent,
        },
        {
            path: ':funcID/:category',
            component: NewsComponent,
        },
        {
            path: ':funcID/tag/:tagName',
            component: NewsTagComponent,
        },
        {
            path: ':funcID/:category/:recID',
            component: NewsDetailComponent,
        },
        {
          path: '**',
          redirectTo: 'WPT02/home',
          pathMatch: 'full',
        },
        
    ]
  },
  {
    path: 'approvals',
    component: LayoutNewsComponent,
    children:[
      {
        path: ':funcID',
        data: { noReuse: true },
        component: AppropvalNewsComponent,
    },
    ]
  },
  {
    path: '**',
    redirectTo: 'news/WPT02/home',
    pathMatch: 'full',
  },
];

const Component: Type<any>[] = [
  LayoutNewsComponent,
  NewsComponent,
  NewsTagComponent,
  NewsDetailComponent,
  PopupAddComponent,
  PopupSearchComponent,
  ViewVideoComponent,
  AppropvalNewsComponent,
  AppropvalNewsDetailComponent,
  PopupAddCommentComponent,
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
export class CodxNewModule {
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
