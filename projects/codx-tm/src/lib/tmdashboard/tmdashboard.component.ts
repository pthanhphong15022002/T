import { filter } from 'rxjs';
import {
  Component,
  Injector,
  AfterViewInit,
  TemplateRef,
  ViewChild,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  UIComponent,
  ViewModel,
  ViewType,
  DataRequest,
  AuthStore,
  UserModel,
} from 'codx-core';
import { ChartSettings } from 'projects/codx-om/src/lib/model/chart.model';
import {
  IItemClickEventArgs,
  IItemMoveEventArgs,
  ILoadEventArgs,
  TreeMapTheme,
} from '@syncfusion/ej2-angular-treemap';
import { CodxTMService } from '../codx-tm.service';

@Component({
  selector: 'app-tmdashboard',
  templateUrl: './tmdashboard.component.html',
  styleUrls: ['./tmdashboard.component.scss'],
})
export class TMDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChildren('my_dashboard') templates: QueryList<any>;
  funcID: string = '';
  viewType = ViewType;
  views: Array<ViewModel> = [];
  dashboard = [];

  panels = [];
  datas = [];

  model: DataRequest;
  user: UserModel;

  chartSettings2: ChartSettings = {
    title: 'Tỷ lệ công việc được giao',
    primaryXAxis: {
      valueType: 'Category',
      majorGridLines: { width: 0 },
      labelStyle: {
        color: 'transparent',
      },
    },
    primaryYAxis: {
      majorTickLines: { width: 0 },
      lineStyle: { width: 0 },
    },
  };

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

  dataSource: any;
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
  // custom code start
  public load = (args: ILoadEventArgs) => {
    let theme: string = location.hash.split('/')[1];
    theme = theme ? theme : 'Material';
    args.treemap.theme = <TreeMapTheme>(
      (theme.charAt(0).toUpperCase() + theme.slice(1))
        .replace(/-dark/i, 'Dark')
        .replace(/contrast/i, 'Contrast')
    );
  };
  // custom code end
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

  constructor(
    private inject: Injector,
    private auth: AuthStore,
    private tmService: CodxTMService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    let request = new DataRequest();
    request.funcID = this.funcID;
    request.entityName = 'SYS_FunctionList';
    request.entityPermission = 'TM_DashBoard';
    request.formName = 'TMDashBoard';
    request.predicate = 'ParentID=@0';
    request.dataValue = 'TMD';
    request.page = 1;
    request.pageSize = 20;
    this.panels = JSON.parse(
      '[{"id":"0.5424032823689648_layout","row":0,"col":0,"sizeX":3,"sizeY":2,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.26516454554256064_layout","row":0,"col":3,"sizeX":3,"sizeY":2,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.5994517199966756_layout","row":0,"col":6,"sizeX":3,"sizeY":2,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.7626223401346761_layout","row":2,"col":0,"sizeX":3,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.8917770078511407_layout","row":2,"col":3,"sizeX":3,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.4942285241369997_layout","row":2,"col":6,"sizeX":3,"sizeY":7,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.7295624332564068_layout","row":6,"col":0,"sizeX":6,"sizeY":3,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null}]'
    );
    this.datas = JSON.parse(
      '[{"panelId":"0.5424032823689648_layout","data":"1"},{"panelId":"0.26516454554256064_layout","data":"2"},{"panelId":"0.5994517199966756_layout","data":"3"},{"panelId":"0.7626223401346761_layout","data":"4"},{"panelId":"0.8917770078511407_layout","data":"5"},{"panelId":"0.4942285241369997_layout","data":"6"},{"panelId":"0.7295624332564068_layout","data":"7"}]'
    );

    

    this.loadDashboard(request);
    this.getGeneralData();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelRightRef: this.template,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  loadDashboard(request: any) {
    this.api
      .execSv('SYS', 'Core', 'DataBusiness', 'LoadDataAsync', request)
      .subscribe((res: any) => {
        if (res) {
          this.dashboard = res[0];
          this.view.dataService.add(res).subscribe();
        }
        this.detectorRef.detectChanges();
      });
  }

  loadContent(evt: any, item: any) {
    alert(JSON.stringify(item));
    let url = item.url.substring(0, item.url.lastIndexOf('/'));
    //this.codxService.navigate(item.functionID, url);
  }

  getGeneralData() {
    this.model = new DataRequest();
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
    this.model.predicate = 'Owner = @0';
    this.model.dataValue = this.user.userID;
    this.tmService.getMyDBData(this.model, null).subscribe((res) => {
      if (res) {
        this.dataSource = res;
        this.detectorRef.detectChanges();
      }
    });
  }
}
