import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CodxApprovalComponent } from 'projects/codx-share/src/lib/components/codx-approval/codx-approval.component';
import { ODApprovelComponent } from 'projects/codx-od/src/lib/incomming/approvel/approvel.component';
import { ODTestDetailComponent } from 'projects/codx-od/src/lib/incomming/test/test.component';
import { ESApprovelComponent } from './sign-file/approval/approval.component';

const routes: Routes = [
  {
    path: '',
    component: CodxApprovalComponent,
    children: [
      {
        path: 'dispatches/:funcID/:id',
        component: ODApprovelComponent,
      },
      {
        path: 'tasks/:funcID/:id',
        component: ODTestDetailComponent,
      },
      {
        path: 'signfiles/:funcID/:id',
        component: ESApprovelComponent,
      },
      {
        path: 'bookingcars/:funcID/:id',
        component: ESApprovelComponent,
      },
      {
        path: 'bookingrooms/:funcID/:id',
        component: ESApprovelComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class ApprovelModule {}
