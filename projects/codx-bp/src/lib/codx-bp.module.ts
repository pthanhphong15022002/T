import { NgModule } from '@angular/core';
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
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CommonModule } from '@angular/common';
import { LayoutNoAsideComponent } from 'projects/codx-common/src/lib/_layout/_noAside/_noAside.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
// import { NgxImageZoomModule } from 'ngx-image-zoom';
import { PinchZoomModule } from '@meddv/ngx-pinch-zoom';
import { PopupAddProcessComponent } from './processes/popup-add-process/popup-add-process.component';
import { FormPropertiesFieldsComponent } from './processes/popup-add-process/form-properties-fields/form-properties-fields.component';
import { SettingFieldsComponent } from './processes/popup-add-process/form-properties-fields/setting-fields/setting-fields.component';
import { environment } from 'src/environments/environment';
import { FormFormatValueComponent } from './processes/popup-add-process/form-properties-fields/form-format-value/form-format-value.component';

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
    DragDropModule,
    CoreModule,
    PinchZoomModule,
    // NgxImageZoomModule
  ],
  exports: [CodxBpComponent],
})
export class CodxBpModule {}
