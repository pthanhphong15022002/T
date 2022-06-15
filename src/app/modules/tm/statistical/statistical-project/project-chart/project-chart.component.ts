import { Component, OnInit, Optional } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { DialogData } from 'codx-core';

@Component({
  selector: 'app-project-chart',
  templateUrl: './project-chart.component.html',
  styleUrls: ['./project-chart.component.scss']
})
export class ProjectChartComponent implements OnInit {
  data: any;
  dialog: any;

  palettes: string[] = ['#005DC7', '#06DDB8', '#07523E','#099CC8'];
  doughnutData = [{ label: '', value: 100 }];
  startAngle: number = 0;
  endAngle: number = 360;
  constructor(@Optional() dt?: DialogData,
    @Optional() dialog?: Dialog,) {
      this.data = dt?.data;
    this.dialog = dialog;
  }

  ngOnInit(): void {

  }

}
