import { label } from './../../../../codx-ws/src/lib/personal/master-detail/information/infomation.variable';
import { Browser } from '@syncfusion/ej2-base';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Injector,
  QueryList,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  DataRequest,
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
  ITextRenderEventArgs,
  ITooltipRenderEventArgs,
} from '@syncfusion/ej2-angular-charts';

import { CodxCmService } from '../codx-cm.service';
import moment from 'moment';

@Component({
  selector: 'lib-cm-dashboard',
  templateUrl: './cm-dashboard.component.html',
  styleUrls: ['./cm-dashboard.component.scss'],
})
export class CmDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChildren('templateDeals') dashBoardDeals: QueryList<any>;
  @ViewChildren('templateTarget') dashBoardTaget: QueryList<any>;
  @ViewChildren('templateInOut') dashBoardInOut: QueryList<any>;
  @ViewChildren('templateSpaceForRent') dashBoardSpaceForRent: QueryList<any>;

  @ViewChild('template') template: TemplateRef<any>;
  @ViewChild('accumulationPipe') accumulationPipe: AccumulationChartComponent;
  @ViewChild('noData') noData: TemplateRef<any>;
  @ViewChild('filterTemplate') filterTemplate: TemplateRef<any>;
  @ViewChild('myIsActiveEle') myIsActiveEle: ElementRef;
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

  panelsContractsRealties: any;
  datasContractsRealties: any;

  panelsRealties2: any;
  datasRealties3: any;

  arrVllStatus: any = [];
  vllStatus = '';
  dataDashBoard: any;
  isLoaded: boolean = false;
  titLeModule = '';

  ///MY SALE + GROUP SALE================================
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
  tabActiveLineSucFail = 'btSuccess';

  //nang suat nhan viên
  productivityOwner = [];
  language = 'vn';

  //pyramidcontainer
  legendSettingsPy = {
    visible: false,
    toggleVisibility: false,
  };
  dataSourcePyStatus = [];
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

  pyramidStatus: AccumulationChartComponent | AccumulationChart;
  pyramidStages: AccumulationChartComponent | AccumulationChart;
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
  isStatus = true;
  tabActivePy = 'btStatus';

  //ReasonSuscess
  isReasonSuscess = true;
  valueFormat: any;

  //dash board deals
  tmpDashBoardDeals = [];
  //thông số thiết lập
  toppSuccessFail = 7; //top thành công thất bại
  winReason = 7; //top lý do thành công
  loseReason = 7; //top lý do thất bại
  employeeProductivity = 7; //top năng suất nhân viên
  //====================================================================

  //TAGET DASHBOARD ====================================================
  //chart sales pipeline
  lstAlls = [];
  lstSalesStages = [];
  lstNamesStages = [];
  lstSalesStatus = [];
  lstNamesStatus = [];
  lstSalesStatusCodes = [];
  lstNamesStatusCodes = [];
  tmpProcessDefault: any;
  lstStatusCodes = [];
  vllStatusDeals = [];
  vllSalesPiplines = [];
  palettePipsStages = [];
  palettePipsStatus = [];
  palettePipsStatusCodes = [];
  //end

  //chart series
  chartArea: Object = {
    border: {
      width: 0,
    },
  };
  primaryXAxisY;
  primaryYAxisY;

  productivityYear = [];
  cornerRadius: Object = {
    topLeft: 6,
    topRight: 6,
  };

  paretoOptions: Object = {
    marker: {
      visible: true,
      isFilled: true,
      width: 7,
      height: 7,
    },
    dashArray: '3,2',
    width: 2,
  };

  legendSeri: Object = {
    visible: true,
    enableHighlight: true,
  };

  toolTipSeri;
  vllMonths = [];
  lstMonthsSeries = [];
  //end
  //bulletchart
  //Year
  minimumBullet: number = 0;
  maximumBulletQ0: number = 1000;
  width0: string = Browser.isDevice ? '100%' : '80%';
  titleQ0 = '';
  intervalQ0: number = 100;
  dataBulletQ0s = [];
  dealValueWonQ0: number = 0;
  targetQ0: string = '0';
  labelFormatQ0: string = '${value}';
  tooltipBullet0 = {
    enable: true,
  };
  //Q1
  maximumBulletQ1: number = 600;
  titleQ1 = '';
  intervalQ1: number = 100;
  dataBulletQ1s: Object[] = [];
  dealValueWonQ1: number = 0;
  targetQ1: string = '0';
  labelFormatQ1: string = '0';
  tooltipBullet1 = {
    enable: true,
  };
  //Q2
  maximumBulletQ2: number = 600;
  titleQ2 = '';
  intervalQ2: number = 100;
  dataBulletQ2s = [];
  dealValueWonQ2: number = 0;
  targetQ2: string = '0';
  labelFormatQ2: string = '0';
  tooltipBullet2 = {
    enable: true,
  };
  //Q3
  maximumBulletQ3: number = 600;
  titleQ3 = '';
  intervalQ3: number = 100;
  dataBulletQ3s = [];
  dealValueWonQ3: number = 0;
  targetQ3: string = '0';
  labelFormatQ3: string = '0';
  tooltipBullet3 = {
    enable: true,
  };
  //Q4
  maximumBulletQ4: number = 600;
  titleQ4 = '';
  intervalQ4: number = 100;
  dataBulletQ4s = [];
  dealValueWonQ4: number = 0;
  targetQ4: string = '0';
  labelFormatQ4: string = '0';

  valueBorder: Object = { color: '#FF4500' };
  lstQuarters = [];
  tooltipBullet4 = {
    enable: true,
    template: '',
  };
  dataLabelBuleet: Object = {
    enable: true,
    labelStyle: { color: '#ffffff', size: '13' },
  };
  //end

  //accumulation chart
  piedata: Object[] = [];
  datalabelAc: Object = {
    visible: true,
    position: 'Outside',
    enableRotation: false,
  };
  startAngle: number = 0;
  explodeIndex: number = 2;
  endAngle: number = 360;
  legendSettings: Object = {
    visible: false,
    toggleVisibility: false,
    position: 'Right',
    textWrap: 'Wrap',
    label: [],
  };
  vllQuaters = [];
  //end

  //top sales performance
  lstUsers = [];

  lstVllTopSales = [];
  vllUpDowns = [];
  currencyID: any;
  exchangeRate: number;
  vllTextYears = [];
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
  vllPy: any;
  dataReasonsSuscess = [];
  dataReasonsFails = [];
  tabActiveReson = 'btReasonSucess';
  textTitle = '';

  //===================================================================

  //===============INOUT DASHBOARD=====================================
  year = 2023;
  legendSettingsColumn = {
    visible: true,
  };
  tooltipChartColumn = {
    enable: true,
    shared: true,
    // format: '${point.x} : <b>${point.y}</b>',
  };
  //////TESTTTTTT
  //Chart pie tronn
  pieChartInQTSC = [
    { year: '2022', count: 3 },
    { year: '2023', count: 3 },
  ];
  pieChartOutQTSC = [
    { year: '2022', count: 7 },
    { year: '2023', count: 3 },
  ];
  pieChartIn = [
    { x: 'Giới thiệu', y: 7 },
    { x: 'Điện thoại', y: 7 },
    { x: 'Website', y: 3 },
  ];
  pieChartOutDisposalReason = [];
  pieChartInChanel = [];

  pieChartClassify = [
    { classification: 'Khách hàng mới ', count: 7 },
    { classification: 'Khách hàng nội khu', count: 3 },
  ];

  legendSettingsCircle = {
    visible: true,
  };
  tooltipInOut = {
    enable: true,
  };
  //end pie
  listEnterpriseNew = [
    {
      quarter: '1',
      quarterName: 'Q1',
      businessType: '1',
      businessTypeName: 'DNTN',
    },
    {
      quarter: '1',
      quarterName: 'Q1',
      businessType: '1',
      businessTypeName: 'DNTN',
    },
    {
      quarter: '1',
      quarterName: 'Q1',
      businessType: '1',
      businessTypeName: 'DNTN',
    },
    {
      quarter: '2',
      quarterName: 'Q2',
      businessType: '2',
      businessTypeName: 'DNNN',
    },
  ];
  chartDataColumn = [
    { country: 'Quý 1', gold: 50, silver: 75, red: 80 },
    { country: 'Quý 2', gold: 40, silver: 20, red: 80 },
    { country: 'Quý 3', gold: 70, silver: 45, red: 80 },
    { country: 'Quý 4', gold: 40, silver: 20, red: 80 },
    { country: 'Tổng cộng', gold: 70, silver: 45, red: 80 },
  ];

  primaryXAxisColumn = {
    interval: 1,
    valueType: 'Category',
    title: '',
  };
  primaryYAxisColumnEpIn = {
    title: 'Tổng số',
    minimum: 0,
    // maximum: 100,
    // interval: 10,
    // lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1 },
    minorGridLines: { width: 1 },
    minorTickLines: { width: 0 },
  };

  primaryYAxisColumnEpOut = {
    title: 'Tổng số',
    minimum: 0,
    // maximum: 100,
    // interval: 10,
    // lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1 },
    minorGridLines: { width: 1 },
    minorTickLines: { width: 0 },
  };

  primaryYAxisColumnAreaIn = {
    title: 'Tổng số',
    minimum: 0,
    // maximum: 100,
    //  interval: 10,
    // lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1 },
    minorGridLines: { width: 1 },
    minorTickLines: { width: 0 },
  };

  primaryYAxisColumnAreaOut = {
    title: 'Tổng số',
    minimum: 0,
    // maximum: 100,
    // interval: 10,
    // lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1 },
    minorGridLines: { width: 1 },
    minorTickLines: { width: 0 },
  };

  ///END TEST
  titleTotalAll = 'Tổng cộng';
  titleQuotationAreaIn = 'Diện tích bán mới';
  titleQuotationAreaOut = 'Diện tích thanh lý';
  //titleRentalAreaIn = 'Diện tích bán mới';
  //titleRentalAreaOut = 'Diện tích thanh lý';
  titleUpAndDownAreaIn = 'Diện tích mở rộng';
  titleUpAndDownAreaOut = 'Diện tích giảm';

  //In
  listCountEnterprise = [];
  //Out
  listCountEnterpriseOut = [];

  //InOut may nam
  listQTSCIn = [];
  listQTSCOut = [];
  //Nguồn + va lý do Out
  listInByChanel = [];
  listOutByDisposalCmt = [];
  dataBusinessType = [];
  //InOut diện tích
  listAreaIn = [];
  listAreaOut = [];
  isQTSC = false;

  loadedMap = false;
  //=============================================================

  //================ REALTIES DASHBROAD=============================
  dataSpaceForRent = [];

  primaryYAxisColumnSFR = {
    title: 'm2',
    minimum: 0,
    // maximum: 100,
    // interval: 50,
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1 },
    minorGridLines: { width: 1 },
    minorTickLines: { width: 0 },
  };
  titleUsableArea = 'Diện tích cho thuê ';

  // zoomSettings: Object = {
  //   mode: 'X',
  //   enableMouseWheelZooming: true,
  //   enablePinchZooming: true,
  //   enableSelectionZooming: true,
  //   enableScrollbar: true,
  // };

  titleDashboard = 'Thống kê diện tích văn phòng cho thuê nội khu';

  dataOfficeType = [];
  girdViewDashboardType = [
    {
      field: 'assetName',
      headerText: 'Tên tòa nhà',
      textAlign: 'Left',
      width: 90,
    },
    {
      field: 'idiM0',
      headerText: 'Năm xây dựng',
      textAlign: 'Left',
      width: 90,
    },
    {
      field: 'idiM1',
      headerText: 'Năm hoàn thành',
      textAlign: 'Left',
      width: 90,
    },
    {
      field: 'usableArea',
      headerText: 'Tổng diện tích đang cho thuê',
      textAlign: 'Left',
      width: 90,
    },
    {
      field: 'fillArea',
      headerText: 'Tổng diện tích lấp đầy',
      textAlign: 'Left',
      width: 90,
    },
    {
      field: 'vacantArea',
      headerText: 'Tổng diện tích còn trống',
      textAlign: 'Left',
      width: 90,
    },
    {
      field: 'fillPercent',
      headerText: '% lấp đầy',
      textAlign: 'Left',
      width: 90,
    },
    {
      field: 'vacantPercent',
      headerText: '% trống',
      textAlign: 'Left',
      width: 90,
    },
  ];

  primaryYAxisColumnOTR = {
    title: '',
    minimum: 0,
    // maximum: 100,
    // interval: 1000,
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1 },
    minorGridLines: { width: 1 },
    minorTickLines: { width: 0 },
  };

  //=============================================================

  constructor(
    inject: Injector,
    private layout: LayoutComponent,
    private auth: AuthService,
    private pageTitle: PageTitleService,
    private authstore: AuthStore,
    private cmSv: CodxCmService,
    private renderer: Renderer2
  ) {
    super(inject);
    this.user = this.authstore.get();
    this.language = this.auth.userValue?.language?.toLowerCase();

    this.reportID = this.router.snapshot.params['funcID'];
    this.loadChangeDefault();
  }
  onInit(): void {
    this.panelsDeals1 = JSON.parse(
      '[{"id":"11.1636284528927885_layout","row":0,"col":0,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"21.5801149283702021_layout","row":0,"col":12,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"31.6937258303982936_layout","row":0,"col":24,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"41.5667390469747078_layout","row":0,"col":36,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"51.4199281088325755_layout","row":0,"col":48,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"61.4592017601751599_layout","row":4,"col":0,"sizeX":20,"sizeY":13,"minSizeX":20,"minSizeY":13,"maxSizeX":null,"maxSizeY":null},{"id":"71.14683256767762543_layout","row":4,"col":20,"sizeX":40,"sizeY":13,"minSizeX":40,"minSizeY":13,"maxSizeX":null,"maxSizeY":null},{"id":"81.21519762020964252_layout","row":16,"col":0,"sizeX":40,"sizeY":12,"minSizeX":40,"minSizeY":12,"maxSizeX":null,"maxSizeY":null},{"id":"91.21519762020964252_layout","row":16,"col":40,"sizeX":20,"sizeY":12,"minSizeX":20,"minSizeY":12,"maxSizeX":null,"maxSizeY":null},{"id":"101.21519762020964252_layout","row":28,"col":0,"sizeX":60,"sizeY":12,"minSizeX":60,"minSizeY":12,"maxSizeX":null,"maxSizeY":null}]'
    );
    this.datasDeals1 = JSON.parse(
      '[{"panelId":"11.1636284528927885_layout","data":"1"},{"panelId":"21.5801149283702021_layout","data":"2"},{"panelId":"31.6937258303982936_layout","data":"3"},{"panelId":"41.5667390469747078_layout","data":"4"},{"panelId":"51.4199281088325755_layout","data":"5"},{"panelId":"61.4592017601751599_layout","data":"6"},{"panelId":"71.14683256767762543_layout","data":"7"},{"panelId":"81.21519762020964252_layout","data":"8"},{"panelId":"91.21519762020964252_layout","data":"9"},{"panelId":"101.21519762020964252_layout","data":"10"}]'
    );

    this.panelsDeals2 = JSON.parse(
      '[{"id":"12.1636284528927885_layout","row":0,"col":0,"sizeX":15,"sizeY":4,"minSizeX":15,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"22.5801149283702021_layout","row":0,"col":15,"sizeX":15,"sizeY":4,"minSizeX":15,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"32.6937258303982936_layout","row":0,"col":30,"sizeX":15,"sizeY":4,"minSizeX":15,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"42.5667390469747078_layout","row":0,"col":45,"sizeX":15,"sizeY":4,"minSizeX":15,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"52.4199281088325755_layout","row":4,"col":0,"sizeX":20,"sizeY":15,"minSizeX":20,"minSizeY":15,"maxSizeX":null,"maxSizeY":null},{"id":"62.4592017601751599_layout","row":4,"col":20,"sizeX":40,"sizeY":15,"minSizeX":40,"minSizeY":15,"maxSizeX":null,"maxSizeY":null},{"id":"72.14683256767762543_layout","row":19,"col":0,"sizeX":20,"sizeY":14,"minSizeX":20,"minSizeY":14,"maxSizeX":null,"maxSizeY":null},{"id":"82.36639064171709834_layout","row":19,"col":20,"sizeX":20,"sizeY":14,"minSizeX":20,"minSizeY":14,"maxSizeX":null,"maxSizeY":null},{"id":"92.06496875406606994_layout","row":19,"col":40,"sizeX":20,"sizeY":14,"minSizeX":20,"minSizeY":14,"maxSizeX":null,"maxSizeY":null,"header":null},{"id":"102.21519762020962552_layout","row":33,"col":0,"sizeX":40,"sizeY":15,"minSizeX":40,"minSizeY":15,"maxSizeX":null,"maxSizeY":null},{"id":"112.21519762020964252_layout","row":33,"col":40,"sizeX":20,"sizeY":15,"minSizeX":20,"minSizeY":15,"maxSizeX":null,"maxSizeY":null}]'
    );
    this.datasDeals2 = JSON.parse(
      '[{"panelId":"12.1636284528927885_layout","data":"1"},{"panelId":"22.5801149283702021_layout","data":"2"},{"panelId":"32.6937258303982936_layout","data":"3"},{"panelId":"42.5667390469747078_layout","data":"4"},{"panelId":"52.4199281088325755_layout","data":"5"},{"panelId":"62.4592017601751599_layout","data":"6"},{"panelId":"72.14683256767762543_layout","data":"7"},{"panelId":"82.36639064171709834_layout","data":"8"},{"panelId":"92.06496875406606994_layout","data":"9"},{"panelId":"102.21519762020962552_layout","data":"10"},{"panelId":"112.21519762020964252_layout","data":"11"}]'
    );

    this.panelsContractsRealties = JSON.parse(
      '[{"id":"13.1636284528927885_layout","row":0,"col":0,"sizeX":30,"sizeY":25,"minSizeX":30,"minSizeY":25,"maxSizeX":null,"maxSizeY":null},{"id":"23.5801149283702021_layout","row":0,"col":30,"sizeX":30,"sizeY":25,"minSizeX":30,"minSizeY":25,"maxSizeX":null,"maxSizeY":null},{"id":"33.6937258303982936_layout","row":25,"col":0,"sizeX":30,"sizeY":25,"minSizeX":30,"minSizeY":25,"maxSizeX":null,"maxSizeY":null},{"id":"43.5667390469747078_layout","row":25,"col":30,"sizeX":30,"sizeY":25,"minSizeX":30,"minSizeY":25,"maxSizeX":null,"maxSizeY":null},{"id":"53.4199281088325755_layout","row":50,"col":0,"sizeX":30,"sizeY":25,"minSizeX":30,"minSizeY":25,"maxSizeX":null,"maxSizeY":null},{"id":"63.4592017601751599_layout","row":50,"col":30,"sizeX":30,"sizeY":25,"minSizeX":30,"minSizeY":25,"maxSizeX":null,"maxSizeY":null},{"id":"73.14683256767762543_layout","row":75,"col":0,"sizeX":30,"sizeY":25,"minSizeX":30,"minSizeY":25,"maxSizeX":null,"maxSizeY":null},{"id":"83.21519762020964252_layout","row":75,"col":30,"sizeX":30,"sizeY":25,"minSizeX":30,"minSizeY":25,"maxSizeX":null,"maxSizeY":null},{"id":"93.21519762020964252_layout","row":100,"col":0,"sizeX":30,"sizeY":20,"minSizeX":30,"minSizeY":20,"maxSizeX":null,"maxSizeY":null}]'
    );
    this.datasContractsRealties = JSON.parse(
      '[{"panelId":"13.1636284528927885_layout","data":"1"},{"panelId":"23.5801149283702021_layout","data":"2"},{"panelId":"33.6937258303982936_layout","data":"3"},{"panelId":"43.5667390469747078_layout","data":"4"},{"panelId":"53.4199281088325755_layout","data":"5"},{"panelId":"63.4592017601751599_layout","data":"6"},{"panelId":"73.14683256767762543_layout","data":"7"},{"panelId":"83.21519762020964252_layout","data":"8"},{"panelId":"93.21519762020964252_layout","data":"9"}]'
    );

    this.primaryXAxisY = {
      title: this.language == 'VN' ? 'Tháng' : 'Month',
    };
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
              this.getDataset('GetDashBoardTargetAsync', null, null, null);
              break;
            // nhom chua co tam
            case 'CMD002':
              this.getDataset('GetReportSourceAsync', null, null, null);
              break;
            //ca nhan chua co ne de vay
            case 'CMD003':
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
        method = 'GetDashBoardTargetAsync';
        this.getDataset('SalesDataSetBusiness', method, param);
        break;
      // nhom chua co tam
      case 'CMD002':
        this.getDataset('SalesDataSetBusiness', 'GetReportSourceAsync', param);
        break;
      //ca nha chua co ne de vay
      case 'CMD003':
        this.getDataset('SalesDataSetBusiness', 'GetReportSourceAsync', param);
        break;
      // target
      case 'CMD004':
        this.isLoaded = true;
        break;
      case 'CMDQTSC007':
      case 'CMDQTSC008':
        this.isQTSC = this.funcID == 'CMDQTSC007';
        if (!this.dataBusinessType || this.dataBusinessType?.length == 0)
          this.cache.valueList('CRM079').subscribe((vll) => {
            if (vll && vll?.datas) {
              this.dataBusinessType = vll?.datas;
            }
          });
        this.year = new Date().getUTCFullYear();
        if (param && param?.ToDate) {
          this.year = moment(param?.ToDate).toDate().getFullYear();
        }
        this.getDataset(
          'QTSCNumberInAndOutBusiness',
          'GetReportSourceAsync',
          param
        );
        break;
      case 'CMDQTSC010':
        this.getDataset(
          'OfficeSpaceForRentBusiness',
          'GetReportSourceAsync',
          param
        );
        break;
      case 'CMDQTSC011':
        this.getDataset(
          'OfficeTypeReportBusiness',
          'GetReportSourceAsync',
          param
        );
        break;
    }
    this.detectorRef.detectChanges();
  }

  getNameStatus(status) {
    return this.arrVllStatus.filter((x) => x.value == status)[0]?.text;
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
    this.api
      .execSv<any>(
        'DP',
        'ERM.Business.DP',
        'ProcessesBusiness',
        'GetProcessDefaultAsync',
        ['1']
      )
      .subscribe((res) => {
        if (res) {
          this.tmpProcessDefault = res;
        }
      });

    this.cmSv.loadComboboxData('CMDealStatus', 'CM').subscribe((res) => {
      if (res) {
        this.lstStatusCodes = res;
      }
    });

    this.cache.valueList('CRM042').subscribe((vll) => {
      if (vll && vll?.datas) {
        this.vllStatusDeals = vll?.datas;
      }
    });

    this.cache.valueList('SYS058').subscribe((vll) => {
      if (vll && vll?.datas) {
        this.vllTextYears = vll?.datas;
      }
    });

    this.cache.valueList('CRM071').subscribe((vll) => {
      if (vll && vll?.datas) {
        this.vllSalesPiplines = vll?.datas;
      }
    });
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
        this.vllPy = vl.datas;
        this.valueFormat = vl.datas?.find((x) => x.value == '3')?.text;
      }
    });
    this.cache.valueList('CRM046').subscribe((ele) => {
      if (ele && ele?.datas) {
        this.vllQuaters = ele?.datas;
      }
    });
    this.cache.valueList('CRM048').subscribe((ele) => {
      if (ele && ele?.datas) {
        this.vllMonths = ele?.datas;
      }
    });
    this.cache.valueList('CRM068').subscribe((ele) => {
      if (ele && ele?.datas) {
        this.lstVllTopSales = ele?.datas;
      }
    });
    this.cache.valueList('CRM069').subscribe((ele) => {
      if (ele && ele?.datas) {
        this.vllUpDowns = ele?.datas;
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
          this.toppSuccessFail =
            Number.parseInt(paramDefault['ToppSuccessFail']) ??
            this.toppSuccessFail;
          this.winReason =
            Number.parseInt(paramDefault['WinReason']) ?? this.winReason;
          this.loseReason =
            Number.parseInt(paramDefault['LoseReason']) ?? this.loseReason;
          this.employeeProductivity =
            Number.parseInt(paramDefault['EmployeeProductivity']) ??
            this.employeeProductivity;

          this.currencyID = paramDefault['DefaultCurrency'] ?? 'VND';
          //this.employeeProductivity = paramDefault['EmployeeProductivity'];
          this.cmSv
            .getExchangeRate(this.currencyID, new Date())
            .subscribe((res) => {
              if (res && res?.exchRate > 0) {
                this.exchangeRate = res?.exchRate;
              } else {
                this.exchangeRate = 1;
                this.currencyID = 'VND';
              }
              this.formatSetting();
            });
        } else {
          this.exchangeRate = 1;
          this.currencyID = 'VND';
          this.formatSetting();
        }
      }
    });
  }

  formatSetting() {
    if (this.language == 'vn') {
      this.primaryXAxisRatio.title =
        'Tổng doanh số dự kiến ( ' + this.currencyID + ')';
      this.primaryYAxisRatio.title = 'Tổng mục tiêu ( ' + this.currencyID + ')';

      this.tooltip.format =
        'Tổng doanh số dự kiến : <b>${point.x} ' +
        this.currencyID +
        '</b> <br/>Tổng mục tiêu : <b>${point.y} ' +
        this.currencyID +
        '</b><br/>Số lượng cơ hội : <b>${point.size}</b>';
    } else {
      this.primaryXAxisRatio.title =
        'Total expected sales ( ' + this.currencyID + ')';
      this.primaryYAxisRatio.title = 'Total target ( ' + this.currencyID + ')';

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
        let pattern =
          /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
        if (this.arrReport.length > 1 && !this.reportID.match(pattern)) {
          this.codxService.navigate(
            '',
            `${
              this.view.function?.module
                ? this.view.function?.module.toLocaleLowerCase()
                : 'cm'
            }/dashboard-view/${this.reportID}`
          );
          return;
        }
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
                    this.getDataset(
                      'SalesDataSetBusiness',
                      'GetDashBoardTargetAsync'
                    );
                    break;
                  // nhom chua co tam
                  case 'CMD002':
                    this.getDataset(
                      'SalesDataSetBusiness',
                      'GetReportSourceAsync'
                    );
                    break;
                  //ca nhan chua co ne de vay
                  case 'CMD003':
                    // let predicates = 'Owner =@0';
                    // let dataValues = this.user.userID;
                    // this.getDataDashboard(predicates, dataValues);
                    //test DataSet
                    this.getDataset(
                      'SalesDataSetBusiness',
                      'GetReportSourceAsync'
                    );
                    break;
                  // target
                  case 'CMD004':
                    this.isLoaded = true;
                    break;
                  case 'CMDQTSC007':
                  case 'CMDQTSC008':
                    this.isQTSC = this.funcID == 'CMDQTSC007';
                    this.year = new Date().getUTCFullYear();
                    if (
                      !this.dataBusinessType ||
                      this.dataBusinessType?.length == 0
                    )
                      this.cache.valueList('CRM079').subscribe((vll) => {
                        if (vll && vll?.datas) {
                          this.dataBusinessType = vll?.datas;
                        }
                      });
                    this.getDataset(
                      'QTSCNumberInAndOutBusiness',
                      'GetReportSourceAsync'
                    );
                    break;
                  case 'CMDQTSC010':
                    this.getDataset(
                      'OfficeSpaceForRentBusiness',
                      'GetReportSourceAsync'
                    );
                    break;
                  case 'CMDQTSC011':
                    this.getDataset(
                      'OfficeTypeReportBusiness',
                      'GetReportSourceAsync'
                    );
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

  ///-------------------------Get DATASET---------------------------------------------//
  getDataset(
    className: string,
    method: string,
    parameters = null,
    predicate = null,
    dataValue = null
  ) {
    if (this.isLoaded) return;
    this.resetData();
    if (method) {
      let requets = [parameters, predicate, dataValue];

      if (
        this.funcID == 'CMD002' ||
        this.funcID == 'CMD003' ||
        this.funcID == 'CMDQTSC007'
      )
        requets = [parameters, predicate, dataValue, this.funcID];

      this.subscription = this.api
        .execSv<any[]>(
          'rptcm',
          'Codx.RptBusiness.CM',
          className, //'SalesDataSetBusiness',
          method,
          requets
        )
        .subscribe((res) => {
          if (res) {
            //xu ly nv

            switch (this.funcID) {
              case 'CMD001':
                this.getSalesDashBoards(res);
                break;
              case 'CMD002':
              case 'CMD003':
                this.changeMySales(res);
                break;
              case 'CMDQTSC007':
              case 'CMDQTSC008':
                this.viewDashBoardsInOut(res);
                break;
              case 'CMDQTSC010':
                this.viewDashBoardsOfficeSpaceForRent(res);
                break;
              case 'CMDQTSC011':
                this.viewDashBoardsOfficeTypeReport(res);
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
    this.chartBussnessLine = [];
    this.dataReasonsSuscess = [];
    this.dataReasonsFails = [];
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
  changeMySales(dataDashboard) {
    let dataSetDeals = dataDashboard.listDeals;
    let dataSetLead = dataDashboard.listLeads;
    let dataReason = dataDashboard.listReason;
    let dataTargetYear = dataDashboard.listTarget;
    let tmpProcessDefault = dataDashboard.processDefault;
    let dataTargetLine = dataDashboard.listTargetsLines;

    if (!dataSetDeals || dataSetDeals?.lenght == 0) return;
    this.countNew = dataSetDeals.filter(
      (x) => x.status == '1' || x.status == '0'
    )?.length;
    this.countProcessing = dataSetDeals.filter((x) => x.status == '2')?.length;
    let dataSuccess = dataSetDeals.filter((x) => x.status == '3');
    this.countSuccess = dataSuccess?.length;
    let dataFails = dataSetDeals.filter((x) => x.status == '5');
    this.countFail = dataFails?.length;
    this.getChartConversionRate(dataSetLead, dataSetDeals, tmpProcessDefault);
    this.getBusinessLine(dataSetDeals, dataTargetYear);
    this.getIndustries(dataSetDeals);
    this.getOwnerTop(dataSuccess);
    this.getReasonChart(dataReason);
    if (dataTargetLine?.length > 0)
      this.getChartProductivityOwner(dataSetDeals, dataSuccess, dataTargetLine);
  }

  getBusinessLine(dataSet, dataTargetYear) {
    if (!dataSet || dataSet?.length == 0) return;
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
        this.chartBussnessLine.push({
          ...obj,
          ...this.getChartBussinessLine(businesLine[key]),
        });

        let target =
          dataTargetYear?.filter((x) => x.businessLineID == key)[0]?.target ??
          0;
        this.dataStatisticTarget.push({
          ...obj,
          ...this.getDataStatisticTarget(businesLine[key], target),
        });
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
  getChartBussinessLine(dataSet) {
    let monthGroup = this.groupBy(dataSet, 'moY');
    let chartDataSuscess = [];
    let chartDataFail = [];
    for (let i = 1; i <= 12; i++) {
      chartDataSuscess.push({
        month: i,
        quantity: 0,
        percentage: 0,
      });
      chartDataFail.push({
        month: i,
        quantity: 0,
        percentage: 0,
      });
    }
    if (monthGroup) {
      for (let key in monthGroup) {
        var idxSuc = chartDataSuscess.findIndex((x) => x.month == key);
        if (idxSuc != -1) {
          chartDataSuscess[idxSuc].quantity =
            monthGroup[key].filter((x) => x.status == '3')?.length ?? 0;
          chartDataSuscess[idxSuc].percentage =
            monthGroup[key]?.length > 0
              ? (chartDataSuscess[idxSuc].quantity / monthGroup[key]?.length) *
                100
              : 0;
        }

        var idxFail = chartDataFail.findIndex((x) => x.month == key);
        if (idxFail != -1) {
          chartDataFail[idxFail].quantity =
            monthGroup[key].filter((x) => x.status == '5')?.length ?? 0;
          chartDataFail[idxFail].percentage =
            monthGroup[key]?.length > 0
              ? (chartDataFail[idxFail].quantity / monthGroup[key]?.length) *
                100
              : 0;
        }
      }
    }
    return { chartDataSuscess: chartDataSuscess, chartDataFail: chartDataFail };
  }

  getDataStatisticTarget(dataSet, target) {
    let totalTarget = 0;
    let totalDealValue = 0;

    if (Array.isArray(dataSet)) {
      dataSet.forEach((x) => {
        console.log(x.dealValue + '  ' + x.exchangeRate);
        totalDealValue += x.dealValue * x.exchangeRate;
        ///target  ?? targer Khanh keeu lay theo nam
        totalTarget = target;
      });
    }
    return {
      totalTarget: totalTarget / this.exchangeRate,
      totalDealValue: totalDealValue / this.exchangeRate,
    };
  }

  getIndustries(dataSet) {
    this.dataSourceIndustry = [];
    this.paletteIndustry = [];
    if (!dataSet || dataSet?.length == 0) return;
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
    this.minOwners = [];
    this.maxOwners = [];
    if (!dataSet || dataSet?.length == 0) return;
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
      this.maxOwners = JSON.parse(JSON.stringify(owner)).sort(
        (a, b) => b.quantity - a.quantity
      );

      this.minOwners = JSON.parse(JSON.stringify(owner)).sort(
        (a, b) => a.quantity - b.quantity
      );

      if (this.maxOwners?.length > this.toppSuccessFail) {
        this.maxOwners = this.maxOwners.splice(0, this.toppSuccessFail - 1);
        this.minOwners = this.minOwners.splice(0, this.toppSuccessFail - 1);
      }
    }
  }

  getChartProductivityOwner(dataDeals, dataSuccess, dataTargetLine) {
    // public string ObjectID { get; set; }
    //     public string ObjectName { get; set; }
    //     public decimal SumTarget { get; set; }
    //     public decimal SumDealValueSuccess { get; set; }
    //     public decimal Percentage { get; set; }
    //     public string CurrencyID { get; set; }
    this.productivityOwner = [];
    if (!dataDeals || dataDeals?.length == 0) return;
    let listOwner = this.groupBy(dataDeals, 'owner');
    if (listOwner) {
      let year = dataTargetLine[0].year;
      for (let key in listOwner) {
        let color = this.random_bg_color();
        let sumDealValueSuccess = 0;
        //chua tisnh nam => hoi lai khanh sau
        let dataSucOwner = dataSuccess.filter((x) => x.owner == key);
        if (dataSucOwner?.length > 0) {
          dataSucOwner.forEach((x) => {
            let money = x.dealValue * x.exchangeRate;
            if (money) sumDealValueSuccess += money;
          });
          sumDealValueSuccess = sumDealValueSuccess / this.exchangeRate;
        }

        let sumTarget = 0;
        let sumTargetOwner = dataTargetLine.filter(
          (tl) => tl.salespersonID == key
        );
        if (sumTargetOwner?.length > 0) {
          sumTargetOwner.forEach((x) => {
            let moneyTarget = x.target * x.exchangeRate;
            if (moneyTarget) sumTarget += moneyTarget;
          });
          sumTarget = sumTarget / this.exchangeRate;
        }

        if (sumTarget > 0) {
          let obj = {
            objectID: key,
            objectName: listOwner[key][0].ownerName ?? key,
            sumDealValueSuccess: sumDealValueSuccess,
            sumTarget: sumTarget,
            percentage: ((sumDealValueSuccess * 100) / sumTarget).toFixed(2), //chua tinh
            currencyID: this.currencyID,
            color: color,
          };
          this.productivityOwner.push(obj);
        }
      }
      this.productivityOwner = this.productivityOwner.sort(
        (a, b) => b.sumTarget - a.sumTarget
      );
      if (this.productivityOwner.length > this.employeeProductivity)
        this.productivityOwner = this.productivityOwner.slice(
          0,
          this.employeeProductivity - 1
        );
    }
  }

  getReasonChart(dataReason) {
    this.dataReasonsSuscess = [];
    this.dataReasonsFails = [];
    if (!dataReason || dataReason?.length == 0) return;
    let listRsSuscess = dataReason.filter((x) => x.reasonType == '1');
    if (listRsSuscess?.length > 0) {
      let reasonsSuscessGroup = this.groupBy(listRsSuscess, 'reasonName');
      if (reasonsSuscessGroup) {
        for (let key in reasonsSuscessGroup) {
          let rsSucess = {
            reasonName: key,
            quantity: reasonsSuscessGroup[key]?.length,
            percentage: (
              (reasonsSuscessGroup[key]?.length / listRsSuscess.length) *
              100
            ).toFixed(2),
          };
          this.dataReasonsSuscess.push(rsSucess);
        }
        this.dataReasonsSuscess = this.dataReasonsSuscess.sort(
          (a, b) => b.quantity - a.quantity
        );
        if (this.dataReasonsSuscess?.length > this.winReason)
          this.dataReasonsSuscess = this.dataReasonsSuscess.splice(
            0,
            this.winReason - 1
          );
      }
    }
    let listRsFails = dataReason.filter((x) => x.reasonType == '2');
    if (listRsFails?.length > 0) {
      let reasonsFails = this.groupBy(listRsFails, 'reasonName');
      if (reasonsFails) {
        for (let key in reasonsFails) {
          let rsFails = {
            reasonName: key,
            quantity: reasonsFails[key]?.length,
            percentage: (
              (reasonsFails[key]?.length / listRsFails.length) *
              100
            ).toFixed(2),
          };
          this.dataReasonsFails.push(rsFails);
        }
        this.dataReasonsFails = this.dataReasonsFails.sort(
          (a, b) => b.quantity - a.quantity
        );
        if (this.dataReasonsFails?.length > this.loseReason)
          this.dataReasonsFails = this.dataReasonsFails.splice(
            0,
            this.loseReason - 1
          );
      }
    }
  }
  //Loi cai chuyen doi ko nằm trong khoảng time tìm kiếm
  getChartConversionRate(dataLeads, dataDeals, tmpProcessDefault) {
    let objectLead = {
      value: '1',
      name: this.getNamePy('1'),
      quantity: dataLeads?.length ?? 0,
    };
    this.dataSourcePyStatus.unshift(objectLead);
    this.dataSourcePyStage.unshift(objectLead);
    //du dieu kien
    let leadStatus311 = {
      value: '1',
      name: this.getNamePy('2'),
      quantity:
        dataLeads?.filter((x) => x.status == '3' || x.status == '11').length ??
        0,
    };
    this.dataSourcePyStatus.unshift(leadStatus311);
    this.dataSourcePyStage.unshift(leadStatus311);
    //da chuyen thanh co hoi
    let dealIDs = [];
    dataLeads.forEach((x) => {
      if (x.dealID) dealIDs.push(x.dealID);
    });
    let dealsOfLead = dataDeals?.filter((x) => dealIDs.includes(x.recID));
    if (!dealsOfLead || dealsOfLead?.length == 0) return;
    let leadToDeals = {
      value: '3',
      name: this.getNamePy('3'),
      quantity: dealsOfLead?.length ?? 0,
      items: [],
    };
    let items = [];
    //theo status Code
    let statusCode = this.groupBy(dealsOfLead, 'statusCodeID');
    if (statusCode) {
      for (let key in statusCode) {
        let item = {
          value: '',
          name: statusCode[key][0].statusCodeName,
          quantity: statusCode[key].length ?? 0,
        };
        items.push(item);
      }
    }
    if (items?.length > 0) {
      items = items.sort((a, b) => b.quantity - a.quantity);
      items.forEach((x, idx) => {
        x.value = (idx + 1).toString();
      });
      leadToDeals.items = items;
    }
    this.dataSourcePyStatus.unshift(leadToDeals);
    //da thanh cong
    let dealsSuc = {
      value: '4',
      name: this.getNamePy('4'),
      quantity: dealsOfLead?.filter((x) => x.status == '3')?.length ?? 0,
    };
    this.dataSourcePyStatus.unshift(dealsSuc);

    //theo quy trinh ma dinh -stage
    //da chuyen thanh co hoi
    if (!tmpProcessDefault) return;
    let dealsOfDf = dealsOfLead?.filter(
      (x) => x.processID == tmpProcessDefault.processID
    );
    if (!dealsOfDf || dealsOfDf?.length == 0) return;
    let dealsDf = {
      value: '3',
      name: tmpProcessDefault.processName,
      quantity: dealsOfDf?.length ?? 0,
      items: [],
    };
    let itemsDf = [];

    let refIns = tmpProcessDefault?.referentsSteps;
    let refIDList = dealsOfDf.map((x) => x.refID);

    if (Array.isArray(refIns) && refIns?.length > 0) {
      refIns.forEach((ref, index) => {
        let listIns = ref.referentsInstances;

        let item = {
          value: index + 1,
          name: ref.stepName,
          quantity: listIns.filter((x) => refIDList.includes(x))?.length ?? 0,
        };
        items.push(item);
      });
    }

    dealsDf.items = itemsDf;
    this.dataSourcePyStage.unshift(dealsDf);

    //da thanh cong
    let dealsSucDf = {
      value: '4',
      name: this.getNamePy('4'),
      quantity: dealsOfLead?.filter((x) => x.status == '3')?.length ?? 0,
    };
    this.dataSourcePyStage.unshift(dealsSucDf);
  }

  ///--format--///
  getNamePy(value) {
    return this.vllPy.find((x) => x.value == value)?.text;
  }
  loadTreeMap(e) {
    // if (e?.treemap?.availableSize?.height && !this.loadedMap) {
    //   e.treemap.availableSize.height = 300;
    //   e.treemap.availableSize.width = 500;
    // }
  }
  resize(e, chart) {
    if (e?.treemap?.availableSize?.height) {
      e.treemap.availableSize.height -= 50;
      e.treemap.areaRect.height = e.treemap.availableSize.height;
      if (chart) {
        chart.refresh();
      }
    }
  }

  changeChart(ele: any, obj: any) {
    let viewCrr = '1';
    switch (ele.id) {
      case 'btBussinessLine':
        if (ele.id == this.tabActiveBusIns) return;
        this.tabActiveBusIns = ele.id;
        viewCrr = '1';
        this.loadedMap = false;
        break;
      case 'btIndustries':
        if (ele.id == this.tabActiveBusIns) return;
        this.tabActiveBusIns = ele.id;
        viewCrr = '2';
        this.loadedMap = false;
        break;
      case 'btMax':
        if (ele.id == this.tabActiveMaxMin) return;
        this.tabActiveMaxMin = ele.id;
        viewCrr = '1';
        break;
      case 'btMin':
        if (ele.id == this.tabActiveMaxMin) return;
        this.tabActiveMaxMin = ele.id;
        viewCrr = '2';
        break;
      case 'btSuccess':
        if (ele.id == this.tabActiveLineSucFail) return;
        this.tabActiveLineSucFail = ele.id;
        viewCrr = '1';
        break;
      case 'btFail':
        if (ele.id == this.tabActiveLineSucFail) return;
        this.tabActiveLineSucFail = ele.id;
        viewCrr = '2';
        break;
      case 'btStatus':
        if (ele.id == this.tabActivePy) return;
        this.tabActivePy = ele.id;
        viewCrr = '1';
        break;
      case 'btStages':
        if (ele.id == this.tabActivePy) return;
        this.tabActivePy = ele.id;
        viewCrr = '2';
        break;
      case 'btReasonSucess':
        if (ele.id == this.tabActiveReson) return;
        this.tabActiveReson = ele.id;
        viewCrr = '1';
        break;
      case 'btReasonFail':
        if (ele.id == this.tabActiveReson) return;
        this.tabActiveReson = ele.id;
        viewCrr = '2';
        break;
    }
    if (viewCrr == '1') {
      !obj.chart2.view.classList.contains('d-none') &&
        obj.chart2.view.classList.add('d-none');

      obj.chart1.view.classList.contains('d-none') &&
        obj.chart1.view.classList.remove('d-none');
      if (obj?.chart1?.temp && obj?.chart2?.temp) {
        !obj.chart2.temp.element.classList.contains('d-none') &&
          obj.chart2.temp.element.classList.add('d-none');
        obj.chart1.temp.element.classList.contains('d-none') &&
          obj.chart1.temp.element.classList.remove('d-none');
        obj.chart1.temp.refresh();
      }
    } else {
      !obj.chart1.view.classList.contains('d-none') &&
        obj.chart1.view.classList.add('d-none');

      obj.chart2.view.classList.contains('d-none') &&
        obj.chart2.view.classList.remove('d-none');

      if (obj?.chart1?.temp && obj?.chart2?.temp) {
        !obj.chart1.temp.element.classList.contains('d-none') &&
          obj.chart1.temp.element.classList.add('d-none');

        obj.chart2.temp.element.classList.contains('d-none') &&
          obj.chart2.temp.element.classList.remove('d-none');

        obj.chart2.temp.refresh();
      }
    }
    this.detectorRef.detectChanges();
  }

  // --------------------------------------------//
  //End Ca nhan
  // --------------------------------------------//

  // --------------------------------------------//
  // DASHBOAD SALES TAGET                     //
  // --------------------------------------------//

  getSalesDashBoards(data, parameters = null) {
    let currentDate = new Date(data?.currentDate);
    let deals = data?.deals;
    let leads = data?.leads;
    let targetLines = data?.targetsLines;
    let lstQuarters = [];
    let lstUsers = [];
    let fromDate = new Date(currentDate);
    let toDate = new Date(currentDate);
    this.statusPip = 'btSaleStages';
    //get lstQuarters
    if (data?.fromDate) {
      fromDate = new Date(data?.fromDate);
    }
    if (data?.toDate) {
      toDate = new Date(data?.toDate);
    }
    let tmpQuarter = {};
    tmpQuarter['year'] = toDate.getFullYear();
    tmpQuarter['quarter'] = 0;
    tmpQuarter['target'] = 0;
    tmpQuarter['dealValueWon'] = 0;
    tmpQuarter['nameQuarter'] = tmpQuarter['year'].toString();
    lstQuarters.push(tmpQuarter);
    if (this.vllQuaters != null) {
      for (let item of this.vllQuaters) {
        tmpQuarter = {};
        tmpQuarter['year'] = toDate.getFullYear();
        tmpQuarter['quarter'] = parseInt(item.value);
        tmpQuarter['target'] = 0;
        tmpQuarter['dealValueWon'] = 0;
        tmpQuarter['nameQuarter'] =
          item.text + '/' + tmpQuarter['year'].toString();
        lstQuarters.push(tmpQuarter);
      }
    }
    //end

    //get lstUsers
    const lstOwnersLeads: string[] = leads
      .filter((x) => x.owner && x.owner.trim() !== '')
      .map((q) => q.owner)
      .filter((value, index, self) => self.indexOf(value) === index);
    const lstDealsOwnerDeals = deals
      .filter((x) => x.owner && x.owner.trim() !== '')
      .map((q) => q.owner)
      .filter((value, index, self) => self.indexOf(value) === index);
    const lstOwnerAlls = [...lstOwnersLeads, ...lstDealsOwnerDeals].filter(
      (value, index, self) => self.indexOf(value) === index
    );
    const lstDealOwners: string[] = Array.from(new Set(lstOwnerAlls));
    if (lstDealOwners != null && lstDealOwners.length > 0) {
      this.api
        .execSv<any>(
          'SYS',
          'ERM.Business.AD',
          'UsersBusiness',
          'GetUserByIDAsync',
          [lstDealOwners]
        )
        .subscribe((res) => {
          if (res != null && res.length > 0) {
            for (var item of res) {
              var tmpUsers = {};
              tmpUsers['userID'] = item?.userID;
              tmpUsers['userName'] = item?.userName;
              tmpUsers['leads'] = leads.filter((x) => x.owner == item.userID);
              tmpUsers['deals'] = deals.filter((x) => x.owner == item.userID);
              lstUsers.push(tmpUsers);
            }
            //dash board top sales performance
            this.lstUsers = this.getTopSalesDashBoards(
              lstUsers,
              parameters,
              fromDate,
              toDate
            );
          }
        });
    }
    //end
    //dash board deals
    this.getDashBoardDeals(deals, leads, fromDate, toDate);
    //dash board sales pipline
    this.getDashBoardPips(deals, parameters, fromDate, toDate);
    //dashboard sales trend - last 12 months
    this.getDashBoardSalesTrends(deals, parameters, toDate);
    //dash board sales  target
    this.getDashBoardSales(deals, targetLines, lstQuarters, parameters, toDate);
    //dash board last 4 quarter
    this.getDashBoardLastSales(targetLines, parameters, toDate);

    this.detectorRef.detectChanges();
  }

  //dash board deals
  getDashBoardDeals(deals = [], leads = [], fromDate, toDate) {
    this.tmpDashBoardDeals = [];
    var tmp = {};
    const frmDate = new Date(fromDate);
    const tDate = new Date(toDate);
    let { frmDateOld, tDateOld, type } = this.setDateOlds(frmDate, tDate);
    this.textTitle = type;
    const dealCurrents = deals.filter(
      (x) =>
        new Date(x?.createdOn) >= frmDate && new Date(x?.createdOn) <= tDate
    ); // đổi field createdOn -> ExpectedClosed
    const dealOlds = deals.filter(
      (x) =>
        new Date(x?.createdOn) >= frmDateOld &&
        new Date(x?.createdOn) <= tDateOld
    ); // đổi field createdOn -> ExpectedClosed

    //Doanh số bán hàng
    let countDealValues = Math.round(
      deals
        ?.filter(
          (x) =>
            new Date(x?.expectedClosed) >= frmDate &&
            new Date(x?.expectedClosed) <= tDate
        )
        .reduce((acc, x) => acc + x.dealValue, 0)
    );
    let countDealValueOlds = Math.round(
      deals
        ?.filter(
          (x) =>
            new Date(x?.expectedClosed) >= frmDateOld &&
            new Date(x?.expectedClosed) <= tDateOld
        )
        .reduce((acc, x) => acc + x.dealValue, 0)
    );
    let countDealAscs = Math.abs(countDealValues - countDealValueOlds);

    let isAsc = countDealValues - countDealValueOlds >= 0 ? '1' : '2'; //1 - tăng, 2 - giảm
    tmp['value'] = '1';
    tmp['count'] = this.formatDealValues(countDealValues);
    tmp['countOld'] = this.formatDealValues(countDealValueOlds);
    tmp['countAsc'] = this.formatDealValues(countDealAscs); //số
    tmp['valueAsc'] = this.retrnValueAsc(countDealValues, countDealValueOlds); // %
    tmp['isAsc'] = isAsc;
    this.tmpDashBoardDeals.push(JSON.parse(JSON.stringify(tmp)));
    //end

    //Cơ hội bán hàng
    countDealValues = dealCurrents?.length ?? 0;
    countDealValueOlds = dealOlds?.length ?? 0;
    countDealAscs = Math.abs(countDealValues - countDealValueOlds);

    isAsc = countDealValues - countDealValueOlds >= 0 ? '1' : '2'; //1 - tăng, 2 - giảm
    tmp['value'] = '2';
    tmp['count'] = countDealValues;
    tmp['countOld'] = countDealValueOlds;
    tmp['countAsc'] = countDealAscs; //số
    tmp['valueAsc'] = this.retrnValueAsc(countDealValues, countDealValueOlds); // %
    tmp['isAsc'] = isAsc;
    this.tmpDashBoardDeals.push(JSON.parse(JSON.stringify(tmp)));
    //end

    //Won deals
    countDealValues = Math.round(
      deals?.filter(
        (x) =>
          new Date(x?.expectedClosed) >= frmDate &&
          new Date(x?.expectedClosed) <= tDate &&
          x.status == '3'
      ).length
    );
    countDealValueOlds = Math.round(
      deals?.filter(
        (x) =>
          new Date(x?.expectedClosed) >= frmDateOld &&
          new Date(x?.expectedClosed) <= tDateOld &&
          x.status == '3'
      ).length
    );
    countDealAscs = Math.abs(countDealValues - countDealValueOlds);

    isAsc = countDealValues - countDealValueOlds >= 0 ? '1' : '2'; //1 - tăng, 2 - giảm

    tmp['value'] = '3';
    tmp['count'] = countDealValues;
    tmp['countOld'] = countDealValueOlds;
    tmp['countAsc'] = countDealAscs; //số
    tmp['valueAsc'] = this.retrnValueAsc(countDealValues, countDealValueOlds); // %
    tmp['isAsc'] = isAsc;
    this.tmpDashBoardDeals.push(JSON.parse(JSON.stringify(tmp)));
    //end

    //Lost deals
    countDealValues = Math.round(
      deals?.filter(
        (x) =>
          new Date(x?.expectedClosed) >= frmDate &&
          new Date(x?.expectedClosed) <= tDate &&
          x.status == '5'
      ).length
    );
    countDealValueOlds = Math.round(
      deals?.filter(
        (x) =>
          new Date(x?.expectedClosed) >= frmDateOld &&
          new Date(x?.expectedClosed) <= tDateOld &&
          x.status == '5'
      ).length
    );
    countDealAscs = Math.abs(countDealValues - countDealValueOlds);

    isAsc = countDealValues - countDealValueOlds >= 0 ? '1' : '2'; //1 - tăng, 2 - giảm

    tmp['value'] = '4';
    tmp['count'] = countDealValues;
    tmp['countOld'] = countDealValueOlds;
    tmp['countAsc'] = countDealAscs; //số
    tmp['valueAsc'] = this.retrnValueAsc(countDealValues, countDealValueOlds); // %
    tmp['isAsc'] = isAsc;
    this.tmpDashBoardDeals.push(JSON.parse(JSON.stringify(tmp)));
    //end

    //Tỷ lệ chuyển đổi
    const lstDealsIDs = leads
      ?.map((x) => x.dealID)
      .filter((value, index, self) => self.indexOf(value) === index);

    const countDealsConverts =
      dealCurrents.filter(
        (x) => lstDealsIDs.some((y) => y == x.recID) && x.status == '3'
      )?.length ?? 0;
    const countDealsConvertOlds =
      dealOlds.filter(
        (x) => lstDealsIDs.some((y) => y == x.recID) && x.status == '3'
      )?.length ?? 0;

    const leadCurrentCount = leads.filter(
      (x) =>
        new Date(x?.createdOn) >= frmDate && new Date(x?.createdOn) <= tDate
    ).length;

    const leadOldsCount = leads.filter(
      (x) =>
        new Date(x?.createdOn) >= frmDateOld &&
        new Date(x?.createdOn) <= tDateOld
    ).length;

    countDealValues =
      leadCurrentCount > 0 ? (countDealsConverts / leadCurrentCount) * 100 : 0;
    countDealValueOlds =
      leadOldsCount > 0 ? (countDealsConvertOlds / leadOldsCount) * 100 : 0;

    isAsc = countDealValues - countDealValueOlds >= 0 ? '1' : '2'; //1 - tăng, 2 - giảm
    tmp['value'] = '5';
    tmp['count'] = (countDealValues > 0 ? countDealValues.toFixed(2) : 0) + '%';
    tmp['countOld'] =
      (countDealValueOlds > 0 ? countDealValueOlds.toFixed(2) : 0) + '%';
    tmp['countAsc'] = 0; //số
    tmp['valueAsc'] =
      (Math.abs(countDealValues - countDealValueOlds) > 0
        ? Math.abs(countDealValues - countDealValueOlds).toFixed(2)
        : 0) + '%'; // %
    tmp['isAsc'] = isAsc;
    this.tmpDashBoardDeals.push(JSON.parse(JSON.stringify(tmp)));
    //end
  }

  findTmpDeals(value) {
    return this.tmpDashBoardDeals.find((x) => x.value == value);
  }

  formatDealValues(value: number) {
    if (value >= 1000000) {
      return Math.round(value / 1000000).toLocaleString() + 'M';
    } else if (value >= 1000) {
      return Math.round(value / 1000).toLocaleString() + 'K';
    } else {
      return value.toLocaleString();
    }
  }

  setDateOlds(
    fromDate: Date,
    toDate: Date
  ): { frmDateOld: Date; tDateOld: Date; type: string } {
    let yearFd = fromDate.getFullYear();
    let yearTd = toDate.getFullYear();
    let monthFd = fromDate.getMonth() + 1;
    let monthTd = toDate.getMonth() + 1;
    let dateFd = fromDate.getDate();
    let dateTd = toDate.getDate();
    let frmDateOld = new Date(fromDate);
    let tDateOld = new Date(toDate);
    let type = '';
    if (yearFd == yearTd) {
      if (dateFd == 1 && monthFd == 1 && monthTd == 3 && dateTd == 31) {
        frmDateOld.setFullYear(frmDateOld.getFullYear() - 1);
        frmDateOld.setMonth(9);
        tDateOld.setFullYear(tDateOld.getFullYear() - 1);
        tDateOld.setMonth(11);
        type = this.vllTextYears?.find((x) => x.value == 'TY23')?.text;
      } else if (dateFd == 1 && monthFd == 4 && monthTd == 6 && dateTd == 30) {
        frmDateOld.setMonth(0);
        tDateOld.setMonth(2);
        type = this.vllTextYears?.find((x) => x.value == 'TY23')?.text;
      } else if (dateFd == 1 && monthFd == 7 && monthTd == 9 && dateTd == 30) {
        frmDateOld.setMonth(3);
        tDateOld.setMonth(5);
        type = this.vllTextYears?.find((x) => x.value == 'TY23')?.text;
      } else if (
        dateFd == 1 &&
        monthFd == 10 &&
        monthTd == 12 &&
        dateTd == 31
      ) {
        frmDateOld.setMonth(6);
        tDateOld.setMonth(8);
        type = this.vllTextYears?.find((x) => x.value == 'TY23')?.text;
      } else if (monthFd == monthTd) {
        if (dateFd == dateTd) {
          frmDateOld.setDate(frmDateOld.getDate() - 1);
          tDateOld.setDate(tDateOld.getDate() - 1);
          type = this.vllTextYears?.find((x) => x.value == 'TY20')?.text;
        } else {
          frmDateOld.setMonth(frmDateOld.getMonth() - 1);
          tDateOld.setMonth(tDateOld.getMonth() - 1);
          type = this.vllTextYears?.find((x) => x.value == 'TY22')?.text;
        }
      } else if (monthFd == 1 && monthTd == 12) {
        frmDateOld.setFullYear(frmDateOld.getFullYear() - 1);
        tDateOld.setFullYear(tDateOld.getFullYear() - 1);
        type = this.vllTextYears?.find((x) => x.value == 'TY24')?.text;
      } else {
        let day = Math.floor(
          Math.abs(frmDateOld.getTime() - tDateOld.getTime()) /
            (24 * 60 * 60 * 1000)
        );
        tDateOld = new Date(frmDateOld.setDate(frmDateOld.getDate() - 1));
        frmDateOld.setDate(tDateOld.getDate() - day);
        type =
          frmDateOld.toLocaleDateString('en-GB') +
          ' - ' +
          tDateOld.toLocaleDateString('en-GB');
      }
    } else {
      let day = Math.floor(
        Math.abs(frmDateOld.getTime() - tDateOld.getTime()) /
          (24 * 60 * 60 * 1000)
      );
      tDateOld = new Date(frmDateOld.setDate(frmDateOld.getDate() - 1));
      frmDateOld.setDate(tDateOld.getDate() - day);
      type =
        frmDateOld.toLocaleDateString('en-GB') +
        ' - ' +
        tDateOld.toLocaleDateString('en-GB');
    }
    return { frmDateOld, tDateOld, type };
  }

  getTotalDaysInMonth(month, year) {
    if (month === 1) {
      // Tháng 2
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        return 29; // Năm nhuận, tháng 2 có 29 ngày
      } else {
        return 28; // Năm không nhuận, tháng 2 có 28 ngày
      }
    } else if (month === 3 || month === 5 || month === 8 || month === 10) {
      return 30; // Các tháng có 30 ngày
    } else {
      return 31; // Các tháng có 31 ngày
    }
  }

  //end

  //sales pipe
  getDashBoardPips(deals = [], param, fromDate, toDate) {
    const frmDate = new Date(fromDate);
    const tDate = new Date(toDate);

    deals = deals.filter(
      (x) => new Date(x.createdOn) >= frmDate && new Date(x.createdOn) <= tDate
    );
    this.lstSalesStages = [];
    this.lstSalesStatus = [];
    this.lstSalesStatusCodes = [];
    this.palettePipsStages = [];
    this.palettePipsStatus = [];
    this.palettePipsStatusCodes = [];
    if (this.tmpProcessDefault) {
      const lstSteps = this.tmpProcessDefault?.steps ?? [];
      for (var item of lstSteps) {
        var tmp = {};
        tmp['name'] = item.stepName;
        tmp['value'] = item.recID;
        tmp['color'] = item.textColor;
        tmp['backgroundColor'] = item.backgroundColor;
        const dealsSteps = deals.filter(
          (x) =>
            x.processID == this.tmpProcessDefault?.recID &&
            item.recID == x.stepID
        );
        tmp['quantity'] = dealsSteps?.length ?? 0;
        if (dealsSteps?.length > 0) {
          this.lstSalesStages.push(tmp);
        }
      }
      if (this.lstSalesStages?.length > 0) {
        this.lstNamesStages = JSON.parse(JSON.stringify(this.lstSalesStages));
        this.lstSalesStages.reverse();
        this.palettePipsStages = this.lstSalesStages.map(
          (x) => x.backgroundColor
        );
      }
    }
    if (this.vllStatusDeals != null) {
      for (var item of this.vllStatusDeals) {
        var tmp = {};
        tmp['name'] = item.text;
        tmp['value'] = item.value;
        tmp['color'] = item.color;
        const countDeals =
          deals.filter((x) => item.value == x.status)?.length ?? 0;
        tmp['quantity'] = countDeals;
        if (countDeals > 0) {
          this.lstSalesStatus.push(tmp);
        }
      }
      if (this.lstSalesStatus != null && this.lstSalesStatus.length > 0) {
        this.lstSalesStatus.sort((a, b) => a.quantity - b.quantity);
        this.palettePipsStatus = this.lstSalesStatus.map((x) => x.color);
        let lst = JSON.parse(JSON.stringify(this.lstSalesStatus));
        this.lstNamesStatus = lst.reverse();
      }
    }

    if (this.lstStatusCodes != null) {
      for (var item of this.lstStatusCodes) {
        var tmp = {};
        tmp['name'] = item.StatusName;
        tmp['value'] = item.StatusID;
        tmp['color'] = this.random_bg_color();

        const countDeals =
          deals.filter((x) => item.StatusID == x.statusCodeID)?.length ?? 0;
        tmp['quantity'] = countDeals;
        if (countDeals > 0) {
          this.lstSalesStatusCodes.push(tmp);
        }
      }
      if (
        this.lstSalesStatusCodes != null &&
        this.lstSalesStatusCodes.length > 0
      ) {
        this.lstSalesStatusCodes.sort((a, b) => a.quantity - b.quantity);
        this.palettePipsStatusCodes = this.lstSalesStatusCodes.map(
          (x) => x.color
        );
        let lst = this.lstSalesStatusCodes;
        this.lstNamesStatusCodes = JSON.parse(JSON.stringify(lst.reverse()));
      }
    }
    this.detectorRef.detectChanges();
  }

  statusPip = 'btSaleStages';
  changeGroupType(ele: any, chart: any) {
    if (ele.id == this.statusPip) return;
    this.statusPip = ele.id;
    switch (ele.id) {
      case 'btSaleStages':
        chart.btSaleStages.classList.contains('d-none') &&
          chart.btSaleStages.classList.remove('d-none');
        !chart.btSaleStatus.classList.contains('d-none') &&
          chart.btSaleStatus.classList.add('d-none');
        !chart.btSaleStatusCodes.classList.contains('d-none') &&
          chart.btSaleStatusCodes.classList.add('d-none');
        break;
      case 'btSaleStatus':
        !chart.btSaleStages.classList.contains('d-none') &&
          chart.btSaleStages.classList.add('d-none');
        chart.btSaleStatus.classList.contains('d-none') &&
          chart.btSaleStatus.classList.remove('d-none');
        !chart.btSaleStatusCodes.classList.contains('d-none') &&
          chart.btSaleStatusCodes.classList.add('d-none');
        break;
      case 'btSaleStatusCodes':
        !chart.btSaleStages.classList.contains('d-none') &&
          chart.btSaleStages.classList.add('d-none');
        !chart.btSaleStatus.classList.contains('d-none') &&
          chart.btSaleStatus.classList.add('d-none');
        chart.btSaleStatusCodes.classList.contains('d-none') &&
          chart.btSaleStatusCodes.classList.remove('d-none');
        break;
    }
    this.detectorRef.detectChanges();
  }

  isActive(value) {
    return value === this.statusPip;
  }
  //end

  //Sales trend - last 12 months
  getDashBoardSalesTrends(deals = [], param, toDate) {
    let listMonths = [];
    let now = new Date(toDate);
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    let max = 0;
    for (let y = year; y >= year - 1; y--) {
      for (
        let m = y === year ? month - 1 : 12;
        m >= (y === year - 1 ? month : 1);
        m--
      ) {
        let dealMonths =
          deals?.filter(
            (x) =>
              new Date(x.expectedClosed).getFullYear() == y &&
              new Date(x.expectedClosed).getMonth() + 1 == m &&
              x.status == '3'
          ) ?? []; //ExpectedClosed sẽ lấy field này để so sánh. Vì field này chưa có data nên dùng tạm createdOn để test
        let tmp = {};
        tmp['month'] = m + '/' + y;
        tmp['year'] = y;
        let maxProductivity = dealMonths.reduce(
          (acc, x) => acc + x.dealValue,
          0
        );
        tmp['expected'] = this.formatMaxValue(maxProductivity);
        tmp['dealValue'] = maxProductivity;
        max = maxProductivity > max ? maxProductivity : max;
        listMonths.push(tmp);
      }
    }
    this.settingChart(max);
    this.lstMonthsSeries = listMonths.reverse();
  }

  settingChart(max) {
    let interval = this.formatMaxValue(Math.ceil(max / 10));
    let maximum = interval * 10;

    this.primaryXAxisY = {
      title: null,
      interval: Browser.isDevice ? 2 : 1,
      labelIntersectAction: 'Rotate45',
      valueType: 'Category',
      majorGridLines: { width: 0 },
      minorGridLines: { width: 0 },
      majorTickLines: { width: 0 },
      minorTickLines: { width: 0 },
      lineStyle: { width: 0 },
    };
    let labelFormat = this.labelFormat(max);
    this.primaryYAxisY = {
      title: this.currencyID,
      minimum: 0,
      maximum: maximum,
      interval: interval,
      lineStyle: { width: 0 },
      majorTickLines: { width: 0 },
      majorGridLines: { width: 1 },
      minorGridLines: { width: 1 },
      minorTickLines: { width: 0 },
      labelFormat: labelFormat,
    };

    this.toolTipSeri = {
      enable: true,
      shared: true,
      format: '${point.tooltip}',
    };
  }

  textSeriRender(args: ITextRenderEventArgs) {
    const text = args.series['resultData']?.find((x) => x.y == args.point.y);
    let value = text?.text ?? 0;
    let retrn = '0';
    if (value === null || isNaN(value)) {
      retrn = '0';
    }
  }

  poinSeriRender(args: IPointRenderEventArgs): void {
    let index = this.lstMonthsSeries.findIndex((x) => x.month == args.point.x);

    if (index != -1) {
      args.point.tooltip =
        this.lstMonthsSeries[index]?.dealValue.toLocaleString();
    }
  }

  tooltipSeriRender(e: ITooltipRenderEventArgs) {
    console.log(e);
  }
  //end

  // get sales target
  getDashBoardSales(deals, targetLines, lstQuarters, param = null, toDate) {
    if (lstQuarters != null) {
      let now = new Date(toDate);
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

  //get sales last 4 quarter
  getDashBoardLastSales(lstTargetLines = [], param, toDate) {
    let lstPiaData = [];
    const currencyID = this.currencyID;
    const exchRate = this.exchangeRate;
    let now = new Date(toDate);
    let quarter = this.compareQuarter(toDate.getMonth() + 1);
    let sumTarget = 0;
    let year = now.getFullYear();
    for (let i = 0; i < 4; i++) {
      if (quarter === 1) {
        quarter = 4;
        year--;
      } else {
        quarter--;
      }
      const { min, max } = this.getQuarterMonthRange(quarter);
      var tmp = {};
      tmp['quarter'] = quarter;
      tmp['year'] = year;
      const first = this.vllQuaters?.find(
        (x) => x.value === quarter.toString()
      );
      if (first) {
        tmp['x'] = `${first.text}/${year}`;
      }
      const targetLineQuarters = lstTargetLines.filter(
        (x) =>
          new Date(x.startDate)?.getFullYear() === year &&
          new Date(x.startDate)?.getMonth() + 1 >= min &&
          new Date(x.startDate)?.getMonth() + 1 <= max
      );
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

      tmp['y'] = 0;

      lstPiaData.push(tmp);
    }
    lstPiaData.forEach((item) => {
      item['y'] =
        Math.round(sumTarget) > 0
          ? Math.round((item?.['text'] / sumTarget) * 100 * 100) / 100
          : 100 / 4;
    });

    this.piedata = lstPiaData.sort((a, b) => {
      return b.year > a.year ? b.year - a.year : b.quarter - a.quarter;
    });
  }

  compareQuarter(toDate: number) {
    let q = 1;
    if (toDate >= 1 && toDate <= 3) {
      q = 1;
    } else if (toDate >= 4 && toDate <= 6) {
      q = 2;
    } else if (toDate >= 7 && toDate <= 9) {
      q = 3;
    } else {
      q = 4;
    }
    return q;
  }
  //end

  //get top sales
  getTopSalesDashBoards(lstUsers = [], param, fromDate, toDate) {
    let list = [];
    let frDate = new Date(fromDate);
    let tDate = new Date(toDate);
    let { frmDateOld, tDateOld, type } = this.setDateOlds(frDate, tDate);
    if (lstUsers?.length > 0) {
      lstUsers.sort((a, b) => {
        const dealValueA = a?.deals
          .filter(
            (x) =>
              new Date(x.expectedClosed) >= frDate &&
              new Date(x.expectedClosed) <= tDate
          )
          .reduce(
            (sum, deal) => (deal.status === '3' ? sum + deal?.dealValue : sum),
            0
          );
        const dealValueB = b?.deals
          .filter(
            (x) =>
              new Date(x.expectedClosed) >= frDate &&
              new Date(x.expectedClosed) <= tDate
          )
          .reduce(
            (sum, deal) => (deal.status === '3' ? sum + deal?.dealValue : sum),
            0
          );
        if (dealValueA === 0 && dealValueB === 0) {
          const numDealsA = a?.deals
            .filter(
              (x) =>
                new Date(x.expectedClosed) >= frDate &&
                new Date(x.expectedClosed) <= tDate
            )
            .filter((deal) => deal.status === '3').length;
          const numDealsB = b?.deals
            .filter(
              (x) =>
                new Date(x.expectedClosed) >= frDate &&
                new Date(x.expectedClosed) <= tDate
            )
            .filter((deal) => deal.status === '3').length;
          return numDealsB - numDealsA;
        }
        return dealValueB - dealValueA;
      });

      // Giới hạn danh sách tối đa 5 đối tượng
      // let employeeProductivity = 10;
      // if (this.employeeProductivity) {
      //   employeeProductivity = this.employeeProductivity;
      // }
      if (lstUsers?.length > this.employeeProductivity)
        lstUsers = lstUsers.slice(0, this.employeeProductivity); // lấy tối đa bao nhiêu đối tượng chưa lafm - get param ra để lấy

      lstUsers.forEach((item) => {
        var tmp = {};
        tmp = item;
        let performances = [];
        if (this.lstVllTopSales != null && this.lstVllTopSales.length > 0) {
          for (var vll of this.lstVllTopSales) {
            var tmpPerform = {};
            tmpPerform['value'] = vll.value;
            tmpPerform['text'] = vll.text;

            let count = 0;
            let countOlds = 0;
            switch (vll?.value) {
              case '1': // lead đã tạo
                count =
                  item?.leads.filter(
                    (x) =>
                      new Date(x.createdOn) >= frDate &&
                      new Date(x.createdOn) <= tDate
                  ).length ?? 0;
                countOlds =
                  item?.leads.filter(
                    (x) =>
                      new Date(x.createdOn) >= frmDateOld &&
                      new Date(x.createdOn) <= tDateOld
                  ).length ?? 0;
                tmpPerform['count'] = count.toLocaleString();
                break;
              case '3': // cơ hội đã tạo
                count =
                  item?.deals.filter(
                    (x) =>
                      new Date(x.createdOn) >= frDate &&
                      new Date(x.createdOn) <= tDate
                  )?.length ?? 0;
                countOlds =
                  item?.deals.filter(
                    (x) =>
                      new Date(x.createdOn) >= frmDateOld &&
                      new Date(x.createdOn) <= tDateOld
                  )?.length ?? 0;
                tmpPerform['count'] = count.toLocaleString();
                break;
              case '5': // doanh thu đạt được
                item?.deals
                  .filter(
                    (x) =>
                      new Date(x.expectedClosed) >= frDate &&
                      new Date(x.expectedClosed) <= tDate
                  )
                  ?.forEach((ele) => {
                    if (ele.status == '3') {
                      count += ele?.dealValue;
                    }
                  }); //Để test dữ liệu xong thay field createdOn thành ExpectedClosed
                countOlds = item?.deals
                  ?.filter(
                    (x) =>
                      x.status == '3' &&
                      new Date(x.expectedClosed) >= frmDateOld &&
                      new Date(x.expectedClosed) <= tDateOld
                  )
                  .reduce((acc, x) => acc + x.dealValue, 0);
                tmpPerform['count'] = count.toLocaleString();
                break;
              case '7': //doanh thu đã mất
                item?.deals
                  .filter(
                    (x) =>
                      new Date(x.expectedClosed) >= frDate &&
                      new Date(x.expectedClosed) <= tDate
                  )
                  ?.forEach((ele) => {
                    if (ele.status == '5') {
                      count += ele?.dealValue;
                    }
                  }); //Để test dữ liệu xong thay field createdOn thành ExpectedClosed
                tmpPerform['count'] = count.toLocaleString();
                break;
              case '9': //trung bình chu kỳ bán hàng
                count = this.getCountDate(
                  item?.leads.filter(
                    (x) =>
                      new Date(x.createdOn) >= frDate &&
                      new Date(x.createdOn) <= tDate
                  ),
                  item?.deals.filter(
                    (x) =>
                      new Date(x.createdOn) >= frDate &&
                      new Date(x.createdOn) <= tDate &&
                      x.status == '3'
                  )
                );
                tmpPerform['count'] =
                  (Math.round(count) > 0
                    ? count.toFixed(1).toLocaleString()
                    : count.toFixed(0).toLocaleString()) +
                  (this.language == 'vn' ? ' ngày' : ' day');
                break;
            }

            tmpPerform['valueAsc'] = this.retrnValueAsc(
              count,
              countOlds
            ).toLocaleString();
            tmpPerform['isAsc'] = count - countOlds >= 0 ? '1' : '2'; // 0 - hòa, 1 - tăng, 2 - giảm
            performances.push(tmpPerform);
          }
        }
        tmp['performances'] = performances;
        list.push(tmp);
      });
    }
    return list;
  }

  compareDate(frmDate: Date, tDate: Date) {
    let frmDateOlds = frmDate;
    let toDateOlds = tDate;
    if (frmDate.getMonth() + 1 == 1 && tDate.getMonth() + 1 == 12) {
      frmDateOlds.setFullYear(frmDate.getFullYear() - 1);
      toDateOlds.setFullYear(tDate.getFullYear() - 1);
    }
    return [frmDateOlds, toDateOlds];
  }

  retrnValueAsc(count, countOlds) {
    let valueAsc = '0';
    if (count > countOlds) {
      if (countOlds > 0) {
        valueAsc =
          this.formatNumberWithoutTrailingZeros(
            (Math.abs(count - countOlds) / countOlds) * 100
          ) + '%';
      } else {
        valueAsc = '- %';
      }
    } else {
      if (count > 0) {
        valueAsc =
          this.formatNumberWithoutTrailingZeros(
            (Math.abs(count - countOlds) / count) * 100
          ) + '%';
      } else {
        valueAsc = '- %';
      }
    }

    return valueAsc;
  }

  formatNumberWithoutTrailingZeros(num) {
    if (num % 1 === 0) {
      return num.toString();
    } else {
      return num.toFixed(2);
    }
  }

  getCountDate(leads, deals) {
    let count = 0;
    if (deals != null && deals.length > 0) {
      for (var item of deals) {
        if (item?.actualEnd != null) {
          let actualEnd = new Date(item?.actualEnd);
          let createdOn = new Date(item.createdOn);
          let leadInDeals = leads?.filter((x) => x.dealID == item.recID);
          if (leadInDeals != null && leadInDeals.length > 0) {
            let sumDate = leadInDeals.reduce(
              (acc, x) =>
                acc +
                (actualEnd.getTime() - new Date(x.createdOn).getTime()) /
                  (24 * 60 * 60 * 1000),
              0
            );

            count += sumDate;
          } else {
            count +=
              (actualEnd.getTime() - createdOn.getTime()) /
              (24 * 60 * 60 * 1000);
          }
        }
      }
      return count / deals.length;
    }

    return count;
  }

  findItemUser(value, performances) {
    let title = performances.find((x) => x.value == value);
    return title;
  }

  getIcon(value, type) {
    let ind = value == '2' ? value : '1';
    let data = this.vllUpDowns.find((x) => x.value == ind);
    return data[type];
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
      var tmp = {};
      tmp['value'] = Math.round(
        this.formatMaxValue(parseFloat(data.dealValueWon))
      );
      tmp['target'] = Math.round(this.formatMaxValue(parseFloat(data?.target)));

      this[`dataBulletQ${i}s`].push(tmp);
      this[`dealValueWonQ${i}`] = Math.round(
        this.formatMaxValue(parseFloat(data?.dealValueWon))
      );
      let maxinum =
        parseFloat(data?.target) > parseFloat(data?.dealValueWon)
          ? parseFloat(data?.target) + (parseFloat(data?.target) * 30) / 100
          : parseFloat(data?.dealValueWon) +
            (parseFloat(data?.dealValueWon) * 30) / 100;
      this[`maximumBulletQ${i}`] =
        maxinum > 0 ? Math.round(this.formatMaxValue(maxinum)) : 1000;

      this[`intervalQ${i}`] =
        maxinum > 0
          ? Math.round(this.calculateInterval(this[`maximumBulletQ${i}`]))
          : 100;
      this[`targetQ${i}`] =
        maxinum > 0
          ? Math.round(this.formatMaxValue(maxinum)).toString()
          : '1000';
      this[`labelFormatQ${i}`] =
        maxinum > 0 ? this.labelFormat(maxinum) : '${value}';
    }
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

  labelFormat(value: number) {
    if (value >= 1000000) {
      return '{value}M';
    } else if (value >= 1000) {
      return '{value}K';
    } else {
      return '{0}';
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

  //load bullet
  load = (args: IBulletLoadedEventArgs) => {
    let selectedTheme: string = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    args.bulletChart.theme = <ChartTheme>(
      selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)
    )
      .replace(/-dark/i, 'Dark')
      .replace(/light/i, 'Light')
      .replace(/contrast/i, 'Contrast');
  };

  //render
  onTextRender(args: IAccTextRenderEventArgs) {
    const text = args.series['resultData']?.find((x) => x.y == args.point.y);
    let value = text?.text ?? 0;
    let retrn = '0';
    if (value === null || isNaN(value)) {
      retrn = '0';
    }

    if (value >= 1000000) {
      retrn = value / 1000000 + 'M';
    } else if (value >= 1000) {
      retrn = value / 1000 + 'K';
    }
    args.text = retrn;
  }

  tooltipRender(e, i) {
    console.log(e);
    let target = 0;
    let dealValue = 0;
    let index = this.lstQuarters.findIndex((x) => x.quarter == i);
    let titleTarger = this.language == 'vn' ? 'Mục tiêu' : 'Target';
    let titleDealValue =
      this.language == 'vn' ? 'Doanh thu thực tế' : 'DealValue';
    if (index != -1) {
      target =
        this.lstQuarters[index]?.target > 0
          ? this.lstQuarters[index].target.toLocaleString()
          : 0;
      dealValue = this.lstQuarters[index]?.dealValueWon
        ? this.lstQuarters[index].dealValueWon.toLocaleString()
        : 0;
    }
    let template = `${titleTarger} : <b>${target}</b> ${this.currencyID}<br/>${titleDealValue} : <b>${dealValue}</b> ${this.currencyID}`;
    e.template = template;
    e.text = template;
  }
  //end

  //------------------IN-OUT-DASHBOARD---------------//
  viewDashBoardsInOut(dataSet) {
    let dataSetOut = dataSet.filter((x) => x.status == '17');
    let dataSetIn = dataSet.filter((x) => x.approveStatus == '5');
    let dataSetInCrr = dataSetIn?.filter((x) => x.yearApproved == this.year);
    let dataSetOutCrr = dataSetOut?.filter((x) => x.yearDisposal == this.year);
    //out
    this.getListEnterpriseInOutNew(dataSetOutCrr, false);
    //in
    this.getListEnterpriseInOutNew(dataSetInCrr, true);

    //tang
    this.getAreaInOut(dataSetInCrr, true);
    //  giam
    this.getAreaInOut(dataSetOutCrr, false);
    //out-in old now
    this.getCompartInOut(dataSetOut, false);
    //in
    this.getCompartInOut(dataSetIn, true);
    //nguồn
    this.getInByChanel(dataSetInCrr);
    //Thanh lý
    this.getOutByDisReason(dataSetOutCrr);
    //PHÂN LOẠI KHÁCH HÀNG
    this.getChartClassify(dataSetInCrr);
  }
  //DNNT TN

  getListEnterpriseInOutNew(dataSet, isIn) {
    if (isIn) {
      this.listCountEnterprise = [];
    } else this.listCountEnterpriseOut = [];

    if (!dataSet || dataSet?.length == 0) {
      this.vllQuaters?.forEach((qt) => {
        let obj = {
          quarter: qt.value,
          quarterName: qt?.text,
          countAll: 0,
        };
        this.dataBusinessType.forEach(
          (type) => (obj['countEnterprises' + type.value] = 0)
        );
        if (isIn) {
          this.listCountEnterprise.push(obj);
        } else {
          this.listCountEnterpriseOut.push(obj);
        }
      });
      let objTotalNull = {
        quarter: 100,
        quarterName: 'Tổng cộng',
        countAll: 0,
      };
      this.dataBusinessType.forEach(
        (type) => (objTotalNull['countEnterprises' + type.value] = 0)
      );
      if (isIn) {
        this.listCountEnterprise.push(objTotalNull);
      } else {
        this.listCountEnterpriseOut.push(objTotalNull);
      }

      return;
    }

    let fieldGroup = isIn ? 'quarterApproved' : 'quarterDisposal';
    let countAll = dataSet?.length;

    // let renderMax = Math.floor(countAll / 10);

    // if (renderMax > 10) {
    //   let mod = renderMax % 10;
    //   renderMax = Math.floor(renderMax / 10) * 10 + (mod > 5 ? 10 : 5);
    //   if (isIn) this.primaryYAxisColumnEpIn.interval = renderMax;
    //   else this.primaryYAxisColumnEpOut.interval = renderMax;
    // }

    let listEnterpriseNew = this.groupBy(dataSet, fieldGroup);

    if (listEnterpriseNew) {
      this.vllQuaters?.forEach((qt) => {
        let key = qt.value;
        let obj = {
          quarter: key,
          quarterName: qt?.text,
          countAll: listEnterpriseNew[key]?.length ?? 0,
        };
        this.dataBusinessType.forEach(
          (type) =>
            (obj['countEnterprises' + type.value] =
              dataSet?.filter(
                (x) => x.businessType == type.value && x[fieldGroup] == key
              )?.length ?? 0)
        );
        if (isIn) {
          this.listCountEnterprise.push(obj);
        } else {
          this.listCountEnterpriseOut.push(obj);
        }
      });

      let objTotal = {
        quarter: 100,
        quarterName: 'Tổng cộng',
        countAll: countAll,
      };
      this.dataBusinessType.forEach(
        (type) =>
          (objTotal['countEnterprises' + type.value] =
            dataSet?.filter((x) => x.businessType == type.value)?.length ?? 0)
      );

      if (isIn) {
        this.listCountEnterprise.push(objTotal);
      } else {
        this.listCountEnterpriseOut.push(objTotal);
      }
    }
  }
  //CRM079
  getCompartInOut(dataSet, isIn = true) {
    if (isIn) {
      this.listQTSCIn = [];
    } else this.listQTSCOut = [];
    let yearOld = this.year - 1;
    if (!dataSet || dataSet?.length == 0) {
      let objTotal = {
        quarter: 100,
        quarterName: 'Tổng DN vào QTSC',
        countOld: 0,
        countNow: 0,
      };
      let arrChart = [
        {
          year: yearOld.toString(),
          count: 0,
        },
        {
          year: this.year.toString(),
          count: 0,
        },
      ];
      if (isIn) {
        this.listQTSCIn.push(objTotal);
        this.pieChartInQTSC = arrChart;
      } else {
        this.listQTSCOut.push(objTotal);
        this.pieChartOutQTSC = arrChart;
      }

      this.vllQuaters?.forEach((qt) => {
        let obj = {
          quarter: qt.value,
          quarterName: qt?.text,
          countOld: 0,
          countNow: 0,
        };
        if (isIn) {
          this.listQTSCIn.push(obj);
        } else {
          this.listQTSCOut.push(obj);
        }
      });
      return;
    }

    let fieldGroup = isIn ? 'quarterApproved' : 'quarterDisposal';
    let listEnterpriseNew = this.groupBy(dataSet, fieldGroup);

    let objTotal = {
      quarter: 100,
      quarterName: 'Tổng DN vào QTSC',
      countOld:
        dataSet?.filter((x) =>
          isIn ? x.yearApproved == yearOld : x.yearDisposal == yearOld
        )?.length ?? 0,
      countNow:
        dataSet?.filter((x) =>
          isIn ? x.yearApproved == this.year : x.yearDisposal == this.year
        )?.length ?? 0,
    };
    let arrChart = [
      {
        year: yearOld.toString(),
        count: objTotal.countOld ?? 0,
      },
      {
        year: this.year.toString(),
        count: objTotal.countNow ?? 0,
      },
    ];
    if (isIn) {
      this.listQTSCIn.push(objTotal);
      this.pieChartInQTSC = arrChart;
    } else {
      this.listQTSCOut.push(objTotal);
      this.pieChartOutQTSC = arrChart;
    }

    if (listEnterpriseNew) {
      this.vllQuaters?.forEach((qt) => {
        let key = qt.value;
        let obj = {
          quarter: key,
          quarterName: qt?.text,
          countOld:
            dataSet?.filter(
              (x) =>
                x[fieldGroup] == key &&
                (isIn ? x.yearApproved == yearOld : x.yearDisposal == yearOld)
            )?.length ?? 0,
          countNow:
            dataSet?.filter(
              (x) =>
                x[fieldGroup] == key &&
                (isIn
                  ? x.yearApproved == this.year
                  : x.yearDisposal == this.year)
            )?.length ?? 0,
        };

        if (isIn) {
          this.listQTSCIn.push(obj);
        } else {
          this.listQTSCOut.push(obj);
        }
      });
    }
  }

  //diên tích vào ra
  getAreaInOut(dataSet, isIn = true) {
    if (isIn) {
      this.listAreaIn = [];
    } else this.listAreaOut = [];

    if (!dataSet || dataSet?.length == 0) {
      this.vllQuaters?.forEach((qt) => {
        let obj = {
          quarter: qt.value,
          quarterName: qt?.text,
          totalArea: 0,
          totalQuotationArea: 0,
          //  totalRentalArea: 0,
          totalUpAndDownArea: 0,
        };
        if (isIn) {
          this.listAreaIn.push(obj);
        } else {
          this.listAreaOut.push(obj);
        }
      });
      let objTotal = {
        quarter: 100,
        quarterName: 'Tổng cộng',
        totalArea: 0,
        totalQuotationArea: 0,
        //  totalRentalArea: 0,
        totalUpAndDownArea: 0,
      };
      if (isIn) {
        this.listAreaIn.push(objTotal);
      } else {
        this.listAreaOut.push(objTotal);
      }
      return;
    }

    let fieldGroup = isIn ? 'quarterApproved' : 'quarterDisposal';
    let fieldFiter = isIn ? 'expandedArea' : 'decreasedArea';
    let listDataGroup = this.groupBy(dataSet, fieldGroup);

    //let totalRentalArea = this.total(dataSet, 'rentalArea');
    let totalQuotationArea = this.total(dataSet, 'quotationArea');
    let totalUpAndDownArea = this.total(dataSet, fieldFiter);
    // let totalArea = totalRentalArea + totalUpAndDownArea;
    let totalArea = totalQuotationArea + totalUpAndDownArea;

    // let renderMax = Math.floor(totalArea / 10);

    // if (renderMax > 10) {
    //   let mod = renderMax % 10;
    //   renderMax = Math.floor(renderMax / 10) * 10 + (mod > 5 ? 10 : 5);
    //    if (isIn) this.primaryYAxisColumnAreaIn.interval = renderMax;
    //    else this.primaryYAxisColumnAreaOut.interval = renderMax;
    // }
    if (listDataGroup) {
      this.vllQuaters?.forEach((qt) => {
        let key = qt.value;
        let obj = {
          quarter: key,
          quarterName: qt?.text,
          totalArea: 0,
          totalQuotationArea: this.total(
            listDataGroup[key]?.filter((x) => x[fieldGroup] == key),
            'quotationArea'
          ),
          // totalRentalArea: this.total(
          //   listDataGroup[key]?.filter((x) => x[fieldGroup] == key),
          //   'rentalArea'
          // ),
          totalUpAndDownArea: this.total(
            listDataGroup[key]?.filter((x) => x[fieldGroup] == key),
            fieldFiter
          ),
        };
        obj.totalArea = obj.totalQuotationArea + obj.totalUpAndDownArea;
        //obj.totalArea = obj.totalRentalArea + obj.totalUpAndDownArea;

        if (isIn) {
          this.listAreaIn.push(obj);
        } else {
          this.listAreaOut.push(obj);
        }
      });

      let objTotal = {
        quarter: 100,
        quarterName: 'Tổng cộng',
        totalArea: totalArea,
        totalQuotationArea: totalQuotationArea,
        //totalRentalArea: totalRentalArea,
        totalUpAndDownArea: totalUpAndDownArea,
      };

      if (isIn) {
        this.listAreaIn.push(objTotal);
      } else {
        this.listAreaOut.push(objTotal);
      }
    }
  }

  total(dataSet, fieldName) {
    let total = 0;
    if (dataSet?.length > 0) {
      dataSet.forEach((x) => {
        total += Number.parseFloat(x[fieldName]) ?? 0;
      });
    }
    return total;
  }

  //nguon
  getInByChanel(dataSet) {
    this.pieChartInChanel = [];
    if (!dataSet || dataSet?.length == 0) {
      return;
    }
    let listData = this.groupBy(dataSet, 'channelID');
    if (listData) {
      for (let key in listData) {
        let item = {
          channelID: key,
          channelName: listData[key][0].channelName ?? 'Other',
          count: listData[key].length ?? 0,
          countQ1:
            listData[key]?.filter((x) => x.quarterApproved == '1')?.length ?? 0,
          countQ2:
            listData[key]?.filter((x) => x.quarterApproved == '2')?.length ?? 0,
          countQ3:
            listData[key]?.filter((x) => x.quarterApproved == '3')?.length ?? 0,
          countQ4:
            listData[key]?.filter((x) => x.quarterApproved == '4')?.length ?? 0,
        };
        this.pieChartInChanel.push(item);
      }
    }
  }

  //Thanh lý
  getOutByDisReason(dataSet) {
    this.pieChartOutDisposalReason = [];
    if (!dataSet || dataSet?.length == 0) {
      return;
    }
    let listData = this.groupBy(dataSet, 'disposalReason');
    if (listData) {
      for (let key in listData) {
        let item = {
          disposalCmt: key,
          disposalReasonName: listData[key][0].disposalReasonName ?? 'Other',
          count: listData[key].length ?? 0,
          countQ1:
            listData[key]?.filter((x) => x.quarterDisposal == '1')?.length ?? 0,
          countQ2:
            listData[key]?.filter((x) => x.quarterDisposal == '2')?.length ?? 0,
          countQ3:
            listData[key]?.filter((x) => x.quarterDisposal == '3')?.length ?? 0,
          countQ4:
            listData[key]?.filter((x) => x.quarterDisposal == '4')?.length ?? 0,
        };
        this.pieChartOutDisposalReason.push(item);
      }
    }
  }

  //PHÂN LOẠI KHÁCH HÀNG -pieChartClassify
  getChartClassify(dataSet) {
    // this.pieChartClassify = [];
    // if (!dataSet || dataSet?.length == 0) {
    //   this.pieChartClassify = [
    //     {
    //       classification: 'Khách hàng mới',
    //       count: 0,
    //     },
    //     {
    //       classification: 'Khách hàng nội khu',
    //       count: 0,
    //     },
    //   ];
    //   return;
    // }
    this.pieChartClassify = [
      {
        classification: 'Khách hàng mới',
        count:
          !dataSet || dataSet?.length == 0
            ? 0
            : dataSet.filter((x) => x.isCustomerNew)?.length ?? 0,
      },
      {
        classification: 'Khách hàng nội khu',
        count:
          !dataSet || dataSet?.length == 0
            ? 0
            : dataSet.filter((x) => !x.isCustomerNew)?.length ?? 0,
      },
    ];
  }
  //------------------------------------------------//

  //------------------OfficeSpaceForRent -CMRQTSC010--------------------//
  viewDashBoardsOfficeSpaceForRent(dataSet) {
    this.dataSpaceForRent = dataSet;
    // let max = 0;
    // if (this.dataSpaceForRent?.length > 0) {
    //   this.dataSpaceForRent.forEach((x) => {
    //     if (max < x.usableArea) max = x.usableArea;
    //   });

    //   let renderMax = Math.floor(max / 10);

    //   if (renderMax > 50) {
    //     let mod = renderMax % 10;
    //     renderMax = Math.floor(renderMax / 10) * 10 + (mod > 5 ? 10 : 5);
    //     this.primaryYAxisColumnSFR.interval = renderMax;
    //   }
    // }
  }
  onScroll(event) {
    debugger;
  }

  // @HostListener('scroll', ['$event'])
  // onScrollCMM(event: Event): void {
  //   debugger;
  //   // if (!this.isAllDatas) {
  //   //   const element = event.target as HTMLElement;
  //   //   if (element.scrollHeight - element.scrollTop === element.clientHeight) {
  //   //     this.gridModelTree.page += 1;
  //   //     this.loadData();
  //   //   }
  //   // }
  // }
  //-----------------------------------------------------------------//

  //------------------OfficeTypeReport -CMRQTSC011--------------------//
  viewDashBoardsOfficeTypeReport(dataSet) {
    this.dataOfficeType = [];
    if (!dataSet || dataSet?.length == 0) {
      return;
    }
    let listData = this.groupBy(dataSet, 'parentID');
    if (listData) {
      for (let key in listData) {
        this.dataOfficeType.push(listData[key]);
      }
    }
  }
  //-----------------------------------------------------------------//
}
