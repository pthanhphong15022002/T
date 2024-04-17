import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryLevelComponent } from './components/dialog-detail-register-approve/components/history-level/history-level.component';
import { DashboardAgeChartComponent } from './components/dashboard-age-chart/dashboard-age-chart.component';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { DashboardGaugeChartComponent } from './components/dashboard-gauge-chart/dashboard-gauge-chart.component';
import { DashboardTotalemployeeChartComponent } from './components/dashboard-totalemployee-chart/dashboard-totalemployee-chart.component';
import { DashboardComponent } from './dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { CoreModule } from '@core/core.module';
import { CodxCoreModule } from 'codx-core';
import { ChartAllModule } from '@syncfusion/ej2-angular-charts';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
]
const T_Component = [
  DashboardAgeChartComponent,
  DashboardCardComponent,
  DashboardGaugeChartComponent,
  DashboardTotalemployeeChartComponent,
  DashboardComponent,
]

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    CodxCoreModule,
    HistoryLevelComponent,
    CircularGaugeModule,
    ChartAllModule,
    RouterModule.forChild(routes)
  ], 
  declarations: [T_Component],
  
})
export class DashboardModule { }
