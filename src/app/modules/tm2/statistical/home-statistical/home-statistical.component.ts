import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { TaskRemind } from '@modules/tm/models/dashboard.model';
import {
  AccPoints,
  AccumulationChart,
  AccumulationChartComponent,
  AnimationModel,
  IAccAnimationCompleteEventArgs,
  ILoadedEventArgs,
} from '@syncfusion/ej2-angular-charts';
import { CodxService, ApiHttpService, DataRequest, ViewModel, ViewType } from 'codx-core';


@Component({
  selector: 'app-home-statistical',
  templateUrl: './home-statistical.component.html',
  styleUrls: ['./home-statistical.component.scss'],
})
export class HomeStatisticalComponent implements OnInit, AfterViewInit {
  @ViewChild('main') main: TemplateRef<any>;
  model: DataRequest;

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
  palettes: string[] = ['#005DC7', '#06DDB8', '#A1231', 'red'];

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

  constructor(
    private dt: ChangeDetectorRef,
    public codxService: CodxService,
    private api: ApiHttpService
  ) { }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        sameData: false,
        active: true,
        model: {
          panelLeftRef: this.main,
        },
      },
    ];
    this.dt.detectChanges();
  }

  views: Array<ViewModel> = [];
  taskRemind: TaskRemind = new TaskRemind();

  ngOnInit(): void {
    this.model = new DataRequest();
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
    this.api
      .execSv<any>('TM', 'TM', 'ReportBusiness', 'GetGeneralDataAsync', [
        this.model,
        new Date(2022, 5, 1),
        new Date(2022, 5, 31),
      ])
      .subscribe((task) => {
        console.log(task);
        this.taskRemind = task;
        this.doughnutData = task.doughnutChart.data;
        this.dataColumn = task.barChart.barChart;
      });
  }

  public leafItemSettings: object = {
    labelPath: 'GroupTask',
    labelTemplate: '<div>{{:GroupTask}}</br>{{:Percentage}}%</div>',
  };

  public palette: object = ['red', 'green', 'blue', 'orange'];

  public treemapData: object[] = [
    {
      GroupTask: 'Phân tích',
      Count: 50,
      Percentage: 50,
    },
    {
      GroupTask: 'Phát triển',
      Count: 20,
      Percentage: 20,
    },
    {
      GroupTask: 'Design',
      Count: 20,
      Percentage: 20,
    },
    {
      GroupTask: 'Khác',
      Count: 10,
      Percentage: 10,
    },
  ];
}
