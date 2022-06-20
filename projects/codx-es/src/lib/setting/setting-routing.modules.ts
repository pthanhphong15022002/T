import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { AccumulationChartAllModule, ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';
import { TabModule } from '@syncfusion/ej2-angular-navigations';

import { AuthGuard, CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { EditSignFileComponent } from '../sign-process/edit-sign-file/edit-sign-file.component';
import { MarkSignatureComponent } from '../sign-process/mark-signature/mark-signature.component';
import { SignProcessComponent } from '../sign-process/sign-process.component';
import { ApprovalStepsComponent } from './approval-steps/approval-steps.component';
import { EditApprovalSteps } from './approval-steps/edit-approval-step/edit-approval-step.component';
import { DocCategoryComponent } from './doc-category/docCategory.component';
import { EditCategoryComponent } from './doc-category/edit-category/edit-category.component';
import { ProcessStepComponent } from './doc-category/process-step/process-step.component';
import { EditSignatureComponent } from './signature/dialog/editor.component';
import { PopupSignatureComponent } from './signature/popup-signature/popup-signature.component';
import { SignatureComponent } from './signature/signature.component';
import { LayoutComponent } from './_layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'signature',
        component: SignatureComponent,
      },
      {
        path: 'doc-category',
        component: DocCategoryComponent,
      },
      {
        path: '',
        redirectTo: 'signature',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

@NgModule({
  declarations: [
    LayoutComponent,
    SignatureComponent,
    EditSignatureComponent,
    EditCategoryComponent,
    DocCategoryComponent,
    ProcessStepComponent,
    EditApprovalSteps,
    ApprovalStepsComponent,
    SignProcessComponent,
    EditSignFileComponent,
    PopupSignatureComponent,
    DashboardComponent,
    MarkSignatureComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule.forRoot({ environment }),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TabModule,
    DashboardLayoutModule,
    AccumulationChartAllModule,
    ChartAllModule,
  ],
  exports: [RouterModule],
})
export class SettingRoutingModule {}
