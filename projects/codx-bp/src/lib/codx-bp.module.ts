import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxBpComponent } from './codx-bp.component';
import { TesthtmlComponent } from './testhtml/testhtml.component';
import { LayoutComponent } from './_layout/layout.component';
import { ProcessesComponent } from './processes/processes.component';
import { NgbAccordionModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxCoreModule } from 'codx-core';
import { CoreModule } from '@core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  AccordionModule,
  TabModule,
} from '@syncfusion/ej2-angular-navigations';
import { CommonModule } from '@angular/common';
import { LayoutNoAsideComponent } from 'projects/codx-common/src/lib/_layout/_noAside/_noAside.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
// import { NgxImageZoomModule } from 'ngx-image-zoom';
import { PinchZoomModule } from '@meddv/ngx-pinch-zoom';
import { PopupAddProcessComponent } from './processes/popup-add-process/popup-add-process.component';
import { FormPropertiesFieldsComponent } from './processes/popup-add-process/form-properties-fields/form-properties-fields.component';
import {
  ConnectorEditing,
  DiagramModule,
  SymbolPaletteModule,
} from '@syncfusion/ej2-angular-diagrams';
import { SettingFieldsComponent } from './processes/popup-add-process/form-properties-fields/setting-fields/setting-fields.component';
import { environment } from 'src/environments/environment';
import { FormFormatValueComponent } from './processes/popup-add-process/form-format-value/form-format-value.component';
import { ModeviewComponent } from './modeview/modeview.component';
import { FormatValuelistComponent } from './processes/popup-add-process/form-properties-fields/format-valuelist/format-valuelist.component';
import { PropertyValueListComponent } from './modeview/properties/property-valuelist/property-valuelist.component';
import { PropertyFormComponent } from './modeview/properties/property-form/property-form.component';
import { PropertyTextComponent } from './modeview/properties/property-text/property-text.component';
import { PropertyDatetimeComponent } from './modeview/properties/property-datetime/property-datetime.component';
import { PropertyNumberComponent } from './modeview/properties/property-number/property-number.component';
import { PropertyYesnoComponent } from './modeview/properties/property-yesno/property-yesno.component';
import { PropertyUserComponent } from './modeview/properties/property-user/property-user.component';
import { PropertyRankComponent } from './modeview/properties/property-rank/property-rank.component';
import { PropertyProgressComponent } from './modeview/properties/property-progress/property-progress.component';
import { PropertyPhoneComponent } from './modeview/properties/property-phone/property-phone.component';
import { PropertyExpressionComponent } from './modeview/properties/property-expression/property-expression.component';
import { PropertyAttachmentComponent } from './modeview/properties/property-attachment/property-attachment.component';
import { FormSettingComboboxComponent } from './processes/popup-add-process/form-properties-fields/setting-fields/form-setting-combobox/form-setting-combobox.component';
import { PropertyComboboxComponent } from './modeview/properties/property-combobox/property-combobox.component';
import { FormAdvancedSettingsComponent } from './processes/popup-add-process/form-advanced-settings/form-advanced-settings.component';
import { SplitterAllModule } from '@syncfusion/ej2-angular-layouts';
import { DynamicSettingModule } from 'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting.module';
import { PropertyShareComponent } from './modeview/properties/property-share/property-share.component';
import { PropertyTableComponent } from './modeview/properties/property-table/property-table.component';
import { PropertyDefaultTitleComponent } from './modeview/properties/property-default/property-default-title/property-default-title.component';
import { PopupPermissionsProcessesComponent } from './processes/popup-add-process/popup-permissions-processes/popup-permissions-processes.component';
import { FormStepsFieldGridComponent } from './processes/popup-add-process/form-steps-field-grid/form-steps-field-grid.component';
import { FormTestDiagramComponent } from './processes/popup-add-process/form-test-diagram/form-test-diagram.component';
import { AddDefaultComponent } from './processes/popup-add-process/form-steps-field-grid/add-default/add-default.component';
import { AddStageComponent } from './processes/popup-add-process/form-steps-field-grid/add-default/add-stage/add-stage.component';
import { AddTaskComponent } from './processes/popup-add-process/form-steps-field-grid/add-default/add-task/add-task.component';
import { AddSettingConditionsComponent } from './processes/popup-add-process/form-steps-field-grid/add-default/add-task/add-setting-conditions/add-setting-conditions.component';
import { ProcessReleaseComponent } from './processes/popup-add-process/process-release/process-release.component';
import { AddProcessDefaultComponent } from './processes/popup-add-process/process-release/add-process-default/add-process-default.component';
import { AddProcessDefaultPrice } from './processes/popup-add-process/process-release/add-process-default/add-process-default.pipe';
import { ProcessReleaseDetailComponent } from './processes/popup-add-process/process-release/process-release-detail/process-release-detail.component';
import { ViewListInstancesComponent } from './processes/popup-add-process/process-release/view-list-instances/view-list-instances.component';
import { CustomStagesPipe } from './pipes/customStages.pipe';
import { ViewDetailInstancesComponent } from './processes/popup-add-process/process-release/view-detail-instances/view-detail-instances.component';
import { PopupBpTasksComponent } from './processes/popup-add-process/process-release/popup-bp-tasks/popup-bp-tasks.component';
import { MyInstancesComponent } from './my-instances/my-instances.component';
import { CheckDuedateValuePipe } from './pipes/check-duedate-value.pipe';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'processes/:funcID',
        component: ProcessesComponent,
        data: { noReuse: true },
      },
      {
        path: 'instances/:funcID/:id',
        component: ProcessReleaseComponent,
        data: { noReuse: true },
      },
      {
        path: 'myinstances/:funcID',
        component: MyInstancesComponent,
        data: { noReuse: true },
      },
    ],
  },
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'modeview',
        component: FormPropertiesFieldsComponent,
      },
    ],
  },
];
@NgModule({
  declarations: [
    CodxBpComponent,
    TesthtmlComponent,
    LayoutComponent,
    ProcessesComponent,
    PopupAddProcessComponent,
    FormPropertiesFieldsComponent,
    SettingFieldsComponent,
    FormFormatValueComponent,
    ModeviewComponent,
    FormatValuelistComponent,

    //Propreties
    PropertyDefaultTitleComponent,
    PropertyValueListComponent,
    PropertyFormComponent,
    PropertyTextComponent,
    PropertyDatetimeComponent,
    PropertyNumberComponent,
    PropertyYesnoComponent,
    PropertyUserComponent,
    PropertyRankComponent,
    PropertyProgressComponent,
    PropertyPhoneComponent,
    PropertyExpressionComponent,
    PropertyAttachmentComponent,
    PropertyComboboxComponent,
    PropertyShareComponent,
    PropertyTableComponent,

    FormSettingComboboxComponent,
    FormAdvancedSettingsComponent,
    PopupPermissionsProcessesComponent,
    FormStepsFieldGridComponent,
    FormTestDiagramComponent,
    AddDefaultComponent,
    AddProcessDefaultComponent,

    AddStageComponent,
    AddTaskComponent,
    AddSettingConditionsComponent,
    AddProcessDefaultPrice,

    ProcessReleaseComponent,
    ProcessReleaseDetailComponent,
    ViewListInstancesComponent,

    CustomStagesPipe,
    ViewDetailInstancesComponent,
    PopupBpTasksComponent,

    MyInstancesComponent,
    CheckDuedateValuePipe,
  ],
  imports: [
    CodxCoreModule.forRoot({ environment }),
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TabModule,
    CodxShareModule,
    NgbModule,
    CoreModule,
    HttpClientModule,
    OverlayModule,
    TabModule,
    CommonModule,
    AccordionModule,
    DragDropModule,
    CoreModule,
    PinchZoomModule,
    DiagramModule,
    SplitterAllModule,
    DynamicSettingModule,
    NgbAccordionModule,
    // NgxImageZoomModule
  ],
  exports: [CodxBpComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxBpModule {}
