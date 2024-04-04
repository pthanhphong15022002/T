import { Component } from '@angular/core';

@Component({
  selector: 'lib-dashboard-age-chart',
  templateUrl: './dashboard-age-chart.component.html',
  styleUrls: ['./dashboard-age-chart.component.css']
})
export class DashboardAgeChartComponent {
  cornerRadius: any = { topLeft: 10, topRight: 10};
  public primaryXAxis?: Object;
  public chartData?: Object[];
  public title?: string;
  primaryYAxis: any;
  public chartArea: Object = {
    border: {
      width: 0
    },
  }
  columnData: Object[]= [
    { date: '18-24', In: 190 },
    { date: '25-34', In: 210 },
    { date: '35-44', In: 245 },
    { date: '45-54', In: 150 },
    { date: '55-64', In: 97 },
    { date: '65-74', In: 30 },
  ];
  ngOnInit(): void {
    this.chartData = this.columnData;
    this.primaryXAxis = {
       valueType: 'Category',
       title: '',
       majorGridLines: { width: 0 },
       majorTickLines: { width: 0 },
       lineStyle: { width: 1, color: 'gray'}
    };
    this.primaryYAxis = {
        minimum: 0, maximum: 250,
        interval: 50, title: '',
        majorGridLines: { width: 0 },
        majorTickLines: { width: 0 },
        lineStyle: {width: 0}
    };
  }
}
