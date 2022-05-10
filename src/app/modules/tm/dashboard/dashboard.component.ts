import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }


  // Chart bar
  public data: Object[] = [
    { value: new Date(2005, 0, 1), id: 21 },
    { value: new Date(2006, 0, 1), id: 24 },
    { value: new Date(2007, 0, 1), id: 36 },
    { value: new Date(2008, 0, 1), id: 38 },
    { value: new Date(2009, 0, 1), id: 54 },
    { value: new Date(2010, 0, 1), id: 57 },
    { value: new Date(2011, 0, 1), id: 70 }
  ];
  public primaryXAxis: Object = {
    valueType: 'DateTime',
    labelFormat: 'y',
    intervalType: 'Years',
    edgeLabelPlacement: 'Shift',
    rangePadding: 'None',
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    lineStyle: { width: 0 },
    labelStyle: {
      color: 'transparent'
    }
  };

  //Initializing Primary Y Axis
  public primaryYAxis: Object = {
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 0 },
    labelStyle: {
      color: 'transparent'
    }
  };
  public chartArea: Object = {
    border: {
      width: 0
    }
  };
  public marker: Object = {
    visible: true,
    height: 10,
    width: 10
  };
  public tooltip: Object = {
    enable: false
  };
  public title: string = 'Inflation - Consumer Price';
  public legendSettingsBar: Object = {
    visible: false,
  };
  //End chart bar
}
