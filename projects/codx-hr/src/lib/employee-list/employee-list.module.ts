import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HRLayoutOnlyHeaderComponent } from '../_layout_onlyHeader/_layout_onlyHeader.component';
import { EmployeeInfoProfileComponent } from './employee-info-profile/employee-info-profile.component';
import { DialogReviewLeaveApproveComponent } from './employee-info-profile/components/pop-up/dialog-review-leave-approve/dialog-review-leave-approve.component';
import { DialogWaitingLeavingApproveComponent } from './employee-info-profile/components/pop-up/dialog-waiting-leaving-approve/dialog-waiting-leaving-approve.component';
import { MenuSidebarComponent } from './employee-info-profile/components/pop-up/menu-sidebar/menu-sidebar.component';
import { DialogRegisterApproveComponent } from '../dashboard/components/dialog-register-approve/dialog-register-approve.component';
import { DialogDetailRegisterApproveComponent } from '../dashboard/components/dialog-detail-register-approve/dialog-detail-register-approve.component';
import { CoreModule } from '@core/core.module';
import { CodxCoreModule, CodxShareComponent, DatePipe } from 'codx-core';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PopupMyteamReponsiveComponent } from './employee-info-profile/components/pop-up/popup-myteam-reponsive/popup-myteam-reponsive.component';
import { MyTemComponent } from '../dashboard/widgets/my-tem/my-tem.component';
import { EmployeeInfoDetailComponent } from './employee-info-detail/employee-info-detail.component';
import { SelectScrollBarComponent } from '../codx-hr-common/components/select-scroll-bar/select-scroll-bar.component';
import { DashboardRegisterAprroveComponent } from '../dashboard/components/dashboard-register-aprrove/dashboard-register-aprrove.component';
import { DirectivesModule } from '../codx-hr-common/directives/directives.module';
import { CodxHRCommonModule } from '../codx-hr-common/codx-hr-common.module';
import { SidebarTreeviewComponent } from './employee-info-detail/component/sidebar-treeview/sidebar-treeview.component';
import { PersonalInfoComponent } from './employee-info-detail/component/personal-info/personal-info.component';
import { GetHeaderTextPipe } from '../codx-hr-common/pipes/get-header-text.pipe';
import { CodxCommonModule } from 'projects/codx-common/src/public-api';
import { ShareCrmModule } from 'projects/codx-dp/src/lib/share-crm/share-crm.module';
import { SharedModule } from '@shared/shared.module';
import { ProfileLast7dayComponent } from '../dashboard/components/profile-last7day/profile-last7day.component';
import { ProfileDashboardLeaveComponent } from '../dashboard/components/profile-dashboard-leave/profile-dashboard-leave.component';

export const routes: Routes = [
  // {
    // path: '',
  //   component: EmployeeInfoProfileComponent
  //   //component: HRLayoutOnlyHeaderComponent,
    // children: [
  //   //   {
  //   //     path: 'employeeprofile/:funcID',
  //   //     component: EmployeeInfoProfileComponent
  //   //   },
  //   // ],
  // },
  {
        path: 'employeeprofile/:funcID',
        component: EmployeeInfoProfileComponent,

  },
  {
        path: 'employeedetail/:funcID',
        component: EmployeeInfoDetailComponent,
  }
// ]


  // {
  //   path: '**',
  //   component: EmployeeInfoProfileComponent
  //   component: HRLayoutOnlyHeaderComponent,
  //   children: [
  //     {
  //       path: 'employeeprofile/:funcID',
  //       component: EmployeeInfoProfileComponent
  //     },
  //   ],
  // },
  // {
  //   path: '**',
  //   component: EmployeeInfoProfileComponent
  //   component: HRLayoutOnlyHeaderComponent,
  //   children: [
  //     {
  //       path: 'employeeprofile/:funcID',
  //       component: EmployeeInfoProfileComponent
  //     },
  //   ],
  // },
// }
];
const T_Pipe = [
  // DatePipe,
  GetHeaderTextPipe,
  // FilterPipe,
  // TimeAgoPipe
]
const T_Component = [
  DialogReviewLeaveApproveComponent,
  DialogWaitingLeavingApproveComponent,
  MenuSidebarComponent,
  PopupMyteamReponsiveComponent,
  EmployeeInfoProfileComponent,
  EmployeeInfoDetailComponent,
  DashboardRegisterAprroveComponent,
  SidebarTreeviewComponent,
  PersonalInfoComponent,


  ProfileLast7dayComponent,
  ProfileDashboardLeaveComponent,
  MyTemComponent,

  
  // DialogRegisterApproveComponent
]

@NgModule({
  declarations: [T_Component, T_Pipe],
  imports: [
    CommonModule, 
    CoreModule,
    CodxCoreModule,
    CodxShareModule,
    CodxCommonModule,
    NgbModule,
    FormsModule,
    OverlayModule,
    HttpClientModule,
    DirectivesModule,
    DialogDetailRegisterApproveComponent,
    CodxHRCommonModule,
    SharedModule,
    RouterModule.forChild(routes)

  ]
})
export class EmployeeListModule { }
