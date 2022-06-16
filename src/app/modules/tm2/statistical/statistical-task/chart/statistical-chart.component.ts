import { Owner } from './../../../models/dashboard.model';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartTaskRemind, RemiderOnDay, TaskRemind } from '@modules/tm/models/dashboard.model';
import { SelectweekComponent } from '@shared/components/selectweek/selectweek.component';
import { AccPoints, AccumulationChart, AccumulationChartComponent, AnimationModel, IAccAnimationCompleteEventArgs, ILoadedEventArgs } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthStore, DataRequest, UserModel, ViewModel } from 'codx-core';

import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-statistical-chart',
  templateUrl: './statistical-chart.component.html',
  styleUrls: ['./statistical-chart.component.scss']
})
export class StatisticalChartComponent implements OnInit, AfterViewInit {
  @Input() data = [];
  ngUnsubscribe = new Subject<void>();
  user: UserModel;
  model: DataRequest;
  fromDate: Date;
  toDate: Date;
  daySelected: Date;
  daySelectedFrom: Date;
  daySelectedTo: Date;
  week: number;
  monthSelected: number;
  rateDoneOnTime: number;
  rate: number;
  rateTotalChange: string;
  positive: boolean;
  rateTotalChangeValue: number = 0;
  lstUser: Owner[] = [];
  taskCount: number;
  //#region chartline
  dataLineTrend: Object[] = [];
  lineXAxis: Object = {
    valueType: 'Category',
    labelFormat: 'y',
    rangePadding: 'None',
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    lineStyle: { width: 0 },
    labelStyle: {
      color: 'transparent',
    },
  };

  lineYAxis: Object = {
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 0 },
    labelStyle: {
      color: 'transparent',
    },
  };

  markerLine: Object = {
    visible: false,
    height: 5,
    width: 5,
  };

  tooltip: Object = {
    enable: false,
  };

  legendLine: Object = {
    visible: false,
  };
  //#endregion chartline

  //#region proccess bar
  animation: AnimationModel = { enable: true, duration: 2000, delay: 0 };
  valPcb: number = 100;
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
      color: 'dark',
    },
  };

  columnYAxis: Object = {
    minimum: 0,
    interval: 10,
    labelStyle: {
      color: 'gray',
    },
  };

  chartArea: Object = {
    border: {
      width: 0,
    },
  };

  radius: Object = {
    topLeft: 10,
    topRight: 10,
  };

  legendSettings: Object = { visible: true, position: 'Top', alignment: 'Far' };
  //#endregion chartcolumn

  //#region donut
  pie: AccumulationChartComponent | AccumulationChart;
  execute = false;
  count = 0;
  startAngle: number = 0;
  endAngle: number = 360;
  doughnutData = [{ label: '', value: 100 }];
  palettes: string[] = ['#005DC7', '#06DDB8', '#07523E', '#099CC8'];

  //Initializing Datalabel
  dataLabel: Object = {
    visible: true,
    position: 'Inside',
    name: '${point.y}',
    font: {
      color: 'white',
      fontWeight: 'Bold',
      size: '14px',
    },
  };

  onAnimationComplete(args: IAccAnimationCompleteEventArgs): void {
    let centerTitle: HTMLDivElement = document.getElementById(
      'center_title'
    ) as HTMLDivElement;
    centerTitle.style.fontSize = this.getFontSize(
      args.accumulation.initialClipRect.width
    );
    let rect: ClientRect = centerTitle.getBoundingClientRect();
    centerTitle.style.top =
      args.accumulation.origin.y +
      args.accumulation.element.offsetTop -
      rect.height / 2 +
      'px';
    centerTitle.style.left =
      args.accumulation.origin.x +
      args.accumulation.element.offsetLeft -
      rect.width / 2 +
      'px';
    centerTitle.style.visibility = 'visible';
    let points: AccPoints[] = args.accumulation.visibleSeries[0].points;
    for (let point of points) {
      if (point.labelPosition === 'Outside' && point.labelVisible) {
        let label: Element = document.getElementById(
          'doughnut-container_datalabel_Series_0_text_' + point.index
        );
        label.setAttribute('fill', 'black');
      }
    }
  }

  getFontSize(width: number): string {
    if (width > 300) {
      return '13px';
    } else if (width > 250) {
      return '8px';
    } else {
      return '6px';
    }
  }
  loaded(args: ILoadedEventArgs): void {
    args.chart.refresh();
  }
  //#endregion doughnut

  @ViewChild('selectweek') selectweekComponent: SelectweekComponent;
  chartTaskRemind: ChartTaskRemind = new ChartTaskRemind();
  @ViewChild('dashboard') dashboard: TemplateRef<any>;

  taskRemind: TaskRemind = new TaskRemind();
  views: Array<ViewModel> = [];

  doughnutEmpty = [
    { label: '', value: 100 },
  ];


  constructor(private api: ApiHttpService, private changeDetectorRef: ChangeDetectorRef, private authStore: AuthStore, private route: ActivatedRoute) { }
  ngAfterViewInit(): void {
    // this.week = this.selectweekComponent.week;
    // this.fromDate = this.selectweekComponent.fromDate;
    // this.toDate = this.selectweekComponent.toDate;
    // this.daySelected = this.selectweekComponent.daySelected;
    // this.daySelectedFrom = this.selectweekComponent.daySelectedFrom;
    // this.daySelectedTo = this.selectweekComponent.daySelectedTo;
    // this.monthSelected = this.selectweekComponent.month + 1;
    this.getInitData();
  }

  ngOnInit(): void {
    this.user = this.authStore.get();
    this.model = new DataRequest();
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
  }

  private getInitData() {
    this.api.exec("TM", "ReportBusiness", "GetGeneralDataAsync", [this.model])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((task: TaskRemind) => {
        this.taskRemind = task;
        //      this.lstUser = task.listUser['result'];

        this.setDataRateDoneOnTime(task.rateDoneOnTime);
        this.setDataProgressBar(task.rateDoneAllTime);
        this.setDataDoughnutChart(task.doughnutChart);
        this.setDataTrendChart(task.trendChart);
      });
  }

  private setDataTrendChart(data) {
    this.rateDoneOnTime = data.rateDoneOnTime;
    this.dataLineTrend = data.result;
  }

  private setDataProgressBar(data) {
    this.taskRemind.rateDoneAllTime = data;
  }
  private setDataRateDoneOnTime(data) {
    this.taskRemind.rateDoneOnTime = data;
  }
  private setDataDoughnutChart(data) {
    if (data.chartPerformance && data.chartPerformance.doughnutData == 0) {
      this.setTitleRateChange(data.rateTotalChange);
    } else {
      this.doughnutData = data.chartPerformance;
      this.setTitleRateChange(data.rateTotalChange);
      this.taskRemind.totalTaskInWeek = data.count;
      this.changeDetectorRef.detectChanges();
    }
  }

  private setTitleRateChange(data) {
    this.positive = data.positive;
    this.count = data.count;
    this.rateTotalChangeValue = data.rate;
  }
}
