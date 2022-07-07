import { CodxTMService } from './../../codx-tm.service';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, AuthStore, DataRequest } from 'codx-core';
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

  dbData: any;

  constructor(
    private api: ApiHttpService,
    private auth: AuthStore,
    private tmService: CodxTMService,
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
