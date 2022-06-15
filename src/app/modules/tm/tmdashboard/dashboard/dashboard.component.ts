import { ActivatedRoute } from '@angular/router';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';
import { SelectweekComponent } from '@shared/components/selectweek/selectweek.component';
import {
  ChartTaskRemind,
  RemiderOnDay,
  TaskRemind,
} from '@modules/tm/models/dashboard.model';
import { ApiHttpService, AuthStore, DataRequest, UserModel } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import {
  AccPoints,
  IAccAnimationCompleteEventArgs,
  ILoadedEventArgs,
  AccumulationChartComponent,
  AccumulationChart,
  AnimationModel,
} from '@syncfusion/ej2-angular-charts';
import { TmService } from '@modules/tm/tm.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
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
  remiderOnDay: RemiderOnDay[] = [];
  taskRemind: TaskRemind = new TaskRemind();
  chartTaskRemind: ChartTaskRemind = new ChartTaskRemind();

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
  palettes: string[] = ['#005DC7', '#06DDB8'];

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

  constructor(
    private tmService: TmService,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore
  ) {}

  ngOnInit(): void {
    this.model = new DataRequest();
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
  }

  ngAfterViewInit(): void {
    this.week = this.selectweekComponent.week;
    this.fromDate = this.selectweekComponent.fromDate;
    this.toDate = this.selectweekComponent.toDate;
    this.daySelected = this.selectweekComponent.daySelected;
    this.daySelectedFrom = this.selectweekComponent.daySelectedFrom;
    this.daySelectedTo = this.selectweekComponent.daySelectedTo;
    this.monthSelected = this.selectweekComponent.month + 1;
    this.getInitData();
  }

  onChangeValueSelectedWeek(data) {
    this.fromDate = data.fromDate;
    this.toDate = data.toDate;
    this.daySelected = data.daySelected;
    this.daySelectedFrom = data.daySelectedFrom;
    this.daySelectedTo = data.daySelectedTo;
    this.getGeneralData();
    if (this.week != data.week) {
      this.week = data.week;
      this.getGeneralData();
    }
    if (this.monthSelected != data.month + 1) {
      this.monthSelected = data.month + 1;
      this.getGeneralData();
    }
  }

  private getInitData() {
    this.tmService
      .getChartData(
        this.model,
        this.daySelectedFrom,
        this.daySelectedTo,
        this.fromDate,
        this.toDate,
        this.selectweekComponent.beginMonth,
        this.selectweekComponent.endMonth
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((task: TaskRemind) => {
        this.taskRemind = task;
        this.remiderOnDay = task.listTaskByDay['result'];
        this.setDataTrendChart(task.trendChart);
        this.setDataProgressBar(task.rateDoneAllTime);
        this.setDataDoughnutChart(task.doughnutChart);
        this.setDataCombineChart(task.barChart);
      });
  }

  private getGeneralData() {
    this.tmService
      .getChartData(
        this.model,
        this.daySelectedFrom,
        this.daySelectedTo,
        this.fromDate,
        this.toDate,
        this.selectweekComponent.beginMonth,
        this.selectweekComponent.endMonth
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((task: TaskRemind) => {
        this.taskRemind = task;
        this.remiderOnDay = task.listTaskByDay['result'];
        this.setDataDoughnutChart(task.doughnutChart);
        this.setDataCombineChart(task.barChart);
      });
  }

  //#region A1.3
  private setDataTrendChart(data) {
    this.rateDoneOnTime = data.rateDoneOnTime;
    this.dataLineTrend = data.result;
  }
  //#endregion A1.3

  //#region A1.4
  private setDataProgressBar(data) {
    this.taskRemind.rateDoneAllTime = data;
  }
  //#endregion A1.4

  //#region A1.5
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
  //#endregion A1.5

  //#region A1.6
  private setDataCombineChart(data) {
    if (data.hasOwnProperty('barChart')) {
      this.dataColumn = data.barChart;
    }
    if (data.hasOwnProperty('lineChart')) {
      this.dataLine = data.lineChart;
    }
    this.changeDetectorRef.detectChanges();
  }
  //#endregion A1.6
  private setTitleRateChange(data) {
    this.positive = data.positive;
    this.rateTotalChangeValue = data.rate;
    let title = this.positive ? 'Tăng' : 'Giảm';
    console.log(this.rateTotalChangeValue);
    this.rateTotalChange = `${title} hơn ${this.rateTotalChangeValue} % so với tuần trước`;
  }
}
