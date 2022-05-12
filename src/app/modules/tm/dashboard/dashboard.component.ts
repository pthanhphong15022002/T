import { ApiHttpService } from 'codx-core';
import { DataRequest } from './../../../../shared/models/data.request';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SelectweekComponent } from '@shared/components/selectweek/selectweek.component';
import { AccPoints, AccumulationChart, AccumulationChartComponent, IAccAnimationCompleteEventArgs } from '@syncfusion/ej2-angular-charts';
import { AnimationModel } from '@syncfusion/ej2-angular-progressbar';
import { ChartTaskRemind, RemiderOnDay, TaskRemind } from '../models/dashboard.model';
import { Subject, takeUntil } from 'rxjs';
import { throws } from 'assert';

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
          this.doughnutData = this.doughnutEmpty;
          this.palettes = this.palettesEmpty;
          this.rateTotalChange = this.getTitleRateChange(data.chartPerformance.rateTotalChange);
        } else {
          this.doughnutData = data.chartPerformance.doughnutData;
          this.rateTotalChange = this.getTitleRateChange(data.chartPerformance.rateTotalChange);
          // this.renderMiddleText(data.chartPerformance.rateTotalChange);
        }

        //trending chart
        this.dataLineTrend[0] = data.trendChart.doughnutData;
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
        if (data) {

          if (data.hasOwnProperty("barChart")) {
            this.dataColumn = data.barChart;
          }
          if (data.hasOwnProperty("lineChart")) {
            this.dataLine = data.lineChart
          }

        }
        this.changeDetectorRef.detectChanges();
      });
  }

  getRemiderOnDay() {
    this.api
      .exec("TM", "TaskBusiness", "GetRemiderOnDayAsync", [this.model,
      this.daySelectedFrom,
      this.daySelectedTo,
      ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: any) => {
        this.remiderOnDay = data.result as RemiderOnDay[];
        this.changeDetectorRef.detectChanges();
      });
  }

  onChangeValueSelectedWeek(data) {
    this.fromDate = data.fromDate;
    this.toDate = data.toDate;
    this.daySelected = data.daySelected;
    this.daySelectedFrom = data.daySelectedFrom;
    this.daySelectedTo = data.daySelectedTo;
    this.getRemiderOnDay();
    if (this.week != data.week) {
      this.week = data.week;
      this.getChartData();
    }
    if (this.monthSelected != data.month) {
      this.monthSelected = data.month;
      this.getDataBarChart(data.beginMonth, data.endMonth);
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
  public dataLineTrend: Object[] = [];
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
  animation: AnimationModel = { enable: true, duration: 2000, delay: 0 };
  valPcb = 100;
  //#endregion proccess bar
  //#region chartcolumn
  dataColumn: Object[] = [];
  dataLine: Object[] = [];
  columnXAxis: Object = {
    interval: 1,
    valueType: 'Category',
    rangePadding: 'None',
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    lineStyle: { width: 0 },
    labelStyle: {
      color: 'gray'
    }
  };

  columnYAxis: Object = {
    minimum: 1,
    interval: 2,
    labelStyle: {
      color: 'gray'
    }
  };
  chartArea: Object = {
    border: {
      width: 0
    }
  };
  markerColumn: Object = {
    visible: false,
    height: 5,
    width: 5
  };
  title: string = 'Inflation - Consumer Price';
  //#endregion chartcolumn

  //#region donut
  pie: AccumulationChartComponent | AccumulationChart;
  execute = false;
  count = 0;
  startAngle: number = 0;
  endAngle: number = 360;
  doughnutEmpty = [
    { label: '', value: 100 },
  ];
  doughnutData: Object[] = this.doughnutEmpty;
  palettesEmpty = ['#deeeeee'];
  palettes: string[] = ["#005DC7", "#06DDB8"];

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
