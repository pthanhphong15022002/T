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
import { OrgorganizationComponent } from 'projects/codx-hr/src/lib/organization/organization.component';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { ApproveDetailComponent } from './approve/approve-detail/approve-detail.component';
import { ApproveComponent } from './approve/approve.component';
import { CodxWpComponent } from './codx-wp.component';
import { CompanyInforComponent } from './company-infor/company-infor.component';
import { CompanyEditComponent } from './company-infor/popup-edit/company-edit/company-edit.component';
import { AddNoteComponent } from './dashboard/home/add-note/add-note.component';
import { PopupTitleComponent } from './dashboard/home/add-note/save-note/popup-title/popup-title.component';
import { SaveNoteComponent } from './dashboard/home/add-note/save-note/save-note.component';
import { HomeComponent } from './dashboard/home/home.component';
import { PopupDetailComponent } from './dashboard/home/list-post/popup-detail/popup-detail.component';
import { PopupSavePostComponent } from './dashboard/home/list-post/popup-save/popup-save.component';
import { PopupSearchPostComponent } from './dashboard/home/list-post/popup-search/popup-search.component';
import { MyTeamComponent } from './dashboard/home/my-team/my-team.component';
import { PostComponent } from './dashboard/home/post/post.component';
import { UpdateNotePinComponent } from './dashboard/home/update-note-pin/update-note-pin.component';
import { LayoutComponent } from './_layout/layout.component';
import { LayoutApprovalComponent } from './layout-approval/layout-approval.component';
import { LayoutPortalComponent } from './dashboard/layout-portal.component';
import { PopupAddPostComponent } from './dashboard/home/list-post/popup-add/popup-add-post.component';
import { CodxCalendarComponent } from 'projects/codx-share/src/lib/components/codx-calendar/codx-calendar.component';
import { PostShareComponent } from './dashboard/home/list-post/post-share/post-share.component';

export const routes: Routes = [
  {
    path: 'portal',
    component: LayoutPortalComponent,
    data: { noReuse: true },
    children: [
      {
        path: ':funcID',
        component: HomeComponent,
        data: { noReuse: true },
      },
    ]
    
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
        data: { noReuse: true },
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
        data: { noReuse: true },
      },
    ],
  },
  {
    path: 'calendar',
    component: LayoutComponent,
    children: [
      {
        path: ':funcID',
        component: CodxCalendarComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'portal/WP',
    data: { noReuse: true },
    pathMatch: 'full',
  },
  
];

const Component: Type<any>[] = [
  LayoutComponent,
  LayoutApprovalComponent,
  CodxWpComponent,
  CompanyInforComponent,
  LayoutPortalComponent,
  HomeComponent,
  AddNoteComponent,
  SaveNoteComponent,
  PostComponent,
  PopupSavePostComponent,
  MyTeamComponent,
  UpdateNotePinComponent,
  PopupDetailComponent,
  CompanyEditComponent,
  PopupTitleComponent,
  PopupSearchPostComponent,
  LayoutComponent,
  PopupAddPostComponent,
  ApproveComponent,
  ApproveDetailComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    HttpClientModule,
    CodxCoreModule,
    CodxShareModule,
    NgbModule,
    CoreModule,
    PickerModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  declarations: [Component],
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
