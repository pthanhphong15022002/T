import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  Injector,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  DataRequest,
  TenantStore,
  ViewModel,
  ViewsComponent,
  ViewType,
  CodxListviewComponent,
  CodxService,
  UIComponent,
  CRUDService,
} from 'codx-core';
import {
  AccumulationChart,
  AccumulationChartComponent,
  MarkerSettingsModel,
} from '@syncfusion/ej2-angular-charts';
import { Browser } from '@syncfusion/ej2-base';
declare var _;

export class Data_Line {
  data: any = [];
  label: string;
}
@Component({
  selector: 'app-wallets',
  templateUrl: './wallets.component.html',
  styleUrls: ['./wallets.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WalletsComponent extends UIComponent implements OnInit {
  public chartArea: Object = {
    border: {
      width: 0,
    },
  };
  public width: string = Browser.isDevice ? '100%' : '90%';
  public marker: MarkerSettingsModel = { visible: true };

  @ViewChild('pieReceived')
  public pieReceived: AccumulationChartComponent | AccumulationChart;
  @ViewChild('pieSend')
  public pieSend: AccumulationChartComponent | AccumulationChart;
  execute = false;
  count = 0;
  startAngle: number = 0;
  endAngle: number = 360;

  public tooltip: Object = {
    enable: true,
  };
  public legendSettings: Object = {
    visible: true,
  };
  colorReceived: string[] = [];
  colorSend: string[] = [];
  totalDataReceived = 0;
  totalDataSended = 0;
  dataListView: any = [];
  checkdataListView = false;

  funcID = '';
  views: Array<ViewModel> = [];
  showHeader: boolean = true;
  userPermission: any;
  reloadTop = true;
  labels_empty: string[] = ['Không có dữ liệu'];
  colors_empty: string[] = ['#A9A9A9'];
  options_empty = {
    tooltips: {
      enabled: false,
    },
    legend: {
      position: 'right',
      labels: {
        fontSize: 13,
      },
    },
    cutoutPercentage: 90,
    title: {
      align: 'start',
      fontSize: 18,
      text: '',
      display: true,
    },
  };
  chartDatas_empty: any[] = [{ key: 'Không có dữ liệu', value: 100 }];
  options_receiver = {
    tooltips: {
      titleFontSize: 18,
      bodyFontSize: 18,
    },
    legend: {
      position: 'right',
      labels: {
        fontSize: 12,
      },
    },
    cutoutPercentage: 90,
    title: {
      align: 'start',
      fontSize: 18,
      text: 'Xu nhận',
      display: true,
    },
  };
  options_send = {
    tooltips: {
      titleFontSize: 18,
      bodyFontSize: 18,
    },
    legend: {
      position: 'right',
      labels: {
        fontSize: 18,
      },
    },

    cutoutPercentage: 90,
    title: {
      align: 'start',
      fontSize: 18,
      text: 'Xu trừ',
      display: true,
    },
  };
  data_Receiver = [];
  data_Send = [];
  data_Line = [];
  chartLabels: string[] = [];
  chartDatas: any[] = [];
  chartDatas_Received: any[] = [];
  chartLabels_Send: string[] = [];
  chartDatas_Send: number[] = [];
  chartDatas_Line = [];
  check_ChartDatas_Line = false;
  label_line_chart = [];

  // chartType: ChartType = "doughnut";
  colors = [
    {
      backgroundColor: [],
    },
  ];
  colors_Send = [
    {
      backgroundColor: [],
    },
  ];
  options = new DataRequest();
  lstRate = [];
  heightList = '200';
  fromDate: any = '';
  toDate = '';
  today: any = new Date();
  fromDateDropdown: any;
  toDateDropdown: any;
  yearCurrent: any;
  orgUnit = '';
  emloyeeID = '';
  predicate = '';
  dataValue = '';
  cbb = '';
  lstDataChart = [];
  ishide = true;
  loadList = false;
  lstEmployeeByOrg = [];
  dataTable = [];
  dicEmployeeByOrg: any;
  dataListTemp = [];
  L1422 = [];
  dataLine: any = [
    {
      label: 'empty',
      data: [],
    },
  ];
  L1483 = [];
  vllOrganize_value: any;
  predicateCombobox: any;
  dataValueCombobox: any;

  optionsDoughnut = {
    legend: {
      display: false,
    },
    cutoutPercentage: 80,
  };
  tenant: string;
  functionListHistory = {
    url: '',
  };
  functionListWallet = {
    url: '',
  };

  @ViewChild('listview') listview;
  @ViewChild('listview') listView: CodxListviewComponent;
  @ViewChild('subheader') subheader;
  @ViewChild('iTemplateLeft') iTemplateLeft: TemplateRef<any>;
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;

  constructor(
    private injector: Injector,
    private dt: ChangeDetectorRef,
    private route: ActivatedRoute,
    private tenantStore: TenantStore,
    private changedr: ChangeDetectorRef
  ) {
    super(injector);
    this.route.params.subscribe((param) => {
      if (param) this.funcID = param['funcID'];
    });
    this.tenant = this.tenantStore.get()?.tenant;

    this.cache.valueList('L1483').subscribe((res) => {
      if (res) {
        this.L1483 = res.datas;
      }
    });

    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.functionListWallet.url = res.url;
      }
    });

    this.cache.functionList('FDR021').subscribe((res) => {
      if (res) {
        this.functionListHistory.url = res.url;
      }
    });

    let year = this.today.getFullYear();
    let month = this.today.getMonth();
    var firstDayInMonth = new Date(year, month, 1);
    var lastDayInMonth = new Date(year, month + 1, 0);
    this.fromDate = this.dateTimeToString(firstDayInMonth);
    this.toDate = this.dateTimeToString(lastDayInMonth);
  }

  setOption(text): any {
    this.options_empty.title.text = text;
    return this.options_empty;
  }

  onInit(): void {
    this.options.pageLoading = false;
    this.options.entityName = 'FD_KudosTrans';
    this.options.entityPermission = 'FD_KudosTrans';
    this.options.gridViewName = 'grvKudosTrans';
    this.options.formName = 'KudosTrans';
    this.options.funcID = this.funcID;
    this.options.dataObj = 'Coins';
    this.setPredicate();
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.templateLeft,
        },
      },
    ];
    this.userPermission = this.view.userPermission;
    if (this.listView) this.listView.dataService.dataObj = 'Coins';
  }

  dateTimeToString(date: Date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();

    var mmChars = mm.split('');
    var ddChars = dd.split('');

    return (
      yyyy +
      '-' +
      (mmChars[1] ? mm : '0' + mmChars[0]) +
      '-' +
      (ddChars[1] ? dd : '0' + ddChars[0])
    );
  }

  LoadData() {
    this.api
      .execSv<any>('FD', 'FD', 'KudosTransBusiness', 'LoadDataWalletAsync', [
        this.options,
      ])
      .subscribe((res) => {
        if (res) {
          console.log("check res", res)
          this.lstRate = res[0];
          this.L1422 = res[1]?.datas;
          this.data_Receiver = res[2];
          this.renderMiddleText(res[3], 1);
          this.data_Send = res[4];
          this.renderMiddleText(res[5], 2);
          this.getDataSet();
          this.getDataSet_Send();
          this.setHeightList();
          this.data_Line = res[6];
          this.getDataSet_Line();
          this.dt.detectChanges();
        }
      });
  }

  maxTotal = 0;
  interval = 0;
  //Initializing Primary X Axis
  public primaryXAxis: Object = {
    majorGridLines: { width: 0 },
    minorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    minorTickLines: { width: 0 },
    interval: 1,
    lineStyle: { width: 0 },
    valueType: 'Category',
  };

  //Initializing Primary Y Axis
  public primaryYAxis: Object = {
    title: '',
    lineStyle: { width: 0 },
    minimum: 0,
    maximum: 10,
    interval: 1,
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1 },
    minorGridLines: { width: 1 },
    minorTickLines: { width: 0 },
    labelFormat: '{value}',
  };

  caculateY() {
    if (this.maxTotal > 0) {
      if (this.maxTotal <= 50) {
        if (this.maxTotal % 10 == 0) {
          if (this.maxTotal <= 10) {
            this.interval = 1;
          } else if (this.maxTotal >= 20 && this.maxTotal <= 30) {
            this.interval = 5;
          } else {
            this.interval = 10;
          }
        }
      } else {
        if (this.maxTotal % 50 == 0) {
          if (this.maxTotal < 200) {
            this.interval = 10;
          } else if (this.maxTotal >= 200 && this.maxTotal <= 400) {
            this.interval = 50;
          } else {
            this.interval = 100;
          }
        } else {
          for (let i = 1; i <= 100; i++) {
            this.maxTotal += i;
            this.caculateY();
            break;
          }
        }
      }
    } else if (this.maxTotal < 0) {
      if (this.maxTotal >= -50) {
        if (this.maxTotal % 10 == 0) {
          if (this.maxTotal >= -10) {
            this.interval = -1;
          } else if (this.maxTotal <= -20 && this.maxTotal >= -30) {
            this.interval = -5;
          } else {
            this.interval = -10;
          }
        }
      }
      if (this.maxTotal % 50 == 0) {
        if (this.maxTotal > -200) {
          this.interval = -10;
        } else if (this.maxTotal <= -200 && this.maxTotal >= -400) {
          this.interval = -50;
        } else {
          this.interval = -100;
        }
      } else {
        for (let i = 1; i <= 100; i++) {
          this.maxTotal -= i;
          this.caculateY();
          break;
        }
      }
    }
    console.log("check interval", this.interval)
  }

  valueChange(e, f) {
    switch (e.field) {
      case 'vllOrganize':
        var type = e.data;
        if (type == '1') this.cbb = 'Company';
        else if (type == '3') this.cbb = 'Divisions';
        else if (type == '4') this.cbb = 'HRDepartments';
        else this.cbb = 'HRDepartmentUnits';
        this.dt.detectChanges();
        break;
      case 'Organize':
        this.orgUnit = e.data;
        break;
      case 'Employee':
        this.emloyeeID = e.data;
        break;
      default:
        break;
    }
    if (e.field != 'vllOrganize' || f != 'vllOrganize' && e.data) {
      if (f == 'Employee' || f == 'Organize') {
        if (e?.data) {
          this.setPredicate();
        }
      }
    }
  }

  dateChange(evt: any) {
    if (evt?.fromDate || evt?.toDate) {
      this.fromDateDropdown = this.dateTimeToString(evt?.fromDate);
      this.toDateDropdown = this.dateTimeToString(evt?.toDate);
      this.setPredicate();
    }
  }

  setPredicate() {
    this.options.predicate =
      '(TransType=@0 or TransType=@1 or TransType=@2 or TransType=@3) && ';
    this.options.dataValue = '1;2;4;5';
    this.predicate = '';
    this.dataValue = '';
    var arrTemp = [];
    if (
      this.fromDate &&
      this.toDate &&
      (!this.fromDateDropdown || !this.toDateDropdown)
    )
      arrTemp.push({
        field: 'CreatedOn',
        value: this.fromDate,
        dropdownCalendar: false,
      });
    if (this.fromDateDropdown || this.toDateDropdown)
      arrTemp.push({
        field: 'CreatedOn',
        value: this.fromDateDropdown,
        dropdownCalendar: true,
      });
    if (this.orgUnit) arrTemp.push({ field: 'OrgUnitID', value: this.orgUnit });
    if (this.emloyeeID)
      arrTemp.push({ field: 'EmployeeID', value: this.emloyeeID });
    var i = 4;
    var t = this;
    arrTemp.forEach(function (element) {
      if (!element) return;
      var spre = '';
      var dtValue = '';
      if (element.field == 'CreatedOn' && !element?.dropdownCalendar) {
        spre =
          '(' +
          element.field +
          '>=@' +
          i +
          ' && ' +
          element.field +
          '<=@' +
          (i + 1) +
          ')';
        dtValue = t.fromDate + ';' + t.toDate;
        i += 2;
      } else if (element.field == 'CreatedOn' && element?.dropdownCalendar) {
        spre =
          '(' +
          element.field +
          '>=@' +
          i +
          ' && ' +
          element.field +
          '<=@' +
          (i + 1) +
          ')';
        dtValue = t.fromDateDropdown + ';' + t.toDateDropdown;
        i += 2;
      } else if (element.field == 'OrgUnitID') {
        spre = '(' + element.field + '=@' + i + ')';
        dtValue = element.value;
        i += 1;
      } else if (element.field == 'EmployeeID') {
        spre = '(' + element.field + '=@' + i + ')';
        dtValue = element.value;
        i += 1;
      }
      if (t.predicate) {
        if (spre !== '') t.predicate += ' && ' + spre;
      } else t.predicate = spre;
      if (t.dataValue) {
        if (dtValue !== '') t.dataValue += ';' + dtValue;
      } else t.dataValue = dtValue;
    });
    this.options.predicate += this.predicate;
    this.options.dataValue += ';' + this.dataValue;
    this.loadList = true;
    if (this.listview) {
      this.listView.dataService
        .setPredicate(this.options.predicate, [this.options.dataValue])
        .subscribe();
    }
    this.LoadData();
  }

  renderMiddleText(value, type) {
    var css = {
      beforeDraw(chart) {
        const ctx = chart.ctx;
        const txt = value;
        ctx.textAlign = 'center';
        ctx.fontSize = 16;
        ctx.textBaseline = 'middle';
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        ctx.fillText(txt + ' xu', centerX, centerY);
      },
    };
    if (type == 1) {
      this.dt.detectChanges();
      return;
    }
    this.dt.detectChanges();
  }

  getDataSet() {
    this.totalDataReceived = 0;
    this.chartDatas_Received = [];
    this.colorReceived = [];
    this.colorSend = [];
    this.chartDatas = [];
    this.chartLabels = [];
    this.colors[0].backgroundColor = [];
    let i = 0;
    let y = 0;
    let z = 1;
    var arr = [];
    var total = 0;
    this.data_Receiver.forEach((e) => {
      this.chartDatas.push(e);
      this.chartLabels.push(this.getLabelName(e.key));
      total += e.value;
      i++;
    });
    this.totalDataReceived = total;

    for (y; y < this.data_Receiver.length; y++) {
      arr = [
        {
          key: this.getLabelName(this.data_Receiver[y]?.key),
          value: this.data_Receiver[y]?.value,
        },
      ];
      this.chartDatas_Received.push(arr[0]);
    }
    this.data_Receiver.forEach((e) => {
      this.colors[0]?.backgroundColor.push(
        '#' + (this.L1422.length > 0 ? this.L1422[z].color : null)
      );
      z++;
    });
    this.colorReceived = this.colors[0]?.backgroundColor;
    this.dt.detectChanges();
  }
  getDataSet_Send() {
    this.chartDatas_Send = [];
    this.chartLabels_Send = [];
    this.colors_Send[0].backgroundColor = [];
    const t = this;
    let i = 1;
    var total = 0;
    this.data_Send.forEach((e) => {
      this.chartLabels_Send.push(this.getLabelName(e.key));
      this.colors_Send[0].backgroundColor.push('#' + this.L1422[i].color);
      total += e.value;
      i++;
    });

    let y = 0;
    var arr = [];

    for (y; y < this.data_Send.length; y++) {
      arr = [
        {
          key: this.getLabelName(this.data_Send[y]?.key),
          value: this.data_Send[y]?.value,
        },
      ];
      this.chartDatas_Send.push(arr[0]);
    }
    this.totalDataSended = total;
    this.colorSend = this.colors_Send[0]?.backgroundColor;
    this.dt.detectChanges();
  }

  getDataSet_Line() {
    this.chartDatas_Line = [];
    this.data_Line.forEach((e) => {
      var data = [
        { month: 1, value: 0 },
        { month: 2, value: 0 },
        { month: 3, value: 0 },
        { month: 4, value: 0 },
        { month: 5, value: 0 },
        { month: 6, value: 0 },
        { month: 7, value: 0 },
        { month: 8, value: 0 },
        { month: 9, value: 0 },
        { month: 10, value: 0 },
        { month: 11, value: 0 },
        { month: 12, value: 0 },
      ];
      var label = e.key ? e.key : 'Không có dữ liệu';
      e.value.forEach((res) => {
        var month = res.key1.month;
        var total = res.total;

        if (e.value.length > 1) {
          for (let i = 1; i <= e.value.length; i++) {
            if (e.value[0]?.total >= total) {
              this.maxTotal = e.value[0]?.total;
            } else this.maxTotal = total;
          }
        } else {
          if (this.maxTotal < total) {
            this.maxTotal = total;
          }
        }

        data.filter(function (dt) {
          if (dt.month == month) dt.value = total;
          return dt;
        });
      });
      this.chartDatas_Line.push({ data, label });
      console.log("check chartDatas_Line", this.chartDatas_Line)
    });
    this.caculateY();
    this.primaryYAxis = {
      title: '',
      lineStyle: { width: 0 },
      minimum: 0,
      maximum: this.maxTotal,
      interval: this.interval,
      majorTickLines: { width: 0 },
      majorGridLines: { width: 1 },
      minorGridLines: { width: 1 },
      minorTickLines: { width: 0 },
      labelFormat: '{value}',
    };
    console.log('check primaryYAxis', this.primaryYAxis)
    this.changedr.detectChanges();
  }

  getLabelName(key) {
    let oData = _.filter(this.L1422, function (o) {
      if (key == o.value) return o;
    });
    return oData.length > 0 ? oData[0].text : key;
  }

  setHeightList() {
    let wh = window.innerHeight;
    var top = document.getElementsByClassName('top-champion');
    var process = document.getElementsByClassName('process-performance');
    if (top.length > 0) wh = wh - top[0].clientHeight;
    if (process.length > 0) wh = wh - process[0].clientHeight;
    this.heightList = wh - 60 + '';
  }

  openViewDetailCoins(userID) {
    this.codxService.navigate('', this.functionListHistory.url, {
      userID: userID,
    });
  }
}
