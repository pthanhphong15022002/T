import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CodxApprovalComponent } from 'projects/codx-share/src/lib/components/codx-approval/codx-approval.component';
import { ApprovalHrComponent } from './approval-hr/approval-hr.component';
import { TestComponent } from './test/test.component';

const routes: Routes = [
  {
    path: '',
    component: CodxApprovalComponent,
    children: [
      {
        path: 'econtracts/:FuncID/:id',
        component: TestComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class CodxApprovelModule {}
