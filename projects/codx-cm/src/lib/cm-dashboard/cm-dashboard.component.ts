import {
  AfterViewInit,
  Component,
  Injector,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  PageTitleService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { LayoutComponent } from '../_layout/layout.component';
import { GridModels } from '../models/tmpModel';

import {
  AccumulationChart,
  AccumulationChartComponent,
  ChartTheme,
  IAccTextRenderEventArgs,
  IBulletLoadedEventArgs,
  IPointRenderEventArgs,
} from '@syncfusion/ej2-angular-charts';
import { firstValueFrom } from 'rxjs';
import { CodxCmService } from '../codx-cm.service';
import { Variant } from '@syncfusion/ej2-notifications';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

@Component({
  selector: 'lib-cm-dashboard',
  templateUrl: './cm-dashboard.component.html',
  styleUrls: ['./cm-dashboard.component.scss'],
})
export class CmDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChildren('templateDeals') dashBoardDeals: QueryList<any>;
  @ViewChildren('templateTarget') dashBoardTaget: QueryList<any>;

  @ViewChild('template') template: TemplateRef<any>;
  @ViewChild('noData') noData: TemplateRef<any>;
  @ViewChild('filterTemplate') filterTemplate: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button = {
    id: 'btnAdd',
  };
  isEditMode = false;
  //setting  CMD001
  panelsDeals1: any;
  datasDeals1: any;
  //setting  CMD002 ||  CMD003
  panelsDeals2: any;
  datasDeals2: any;

  arrVllStatus: any = [];
  vllStatus = '';
  dataDashBoard: any;
  isLoaded: boolean = false;
  titLeModule = '';

  //Industry
  dataSourceIndustry = [];

  leafItemSettingsIns = {
    labelPath: 'industryName',
    lableWidth: '100%',
    labelPosition: 'Center',
    labelFormat: '${industryName}',
  };
  paletteIndustry = [];
  // setting  //chart tree buss
  dataSourceBussnessLine = [];
  palette = ['#005dc7', '#0078ff', '#3699ff', '#d3e8ff'];
  //mau cố định
  paletteColor = ['#00BFFF', '#0000FF'];

  leafItemSettings = {
    labelPath: 'businessLineName',
    lableWidth: '100%',
    labelPosition: 'Center',
    labelFormat: '${businessLineName}',
  };
  // highlightSettings = {
  //   enable: true,
  //   border: { width: '1px', color: 'black' },
  //   opacity: '1',
  // };
  // tooltipSettings = {
  //   visible: true,
  //   format: '${businessLineName} - TotalCount:${quantity}',
  //   template:
  //     '<div><span>${businessLineName}</span><span>Total Count: ${quantity}</span></div>',
  // };
  // tooltipChartMap: Object = {
  //   visible: true,

  //   // template:
  //   //   '<div><span>${businessLineName}</span><span>${quantity}-(${percentage} %)</span></div>',
  //    format:
  //     '<div><span>${businessLineName}</span><span>${quantity}-(${percentage} %)</span></div>',
  // };

  //leafItemSettings: any;

  colorReasonSuscess = '';
  colorReasonFails = '';

  isMax = true;
  tabActiveMaxMin = 'btMax';

  maxOwners = [];
  minOwners = [];

  //chart line tỉ lệ thanh công that bai tren san pham

  dataStatisticTarget = [];
  //Initializing Primary X Axis
  primaryXAxisRatio = {
    title: '',
    crossesAt: 0, //chart băt dau
    minimum: 0,
    maximum: 1000,
    interval: 100,
  };
  //Initializing Primary Y Axis
  primaryYAxisRatio = {
    title: '',
    crossesAt: 0, //chart băt dau
    minimum: 0,
    maximum: 1000,
    interval: 100,
  };

  markerRatio = {
    dataLabel: {
      name: 'businessLineName',
      visible: true,
      position: 'Middle',
      font: { fontWeight: '500' },
    },
  };

  tooltip = {
    header: '<b>${point.tooltip}</b>',
    enableMarker: false,
    enable: true,
    format:
      'Tổng doanh số dự kiến : <b>${point.x}</b> <br/>Tổng mục tiêu : <b>${point.y}</b><br/>Số lượng cơ hội : <b>${point.size}</b>',
  };
  border: Object = {
    width: 2,
  };
  legend: Object = {
    visible: false,
  };
  minRadius: number = 1;
  maxRadius: number = 10;
  width = '95%';
  height = '65%';
  title: string = 'World Countries Details';

  // chart line

  primaryXAxis = {
    interval: 1,
    valueType: 'Category',
    title: 'Tháng triển khai Cơ hội',
  };

  primaryYAxis = {
    title: 'Tỷ lệ (%)',
    minimum: 0,
    maximum: 100,
    interval: 20,
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1 },
    minorGridLines: { width: 1 },
    minorTickLines: { width: 0 },
  };
  tooltipChartLine = {
    enable: true,
    shared: true,
    format: '${series.name} : <b>${point.y}%</b>',
  };

  marker = { visible: true };
  isSuccess = true;
  tabActiveLineSucFail ='btSuccess'

  //nang suat nhan viên
  productivityOwner = [];
  language = 'vn';

  //pyramidcontainer
  legendSettingsPy = {
    visible: false,
    toggleVisibility: false,
  };
  dataSourcePyStatus = [
  ];
  dataSourcePyStage = [];
  neckWidth = '0%';
  neckHeight = '0%';
  gapRatio: number = 0.03;

  emptyPointSettings = {
    // fill: 'red',
    // mode: 'Drop',
  };
  explode: boolean = false;

  //tooltip chart Funel
  tooltipPy: Object = {
    // header: '',
    // enable: true,
    // format: '${point.x} : <b>${point.y}</b>',
  };
  titlePy: string = 'Food Comparison Chart';

  pyramid: AccumulationChartComponent | AccumulationChart;
  dataLabel: Object = {
    name: 'name',
    visible: true,
    position: 'Outside',
    connectorStyle: { length: '1%' },
    font: {
      fontWeight: '600',
    },
  };
  vllData: any = [];
  filterData: any = [];
  reportID: any;
  user: any;
  //end

  //business line or linh vuc hoac dong
  isBussinessLine = true;
  tabActiveBusIns: string = 'btBussinessLine';
  //status or
  isStatus = false;

  //ReasonSuscess
  isReasonSuscess = true;
  valueFormat: any;

  //bulletchart
  //Year
  minimumBullet: number = 0;
  maximumBulletQ0: number = 1000;
  titleQ0 = '';
  intervalQ0: number = 100;
  dataBulletQ0s = [];
  dealValueWonQ0: string = '0';
  targetQ0: string = '0';
  //Q1
  maximumBulletQ1: number = 600;
  titleQ1 = '';
  intervalQ1: number = 100;
  dataBulletQ1s: Object[] = [];
  dealValueWonQ1: string = '0';
  targetQ1: string = '0';
  //Q2
  maximumBulletQ2: number = 600;
  titleQ2 = '';
  intervalQ2: number = 100;
  dataBulletQ2s = [];
  dealValueWonQ2: string = '0';
  targetQ2: string = '0';
  //Q3
  maximumBulletQ3: number = 600;
  titleQ3 = '';
  intervalQ3: number = 100;
  dataBulletQ3s = [];
  dealValueWonQ3: string = '0';
  targetQ3: string = '0';
  //Q4
  maximumBulletQ4: number = 600;
  titleQ4 = '';
  intervalQ4: number = 100;
  dataBulletQ4s = [];
  dealValueWonQ4: string = '0';
  targetQ4: string = '0';
  lstQuarters = [];
  //end

  //accumulation chart
  piedata: Object[] = [];
  datalabelAc: Object = {
    visible: true,
    position: 'Inside',
    enableRotation: false,
    connectorStyle: { type: 'Curve', length: '10%' },
    font: { color: 'white', fontWeight: '600' },
  };
  startAngle: number = 0;
  explodeIndex: number = 2;
  endAngle: number = 360;
  legendSettings: Object = {
    visible: true,
  };
  vllQuaters = [];
  //end

  //top sales performance
  lstUsers: {
    userID: string;
    userName: string;
    lstVllTopSales: {
      value: string;
      text: string;
      count: string;
      isAsc: boolean;
    }[];
  }[];

  lstVllTopSales: {
    value: string;
    text: string;
    count: string;
    isAsc: boolean;
  }[];

  currencyID: any;
  exchangeRate: number;
  //new
  arrReport: any = [];
  viewCategory: any;
  subscription: any;
  reportItem: any;

  countNew = 0;
  countProcessing = 0;
  countSuccess = 0;
  countFail = 0;
  chartBussnessLine: any;

  //end
  constructor(
    inject: Injector,
    private layout: LayoutComponent,
    private auth: AuthService,
    private pageTitle: PageTitleService,
    private authstore: AuthStore,
    private cmSv: CodxCmService
  ) {
    super(inject);
    this.user = this.authstore.get();
    // this.funcID = 'DPT01';
    this.language = this.auth.userValue?.language?.toLowerCase();
    // this.funcID = this.router.snapshot.params['funcID'];
    this.reportID = this.router.snapshot.params['funcID'];
    this.loadChangeDefault();
  }
  onInit(): void {
    this.panelsDeals1 = JSON.parse(
      '[{"id":"11.1636284528927885_layout","row":0,"col":0,"sizeX":10,"sizeY":3,"minSizeX":10,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"21.5801149283702021_layout","row":0,"col":10,"sizeX":10,"sizeY":3,"minSizeX":10,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"31.6937258303982936_layout","row":0,"col":20,"sizeX":10,"sizeY":3,"minSizeX":10,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"41.5667390469747078_layout","row":0,"col":30,"sizeX":10,"sizeY":3,"minSizeX":10,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"51.4199281088325755_layout","row":0,"col":40,"sizeX":10,"sizeY":3,"minSizeX":10,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"61.4592017601751599_layout","row":3,"col":0,"sizeX":16,"sizeY":10,"minSizeX":16,"minSizeY":10,"maxSizeX":null,"maxSizeY":null},{"id":"71.14683256767762543_layout","row":3,"col":16,"sizeX":34,"sizeY":10,"minSizeX":34,"minSizeY":10,"maxSizeX":null,"maxSizeY":null},{"id":"81.21519762020964252_layout","row":13,"col":0,"sizeX":34,"sizeY":10,"minSizeX":34,"minSizeY":10,"maxSizeX":null,"maxSizeY":null},{"id":"91.21519762020964252_layout","row":13,"col":34,"sizeX":16,"sizeY":10,"minSizeX":16,"minSizeY":10,"maxSizeX":null,"maxSizeY":null},{"id":"101.21519762020964252_layout","row":23,"col":0,"sizeX":50,"sizeY":10,"minSizeX":50,"minSizeY":10,"maxSizeX":null,"maxSizeY":null}]'
    );
    this.datasDeals1 = JSON.parse(
      '[{"panelId":"11.1636284528927885_layout","data":"1"},{"panelId":"21.5801149283702021_layout","data":"2"},{"panelId":"31.6937258303982936_layout","data":"3"},{"panelId":"41.5667390469747078_layout","data":"4"},{"panelId":"51.4199281088325755_layout","data":"5"},{"panelId":"61.4592017601751599_layout","data":"6"},{"panelId":"71.14683256767762543_layout","data":"7"},{"panelId":"81.21519762020964252_layout","data":"8"},{"panelId":"91.21519762020964252_layout","data":"9"},{"panelId":"101.21519762020964252_layout","data":"10"}]'
    );

    this.panelsDeals2 = JSON.parse(
      '[{"id":"12.1636284528927885_layout","row":0,"col":0,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"22.5801149283702021_layout","row":0,"col":12,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"32.6937258303982936_layout","row":0,"col":24,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"42.5667390469747078_layout","row":0,"col":36,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"52.4199281088325755_layout","row":3,"col":0,"sizeX":16,"sizeY":10,"minSizeX":16,"minSizeY":10,"maxSizeX":null,"maxSizeY":null},{"id":"62.4592017601751599_layout","row":3,"col":16,"sizeX":32,"sizeY":10,"minSizeX":32,"minSizeY":10,"maxSizeX":null,"maxSizeY":null},{"id":"72.14683256767762543_layout","row":13,"col":0,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"82.36639064171709834_layout","row":13,"col":16,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"92.06496875406606994_layout","row":13,"col":32,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":null},{"id":"102.21519762020962552_layout","row":21,"col":0,"sizeX":32,"sizeY":10,"minSizeX":32,"minSizeY":10,"maxSizeX":null,"maxSizeY":null},{"id":"112.21519762020964252_layout","row":21,"col":32,"sizeX":16,"sizeY":10,"minSizeX":16,"minSizeY":10,"maxSizeX":null,"maxSizeY":null}]'
    );
    this.datasDeals2 = JSON.parse(
      '[{"panelId":"12.1636284528927885_layout","data":"1"},{"panelId":"22.5801149283702021_layout","data":"2"},{"panelId":"32.6937258303982936_layout","data":"3"},{"panelId":"42.5667390469747078_layout","data":"4"},{"panelId":"52.4199281088325755_layout","data":"5"},{"panelId":"62.4592017601751599_layout","data":"6"},{"panelId":"72.14683256767762543_layout","data":"7"},{"panelId":"82.36639064171709834_layout","data":"8"},{"panelId":"92.06496875406606994_layout","data":"9"},{"panelId":"102.21519762020962552_layout","data":"10"},{"panelId":"112.21519762020964252_layout","data":"11"}]'
    );
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.chart,
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

    this.router.params.subscribe((res) => {
      if (res.funcID) {
        this.reportID = res.funcID;
        this.isLoaded = false;
        let reportItem = this.arrReport.find((x: any) => x.recID == res.funcID);
        if (reportItem) {
          this.reportItem = reportItem;
          this.funcID = reportItem?.reportID;
          let method: string = '';
          switch (this.reportID) {
            case 'CMD001':
              //dashboard moi
              //dashboard moi
              // this.getDashBoardTargets();
              this.isLoaded = true;
              this.getDataset('GetDashBoardTargetAsync', null, null, null);
              break;
            // nhom chua co tam
            case 'CMD002':
              // code cũ chạy tạm
              //this.getDataDashboard();
              this.getDataset(
                'GetReportSourceAsync',
                null,
                null,
               null
              );
              break;
            //ca nhan chua co ne de vay
            case 'CMD003':
              // code cũ chạy tạm
              // let predicates = 'Owner =@0';
              // let dataValues = this.user.userID;
              // // this.getDataDashboard(predicates, dataValues);
              //test DataSet
              this.getDataset(
                'GetReportSourceAsync',
                null,
                '@0.Contains(Owner)',
                this.user.userID
              );
              break;
            // target
            case 'CMD004':
              this.isLoaded = true;
              break;
          }
        }
      }
    });
    this.detectorRef.detectChanges();
  }

  filterChange(e: any) {
    this.isLoaded = false;
    let { predicates, dataValues } = e[0];
    const param = e[1];
    if (this.subscription) this.subscription.unsubscribe();
    let method: any = '';
    if (!this.funcID) return;
    switch (this.funcID) {
      case 'CMD001':
        //dashboard moi
        // this.getDashBoardTargets();
        method = 'GetDashBoardTargetAsync';
        this.getDataset(method, null, null, null);
        break;
      // nhom chua co tam
      case 'CMD002':
        //this.getDataDashboard(predicates, dataValues, param);
        this.getDataset(
          'GetReportSourceAsync',
          param,
          null,
          null
        );
        break;
      //ca nha chua co ne de vay
      case 'CMD003':
        // let length = dataValues.split(';')?.length ?? 0;

        // let predicate =
        //   length == 0 ? 'Owner =@' + length : ' and ' + 'Owner =@' + length;
        // let dataValue = length == 0 ? this.user.userID : ';' + this.user.userID;

        // predicates += predicate;
        // dataValues += dataValue;
        // this.getDataDashboard(predicates, dataValues, param);
        this.getDataset(
          'GetReportSourceAsync',
          param,
          '@0.Contains(Owner)',
          this.user.userID
        );
        break;
      // target
      case 'CMD004':
        this.isLoaded = true;
        break;
    }
    this.detectorRef.detectChanges();
  }

  getNameStatus(status) {
    return this.arrVllStatus.filter((x) => x.value == status)[0]?.text;
  }

  getDataDashboard(predicates?: string, dataValues?: string, params?: any) {
    this.isLoaded = false;
    let model = new GridModels();
    model.funcID = this.funcID;
    model.entityName = 'CM_Deals';
    model.predicates = predicates;
    model.dataValues = dataValues;
    this.api
      .exec('CM', 'DealsBusiness', 'GetDataDashBoardAsync', [model, params])
      .subscribe((res) => {
        this.dataDashBoard = res;
        if (res) {
          this.countNew = this.dataDashBoard?.counts?.countNew;
          this.countProcessing = this.dataDashBoard?.counts?.countProcessing;
          this.countSuccess = this.dataDashBoard?.counts?.countSuccess;
          this.countFail = this.dataDashBoard?.counts?.countFail;

          if (this.dataDashBoard.countsBussinessLines) {
            this.palette = this.dataDashBoard.countsBussinessLines?.map(
              (x) => x.color
            );
            this.dataSourceBussnessLine =
              this.dataDashBoard.countsBussinessLines?.map((x) => {
                let data = {
                  color: x.color,
                  businessLineName: x.businessLineName,
                  quantity: x.quantity,
                  percentage: x.percentage,
                };
                return data;
              });
            //chart
            this.chartBussnessLine = this.dataDashBoard.countsBussinessLines
          }
          this.dataStatisticTarget =
            this.dataDashBoard.countsStatisticTargetBussinessLine ?? [];
          if (this.dataStatisticTarget.length > 0) {
            let maxTarget = Math.max(
              ...this.dataStatisticTarget.map((o) => o.totalTarget)
            );
            this.primaryXAxisRatio.maximum =
              maxTarget + 2 * Math.floor(maxTarget / 10);
            this.primaryXAxisRatio.interval = Math.floor(
              this.primaryXAxisRatio.maximum / 10
            );

            let maxDealValue = Math.max(
              ...this.dataStatisticTarget.map((o) => o.totalDealValue)
            );

            this.primaryYAxisRatio.maximum =
              maxDealValue + 2 * Math.floor(maxDealValue / 10);
            this.primaryYAxisRatio.interval = Math.floor(
              this.primaryYAxisRatio.maximum / 10
            );
          }
          this.maxOwners = this.dataDashBoard?.countsOwnersTopHightToLow ?? [];
          this.minOwners = this.dataDashBoard?.countsOwnersTopLowToHight ?? [];
          this.productivityOwner =
            this.dataDashBoard.countsProductivityOwner ?? [];
          this.dataSourcePyStatus =
            this.dataDashBoard?.countsConversionRate?.filter(
              (x) => !x.type || x.type == 'Status'
            ) ?? [];
          this.dataSourcePyStage =
            this.dataDashBoard?.countsConversionRate?.filter(
              (x) => !x.type || x.type == 'Stage'
            ) ?? [];

          this.dataSourceIndustry = this.dataDashBoard?.countsIndustries ?? [];
          this.paletteIndustry = this.dataDashBoard.countsIndustries?.map(
            (x) => x.color
          );
          const dashBoardTarget = this.dataDashBoard?.dashBoardTargets;
          if (dashBoardTarget?.quarterDashBoard) {
            this.piedata = dashBoardTarget?.quarterDashBoard?.map((x) => {
              let data = {
                x: x?.nameQuarter,
                y: x?.probability,
                text: x?.target,
                quarter: x?.target,
                year: x?.year,
              };
              return data;
            });
          }
        } else {
          this.resetData();
        }
        setTimeout(() => {
          this.isLoaded = true;
        }, 500);
      });

    this.detectorRef.detectChanges();
  }

  getDashBoardTargets() {
    this.isLoaded = false;
    let model = new GridModels();
    model.funcID = 'CM0601';
    model.entityName = 'CM_Targets';
    this.api
      .execSv<any>(
        'CM',
        'ERM.Business.CM',
        'DealsBusiness',
        'GertDashBoardTargetAsync',
        [model]
      )
      .subscribe((res) => {
        if (res) {
          const data = res;
          if (data?.quarterDashBoard) {
            this.piedata = data?.quarterDashBoard?.map((x) => {
              let data = {
                x: x?.nameQuarter,
                y: x?.probability,
                text: x?.target,
                quarter: x?.target,
                year: x?.year,
              };
              return data;
            });
          }
          setTimeout(() => {
            this.isLoaded = true;
          }, 500);
        }
      });
  }

  getTitle(status) {
    return (
      this.titLeModule +
      '-' +
      this.arrVllStatus.filter((x) => x.value == status)[0]?.text
    );
  }

  clickButton(id) {
    switch (id) {
      case 'btnMin':
        this.isMax = false;
        break;
      case 'btnMax':
        this.isMax = true;
        break;
      case 'btSuccess':
        this.isSuccess = true;
        break;
      case 'btFail':
        this.isSuccess = false;
        break;
      case 'btBussinessLine':
        this.isBussinessLine = true;
        break;
      case 'btIndustries':
        this.isBussinessLine = false;
        break;
      case 'btStatus':
        this.isStatus = true;
        break;
      case 'btStage':
        this.isStatus = false;
        break;
    }
    this.detectorRef.detectChanges();
  }
  getHeightChart() {
    let viewChart = document.getElementById('6');
    let chartBusinessLinesButton = document.getElementById(
      'chartBusinessLinesButton'
    );
    let chartBusinessLinesHeader = document.getElementById(
      'chartBusinessLinesHeader'
    );
    if (viewChart && chartBusinessLinesButton && chartBusinessLinesHeader) {
      return (
        viewChart.offsetHeight -
        chartBusinessLinesHeader.offsetHeight -
        chartBusinessLinesButton.offsetHeight +
        ' px'
      );
    }
    return '90%'; //vi no chua bat dcF
  }
  setColorPoint(args: IPointRenderEventArgs): void {
    let index = args.point.index;
    args.fill = this.dataStatisticTarget[index].color;
  }

  //load default
   loadChangeDefault() {
    this.cache.valueList('DP036').subscribe((vll) => {
      if (vll && vll?.datas) {
        this.colorReasonSuscess = vll?.datas.filter(
          (x) => x.value == 'S'
        )[0]?.color;
        this.colorReasonFails = vll?.datas.filter(
          (x) => x.value == 'F'
        )[0]?.color;
      }
    });

    this.cache.valueList('CRM049').subscribe((vl) => {
      if (vl) {
        this.valueFormat = vl.datas?.find((x) => x.value == '3')?.text;
      }
    });
    this.cache.valueList('CRM046').subscribe((ele) => {
      if (ele && ele?.datas) {
        this.vllQuaters = ele?.datas;
      }
    });
    this.cache.valueList('CRM068').subscribe((ele) => {
      if (ele && ele?.datas) {
        this.lstVllTopSales = ele?.datas;
      }
    });
    

    this.cache.gridViewSetup('CMDeals', 'grvCMDeals').subscribe((grv) => {
      if (grv) {
        this.vllStatus = grv['Status'].referedValue;
        this.cache.valueList(this.vllStatus).subscribe((res) => {
          if (res && res.datas) this.arrVllStatus = res.datas;
        });
      }
    });
    this.cache.functionList('CM0201').subscribe((fun) => {
      this.titLeModule = fun?.customName || fun?.description;
      // this.leafItemSettings = {
      //   labelPath: 'businessLineName',
      //   lableWidth: '100%',
      //   labelPosition: 'Center',
      //   labelFormat: '${businessLineName}
      //    <br>${quantity} ' +
      //    this.titLeModule +
      //    '-(${percentage} %)',
      // };
    });
    if (this.language == 'en') {
      this.primaryXAxis.title = 'Deployment month';
      this.primaryYAxis.title = 'Ratio(%)';
    }
   this.cache.viewSettingValues('CMParameters').subscribe((res) => {
      if (res?.length > 0) {
        let dataParam = res.filter((x) => x.category == '1' && !x.transType)[0];
        if (dataParam) {
          let paramDefault = JSON.parse(dataParam.dataValue);
          this.currencyID = paramDefault['DefaultCurrency'] ?? 'VND';
          this.cmSv.getExchangeRate(this.currencyID, new Date()).subscribe(res=>{
            if(res && res?.exchRate > 0){
              this.exchangeRate = res?.exchRate;
            }else {
              this.exchangeRate = 1;
              this.currencyID = 'VND';
            }
            this.formatSetting();
          })
        }else{
          this.exchangeRate = 1;
          this.currencyID = 'VND';
          this.formatSetting();
        }
      }
    });
  }

  formatSetting(){
    if (this.language == 'vn') {
      this.primaryXAxisRatio.title =
        'Tổng doanh số dự kiến ( ' + this.currencyID + ')';
      this.primaryYAxisRatio.title =
        'Tổng mục tiêu ( ' + this.currencyID + ')';

      this.tooltip.format =
        'Tổng doanh số dự kiến : <b>${point.x} ' +
        this.currencyID +
        '</b> <br/>Tổng mục tiêu : : <b>${point.y} ' +
        this.currencyID +
        '</b><br/>Số lượng cơ hội : <b>${point.size}</b>';
    } else {
      this.primaryXAxisRatio.title =
        'Total expected sales ( ' + this.currencyID + ')';
      this.primaryYAxisRatio.title =
        'Total target ( ' + this.currencyID + ')';

      this.tooltip.format =
        'Total expected sales : <b>${point.x} ' +
        this.currencyID +
        '</b> <br/>Total target : <b>${point.y} ' +
        this.currencyID +
        '</b><br/>Quantity of deals : <b>${point.size}</b>';
    }
  }

  onActions(e) {
    if (e.type == 'reportLoaded') {
      //cu dung de test
      // this.cache.valueList('CRM057').subscribe((vl) => {
      //   if (vl) {
      //     this.vllData = vl.datas;
      //     this.filterData = this.vllData.map((x) => {
      //       return {
      //         title: x.text,
      //         path: 'cm/dashboard/CMD01?reportID=' + x.value,
      //       };
      //     });
      //   }
      //   this.pageTitle.setSubTitle(this.filterData[0].title);
      //   this.pageTitle.setChildren(this.filterData);
      //   this.codxService.navigate('', this.filterData[0].path);
      //   this.isLoaded = false;
      // });

      //moi theo report
      this.arrReport = e.data;
      if (this.arrReport.length) {
        this.cache
          .functionList(
            this.arrReport[0].moduleID + this.arrReport[0].reportType
          )
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
                  // path: 'cm/dashboard/' + this.arrReport[i].reportID,  //trầm kêu có thể trùn reportID
                  path: 'cm/dashboard/' + this.arrReport[i].recID, //chuẩn theo Trầm
                });
              }

              this.isLoaded = false;
              this.pageTitle.setBreadcrumbs([]);
              if (!this.reportItem) {
                if (this.reportID) {
                  let idx = this.arrReport.findIndex(
                    (x: any) => x.recID == this.reportID
                  );
                  if (idx != -1) {
                    this.reportItem = this.arrReport[idx];
                    this.pageTitle.setSubTitle(arrChildren[idx].title);
                    this.pageTitle.setChildren(arrChildren);
                    this.funcID = this.reportItem.reportID;
                  } else {
                    this.reportItem = this.arrReport[0];
                    this.pageTitle.setSubTitle(arrChildren[0].title);
                    this.pageTitle.setChildren(arrChildren);
                    this.codxService.navigate('', arrChildren[0].path);
                    this.funcID = this.arrReport[0].reportID;
                  }
                } else {
                  this.reportItem = this.arrReport[0];
                  this.pageTitle.setSubTitle(arrChildren[0].title);
                  this.pageTitle.setChildren(arrChildren);
                  this.codxService.navigate('', arrChildren[0].path);
                  this.funcID = this.arrReport[0].reportID;
                }

                switch (this.funcID) {
                  case 'CMD001':
                    //dashboard moi
                    // this.getDashBoardTargets();
                    this.getDataset(
                      'GetDashBoardTargetAsync',
                      null,
                      null,
                      null
                    );
                    break;
                  // nhom chua co tam
                  case 'CMD002':
                    // cu
                    // this.getDataDashboard();
                    this.getDataset(
                      'GetReportSourceAsync',
                      null,
                     null,
                      null
                    );
                    break;
                  //ca nhan chua co ne de vay
                  case 'CMD003':
                    // let predicates = 'Owner =@0';
                    // let dataValues = this.user.userID;
                    // this.getDataDashboard(predicates, dataValues);
                    //test DataSet
                    this.getDataset(
                      'GetReportSourceAsync',
                      null,
                      '@0.Contains(Owner)',
                      this.user.userID
                    );
                    break;
                  // target
                  case 'CMD004':
                    this.isLoaded = true;
                    break;
                }

                this.detectorRef.detectChanges();
              }
            }
          });
      }
    }
  }

  formatCrrView(e) {
    let html = '';
    if (e.point.x == this.valueFormat) {
      var listItems = [];
      if (this.isStatus)
        listItems = this.dataSourcePyStatus.find(
          (x) => x.name == e.point.x
        )?.items;
      else
        listItems = this.dataSourcePyStage.find(
          (x) => x.name == e.point.x
        )?.items;

      if (listItems?.length > 0) {
        html = '';
        listItems.forEach((t) => {
          html += '<br>' + t.name + ' : <b>' + t.quantity + '</b>';
        });
      }
    }
    e.point.tooltip = e.point.x + ' : <b>' + e.point.y + '</b>' + html;
  }

  findItemUser(value, lstTitlePerformance) {
    let title = lstTitlePerformance.find((x) => x.value == value);
    return title;
  }

  onTextRender(args: IAccTextRenderEventArgs) {
    const text = args.series['resultData']?.find((x) => x.y == args.point.y);
    let value = text?.text ?? 0;
    let retrn = '0';
    if (value === null || isNaN(value)) {
      retrn = '0';
    }

    if (value >= 1000000) {
      retrn = (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
      retrn = (value / 1000).toFixed(2) + 'K';
    }
    args.text = retrn;
  }

  ///-------------------------Get DATASET---------------------------------------------//
  getDataset(
    method: string,
    parameters = null,
    predicate = null,
    dataValue = null
  ) {
    if (this.isLoaded) return;
    this.resetData();
    if (method) {
      this.subscription = this.api
        .execSv<any[]>(
          'rptcm',
          'Codx.RptBusiness.CM',
          'SalesDataSetBusiness',
          method,
          [parameters, predicate, dataValue]
        )
        .subscribe((res) => {
          if (res) {
            //xu ly nv

            switch (this.funcID) {
              case 'CMD001':
                this.getDashBoardTargetSales(res[1], parameters);
                this.getDashBoardSales(res[0], res[1], res[3], parameters);
                this.lstUsers = this.getTopSalesDashBoards(res[2], parameters);
                break;
              case 'CMD002':
                this.changeMySales(res);
                break;
              case 'CMD003':
                this.changeMySales(res);
                break;
              case 'CMD001':
                break;
            }
          }
          setTimeout(() => {
            this.isLoaded = true;
          }, 500);
        });

      this.detectorRef.detectChanges();
    }
  }

  resetData() {
    this.dataStatisticTarget = [];
    this.maxOwners = [];
    this.minOwners = [];
    this.productivityOwner = [];
    this.dataSourcePyStatus = [];
    this.dataSourcePyStage = [];
    this.dataSourceBussnessLine = [];
    this.dataSourceIndustry = [];
    this.paletteIndustry = [];
    this.palette = [];
    this.countNew = 0;
    this.countSuccess = 0;
    this.countFail = 0;
    this.countProcessing = 0;
    this.chartBussnessLine = []
  }
  // ---------------------------FUNC ----------------------------//
  //sort lấy top
  sortByProp(arr: any[], property: string, dir: string = 'asc') {
    if (arr.length && property) {
      if (dir == 'asc') {
        return JSON.parse(JSON.stringify(arr)).sort(
          (a: any, b: any) => a[property] - b[property]
        );
      } else {
        return JSON.parse(JSON.stringify(arr)).sort(
          (a: any, b: any) => b[property] - a[property]
        );
      }
    }
    return [];
  }

  random_bg_color() {
    let x = Math.floor(Math.random() * 230);
    let y = Math.floor(Math.random() * 255);
    let z = Math.floor(Math.random() * 255);
    return 'rgb(' + x + ',' + y + ',' + z + ')';
  }

  groupBy(arr: any, key: any) {
    return arr.reduce(function (r: any, a: any) {
      r[a[key]] = r[a[key]] || [];
      r[a[key]].push(a);
      return r;
    }, Object.create(null));
  }
  // ---------------------------FUNC ----------------------------//

  // --------------------------------------------//
  //DASHBOAD CÁ NHÂN + NHÓM
  // --------------------------------------------//
  changeMySales(dataSet) {
    if (dataSet?.lenght == 0) return;
    this.countNew = dataSet.filter(
      (x) => x.status == '1' || x.status == '0'
    )?.length;
    this.countProcessing = dataSet.filter((x) => x.status == '2')?.length;
    let dataSuccess = dataSet.filter((x) => x.status == '3');
    this.countSuccess = dataSuccess?.length;
    let dataFails = dataSet.filter((x) => x.status == '5');
    this.countFail = dataFails?.length;

    this.getBusinessLine(dataSet);
    this.getIndustries(dataSet);
    this.getOwnerTop(dataSuccess);
  }

  getBusinessLine(dataSet) {
    let businesLine = this.groupBy(dataSet, 'businessLineID');
    if (businesLine) {
      for (let key in businesLine) {
        let color = this.random_bg_color();

        let quantity = businesLine[key].length;
        let obj = {
          businessLineID: key,
          businessLineName: businesLine[key][0].businessLineName ?? key,
          quantity: quantity,
          percentage: ((quantity * 100) / dataSet?.length).toFixed(2), //chua tinh
          color: color,
        };
        this.dataSourceBussnessLine.push(obj);
        this.chartBussnessLine.push({...obj,...this.getChartBussinessLine(businesLine[key])})
        this.dataStatisticTarget.push({...obj,...this.getDataStatisticTarget(businesLine[key])})    
        this.palette.push(color);
      }

      if (this.dataStatisticTarget.length > 0) {
        let maxTarget = Math.max(
          ...this.dataStatisticTarget.map((o) => o.totalTarget)
        );
        this.primaryXAxisRatio.maximum =
          maxTarget + 2 * Math.floor(maxTarget / 10);
        this.primaryXAxisRatio.interval = Math.floor(
          this.primaryXAxisRatio.maximum / 10
        );

        let maxDealValue = Math.max(
          ...this.dataStatisticTarget.map((o) => o.totalDealValue)
        );

        this.primaryYAxisRatio.maximum =
          maxDealValue + 2 * Math.floor(maxDealValue / 10);
        this.primaryYAxisRatio.interval = Math.floor(
          this.primaryYAxisRatio.maximum / 10
        );
      }
    }
  }
  getChartBussinessLine(dataSet){
    let monthGroup = this.groupBy(dataSet, 'moY');
    let  chartDataSuscess  = []
    let  chartDataFail  = [];
    for(let i =1 ;i<=12 ;i++){
      chartDataSuscess.push({
        month :i,
        quantity : 0,
        percentage :0,
      })
      chartDataFail.push({
        month :i,
        quantity : 0,
        percentage :0,
      })
    }
    if (monthGroup) {
      for (let key in monthGroup) { 
        var idxSuc =  chartDataSuscess.findIndex(x=>x.month==key);
        if(idxSuc!=-1){
          chartDataSuscess[idxSuc].quantity = monthGroup[key].filter(x=>x.status=='3')?.length ??0;
          chartDataSuscess[idxSuc].percentage =monthGroup[key]?.length >0 ? chartDataSuscess[idxSuc].quantity/monthGroup[key]?.length*100 : 0
        }

        var idxFail =  chartDataFail.findIndex(x=>x.month==key);
        if(idxFail!=-1){
          chartDataFail[idxFail].quantity = monthGroup[key].filter(x=>x.status=='5')?.length ??0;
          chartDataFail[idxFail].percentage =monthGroup[key]?.length >0 ? chartDataFail[idxFail].quantity/monthGroup[key]?.length*100 : 0
        }
       
        
      }
    } 
    return {chartDataSuscess :chartDataSuscess,chartDataFail :chartDataFail} 
  }

  getDataStatisticTarget(dataSet){
    let totalTarget = 0 ;
    let totalDealValue = 0 ;
    if(Array.isArray(dataSet)){
      dataSet.forEach(x=>{
        console.log(x.dealValue + "  " + x.exchangeRate)
        totalDealValue +=  x.dealValue * x.exchangeRate
       ///target line ?? targer hoi Khanh
       totalTarget += Math.random()*10000000 //tesst
      })
    }
    return {totalTarget : totalTarget/this.exchangeRate,totalDealValue :totalDealValue/this.exchangeRate} 
  }

  getIndustries(dataSet) {
    let listIndustries = this.groupBy(dataSet, 'industries');
    if (listIndustries) {
      for (let key in listIndustries) {
        let color = this.random_bg_color();
        let quantity = listIndustries[key].length;
        let obj = {
          industryID: key,
          industryName:
            listIndustries[key][0].industriesName ??
            (key != 'null'
              ? key
              : this.user.language.toUpperCase() == 'VN'
              ? 'Chưa có'
              : 'Not yet'),
          quantity: quantity,
          percentage: ((quantity * 100) / dataSet?.length).toFixed(2), //chua tinh
          color: color,
        };
        this.dataSourceIndustry.push(obj);
        this.paletteIndustry.push(color);
      }
    }
  }

  getOwnerTop(dataSet) {
    let listOwner = this.groupBy(dataSet, 'owner');
    if (listOwner) {
      let owner = [];
      for (let key in listOwner) {
        let color = this.random_bg_color();
        let quantity = listOwner[key].length;
        let obj = {
          objectID: key,
          objectName: listOwner[key][0].ownerName ?? key,
          quantity: quantity,
          percentage: ((quantity * 100) / dataSet?.length).toFixed(2), //chua tinh
          color: color,
        };
        owner.push(obj);
      }
      this.maxOwners = JSON.parse(JSON.stringify(owner)).sort((a, b) =>
         b.quantity - a.quantity
      );
      this.minOwners = JSON.parse(JSON.stringify(owner)).sort((a, b) => 
         a.quantity - b.quantity
      );
    }
  }

  changeBusIns(ele: any, obj: any) {
    if (ele.id == this.tabActiveBusIns) return;
    this.tabActiveBusIns = ele.id;
    if (ele.id == 'btBussinessLine' && Object.keys(obj).length) {
      !obj.chart2.viewIndus.classList.contains('d-none') &&
      obj.chart2.viewIndus.classList.add('d-none');
    obj.chart1.viewBus.classList.contains('d-none') &&
      obj.chart1.viewBus.classList.remove('d-none');

      !obj.chart2.pie2.element.classList.contains('d-none') &&
        obj.chart2.pie2.element.classList.add('d-none');
      obj.chart1.pie1.element.classList.contains('d-none') &&
        obj.chart1.pie1.element.classList.remove('d-none');
      obj.chart1.pie1.refresh();
    }
    if (ele.id == 'btIndustries' && Object.keys(obj).length) {
      !obj.chart1.viewBus.classList.contains('d-none') &&
      obj.chart1.viewBus.classList.add('d-none');

    obj.chart2.viewIndus.classList.contains('d-none') &&
      obj.chart2.viewIndus.classList.remove('d-none');

      !obj.chart1.pie1.element.classList.contains('d-none') &&
        obj.chart1.pie1.element.classList.add('d-none');

      obj.chart2.pie2.element.classList.contains('d-none') &&
        obj.chart2.pie2.element.classList.remove('d-none');
      obj.chart2.pie2.refresh();
    }
    this.detectorRef.detectChanges();
  }

  changeMaxMin(ele: any, obj: any) {
    if (ele.id == this.tabActiveMaxMin) return;
    this.tabActiveMaxMin = ele.id;
    if (ele.id == 'btMax') {
      !obj.chart2.minView.classList.contains('d-none') &&
        obj.chart2.minView.classList.add('d-none');
      obj.chart1.maxView.classList.contains('d-none') &&
        obj.chart1.maxView.classList.remove('d-none');
    }
    if (ele.id == 'btMin') {
      !obj.chart1.maxView.classList.contains('d-none') &&
        obj.chart1.maxView.classList.add('d-none');

      obj.chart2.minView.classList.contains('d-none') &&
        obj.chart2.minView.classList.remove('d-none');
    }
    this.detectorRef.detectChanges();
  }
  changeChartLine(ele: any, obj: any){
    if (ele.id == this.tabActiveLineSucFail) return;
    this.tabActiveLineSucFail = ele.id;
    // chart1: { viewLineSuc,lineSuc },
    // chart2: { viewLineFail,lineFail }
    if (ele.id == 'btSuccess' && Object.keys(obj).length) {
      !obj.chart2.viewLineFail.classList.contains('d-none') &&
      obj.chart2.viewLineFail.classList.add('d-none');
    obj.chart1.viewLineSuc.classList.contains('d-none') &&
      obj.chart1.viewLineSuc.classList.remove('d-none');

      !obj.chart2.lineFail.element.classList.contains('d-none') &&
        obj.chart2.lineFail.element.classList.add('d-none');
      obj.chart1.lineSuc.element.classList.contains('d-none') &&
        obj.chart1.lineSuc.element.classList.remove('d-none');
      obj.chart1.lineSuc.refresh();
    }
    if (ele.id == 'btFail' && Object.keys(obj).length) {
      !obj.chart1.viewLineSuc.classList.contains('d-none') &&
      obj.chart1.viewLineSuc.classList.add('d-none');

    obj.chart2.viewLineFail.classList.contains('d-none') &&
      obj.chart2.viewLineFail.classList.remove('d-none');

      !obj.chart1.lineSuc.element.classList.contains('d-none') &&
        obj.chart1.lineSuc.element.classList.add('d-none');

      obj.chart2.lineFail.element.classList.contains('d-none') &&
        obj.chart2.lineFail.element.classList.remove('d-none');
      obj.chart2.lineFail.refresh();
    }
    this.detectorRef.detectChanges();
  }

  // --------------------------------------------//
  //End Ca nhan
  // --------------------------------------------//

  // --------------------------------------------//
  // DASHBOAD SALES TAGET                     //
  // --------------------------------------------//

  //get sales last 4 quarter
  getDashBoardTargetSales(lstTargetLines = [], param) {
    let lstPiaData = [];
    const currencyID = this.currencyID;
    const exchRate = this.exchangeRate;
    if (lstTargetLines != null && lstTargetLines.length > 0) {
      let now = new Date();
      if (param) {
        // làm sau
      }
      let quarter = Math.floor((now.getMonth() - 1) / 3) + 1;
      let sumTarget = 0;
      for (let i = 0; i < 4; i++) {
        const { min, max } = this.getQuarterMonthRange(quarter);
        let year = now.getFullYear();
        var tmp = {};
        if (quarter === 1) {
          quarter = 4;
          year--;
        } else {
          quarter--;
        }
        const targetLineQuarters = lstTargetLines.filter(
          (x) =>
            new Date(x.startDate)?.getFullYear() === year &&
            new Date(x.startDate)?.getMonth() + 1 >= min &&
            new Date(x.startDate)?.getMonth() + 1 <= max
        );

        tmp['year'] = year;
        tmp['quarter'] = quarter;
        let target = targetLineQuarters.reduce(
          (acc, x) =>
            acc +
            (currencyID !== x.currencyID
              ? (x.target / exchRate) * x.exchangeRate
              : x.target),
          0
        );
        tmp['text'] = Math.round(target * 100) / 100;
        sumTarget += tmp['text'];
        const first = this.vllQuaters?.find(
          (x) => x.value === quarter.toString()
        );
        if (first) {
          tmp['x'] = `${first.text}/${year}`;
        }
        tmp['y'] = 0;

        lstPiaData.push(tmp);
      }
      lstPiaData.forEach((item) => {
        item['y'] = Math.round((item?.['text'] / sumTarget) * 100 * 100) / 100;
      });
    }
    this.piedata = lstPiaData.sort((a, b) => {
      return a.year - b.year;
    });
  }

  // get sales target
  getDashBoardSales(deals, targetLines, lstQuarters, param = null) {
    if (lstQuarters != null) {
      let now = new Date();
      for (var i = 0; i < lstQuarters.length; i++) {
        let data = lstQuarters[i];
        const lstBusinessIds = targetLines
          ?.map((x) => x.businessLineID)
          .filter((value, index, self) => self.indexOf(value) === index);
        let dealWons = deals.filter(
          (y) =>
            lstBusinessIds.some((q) => q == y.businessLineID) &&
            y.status == '3' &&
            y.actualEnd != null &&
            new Date(y.actualEnd)?.getFullYear() == now.getFullYear()
        );

        let target = 0;
        let dealValueWon = 0;
        let targetLineQuarters = targetLines?.filter(
          (x) => new Date(x.startDate)?.getFullYear() == now.getFullYear()
        );
        if (parseInt(data.quarter) > 0) {
          const { min, max } = this.getQuarterMonthRange(
            parseInt(data.quarter)
          );
          targetLineQuarters = targetLineQuarters.filter(
            (x) =>
              new Date(x.startDate)?.getMonth() + 1 >= min &&
              new Date(x.startDate)?.getMonth() + 1 <= max
          );
          dealWons = dealWons.filter(
            (x) =>
              new Date(x.actualEnd)?.getMonth() + 1 >= min &&
              new Date(x.actualEnd)?.getMonth() + 1 <= max
          );
        }
        target = Math.round(
          targetLineQuarters.reduce(
            (sum, x) => sum + (x.target / this.exchangeRate) * x.exchangeRate,
            0
          )
        );
        dealValueWon = Math.round(
          dealWons.reduce(
            (sum, x) =>
              sum + (x.dealValue / this.exchangeRate) * x.exchangeRate,
            0
          )
        );
        lstQuarters[i].target = target;
        lstQuarters[i].dealValueWon = dealValueWon;
        this.showValueToChartBullets(lstQuarters[i]);
      }
      this.lstQuarters = lstQuarters;
    }
  }
  //end

  //get top sales
  getTopSalesDashBoards(lstUsers = [], param) {
    let list = [];
    if (lstUsers?.length > 0) {
      lstUsers.forEach((item) => {
        var tmp = {};
        tmp = item;
        tmp['lstVllTopSales'] = this.lstVllTopSales;
        list.push(tmp);
      });
    }
    return list;
  }
  //end

  getQuarterMonthRange(quarter: number): { min: number; max: number } {
    let min = 1;
    let max = 1;

    switch (quarter) {
      case 1:
        min = 1;
        max = 3;
        break;
      case 2:
        min = 4;
        max = 6;
        break;
      case 3:
        min = 7;
        max = 9;
        break;
      case 4:
        min = 10;
        max = 12;
        break;
    }

    return { min, max };
  }

  //Set chart bullets
  showValueToChartBullets(data) {
    let obj = {};
    if (data) {
      let i = data?.quarter.toString();
      this[`dataBulletQ${i}s`] = [];
      this[`titleQ${i}`] = data?.nameQuarter;
      let maxinum =
        parseFloat(data?.target) + (parseFloat(data?.target) * 30) / 100;
      this[`maximumBulletQ${i}`] = Math.round(this.formatMaxValue(maxinum));
      this[`intervalQ${i}`] = Math.round(
        this.calculateInterval(this[`maximumBulletQ${i}`])
      );
      var tmp = {};
      tmp['value'] = Math.round(
        this.formatMaxValue(parseFloat(data.dealValueWon))
      );
      tmp['target'] = Math.round(this.formatMaxValue(parseFloat(data?.target)));

      this[`dataBulletQ${i}s`].push(tmp);
      this[`dealValueWonQ${i}`] = Math.round(
        this.formatMaxValue(parseFloat(data?.dealValueWon))
      ).toString();
      this[`targetQ${i}`] = Math.round(
        this.formatMaxValue(
          parseFloat(data?.target) +
            (parseFloat(data?.target) * 30) / 100 -
            parseFloat(data.dealValueWon)
        )
      ).toString();
    }
    console.log('title: ', this.titleQ0);
    console.log('maximumBulletQ0: ', this.maximumBulletQ0);
    console.log('dataBulletQ0s: ', this.dataBulletQ0s);
    console.log('dealValueWonQ0: ', this.dealValueWonQ0);
    console.log('targetQ0: ', this.targetQ0);
  }

  formatMaxValue(value: number) {
    if (value >= 1000000) {
      return value / 1000000;
    } else if (value >= 1000) {
      return value / 1000;
    } else {
      return value;
    }
  }

  calculateInterval(value: number): number {
    if (value >= 100) {
      return value / 10;
    } else if (value >= 10) {
      return value;
    } else {
      return 1;
    }
  }
  //end
}
