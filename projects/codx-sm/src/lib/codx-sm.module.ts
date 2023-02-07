import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '@core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { AccumulationTooltipService } from '@syncfusion/ej2-angular-charts';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { SplitterModule } from '@syncfusion/ej2-angular-layouts';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxCoreModule } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import { VendorsComponent } from 'projects/codx-ac/src/lib/vendors/vendors.component';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { LayoutComponent } from './_layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [],
  },
];

@NgModule({
  declarations: [LayoutComponent],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule,
    CodxShareModule,
    InlineSVGModule,
    CommonModule,
    FormsModule,
    CoreModule,
    CircularGaugeModule,
    DatePickerModule,
    TabModule,
    NgbModule,
    SplitterModule,
    CodxReportModule,
  ],
  exports: [RouterModule],
  providers: [AccumulationTooltipService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxSmModule {}
