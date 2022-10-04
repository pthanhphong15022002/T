import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CodxApprovalComponent } from 'projects/codx-share/src/lib/components/codx-approval/codx-approval.component';
import { ApprovalRoomsComponent } from './room/approval-room.component';

const routes: Routes = [
  {
    path: '',
    component: CodxApprovalComponent,
    children: [
      {
        path: 'bookingrooms/:funcID/:id',
        component: ApprovalRoomsComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class ApprovelModule {}
