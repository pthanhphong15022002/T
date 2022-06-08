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
import { ApiHttpService, AuthStore, DataRequest } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import {
  AccPoints,
  IAccAnimationCompleteEventArgs,
  ILoadedEventArgs,
  AccumulationChartComponent,
  AccumulationChart,
  AnimationModel,
} from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  fromDate: Date;
  toDate: Date;
  daySelected: Date;
  daySelectedFrom: Date;
  daySelectedTo: Date;
  monthSelected: any;
  beginMonth: Date;
  endMonth: Date;
  week: number;
  rateTotalChangeValue: number = null;
  rateTotalChange: string;

  views: Array<ViewModel> = [];
  @ViewChild('dashboard') dashboard: TemplateRef<any>;
  @ViewChild('selectweek') selectweekComponent: SelectweekComponent;
  remiderOnDay: RemiderOnDay[] = [];
  chartTaskRemind: ChartTaskRemind = new ChartTaskRemind();
  taskRemind: TaskRemind = new TaskRemind();
  model: DataRequest;
  user: any;
  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
    private route: ActivatedRoute
  ) {}
  public ngUnsubscribe = new Subject<void>();
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: 'content',
        active: true,
        model: {
          panelLeftRef: this.dashboard,
        },
      },
    ];

    this.week = this.selectweekComponent.week;
    this.fromDate = this.selectweekComponent.fromDate;
    this.toDate = this.selectweekComponent.toDate;
    this.daySelected = this.selectweekComponent.daySelected;
    this.daySelectedFrom = this.selectweekComponent.daySelectedFrom;
    this.daySelectedTo = this.selectweekComponent.daySelectedTo;
    this.monthSelected = this.selectweekComponent.month;
    this.getGeneralData();
  }

  ngOnInit(): void {
    this.user = this.authStore.get();
    this.model = new DataRequest();
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
    this.doughnutData = this.doughnutEmpty;
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
      .subscribe((data: TaskRemind) => {
        this.taskRemind = data;
        this.remiderOnDay = data.listTaskByDay['result'];
        //set data Chart
        this.setDataChart(data.chartData);

        //Set data chart colum
        this.setDataChartBar(data.barChart);
      });
  }

  getChartData() {
    let option = this.model;
    option.predicate = 'DueDate.Value >= @0 and DueDate.Value <= @1';
    option.dataValue = `${this.fromDate.toISOString()};${this.toDate.toISOString()}`;
    this.api
      .exec('TM', 'TaskBusiness', 'GetDataChartAsync', [
        option,
        this.fromDate,
        this.toDate,
      ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: any) => {
        if (data) this.setDataChart(data);
      });
  }

  getDataBarChart(beginMonth: Date, endMonth: Date) {
    let option = this.model;
    // option.predicate = "CompletedOn.Value >= @0 and CompletedOn.Value <=@1 and Owner == @2 and Status == @3";
    // option.dataValue = `${beginMonth.toISOString()};${endMonth.toISOString()};${this.user.userID};9`;
    this.api
      .exec('TM', 'TaskBusiness', 'GetDataBarChartAsync', [
        option,
        beginMonth,
        endMonth,
      ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: any) => {
        if (data) this.setDataChartBar(data);
      });
  }

  GetDataWorkOnDay() {
    let option = this.model;
    option.predicate = 'DueDate.Value >= @0 and DueDate.Value <= @1';
    option.dataValue = `${this.daySelectedFrom.toISOString()};${this.daySelectedTo.toISOString()}`;
    this.api
      .exec('TM', 'TaskBusiness', 'GetDataWorkOnDayAsync', [
        option,
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
    this.GetDataWorkOnDay();
    if (this.week != data.week) {
      this.week = data.week;
      this.getChartData();
    }
    if (this.monthSelected != data.month) {
      this.monthSelected = data.month + 1;
      this.getDataBarChart(data.beginMonth, data.endMonth);
    }
  }

  getTitleRateChange(rateTotalChange: number) {
    let title = rateTotalChange >= 100 ? 'Tăng' : 'Giảm';
    let rate = rateTotalChange >= 100 ? Math.abs(100 - rateTotalChange) : Math.abs(rateTotalChange - 100);
    this.rateTotalChangeValue = rateTotalChange;
    return title + ` ${rate}% công việc so với tuần trước`;
  }

  setDataChart(data: any) {
    this.chartTaskRemind = data.chartTaskRemind;
    //Peformence chart
    if (data.chartPerformance && data.chartPerformance.doughnutData == 0) {
      this.doughnutData = this.doughnutEmpty;
      this.palettes = this.palettesEmpty;
      this.rateTotalChange = this.getTitleRateChange(
        data.chartPerformance.rateTotalChange
      );
    } else {
      this.doughnutData = data.chartPerformance.doughnutData;
      this.rateTotalChange = this.getTitleRateChange(
        data.chartPerformance.rateTotalChange
      );
      // this.renderMiddleText(data.chartPerformance.rateTotalChange);
    }
    //trending chart
    this.dataLineTrend = data.trendChart.result;
    this.changeDetectorRef.detectChanges();
  }

  setDataChartBar(data: any) {
    if (data.hasOwnProperty('barChart')) {
      this.dataColumn = data.barChart;
    }
    if (data.hasOwnProperty('lineChart')) {
      this.dataLine = data.lineChart;
    }
    this.changeDetectorRef.detectChanges();
  }
  //#region chartline
  public dataLineTrend: Object[] = [];
  public lineXAxis: Object = {
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

  public lineYAxis: Object = {
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 0 },
    labelStyle: {
      color: 'transparent',
    },
  };
  public markerLine: Object = {
    visible: false,
    height: 5,
    width: 5,
  };
  public tooltip: Object = {
    enable: false,
  };
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

  //#endregion chartcolumn

  //#region donut
  pie: AccumulationChartComponent | AccumulationChart;
  execute = false;
  count = 0;
  startAngle: number = 0;
  endAngle: number = 360;
  doughnutEmpty = [{ label: '', value: 100 }];
  doughnutData = [];
  palettesEmpty = ['#deeeeee'];
  palettes: string[] = ['#005DC7', '#06DDB8'];

  //Initializing Datalabel
  public dataLabel: Object = {
    visible: true,
    position: 'Inside',
    name: '${point.y}',
    font: {
      color: 'white',
      fontWeight: 'Bold',
      size: '14px',
    },
  };

  public onAnimationComplete(args: IAccAnimationCompleteEventArgs): void {
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

  public getFontSize(width: number): string {
    if (width > 300) {
      return '13px';
    } else if (width > 250) {
      return '8px';
    } else {
      return '6px';
    }
  }
  public loaded(args: ILoadedEventArgs): void {
    args.chart.refresh();
  }
  //#endregion doughnut
}
