import { CodxTMService } from './../../codx-tm.service';
import { ActivatedRoute } from '@angular/router';
import {
  ApiHttpService,
  AuthStore,
  DataRequest,
  CallFuncService,
} from 'codx-core';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  GaugeTheme,
  ILoadedEventArgs,
} from '@syncfusion/ej2-angular-circulargauge';
import { SelectweekComponent } from 'projects/codx-share/src/lib/components/selectweek/selectweek.component';

@Component({
  selector: 'my-dashboard',
  templateUrl: './mydashboard.component.html',
  styleUrls: ['./mydashboard.component.scss'],
})
export class MyDashboardComponent implements OnInit {
  @ViewChild('selectweek') selectweekComponent: SelectweekComponent;
  formModel: string;
  funcID: string;
  model: DataRequest;
  daySelected: Date;
  fromDate: Date;
  toDate: Date;
  daySelectedFrom: Date;
  daySelectedTo: Date;
  week: number;
  month: number;
  beginMonth: Date;
  endMonth: Date;
  taskOfDay: any;
  border: {
    color: 'grey';
    width: 0;
  };
  animation: {
    enable: false;
  };

  //#region gauge
  public font1: Object = {
    size: '15px',
    color: '#00CC66',
  };

  public rangeLinearGradient: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#5465FF', offset: '0%', opacity: 1 },
      { color: '#04DEB7', offset: '70%', opacity: 1 },
    ],
  };
  
  public animation1: Object = { duration: 1500 };
  public markerWidth1: number = 90;
  public markerHeight1: number = 90;
  public lineStyle: Object = { width: 0, color: '#1d1d1d' };
  public labelStyle1: Object = { position: 'Outside', font: { size: '10px' } };
  public labelStyle2: Object = {
    position: 'Outside',
    offset: 5,
    useRangeColor: true,
    font: {
      size: '0px',
      color: 'white',
      fontFamily: 'Roboto',
      fontStyle: 'Regular',
    },
  };
  public majorTicks1: Object = {
    position: 'Outside',
    color: 'green',
    height: 5,
    width: 2,
    offset: 10,
    interval: 30,
  };
  public minorTicks1: Object = { width: 0 };
  public majorTicks2: Object = {
    height: 0,
  };
  public minorTicks2: Object = { width: 0 };
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

  public ranges: Object[] = [
    {
      start: 0,
      end: 100,
      radius: '50%',
      startWidth: 10,
      endWidth: 10,
      color: '#E0E0E0',
      roundedCornerRadius: 10,
    },
  ];

  public tail: Object = {
    length: '18%',
    color: '#757575',
  };
  public pointerCap: Object = {
    radius: 7,
    color: '#757575',
  };

  dbData: any;

  constructor(
    private api: ApiHttpService,
    private auth: AuthStore,
    private tmService: CodxTMService,
    private cf: CallFuncService,
    private activedRouter: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.model = new DataRequest();
    this.model.formName = 'TMDashBoard';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.predicate = 'Owner=@0';
    this.model.dataValue = this.auth.get().userID;
    this.model.pageLoading = false;

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
      position: 'Top'
    };
    
    this.getGeneralData();
  }

  private getGeneralData() {
    this.tmService
      .getMyDBData(
        this.model,
        this.daySelectedFrom,
        this.daySelectedTo,
        this.fromDate,
        this.toDate,
        this.beginMonth,
        this.endMonth
      )
      .subscribe((res) => {
        this.dbData = res;
        console.log('MyDB', this.dbData);
      });

    this.api
      .execSv('TM', 'TM', 'ReportBusiness', 'GetTasksOfDayAsync', [
        this.model,
        this.fromDate,
        this.toDate,
      ])
      .subscribe((res: any) => {
        this.taskOfDay = res;
        console.log(this.taskOfDay);
      });
  }

  onChangeValueSelectedWeek(data) {
    this.fromDate = data.fromDate;
    this.toDate = data.toDate;
    this.daySelected = data.daySelected;
    this.daySelectedFrom = data.daySelectedFrom;
    this.daySelectedTo = data.daySelectedTo;
    this.week = data.week;
    this.month = data.month + 1;
    this.beginMonth = data.beginMonth;
    this.endMonth = data.endMonth;
    this.getGeneralData();
    if (this.week != data.week) {
      this.week = data.week;
      this.getGeneralData();
    }
    if (this.month != data.month + 1) {
      this.month = data.month + 1;
      this.getGeneralData();
    }
  }
}
