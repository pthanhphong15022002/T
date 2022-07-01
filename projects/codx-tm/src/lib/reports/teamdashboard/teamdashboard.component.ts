import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  GaugeTheme,
  ILoadedEventArgs,
} from '@syncfusion/ej2-angular-circulargauge';
import { ApiHttpService, AuthStore, DataRequest } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';
import { RemiderOnDay, TaskRemind } from '../../models/dashboard.model';

@Component({
  selector: 'team-dashboard',
  templateUrl: './teamdashboard.component.html',
  styleUrls: ['./teamdashboard.component.scss'],
})
export class TeamDashboardComponent implements OnInit {
  formModel: string;
  funcID: string;
  model: DataRequest;
  taskRemind: TaskRemind = new TaskRemind();
  fromDate: Date;
  toDate: Date;
  daySelected: Date;
  daySelectedFrom: Date;
  daySelectedTo: Date;
  remiderOnDay: RemiderOnDay[] = [];

  //#region gauge
  public font1: Object = {
    size: '15px',
    color: '#00CC66',
  };
  public rangeWidth: number = 25;
  //Initializing titleStyle
  public titleStyle: Object = { size: '18px' };
  public font2: Object = {
    size: '15px',
    color: '#fcde0b',
  };
  // custom code start
  public load(args: ILoadedEventArgs): void {
    let selectedTheme: string = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    args.gauge.theme = <GaugeTheme>(
      (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1))
        .replace(/-dark/i, 'Dark')
        .replace(/contrast/i, 'Contrast')
    );
  }

  public animation1: Object = { duration: 1500 };
  public markerWidth: number = 28;
  public markerHeight: number = 28;
  public value: number = 12;
  public markerWidth1: number = 90;
  public markerHeight1: number = 90;
  public lineStyle: Object = { width: 0, color: '#1d1d1d' };
  public labelStyle: Object = { font: { size: '0px' } };
  public majorTicks: Object = { interval: 20, width: 0 };
  public minorTicks: Object = { width: 0 };
  //#endregion gauge

  public piedata1: Object[];
  public piedata2: Object[];
  public legendSettings: Object;

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

  public headerText: Object = [
    { text: 'Khối lượng công việc' },
    { text: 'Thời gian thực hiện' },
  ];

  public data: object[] = [
    {
      taskGroupName: 'Công việc kiểm thử States',
      tasks: 20,
      percentage: 20,
      rank: 1,
    },
    {
      taskGroupName: 'Chuyển codx sang control',
      tasks: 50,
      percentage: 50,
      rank: 2,
    },
    { taskGroupName: 'Phân tích', tasks: 10, percentage: 10, rank: 3 },
    {
      taskGroupName: 'Quá trình thực hiện chuyển đổi',
      tasks: 20,
      percentage: 20,
      rank: 4,
    },
  ];
  public leafItemSettings: object = {
    labelPath: 'taskGroupName',
    labelPosition: 'Center',
    labelFormat: '${taskGroupName}<br>${percentage} %)',
    colorMapping: [
      {
        from: 50,
        to: 100,
        color: '#0062ff',
      },
      {
        from: 20,
        to: 50,
        color: '#4a8af0',
      },
      {
        from: 10,
        to: 20,
        color: '#7aaaf5',
      },
      {
        from: 0,
        to: 10,
        color: '#c6d9f7',
      },
    ],
  };

  dbData: any;

  constructor(
    private api: ApiHttpService,
    private auth: AuthStore,
    private tmService: CodxTMService,
    private activedRouter: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.model = new DataRequest();
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;

    this.api
      .execSv(
        'TM',
        'TM',
        'ReportBusiness',
        'GetDataTeamDashboardAsync',
        this.model
      )
      .subscribe((res:any) => {
        console.log('Team Dashboard', res);
        this.dbData = res
        this.piedata1 = [
          {
            x: 'Chưa thực hiện',
            y: res.newTasks,
          },
          {
            x: 'Đang thực hiên',
            y: res.processingTasks,
          },
          {
            x: 'Hoàn tất',
            y: res.doneTasks,
          },
          {
            x: 'Hoãn lại',
            y: res.postponeTasks,
          },
          {
            x: 'Bị huỷ',
            y: res.canceledTasks,
          },
        ]
      });

    this.funcID = this.activedRouter.snapshot.params['funcID'];

    this.piedata1 = [
      {
        x: 'Group 1',
        y: 2,
      },
      {
        x: 'Group 2',
        y: 5,
      },
    ];

    this.piedata2 = [
      {
        x: 'Group 1',
        y: 2,
      },
      {
        x: 'Group 2',
        y: 5,
      },
    ];
    this.legendSettings = {
      visible: true,
    };
  }

  private getInitData() {}

  onChangeValueSelectedWeek(data) {
    this.fromDate = data.fromDate;
    this.toDate = data.toDate;
    this.daySelected = data.daySelected;
    this.daySelectedFrom = data.daySelectedFrom;
    this.daySelectedTo = data.daySelectedTo;
  }
}
