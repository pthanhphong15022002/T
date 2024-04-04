import { Component } from '@angular/core';

@Component({
  selector: 'lib-dashboard-gauge-chart',
  templateUrl: './dashboard-gauge-chart.component.html',
  styleUrls: ['./dashboard-gauge-chart.component.css']
})
export class DashboardGaugeChartComponent {
  rangeLinearGradient2: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#FF8008', offset: '0%', opacity: 0.9 },
      { color: '#FFC837', offset: '90%', opacity: 0.9 },
    ],
  };

  minorTicks: Object = {
    width: 1,
  };

  majorTicks1: Object = {
    position: 'Outside',
    // width: 1,
    // offset: 0,
    // interval: 25,
    width: 2,

  };

  labelStyle1: Object = { position: 'Outside', font: { size: '10px' } };

  lineStyle: Object = {
    width: 0,
  };
}
