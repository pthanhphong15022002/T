import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CodxApprovalComponent } from 'projects/codx-share/src/lib/components/codx-approval/codx-approval.component';
import { ApprovelHrComponent } from './approvel-hr/approvel-hr.component';

const routes: Routes = [
  {
    path: '',
    component: CodxApprovalComponent,
    children: [
      {
        path: 'econtracts/:FuncID/:id',
        component: ApprovelHrComponent,
      },
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

export class CodxApprovelModule { }
