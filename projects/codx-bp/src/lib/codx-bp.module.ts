import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxBpComponent } from './codx-bp.component';
import { TesthtmlComponent } from './testhtml/testhtml.component';
import { LayoutComponent } from './_layout/layout.component';
import { ProcessesComponent } from './processes/processes.component';
import { ViewListProcessesComponent } from './processes/view-list-processes/view-list-processes.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxCoreModule } from 'codx-core';
import { CoreModule } from '@core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { InlineSVGModule } from 'ng-inline-svg';
import { OverlayModule } from '@angular/cdk/overlay';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CommonModule } from '@angular/common';
import { PopupSendEmailComponent } from './processsteps/popup-send-email/popup-send-email.component';
import { PopupAddProcessesComponent } from './processes/popup-add-processes/popup-add-processes.component';
import { ProcessStepsComponent } from './processsteps/processsteps.component';
import { PopupAddProcessStepsComponent } from './processsteps/popup-add-process-steps/popup-add-process-steps.component';
import { RevisionsComponent } from './processes/revisions/revisions.component';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { PropertiesComponent } from './properties/properties.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PopupAddPermissionComponent } from './processes/popup-add-permission/popup-add-permission.component';


export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'processes/:funcID',
        component: ProcessesComponent,
      },
      {
        path: 'testhtml',
        component: TesthtmlComponent,
      },
    ],
  },
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'processstep/:funcID',
        component: ProcessStepsComponent,
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
    PopupAddProcessesComponent,
    ViewListProcessesComponent,
    ProcessStepsComponent,
    PopupAddProcessStepsComponent,
    PopupSendEmailComponent,
    PopupAddProcessStepsComponent,
    RevisionsComponent,
    PropertiesComponent,
    PopupAddPermissionComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CodxShareModule,
    NgbModule,
    CoreModule,
    HttpClientModule,
    InlineSVGModule.forRoot(),
    OverlayModule,
    TabModule,
    CommonModule,
    DragDropModule
  ],
  exports: [CodxBpComponent],
})
export class CodxBpModule {}
