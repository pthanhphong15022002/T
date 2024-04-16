import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes } from '@angular/router';
import { HRLayoutOnlyHeaderComponent } from '../../_layout_onlyHeader/_layout_onlyHeader.component';
import { EmployeeInfoProfileComponent } from './employee-info-profile.component';
import { DialogReviewLeaveApproveComponent } from './components/dialog-review-leave-approve/dialog-review-leave-approve.component';
import { DialogWaitingLeavingApproveComponent } from './components/dialog-waiting-leaving-approve/dialog-waiting-leaving-approve.component';
import { MenuSidebarComponent } from './components/pop-up/menu-sidebar/menu-sidebar.component';

export const routes: Routes = [
  {
    path: '',
    component: HRLayoutOnlyHeaderComponent,
    children: [
      {
        path: 'employeeprofile/:funcID',
        component: EmployeeInfoProfileComponent
      },
    ],
  },
];

const T_Component = [
  DialogReviewLeaveApproveComponent,
  DialogWaitingLeavingApproveComponent,
  MenuSidebarComponent,
  
]

@NgModule({
  declarations: [T_Component],
  imports: [
    CommonModule
  ]
})
export class EmployeeInfoProfileModule { }
