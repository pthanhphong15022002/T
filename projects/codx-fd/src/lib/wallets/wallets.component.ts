import { Valuelist } from './../models/model';
import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiHttpService, ButtonModel, CacheService, DataRequest, TenantStore, ViewModel, ViewsComponent, ViewType, CodxListviewComponent, CodxService } from 'codx-core';
import { LayoutModel } from '@shared/models/layout.model';
import { AccumulationChart, AccumulationChartComponent, MarkerSettingsModel } from '@syncfusion/ej2-angular-charts';
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
  encapsulation: ViewEncapsulation.None
})


export class WalletsComponent implements OnInit {

  public chartArea: Object = {
    border: {
      width: 0
    }
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
    enable: true
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
  labels_empty: string[] = ["Không có dữ liệu"];
  colors_empty: string[] = ["#A9A9A9"];
  options_empty = {
    tooltips: {
      enabled: false,
    },
    legend: {
      position: "right",
      labels: {
        fontSize: 13,
      },
    },
    cutoutPercentage: 90,
    title: {
      align: "start",
      fontSize: 18,
      text: "",
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
      position: "right",
      labels: {
        fontSize: 12,
      },
    },
    cutoutPercentage: 90,
    title: {
      align: "start",
      fontSize: 18,
      text: "Xu nhận",
      display: true,
    },
  };
  options_send = {
    tooltips: {
      titleFontSize: 18,
      bodyFontSize: 18,
    },
    legend: {
      position: "right",
      labels: {
        fontSize: 18,
      },
    },

    cutoutPercentage: 90,
    title: {
      align: "start",
      fontSize: 18,
      text: "Xu trừ",
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
  heightList = "200";
  toDate = new Date();
  firstDay: any = new Date(this.toDate.getUTCFullYear().toString());
  firstDate: any = new Date(this.toDate.getUTCFullYear().toString());
  yearCurrent: any;
  orgUnit = "";
  emloyeeID = "";
  predicate = "";
  dataValue = "";
  comboboxName = '';
  lstDataChart = [];
  ishide = true;
  loadList = false;
  lstEmployeeByOrg = [];
  dataTable = [];
  dicEmployeeByOrg: any;
  dataListTemp = [];
  L1422 = [];
  dataLine: any = [{
    label: 'empty',
    data: [],
  }];
  L1483 = [];
  vllOrganize_value: any;
  predicateCombobox: any;
  dataValueCombobox: any;

  optionsDoughnut = {
    legend: {
      display: false
    },
    cutoutPercentage: 80
  };
  tenant: string;

  @ViewChild("listview") listview;
  @ViewChild("listview") listView: CodxListviewComponent;
  @ViewChild("subheader") subheader;
  @ViewChild('iTemplateLeft') iTemplateLeft: TemplateRef<any>;
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('view') view!: ViewsComponent;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;


  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiHttpService,
    private router: Router,
    private route: ActivatedRoute,
    private tenantStore: TenantStore,
    private changedr: ChangeDetectorRef,
    private cache: CacheService,
    public codxService: CodxService,
  ) {
    this.tenant = this.tenantStore.get()?.tenant;

    this.cache.valueList('L1483').subscribe((res) => {
      if (res) {
        this.L1483 = res.datas;
      }
    })
  }

  button: Array<ButtonModel> = [{
    id: '1',
  }]

  setOption(text): any {
    this.options_empty.title.text = text;
    return this.options_empty;
  }

  ngOnInit(): void {
    this.options.pageLoading = false;
    this.options.entityName = "FD_KudosTrans";
    this.options.entityPermission = "FD_KudosTrans";
    this.options.gridViewName = "grvKudosTrans";
    this.options.formName = "KudosTrans";
    this.options.funcID = this.funcID;
    this.options.dataObj = "Coins";

    this.route.params.subscribe(param => {
      this.funcID = param["funcID"]
      this.changedr.detectChanges();
    });
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
    ]
    this.userPermission = this.viewbase.userPermission;
    this.listView.dataService.dataObj = 'Coins';
    this.changedr.detectChanges();
  }

  LoadData() {
    this.api
      .execSv<any>("FD", "FD", "KudosTransBusiness", "LoadDataWalletAsync", [
        this.options
      ])
      .subscribe((res) => {
        if (res) {
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
    valueType: 'Category'
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
            this.interval = 10
          } else if (this.maxTotal >= 200 && this.maxTotal <= 400) {
            this.interval = 50
          } else {
            this.interval = 100
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
          this.interval = -10
        } else if (this.maxTotal <= -200 && this.maxTotal >= -400) {
          this.interval = -50
        } else {
          this.interval = -100
        }
      } else {
        for (let i = 1; i <= 100; i++) {
          this.maxTotal -= i;
          this.caculateY();
          break;
        }
      }
    }
  }

  valueChange(e, f) {
    if (f == 'Organize') {
      this.orgUnit = e?.data[0];
    } else if (f == 'Employee') {
      this.emloyeeID = e?.data[0];
    }
    switch (e.field) {
      case "toDate":
        if (e.data?.toDate != undefined) {
          var value = new Date(e.data?.toDate);
          this.toDate = value;
        }
        break;
      case "firstDay":
        if (e.data?.fromDate != undefined) {
          var value = new Date(e.data?.fromDate);
          value.setDate(value.getDate());
          this.firstDay = value;
        }
        break;
      case "vllOrganize":
        this.vllOrganize_value = e.data;
        this.getComboboxName();
        break;
      case "Organize":
        this.orgUnit = e?.data[0];
        break;
      case "Employee":
        this.emloyeeID = e?.data[0];
        break;
      default:
        break;
    }
    if (e.field != "vllOrganize" || f != "vllOrganize") {
      if (f == 'Employee' || f == 'Organize') {
        if (e?.data.length != 0) {
          this.setPredicate();
        }
      } else if (f == 'toDate' || f == 'firstDay') {
        if (e?.data?.fromDate != undefined || e?.data?.fromDate != undefined) {
          this.setPredicate();
        }
      }
    }
  }

  getComboboxName() {
    this.comboboxName = '';
    var a = this.L1483.find(x => x.value == this.vllOrganize_value);
    this.comboboxName = a.text;
    this.changedr.detectChanges();
  }

  setPredicate() {
    this.options.predicate = "(TransType=@0 or TransType=@1 or TransType=@2 or TransType=@3)";
    this.options.dataValue = "1;2;4;5";
    var predicate = "",
      dataValue = "",
      arrTemp = [];
    if (this.firstDay)
      arrTemp.push({ field: "TransDateFrom", value: this.firstDay.toISOString() });
    if (this.toDate)
      arrTemp.push({ field: "TransDateTo", value: this.toDate.toISOString() });
    if (this.orgUnit) arrTemp.push({ field: "OrgUnitID", value: this.orgUnit });
    if (this.emloyeeID)
      arrTemp.push({ field: "EmployeeID", value: this.emloyeeID });
    var opartor = "=@";
    var opartorDateFrom = "=@";
    var opartorDateTo = "=@";
    arrTemp.forEach(function (element, index) {
      if (!element) return;

      if (element.field == "TransDateFrom") opartorDateFrom = ">=@";
      if (element.field == "TransDateTo") opartorDateTo = "<=@";
      // if (predicate) {
      if (element.field == "TransDateTo") {
        predicate += " && " + "TransDate" + opartorDateTo + (index + 4) + ")";
      } else if (element.field == "TransDateFrom") {
        predicate += " && (" + "TransDate" + opartorDateFrom + (index + 4);
      } else predicate += " && " + element.field + opartor + (index + 4);
      // }
      // else predicate = element.field + opartor + (index + 4);
      if (dataValue) dataValue += ";" + element.value;
      else dataValue = element.value;
    });
    this.options.predicate += predicate;
    this.options.dataValue += ";" + dataValue;
    this.loadList = true;
    if (this.listview) {
      this.listview.predicate = this.options.predicate;
      this.listview.dataValue = this.options.dataValue;
      this.listview.data = [];
      this.listview.loadData();
    }
    this.LoadData();
  }

  renderMiddleText(value, type) {
    var css = {
      beforeDraw(chart) {
        const ctx = chart.ctx;
        const txt = value;
        ctx.textAlign = "center";
        ctx.fontSize = 16;
        ctx.textBaseline = "middle";
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        ctx.fillText(txt + " xu", centerX, centerY);
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
      arr = [{ key: this.getLabelName(this.data_Receiver[y]?.key), value: this.data_Receiver[y]?.value }];
      this.chartDatas_Received.push(arr[0]);
    }
    this.data_Receiver.forEach((e) => {
      this.colors[0]?.backgroundColor.push(
        "#" + (this.L1422.length > 0 ? this.L1422[z].color : null)
      );
      z++;
    });
    this.colorReceived = this.colors[0]?.backgroundColor
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
      this.colors_Send[0].backgroundColor.push("#" + this.L1422[i].color);
      total += e.value;
      i++;
    });

    let y = 0;
    var arr = [];

    for (y; y < this.data_Send.length; y++) {
      arr = [{ key: this.getLabelName(this.data_Send[y]?.key), value: this.data_Send[y]?.value }];
      this.chartDatas_Send.push(arr[0]);
    }
    this.totalDataSended = total;
    this.colorSend = this.colors_Send[0]?.backgroundColor
    this.dt.detectChanges();
  }

  getDataSet_Line() {
    this.chartDatas_Line = [];
    this.data_Line.forEach((e) => {
      var data = [
        { month: 1, value: 0 }, { month: 2, value: 0 },
        { month: 3, value: 0 }, { month: 4, value: 0 },
        { month: 5, value: 0 }, { month: 6, value: 0 },
        { month: 7, value: 0 }, { month: 8, value: 0 },
        { month: 9, value: 0 }, { month: 10, value: 0 },
        { month: 11, value: 0 }, { month: 12, value: 0 },
      ];
      var label = e.key;
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
          if (dt.month == month)
            dt.value = total;
          return dt;
        })
      })
      this.chartDatas_Line.push({ data, label })
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
    this.changedr.detectChanges();
  }

  getLabelName(key) {
    let oData = _.filter(this.L1422, function (o) {
      if (key == o.value) return o;
    });
    return oData.length > 0 ? oData[0].text : key;
  }

  LoadByUser(userID) {
    this.router.navigate([`${this.tenant}/fed/walletEmployee/${userID}`], { queryParams: { funcID: "FED201" } });
  }

  setHeightList() {
    let wh = window.innerHeight;
    var top = document.getElementsByClassName("top-champion");
    var process = document.getElementsByClassName("process-performance");
    if (top.length > 0) wh = wh - top[0].clientHeight;
    if (process.length > 0) wh = wh - process[0].clientHeight;
    this.heightList = wh - 60 + "";
  }

  openViewDetailCoins(userID) {
    this.codxService.navigate('FDR021', '', { userID: userID });
  }
}
