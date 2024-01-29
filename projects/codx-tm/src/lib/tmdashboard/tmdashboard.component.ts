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
  AuthStore,
  ButtonModel,
  CacheService,
  CallFuncService,
  PageTitleService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { ChartSettings } from './models/chart.model';
import { TMDashboardService } from './tmdashboard.service';
import { TM_DashBoard } from './models/TM_DashBoard';
import { Subscription } from 'rxjs';
import { CodxDashboardComponent } from 'projects/codx-share/src/lib/components/codx-dashboard/codx-dashboard.component';

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
  selector: 'tmdashboard',
  templateUrl: './tmdashboard.component.html',
  styleUrls: ['./tmdashboard.component.scss'],
})
export class TMDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChildren('my_dashboard') templates1: QueryList<any>;
  @ViewChildren('team_dashboard') templates2: QueryList<any>;
  @ViewChildren('assign_dashboard') templates3: QueryList<any>;

  @ViewChild('annotation1') annotation: ProgressBar;
  @ViewChild('showTask1') showTask1: any;
  @ViewChild('showTask2') showTask2: any;
  @ViewChild('showTask3') showTask3: any;
  @ViewChild('dashboard') objDashboard!: CodxDashboardComponent;

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
  reportID: string = 'TMD001';

  templates: QueryList<any>;
  viewCategory:string='';
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
  dataLabel: Object = {
    visible: true,
    position: 'Outside', name: 'groupName',
    font: {
        fontWeight: '500'
    },
    connectorStyle: { length: '20px', type: 'Curve'},

};
  dataLabelProj: Object = {
    visible: true,
    position: 'Outside', name: 'projectName',
    font: {
        fontWeight: '500'
    },
    connectorStyle: { length: '20px', type: 'Curve'},

};
  dataLabelRef: Object = {
    visible: true,
    position: 'Outside', name: 'refType',
    font: {
        fontWeight: '500'
    },
    connectorStyle: { length: '20px', type: 'Curve'},

};
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
  private user:any;
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
  palettes:any=['#1BA3C6','#2CB5C0','#30BCAD','#21B087','#33A65C','#57A337','#57A337','#D5BB21','#F8B620','#F89217','#F06719','#E03426','#EB364A','#F64971','#FC719E','#EB73B3','#CE69BE','#A26DC2','#7873C0','#4F7CBA']
  constructor(
    inject: Injector,
    private pageTitle: PageTitleService,
    private routerActive: ActivatedRoute,
    private tmDBService: TMDashboardService,
    private callfunc: CallFuncService,
    private auth: AuthStore,
    private cacheService: CacheService,
  ) {
    super(inject);
    this.reportID = this.router.snapshot.params['funcID'];
    this.user = this.auth.get();
  }

  onInit(): void {
    this.cacheService.valueList('SYS062').subscribe((res) => {
      if (res.datas) {
        this.palettes=[];
        res.datas.map((x:any)=>{
          this.palettes.push(x.value);
          return x;
        })
      }
    });
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

    // this.tmDBService
    //   .getReportsByModule(this.funcID.substring(0, 2))
    //   .subscribe((report: any[]) => {
    //     const lstReportID = report.map((report) => report.reportID);
    //     lstReportID.forEach((reportID: string) => {
    //       this.tmDBService.getChartByReportID(reportID).subscribe((chart) => {
    //         console.log(chart);
    //       });
    //     });
    //   });
    // this.api
    //   .execSv(
    //     'rptrp',
    //     'Codx.RptBusiness.RP',
    //     'ReportListBusiness',
    //     'GetByReportIDAsync',
    //     [this.funcID]
    //   )
    //   .subscribe((res) => {
    //     // this.tmDBService.getReportSource();
    //   });
  }

  reportItem:any;
  circleMarker: Object = { visible: true, height: 7, width: 7 , shape: 'Circle' , isFilled: true };
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
    this.routerActive.params.subscribe((res) => {
      if (res.funcID) {
        this.reportID = res.funcID;
        //this.isLoaded = false;
        //this.getMyDashboardData()
        this.taskByCategory={};
        this.taskByGroup = [];
        this.taskByRefType=[];
        this.doneTasks=[];
        let parameters:any={};
        let reportItem: any = this.arrReport.find(
          (x: any) => x.recID == res.funcID
        );
        if (reportItem) {
          this.reportItem = reportItem;
        }
        if(this.reportItem){
          this.funcID=this.reportItem?.reportID;
          let method:string='';
          switch (this.funcID) {
            case 'TMD001':
              this.viewCategory='myTasks'
              method='GetReportSourceAsync'
              break;

            case 'TMD002':
              this.viewCategory='teamTasks';
              method='GetReportSourceAsync'
              break;

            case 'TMD003':
              this.viewCategory='assignedTasks'
              method='GetReportSourceAsync';
              parameters.category='1;2;3'
              break;

          }
          this.getDataset(method)
          let pinnedParams = this.reportItem.parameters?.filter((x: any) => x.isPin);
          if (pinnedParams) this.view.pinedReportParams = pinnedParams;
        }


      }
    });
    this.detectorRef.detectChanges();
  }

  isLoaded: boolean = false;

  getMyDashboardData(predicates?: string, dataValues?: string, params?: any) {
    let model = new GridModels();
    model.funcID = this.reportItem?.reportID;
    model.entityName = 'TM_Tasks';
    model.predicates = predicates;
    model.dataValues = dataValues;
    this.api
      .exec('TM', 'TaskBusiness', 'GetDataMyDashboardAsync', [model, params])
      .subscribe((res) => {
        this.myDBData = res;
        console.log(res)
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
        console.log(res);

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

  objParams:any;
  filterChange(e: any) {
    this.isLoaded = false;
    let parameters = e[1];
    this.objParams=parameters;
    if(this.subscription) this.subscription.unsubscribe();
    let method:any=''
    if(!this.funcID) return;
    switch (this.funcID) {
      case 'TMD001':
        this.viewCategory='myTasks'
        method='GetReportSourceAsync'
        break;

      case 'TMD002':
        this.viewCategory='teamTasks';
        method='GetReportSourceAsync'
        break;

      case 'TMD003':
        this.viewCategory='assignedTasks'
        method='GetReportSourceAsync'
        parameters.Category='3'
        break;

    }
    this.reportItem && this.getDataset(method,parameters)
    this.detectorRef.detectChanges();
  }

  onActions(e: any) {
    if (e.type == 'reportLoaded') {
      this.arrReport = e.data;
      if (this.arrReport.length) {
        let pattern =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

        if(this.arrReport.length > 1 && !this.reportID.match(pattern)){
          this.codxService.navigate('',`${this.view.function?.module ? this.view.function?.module.toLocaleLowerCase() : 'tm'}/dashboard-view/${this.reportID}`);
          return;
        }
        this.cache
              .functionList(e.data[0].moduleID+e.data[0].reportType)
              .subscribe((res: any) => {
                if (res) {
                  this.pageTitle.setRootNode(res.customName);
                  this.pageTitle.setParent({
                    title: res.customName,
                    path: res.url,
                  });
                  let arrChildren: any = [];
                  for (let i = 0; i < this.arrReport.length; i++) {
                    arrChildren.push({
                      title: this.arrReport[i].customName,
                      path: 'tm/dashboard/' + this.arrReport[i].recID,
                    });
                  }
                  let method:any=''
                  let parameters:any={};
                  if(!this.reportItem){
                    if(this.reportID){
                      let idx = this.arrReport.findIndex((x:any)=>x.recID==this.reportID);
                      if(idx>-1){
                        this.reportItem = this.arrReport[idx];
                        this.pageTitle.setSubTitle(arrChildren[idx].title);
                        this.pageTitle.setChildren(arrChildren);
                        //this.codxService.navigate('', arrChildren[idx].path);
                        this.funcID= this.reportItem.reportID;
                      }
                      else{
                        this.reportItem = this.arrReport[0];
                        this.pageTitle.setSubTitle(arrChildren[0].title);
                        this.pageTitle.setChildren(arrChildren);
                        this.codxService.navigate('', arrChildren[0].path);
                        this.funcID= this.arrReport[0].reportID;
                      }
                    }
                    else{
                      this.reportItem = this.arrReport[0];
                      this.pageTitle.setSubTitle(arrChildren[0].title);
                      this.pageTitle.setChildren(arrChildren);
                      this.codxService.navigate('', arrChildren[0].path);
                      this.funcID= this.arrReport[0].reportID;
                    }



                    //
                  }
                  else{
                    let idx = this.arrReport.findIndex((x:any)=>x.recID==this.reportItem.recID);
                    if(idx>-1){
                      this.pageTitle.setSubTitle(arrChildren[idx].title);
                      this.pageTitle.setChildren(arrChildren);
                      //this.codxService.navigate('', arrChildren[idx].path);
                      this.funcID= this.reportItem.reportID;
                    }

                  //this.isLoaded = true
                  }
                  switch (this.funcID) {
                    case 'TMD001':
                      this.viewCategory='myTasks'
                      method='GetReportSourceAsync'
                      break;

                    case 'TMD002':
                      this.viewCategory='teamTasks';
                      method='GetReportSourceAsync'
                      break;

                    case 'TMD003':
                      this.viewCategory='assignedTasks'
                      method='GetReportSourceAsync'
                      parameters.Category='3'
                      break;

                  }
                  this.getDataset(method,parameters)
              }});

      }
    }

  }

  getTaskStatus(status:string){
    if(this.dataset && this.dataset.length){
      return this.dataset.filter((x:any)=>x.status==status && !x.isOverdue).length;
    }
    return 0;
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
    if (!value || isNaN(value)) {
      return 0;
    }
    return value % 1 === 0 ? value : value.toFixed(2);
  }

  predicates: string;
  dataValues: string;

  showTasks(predicates: string, dataValues: string, funcID: string) {
    this.predicates = predicates;
    this.dataValues = dataValues;
    switch (funcID) {
      case 'TMT0202':
        this.callfunc.openForm(this.showTask2, '', 1280, 720, null);
        break;
      case 'TMT0203':
        this.callfunc.openForm(this.showTask3, '', 1280, 720, null);
        break;
      default:
        this.callfunc.openForm(this.showTask1, '', 1280, 720, null);
        break;
    }

    this.detectorRef.detectChanges();
  }

  getTask1(status: string): number {
    let result = 0;
    this.dataset.filter((data: TM_DashBoard) => {
      if (data.status === status) {
        result = result + 1;
      }
    });
    return result;
  }

  getTask2() {}

  getTask3() {}

  getTask4() {}

  getData1() {}

  getOverdueTasks(){
    if(this.dataset && this.dataset.length){
      return this.dataset.filter((x:any)=>x.isOverdue);
    }
    return [];
  }

  getTasksDoneOntime(){
    if(this.dataset && this.dataset.length){
     return this.dataset.filter((x:any)=>!x.isOverdue && x.status=='90');
    }
    return [];
  }

  getTasksDone(){
    if(this.dataset && this.dataset.length){
      return this.dataset.filter((x:any)=>x.status=='90');
    }
    return [];
  }

  getEtimated(){
    if(this.dataset && this.dataset.length){
      return this.dataset.reduce((accumulator:any, object:any) => {
        return accumulator + object.estimated;
      }, 0);
    }
    return 0;
  }

  getTotalTime(){
    if(this.dataset && this.dataset.length){
      return this.dataset.reduce((accumulator:any, object:any) => {
        return accumulator + object.completed;
      }, 0);
    }
    return 1;
  }


  dataset: TM_DashBoard[] = [];
  subscription:Subscription;
  taskByCategory: any={};
  taskByRefType:any=[];
  taskByGroup:any=[];
  taskByProject:any=[];
  doneTasks:any=[];
  taskByEmployees:any={};
  tasksDoneOntimeEmployees:any=[];
  tasksByProjectID:any=[];

  getDataset(method:string,parameters:any=undefined){
    if(method){
      this.taskByCategory={};
      this.taskByEmployees={};
      this.tasksDoneOntimeEmployees=[];
      this.taskByGroup=[];
      this.taskByProject={};
      this.tasksByProjectID=[];
      this.taskByRefType=[];
      if(parameters) this.objParams = parameters;
      else parameters = this.objParams;
      this.subscription &&  this.subscription.unsubscribe();
      this.subscription= this.api
      .execSv(
        'rpttm',
        'Codx.RptBusiness.TM',
        'TaskDataSetBusiness',
        method,
        parameters?[parameters] : []
      )
      .subscribe((res: TM_DashBoard[]) => {
        this.dataset = res;
        console.log(this.dataset);

        switch (this.viewCategory) {
          case 'myTasks':
              this.dataset = this.dataset.filter((x:any)=>x.owner==this.user.userID && (x.category == '1'|| x.category =='2'));
            break;
          case 'teamTasks':

            break;
          case 'assignedTasks':

            break;

        }
        this.taskByCategory = this.groupBy(this.dataset,'category');
        this.taskByEmployees = this.groupBy(this.dataset,'employeeName');
        this.taskByProject = this.groupBy(this.dataset.filter((x:any)=>x.projectID),'projectID');
        let taskByRef:any = this.groupBy(this.dataset.filter((x:any)=>x.refType),'refType');
        for(let key in taskByRef){
          let obj:any={};
          obj.refType=key;
          obj.quantity=taskByRef[key].length;
          this.taskByRefType.push(obj);
        }
        for(let key in this.taskByEmployees){
          let obj:any={};
          obj.employeeID= this.taskByEmployees[key][0].owner;
          obj.departmentName= this.taskByEmployees[key][0].departmentName;
          obj.employeeName=key;
          obj.quantity = this.taskByEmployees[key].filter((x:any)=>x.status=='90').length;
          obj.percentage = parseFloat(this.toFixed((obj.quantity/this.taskByEmployees[key].length)*100) as any);
          obj.onTimePercentage = (this.taskByEmployees[key].filter((x:any)=>x.status=='90' && !x.isOverdue).length/
          this.taskByEmployees[key].filter((x:any)=>x.status=='90').length)*100;
          obj.totalHours = this.sumByProp(this.taskByEmployees[key],'completed')
          this.tasksDoneOntimeEmployees.push(obj);
        }

        for(let key in this.taskByProject){
          let obj:any={};
          obj.projectName= this.taskByProject[key][0].projectName;
          obj.projectID= key;
          obj.quantity = this.taskByProject[key].length;
          obj.done = this.taskByProject[key].filter((x:any)=>x.status=='90'&& !x.isOverdue).length;
          obj.inprocess = this.taskByProject[key].filter((x:any)=>x.status=='20'&& !x.isOverdue).length;
          obj.new = this.taskByProject[key].filter((x:any)=>x.status=='10'&& !x.isOverdue).length;
          obj.pendding = this.taskByProject[key].filter((x:any)=>x.status=='50'&& !x.isOverdue).length;
          obj.reject = this.taskByProject[key].filter((x:any)=>x.status=='05'&& !x.isOverdue).length;
          obj.cancel = this.taskByProject[key].filter((x:any)=>x.status=='80'&& !x.isOverdue).length;
          obj.confirming = this.taskByProject[key].filter((x:any)=>x.status=='00'&& !x.isOverdue).length;
          obj.overdue = this.taskByProject[key].filter((x:any)=>x.isOverdue).length;
          this.tasksByProjectID.push(obj);
        }
        this.tasksDoneOntimeEmployees= this.tasksDoneOntimeEmployees.sort((a:any,b:any)=>b.percentage - a.percentage)
        let _taskByGroup = this.groupBy(this.dataset.filter((x:any)=>x.taskGroupName),'taskGroupName');
        for(let key in _taskByGroup){
          let obj:any={};
          obj.groupName=key;
          obj.quantity=_taskByGroup[key].length;
          obj.totalHours = this.sumByProp(_taskByGroup[key],'estimated');
          this.taskByGroup.push(obj);
        }

        this.doneTasks =this.dataset.filter((x:any)=>x.status=='90');

        this.subscription.unsubscribe();

        this.isLoaded = true;
      });

    this.detectorRef.detectChanges();
    }
  }
  activePane:string="btnHighestRadio"
  changeDir(ele:any,templateID:string,obj:any){
    if(ele.id == this.activePane) return;
    this.activePane = ele.id;
    if(ele.id == 'btnHighestRadio' && Object.keys(obj).length){
      obj.paneHighest.classList.contains('d-none') && obj.paneHighest.classList.remove('d-none');
      !obj.paneLowest.classList.contains('d-none') && obj.paneLowest.classList.add('d-none');
    }
    if(ele.id == 'btnLowestRadio' && Object.keys(obj).length){
      obj.paneLowest.classList.contains('d-none') && obj.paneLowest.classList.remove('d-none');
      !obj.paneHighest.classList.contains('d-none') && obj.paneHighest.classList.add('d-none');
    }
      this.detectorRef.detectChanges();
  }

  activetab:string = 'groupByquantity'
  changeGroupType(ele:any,obj:any){
    if(ele.id == this.activetab) return;
    this.activetab = ele.id;
    if(ele.id == 'groupByquantity' && Object.keys(obj).length){
      !obj.chart2.pie2.element.classList.contains('d-none') && obj.chart2.pie2.element.classList.add('d-none');
      !obj.chart2.gauge2.classList.contains('d-none') && obj.chart2.gauge2.classList.add('d-none');

      obj.chart1.pie1.element.classList.contains('d-none') && obj.chart1.pie1.element.classList.remove('d-none');
      obj.chart1.pie1.refresh();
      obj.chart1.gauge1.classList.contains('d-none') && obj.chart1.gauge1.classList.remove('d-none');

    }
    if(ele.id == 'groupBytime' && Object.keys(obj).length){
      !obj.chart1.pie1.element.classList.contains('d-none') && obj.chart1.pie1.element.classList.add('d-none');
      !obj.chart1.gauge1.classList.contains('d-none') && obj.chart1.gauge1.classList.add('d-none');

      obj.chart2.pie2.element.classList.contains('d-none') && obj.chart2.pie2.element.classList.remove('d-none');
      obj.chart2.pie2.refresh();
      obj.chart2.gauge2.classList.contains('d-none') && obj.chart2.gauge2.classList.remove('d-none');

    }
      this.detectorRef.detectChanges();
  }

  random_bg_color() {
    let x = Math.floor(Math.random() * 256);
    let y = Math.floor(Math.random() * 256);
    let z = Math.floor(Math.random() * 256);
    return "rgb(" + x + "," + y + "," + z + ")";
  }

  private groupBy(arr: any, key: any) {
    return arr.reduce(function (r: any, a: any) {
      r[a[key]] = r[a[key]] || [];
      r[a[key]].push(a);
      return r;
    }, Object.create(null));
  }

  sumByProp(arr:any[],property:string){
    if(arr && arr.length){
      return arr.reduce((accumulator:any, object:any) => {
        return accumulator + object[property];
      }, 0);
    }
    return 0;
  }

  sortByProp(arr:any[],property:string,dir:string='asc'){
    if(arr.length && property){
      if(dir == 'asc'){
        return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=> a[property]-b[property]);
      }
      else{
        return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=> b[property]-a[property]);
      }

    }
    return [];
  }

  getRefsTasks(){
    return this.dataset.filter((x:any)=>x.refType);
  }

  getTaskGroups(){
    return this.dataset.filter((x:any)=>x.taskGroupName);
  }

  getProjectsTasks(){
    return this.dataset.filter((x:any)=>x.projectID);
  }

  hehe(e:any){
    debugger
  }
}
