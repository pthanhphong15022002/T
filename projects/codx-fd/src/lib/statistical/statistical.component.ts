import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  CacheService,
  DataRequest,
  DialogModel,
  PageTitleService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { ChartComponent } from '@syncfusion/ej2-angular-charts';
import { Browser } from '@syncfusion/ej2-base';
import {
  AnimationModel,
  ProgressBar,
} from '@syncfusion/ej2-angular-progressbar';
import { DrilldownComponent } from './popup-drilldown/popup-drilldown.component';

@Component({
  selector: 'app-statistical',
  templateUrl: './statistical.component.html',
  styleUrls: ['./statistical.component.scss'],
})
export class StatisticalComponent extends UIComponent implements AfterViewInit {
  @ViewChild('subheader') subheader;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('department') departmentTmp!: TemplateRef<any>;
  @ViewChild('button') button!: TemplateRef<any>;
  @ViewChild('linear') linear: ProgressBar;
  @ViewChild('chart') chart: ChartComponent;
  @ViewChildren('template') templates: QueryList<any>;
  @ViewChildren('template2') templates2: QueryList<any>;

  //#region Đát Bo

  panels:any = JSON.parse(
    '[{"id":"0.1636284528927885_layout","row":0,"col":0,"sizeX":12,"sizeY":6,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null,"header":"Mức độ cảm xúc lời cảm ơn"},{"id":"0.4199281088325755_layout","row":0,"col":12,"sizeX":18,"sizeY":12,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê theo loại phiếu"},{"id":"0.4592017601751599_layout","row":0,"col":30,"sizeX":18,"sizeY":12,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Top nhân viên hoạt động nhiều nhất"},{"id":"0.06496875406606994_layout","row":12,"col":12,"sizeX":36,"sizeY":15,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null,"header":"Tỉ lệ phiếu theo phòng ban"},{"id":"0.21519762020962552_layout","row":6,"col":0,"sizeX":12,"sizeY":21,"minSizeX":8,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Hành vi được tuyên dương"}]'
  );
  datas:any = JSON.parse(
    '[{"panelId":"0.1636284528927885_layout","data":"1"},{"panelId":"0.4199281088325755_layout","data":"5"},{"panelId":"0.4592017601751599_layout","data":"6"},{"panelId":"0.06496875406606994_layout","data":"8"},{"panelId":"0.21519762020962552_layout","data":"7"}]'
  );

  panels2:any = JSON.parse(
    '[{"id":"0.4199281088325755_layout","header":"Tỉ lệ đổi quà theo phòng ban","row":0,"col":12,"sizeX":18,"sizeY":11,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"0.4592017601751599_layout","header":"Top nhân viên hoạt động nhiều nhất","row":0,"col":30,"sizeX":18,"sizeY":11,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"0.06496875406606994_layout","header":"Thống kê xu theo phòng ban","row":11,"col":12,"sizeX":36,"sizeY":14,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null},{"id":"0.21519762020962552_layout","header":"Thống kê theo mục đích sử dụng","row":0,"col":0,"sizeX":12,"sizeY":25,"minSizeX":8,"minSizeY":8,"maxSizeX":null,"maxSizeY":null}]'
  );
  datas2:any = JSON.parse(
    '[{"panelId":"0.4199281088325755_layout","data":"2"},{"panelId":"0.4592017601751599_layout","data":"3"},{"panelId":"0.06496875406606994_layout","data":"4"},{"panelId":"0.21519762020962552_layout","data":"1"}]'
  );

  //#endregion

  readonly TYPE_Ballot = {
    ALL: '0',
    Ballot_RECEIVED: '2',
    Ballot_SENDED: '1',
  };

  readonly TYPE_TIME = {
    TEMP: '',
    MONTH: 'm',
    QUARTER: 'q',
    YEAR: 'y',
  };

  //Column Chart
  primaryXAxis: Object = {
    valueType: 'Category',
    interval: 1,
    crosshairTooltip: { enable: true },
  };

  primaryYAxis: Object = {
    title: '',
    labelFormat: '{value}',
  };

  tooltip: Object = { enable: true, shared: true };

  width: string = Browser.isDevice ? '100%' : '100%';
  height: string = Browser.isDevice ? '100%' : '60%';

  legendSettings: Object = {
    visible: true,
  };
  startAngle: number = 0;
  endAngle: number = 360;
  //Column Chart

  //ProgressBar
  typeProgress: string = 'Linear';
  widthProgress: string = '100%';
  heightProgress: string = '40';
  trackThickness: number = 4;
  progressThickness: number = 4;
  min: number = 0;
  max: number = 100;
  showProgressValue: boolean = true;
  animation: AnimationModel = { enable: true, duration: 500, delay: 0 };

  selectTopBehaviors: number;
  modeView = '1';
  typeBallot = '0';
  cardType = '';
  typeTime = '1';
  fromDate: any = '';
  toDate = '';
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
  barChartOptions = {
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
  barChartLabels: any[] = [];
  barChartLegend = true;
  barChartPlugins = [];
  barChartData: any[] = [];
  dataReceived = [];
  dataSended = [];
  barChartOptions_Behavior = {
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
  functionList: any;
  ballot_SENDED = false;
  ballot_RECEIVED = false;

  columns: number = 6;
  cellSpacing: number[] = [5, 5];
  aspectRatio: any = 100 / 85;
  dataLabel: Object = {
    visible: true,
    position: 'Outside', name: 'behaviorName',
    font: {
        fontWeight: '500'
    },
    connectorStyle: { length: '20px', type: 'Curve'},

  };
  circleMarker: Object = { visible: true, height: 7, width: 7 , shape: 'Circle' , isFilled: true };
  palettes:any=['#1BA3C6','#2CB5C0','#30BCAD','#21B087','#33A65C','#57A337','#57A337','#D5BB21','#F8B620','#F89217','#F06719','#E03426','#EB364A','#F64971','#FC719E','#EB73B3','#CE69BE','#A26DC2','#7873C0','#4F7CBA']
  constructor(
    private injector: Injector,
    private cacheService: CacheService,
    private modalService: NgbModal,
    private pageTitle: PageTitleService
  ) {
    super(injector);
    this.router.params.subscribe((param) => {
      if (param) this.funcID = param['funcID'];
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
    this.pageTitle.setBreadcrumbs([]);
  }

  dataset:any=[];
  vllFD017:any=[];
  vllFD018:any=[];
  editSettings: any = {
    allowAdding: false,
    allowDeleting: false,
    allowEditing: true,
    mode: 'Dialog',
  };
  columnGrids:any=[];

  onInit(): void {
    this.options.pageLoading = false;
    this.options.entityName = 'FD_Receivers';
    this.options.entityPermission = 'FD_Receivers';
    this.options.gridViewName = 'grvReceivers';
    this.options.formName = 'Receivers';
    this.cacheService.valueList('SYS062').subscribe((res) => {
      if (res.datas) {
        this.palettes=[];
        res.datas.map((x:any)=>{
          this.palettes.push(x.value);
          return x;
        })
      }
    });
    // this.options.funcID = this.funcID;
    this.cacheService.valueList('FD017').subscribe((res) => {
      if (res) {
        this.vllFD017 = res.datas;
      }
    });
    this.cacheService.valueList('FD018').subscribe((res) => {
      if (res) {
        this.vllFD018 = res.datas;
      }
    });
    this.cacheService.valueList('L1422').subscribe((res) => {
      if (res) {
        this.dataStore = res.datas;
        this.reloadAllChart();
      }
    });

  }

  isLoaded:boolean=false;
  ngAfterViewInit() {
    this.views = [
      // {
      //   type: ViewType.content,
      //   active: true,
      //   sameData: false,
      //   reportType: 'D',
      //   reportView: true,
      //   showFilter: true,

      //   model: {
      //     panelRightRef: this.panelLeftRef,
      //   },
      // },
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
    ];
    this.userPermission = this.view.userPermission;
    //this.reloadAllChart();
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

    if (e.field != 'vllOrganize' && e.data) {
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
    if (typeBallot == this.TYPE_Ballot.Ballot_SENDED) {
      this.ballot_SENDED = !this.ballot_SENDED;
      this.ballot_RECEIVED = false;
    } else {
      this.ballot_RECEIVED = !this.ballot_RECEIVED;
      this.ballot_SENDED = false;
    }
    if (this.ballot_RECEIVED == false && this.ballot_SENDED == false)
      typeBallot = '0';
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

  ratingStats:any=[];
  cardsByRatingType:any={};
  cardByDepts:any={};
  statByDepts:any=[];
  listBehaviors:any=[];
  cardByBevs:any=[];
  listCardsPerBev:any=[];
  statByBevs:any=[];
  listCardsPerEmp:any=[];
  statByEmps:any=[]
  getDataChartB() {
    this.columnGrids = [

      {
        field: 'departmentName',
        headerText: "Tên đơn vị",
        //width: '25%',
        //template: this.departmentTmp
      },
      {
        headerText: "Tuyên dương",
        //width: '15%', //width: gv['Location'].width,
        field: 'cardType1',
      },
      {
        headerText: "Lời cảm ơn",
        //width: '10%', //gv['Equipments'].width,
        field: 'cardType2',
      },
      {
        headerText: "Góp ý thay đổi",
        //width: '20%', //width: gv['Note'].width,
        field: 'cardType3',
      },
      {
        headerText: "Đề xuất cải tiến",
        //width: '15%',
        field:'cardType4'
      },
      {
        //headerText: "Chia sẻ",
        //width: '15%',
        //field:'share'
        template:this.button
      },
    ]

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
          this.dataset=res.lstCards;
          this.listBehaviors=res.lstBehaivor;
          this.mappingData()
          this.cardsByRatingType = this.groupBy(this.dataset.filter((x:any)=>x.cardType=='2' && x.ratingName),'ratingName');
          for(let key in this.cardsByRatingType){
            let obj:any={};
            obj.ratingName=key;
            obj.quantity=this.cardsByRatingType[key].length;
            obj.percentage = this.toFixed((obj.quantity/this.dataset.filter((x:any)=>x.cardType=='2' && x.ratingName).length)*100);
            this.ratingStats.push(obj);
          }
          this.cardByDepts = this.groupBy(this.dataset,'departmentID');
          for(let key in this.cardByDepts){
            let obj:any={};
            obj.recID= this.newGuid();
            obj.departmentID=key;
            obj.departmentName=this.cardByDepts[key][0].departmentName;
            obj.quantity=this.cardByDepts[key].length;
            obj.cardType1=this.cardByDepts[key].filter((x:any)=>x.cardType=='1').length;
            obj.cardType2=this.cardByDepts[key].filter((x:any)=>x.cardType=='2').length;
            obj.cardType3=this.cardByDepts[key].filter((x:any)=>x.cardType=='3').length;
            obj.cardType4=this.cardByDepts[key].filter((x:any)=>x.cardType=='4').length;
            obj.percentage = this.toFixed((obj.quantity/this.dataset.length)*100);
            this.statByDepts.push(obj);
          }
          this.data = res.card;
          this.total = res.total;
          this.renderMiddleText(res.total);
          this.dataCount = res.dataCount;
          this.lstTotalCoin = res.totalCoin;
          listBehavior_Temp = res.resultBehaviors;
          this.selectTopBehaviors = res.selectTopBehaviors;
          this.totalBehavior = res.resultBehaviors.reduce(
            (sum, current) => sum + current.count,
            0
          );

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

          this.dataset.map((x:any)=>{
            if(!x.behavior) return x;
            let lstBevs = x.behavior.split(';');
            for(let i =0;i<lstBevs.length;i++){
              let data = JSON.parse(JSON.stringify(x));
              data.behavior = lstBevs[i];
              data.behaviorName = this.listBehaviors.length?
              (this.listBehaviors.find((b:any)=>b.behaviorID==lstBevs[i]) ?
               this.listBehaviors.find((b:any)=>b.behaviorID==lstBevs[i]).behaviorName : lstBevs[i] )
                : lstBevs[i];
              this.listCardsPerBev.push(data);
            }
            return x;
          });
          let objGroupByBev = this.groupBy(this.listCardsPerBev,'behaviorName');
          for(let key in objGroupByBev){
            let obj:any={};
            obj.behaviorID=objGroupByBev[key][0].behavior;
            obj.behaviorName=key;
            obj.quantity=objGroupByBev[key].length;
            obj.departmentID = objGroupByBev[key][0].departmentID;
            obj.percentage = this.toFixed((obj.quantity/this.listCardsPerBev.length)*100);
            obj.cardType1=objGroupByBev[key].filter((x:any)=>x.cardType=='1').length;
            obj.cardType2=objGroupByBev[key].filter((x:any)=>x.cardType=='2').length;
            obj.cardType3=objGroupByBev[key].filter((x:any)=>x.cardType=='3').length;
            obj.cardType4=objGroupByBev[key].filter((x:any)=>x.cardType=='4').length;
            this.statByBevs.push(obj);
          }
          let cardByEmps = this.groupBy(this.dataset,'receiver');
          for(let key in cardByEmps){
            let obj:any={};
            obj.username=cardByEmps[key][0].receiverName;
            obj.userID=key;
            obj.quantity=cardByEmps[key].length;
            obj.positionName = cardByEmps[key][0].positionName;
            obj.departmentID = cardByEmps[key][0].departmentID;
            obj.departmentName = cardByEmps[key][0].departmentName;
            obj.cardType1=cardByEmps[key].filter((x:any)=>x.cardType=='1').length;
            obj.cardType2=cardByEmps[key].filter((x:any)=>x.cardType=='2').length;
            obj.cardType3=cardByEmps[key].filter((x:any)=>x.cardType=='3').length;
            obj.cardType4=cardByEmps[key].filter((x:any)=>x.cardType=='4').length;
            obj.orgUnitName = cardByEmps[key][0].orgUnitName;
            obj.percentage = this.toFixed((obj.quantity/this.dataset.length)*100);
            this.statByEmps.push(obj);
          }
          this.statByDepts = [...this.statByDepts]
          console.log(this.statByDepts);
          console.log(res);
          this.isLoaded=true;
          this.detectorRef.detectChanges()
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
    this.detectorRef.detectChanges();
    console.log('check chart_Datas', this.chart_Datas);
  }

  getLabelName(key) {
    let oData = this.dataStore.filter((x) => x.value == key);
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
      });
    this.dataReceived = dtReceived;
    this.dataSended = dtSended;
    console.log('check dataReceived', this.dataReceived);
    console.log('check dataSended', this.dataSended);
    this.detectorRef.detectChanges();
  }

  dateChange(evt: any) {
    if (evt?.fromDate || evt?.toDate) {
      this.fromDateDropdown = new Date(evt.fromDate).toISOString();
      this.toDateDropdown = new Date(evt.toDate).toISOString();
      this.reloadAllChart();
    }
  }

  setPredicate() {
    var arrTemp = [];
    this.predicate = '';
    this.dataValue = '';
    if (this.ID) {
      var sField = 'OrgUnitID';
      arrTemp.push({
        field: sField,
        value: this.ID,
        dropdownCalendar: false,
      });
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
    let i = 0;
    var t = this;
    arrTemp.forEach(function (element) {
      if (!element) return;
      var spre = '';
      var dtValue = '';
      if (element.field == 'OrgUnitID') {
        spre = '(' + element.field + '=@' + i + ')';
        dtValue = element.value;
        i += 1;
      } else if (element.field == 'CreatedOn' && !element?.dropdownCalendar) {
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
        i += 1;
      }
      if (t.predicate) {
        if (spre !== '') t.predicate += ' && ' + spre;
      } else t.predicate = spre;
      if (t.dataValue) {
        if (dtValue !== '') t.dataValue += ';' + dtValue;
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

  mappingData(){
    this.dataset = this.dataset.map((data:any)=>{
      if(!data.rating) return data;
      if(data.cardType=='2' && this.vllFD017.length){
        data.ratingName = this.vllFD017.find((x:any)=>x.value==data.rating) ? this.vllFD017.find((x:any)=>x.value==data.rating).text : data.rating;
      }
      if(data.cardType != 2 && this.vllFD018.length){
        data.ratingName = this.vllFD018.find((x:any)=>x.value==data.rating) ? this.vllFD018.find((x:any)=>x.value==data.rating).text : data.rating;
      }
      return data;
    })
  }
  newGuid() {
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

  getCardsByType(type:string){
    if(!type) return [];
    return this.dataset.filter((x:any)=>x.cardType==type);
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

  doubleClick(e:any){
    let dialogModel = new DialogModel;
    this.callfc.openForm(DrilldownComponent,e.departmentName,1280,720,'',this.sortByProp(this.statByEmps.filter((x:any)=>x.departmentID==e.departmentID),'quantity','asc'),'',dialogModel)
  }


  onActions(e: any) {
    // if (e.type == 'reportLoaded') {
    //   this.arrReport = e.data;
    //   if (this.arrReport.length) {
    //     let arrChildren: any = [];
    //     for (let i = 0; i < this.arrReport.length; i++) {
    //       arrChildren.push({
    //         title: this.arrReport[i].customName,
    //         path: 'tm/tmdashboard/TMD?reportID=' + this.arrReport[i].reportID,
    //       });
    //     }
    //     this.pageTitle.setSubTitle(arrChildren[0].title);
    //     this.pageTitle.setChildren(arrChildren);
    //     this.codxService.navigate('', arrChildren[0].path);
    //   }
    // }
    // this.isLoaded = false;
  }

  private groupBy(arr: any, key: any) {
    return arr.reduce(function (r: any, a: any) {
      r[a[key]] = r[a[key]] || [];
      r[a[key]].push(a);
      return r;
    }, Object.create(null));
  }
}
