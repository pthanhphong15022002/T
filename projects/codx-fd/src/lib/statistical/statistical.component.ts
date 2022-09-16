import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  DataRequest,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { LayoutModel } from '@shared/models/layout.model';
import { ChartComponent } from '@syncfusion/ej2-angular-charts';
import { Browser } from '@syncfusion/ej2-base';
import {
  AnimationModel,
  ProgressBar,
} from '@syncfusion/ej2-angular-progressbar';
import { ActivatedRoute } from '@angular/router';
declare var _;

@Component({
  selector: 'app-statistical',
  templateUrl: './statistical.component.html',
  styleUrls: ['./statistical.component.scss'],
})
export class StatisticalComponent extends UIComponent implements OnInit {
  @ViewChild('subheader') subheader;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;

  //Column Chart
  public primaryXAxis: Object = {
    valueType: 'Category',
    interval: 1,
    crosshairTooltip: { enable: true },
  };
  public primaryYAxis: Object = {
    title: '',
    labelFormat: '{value}',
  };
  public tooltip: Object = { enable: true, shared: true };
  @ViewChild('chart')
  public chart: ChartComponent;
  public width: string = Browser.isDevice ? '100%' : '100%';
  public height: string = Browser.isDevice ? '100%' : '60%';

  public legendSettings: Object = {
    visible: true,
  };
  startAngle: number = 0;
  endAngle: number = 360;
  //Column Chart

  //ProgressBar
  public typeProgress: string = 'Linear';
  public widthProgress: string = '100%';
  public heightProgress: string = '40';
  public trackThickness: number = 4;
  public progressThickness: number = 4;
  public min: number = 0;
  public max: number = 100;
  public showProgressValue: boolean = true;
  public animation: AnimationModel = { enable: true, duration: 500, delay: 0 };

  @ViewChild('linear')
  public linear: ProgressBar;
  //ProgressBar

  readonly TYPE_Ballot = {
    ALL: '0',
    Ballot_RECEIVED: '1',
    Ballot_SENDED: '2',
  };
  TYPE_TIME = {
    TEMP: '',
    MONTH: 'm',
    QUARTER: 'q',
    YEAR: 'y',
  };
  selectTopBehaviors: number;
  modeView = '1';
  typeBallot = '0';
  cardType = '0';
  typeTime = '1';
  typeTimeName = this.TYPE_TIME.MONTH;
  fromDate: any = '2021-01-01';
  toDate = '2021-12-01';
  today: any = new Date();
  infoUser = null;
  lstTotalCoin = [];
  lstBehavior = [];
  totalBehavior = 1;
  views: Array<ViewModel> = [];
  showHeader: boolean = true;
  userPermission: any;
  labels_empty: string[] = ['Không có dữ liệu'];
  chartDatas_empty: any[] = [{ key: 'Không có dữ liệu', value: 100 }];
  fromDateDropdown: any;
  toDateDropdown: any;
  checkDropdownCalendar = false;
  options_empty = {
    tooltips: {
      enabled: false,
    },
    legend: { position: 'top' },
    cutoutPercentage: 80,
    title: {
      align: 'start',
      text: 'Xu nhận',
      display: false,
    },
  };
  colors_empty: string[] = ['#A9A9A9'];

  public barChartOptions = {
    responsive: true,
    legend: {
      position: 'right',
    },

    scales: {
      x: {
        grid: {
          display: true,
        },
      },
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            display: true,
            fill: '#717171',
          },
          gridLines: {
            display: true,
          },
        },
      ],
      xAxes: [
        {
          //  barThickness : 10,
          barPercentage: 0.4,
          categoryPercentage: 0.4,
          ticks: {
            beginAtZero: true,
          },
          offset: true,
          gridLines: {
            display: false,
          },
        },
      ],
    },
  };
  public barChartLabels: any[] = [];
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartData: any[] = [];
  public dataReceived = [];
  public dataSended = [];
  public barChartOptions_Behavior = {
    cornerRadius: 50,
    legend: {
      display: false,
    },
    scales: {
      y: {
        grid: {
          display: false,
        },
      },
      yAxes: [
        {
          barPercentage: 0.5,
          categoryPercentage: 0.5,
          ticks: {
            display: false,
            beginAtZero: true,
          },
          gridLines: {
            display: false,
          },
        },
      ],
      xAxes: [
        {
          barPercentage: 0.5,
          categoryPercentage: 0.5,
          ticks: {
            display: false,
            beginAtZero: true,
          },
          gridLines: {
            display: false,
          },
        },
      ],
    },
  };
  plugins_Behavior = {
    datalabels: {
      display: true,
      align: 'center',
      anchor: 'center',
    },
  };
  chartLabels: string[] = [];
  chartDatas: number[] = [];
  chart_Datas: any[] = [];
  totalCoins = 0;
  colorCoins: any;
  colors = [
    {
      backgroundColor: [],
    },
  ];
  optionsDoughnut = {
    legend: {
      display: false,
    },
    cutoutPercentage: 80,
  };
  total: any = 0;
  dataCount: any;
  data = [];
  dataStore = [];
  countDate = 0;
  type = '';
  cbb = 'HRDepartments';
  ID = '';
  predicate = '';
  dataValue = '';
  options = new DataRequest();
  funcID = '';
  functionList: any;

  constructor(
    private injector: Injector,
    private changeDf: ChangeDetectorRef,
    private cacheService: CacheService,
    private modalService: NgbModal,
    private route: ActivatedRoute
  ) {
    super(injector);
    this.route.params.subscribe((param) => {
      this.funcID = param['funcID'];
    });
    this.cacheService.functionList(this.funcID).subscribe((res) => {
      if (res) this.functionList = res;
    });
    let year = this.today.getFullYear();
    let month = this.today.getMonth();
    var firstDayInMonth = new Date(year, month, 1);
    var lastDayInMonth = new Date(year, month + 1, 0);
    this.fromDate = this.dateTimeToString(firstDayInMonth);
    this.toDate = this.dateTimeToString(lastDayInMonth);
  }

  onInit(): void {
    this.options.pageLoading = false;
    this.options.entityName = 'FD_Receivers';
    this.options.entityPermission = 'FD_Receivers';
    this.options.gridViewName = 'grvReceivers';
    this.options.formName = 'Receivers';
    // this.options.funcID = this.funcID;
    this.cacheService.valueList('L1422').subscribe((res) => {
      if (res) {
        this.dataStore = res.datas;
        this.reloadAllChart();
      }
    });
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
    ];
    this.userPermission = this.view.userPermission;
  }

  valueChange(e) {
    switch (e.field) {
      case 'vllOrganize':
        this.type = e.data;
        break;
      case 'Organize':
        this.ID = e.data;
        break;
      default:
        break;
    }

    if (e.field != 'vllOrganize') {
      if (e.data) this.reloadAllChart();
    } else {
      if (this.type == '1') this.cbb = 'Company';
      else if (this.type == '3') this.cbb = 'Divisions';
      else if (this.type == '4') this.cbb = 'HRDepartments';
      else this.cbb = 'HRDepartmentUnits';
      this.detectorRef.detectChanges();
    }
  }

  getClassTextCoin(totalCoinReceiver, totalCoinSend) {
    if (totalCoinReceiver > totalCoinSend) return 'text-success';
    if (totalCoinReceiver < totalCoinSend) return 'text-danger';
    return '';
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
  changeCardType(data) {
    this.cardType = data.data;
    this.reloadAllChart();
  }
  changeTypeCoins(typeBallot) {
    this.typeBallot = typeBallot;
    this.reloadAllChart();
  }
  reloadAllChart() {
    this.setPredicate();
    this.getDataChartA();
    this.getDataChartB();
  }
  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
  }
  getDataChartB() {
    var listBehavior_Temp = [];
    var listBehavior = [];
    var dt = [];
    let i = 0;
    this.api
      .execSv<any>('FD', 'FD', 'CardsBusiness', 'GetStatisticBallot1Async', [
        this.options,
        this.typeBallot,
      ])
      .subscribe((res) => {
        if (res) {
          this.data = res.card;
          this.total = res.total;
          this.renderMiddleText(res.total);
          this.dataCount = res.dataCount;
          this.lstTotalCoin = res.totalCoin;
          listBehavior_Temp = res.resultBehaviors;
          this.selectTopBehaviors = res.selectTopBehaviors;
          this.totalBehavior = _.sumBy(res.resultBehaviors, function (o) {
            return o.count;
          });
          this.getDataSet();
          this.setChartBehavior(res.resultBehaviors);

          listBehavior_Temp.forEach((x) => {
            dt = [
              {
                idProgressBar: i,
                behaviorID: x.behaviorID,
                behaviorName: x.behaviorName,
                count: x.count,
                sorting: x.sorting,
              },
            ];
            listBehavior.push(dt[0]);
            i++;
          });
          this.lstBehavior = listBehavior;
          console.log('check lstTotalCoin', this.lstTotalCoin);
        }
      });
  }

  calculateTotalRow(columnName) {
    if (this.lstTotalCoin.length == 0) return 0;
    return this.lstTotalCoin
      .map((o) => o[columnName])
      .reduce((a, c) => {
        return a + c;
      });
  }
  setChartBehavior(data: Array<any>) {
    // this.barChartLabels_Behavior = [];
    // this.barChartData_Behavior[0].data = [];
    // data.forEach((item) => {
    //     this.barChartLabels_Behavior.push(item.behaviorName);
    //     this.barChartData_Behavior[0].data.push(item.count);
    // })
  }
  getDataSet() {
    this.chartDatas = [];
    this.chartLabels = [];
    this.colors[0].backgroundColor = [];
    const t = this;
    let i = 1;
    var arr = [];
    var chartDatasTemp = [];
    this.chart_Datas = [];
    var total = 0;
    this.data.forEach((e) => {
      this.chartDatas.push(e);
      this.chartLabels.push(this.getLabelName(e.key));
      this.colors[0].backgroundColor.push('#' + this.dataStore[e.key].color);
      total += e.value;
      i++;
    });
    this.totalCoins = total;
    this.colorCoins = this.colors[0]?.backgroundColor;

    for (let y = 0; y < this.data.length; y++) {
      arr = [
        {
          key: this.getLabelName(this.data[y]?.key),
          value: this.data[y]?.value,
        },
      ];
      chartDatasTemp.push(arr[0]);
    }
    this.chart_Datas = chartDatasTemp;
  }
  getLabelName(key) {
    let oData = _.filter(this.dataStore, function (o) {
      if (key == o.value) return o;
    });
    return oData[0].text;
  }
  getDataChartA() {
    var arrReceived = [];
    var arrSended = [];
    var dtReceived = [];
    var dtSended = [];
    this.dataReceived = [];
    this.dataSended = [];

    this.api
      .execSv<any>(
        'FD',
        'ERM.Business.FD',
        'CardsBusiness',
        'GetStatistical1Async',
        [this.options, this.typeBallot]
      )
      .subscribe((res) => {
        var result = new Array();
        if (res?.result.length != 0) {
          result = res?.result;
        }
        this.barChartLabels = [];
        result.forEach((item) => {
          this.barChartLabels.push(item.cardTypeName);
          arrReceived = [
            {
              cardTypeName: item.cardTypeName,
              receiveQuanlity: item.receiveQuanlity,
            },
          ];
          arrSended = [
            {
              cardTypeName: item.cardTypeName,
              sendQuanlity: item.sendQuanlity,
            },
          ];
          dtReceived.push(arrReceived[0]);
          dtSended.push(arrSended[0]);
        });
        this.dataReceived = dtReceived;
        this.dataSended = dtSended;
      });
    this.changeDf.detectChanges();
  }

  dateChange(evt: any) {
    if (evt?.fromDate || evt?.toDate) {
      this.checkDropdownCalendar = true;
      this.fromDateDropdown = this.dateTimeToString(evt?.fromDate);
      this.toDateDropdown = this.dateTimeToString(evt?.toDate);
      this.reloadAllChart();
    }
  }

  setPredicate() {
    var arrTemp = [];
    this.predicate = '';
    this.dataValue = '';
    if (this.ID) {
      var sField = 'OrgUnitID';
      if (this.type == '1') sField = 'CompanyID';
      else if (this.type == '3') sField = 'DivisionID';
      else if (this.type == '4') sField = 'DepartmentID';
      arrTemp.push({ field: sField, value: this.ID });
    }
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
    if (this.cardType)
      arrTemp.push({
        field: 'CardType',
        value: this.cardType,
        dropdownCalendar: false,
      });
    if (this.fromDateDropdown || this.toDateDropdown)
      arrTemp.push({
        field: 'CreatedOn',
        value: this.fromDateDropdown,
        dropdownCalendar: true,
      });
    var i = 0;
    var t = this;
    arrTemp.forEach(function (element) {
      if (!element) return;
      var spre = element.field + '=@' + i;
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
      } else if (element.field == 'CardType') {
        if (element.value != '0') {
          spre = '(' + element.field + '=@' + i + ')';
          dtValue = element.value;
        } else {
          spre = '';
        }
      }
      if (t.predicate) {
        if (spre !== "") t.predicate += ' && ' + spre;
      } else t.predicate = spre;
      if (t.dataValue) {
        if (dtValue !== "") t.dataValue += ';' + dtValue;
      } else t.dataValue = dtValue;
    });
    this.options.predicate = this.predicate;
    this.options.dataValue = this.dataValue;
  }

  renderMiddleText(value) {
    var css = {
      beforeDraw(chart) {
        const ctx = chart.ctx;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        ctx.fillText(value + ' phiếu', centerX, centerY);
      },
    };
  }
}
