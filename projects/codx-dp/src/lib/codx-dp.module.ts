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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutNoAsideComponent } from 'projects/codx-common/src/lib/_layout/_noAside/_noAside.component';
import { PopupAddDynamicProcessComponent } from './dynamic-process/popup-add-dynamic-process/popup-add-dynamic-process.component';
import { PopupJobComponent } from './dynamic-process/popup-add-dynamic-process/step-task/popup-step-task/popup-step-task.component';
import { PopupAddCustomFieldComponent } from './dynamic-process/popup-add-dynamic-process/popup-add-custom-field/popup-add-custom-field.component';
import { PopupViewsDetailsProcessComponent } from './dynamic-process/popup-views-details-process/popup-views-details-process.component';
import { InstancesComponent } from './instances/instances.component';
import { InstanceDetailComponent } from './instances/instance-detail/instance-detail.component';
import { PopupAddInstanceComponent } from './instances/popup-add-instance/popup-add-instance.component';
import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { PopupMoveStageComponent } from './instances/popup-move-stage/popup-move-stage.component';
import { PopupMoveReasonComponent } from './instances/popup-move-reason/popup-move-reason.component';
import { ViewJobComponent } from './dynamic-process/popup-add-dynamic-process/step-task/view-step-task/view-step-task.component';
import { StepTaskGroupComponent } from './dynamic-process/popup-add-dynamic-process/step-task/step-task-group/step-task-group.component';
import { UserComponent } from './dynamic-process/popup-add-dynamic-process/step-task/user/user.component';
import { StagesDetailComponent } from './instances/instance-detail/stages-detail/stages-detail.component';
import { PopupRolesDynamicComponent } from './dynamic-process/popup-roles-dynamic/popup-roles-dynamic.component';
import { PopupPropertiesComponent } from './dynamic-process/popup-properties/popup-properties.component';
import { PopupUserPropertiesComponent } from './dynamic-process/popup-properties/popup-user-properties/popup-user-properties.component';
import { PopupParticipantsComponent } from './dynamic-process/popup-participants/popup-participants.component';
import { CarouselStageComponent } from './instances/instance-detail/carousel-stage/carousel-stage.component';
import { InputNumberDurationComponent } from './dynamic-process/popup-add-dynamic-process/input-number-duration/input-number-duration.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { CodxApprovalComponent } from 'projects/codx-share/src/lib/components/codx-approval/codx-approval.component';
import { PopupEditOwnerstepComponent } from './instances/popup-edit-ownerstep/popup-edit-ownerstep.component';
import { PopupSelectTempletComponent } from './instances/popup-select-templet/popup-select-templet.component';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@core/core.module';
import { environment } from 'src/environments/environment';
import { ViewsTabsDetailsComponent } from './dynamic-process/popup-views-details-process/views-tabs-details/views-tabs-details.component';

import { PinchZoomModule } from '@meddv/ngx-pinch-zoom';
import { CodxCmModule } from 'projects/codx-cm/src/lib/codx-cm.module';
import { InstanceDashboardComponent } from './instances/instance-dashboard/instance-dashboard.component';
import { PopupAddVllCustomComponent } from './dynamic-process/popup-add-dynamic-process/popup-add-custom-field/popup-add-vll-custom/popup-add-vll-custom.component';
import { PopupAddColumnTableComponent } from './dynamic-process/popup-add-dynamic-process/popup-add-custom-field/popup-setting-table/popup-add-column-table/popup-add-column-table.component';
import { ViewInstancesComponent } from './view-instances/view-instances.component';
import { CdkTableModule } from '@angular/cdk/table';
import { PopupSettingTableComponent } from './dynamic-process/popup-add-dynamic-process/popup-add-custom-field/popup-setting-table/popup-setting-table.component';
import { PopupSettingReferenceComponent } from './dynamic-process/popup-add-dynamic-process/popup-add-custom-field/popup-setting-reference/popup-setting-reference.component';
import { ReplaceProgressPipe } from './pipes/replace-progress.pipe';
import { StepTaskInstanceComponent } from './instances/instance-detail/step-task-instance/step-task-instance.component';
import { PopupReleaseProcessComponent } from './dynamic-process/popup-release-process/popup-release-process.component';
import { ViewDetailApprovalCustomComponent } from './approvals/view-detail-approval-custom/view-detail-approval-custom.component';
import { ProcessesPropertiesComponent } from './processes-properties/processes-properties.component';
import { PropertiesFieldComponent } from './processes-properties/properties-field/properties-field.component';
import { PopupMapContractComponent } from './dynamic-process/popup-add-dynamic-process/step-task/popup-step-task/popup-map-contract/popup-map-contract.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { DashboardInstancesComponent } from './instances/dashboard-instances/dashboard-instances.component';
import { ShareCrmModule } from './share-crm/share-crm.module';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dynamicprocess/:funcID',
        component: DynamicProcessComponent,
        data: { noReuse: true },
      },
      {
        path: 'instances/:funcID/:processID',
        //component: CodxInstancesComponent,
        component: ViewInstancesComponent,
        data: { noReuse: true },
      },
      {
        path: 'instances/:funcID/approvals',
        component: ViewInstancesComponent,
        data: { noReuse: true },
      },
      // view 1 : dp/instances/DPT0502/approvals
      //view 2 : dp/approvals/DPT0501
      {
        path: 'approvals/:funcID',
        loadChildren: () =>
          import('projects/codx-dp/src/lib/codx-dp-approver.module').then(
            (m) => m.ApprovelDpModule
          ),
        data: { noReuse: true },
      },
      {
        path: 'report/:funcID',
        component: CodxReportViewsComponent,
      },
      {
        path: 'report/detail/:funcID',
        component: CodxReportViewDetailComponent,
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
  //thao tesst chuyen popup sang page
  // {
  //   path: '',
  //   component: LayoutInstancesComponent,
  //   children: [
  //     {
  //       path: 'instances/:funcID/:processID',
  //       component: InstancesComponent,
  //       data: { noReuse: true },
  //     },
  //     {
  //       path: '**',
  //       redirectTo: 'dynamicprocess/DP0101',
  //       pathMatch: 'full',
  //     },
  //   ],
  // },
];

const T_Component: Type<any>[] = [
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
  PopupAddInstanceComponent,
  StagesDetailComponent,
  PopupMoveStageComponent,
  PopupMoveReasonComponent,
  ViewJobComponent,
  StepTaskGroupComponent,
  UserComponent,
  PopupPropertiesComponent,
  PopupUserPropertiesComponent,
  PopupParticipantsComponent,
  CarouselStageComponent,
  InputNumberDurationComponent,
  ApprovalsComponent,
  ViewDetailApprovalCustomComponent, //chuyển về từ share sau co thể xóa nếu ko cần
  PopupEditOwnerstepComponent,
  PopupSelectTempletComponent,
  ViewsTabsDetailsComponent,
  InstanceDashboardComponent, //cũ chuyen qua hết thì xóa đi
  DashboardInstancesComponent, //mới => chạy theo dataSet
  PopupAddVllCustomComponent,
  PopupAddColumnTableComponent,
  PopupSettingTableComponent,
  PopupSettingReferenceComponent,
  ViewInstancesComponent,
  ReplaceProgressPipe,
  StepTaskInstanceComponent,
  PopupReleaseProcessComponent,
  ProcessesPropertiesComponent,
  PropertiesFieldComponent,
  PopupMapContractComponent,
];

@NgModule({
  declarations: [T_Component],
  imports: [
    CodxCoreModule.forRoot({ environment }),
    RouterModule.forChild(routes),
    CommonModule,
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
    SliderModule,
    CoreModule,
    PinchZoomModule,
    // CdkTableModule,
    CodxCmModule.forRoot({ environment }),
    ShareCrmModule,
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
