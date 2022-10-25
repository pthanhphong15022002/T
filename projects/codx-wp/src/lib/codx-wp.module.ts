import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule,
  Type,
} from '@angular/core';
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
import { ChatListComponent } from './chatting/chat-list/chat-list.component';
import { ChatBoxComponent } from './chatting/chatbox/chat-box.component';
import { ChattingComponent } from './chatting/chatting.component';
import { ListChatBoxComponent } from './chatting/list-chat-box/list-chat-box.component';
import { PopupGroupComponent } from './chatting/popup-group/popup-group.component';
import { CodxWpComponent } from './codx-wp.component';
import { CompanyInforComponent } from './company-infor/company-infor.component';
import { CompanyEditComponent } from './company-infor/popup-edit/company-edit/company-edit.component';
import { AddNoteComponent } from './dashboard/home/add-note/add-note.component';
import { PopupTitleComponent } from './dashboard/home/add-note/save-note/popup-title/popup-title.component';
import { SaveNoteComponent } from './dashboard/home/add-note/save-note/save-note.component';
import { HomeComponent } from './dashboard/home/home.component';
import { ListPostComponent } from './dashboard/home/list-post/list-post.component';
import { PopupAddPostComponent } from './dashboard/home/list-post/popup-add/popup-add.component';

import { PopupDetailComponent } from './dashboard/home/list-post/popup-detail/popup-detail.component';
import { PopupSavePostComponent } from './dashboard/home/list-post/popup-save/popup-save.component';
import { PopupSearchPostComponent } from './dashboard/home/list-post/popup-search/popup-search.component';
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
import { LayoutOnlyHeaderComponent } from 'projects/codx-share/src/lib/_layout/_onlyHeader/_onlyHeader.component';
import { LayoutNewsComponent } from './layout-news/layout-news.component';
import { LayoutApprovalComponent } from './layout-approval/layout-approval.component';
import { LayoutPortalComponent } from './dashboard/layout-portal.component';

export const routes: Routes = [
  {
    path: 'portal',
    component: LayoutPortalComponent,
    children: [
      {
        path: ':funcID',
        component: HomeComponent,
      },
    ],
  },
  {
    path: 'chat',
    component: LayoutPortalComponent,
    children: [
      {
        path: ':funcID',
        component: ChattingComponent,
      },
    ],
  },
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
        path: ':funcID/tag/:tagName',
        component: ViewTagComponent,
      },
      {
        path: ':funcID/:category',
        component: NewsComponent,
      },
      {
        path: ':funcID/:category/:recID',
        component: ViewDetailComponent,
      },
      {
        path: ':funcID',
        redirectTo: 'WPT02/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'companyinfo',
    component: LayoutComponent,
    children: [
      {
        path: 'settings/:funcID',
        loadChildren: () =>
          import(
            'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting.module'
          ).then((m) => m.DynamicSettingModule),
      },
      {
        path: ':funcID',
        component: CompanyInforComponent,
      },
    ],
  },
  {
    path: 'approvals',
    component: LayoutApprovalComponent,
    children: [
      {
        path: ':funcID',
        component: ApproveComponent,
      },
    ],
  },
  {
    path: 'orgchartportal',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: ':funcID',
        component: OrgorganizationComponent,
      },
    ],
  },
  {
    path: 'wp/portal/wp',
    redirectTo: 'portal/WP',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'portal/WP',
    pathMatch: 'full',
  },

];

const Component: Type<any>[] =
  [
    LayoutComponent,
    LayoutNewsComponent,
    LayoutApprovalComponent,
    CodxWpComponent,
    NewsComponent,
    PopupAddComponent,
    ViewDetailComponent,
    CompanyInforComponent,
    PopupEditComponent,
    ApproveComponent,
    ApproveDetailComponent,
    LayoutPortalComponent,
    HomeComponent,
    AddNoteComponent,
    SaveNoteComponent,
    PostComponent,
    PopupAddPostComponent,
    PopupSavePostComponent,
    MyTeamComponent,
    UpdateNotePinComponent,
    ViewVideoComponent,
    PopupDetailComponent,
    CompanyEditComponent,
    PopupTitleComponent,
    ViewTagComponent,
    PopupSearchComponent,
    PopupSearchPostComponent,
    ChatListComponent,
    ChatBoxComponent,
    ListChatBoxComponent,
    PopupGroupComponent,
    ListPostComponent
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
  exports: [RouterModule],
  declarations: [Component, ChattingComponent, LayoutComponent],
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
