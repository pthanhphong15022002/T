import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  Injector,
  ViewEncapsulation,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { RangeColorModel } from '@syncfusion/ej2-angular-progressbar';
import {
  AuthStore,
  DataRequest,
  UIComponent,
  UserModel,
  ViewModel,
  ViewType,
} from 'codx-core';
import { ChartSettings } from 'projects/codx-om/src/lib/model/chart.model';
import { CodxTMService } from '../../codx-tm.service';

@Component({
  selector: 'teamdashboard',
  templateUrl: './teamdashboard.component.html',
  styleUrls: ['./teamdashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TeamDashboardComponent extends UIComponent implements OnInit {
  @ViewChild('content') content: TemplateRef<any>;
  @ViewChildren('team_dashboard') templates: QueryList<any>;
  views: Array<ViewModel> = [];
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
  user: UserModel;
  isDesc: boolean = true;
  tasksByGroup: object;
  status: any = {
    doneTasks: 0,
    overdueTasks: 0,
  };
  piedata: any;
  dataBarChart: any = {};
  rateDoneTaskOnTime: number = 0;
  qtyTasks: number = 0;
  vlWork = [];
  hrWork = [];
  topEmp = [
    { name: 'Lê Phạm Hoài Thương 1', tasks: 123 },
    { name: 'Lê Phạm Hoài Thương 2', tasks: 100 },
    { name: 'Lê Phạm Hoài Thương 3', tasks: 90 },
    { name: 'Lê Phạm Hoài Thương 4', tasks: 80 },
    { name: 'Lê Phạm Hoài Thương 5', tasks: 70 },
    { name: 'Lê Phạm Hoài Thương 6', tasks: 60 },
    { name: 'Lê Phạm Hoài Thương 7', tasks: 10 },
  ];

  rangeColors: RangeColorModel[] = [
    { start: 0, end: 50, color: 'red' },
    { start: 50, end: 100, color: 'orange' },
  ];
  isGradient: boolean = true;

  //#region gauge
  tooltip: Object = {
    enable: true,
  };

  font1: Object = {
    size: '15px',
    color: '#00CC66',
  };
  rangeWidth: number = 25;
  //Initializing titleStyle
  titleStyle: Object = { size: '18px' };
  font2: Object = {
    size: '15px',
    color: '#fcde0b',
  };
  rangeLinearGradient1: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#5465FF', offset: '0%', opacity: 0.9 },
      { color: '#04DEB7', offset: '90%', opacity: 0.9 },
    ],
  };

  rangeLinearGradient2: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#FF8008', offset: '0%', opacity: 0.9 },
      { color: '#FFC837', offset: '90%', opacity: 0.9 },
    ],
  };

  minorTicks: Object = {
    width: 0,
  };

  majorTicks1: Object = {
    position: 'Outside',
    height: 1,
    width: 1,
    offset: 0,
    interval: 30,
  };
  majorTicks2: Object = {
    height: 0,
  };

  lineStyle: Object = {
    width: 0,
  };

  labelStyle1: Object = { position: 'Outside', font: { size: '8px' } };
  labelStyle2: Object = { position: 'Outside', font: { size: '0px' } };
  //#endregion gauge

  legendSettings1: Object = {
    position: 'Top',
    visible: true,
  };

  legendSettings2: Object = {
    position: 'Right',
    visible: true,
  };

  //#endregion gauge

  legendSettings: Object = {
    position: 'Top',
    visible: true,
  };
  legendRateDoneSettings: Object = {
    position: 'Right',
    visible: true,
    textWrap: 'Wrap',
    height: '30%',
    width: '50%',
  };

  //#region chartcolumn
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

  headerText: Object = [
    { text: 'Khối lượng công việc' },
    { text: 'Thời gian thực hiện' },
  ];

  chartSettings2: ChartSettings = {
    title: 'Tỷ lệ công việc theo nhóm',
    seriesSetting: [
      {
        type: 'Pie',
        xName: 'status',
        yName: 'value',
        innerRadius: '80%',
        radius: '70%',
        startAngle: 0,
        explodeIndex: 1,
        explode: true,
        endAngle: 360,
      },
    ],
    service: 'OM',
    assembly: 'ERM.Business.OM',
    className: 'DashBoardBusiness',
    method: 'GetChartData1Async',
  };

  chartSettings5: ChartSettings = {
    title: 'Thống kê công việc hoàn thành và số giờ thực hiện',
    seriesSetting: [
      {
        type: 'Column',
        name: 'Tasks',
        xName: 'label',
        yName: 'value',
        cornerRadius: { topLeft: 10, topRight: 10 },
      },
    ],
  };

  panels = [];
  datas = [];

  constructor(
    private inject: Injector,
    private auth: AuthStore,
    private tmService: CodxTMService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
    this.user = this.auth.get();
    this.model = new DataRequest();
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
    this.model.predicate = 'OrgUnitID = @0';
    this.model.dataValue = this.user.employee?.orgUnitID;
  }

  onInit(): void {
    this.panels = JSON.parse(
      '[{"id":"0.5293183694893755_layout","row":5,"col":16,"sizeX":7,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.7462735198778399_layout","row":5,"col":0,"sizeX":16,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.932033280876619_layout","row":1,"col":16,"sizeX":7,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.6076202141678433_layout","row":1,"col":8,"sizeX":8,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.5296463903570827_layout","row":1,"col":0,"sizeX":8,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.18375208371519292_layout","row":0,"col":0,"sizeX":23,"sizeY":1,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null}]'
    );
    this.datas = JSON.parse(
      '[{"panelId":"0.5293183694893755_layout","data":"6"},{"panelId":"0.7462735198778399_layout","data":"5"},{"panelId":"0.932033280876619_layout","data":"4"},{"panelId":"0.6076202141678433_layout","data":"3"},{"panelId":"0.5296463903570827_layout","data":"2"},{"panelId":"0.18375208371519292_layout","data":"1"}]'
    );
    this.getGeneralData();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.content,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  getGeneralData() {
    this.tmService.getTeamDBData(this.model).subscribe((res: any) => {
      if (res) {
      }
    });
  }
}
