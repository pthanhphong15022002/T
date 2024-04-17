import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogDetailRegisterApproveComponent } from './components/dialog-detail-register-approve/dialog-detail-register-approve.component';
import { HistoryLevelComponent } from './components/dialog-detail-register-approve/components/history-level/history-level.component';
import { DashboardAgeChartComponent } from './components/dashboard-age-chart/dashboard-age-chart.component';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { DashboardGaugeChartComponent } from './components/dashboard-gauge-chart/dashboard-gauge-chart.component';
import { DashboardTotalemployeeChartComponent } from './components/dashboard-totalemployee-chart/dashboard-totalemployee-chart.component';
import { DashboardComponent } from './dashboard.component';
import { Routes } from '@angular/router';
import { ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { CodxCoreModule } from 'codx-core';

export const routes: Routes = [
  // {
  //   path: '',
  //   component: DashboardComponent
  // },
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
    // DialogDetailRegisterApproveComponent, 
    HistoryLevelComponent
  ], 
  declarations: [T_Component]

})
export class DashboardModule { }
