import {
  AfterViewInit,
  Component,
  Injector,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Layout } from '@syncfusion/ej2-angular-diagrams';
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
import { Browser } from '@syncfusion/ej2-base';
import {
  AccumulationChart,
  AccumulationChartComponent,
  IPointRenderEventArgs,
} from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'lib-cm-dashboard',
  templateUrl: './cm-dashboard.component.html',
  styleUrls: ['./cm-dashboard.component.scss'],
})
export class CmDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChildren('templateDeals') dashBoardDeals: QueryList<any>;
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChild('noData') noData: TemplateRef<any>;
  @ViewChild('filterTemplate') filterTemplate: TemplateRef<any>;
  funcID = 'DPT01';
  views: Array<ViewModel> = [];
  button = {
    id: 'btnAdd',
  };
  isEditMode = false;
  panelsDeals: any;
  datasDeals: any;
  arrVllStatus: any = [];
  vllStatus = '';
  dataDashBoard: any;
  isLoaded: boolean = false;
  titLeModule = '';

  // setting  //chart tree
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
  checkBtnMin = false;
  checkBtnMax = true;
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
  checkBtnSuscess = true;
  checkBtnFail = false;

  //nang suat nhan viên
  productivityOwner = [];
  language = 'vn';
  currencyIDDefault: any = 'VND';

  //pyramidcontainer
  legendSettingsPy = {
    visible: false,
    toggleVisibility: false,
  };
  dataSourcePy = [
    // {
    //   name: 'Milk, Youghnut, Cheese',
    //   quantity: 435,
    // },
    // {
    //   name: 'Vegetables',
    //   quantity: 470,
    // },
    // {
    //   name: 'Meat, Poultry, Fish',
    //   quantity: 475,
    // },
    // {
    //   name: 'Rice, Pasta',
    //   quantity: 930,
    // },
    // {
    //   name: 'Fruits',
    //   quantity: 520,
    // },
  ];
  neckWidth = '0%';
  neckHeight = '0%';
  gapRatio: number = 0.03;

  emptyPointSettings = {
    // fill: 'red',
    // mode: 'Drop',
  };
  explode: boolean = false;

  tooltipPy: Object = {
    header: '',
    enable: true,
    format: '${point.x} : <b>${point.y}</b>',
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

  constructor(
    inject: Injector,
    private layout: LayoutComponent,
    private auth: AuthService,
    private pageTitle: PageTitleService,
    private authstore: AuthStore
  ) {
    super(inject);
    this.user = this.authstore.get();
    this.language = this.auth.userValue?.language?.toLowerCase();
    this.funcID = this.router.snapshot.params['funcID'];
    this.loadChangeDefault();
  }
  onInit(): void {
    this.panelsDeals = JSON.parse(
      '[{"id":"11.1636284528927885_layout","row":0,"col":0,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"21.5801149283702021_layout","row":0,"col":12,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"31.6937258303982936_layout","row":0,"col":24,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"41.5667390469747078_layout","row":0,"col":36,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"51.4199281088325755_layout","row":3,"col":0,"sizeX":16,"sizeY":10,"minSizeX":16,"minSizeY":10,"maxSizeX":null,"maxSizeY":null},{"id":"61.4592017601751599_layout","row":3,"col":16,"sizeX":32,"sizeY":10,"minSizeX":32,"minSizeY":10,"maxSizeX":null,"maxSizeY":null},{"id":"71.14683256767762543_layout","row":13,"col":0,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"81.36639064171709834_layout","row":13,"col":16,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"91.06496875406606994_layout","row":13,"col":32,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"101.21519762020962552_layout","row":21,"col":0,"sizeX":32,"sizeY":10,"minSizeX":32,"minSizeY":10,"maxSizeX":null,"maxSizeY":null},{"id":"111.21519762020964252_layout","row":21,"col":32,"sizeX":16,"sizeY":10,"minSizeX":16,"minSizeY":10,"maxSizeX":null,"maxSizeY":null}]'
    );
    this.datasDeals = JSON.parse(
      '[{"panelId":"11.1636284528927885_layout","data":"1"},{"panelId":"21.5801149283702021_layout","data":"2"},{"panelId":"31.6937258303982936_layout","data":"3"},{"panelId":"41.5667390469747078_layout","data":"4"},{"panelId":"51.4199281088325755_layout","data":"5"},{"panelId":"61.4592017601751599_layout","data":"6"},{"panelId":"71.14683256767762543_layout","data":"7"},{"panelId":"81.36639064171709834_layout","data":"8"},{"panelId":"91.06496875406606994_layout","data":"9"},{"panelId":"101.21519762020962552_layout","data":"10"},{"panelId":"111.21519762020964252_layout","data":"11"}]'
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
    this.router.queryParams.subscribe((res) => {
      if (res.reportID) {
        this.reportID = res.reportID;
        this.isLoaded = false;
        switch (this.reportID) {
          // nhom chua co tam
          case '1':
            this.getDataDashboard();
            break;
          //ca nha chua co ne de vay
          case '3':
            let predicates = 'Owner =@0';
            let dataValues = this.user.userID;
            this.getDataDashboard(predicates, dataValues);
            break;
          // target
          case '5':
            this.isLoaded = true;
            break;
        }
      }
    });
  }

  filterChange(e: any) {
    this.isLoaded = false;
    let { predicates, dataValues } = e[0];
    debugger;
    const param = e[1];

    switch (this.reportID) {
      // nhom chua co tam
      case '1':
        this.getDataDashboard(predicates, dataValues, param);
        break;
      //ca nha chua co ne de vay
      case '3':
        let lenght = dataValues.split(';')?.length ?? 0;

        let predicate =
          lenght == 0 ? 'Owner =@' + lenght : ' and ' + 'Owner =@' + lenght;
        let dataValue = lenght == 0 ? this.user.userID : ';' + this.user.userID;

        predicates += predicate;
        dataValues += dataValue;
        this.getDataDashboard(predicates, dataValues, param);
        break;
      // target
      case '5':
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
          this.dataSourcePy = this.dataDashBoard?.countsConversionRate ?? [];
        } else {
          this.dataStatisticTarget = [];
          this.maxOwners = [];
          this.minOwners = [];
          this.productivityOwner = [];
          this.dataSourcePy = [];
        }
        setTimeout(() => {
          this.isLoaded = true;
        }, 500);
      });

    this.detectorRef.detectChanges();
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
        this.checkBtnMin = true;
        this.checkBtnMax = false;
        break;
      case 'btnMax':
        this.checkBtnMin = false;
        this.checkBtnMax = true;
        break;
      case 'btSuccess':
        this.checkBtnSuscess = true;
        this.checkBtnMax = false;
        break;
      case 'btFail':
        this.checkBtnSuscess = false;
        this.checkBtnFail = true;
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
    // });
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
          this.currencyIDDefault = paramDefault['DefaultCurrency'] ?? 'VND';
          if (this.language == 'vn') {
            this.primaryXAxisRatio.title =
              'Tổng doanh số dự kiến ( ' + this.currencyIDDefault + ')';
            this.primaryYAxisRatio.title =
              'Tổng mục tiêu ( ' + this.currencyIDDefault + ')';

            this.tooltip.format =
              'Tổng doanh số dự kiến : <b>${point.x} ' +
              this.currencyIDDefault +
              '</b> <br/>Tổng mục tiêu : : <b>${point.y} ' +
              this.currencyIDDefault +
              '</b><br/>Số lượng cơ hội : <b>${point.size}</b>';
          } else {
            this.primaryXAxisRatio.title =
              'Total expected sales ( ' + this.currencyIDDefault + ')';
            this.primaryYAxisRatio.title =
              'Total target ( ' + this.currencyIDDefault + ')';

            this.tooltip.format =
              'Total expected sales : <b>${point.x} ' +
              this.currencyIDDefault +
              '</b> <br/>Total target : <b>${point.y} ' +
              this.currencyIDDefault +
              '</b><br/>Quantity of deals : <b>${point.size}</b>';
          }
        }
      }
    });
  }
  //--------------Change Filter--------------//
  valueChangeFilter(e) {}
  //--------------end Change Filter--------------//

  onActions(e) {
    if (e.type == 'reportLoaded') {
      this.cache.valueList('CRM057').subscribe((vl) => {
        if (vl) {
          this.vllData = vl.datas;
          this.filterData = this.vllData.map((x) => {
            return {
              title: x.text,
              path: 'cm/dashboard/CMD01?reportID=' + x.value,
            };
          });
        }
        this.pageTitle.setSubTitle(this.filterData[0].title);
        this.pageTitle.setChildren(this.filterData);
        this.codxService.navigate('', this.filterData[0].path);
        this.isLoaded = false;
      });
    }
  }
}
