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
import { DashboardRegisterAprroveComponent } from '../dashboard/components/dashboard-register-aprrove/dashboard-register-aprrove.component';
import { DirectivesModule } from '../codx-hr-common/directives/directives.module';
import { CodxHRCommonModule } from '../codx-hr-common/codx-hr-common.module';
import { SidebarTreeviewComponent } from './employee-info-detail/component/sidebar-treeview/sidebar-treeview.component';
import { PersonalInfoComponent } from './employee-info-detail/component/personal-info/personal-info.component';
import { CodxCommonModule } from 'projects/codx-common/src/public-api';
import { SharedModule } from '@shared/shared.module';
import { ProfileLast7dayComponent } from '../dashboard/components/profile-last7day/profile-last7day.component';
import { ProfileDashboardLeaveComponent } from '../dashboard/components/profile-dashboard-leave/profile-dashboard-leave.component';
import { AgeStatisticComponent } from '../dashboard/widgets/age-statistic/age-statistic.component';
import { PopupMenusidebarReponsiveComponent } from './employee-info-profile/components/pop-up/popup-menusidebar-reponsive/popup-menusidebar-reponsive.component';
import { PopupReviewRegisterApproveComponent } from './employee-info-profile/components/pop-up/popup-review-register-approve/popup-review-register-approve.component';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { PopupViewAllComponent } from './employee-info-detail/pop-up/popup-view-all/popup-view-all.component';

export const routes: Routes = [
  {
    path:'',
    component: HRLayoutOnlyHeaderComponent,
    children:[
      {
        path: 'employeeprofile/:funcID',
        component: EmployeeInfoProfileComponent
      },
      {
        path: 'employeedetail/:funcID',
        component: EmployeeInfoDetailComponent,
      },
    ]
  }

];

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
  PopupMenusidebarReponsiveComponent,


  ProfileLast7dayComponent,
  ProfileDashboardLeaveComponent,
  MyTemComponent,
  AgeStatisticComponent,
  PopupReviewRegisterApproveComponent,
]


@NgModule({
  declarations: [T_Component],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreModule,

    NgbModule,
    FormsModule,
    SharedModule,
    OverlayModule,
    HttpClientModule,
    DirectivesModule,
    DialogDetailRegisterApproveComponent,
    CodxHRCommonModule,
    TabModule,
  ]
})
export class EmployeeListModule { }
