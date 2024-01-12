import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxBpComponent } from './codx-bp.component';
import { TesthtmlComponent } from './testhtml/testhtml.component';
import { LayoutComponent } from './_layout/layout.component';
import { ProcessesComponent } from './processes/processes.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxCoreModule } from 'codx-core';
import { CoreModule } from '@core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { AccordionModule, TabModule } from '@syncfusion/ej2-angular-navigations';
import { CommonModule } from '@angular/common';
import { LayoutNoAsideComponent } from 'projects/codx-common/src/lib/_layout/_noAside/_noAside.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
// import { NgxImageZoomModule } from 'ngx-image-zoom';
import { PinchZoomModule } from '@meddv/ngx-pinch-zoom';
import { PopupAddProcessComponent } from './processes/popup-add-process/popup-add-process.component';
import { FormPropertiesFieldsComponent } from './processes/popup-add-process/form-properties-fields/form-properties-fields.component';
import { ConnectorEditing, DiagramModule, SymbolPaletteModule } from '@syncfusion/ej2-angular-diagrams';
import { SettingFieldsComponent } from './processes/popup-add-process/form-properties-fields/setting-fields/setting-fields.component';
import { environment } from 'src/environments/environment';
import { FormFormatValueComponent } from './processes/popup-add-process/form-properties-fields/form-format-value/form-format-value.component';
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
import { FormEditConnectorComponent } from './processes/popup-add-process/form-edit-connector/form-edit-connector.component';
import { SplitterAllModule } from '@syncfusion/ej2-angular-layouts';
import { DynamicSettingModule } from 'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting.module';
import { PropertyShareComponent } from './modeview/properties/property-share/property-share.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'processes/:funcID',
        component: ProcessesComponent,
        data: { noReuse: true },
      }]
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
  }
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
    
    FormEditConnectorComponent,
    FormSettingComboboxComponent,
    FormAdvancedSettingsComponent,
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
    DynamicSettingModule
    // NgxImageZoomModule
  ],
  exports: [CodxBpComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class CodxBpModule {}
