import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodxInstancesComponent } from './codx-instances.component';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { CodxCoreModule } from 'codx-core';
import {
  AccumulationChartAllModule,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PinchZoomModule } from '@meddv/ngx-pinch-zoom';
import { CoreModule } from '@core/core.module';
import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { TabModule } from '@syncfusion/ej2-angular-navigations';

import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxReportModule } from 'projects/codx-report/src/public-api';

export const routes: Routes = [
  {
    path: ':funcID/:processID',
    component: CodxInstancesComponent,
    data: { noReuse: true },
  },
];
const T_Component: Type<any>[] = [];

@NgModule({
  declarations: [T_Component],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    SharedModule,
    CodxCoreModule,
    CommonModule,
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
    RouterModule.forChild(routes),
  ],
  exports: [T_Component],
})
export class CodxInstancesModule {}
