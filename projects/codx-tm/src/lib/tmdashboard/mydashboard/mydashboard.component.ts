declare var window: any;
import { CallFuncService, ResourceModel, UserModel } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';
import { AuthStore, DataRequest, UIComponent } from 'codx-core';
import {
  Component,
  ViewChild,
  TemplateRef,
  Injector,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ViewModel } from 'codx-core';
import { ViewType } from 'codx-core';
import { ChartSettings } from 'projects/codx-om/src/lib/model/chart.model';
import {
  IItemClickEventArgs,
  IItemMoveEventArgs,
  ILoadEventArgs,
  TreeMapTheme,
} from '@syncfusion/ej2-angular-treemap';

@Component({
  selector: 'mydashboard',
  templateUrl: './mydashboard.component.html',
  styleUrls: ['./mydashboard.component.scss'],
})
export class MyDashboardComponent extends UIComponent {
  @ViewChild('content') content: TemplateRef<any>;
  @ViewChildren('my_dashboard') templates: QueryList<any>;
  funcID: string;
  user: UserModel;
  request?: ResourceModel;
  viewType = ViewType;
  views: Array<ViewModel> = [];
  model: DataRequest;

  chartSettings2: ChartSettings = {
    title: 'Tỷ lệ công việc được giao',
    seriesSetting: [
      {
        type: 'Bar',
        xName: 'category',
        yName: 'quantity',
        columnSpacing: 0.1,
      },
    ],
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

  panels = [];
  datas = [];

  dataSource: any;
  dataSource2: any = [
    { category: 'Được giao', quantity: 345 },
    { category: 'Tự tạo', quantity: 150 },
  ];
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
    private callfunc: CallFuncService,
    private tmService: CodxTMService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
    this.user = this.auth.get();
    this.model = new DataRequest();
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
    this.model.predicate = 'Owner = @0';
    this.model.dataValue = this.user.userID;
  }

  onInit(): void {
    this.panels = JSON.parse(
      '[{"id":"0.5424032823689648_layout","row":0,"col":0,"sizeX":3,"sizeY":2,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.26516454554256064_layout","row":0,"col":3,"sizeX":3,"sizeY":2,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.5994517199966756_layout","row":0,"col":6,"sizeX":3,"sizeY":2,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.7626223401346761_layout","row":2,"col":0,"sizeX":3,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.8917770078511407_layout","row":2,"col":3,"sizeX":3,"sizeY":4,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.4942285241369997_layout","row":2,"col":6,"sizeX":3,"sizeY":7,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"id":"0.7295624332564068_layout","row":6,"col":0,"sizeX":6,"sizeY":3,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null}]'
    );
    this.datas = JSON.parse(
      '[{"panelId":"0.5424032823689648_layout","data":"1"},{"panelId":"0.26516454554256064_layout","data":"2"},{"panelId":"0.5994517199966756_layout","data":"3"},{"panelId":"0.7626223401346761_layout","data":"4"},{"panelId":"0.8917770078511407_layout","data":"5"},{"panelId":"0.4942285241369997_layout","data":"6"},{"panelId":"0.7295624332564068_layout","data":"7"}]'
    );
    this.getGeneralData();

  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.content,
        },
      },
    ];
    this.api
      .exec('SYS', 'FunctionListBusiness', 'GetFunctListByParentIDAsync', [
        'TMD',
        'VN',
      ])
      .subscribe((res: any) => {
        if (res && res.length > 0) {
          window.ng.getComponent(
            document.getElementsByTagName('codx-views')[0]
          ).dataService.data = res;
        }else{
          window.ng.getComponent(
            document.getElementsByTagName('codx-views')[0]
          ).dataService.clear();
        }
      });
    this.detectorRef.detectChanges();
  }

  private getGeneralData() {
    this.tmService.getMyDBData(this.model, null).subscribe((res) => {
      if (res) {
        this.dataSource = res;
        console.log(this.dataSource.dataBarChart.barChart);
        this.detectorRef.detectChanges();
      }
    });
  }
}
