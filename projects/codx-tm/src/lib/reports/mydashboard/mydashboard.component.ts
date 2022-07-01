import { ActivatedRoute } from '@angular/router';
import { CodxTMService } from './../../codx-tm.service';
import { ApiHttpService, AuthStore, DataRequest } from 'codx-core';
import { Component, OnInit } from '@angular/core';
import { RemiderOnDay, TaskRemind } from '../../models/dashboard.model';
import {
  GaugeTheme,
  ILoadedEventArgs,
} from '@syncfusion/ej2-angular-circulargauge'; 
//-- cmt tạm vì pull lỗi


@Component({
  selector: 'my-dashboard',
  templateUrl: './mydashboard.component.html',
  styleUrls: ['./mydashboard.component.scss'],
})
export class MyDashboardComponent implements OnInit {
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
  // cmt tạm vì pull l
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
    this.model.predicate = 'Owner=@0';
    this.model.dataValue = this.auth.get().userID;
    this.model.pageLoading = false;

    this.api
      .execSv(
        'TM',
        'TM',
        'ReportBusiness',
        'GetDataMyDashboardAsync',
        this.model
      )
      .subscribe((res) => {
        console.log('MyDashboard', res);
      });

    this.funcID = this.activedRouter.snapshot.params['funcID'];

    this.piedata1 = [{
      x: 'Group 1',
      y: 2
    },{
      x: 'Group 2',
      y: 5
    }];

    this.piedata2 = [{
      x: 'Group 1',
      y: 2
    },{
      x: 'Group 2',
      y: 5
    }];
    this.legendSettings = {
       visible: true
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
