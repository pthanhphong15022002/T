import {
  Component,
  Injector,
  AfterViewInit,
  TemplateRef,
  ViewChild,
  Input,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AnimationModel,
  ProgressBar,
  RangeColorModel,
} from '@syncfusion/ej2-angular-progressbar';
import {
  ButtonModel,
  PageTitleService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { ChartSettings } from './models/chart.model';

export class GridModels {
  pageSize: number;
  entityName: string;
  entityPermission: string;
  formName: string;
  gridViewName: string;
  funcID: string;
  dataValues: string;
  predicates: string;
}

@Component({
  selector: 'app-tmdashboard',
  templateUrl: './tmdashboard.component.html',
  styleUrls: ['./tmdashboard.component.scss'],
})
export class TMDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChildren('my_dashboard') templates1: QueryList<any>;
  @ViewChildren('team_dashboard') templates2: QueryList<any>;
  @ViewChildren('assign_dashboard') templates3: QueryList<any>;

  @ViewChild('annotation1') annotation: ProgressBar;

  @Input() panels1: any;
  @Input() datas1: any;
  @Input() panels2: any;
  @Input() datas2: any;
  @Input() panels3: any;
  @Input() datas3: any;
  arrReport: any = [];
  viewType = ViewType;
  views: Array<ViewModel> = [];
  dashboard = [];
  funcID: string = 'TMD';
  reportID: string = 'TMD001';

  templates: QueryList<any>;

  myDBData: any;
  teamDBData: any;
  assignDBData: any;

  isEditMode: boolean = false;

  paletteColor = ['#06ddb8', '#a6dff5'];

  // paletteColorTopChart = ['#005dc7', '#0078ff', ''];

  chartSettings6: ChartSettings = {
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
  };

  chartSettings7: ChartSettings = {
    title: 'Thống kê công việc hoàn thành và số giờ thực hiện',
    seriesSetting: [
      {
        type: 'Column',
        name: 'Tasks',
        xName: 'label',
        yName: 'value1',
        cornerRadius: { topLeft: 10, topRight: 10 },
      },
      {
        type: 'Line',
        name: 'WorkHours',
        xName: 'label',
        yName: 'value2',
        cornerRadius: { topLeft: 10, topRight: 10 },
      },
    ],
  };

  // dataSource: any;

  // // custom code end
  titleSettings: object = {
    text: 'Car Sales by Country - 2017',
    textStyle: {
      size: '15px',
    },
  };

  public tooltipSettings: object = {
    visible: true,
    format: 'Country: ${Continent}<br>Company: ${Company}<br>Sales: ${Sales}',
  };

  public legendSettings: object = {
    visible: true,
    position: 'Top',
    shape: 'Rectangle',
  };

  weightValuePath: string = 'Sales';

  border: object = {
    color: 'white',
    width: 0.5,
  };

  topEmp = [];

  dataSource: any;

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
  rangeWidth: number = 10;
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
    interval: 25,
  };

  majorTicks2: Object = {
    height: 0,
  };

  lineStyle: Object = {
    width: 0,
  };

  labelStyle1: Object = { position: 'Outside', font: { size: '10px' } };
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

  // legendSettings: Object = {
  //   position: 'Top',
  //   visible: true,
  // };
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
        xName: 'taskGroupName',
        yName: 'percentage',
        innerRadius: '80%',
        radius: '70%',
        startAngle: 0,
        explodeIndex: 1,
        explode: true,
        endAngle: 360,
      },
    ],
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

  stacked_data: Object[] = [
    {
      Year: '2013',
      General: 9628912,
      Honda: 4298390,
    },
    {
      Year: '2014',
      General: 9609326,
      Honda: 4513769,
    },
  ];

  public animation: AnimationModel = {
    enable: true,
    duration: 2000,
    delay: 0,
  };

  public annotaions: Object = [
    {
      content:
        '<div id="pointervalue" style="font-size:35px;width:120px;text-align:center;">' +
        '60' +
        '/100</div>',
      angle: 0,
      zIndex: '1',
      radius: '0%',
    },
    {
      content: '<div id="slider" style="height:70px;width:250px;"></div>',
      angle: 0,
      zIndex: '1',
      radius: '-100%',
    },
  ];

  buttons: Array<ButtonModel> = [];

  data1 = [
    { Product: 'TV : 30 (12%)', Percentage: 12, TextMapping: 'TV, 30 <br>12%' },
    { Product: 'PC : 20 (8%)', Percentage: 8, TextMapping: 'PC, 20 <br>8%' },
    {
      Product: 'Laptop : 40 (16%)',
      Percentage: 16,
      TextMapping: 'Laptop, 40 <br>16%',
    },
    {
      Product: 'Mobile : 90 (36%)',
      Percentage: 36,
      TextMapping: 'Mobile, 90 <br>36%',
    },
    {
      Product: 'Camera : 27 (11%)',
      Percentage: 11,
      TextMapping: 'Camera, 27 <br>11%',
    },
  ];

  constructor(
    inject: Injector,
    private pageTitle: PageTitleService,
    private routerActive: ActivatedRoute
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.buttons = [
      {
        id: '1',
        icon: 'icon-format_list_bulleted icon-18',
        text: ' List',
      },
      {
        id: '2',
        icon: 'icon-appstore icon-18',
        text: ' Card',
      },
    ];
    this.panels1 = JSON.parse(
      '[{"id":"0.1636284528927885_layout","row":0,"col":0,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.5801149283702021_layout","row":0,"col":8,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.6937258303982936_layout","row":4,"col":0,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.5667390469747078_layout","row":4,"col":8,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.4199281088325755_layout","row":0,"col":16,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ công việc được giao"},{"id":"0.4592017601751599_layout","row":0,"col":32,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Theo nguồn công việc"},{"id":"0.06496875406606994_layout","row":8,"col":16,"sizeX":16,"sizeY":12,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null,"header":"Hiệu suất làm việc"},{"id":"0.21519762020962552_layout","row":8,"col":0,"sizeX":16,"sizeY":12,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ hoàn thành công việc"},{"id":"0.3516224838830073_layout","row":20,"col":0,"sizeX":32,"sizeY":12,"minSizeX":32,"minSizeY":12,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê công việc hoàn thành và số giờ thực hiện"},{"id":"0.36601875176456145_layout","row":8,"col":32,"sizeX":16,"sizeY":24,"minSizeX":16,"minSizeY":24,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ công việc theo nhóm"}]'
    );
    this.datas1 = JSON.parse(
      '[{"panelId":"0.1636284528927885_layout","data":"1"},{"panelId":"0.5801149283702021_layout","data":"2"},{"panelId":"0.6937258303982936_layout","data":"3"},{"panelId":"0.5667390469747078_layout","data":"4"},{"panelId":"0.4199281088325755_layout","data":"5"},{"panelId":"0.4592017601751599_layout","data":"6"},{"panelId":"0.21519762020962552_layout","data":"7"},{"panelId":"0.06496875406606994_layout","data":"8"},{"panelId":"0.36601875176456145_layout","data":"9"},{"panelId":"0.3516224838830073_layout","data":"10"}]'
    );
    this.panels2 = JSON.parse(
      '[{"id":"0.7158772861178662_layout","row":0,"col":0,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.6630241925546723_layout","row":0,"col":8,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.2853680268255028_layout","row":0,"col":16,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.007499361474228472_layout","row":0,"col":24,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.023172028709681936_layout","row":0,"col":32,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.31080209919803936_layout","row":0,"col":40,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.8927326695370017_layout","row":4,"col":0,"sizeX":16,"sizeY":16,"minSizeX":16,"minSizeY":16,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ công việc theo nhóm"},{"id":"0.8302215091444525_layout","row":4,"col":16,"sizeX":16,"sizeY":16,"minSizeX":16,"minSizeY":16,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ hoàn thành đúng hạn của nhân viên"},{"id":"0.7731673204748104_layout","row":4,"col":32,"sizeX":16,"sizeY":16,"minSizeX":16,"minSizeY":16,"maxSizeX":null,"maxSizeY":null,"header":"Top nhân viên hoàn thành nhiều công việc nhất"},{"id":"0.9527549374583961_layout","row":20,"col":0,"sizeX":32,"sizeY":12,"minSizeX":32,"minSizeY":12,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê công việc hoàn thành và số giờ thực hiện"},{"id":"0.7371661853933429_layout","row":20,"col":32,"sizeX":16,"sizeY":12,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header": "Hiệu suất làm việc"}]'
    );
    this.datas2 = JSON.parse(
      '[{"panelId":"0.7158772861178662_layout","data":"1"},{"panelId":"0.6630241925546723_layout","data":"2"},{"panelId":"0.2853680268255028_layout","data":"3"},{"panelId":"0.007499361474228472_layout","data":"4"},{"panelId":"0.023172028709681936_layout","data":"5"},{"panelId":"0.31080209919803936_layout","data":"6"},{"panelId":"0.8927326695370017_layout","data":"7"},{"panelId":"0.8302215091444525_layout","data":"8"},{"panelId":"0.7731673204748104_layout","data":"9"},{"panelId":"0.9527549374583961_layout","data":"10"},{"panelId":"0.7371661853933429_layout","data":"11"}]'
    );
    this.panels3 = JSON.parse(
      '[{"id":"0.0014514686635016538_layout","row":0,"col":8,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.19694528981098758_layout","row":0,"col":24,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.7062776900074157_layout","row":0,"col":16,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.9240829789281733_layout","row":0,"col":0,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.3905464098807283_layout","row":0,"col":32,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.6324365355784578_layout","row":0,"col":40,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.7307926980008612_layout","row":4,"col":0,"sizeX":16,"sizeY":32,"minSizeX":16,"minSizeY":32,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ công việc theo nguồn"},{"id":"0.09230805583161117_layout","row":4,"col":16,"sizeX":16,"sizeY":16,"minSizeX":16,"minSizeY":16,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ công việc theo dự án"},{"id":"0.4142359240869473_layout","row":4,"col":32,"sizeX":16,"sizeY":16,"minSizeX":16,"minSizeY":16,"maxSizeX":null,"maxSizeY":null,"header":"Top nhân viên hoàn thành nhiều công việc nhất"},{"id":"0.13567559377635385_layout","row":20,"col":16,"sizeX":16,"sizeY":16,"minSizeX":16,"minSizeY":16,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê công việc theo dự án"},{"id":"0.0919781174656844_layout","row":20,"col":32,"sizeX":16,"sizeY":16,"minSizeX":16,"minSizeY":16,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ hoàn thành đúng hạn giao việc"}]'
    );
    this.datas3 = JSON.parse(
      '[{"panelId":"0.9240829789281733_layout","data":"1"},{"panelId":"0.0014514686635016538_layout","data":"2"},{"panelId":"0.7062776900074157_layout","data":"3"},{"panelId":"0.19694528981098758_layout","data":"4"},{"panelId":"0.3905464098807283_layout","data":"5"},{"panelId":"0.6324365355784578_layout","data":"6"},{"panelId":"0.7307926980008612_layout","data":"7"},{"panelId":"0.09230805583161117_layout","data":"8"},{"panelId":"0.4142359240869473_layout","data":"9"},{"panelId":"0.13567559377635385_layout","data":"10"},{"panelId":"0.0919781174656844_layout","data":"11"}]'
    );
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        reportType: 'D',
        reportView: true,
        showFilter: true,

        model: {
          panelRightRef: this.template,
        },
      },
    ];
    this.pageTitle.setBreadcrumbs([]);
    this.routerActive.queryParams.subscribe((res) => {
      if (res.reportID) {
        this.reportID = res.reportID;
        this.isLoaded = false;
        let reportItem: any = this.arrReport.find(
          (x: any) => x.reportID == res.reportID
        );
        if (reportItem) {
          let pinnedParams = reportItem.parameters?.filter((x: any) => x.isPin);
          if (pinnedParams) this.view.pinedReportParams = pinnedParams;
        }
        switch (res.reportID) {
          case 'TMD001':
            this.getMyDashboardData();
            break;
          case 'TMD002':
            this.getTeamDashboardData();
            break;
          case 'TMD003':
            this.getAssignDashboardData();
            break;
          default:
            break;
        }
      }
    });
    this.detectorRef.detectChanges();
  }

  isLoaded: boolean = false;

  getMyDashboardData(predicates?: string, dataValues?: string, params?: any) {
    let model = new GridModels();
    model.funcID = this.funcID;
    model.entityName = 'TM_Tasks';
    model.predicates = predicates;
    model.dataValues = dataValues;
    this.api
      .exec('TM', 'TaskBusiness', 'GetDataMyDashboardAsync', [model, params])
      .subscribe((res) => {
        this.myDBData = res;

        setTimeout(() => {
          this.isLoaded = true;
        }, 500);
      });

    this.detectorRef.detectChanges();
  }

  getTeamDashboardData(predicates?: string, dataValues?: string, params?: any) {
    let model = new GridModels();
    model.funcID = this.funcID;
    model.entityName = 'TM_Tasks';
    model.predicates = predicates;
    model.dataValues = dataValues;
    this.api
      .exec('TM', 'TaskBusiness', 'GetDataTeamDashboardAsync', [model, params])
      .subscribe((res) => {
        this.teamDBData = res;
        setTimeout(() => {
          this.isLoaded = true;
        }, 500);
      });

    this.detectorRef.detectChanges();
  }

  getAssignDashboardData(
    predicates?: string,
    dataValues?: string,
    params?: any
  ) {
    let model = new GridModels();
    model.funcID = this.funcID;
    model.entityName = 'TM_Tasks';
    model.predicates = predicates;
    model.dataValues = dataValues;
    this.api
      .exec('TM', 'TaskBusiness', 'GetDataAssignDashboardAsync', [
        model,
        params,
      ])
      .subscribe((res) => {
        this.assignDBData = res;
        setTimeout(() => {
          this.isLoaded = true;
        }, 500);

        console.log('assignDBData', this.assignDBData);
      });

    this.detectorRef.detectChanges();
  }

  filterChange(e: any) {
    this.isLoaded = false;
    const { predicates, dataValues } = e[0];
    const param = e[1];

    switch (this.reportID) {
      case 'TMD001':
        this.getMyDashboardData(predicates, dataValues, param);
        break;
      case 'TMD002':
        this.getTeamDashboardData(predicates, dataValues, param);
        break;
      case 'TMD003':
        this.getAssignDashboardData(predicates, dataValues, param);
        break;
      default:
        break;
    }

    this.detectorRef.detectChanges();
  }

  onActions(e: any) {
    if (e.type == 'reportLoaded') {
      this.arrReport = e.data;
      if (this.arrReport.length) {
        let arrChildren: any = [];
        for (let i = 0; i < this.arrReport.length; i++) {
          arrChildren.push({
            title: this.arrReport[i].customName,
            path: 'tm/tmdashboard/TMD?reportID=' + this.arrReport[i].reportID,
          });
        }
        this.pageTitle.setSubTitle(arrChildren[0].title);
        this.pageTitle.setChildren(arrChildren);
        this.codxService.navigate('', arrChildren[0].path);
      }
    }
    this.isLoaded = false;
  }

  newGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  toFixed(value: number) {
    return value % 1 === 0 ? value : value.toFixed(2);
  }
}
