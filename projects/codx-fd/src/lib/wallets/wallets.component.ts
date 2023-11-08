import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  Injector,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DataRequest,
  TenantStore,
  ViewModel,
  ViewType,
  CodxListviewComponent,
  UIComponent,
  CacheService,
} from 'codx-core';
import {
  AccumulationChart,
  AccumulationChartComponent,
  MarkerSettingsModel,
} from '@syncfusion/ej2-angular-charts';
import { Browser } from '@syncfusion/ej2-base';

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
  @ViewChildren('template2') templates2: QueryList<any>;

  panels2:any = JSON.parse(
    '[{"id":"0.4199281088325755_layout","header":"Tỉ lệ đổi quà theo phòng ban","row":0,"col":12,"sizeX":18,"sizeY":11,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"0.4592017601751599_layout","header":"Top nhân viên hoạt động nhiều nhất","row":0,"col":30,"sizeX":18,"sizeY":11,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"0.06496875406606994_layout","header":"Thống kê xu theo phòng ban","row":11,"col":12,"sizeX":36,"sizeY":14,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null},{"id":"0.21519762020962552_layout","header":"Thống kê theo mục đích sử dụng","row":0,"col":0,"sizeX":12,"sizeY":25,"minSizeX":8,"minSizeY":8,"maxSizeX":null,"maxSizeY":null}]'
  );
  datas2:any = JSON.parse(
    '[{"panelId":"0.4199281088325755_layout","data":"2"},{"panelId":"0.4592017601751599_layout","data":"3"},{"panelId":"0.06496875406606994_layout","data":"4"},{"panelId":"0.21519762020962552_layout","data":"1"}]'
  );
  palettes:any=['#1BA3C6','#2CB5C0','#30BCAD','#21B087','#33A65C','#57A337','#57A337','#D5BB21','#F8B620','#F89217','#F06719','#E03426','#EB364A','#F64971','#FC719E','#EB73B3','#CE69BE','#A26DC2','#7873C0','#4F7CBA']
  statByEmps:any=[];
  listCardsPerBev:any=[];
  statByBevs:any=[];
  circleMarker: Object = { visible: true, height: 7, width: 7 , shape: 'Circle' , isFilled: true };
  dataLabel: Object = {
    visible: true,
    position: 'Outside', name: 'transName',
    font: {
        fontWeight: '500'
    },
    connectorStyle: { length: '20px', type: 'Curve'},

  };
  tooltip: Object = { enable: true, shared: true };
  execute = false;
  count = 0;
  startAngle: number = 0;
  endAngle: number = 360;


  public legendSettings: Object = {
    visible: true,
  };
  colorReceived: string[] = [];
  colorSend: string[] = [];
  totalDataReceived = 0;
  totalDataSended = 0;
  dataListView: any = [];
  checkdataListView = false;

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
    private changedr: ChangeDetectorRef,
    private cacheService: CacheService,
  ) {
    super(injector);
    this.cacheService.valueList('SYS062').subscribe((res) => {
      if (res.datas) {
        this.palettes=[];
        res.datas.map((x:any)=>{
          this.palettes.push(x.value);
          return x;
        })
      }
    });
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

  coinsIn:any=[];
  coinsOut:any=[];
  dataset:any=[];
  coinsByTypeIn:any=[];
  coinsByTypeOut:any=[];
  transferCoins:any=[];
  coinsByEmp:any=[]
  isLoaded:boolean=false;
  giftTrans:any=[];
  loadData() {
    this.coinsByTypeIn=[];
    this.coinsByTypeOut=[];

    this.api
      .execSv<any>('FD', 'FD', 'KudosTransBusiness', 'LoadDataWalletAsync', [
        this.options,{}
      ])
      .subscribe((res) => {
        if (res) {

          this.dataset = res[1];
          let objGifts = this.groupBy(res[2],'departmentName');
          for(let key in objGifts){
            let obj:any={};
            obj.departmentName=key;
            obj.quantity=objGifts[key].length;
            this.giftTrans.push(obj);
          }

          this.transferCoins = this.dataset.filter((x:any)=>x.transType=='2');
          this.coinsIn = this.dataset.filter((x:any)=>x.coins >0);
          this.coinsOut = this.dataset.filter((x:any)=>x.coins <0);
          let objEmp=this.groupBy(this.dataset,'userID');
          for(let key in objEmp){
            let  obj:any={};
            obj.userID = key;
            obj.userName= objEmp[key][0].userName;
            obj.positionName= objEmp[key][0].positionName;
            obj.departmentName= objEmp[key][0].departmentName;
            obj.coinsIn = this.sumByProp(objEmp[key].filter((x:any)=>x.coins >0),'coins');
            obj.coinsOut =  this.sumByProp(objEmp[key].filter((x:any)=>x.coins <0).map((c:any)=> {c.coins=-c.coins; return c}),'coins');
            obj.percentageIn = this.toFixed((obj.coinsIn/this.sumByProp(this.coinsIn,'coins'))*100);
            obj.percentageOut = this.toFixed((obj.coinsOut/this.sumByProp(this.coinsOut,'coins'))*100);
            this.coinsByEmp.push(obj);
          }
          //this.coinsOut = this.coinsOut.map((x:any)=> x.coins = -x.coins);
          let objIn = this.groupBy(this.coinsIn,'transType');
          for(let key in objIn){
            let  obj:any={};
            obj.transType = key;
            obj.transName= objIn[key][0].categoryName;
            obj.coins = this.sumByProp(objIn[key],'coins');
            obj.percentage = this.toFixed((obj.coins/this.sumByProp(this.coinsIn,'coins'))*100);
            this.coinsByTypeIn.push(obj);
          }
          let objOut = this.groupBy(this.coinsOut,'transType');
          for(let key in objOut){
            let  obj:any={};
            obj.transType = key;
            obj.transName= objOut[key][0].categoryName;
            obj.coins = this.sumByProp(objOut[key],'coins');
            obj.percentage = this.toFixed((obj.coins/this.sumByProp(this.coinsOut,'coins'))*100);
            this.coinsByTypeOut.push(obj);
          }

          this.detectorRef.detectChanges();
          console.log(objEmp);
          this.isLoaded = true;
        }
      });
  }

  maxTotal = 0;
  minTotal = 0;
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
    if (e.field != 'vllOrganize' || (f != 'vllOrganize' && e.data)) {
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
        .setPredicate(this.options.predicate, [this.options.dataValue]);
    }
    this.loadData();
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
    var value = 0;
    var minimum = 0;
    var maximum = 0;
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
      if (e.value.length > 0) {
        e.value.forEach((res, index) => {
          var month = res.key1.month;
          var total = res.total;
          if (e.value[index].total < 0) {
            if ((e.value.length = 1)) minimum = e.value[index].total;
            else {
              if (e.value[index].total < e.value[index + 1]?.total)
                minimum = e.value[index].total;
            }
          } else {
            if ((e.value.length = 1)) maximum = e.value[index].total;
            else {
              if (e.value[index].total > e.value[index + 1]?.total)
                maximum = e.value[index].total;
            }
          }
          data.filter(function (dt) {
            if (dt.month == month) dt.value = total;
            return dt;
          });
        });
      } else {
        minimum = 0;
        maximum = 0;
      }
      this.chartDatas_Line.push({ data, label });
    });
    this.minTotal = minimum;
    this.maxTotal = maximum;
    this.caculateY();
    this.primaryYAxis = {
      title: '',
      lineStyle: { width: 0 },
      minimum: this.minTotal,
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
    let oData = this.L1422.filter(x=>x.value==key);
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

  private groupBy(arr: any, key: any) {
    return arr.reduce(function (r: any, a: any) {
      r[a[key]] = r[a[key]] || [];
      r[a[key]].push(a);
      return r;
    }, Object.create(null));
  }

  sortByProp(arr:any[],property:string,dir:string='asc',take:number=0){
    if(arr.length && property){
      if(dir == 'asc'){
        if(take){
          return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=> a[property]-b[property]).slice(0,take)
        }
        return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=> a[property]-b[property]);
      }
      else{
        if(take){
          return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=> b[property]-a[property]).slice(0,take)
        }
        return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=> b[property]-a[property]);
      }

    }
    return [];
  }

  toFixed(value: number) {
    if (!value || isNaN(value)) {
      return 0;
    }
    return value % 1 === 0 ? value : value.toFixed(2);
  }

  sumByProp(arr:any[],property:string){
    if(arr && arr.length){
      return arr.reduce((accumulator:any, object:any) => {
        return accumulator + object[property];
      }, 0);
    }
    return 0;
  }
  activeTab:any='btnCoinsIn'
  changeDir(ele:any,id:any,obj:any){
    if(ele.id == this.activeTab) return;
    this.activeTab = ele.id;
    if(ele.id=='btnCoinsOut'){
      if(obj){
        !obj.chart1.pie1.element.classList.contains('d-none') && obj.chart1.pie1.element.classList.add('d-none');
        !obj.chart1.gauge1.classList.contains('d-none')&& obj.chart1.gauge1.classList.add('d-none');

        obj.chart2.pie2.element.classList.contains('d-none') && obj.chart2.pie2.element.classList.remove('d-none');
        obj.chart2.gauge2.classList.contains('d-none') && obj.chart2.gauge2.classList.remove('d-none');
        obj.chart2.pie2.refresh()
      }
    }
    if(ele.id=='btnCoinsIn'){
      if(obj){
        !obj.chart2.pie2.element.classList.contains('d-none') && obj.chart2.pie2.element.classList.add('d-none');
        !obj.chart2.gauge2.classList.contains('d-none')&& obj.chart2.gauge2.classList.add('d-none');

        obj.chart1.pie1.element.classList.contains('d-none') && obj.chart1.pie1.element.classList.remove('d-none');
        obj.chart1.gauge1.classList.contains('d-none') && obj.chart1.gauge1.classList.remove('d-none');
        obj.chart1.pie1.refresh()
      }
    }

    this.detectorRef.detectChanges();
  }
}
