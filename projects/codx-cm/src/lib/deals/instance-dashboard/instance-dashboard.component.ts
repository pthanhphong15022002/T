import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, CacheService, FormModel, Util } from 'codx-core';
import { firstValueFrom } from 'rxjs';
import {
  AnimationModel,
  ChartAnnotationSettingsModel,
} from '@syncfusion/ej2-angular-charts';
import { Browser } from '@syncfusion/ej2-base';
export class GridModels {
  pageSize: number;
  entityName: string;
  entityPermission: string;
  formName: string;
  gridViewName: string;
  funcID: string;
  dataValues: string;
  predicates: string;
}
export class Panel {
  id: string;
  row: number;
  col: number;
  sizeX: number;
  sizeY: number;
  minSizeX: number;
  minSizeY: number;
  maxSizeX: number;
  maxSizeY: number;
}
export class PanelOrder {
  panelId: string;
  data: string; //the order of panel
}
@Component({
  selector: 'codx-instance-dashboard',
  templateUrl: './instance-dashboard.component.html',
  styleUrls: ['./instance-dashboard.component.scss'],
})
export class InstanceDashboardComponent implements OnInit {
  @ViewChildren('templateDetail') templates: QueryList<any>;
  @Input() vllStatus: any;
  @Input() processID = '';
  //#region settings
  panels = [
    {
      id: '10.1636284528927885_layout',
      row: 0,
      col: 0,
      sizeX: 12,
      sizeY: 3,
      minSizeX: 12,
      minSizeY: 3,
      maxSizeX: null,
      maxSizeY: null,
    },
    {
      id: '20.5801149283702021_layout',
      row: 0,
      col: 12,
      sizeX: 12,
      sizeY: 3,
      minSizeX: 12,
      minSizeY: 3,
      maxSizeX: null,
      maxSizeY: null,
    },
    {
      id: '30.6937258303982936_layout',
      row: 0,
      col: 24,
      sizeX: 12,
      sizeY: 3,
      minSizeX: 12,
      minSizeY: 3,
      maxSizeX: null,
      maxSizeY: null,
    },
    {
      id: '40.5667390469747078_layout',
      row: 0,
      col: 36,
      sizeX: 12,
      sizeY: 3,
      minSizeX: 12,
      minSizeY: 3,
      maxSizeX: null,
      maxSizeY: null,
    },
    {
      id: '50.4199281088325755_layout',
      row: 3,
      col: 0,
      sizeX: 16,
      sizeY: 8,
      minSizeX: 16,
      minSizeY: 8,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Cơ hội theo giai đoạn',
    },
    {
      id: '60.4592017601751599_layout',
      row: 3,
      col: 16,
      sizeX: 16,
      sizeY: 8,
      minSizeX: 16,
      minSizeY: 8,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Top nhân viên có nhiều cơ hội thành công nhất',
    },
    {
      id: '70.14683256767762543_layout',
      row: 3,
      col: 32,
      sizeX: 16,
      sizeY: 8,
      minSizeX: 16,
      minSizeY: 8,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Thống kê năng suất nhân viên',
    },
    {
      id: '80.36639064171709834_layout',
      row: 11,
      col: 0,
      sizeX: 16,
      sizeY: 6,
      minSizeX: 16,
      minSizeY: 6,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Lý do thành công',
    },
    {
      id: '90.06496875406606994_layout',
      row: 17,
      col: 0,
      sizeX: 16,
      sizeY: 6,
      minSizeX: 16,
      minSizeY: 6,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Lý do thất bại',
    },
    {
      id: '100.21519762020962552_layout',
      row: 11,
      col: 16,
      sizeX: 32,
      sizeY: 12,
      minSizeX: 32,
      minSizeY: 12,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Thống kê hiệu suất trong năm',
    },
  ];
  datas = [
    {
      panelId: '10.1636284528927885_layout',
      data: '1',
    },
    {
      panelId: '20.5801149283702021_layout',
      data: '2',
    },
    {
      panelId: '30.6937258303982936_layout',
      data: '3',
    },
    {
      panelId: '40.5667390469747078_layout',
      data: '4',
    },
    {
      panelId: '50.4199281088325755_layout',
      data: '5',
    },
    {
      panelId: '60.4592017601751599_layout',
      data: '6',
    },
    {
      panelId: '70.14683256767762543_layout',
      data: '7',
    },
    {
      panelId: '80.36639064171709834_layout',
      data: '8',
    },
    {
      panelId: '90.06496875406606994_layout',
      data: '9',
    },
    {
      panelId: '100.21519762020962552_layout',
      data: '10',
    },
  ];
  //#endregion

  countStep;
  countInstances;
  countOwners;
  countFails;
  countSuscess;
  productivityOwner = [
    {
      name: 'Trương Đặng Ngọc Phúc',
      percentage: 90,
      money:5000000,
    },
    {
      name: 'Nguyễn Thanh Dung',
      percentage: 70,
      money:5000000,
    },
    {
      name: 'Trần Công Sơn',
      percentage: 60,
      money:5000000,
    },
    {
      name: 'Hồ Thị Trang Ngân',
      percentage: 30,
      money:5000000,
    }, {
      name: 'Lê Nguyên Trí',
      percentage: 20,
      money:5000000,
    },


  ]
  productivityYear: ProductivityYear[] = [];

  CountInsSteps: any;
  sumStep = 0;
  colorReasonFails;
  colorReasonSuscess;

  isEditMode = false;
  funcID = '';
  dataDashBoard: any;
  isLoaded: boolean = false;
  arrVllStatus = [];
  content = `<div style='font-Weight:600;font-size:14px;text-align: center;'>Cơ hội<br>${this.sumStep}</div>`;
  public annotations: ChartAnnotationSettingsModel[] = [
    {
      content: this.content,
      region: 'Series',
      x: '51%',
      y: '50%',
    },
  ];

  //Initializing Legend
  public innerRadius: string = '85%';
  public radius: string = '100%';
  public startAngle: number = 30;
  //Initializing Datalabel
  public dataLabel: Object = {
    name: 'text',
    visible: true,
    font: {
      fontWeight: '600',
      color: '#ffffff',
    },
  };

  animation: AnimationModel = { enable: true, duration: 2000, delay: 0 };
  paletteColor = [
    'rgb(0 82 177)',
    'rgb(0 82 177 / 85%)',
    'rgb(0 82 177 / 70%)',
    'rgb(0 82 177 / 50%)',
    'rgb(0 82 177 / 30%)',
  ];

  paretoOptions: Object = {
    marker: {
      visible: true,
      isFilled: true,
      width: 7,
      height: 7,
    },
    dashArray: '3,2',
    width: 2,
  };
  public cornerRadius: Object = {
    topLeft: 6,
    topRight: 6,
  };
  formModel: FormModel = {
    entityName: 'DP_Instances',
    entityPer: 'DP_Instances',
    formName: 'DPInstances',
    funcID: 'DPT04',
    gridViewName: 'grvDPInstances',
  };

  isQuantity = false;
  isTallest = true;

  public chartArea: Object = {
    border: {
        width: 0
    }
};
public width: string = Browser.isDevice ? '100%' : '75%';

primaryXAxis;
primaryYAxis;

public legend: Object = {
    visible: true,
    enableHighlight : true
};
public marker1: Object = {
  visible: true,
  shape: 'Circle',
  fill: 'gray',
  width: 2,
  height: 2,
  border: { color: 'black', width: 0 }
};
tooltip = {};
 

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private router: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.setting();
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
    console.log(this.panels);
  }
  ngOnInit(): void {
    this.cache.valueList(this.vllStatus).subscribe((res) => {
      if (res && res.datas) this.arrVllStatus = res.datas;
    });
    this.funcID = this.router.snapshot.params['funcID'];
    this.getDataDashboard('ProcessID==@0', this.processID);
  }

  setQuantity(data) {
    this.isQuantity = data;
  }
  setTallest(data) {
    this.isTallest = data;
  }

  setting() {
    // this.panels = JSON.parse(
    //   '[{"id":"10.1636284528927885_layout","row":0,"col":0,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"20.5801149283702021_layout","row":0,"col":12,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"30.6937258303982936_layout","row":0,"col":24,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"40.5667390469747078_layout","row":0,"col":36,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"50.4199281088325755_layout","row":3,"col":0,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Cơ hội theo giai đoạn"},{"id":"60.4592017601751599_layout","row":3,"col":16,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Top nhân viên có nhiều cơ hội thành công nhất"},{"id":"70.14683256767762543_layout","row":3,"col":32,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê năng suất nhân viên"},{"id":"80.36639064171709834_layout","row":11,"col":0,"sizeX":16,"sizeY":5,"minSizeX":16,"minSizeY":5,"maxSizeX":null,"maxSizeY":null,"header":"Lý do thành công"},{"id":"90.06496875406606994_layout","row":16,"col":0,"sizeX":16,"sizeY":5,"minSizeX":16,"minSizeY":5,"maxSizeX":null,"maxSizeY":null,"header":"Lý do thất bại"},{"id":"100.21519762020962552_layout","row":11,"col":16,"sizeX":32,"sizeY":10,"minSizeX":32,"minSizeY":10,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê hiệu suất trong năm"}]'
    // );
    this.datas = JSON.parse(
      '[{"panelId":"10.1636284528927885_layout","data":"1"},{"panelId":"20.5801149283702021_layout","data":"2"},{"panelId":"30.6937258303982936_layout","data":"3"},{"panelId":"40.5667390469747078_layout","data":"4"},{"panelId":"50.4199281088325755_layout","data":"5"},{"panelId":"60.4592017601751599_layout","data":"6"},{"panelId":"70.14683256767762543_layout","data":"7"},{"panelId":"80.36639064171709834_layout","data":"8"},{"panelId":"90.06496875406606994_layout","data":"9"},{"panelId":"100.21519762020962552_layout","data":"10"}]'
    );
  }

  getNameStatus(status) {
    return this.arrVllStatus.filter((x) => x.value == status)[0]?.text;
  }

  async getDataDashboard(
    predicates?: string,
    dataValues?: string,
    params?: any
  ) {
    let model = new GridModels();
    model.funcID = this.funcID;
    model.entityName = 'DP_Instances';
    model.predicates = predicates;
    model.dataValues = dataValues;
    let data = await firstValueFrom(
      this.api.exec('DP', 'InstancesBusiness', 'GetDataDashBoardAsync', [
        model,
        params,
      ])
    );
    if (data) {
      this.dataDashBoard = data;
      this.countStep = this.dataDashBoard?.countStep;
      this.countOwners = this.dataDashBoard?.countsOwners;
      this.countFails = this.dataDashBoard?.countsReasonsFails;
      this.countSuscess = this.dataDashBoard?.countsReasonsSuscess;
      this.countInstances = this.dataDashBoard?.countsInstance;
      this.productivityOwner = this.dataDashBoard?.productivity;

      let counts = this.dataDashBoard?.counts;
      for (var prop in counts) {
        if (counts.hasOwnProperty(prop)) {
          this.sumStep += counts[prop];
        }
      }
      this.setDataProductivityYear(this.dataDashBoard?.revenue);
      this.content = `<div style='font-Weight:600;font-size:14px;text-align: center;'>Cơ hội<br>${this.sumStep}</div>`;
      console.log(this.dataDashBoard);
      this.isLoaded = true;
      this.changeDetectorRef.detectChanges();
    }else{
      this.countStep = null;
      this.countOwners = null;
      this.countFails = null;
      this.countSuscess = null;
      this.countInstances = null;
      this.isLoaded = true;
    }
  }

  setDataProductivityYear(data){
    if(data && data.length > 0){
      let max = 0;
      data?.forEach(item => {
        let productivity = new ProductivityYear();
        productivity.month = "Tháng " + item?.month.toString(); 
        productivity.expected = item?.expectedRevenue || 0;
        productivity.reality = item?.revenue || 0;
        this.productivityYear.push(productivity);
        let maxProductivity =  productivity.expected > productivity.reality ? productivity.expected : productivity.reality;
        max = maxProductivity > max ? maxProductivity : max;
      });
      this.settingChart(max)
    }
  }

  settingChart(max){
    let interval = Math.ceil(max / 10);
    let maximum = interval*10;
    
    this.primaryXAxis = {
      title: null,
      interval: Browser.isDevice ? 2 : 1,
      labelIntersectAction: 'Rotate45',
      valueType: 'Category',
      majorGridLines: { width: 0 }, minorGridLines: { width: 0 },
      majorTickLines: { width: 0 }, minorTickLines: { width: 0 },
      lineStyle: { width: 0 },
    };
    this.primaryYAxis = {
      title: 'VND',
      minimum: 0,
      maximum: maximum,
      interval: interval,
      lineStyle: { width: 0 },
      majorTickLines: { width: 0 }, majorGridLines: { width: 1 },
      minorGridLines: { width: 1 }, minorTickLines: { width: 0 },
      labelFormat: '{value}',
    };

    this.tooltip = {
      enable: true,
      shared: true,
      format: '${series.name} : <b>${point.y}</b>',
    };
  
  }

  setID() {
    let id = Util.uid();
    return id;
  }
}

export class ProductivityYear {
  month: string;
  expected: number;
  reality: number;
}