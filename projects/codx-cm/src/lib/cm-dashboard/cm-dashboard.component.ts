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
import { ApiHttpService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { LayoutComponent } from '../_layout/layout.component';
import { GridModels } from '../models/tmpModel';

@Component({
  selector: 'lib-cm-dashboard',
  templateUrl: './cm-dashboard.component.html',
  styleUrls: ['./cm-dashboard.component.scss'],
})
export class CmDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChild('noData') noData: TemplateRef<any>;
  @ViewChildren('templateDeals') dashBoardDeals: QueryList<any>;
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
  //Initializing Primary X Axis
  primaryXAxis: Object = {
    interval: 1,
    valueType: 'Category',
    title: 'Tháng triển khai Cơ hội',
  };
  //Initializing Primary Y Axis
  primaryYAxis: Object = {
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
  tooltipChartLine: Object = {
    enable: true,
    shared: true,
    format: '${series.name} : <b>${point.y}%</b>',
  };

  marker = { visible: true };
  checkBtnSuscess = true;
  checkBtnFail = false;
  //chart  Bubble
  border: Object = {
    width: 1.5,
    color: 'black',
  };
  primaryYAxisBubble: Object = {
    title: 'Chỉ tiêu dự kiến (triệu VND)',
    // minimum: 0,
    // maximum: 100,
    // interval: 5,
    // lineStyle: { width: 0 },
    // majorTickLines: { width: 0 },
    // majorGridLines: { width: 1 },
    // minorGridLines: { width: 1 },
    // minorTickLines: { width: 0 },
  };
  primaryXAxisBubble: Object = {
    interval: 1,
    valueType: 'Category',
    title: 'Doanh số thực tế (triệu VND)',
  };

  dataSource = [
    {
      dataSource: [
        { x: 10, y: 7, d: 0.01 },
        { x: 20, y: 50, d: 0.1 },
      ],
      color: 'blue',
      name: 'Muc tiêu 1',
      size: 0.0003,
    },
    {
      dataSource: [{ x: 40, y: 25, d: 10 }],
      color: 'green',
      name: 'Muc tiêu 2',
      size: 10,
    },
    {
      dataSource: [{ x: 45, y: 60, d: 20 }],
      color: 'red',
      name: 'Muc tiêu 3',
      size: 20,
    },
    {
      dataSource: [{ x: 70, y: 56, d: 0.0005 }],
      color: 'yellow',
      name: 'Muc tiêu 4',
      size: 0.0005,
    },
    {
      dataSource: [{ x: 120, y: 45, d: 0.1 }],
      color: 'black',
      name: 'Muc tiêu 5',
      size: 0.1,
    },
  ];

  //nang suat nhan viên
  productivityOwner = [
    {
      name: 'Trương Đặng Ngọc Phúc',
      percentage: 90,
      money: 5000000,
    },
    {
      name: 'Nguyễn Thanh Dung',
      percentage: 70,
      money: 5000000,
    },
    {
      name: 'Trần Công Sơn',
      percentage: 60,
      money: 5000000,
    },
    {
      name: 'Hồ Thị Trang Ngân',
      percentage: 30,
      money: 5000000,
    },
    {
      name: 'Lê Nguyên Trí',
      percentage: 20,
      money: 5000000,
    },
  ];

  constructor(inject: Injector, private layout: LayoutComponent) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
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
        // reportView: true,
        showFilter: true,
        model: {
          panelRightRef: this.template,
        },
      },
    ];

    this.getDataDashboard();
  }

  filterChange(e: any) {
    this.isLoaded = false;
    const { predicates, dataValues } = e[0];
    const param = e[1];
    this.getDataDashboard(predicates, dataValues, param);

    this.detectorRef.detectChanges();
  }

  onActions(e) {}

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

        this.maxOwners = this.dataDashBoard?.countsOwnersTopHightToLow ?? [];
        this.minOwners = this.dataDashBoard?.CountsOwnersTopLowToHight ?? [];

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
    return '90%'; //vi no chua bat dc
  }
}
