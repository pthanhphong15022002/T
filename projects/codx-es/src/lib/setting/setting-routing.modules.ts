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
import { PopupAddApprovalStepComponent } from './approval-step/popup-add-approval-step/popup-add-approval-step.component';
import { DocCategoryComponent } from './category/category.component';
import { ProcessStepComponent } from './category/process-step/process-step.component';
import { LayoutComponent } from './_layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
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
    DocCategoryComponent,
    ProcessStepComponent,
    PopupAddApprovalStepComponent,
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
