import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  ChartTaskRemind,
  RemiderOnDay,
  TaskRemind,
} from '@modules/tm/models/dashboard.model';
import { SelectweekComponent } from '@shared/components/selectweek/selectweek.component';
import {
  AccPoints,
  AccumulationChart,
  AccumulationChartComponent,
  AnimationModel,
  IAccAnimationCompleteEventArgs,
  ILoadedEventArgs,
} from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthStore, DataRequest, UserModel } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'owner-task-dashboard',
  templateUrl: './owner-task-dashboard.component.html',
  styleUrls: ['./owner-task-dashboard.component.scss'],
})
export class OwnerTaskDashboardComponent implements OnInit {
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
  rateTotalChange: string;
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
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore
  ) {}

  ngOnInit(): void {
    this.user = this.authStore.get();
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
    this.getGeneralData();
  }

  getGeneralData() {
    this.api
      .exec('TM', 'TaskBusiness', 'GetGeneralDataAsync', [
        this.model,
        this.daySelectedFrom,
        this.daySelectedTo,
        this.fromDate,
        this.toDate,
        this.selectweekComponent.beginMonth,
        this.selectweekComponent.endMonth,
      ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((task: TaskRemind) => {
        this.taskRemind = task;
      });
  }

  onChangeValueSelectedWeek(data) {
    this.fromDate = data.fromDate;
    this.toDate = data.toDate;
    this.daySelected = data.daySelected;
    this.daySelectedFrom = data.daySelectedFrom;
    this.daySelectedTo = data.daySelectedTo;
    if (this.week != data.week) {
      this.week = data.week;
      this.getDataDonutChart(data.week);
    }
    if (this.monthSelected != data.month + 1) {
      this.monthSelected = data.month + 1;
      this.getDataCombineChart(data.beginMonth, data.endMonth);
    }
  }

  //#region get/set data chart A1.3
  getDataTrendChart() {
    this.dataLineTrend;
  }

  setDataTrendChart(data) {
    this.chartTaskRemind = data.chartTaskRemind;
  }
  //#endregion Chart A1.3

  //#region get/set data chart  A1.4
  getDataProcessBar() {}

  setDataProcessBar() {}
  //#endregion Chart A1.4

  //#region get/set data chart A1.5
  getDataDonutChart(week: Date) {
    this.doughnutData;
  }

  setDataDonutChart(data) {
    if (data.chartPerformance && data.chartPerformance.doughnutData == 0) {
      //this.palettes = this.palettesEmpty;
      // this.rateTotalChange = this.getTitleRateChange(
      //   data.chartPerformance.rateTotalChange
      // );
    } else {
      this.doughnutData = data.chartPerformance.doughnutData;
      // this.rateTotalChange = this.getTitleRateChange(
      //   data.chartPerformance.rateTotalChange
      // );
    }
    this.dataLineTrend = data.trendChart.result;
    this.changeDetectorRef.detectChanges();
  }
  //#endregion Chart A1.5

  //#region get/set data chart A1.6
  getDataCombineChart(beginMonth: Date, endMonth: Date) {
    let option = this.model;
    option.predicate =
      'CompletedOn.Value >= @0 and CompletedOn.Value <=@1 and Owner == @2 and Status == @3';
    option.dataValue = `${beginMonth.toISOString()};${endMonth.toISOString()};${
      this.user.userID
    };9`;

    this.api
      .exec('TM', 'TaskBusiness', 'GetDataBarChartAsync', [
        option,
        beginMonth,
        endMonth,
      ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: any) => {
        if (data) {
          this.setDataCombineChart(data);
        }
      });
  }

  setDataCombineChart(data) {
    if (data.hasOwnProperty('barChart')) {
      this.dataColumn = data.barChart;
    }
    if (data.hasOwnProperty('lineChart')) {
      this.dataLine = data.lineChart;
    }
    this.changeDetectorRef.detectChanges();
  }
  //#endregion Chart A1.6
}
