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
        path: 'processstep/:funcID',
        component: ProcessStepsComponent,
      },
      {
        path: 'testhtml',
        component: TesthtmlComponent,
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

  ],
  exports: [CodxBpComponent],
})
export class CodxBpModule {}
