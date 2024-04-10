import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'lib-dashboard-gauge-chart',
  templateUrl: './dashboard-gauge-chart.component.html',
  styleUrls: ['./dashboard-gauge-chart.component.css']
})
export class DashboardGaugeChartComponent implements OnInit {
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
    height: 0,
    width: 1,
    offset: 20,
    labelStyle: { font: '0px' },
    interval: 20,
  };

  majorTicks: Object = {
    position: 'Outside',
    height: 10,
    width: 1,
    offset: 10,
    interval: 10,
    labelStyle: { font: '0px' }
  };

  lineStyle: Object = {
    width: 0,
  };
  
  public labelStyle?: Object;

  ngOnInit(): void {
    this.labelStyle = {
      font: {
        size: '0px',
      }
    };
  }
}
