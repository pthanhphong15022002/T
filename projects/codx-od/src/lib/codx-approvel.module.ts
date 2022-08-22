import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ODTestDetailComponent } from './incomming/test/test.component';
import { CodxApprovalComponent } from 'projects/codx-share/src/lib/components/codx-approval/codx-approval.component';
import { ODApprovelComponent } from './incomming/approvel/approvel.component';
import { SignFileComponent } from 'projects/codx-es/src/lib/sign-file/sign-file.component';
import { ViewDetailComponent } from 'projects/codx-es/src/lib/sign-file/view-detail/view-detail.component';



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
          component: ODTestDetailComponent
        },
        {
          path: 'signfiles/:funcID/:id',
          component: ViewDetailComponent,
        }
      ],
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class ApprovelModule { }
