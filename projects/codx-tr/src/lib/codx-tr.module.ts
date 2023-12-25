import { NgModule, Type } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './_layout/layout.component';
import { CommonModule } from '@angular/common';
import { CodxCoreModule } from 'codx-core';
import { CoreModule } from '@core/core.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxHRModule } from 'projects/codx-hr/src/public-api';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { TimeKeepingRequestOT } from './timekeeping-request-ot/timekeeping-request-ot.component';
import { ViewDetailComponent } from './timekeeping-request-ot/view-detail/view-detail.component';
import { PopupOverTimeComponent } from './timekeeping-request-ot/popup-over-time/popup-over-time.component';
const routes:Routes = [
  {
    path:"",
    component:LayoutComponent,
    children:
    [
      {
        path: 'TimeKeepingRequestOT/:funcID',
        component: TimeKeepingRequestOT,
      },
      
    ]
  }
]
const T_Component: Type<any>[] = [
    LayoutComponent,
    TimeKeepingRequestOT,
    ViewDetailComponent,
    PopupOverTimeComponent
]
@NgModule({
  declarations: [
    T_Component
  ],
  imports: [
    CommonModule,
    CodxCoreModule,
    CoreModule,
    CodxShareModule,
    CodxHRModule,
    NgbModule,
    SliderModule,
    DateRangePickerModule,
    ChartAllModule,
    RouterModule.forChild(routes),
  ],
  exports: [T_Component]
})
export class CodxTrModule { }
