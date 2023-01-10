import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxAcComponent } from './codx-ac.component';
import { LayoutComponent } from './_layout/layout.component';
import { CurrencyFormComponent } from './currency-form/currency-form.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { SplitterModule } from '@syncfusion/ej2-angular-layouts';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { AccumulationTooltipService } from '@syncfusion/ej2-angular-charts';
import { PopAddCurrencyComponent } from './currency-form/pop-add-currency/pop-add-currency.component';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { PopSettingExchangeComponent } from './currency-form/pop-setting-exchange/pop-setting-exchange.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'currencies/:funcID',
        component: CurrencyFormComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    CodxAcComponent,
    LayoutComponent,
    CurrencyFormComponent,
    PopAddCurrencyComponent,
    PopSettingExchangeComponent
  ],
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
export class AcModule {}
