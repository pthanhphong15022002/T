import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'lib-dashboard-gauge-chart',
  templateUrl: './dashboard-gauge-chart.component.html',
  styleUrls: ['./dashboard-gauge-chart.component.css']
})
export class DashboardGaugeChartComponent implements OnInit {
  @Input() value:any = '70';
  content:string="<div class='text-incycle' style='font-size:12px;text-align:center;color:#505D6F'>   Tổng Cộng  </div>"
  +"<div style='font-size:18px;text-align:center;color:#505D6F;font-weight: bold;'> 100% </div>"
  public ticks: Object = {
    width: 0,
  };
  public genderMale: string = '<div style="color: #505D6F;font-weight: 700;font-size: 15px;position: absolute;top:1px;left:-50px">30%</div>';
  public genderFemale: string = '<div style="color: #505D6F;font-weight: 700;font-size: 15px;position: absolute;top:7px;right:-40px " >70%</div>';
  public labelstyle: Object = {
    font: { fontFamily: 'inherit', size: '0px', fontWeight: 'Regular' },
  };
  pointersGaugeFour: Object[] = [];
  rangesGaugeFour: Object[] = [
    {
      start: 0,
      end: 100,
      radius: '100%',
      startWidth: 20,
      endWidth: 20,
      color: '#F64E60',
      roundedCornerRadius:10,
    }, 
  ];
  constructor() { }

  ngOnInit() {
    this.pointersGaugeFour = [
      {
        type: 'RangeBar',
        radius: '100%',
        value: this.value,
        roundedCornerRadius: 10,
        color: '#17BB45',
        pointerWidth: 20,
        border: {
          color: '#17BB45',
          width: 1,
        },
      },
      {
        type: 'Marker',
        markerShape: 'Image',
        markerWidth: 60,
        markerHeight: 60,
        radius: '90%',
        value: this.value,
        imageUrl: './assets/themes/tm/default/img/Button.svg'
      },
    ]
  }
}
