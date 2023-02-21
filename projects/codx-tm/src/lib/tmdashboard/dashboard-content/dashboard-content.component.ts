import { TMDashboardService } from './../tmdashboard.service';
import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  IItemClickEventArgs,
  IItemMoveEventArgs,
  ILoadEventArgs,
  TreeMapTheme,
} from '@syncfusion/ej2-angular-treemap';
import { UIComponent } from 'codx-core';
import { BI_Charts, ChartSettings } from '../models/chart.model';
import { Panel, PanelData } from '../models/panel.model';
import { RangeColorModel } from '@syncfusion/ej2-angular-progressbar';

@Component({
  selector: 'dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.scss'],
})
export class DashboardContentComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChildren('team_dashboard') templates: QueryList<any>;

  @Input() reportID: string = 'TMD002';

  dashboard = [];

  panels: Panel[] = [];
  datas: PanelData[] = [];

  // chartSettings2: ChartSettings = {
  //   title: 'Tỷ lệ công việc được giao',
  //   primaryXAxis: {
  //     valueType: 'Category',
  //     majorGridLines: { width: 0 },
  //     labelStyle: {
  //       color: 'transparent',
  //     },
  //   },
  //   primaryYAxis: {
  //     majorTickLines: { width: 0 },
  //     lineStyle: { width: 0 },
  //   },
  // };

  chartSettings6: ChartSettings = {
    seriesSetting: [
      {
        type: 'Pie',
        xName: 'status',
        yName: 'value',
        innerRadius: '80%',
        radius: '70%',
        startAngle: 0,
        explodeIndex: 1,
        explode: true,
        endAngle: 360,
      },
    ],
  };

  chartSettings7: ChartSettings = {
    title: 'Thống kê công việc hoàn thành và số giờ thực hiện',
    seriesSetting: [
      {
        type: 'Column',
        name: 'Tasks',
        xName: 'label',
        yName: 'value',
        cornerRadius: { topLeft: 10, topRight: 10 },
      },
    ],
  };

  // dataSource: any;
  dataSource2: any = [{ Country: 'Canada', GDP: 3.05, WorldShare: 2.04 }];
  CarSales: object[] = [
    { Continent: 'China', Company: 'Volkswagen', Sales: 3005994 },
    { Continent: 'China', Company: 'General Motors', Sales: 1230044 },
    { Continent: 'China', Company: 'Honda', Sales: 1197023 },
    { Continent: 'United States', Company: 'General Motors', Sales: 3042775 },
    { Continent: 'United States', Company: 'Ford', Sales: 2599193 },
    { Continent: 'United States', Company: 'Toyota', Sales: 2449587 },
    { Continent: 'Japan', Company: 'Toyota', Sales: 1527977 },
    { Continent: 'Japan', Company: 'Honda', Sales: 706982 },
    { Continent: 'Japan', Company: 'Suzuki', Sales: 623041 },
    { Continent: 'Germany', Company: 'Volkswagen', Sales: 655977 },
    { Continent: 'Germany', Company: 'Mercedes', Sales: 310845 },
    { Continent: 'Germany', Company: 'BMW', Sales: 261931 },
    { Continent: 'United Kingdom', Company: 'Ford ', Sales: 319442 },
    { Continent: 'United Kingdom', Company: 'Vauxhall', Sales: 251146 },
    { Continent: 'United Kingdom', Company: 'Volkswagen', Sales: 206994 },
    { Continent: 'India', Company: 'Maruti Suzuki', Sales: 1443654 },
    { Continent: 'India', Company: 'Hyundai', Sales: 476241 },
    { Continent: 'India', Company: 'Mahindra', Sales: 205041 },
    { Continent: 'France', Company: 'Renault', Sales: 408183 },
    { Continent: 'France', Company: 'Peugeot', Sales: 336242 },
    { Continent: 'France', Company: 'Citroen', Sales: 194986 },
    { Continent: 'Brazil', Company: 'Flat Chrysler', Sales: 368842 },
    { Continent: 'Brazil', Company: 'General Motors', Sales: 348351 },
    { Continent: 'Brazil', Company: 'Volkswagen', Sales: 245895 },
    { Continent: 'Italy', Company: 'Flat Chrysler', Sales: 386260 },
    { Continent: 'Italy', Company: 'Volkswagen', Sales: 138984 },
    { Continent: 'Italy', Company: 'Ford', Sales: 125144 },
    { Continent: 'Canada', Company: 'Ford', Sales: 305086 },
    { Continent: 'Canada', Company: 'FCA', Sales: 278011 },
    { Continent: 'Canada', Company: 'GM', Sales: 266884 },
  ];

  public itemMove = (args: IItemMoveEventArgs) => {
    args.item['data'].Sales = args.item['weight'];
    args.treemap.tooltipSettings.format =
      args.item['groupIndex'] === 0
        ? 'Country: ${Continent}<br>Sales: ${Sales}'
        : 'Country: ${Continent}<br>Company: ${Company}<br>Sales: ${Sales}';
  };

  public itemClick = (args: IItemClickEventArgs) => {
    args.item['data'].Sales = args.item['weight'];
    args.treemap.tooltipSettings.format =
      args.item['groupIndex'] === 0
        ? 'Country: ${Continent}<br>Sales: ${Sales}'
        : 'Country: ${Continent}<br>Company: ${Company}<br>Sales: ${Sales}';
  };

  // // custom code start
  public load = (args: ILoadEventArgs) => {
    let theme: string = location.hash.split('/')[1];
    theme = theme ? theme : 'Material';
    args.treemap.theme = <TreeMapTheme>(
      (theme.charAt(0).toUpperCase() + theme.slice(1))
        .replace(/-dark/i, 'Dark')
        .replace(/contrast/i, 'Contrast')
    );
  };

  // // custom code end
  titleSettings: object = {
    text: 'Car Sales by Country - 2017',
    textStyle: {
      size: '15px',
    },
  };

  public tooltipSettings: object = {
    visible: true,
    format: 'Country: ${Continent}<br>Company: ${Company}<br>Sales: ${Sales}',
  };

  public legendSettings: object = {
    visible: true,
    position: 'Top',
    shape: 'Rectangle',
  };

  weightValuePath: string = 'Sales';

  palette: string[] = [
    '#C33764',
    '#AB3566',
    '#993367',
    '#853169',
    '#742F6A',
    '#632D6C',
    '#532C6D',
    '#412A6F',
    '#312870',
    '#1D2671',
  ];

  leafItemSettings: object = {
    labelPath: 'Company',
    border: { color: 'white', width: 0.5 },
  };

  border: object = {
    color: 'white',
    width: 0.5,
  };

  topEmp = [];

  dataSource: any;

  rangeColors: RangeColorModel[] = [
    { start: 0, end: 50, color: 'red' },
    { start: 50, end: 100, color: 'orange' },
  ];
  isGradient: boolean = true;

  //#region gauge
  tooltip: Object = {
    enable: true,
  };

  font1: Object = {
    size: '15px',
    color: '#00CC66',
  };
  rangeWidth: number = 25;
  //Initializing titleStyle
  titleStyle: Object = { size: '18px' };
  font2: Object = {
    size: '15px',
    color: '#fcde0b',
  };
  rangeLinearGradient1: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#5465FF', offset: '0%', opacity: 0.9 },
      { color: '#04DEB7', offset: '90%', opacity: 0.9 },
    ],
  };

  rangeLinearGradient2: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#FF8008', offset: '0%', opacity: 0.9 },
      { color: '#FFC837', offset: '90%', opacity: 0.9 },
    ],
  };

  minorTicks: Object = {
    width: 0,
  };

  majorTicks1: Object = {
    position: 'Outside',
    height: 1,
    width: 1,
    offset: 0,
    interval: 30,
  };
  majorTicks2: Object = {
    height: 0,
  };

  lineStyle: Object = {
    width: 0,
  };

  labelStyle1: Object = { position: 'Outside', font: { size: '8px' } };
  labelStyle2: Object = { position: 'Outside', font: { size: '0px' } };
  //#endregion gauge

  legendSettings1: Object = {
    position: 'Top',
    visible: true,
  };

  legendSettings2: Object = {
    position: 'Right',
    visible: true,
  };

  //#endregion gauge

  // legendSettings: Object = {
  //   position: 'Top',
  //   visible: true,
  // };
  legendRateDoneSettings: Object = {
    position: 'Right',
    visible: true,
    textWrap: 'Wrap',
    height: '30%',
    width: '50%',
  };

  //#region chartcolumn
  columnXAxis: Object = {
    interval: 1,
    valueType: 'Category',
    rangePadding: 'None',
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    lineStyle: { width: 0 },
    labelStyle: {
      color: 'dark',
    },
  };

  columnYAxis: Object = {
    minimum: 0,
    interval: 10,
    labelStyle: {
      color: 'gray',
    },
  };

  chartArea: Object = {
    border: {
      width: 0,
    },
  };

  radius: Object = {
    topLeft: 10,
    topRight: 10,
  };
  //#endregion chartcolumn

  headerText: Object = [
    { text: 'Khối lượng công việc' },
    { text: 'Thời gian thực hiện' },
  ];

  chartSettings2: ChartSettings = {
    title: 'Tỷ lệ công việc theo nhóm',
    seriesSetting: [
      {
        type: 'Pie',
        xName: 'status',
        yName: 'value',
        innerRadius: '80%',
        radius: '70%',
        startAngle: 0,
        explodeIndex: 1,
        explode: true,
        endAngle: 360,
      },
    ],
    service: 'OM',
    assembly: 'ERM.Business.OM',
    className: 'DashBoardBusiness',
    method: 'GetChartData1Async',
  };

  chartSettings5: ChartSettings = {
    title: 'Thống kê công việc hoàn thành và số giờ thực hiện',
    seriesSetting: [
      {
        type: 'Column',
        name: 'Tasks',
        xName: 'label',
        yName: 'value',
        cornerRadius: { topLeft: 10, topRight: 10 },
      },
    ],
  };

  constructor(private inject: Injector, private dbSerivce: TMDashboardService) {
    super(inject);
    this.reportID = this.router.snapshot.params['reportID'];
  }

  onInit(): void {
    this.codxService.reloadComponent();
  }

  ngAfterViewInit(): void {
    this.panels = JSON.parse(
      '[{"id":"0.5293183694893755_layout","row":14,"col":26,"sizeX":22,"sizeY":6,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.7462735198778399_layout","row":14,"col":0,"sizeX":26,"sizeY":6,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.932033280876619_layout","row":4,"col":17,"sizeX":16,"sizeY":10,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.6076202141678433_layout","row":4,"col":33,"sizeX":15,"sizeY":10,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.5296463903570827_layout","row":4,"col":0,"sizeX":17,"sizeY":10,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.18375208371519292_layout","row":0,"col":0,"sizeX":48,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null}]'
    );
    this.datas = JSON.parse(
      '[{"panelId":"0.5293183694893755_layout","data":"6"},{"panelId":"0.7462735198778399_layout","data":"5"},{"panelId":"0.932033280876619_layout","data":"4"},{"panelId":"0.6076202141678433_layout","data":"3"},{"panelId":"0.5296463903570827_layout","data":"2"},{"panelId":"0.18375208371519292_layout","data":"1"}]'
    );

    this.dbSerivce.loadCharts(this.reportID).subscribe((res: BI_Charts[]) => {
      if (res) {
        res.map((item: BI_Charts) => {
          this.panels.push(JSON.parse(item.location));
        });
      }
    });

    this.detectorRef.detectChanges();
  }
}
