import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '@core/core.module';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import { OrgorganizationComponent } from 'projects/codx-hr/src/lib/organization/organization.component';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { ApproveDetailComponent } from './approve/approve-detail/approve-detail.component';
import { ApproveComponent } from './approve/approve.component';
import { CodxWpComponent } from './codx-wp.component';
import { CompanyInforComponent } from './company-infor/company-infor.component';
import { CompanyEditComponent } from './company-infor/popup-edit/company-edit/company-edit.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddNoteComponent } from './dashboard/home/add-note/add-note.component';
import { PopupTitleComponent } from './dashboard/home/add-note/save-note/popup-title/popup-title.component';
import { SaveNoteComponent } from './dashboard/home/add-note/save-note/save-note.component';
import { HomeComponent } from './dashboard/home/home.component';
import { ListPostComponent } from './dashboard/home/list-post/list-post.component';
import { PopupAddPostComponent } from './dashboard/home/list-post/popup-add/popup-add.component';

import { PopupDetailComponent } from './dashboard/home/list-post/popup-detail/popup-detail.component';
import { PopupSavePostComponent } from './dashboard/home/list-post/popup-save/popup-save.component';
import { MyTeamComponent } from './dashboard/home/my-team/my-team.component';
import { PostComponent } from './dashboard/home/post/post.component';
import { UpdateNotePinComponent } from './dashboard/home/update-note-pin/update-note-pin.component';
import { NewsComponent } from './news/news.component';
import { PopupAddComponent } from './news/popup/popup-add/popup-add.component';
import { PopupEditComponent } from './news/popup/popup-edit/popup-edit.component';
import { PopupSearchComponent } from './news/popup/popup-search/popup-search.component';
import { ViewDetailComponent } from './news/view-detail/view-detail.component';
import { ViewTagComponent } from './news/view-tag/view-tag.component';
import { ViewVideoComponent } from './news/view-video/view-video.component';
import { LayoutComponent } from './_layout/layout.component';
import { Layout2Component } from './_layout2/layout2.component';
import { Layout3Component } from './_layout3/layout3.component';

export const routes: Routes = [
  
  {
    path: 'companyinfo',
    component: Layout3Component,
    children: [
      {
        path: ':funcID',
        component: CompanyInforComponent
      },
      {
        path: '**',
        redirectTo: 'companyinfo/WPT01P',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'orgchartportal',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: ':funcID',
        component: OrgorganizationComponent,
      },
      {
        path: '**',
        redirectTo: 'orgchartportal/WPT04',
        pathMatch: 'full'
      }
    ],
  },
  {
    path: 'news',
    component: Layout2Component,
    children: [
      {
        path: ':funcID/tag/:tagName',
        component: ViewTagComponent
      },
      {
        path: ':funcID/:category',
        component: NewsComponent
      },
      
      {
        path: ':funcID/:category/:recID',
        component: ViewDetailComponent
      },
      
      {
        path: '**',
        redirectTo: 'WPT02P/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path:'approvals',
    component: Layout3Component,
    children:[
      {
        path:':funcID',
        component: ApproveComponent,     
      },
      {
        path: '**',
        redirectTo: 'approvals/WPT0211',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'portal',
    component: DashboardComponent,
    children: [
      {
        path: ':funcID',
        component: HomeComponent
      },
      {
        path: '**',
        redirectTo: 'portal/WP',
        pathMatch: 'full'
      }
    ],
  },
  {
    path: '',
    redirectTo: 'portal/WP',
    pathMatch: 'full'
  }
];

const Component: Type<any>[] =
  [
    LayoutComponent,
    Layout2Component,
    Layout3Component,
    CodxWpComponent,
    NewsComponent,
    PopupAddComponent,
    ViewDetailComponent,
    CompanyInforComponent,
    PopupEditComponent,
    ApproveComponent,
    ApproveDetailComponent,
    DashboardComponent,
    HomeComponent,
    AddNoteComponent,
    SaveNoteComponent,
    PostComponent,
    ListPostComponent,
    PopupAddPostComponent,
    PopupSavePostComponent,
    MyTeamComponent,
    UpdateNotePinComponent,
    ViewVideoComponent,
    PopupDetailComponent,
    CompanyEditComponent,
    PopupTitleComponent,
    ViewTagComponent,
    PopupSearchComponent

  ];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    HttpClientModule,
    CodxCoreModule,
    CodxShareModule,
    NgbModule,
    CoreModule,
    PickerModule,
    RouterModule.forChild(routes),

  ],
  exports: [
    RouterModule,
    ListPostComponent
  ],
  declarations: Component,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxWpModule {
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
