import { Component, OnInit, Optional } from '@angular/core';
import { AccumulationChart, AccumulationChartComponent, AnimationModel } from '@syncfusion/ej2-angular-charts';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { DialogData } from 'codx-core';

@Component({
  selector: 'lib-project-chart',
  templateUrl: './project-chart.component.html',
  styleUrls: ['./project-chart.component.css']
})
export class ProjectChartComponent implements OnInit {
  data: any;
  dialog: any;

  pie: AccumulationChartComponent | AccumulationChart;
  execute = false;

  palettes: string[] = ['#005DC7', '#06DDB8', '#07523E','#099CC8'];
  animation: AnimationModel = { enable: true, duration: 2000, delay: 0 };

  doughnutData = [{ label: '', value: 100 }];
  lstOwners = [];
  
  startAngle: number = 0;
  endAngle: number = 360;
  constructor(@Optional() dt?: DialogData,
    @Optional() dialog?: Dialog,) {
      this.data = dt?.data;
      this.lstOwners = this.data.owners;
      this.doughnutData = this.data.chart;
    this.dialog = dialog;
  }

  ngOnInit(): void {
  }

}
