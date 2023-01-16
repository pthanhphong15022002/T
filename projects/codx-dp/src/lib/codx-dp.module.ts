import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { CodxDpComponent } from './codx-dp.component';
import { LayoutComponent } from './_layout/layout.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  AccumulationChartAllModule,
  AccumulationTooltipService,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { SharedModule } from '@shared/shared.module';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DynamicProcessComponent } from './dynamic-process/dynamic-process.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { PopupAddDynamicProcessComponent } from './dynamic-process/popup-add-dynamic-process/popup-add-dynamic-process.component';
import { PopupJobComponent } from './dynamic-process/popup-add-dynamic-process/popup-job/popup-job.component';
import { PopupAddCustomFieldComponent } from './dynamic-process/popup-add-dynamic-process/popup-add-custom-field/popup-add-custom-field.component';
import { PopupRolesDynamicComponent } from './dynamic-process/popup-add-dynamic-process/popup-roles-dynamic/popup-roles-dynamic.component';
import { PopupViewsDetailsProcessComponent } from './dynamic-process/popup-views-details-process/popup-views-details-process.component';
import { InstancesComponent } from './instances/instances.component';
import { InstanceDetailComponent } from './instances/instance-detail/instance-detail.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dynamicprocess/:funcID',
        component: DynamicProcessComponent,
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
  {
    path: 'general/:funcID',
    component: PopupAddDynamicProcessComponent,
  },
];

const T_Component: Type<any>[] = [LayoutComponent];

@NgModule({
  declarations: [
    CodxDpComponent,
    LayoutComponent,
    DynamicProcessComponent,
    PopupAddDynamicProcessComponent,
    PopupJobComponent,
    PopupAddCustomFieldComponent,
    PopupRolesDynamicComponent,
    PopupViewsDetailsProcessComponent,
    InstancesComponent,
    InstanceDetailComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ChartAllModule,
    AccumulationChartAllModule,
    ProgressBarAllModule,
    TabModule,
    CodxShareModule,
    CodxReportModule,
    NgbModule,
    DragDropModule,
  ],
  exports: [RouterModule],
  providers: [AccumulationTooltipService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxDpModule {
  public static forRoot(
    config?: EnvironmentConfig
  ): ModuleWithProviders<CodxCoreModule> {
    return {
      ngModule: CodxCoreModule,
      providers: [
        HttpClientModule,
        { provide: EnvironmentConfig, useValue: config },
      ],
    };
  }
}
