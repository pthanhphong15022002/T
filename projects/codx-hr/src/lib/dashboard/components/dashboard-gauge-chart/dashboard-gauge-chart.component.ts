import { Component, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'lib-dashboard-gauge-chart',
  templateUrl: './dashboard-gauge-chart.component.html',
  styleUrls: ['./dashboard-gauge-chart.component.css']
})
export class DashboardGaugeChartComponent {
  tooltip: Object = {
    enable: true,
  };

  font1: Object = {
    size: '15px',
    color: '#00CC66',
  };
  rangeWidth: number = 10;
  //Initializing titleStyle
  titleStyle: Object = { size: '18px' };
  font2: Object = {
    size: '15px',
    color: '#fcde0b',
  };
  rangeLinearGradient1: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#5465FF', offset: '0%', opacity: 0.9 },
      { color: '#04DEB7', offset: '90%', opacity: 0.9 },
    ],
  };

  rangeLinearGradient2: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#FF8008', offset: '0%', opacity: 0.9 },
      { color: '#FFC837', offset: '90%', opacity: 0.9 },
    ],
  };

  minorTicks: Object = {
    position: 'Inside',
    height: 1,
    width: 1,
    offset: 15,
  };

  majorTicks1: Object = {
    position: 'Outside',
    height: 10,
    width: 1,
    offset: 10,
    interval: 10,
  };


  lineStyle: Object = {
    width: 0,
  };

}
