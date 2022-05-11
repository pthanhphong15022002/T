import { ApiHttpService } from 'codx-core';
import { DataRequest } from './../../../../shared/models/data.request';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SelectweekComponent } from '@shared/components/selectweek/selectweek.component';
import { AccPoints, AccumulationChart, AccumulationChartComponent, IAccAnimationCompleteEventArgs } from '@syncfusion/ej2-angular-charts';
import { AnimationModel } from '@syncfusion/ej2-angular-progressbar';
import { ChartTaskRemind, RemiderOnDay, TaskRemind } from '../models/dashboard.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  fromDate: Date;
  toDate: Date;
  daySelected: Date;
  daySelectedFrom: Date;
  daySelectedTo: Date;
  monthSelected: Date;
  beginMonth: Date;
  endMonth: Date;
  week: number;
  rateTotalChange: string;

  @ViewChild(SelectweekComponent) selectweekComponent: SelectweekComponent;
  remiderOnDay: RemiderOnDay[] = [];
  chartTaskRemind: ChartTaskRemind = new ChartTaskRemind();
  taskRemind: TaskRemind = new TaskRemind();
  model: DataRequest;
  constructor(private api: ApiHttpService, private changeDetectorRef: ChangeDetectorRef) { }
  public ngUnsubscribe = new Subject<void>();
  ngOnInit(): void {
    this.model = new DataRequest();
    this.model.formName = "Tasks";
    this.model.gridViewName = "grvTasks";
    this.model.entityName = "TM_Tasks";
    this.model.pageLoading = false;
  }

  ngAfterViewInit(): void {
    this.week = this.selectweekComponent.week;
    this.fromDate = this.selectweekComponent.fromDate;
    this.toDate = this.selectweekComponent.toDate;
    this.daySelected = this.selectweekComponent.daySelected;
    this.daySelectedFrom = this.selectweekComponent.daySelectedFrom;
    this.daySelectedTo = this.selectweekComponent.daySelectedTo;

    this.getDataBarChart(
      this.selectweekComponent.beginMonth,
      this.selectweekComponent.endMonth
    );
    this.getListTaskRemindWork();
    this.getChartData();
  }

  getListTaskRemindWork() {
    this.api
      .exec("TM", "TaskBusiness", "GetListTaskRemindWorkAsync", [this.model, this.daySelectedFrom, this.daySelectedTo])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: TaskRemind) => {
        this.taskRemind = data;
        this.remiderOnDay = data.tasks['result'];
      });
  }

  getChartData() {
    this.api
      .exec("TM", "TaskBusiness", "GetDataChartAsync", [this.model,
      this.fromDate,
      this.toDate,
      ])
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        console.log('data: ', data);
        this.chartTaskRemind = data.chartTaskRemind;

        //Peformence chart
        if (data.chartPerformance && data.chartPerformance.doughnutData == 0) {
          this.doughnutData = [];
          this.rateTotalChange = this.getTitleRateChange(data.chartPerformance.rateTotalChange);
        } else {
          this.doughnutData = data.chartPerformance.doughnutData;
          // if (this.doughnutData[0] == 0 && this.doughnutData[1] == 0) {
          //   this.isShowEmpty = true;
          // } else {
          //   this.isShowEmpty = false;
          // }
          this.rateTotalChange = this.getTitleRateChange(data.chartPerformance.rateTotalChange);
          // this.renderMiddleText(data.chartPerformance.rateTotalChange);
        }

        //trending chart
        this.dataLine[0] = data.trendChart.doughnutData;
      })
  }

  getDataBarChart(beginMonth: Date, endMonth: Date) {
    this.api
      .exec("TM", "TaskBusiness", "GetDataBarChartAsync", [this.model,
        beginMonth,
        endMonth,
      ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: any) => {
        // this.chart.datasets[0].data = [];
        // this.chart.datasets[1].data = [];
        // this.chart.labels = [];
        // if (data.hasOwnProperty("barChart")) {
        //   data.barChart.forEach((item) => {
        //     this.chart.labels.push(item.date);
        //     this.chart.datasets[1].data.push(item.totalTaskDone);
        //   });
        // }
        // if (data.hasOwnProperty("lineChart")) {
        //   data.lineChart.forEach((item) => {
        //     this.chart.datasets[0].data.push(item.totalHourDone);
        //   });
        // }
        this.changeDetectorRef.detectChanges();
      });
  }


  onChangeValueSelectedWeek(data) {
    this.fromDate = data.fromDate;
    this.toDate = data.toDate;
    this.daySelected = data.daySelected;
    this.daySelectedFrom = data.daySelectedFrom;
    this.daySelectedTo = data.daySelectedTo;
    //this.getRemiderOnDay();
    if (this.week != data.week) {
      this.week = data.week;
      // this.refreshDataWhenChangeWeek();
    }
    if (this.monthSelected != data.month) {
      this.monthSelected = data.month;
      //   this.getDataBarChart(data.beginMonth, data.endMonth);
    }
  }

  getTitleRateChange(rateTotalChange: number) {
    switch (rateTotalChange) {
      case 1:
        return "Bằng số công việc so với tuần trước";
      case 2:
        return "Tăng 100% công việc so với tuần trước";
      case -2:
        return "Giảm 100% công việc so với tuần trước";
    }
    let title = rateTotalChange > 1 ? "Tăng" : "Giảm";
    console.log("rateTotalChange", rateTotalChange);
    let rate = (Math.abs(1 - rateTotalChange) * 100).toFixed(2);
    return title + ` ${rate}% công việc so với tuần trước`;
  }

  //#region chartline
  public dataLine: Object[] = [
    { value: new Date(2022, 0, 1), id: 21 },
    { value: new Date(2022, 0, 2), id: 24 },
    { value: new Date(2022, 0, 3), id: 36 },
    { value: new Date(2022, 0, 4), id: 38 },
    { value: new Date(2022, 0, 5), id: 54 },
    { value: new Date(2022, 0, 6), id: 57 },
    { value: new Date(2022, 0, 7), id: 70 }
  ];
  public lineXAxis: Object = {
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

  public lineYAxis: Object = {
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 0 },
    labelStyle: {
      color: 'transparent'
    }
  };
  public markerLine: Object = {
    visible: false,
    height: 5,
    width: 5
  };
  public tooltip: Object = {
    enable: false
  };
  public titleLine: string = 'Inflation - Consumer Price';
  public legendLine: Object = {
    visible: false,
  };
  chartDatas_empty: Object[] = [10];
  //#endregion chartline

  //#region proccess bar
  public animation: AnimationModel = { enable: true, duration: 2000, delay: 0 };
  valPcb = 100;
  //#endregion proccess bar
  //#region chartcolumn
  public dataColumn: Object[] = [
    { value: new Date(2022, 0, 1), id: 21 },
    { value: new Date(2022, 0, 2), id: 24 },
    { value: new Date(2022, 0, 3), id: 36 },
    { value: new Date(2022, 0, 4), id: 38 },
    { value: new Date(2022, 0, 5), id: 54 },
    { value: new Date(2022, 0, 6), id: 57 },
    { value: new Date(2022, 0, 7), id: 70 },
    { value: new Date(2022, 0, 8), id: 57 },
    { value: new Date(2022, 0, 9), id: 70 },
    { value: new Date(2022, 0, 10), id: 57 },
    { value: new Date(2022, 0, 11), id: 70 },
    { value: new Date(2022, 0, 12), id: 57 },
  ];
  public columnXAxis: Object = {
    valueType: 'DateTime',
    labelFormat: 'y',
    edgeLabelPlacement: 'Shift',
    rangePadding: 'None',
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    lineStyle: { width: 0 },
    labelStyle: {
      color: 'gray'
    }
  };

  public columnYAxis: Object = {
    labelStyle: {
      color: 'gray'
    }
  };
  public chartArea: Object = {
    border: {
      width: 0
    }
  };
  public markerColumn: Object = {
    visible: false,
    height: 5,
    width: 5
  };
  public title: string = 'Inflation - Consumer Price';
  //#endregion chartcolumn

  //#region donut
  public pie: AccumulationChartComponent | AccumulationChart;
  public execute = false;
  public count = 0;
  public startAngle: number = 0;
  public endAngle: number = 360;
  public doughnutData: Object[] = [
    { 'x': 'Net-tution', y: 21, text: '21%' },
    { 'x': 'Private Gifts', y: 8, text: '8%' },
  ];


  //Initializing Datalabel
  public dataLabel: Object = {
    visible: true,
    position: 'Inside',
    name: '${point.y}',
    font: {
      color: 'white',
      fontWeight: 'Bold',
      size: '14px'
    }
  };

  public onAnimationComplete(args: IAccAnimationCompleteEventArgs): void {
    let centerTitle: HTMLDivElement = document.getElementById('center_title') as HTMLDivElement;
    centerTitle.style.fontSize = this.getFontSize(args.accumulation.initialClipRect.width);
    let rect: ClientRect = centerTitle.getBoundingClientRect();
    centerTitle.style.top = (args.accumulation.origin.y + args.accumulation.element.offsetTop - (rect.height / 2)) + 'px';
    centerTitle.style.left = (args.accumulation.origin.x + args.accumulation.element.offsetLeft - (rect.width / 2)) + 'px';
    centerTitle.style.visibility = 'visible';
    let points: AccPoints[] = args.accumulation.visibleSeries[0].points;
    for (let point of points) {
      if (point.labelPosition === 'Outside' && point.labelVisible) {
        let label: Element = document.getElementById('doughnut-container_datalabel_Series_0_text_' + point.index);
        label.setAttribute('fill', 'black');
      }
    }
  };

  public getFontSize(width: number): string {
    if (width > 300) {
      return '13px';
    } else if (width > 250) {
      return '8px';
    } else {
      return '6px';
    }
  };
  //#endregion doughnut
}
