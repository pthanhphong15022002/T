import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxBpComponent } from './codx-bp.component';
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
import { MyInstancesComponent } from './my-instances/my-instances.component';
import { AddFileFromProcessComponent } from './processes/popup-add-process/form-steps-field-grid/add-default/add-task/add-file-from-process/add-file-from-process.component';
import { CheckDuedateValuePipe } from './pipes/check-duedate-value.pipe';
import { BpTasksComponent } from './bp-tasks/bp-tasks.component';
import { ViewListBpTasksComponent } from './bp-tasks/view-list-bp-tasks/view-list-bp-tasks.component';
import { PopupBpTasksComponent } from './bp-tasks/popup-bp-tasks/popup-bp-tasks.component';
import { AddFileFromProcessDefaultComponent } from './processes/popup-add-process/form-steps-field-grid/add-default/add-task/add-file-from-process/add-file-from-process-default/add-file-from-process-default.component';
import { ImgSvgVllPipe } from './pipes/img-svg-vll.pipe';
import { AddTableRowComponent } from './processes/popup-add-process/process-release/add-process-default/add-table-row/add-table-row.component';
import { PropertyUserinfoComponent } from './modeview/properties/property-userinfo/property-userinfo.component';
import { BpSignPDFComponent } from './sign-pdf/bp-sign-pdf.component';
import { FormSettingAdvancedTasksComponent } from './processes/popup-add-process/form-steps-field-grid/add-default/form-setting-advanced-tasks/form-setting-advanced-tasks.component';
import { SettingMailComponent } from './processes/popup-add-process/form-steps-field-grid/add-default/form-setting-advanced-tasks/setting-mail/setting-mail.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { DynamicFormComponent } from 'projects/codx-share/src/lib/components/dynamic-form/dynamic-form.component';
import { ShareCrmModule } from 'projects/codx-dp/src/lib/share-crm/share-crm.module';
import { BPPopupChangePermissionComponent } from './processes/popup-add-process/form-steps-field-grid/bp-popup-change-permission/bp-popup-change-permission.component';
import { PropertyCbbDependenceComponent } from './modeview/properties/property-cbb-dependence/property-cbb-dependence.component';
import { ViewListProcessesComponent } from './processes/view-list-processes/view-list-processes.component';
import { TramTestDiagramComponent } from './tram-test-diagram/test-diagram.component';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { PropertyAttachmentAddRowComponent } from './modeview/properties/property-attachment/property-attachment-add-row/property-attachment-add-row.component';
import { PropertyNoteComponent } from './modeview/properties/property-note/property-note.component';
import { FormSettingValueListComponent } from './processes/popup-add-process/form-properties-fields/setting-fields/form-setting-valuelist/form-setting-valuelist.component';
import { FormatValueComboboxPipe } from './pipes/format-value-combobox.pipe';
import { PropertyBorderComponent } from './modeview/properties/property-border/property-border.component';
import { AddCustomActionComponent } from './processes/popup-add-process/form-steps-field-grid/add-default/add-custom-action/add-custom-action.component';

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
        path: 'instances/:funcID/:id/:subUrl',
        component: ProcessReleaseComponent,
        data: { noReuse: true },
      },
      {
        path: 'myinstances/:funcID',
        component: MyInstancesComponent,
        data: { noReuse: true },
      },
      {
        path: 'bptasks/:funcID',
        component: BpTasksComponent,
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
        path: 'share/dynamic/:funcID',
        component: DynamicFormComponent,
      },
      {
        path: 'test-diagram/:funcID/:id',
        component: TramTestDiagramComponent,
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
    PropertyUserinfoComponent,
    PropertyCbbDependenceComponent,
    PropertyAttachmentAddRowComponent,
    PropertyNoteComponent,
    PropertyBorderComponent,
    
    FormSettingComboboxComponent,
    FormAdvancedSettingsComponent,
    PopupPermissionsProcessesComponent,
    FormStepsFieldGridComponent,
    FormTestDiagramComponent,
    AddDefaultComponent,
    AddProcessDefaultComponent,
    AddTableRowComponent,

    AddStageComponent,
    AddTaskComponent,    
    AddCustomActionComponent,
    AddSettingConditionsComponent,
    AddProcessDefaultPrice,
    AddFileFromProcessComponent,
    AddFileFromProcessDefaultComponent,

    ProcessReleaseComponent,
    ProcessReleaseDetailComponent,
    ViewListInstancesComponent,

    CustomStagesPipe,
    ViewDetailInstancesComponent,
    PopupBpTasksComponent,
    BpSignPDFComponent,

    MyInstancesComponent,
    CheckDuedateValuePipe,
    BpTasksComponent,
    ViewListBpTasksComponent,
    ImgSvgVllPipe,
    FormSettingAdvancedTasksComponent,
    SettingMailComponent,
    BPPopupChangePermissionComponent,
    ViewListProcessesComponent,
    TramTestDiagramComponent,
    FormSettingValueListComponent,
    FormatValueComboboxPipe
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
    ShareCrmModule,
    ProgressBarAllModule,
    // NgxImageZoomModule
  ],
  exports: [CodxBpComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxBpModule {}
