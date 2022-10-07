import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxBpComponent } from './codx-bp.component';
import { TesthtmlComponent } from './testhtml/testhtml.component';
import { LayoutComponent } from './_layout/layout.component';
import { ProcessesComponent } from './processes/processes.component';
import { PopAddProcessesComponent } from './processes/pop-add-processes/pop-add-processes.component';
import { ViewListProcessesComponent } from './processes/view-list-processes/view-list-processes.component';
import { ProcessstepsComponent } from './processsteps/processsteps.component';
import { PopAddProcessstepsComponent } from './processsteps/pop-add-processsteps/pop-add-processsteps.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxCoreModule } from 'codx-core';
import { CoreModule } from '@core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { InlineSVGModule } from 'ng-inline-svg';
import { OverlayModule } from '@angular/cdk/overlay';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CommonModule } from '@angular/common';

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
        component: ProcessstepsComponent,
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
    PopAddProcessesComponent,
    ViewListProcessesComponent,
    ProcessstepsComponent,
    PopAddProcessstepsComponent,
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
