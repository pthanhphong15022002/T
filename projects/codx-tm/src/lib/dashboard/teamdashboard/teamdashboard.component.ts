import { Component, OnInit, ViewChild, TemplateRef, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  GradientService,
} from '@syncfusion/ej2-angular-circulargauge';
import {
  AnimationModel,
  RangeColorModel,
} from '@syncfusion/ej2-angular-progressbar';
import { AuthStore, DataRequest, UIComponent } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';
import { RemiderOnDay, TaskRemind } from '../../models/dashboard.model';

@Component({
  selector: 'team-dashboard',
  templateUrl: './teamdashboard.component.html',
  styleUrls: ['./teamdashboard.component.scss'],
  providers: [GradientService],
})
export class TeamDashboardComponent extends UIComponent implements OnInit {
  @ViewChild('tooltip') tooltip: TemplateRef<any>;
  formModel: string;
  funcID: string;
  model: DataRequest;
  taskRemind: TaskRemind = new TaskRemind();
  daySelected: Date;
  fromDate: Date;
  toDate: Date;
  daySelectedFrom: Date;
  daySelectedTo: Date;
  week: number;
  month: number;
  beginMonth: Date;
  endMonth: Date;
  remiderOnDay: RemiderOnDay[] = [];
  vlWork: any;

  public rangeColors: RangeColorModel[] = [
    { start: 0, end: 50, color: 'red' },
    { start: 50, end: 100, color: 'orange' },
  ];
  public isGradient: boolean = true;

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
  public rangeLinearGradient1: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#5465FF', offset: '0%', opacity: 0.9 },
      { color: '#04DEB7', offset: '90%', opacity: 0.9 },
    ],
  };

  public rangeLinearGradient2: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#FF8008', offset: '0%', opacity: 0.9 },
      { color: '#FFC837', offset: '90%', opacity: 0.9 },
    ],
  };

  public minorTicks: Object = {
    width: 0,
  };

  public majorTicks1: Object = {
    position: 'Outside',
    height: 1,
    width: 1,
    offset: 0,
    interval: 30,
  };
  public majorTicks2: Object = {
    height: 0,
  };

  public lineStyle: Object = {
    width: 0,
  };

  public labelStyle1: Object = { position: 'Outside', font: { size: '8px' } };
  public labelStyle2: Object = { position: 'Outside', font: { size: '0px' } };
  //#endregion gauge

  public legendSettings1: Object = {
    position: 'Top',
    visible: true,
  };

  public legendSettings2: Object = {
    position: 'Right',
    visible: true,
  };
 
  //#endregion gauge

  public piedata1: Object[];
  public piedata2: Object[];
  public legendSettings: Object = {
    position: 'Top',
    visible: true,
  };
  public legendRateDoneSettings: Object = {
    visible: true,
  };

  openTooltip() {
    console.log('mouse enter');
    this.callfc.openForm(this.tooltip, 'Đánh giá hiệu quả làm việc', 500, 700);
  }

  closeTooltip() {
    console.log('mouse leave');
  }

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

  public data: object[] = [];
  public leafItemSettings: object = {
    labelPath: 'taskGroupName',
    labelPosition: 'Center',
    labelFormat: '${taskGroupName}<br>${percentage} %',
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
    private inject: Injector,
    private auth: AuthStore,
    private tmService: CodxTMService,
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
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
      .subscribe((res: any) => {
        console.log('Team Dashboard', res);
        this.dbData = res;
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
        ];
        this.data = res.tasksByGroup;
        this.dataColumn = res.dataBarChart.barChart;
        this.dataLine = res.dataBarChart.lineChart;
        this.vlWork = res.tasksbyEmp;
      });

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
    this.getGeneralData();
  }

  private getGeneralData() {
    this.api
      .execSv('TM', 'TM', 'ReportBusiness', 'GetDataTeamDashboardAsync', [
        this.model,
      ])
      .subscribe((res: any) => {
        this.dbData = res;
        this.data = res.tasksByGroup;
      });

    this.api
      .execSv('TM', 'TM', 'ReportBusiness', 'GetTasksOfDayAsync', [
        this.model,
        this.fromDate,
        this.toDate,
      ])
      .subscribe((res: any) => {
        console.log(res);
      });
  }
}
