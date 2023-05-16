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
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { PopupAddDynamicProcessComponent } from './dynamic-process/popup-add-dynamic-process/popup-add-dynamic-process.component';
import { PopupJobComponent } from './dynamic-process/popup-add-dynamic-process/step-task/popup-step-task/popup-step-task.component';
import { PopupAddCustomFieldComponent } from './dynamic-process/popup-add-dynamic-process/popup-add-custom-field/popup-add-custom-field.component';
import { PopupViewsDetailsProcessComponent } from './dynamic-process/popup-views-details-process/popup-views-details-process.component';
import { InstancesComponent } from './instances/instances.component';
import { InstanceDetailComponent } from './instances/instance-detail/instance-detail.component';
import { PopupAddInstanceComponent } from './instances/popup-add-instance/popup-add-instance.component';
import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { InputCustomFieldComponent } from './instances/popup-add-instance/input-custom-field/input-custom-field.component';
import { PopupMoveStageComponent } from './instances/popup-move-stage/popup-move-stage.component';
import { PopupMoveReasonComponent } from './instances/popup-move-reason/popup-move-reason.component';
import { ViewJobComponent } from './dynamic-process/popup-add-dynamic-process/step-task/view-step-task/view-step-task.component';
import { PopupTypeTaskComponent } from './dynamic-process/popup-add-dynamic-process/step-task/popup-type-task/popup-type-task.component';
import { StepTaskGroupComponent } from './dynamic-process/popup-add-dynamic-process/step-task/step-task-group/step-task-group.component';
import { UserComponent } from './dynamic-process/popup-add-dynamic-process/step-task/user/user.component';
import { FieldDetailComponent } from './instances/instance-detail/field-detail/field-detail.component';
import { PopupAddStaskComponent } from './instances/instance-detail/stages-detail/popup-add-stask/popup-add-stask.component';
import { PopupCustomFieldComponent } from './instances/instance-detail/field-detail/popup-custom-field/popup-custom-field.component';
import { PopupAddGroupTaskComponent } from './instances/instance-detail/stages-detail/popup-add-group-task/popup-add-group-task.component';
import { StagesDetailComponent } from './instances/instance-detail/stages-detail/stages-detail.component';
import { PopupRolesDynamicComponent } from './dynamic-process/popup-roles-dynamic/popup-roles-dynamic.component';
import { PopupPropertiesComponent } from './dynamic-process/popup-properties/popup-properties.component';
import { PopupUserPropertiesComponent } from './dynamic-process/popup-properties/popup-user-properties/popup-user-properties.component';
import { PopupParticipantsComponent } from './dynamic-process/popup-participants/popup-participants.component';
import { LayoutInstancesComponent } from './layout-instances/layout-instances.component';
import { ProgressComponent } from './instances/instance-detail/stages-detail/progress-layout/progress.component';
import { CarouselStageComponent } from './instances/instance-detail/carousel-stage/carousel-stage.component';

import { CodxTaskComponent } from './componnent-task/codx-task/codx-task.component';
import { UpdateProgressComponent } from './componnent-task/update-progress/update-progress.component';
import { TestComponent } from './componnent-task/test/test.component';
import { InputNumberDurationComponent } from './dynamic-process/popup-add-dynamic-process/input-number-duration/input-number-duration.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { CodxApprovalComponent } from 'projects/codx-share/src/lib/components/codx-approval/codx-approval.component';
import { PopupEditOwnerstepComponent } from './instances/popup-edit-ownerstep/popup-edit-ownerstep.component';
import { PopupSelectTempletComponent } from './instances/popup-select-templet/popup-select-templet.component';


const routes: Routes = [
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
        component: InstancesComponent,
        data: { noReuse: true },
      },
      //dp/approvals/DPT0501
      {
        path: 'approvals/:funcID',
        loadChildren: () =>
          import('projects/codx-dp/src/lib/codx-dp-approver.module').then(
            (m) => m.ApprovelModule
          ),
        data: { noReuse: true },
      },
      {
        path: 'test',
        component: TestComponent,
        data: { noReuse: true },
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
  //   //component: LayoutNoAsideComponent,
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

const T_Component: Type<any>[] = [LayoutComponent];

@NgModule({
  declarations: [
    CodxDpComponent,
    LayoutComponent,
    LayoutInstancesComponent,
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
    FieldDetailComponent,
    InputCustomFieldComponent,
    PopupMoveStageComponent,
    PopupMoveReasonComponent,
    ViewJobComponent,
    PopupAddStaskComponent,
    PopupCustomFieldComponent,
    PopupAddGroupTaskComponent,
    PopupTypeTaskComponent,
    StepTaskGroupComponent,
    UserComponent,
    PopupPropertiesComponent,
    PopupUserPropertiesComponent,
    PopupParticipantsComponent,
    ProgressComponent,
    CarouselStageComponent,
    UpdateProgressComponent,
    CodxTaskComponent,
    TestComponent,
    InputNumberDurationComponent,
    ApprovalsComponent,
    PopupEditOwnerstepComponent,
    PopupSelectTempletComponent
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
    SliderModule,
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
