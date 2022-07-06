import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import {
  AccumulationChartAllModule,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';
import { TabModule } from '@syncfusion/ej2-angular-navigations';

import { AuthGuard, CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { MarkSignatureComponent } from '../sign-file/mark-signature/mark-signature.component';
import { PopupAddSignFileComponent } from '../sign-file/popup-add-sign-file/popup-add-sign-file.component';
import { SignFileComponent } from '../sign-file/sign-file.component';
import { ApprovalStepComponent } from './approval-step/approval-step.component';
import { PopupAddApprovalStepComponent } from './approval-step/popup-add-approval-step/popup-add-approval-step.component';
import { PopupAddEmailTemplateComponent } from './approval-step/popup-add-email-template/popup-add-email-template.component';
import { DocCategoryComponent } from './category/category.component';
import { PopupAddCategoryComponent } from './category/popup-add-category/popup-add-category.component';
import { ProcessStepComponent } from './category/process-step/process-step.component';
import { PopupAddSignatureComponent } from './signature/popup-add-signature/popup-add-signature.component';
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
    DocCategoryComponent,
    ProcessStepComponent,
    PopupAddApprovalStepComponent,
    ApprovalStepComponent,
    PopupAddSignFileComponent,
    PopupAddCategoryComponent,
    PopupAddSignatureComponent,
    PopupAddEmailTemplateComponent,
    MarkSignatureComponent,
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
