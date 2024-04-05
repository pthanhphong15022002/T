import { CUSTOM_ELEMENTS_SCHEMA, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodxStepTaskComponent } from './codx-step/codx-step-task/codx-step-task.component';
import { UpdateProgressComponent } from './codx-step/codx-progress/codx-progress.component';
import { ProgressbarComponent } from './codx-step/codx-step-common/codx-progressbar/codx-progressbar.component';
import { CodxAddGroupTaskComponent } from './codx-step/codx-popup-group/codx-add-group-task.component';
import { CodxAddTaskComponent } from './codx-step/codx-popup-task/codx-add-task.component';
import { CodxRoleComponent } from './codx-step/codx-step-common/codx-role/codx-role.component';
import { CodxTypeTaskComponent } from './codx-step/codx-step-common/codx-type-task/codx-type-task.component';
import { CodxViewTaskComponent } from './codx-step/codx-view-task/codx-view-task.component';
import { CodxTaskbarComponent } from './codx-step/codx-step-common/codx-taskbar/codx-taskbar.component';
import { CodxNoDataComponent } from './codx-step/codx-step-common/codx-no-data/codx-no-data.component';
import { CodxInputCustomFieldComponent } from './codx-input-custom-field/codx-input-custom-field.component';
import { CodxFieldsDetailTempComponent } from './codx-input-custom-field/codx-fields-detail-temp/codx-fields-detail-temp.component';
import { CodxFieldsFormatValueComponent } from './codx-input-custom-field/codx-fields-detail-temp/codx-fields-format-value/codx-fields-format-value.component';
import { PopupCustomFieldComponent } from './codx-input-custom-field/codx-fields-detail-temp/popup-custom-field/popup-custom-field.component';
import { CodxStepChartComponent } from './codx-step/codx-step-chart/codx-step-chart.component';
import { CodxIconStepComponent } from './codx-step/codx-step-common/codx-icon-step/codx-icon-step.component';
import { CodxViewApproveComponent } from './codx-step/codx-step-common/codx-view-approve/codx-view-approve.component';
import { CheckRoleStepPipe } from './codx-step/pipes/check-role-step.pipe';
import { SetColorTaskPipe } from './codx-step/pipes/set-color-task.pipe';
import { PopupSelectFieldReferenceComponent } from './codx-input-custom-field/popup-select-field-reference/popup-select-field-reference.component';
import { PopupAddLineTableComponent } from './codx-input-custom-field/popup-add-line-table/popup-add-line-table.component';
import { FormatDataValuePipe } from './codx-input-custom-field/codx-fields-detail-temp/pipes-fields/format-data-value.pipe';
import { SumColumnsTablePipe } from './codx-input-custom-field/codx-fields-detail-temp/pipes-fields/sum-columns-table.pipe';
import { ChangeMemoryCellsPipe } from './codx-input-custom-field/codx-fields-detail-temp/pipes-fields/change-memory-cells.pipe';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import {
  AccumulationChartAllModule,
  AccumulationTooltipService,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { TabModule, TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { CoreModule } from '@core/core.module';
import { RouterModule } from '@angular/router';
import { CodxListStepComponent} from './codx-list-step/codx-list-step.component';
import { ActivitiesComponent} from './codx-list-step/activities/activities.component';
import { CodxShareTaskComponent } from './codx-step/codx-share-task/codx-share-task.component';

const T_Component: Type<any>[] = [
  CodxStepTaskComponent,
  UpdateProgressComponent,
  ProgressbarComponent,
  CodxAddGroupTaskComponent,
  CodxAddTaskComponent,
  CodxRoleComponent,
  CodxTypeTaskComponent,
  CodxViewTaskComponent,
  CodxTaskbarComponent,
  CodxNoDataComponent,
  CodxInputCustomFieldComponent,
  CodxFieldsDetailTempComponent,
  CodxFieldsFormatValueComponent,
  PopupCustomFieldComponent,
  CodxStepChartComponent,
  CodxIconStepComponent,
  CodxViewApproveComponent,
  PopupSelectFieldReferenceComponent,
  PopupAddLineTableComponent,
  CodxListStepComponent,
  ActivitiesComponent,
  CodxShareTaskComponent
];
const T_Pipe: Type<any>[] = [
  FormatDataValuePipe,
  SumColumnsTablePipe,
  ChangeMemoryCellsPipe,
  CheckRoleStepPipe,
  SetColorTaskPipe,
];

@NgModule({
  declarations: [T_Component, T_Pipe],
  imports: [
    CommonModule,
    CodxCoreModule.forRoot({ environment }),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ChartAllModule,
    AccumulationChartAllModule,
    ProgressBarAllModule,
    TabModule,
    CodxShareModule,
    NgbModule,
    DragDropModule,
    SliderModule,
    CoreModule,
    TreeViewModule,
  ],
  exports: [T_Component, T_Pipe],
  providers: [AccumulationTooltipService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ShareCrmModule {}
