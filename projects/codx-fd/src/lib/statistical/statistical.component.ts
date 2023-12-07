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
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

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
  @ViewChildren('templateKudos') templates3: QueryList<any>;

  //#region Đát Bo

  panels:any = JSON.parse(
    '[{"id":"0.1636284528927885_layout","row":0,"col":0,"sizeX":12,"sizeY":6,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null,"header":"Mức độ cảm xúc lời cảm ơn"},{"id":"0.4199281088325755_layout","row":0,"col":12,"sizeX":18,"sizeY":10,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê theo loại phiếu"},{"id":"0.4592017601751599_layout","row":0,"col":30,"sizeX":18,"sizeY":10,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Top nhân viên hoạt động nhiều nhất"},{"id":"0.06496875406606994_layout","row":10,"col":12,"sizeX":36,"sizeY":13,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null,"header":"Tỉ lệ phiếu theo phòng ban"},{"id":"0.21519762020962552_layout","row":6,"col":0,"sizeX":12,"sizeY":17,"minSizeX":8,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Hành vi được tuyên dương"}]'
  );
  datas:any = JSON.parse(
    '[{"panelId":"0.1636284528927885_layout","data":"1"},{"panelId":"0.4199281088325755_layout","data":"5"},{"panelId":"0.4592017601751599_layout","data":"6"},{"panelId":"0.06496875406606994_layout","data":"8"},{"panelId":"0.21519762020962552_layout","data":"7"}]'
  );

  panels2:any = JSON.parse(
    '[{"id":"0.4199281088325755_layout","header":"Tỉ lệ đổi quà theo phòng ban","row":0,"col":12,"sizeX":18,"sizeY":11,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"0.4592017601751599_layout","header":"Top nhân viên hoạt động nhiều nhất","row":0,"col":30,"sizeX":18,"sizeY":11,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"0.06496875406606994_layout","header":"Thống kê xu theo phòng ban","row":11,"col":12,"sizeX":36,"sizeY":12,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null},{"id":"0.21519762020962552_layout","header":"Thống kê theo mục đích sử dụng","row":0,"col":0,"sizeX":12,"sizeY":23,"minSizeX":8,"minSizeY":8,"maxSizeX":null,"maxSizeY":null}]'
  );
  datas2:any = JSON.parse(
    '[{"panelId":"0.4199281088325755_layout","data":"2"},{"panelId":"0.4592017601751599_layout","data":"3"},{"panelId":"0.06496875406606994_layout","data":"4"},{"panelId":"0.21519762020962552_layout","data":"1"}]'
  );
  panels3:any = JSON.parse(
    '[{"header":"Điểm cộng thành tích tuyên dương","id":"0.4199281088325755_layout","row":0,"col":0,"sizeX":18,"sizeY":11,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"header":"Top nhân viên bị trừ điểm thành tích phiếu góp ý","id":"0.4592017601751599_layout","row":0,"col":18,"sizeX":18,"sizeY":11,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"header":"Bảng điểm thành tích theo bộ phận","id":"0.06496875406606994_layout","row":11,"col":0,"sizeX":36,"sizeY":12,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null},{"header":"Top nhân viên có điểm thành tích cao nhất","id":"0.21519762020962552_layout","row":0,"col":36,"sizeX":12,"sizeY":23,"minSizeX":8,"minSizeY":8,"maxSizeX":null,"maxSizeY":null}]'
  );
  datas3:any = JSON.parse(
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
  dataLabelCoins: Object = {
    visible: true,
    position: 'Outside', name: 'transName',
    font: {
        fontWeight: '500'
    },
    connectorStyle: { length: '20px', type: 'Curve'},

  };
  circleMarker: Object = { visible: true, height: 7, width: 7 , shape: 'Circle' , isFilled: true };
  palettes:any=['#1BA3C6','#2CB5C0','#30BCAD','#21B087','#33A65C','#57A337','#57A337','#D5BB21','#F8B620','#F89217','#F06719','#E03426','#EB364A','#F64971','#FC719E','#EB73B3','#CE69BE','#A26DC2','#7873C0','#4F7CBA']

    primaryXAxis: Object = {
      majorGridLines: { width: 0 },
      minorGridLines: { width: 0 },
      majorTickLines: { width: 0 },
      minorTickLines: { width: 0 },
      interval: 1,
      lineStyle: { width: 0 },
      valueType: 'Category'
  };
  //Initializing Primary Y Axis
  primaryYAxis: Object = {
      lineStyle: { width: 0 },
      majorTickLines: { width: 0 },
      majorGridLines: { width: 1 },
      minorGridLines: { width: 1 },
      minorTickLines: { width: 0 },
  };
chartArea: Object = {
  border: {
      width: 0
  }
};
  constructor(
    private injector: Injector,
    private cacheService: CacheService,
    private modalService: NgbModal,
    private pageTitle: PageTitleService,
    private routerActive: ActivatedRoute,
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
  rangeLines:any=[];
  editSettings: any = {
    allowAdding: false,
    allowDeleting: false,
    allowEditing: true,
    mode: 'Dialog',
  };
  columnGrids:any=[];

  onInit(): void {
    this.getRangeLines();
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
        //this.reloadAllChart();
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
        reportType: 'D',
        reportView: true,
        showFilter: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
    ];
    this.userPermission = this.view.userPermission;
    //this.reloadAllChart();
    this.pageTitle.setBreadcrumbs([]);
    this.routerActive.params.subscribe((res) => {
      if (res.funcID) {
        this.isLoaded = false;
        this.reportID=res.funcID;
        if(this.arrReport && this.arrReport.length){
          let idx =this.arrReport.findIndex((x:any)=>x.recID==this.reportID);
          if(idx >-1){
            this.reportItem = this.arrReport[idx];
            this.funcID = this.reportItem.reportID;
            if(this.reportItem.reportID == 'FDD001'){
              this.typeBallot='0';
            }
            if(this.reportItem.reportID == 'FDD002'){
              this.typeBallot='1';
            }
            //this.reloadAllChart();
          }

        }

      }
    });
    this.detectorRef.detectChanges();
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
    //this.reloadAllChart();
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
    //this.reloadAllChart();
  }

  reloadAllChart() {

    //this.setPredicate();
    if(this.funcID == 'FDD001' || this.funcID == 'FDD002')
      this.getDataChartB();
    if(this.funcID == 'FDD003')
      this.loadData();
    if(this.funcID == 'FDD004')
      this.loadKudos()
    //this.getDataChartB();
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
  }

  coinsIn:any=[];
  coinsOut:any=[];
  coinsByTypeIn:any=[];
  coinsByTypeOut:any=[];
  transferCoins:any=[];
  coinsByEmp:any=[]
  giftTrans:any=[];
  loadData() {
    this.coinsByTypeIn=[];
    this.coinsByTypeOut=[];
    this.transferCoins=[];
    this.giftTrans=[];
    this.isLoaded = false;
    this.options.pageLoading = false;
    this.options.entityName = 'FD_KudosTrans';
    this.options.entityPermission = 'FD_KudosTrans';
    this.options.gridViewName = 'grvKudosTrans';
    this.options.formName = 'KudosTrans';
    this.options.funcID = 'FDW011';
    this.options.dataObj = 'Coins';
    this.subscription && this.subscription.unsubscribe();
      this.subscription = this.api
      .execSv<any>('FD', 'FD', 'KudosTransBusiness', 'LoadDataWalletAsync', [
        this.options, this.objParams ? this.objParams : {},
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

          this.transferCoins = JSON.parse(JSON.stringify(this.dataset.filter((x:any)=>x.transType=='2'))).map((x:any)=>{x.coins=-x.coins; return x;});
          this.coinsIn = this.dataset.filter((x:any)=>x.coins >0);
          this.coinsOut = JSON.parse(JSON.stringify(this.dataset.filter((x:any)=>x.coins <0))).map((x:any)=>{x.coins=-x.coins; return x;});
          let objEmp=this.groupBy(this.dataset,'userID');
          for(let key in objEmp){
            let  obj:any={};
            obj.userID = key;
            obj.username= objEmp[key][0].userName;
            obj.positionName= objEmp[key][0].positionName;
            obj.departmentName= objEmp[key][0].departmentName;
            obj.coinsIn = this.sumByProp(objEmp[key].filter((x:any)=>x.coins >0),'coins');
            let _coinOut =  this.sumByProp(objEmp[key].filter((x:any)=>x.coins <0),'coins');
            obj.coinsOut = _coinOut != 0 && _coinOut < 0 ? -_coinOut : 0;
            obj.percentageIn = this.toFixed((obj.coinsIn/this.sumByProp(this.coinsIn,'coins'))*100);
            obj.percentageOut = obj.coinsOut > 0 ?this.toFixed((obj.coinsOut/this.sumByProp(this.coinsOut,'coins'))*100) : 0;
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


  statByRule:any=[];
  statByBehavior:any=[];
  statByMinusKudos:any=[];
  subscription:Subscription;
  loadKudos(){
      this.statByRule = [];
      this.statByBehavior = [];
      this.statByMinusKudos=[];
      this.statByEmps=[];
      this.statByDepts=[];
      this.options.pageLoading = false;
      this.options.entityName = 'FD_KudosTrans';
      this.options.entityPermission = 'FD_KudosTrans';
      this.options.gridViewName = 'grvKudosTrans';
      this.options.formName = 'KudosTrans';
      this.options.funcID = 'FDW011';
      this.options.dataObj = 'Coins';
      this.subscription && this.subscription.unsubscribe();
      this.subscription = this.api
        .execSv<any>('FD', 'FD', 'KudosTransBusiness', 'LoadDataKudoAsync', [
          this.options,"4", this.objParams ? this.objParams : {},
        ])
        .subscribe((res:any)=>{

          this.dataset = res;
          let objRule = this.groupBy(this.dataset.filter((x:any)=>x.isGroup == true),'competenceID');
          for(let key in objRule){
            let obj:any={};
            obj.competenceID = key;
            obj.competenceName= objRule[key][0].competenceName;
            obj.quantity = this.sumByProp(objRule[key].filter((x:any)=>x.kudos>0),'kudos');
            this.statByRule.push(obj)
          }
          let objBev = this.groupBy(this.dataset.filter((x:any)=>x.isGroup == false),'competenceID');
          for(let key in objBev){
            let obj:any={};
            obj.competenceID = key;
            obj.competenceName= objBev[key][0].competenceName;
            obj.quantity = this.sumByProp(objBev[key],'kudos');
            this.statByBehavior.push(obj)
          }
          let objMinus = this.groupBy(JSON.parse(JSON.stringify(this.dataset.filter((x:any)=>x.kudos<0))),'userID');
          for(let key in objMinus){
            let obj:any={};
            obj.userID = key;
            obj.username= objMinus[key][0].employeeName;
            obj.positionName = objMinus[key][0].positionName;
            obj.departmentName = objMinus[key][0].departmentName;
            obj.orgUnitName = objMinus[key][0].orgUnitName;

            objMinus[key].map((x:any)=> {x.kudos = -x.kudos; return x});
            obj.quantity = this.sumByProp(objMinus[key],'kudos')
            this.statByMinusKudos.push(obj)
          }
          this.dataset = this.sortByProp(this.dataset,'quantity','desc');
          let objEmp = this.groupBy(this.dataset,'userID');
          let idx=0
          for(let key in objEmp){
            let obj:any ={};
            obj.stt=idx+1;
            idx++;
            obj.userID = key;
            obj.username = objEmp[key][0].employeeName;
            obj.departmentID = objEmp[key][0].departmentID;
            obj.departmentName =objEmp[key][0].departmentName;
            obj.positionName =objEmp[key][0].positionName;
            obj.quantity = this.sumByProp(objEmp[key],'kudos');
            let rank = this.setRank(obj);
            if(rank){
              obj.rankName = rank.breakName;
              obj.color = rank.color
            }
            this.statByEmps.push(obj);
          }

          let objDept = this.groupBy(this.statByEmps,'departmentID');
          for(let key in objDept){
            let obj:any={};
            obj.departmentID = key;
            obj.departmentName = objDept[key][0].departmentName;
            obj.quantity = this.sumByProp(objDept[key],'quantity');
            obj.avg = this.toFixed(obj.quantity/objDept[key].length)
            for(let i=0;i<this.rangeLines.length;i++){
              obj[`type${i}`] = objDept[key].filter((x:any)=>x.rankName== this.rangeLines[i].breakName).length;
            }
            this.statByDepts.push(obj)
          }
          this.isLoaded = true;
        })
  }


  getRangeLines(){
    let model:any = {
      predicate:"RangeID=@0",
      dataValue: "KUDOS",
      sortColumns: "BreakValue",
      sortDirections: "desc"
     };
    this.api
        .execSv<any>('BS', 'ERM.Business.BS', 'RangeLinesBusiness', 'GetDataByPredicateAsync', [
          model
        ])
        .subscribe((res:any)=>{
          this.rangeLines = res;
          this.rangeLines = this.sortByProp(this.rangeLines,'breakValue','desc');
        })
  }

  setRank(user:any){
    if(this.rangeLines?.length){
      let items = this.rangeLines.filter((x:any)=>x.breakValue <= user.quantity);
      if(items.length) return items[0];
      else return this.rangeLines[this.rangeLines.length-1];
    }
    return null;
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
    this.options.pageLoading = false;
    this.options.entityName = 'FD_Receivers';
    this.options.entityPermission = 'FD_Receivers';
    this.options.gridViewName = 'grvReceivers';
    this.options.formName = 'Receivers';
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
    this.ratingStats=[];
    this.listCardsPerBev=[];
    this.statByBevs=[];
    this.statByEmps=[];
    this.statByDepts=[];
    this.subscription && this.subscription.unsubscribe();
    this.subscription = this.api
      .execSv<any>('FD', 'FD', 'CardsBusiness', 'GetStatisticBallot1Async', [
        this.options,
        this.typeBallot,
        this.objParams
      ])
      .subscribe((res) => {
        if (res) {
          this.dataset=res.lstCards;
          this.listBehaviors=res.lstBehaivor || [];
          this.mappingData()
          this.cardsByRatingType = this.groupBy(this.dataset.filter((x:any)=>x.cardType=='2' && x.ratingName),'ratingName');
          for(let key in this.cardsByRatingType){
            let obj:any={};
            obj.ratingName=key;
            obj.quantity=this.cardsByRatingType[key].length;
            obj.percentage = this.toFixed((obj.quantity/this.dataset.filter((x:any)=>x.cardType=='2' && x.ratingName).length)*100);
            this.ratingStats.push(obj);
          }
          this.cardByDepts = this.groupBy(this.dataset.filter((x:any)=>x.departmentID),'departmentID');
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
      //this.reloadAllChart();
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

  activePane:any='btnRule'
  changeRule(ele:any,obj:any){
    if(ele.id==this.activePane) return;
    this.activePane = ele.id;
    if(ele.id=='btnRule'){
      obj.paneRule.classList.contains('d-none') && obj.paneRule.classList.remove('d-none');
      !obj.paneBev.classList.contains('d-none') && obj.paneBev.classList.add('d-none')
    }
    if(ele.id=='btnBev'){
      !obj.paneRule.classList.contains('d-none') && obj.paneRule.classList.add('d-none')
      obj.paneBev.classList.contains('d-none') && obj.paneBev.classList.remove('d-none')
    }
  }

  sumByProp(arr:any[],property:string){
    if(arr && arr.length){
      return arr.reduce((accumulator:any, object:any) => {
        return accumulator + object[property];
      }, 0);
    }
    return 0;
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
    this.callfc.openForm(DrilldownComponent,e.departmentName,1280,720,'',[this.sortByProp(this.statByEmps.filter((x:any)=>x.departmentID==e.departmentID),'quantity','desc'),'1'],'',dialogModel)
  }
  doubleClick2(e:any){
    let dialogModel = new DialogModel;
    this.callfc.openForm(DrilldownComponent,e.departmentName,1280,720,'',[this.sortByProp(this.statByEmps.filter((x:any)=>x.departmentID==e.departmentID),'quantity','desc'),'2'],'',dialogModel)
  }


  arrReport:any=[];
  reportItem!:any;
  reportID!:any;
  onActions(e: any) {
    if (e.type == 'reportLoaded') {
      this.arrReport = e.data;
      if (this.arrReport.length) {
        let pattern =
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

          if(this.arrReport.length > 1 && !this.reportID.match(pattern)){
            this.codxService.navigate('',`${this.view.function?.module ? this.view.function?.module.toLocaleLowerCase() : 'fd'}/dashboard-view/${this.reportID}`);
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
                      path: 'fd/dashboard/' + this.arrReport[i].recID,
                    });
                  }

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



                  }
                  if(this.reportItem.reportID == 'FDD001'){
                    this.typeBallot='0';
                  }
                  if(this.reportItem.reportID == 'FDD002'){
                    this.typeBallot='1';
                  }
                  this.reloadAllChart();
                  //this.reloadAllChart();
                  //this.isLoaded = true
                }
              });

      }
    }
    if(e.type == 'reportItem'){
      this.reportItem = e.data;
    }
  }

  objParams:any;
  filterChange(e:any){
    this.isLoaded = false;
    this.objParams=e[1];
    debugger
    this.reportItem &&  this.reloadAllChart();
  }

  private groupBy(arr: any, key: any) {
    return arr.reduce(function (r: any, a: any) {
      r[a[key]] = r[a[key]] || [];
      r[a[key]].push(a);
      return r;
    }, Object.create(null));
  }
}
