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
import { ApiHttpService, CacheService, Util } from 'codx-core';
import { DP_Processes } from '../../models/models';
import { firstValueFrom } from 'rxjs';
import { AnimationModel, ChartAnnotationSettingsModel } from '@syncfusion/ej2-angular-charts';
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

  countStep;
  countInstances;
  countOwners;
  countFails;
  countSuscess;

  CountInsSteps: any;
  sumStep = 0;
  colorReasonFails;
  colorReasonSuscess;

  isEditMode = false;
  datas: any;
  panels: any;
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
  public data: Object[] = [
    { name: 'Giai đoạn 1', count:20, text: '35%' },
    { name: 'Giai đoạn 2', count:15, text: '35%' },
    { name: 'Giai đoạn 3', count:5, text: '35%' },
    { name: 'Giai đoạn 4', count:16, text: '35%' },
    { name: 'Giai đoạn 5', count:20, text: '35%' },
    { name: 'Giai đoạn 6', count:35, text: '35%' },
  ];
  public tooltip: Object = {
    enable: true,
    format: '<b>${point.x}</b><br>Tỷ lệ: <b>${point.text}%</b><br>Số lượng: <b>${point.y}</b>',
    header: '',
  };
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
  paletteColor = ['rgb(2 71 253)', 'rgb(2 71 253 / 85%)','rgb(2 71 253 / 70%)','rgb(2 71 253 / 50%)','rgb(2 71 253 / 30%)'];
  
  //thóng kê
  public chartArea: Object = {
    border: {
        width: 0
    }
};
    //Initializing Primary X Axis
    public primaryXAxis: Object = {
      interval: 1,
      valueType: 'Category',
      majorGridLines: { width: 0 }, minorGridLines: { width: 0 },
      majorTickLines: { width: 0 }, minorTickLines: { width: 0 },
      lineStyle: { width: 0 },
      labelIntersectAction: 'Rotate90',
  };
  //Initializing Primary Y Axis
  public primaryYAxis: Object = {
      title: '',
      minimum: 0,
      maximum: 100,
      interval: 10,
      lineStyle: { width: 0 },
      majorTickLines: { width: 0 }, majorGridLines: { width: 1 },
      minorGridLines: { width: 1 }, minorTickLines: { width: 0 }
  };
  tooltip1: Object = {
    enable: true,
    shared: true,
    format: '${series.name} : <b>${point.y}</b>'    
};
public data1: Object[] = [
  { x: 'Button Defect', y: 23 }, { x: 'Pocket Defect', y: 16 },
  { x: 'Collar Defect', y: 10 }, { x: 'Cuff Defect', y: 7 },
  { x: 'Sleeve Defect', y: 6 }, { x: 'Other Defect', y: 2}
];
paretoOptions: Object = {
  marker: {
      visible: true,
      isFilled: true,
      width: 7,
      height: 7
  },
  dashArray: '3,2',
  width: 2
  
}
public  cornerRadius: Object = { 
  topLeft: 6, topRight:  6 
}

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
  }
  ngOnInit(): void {
    this.cache.valueList(this.vllStatus).subscribe((res) => {
      if (res && res.datas) this.arrVllStatus = res.datas;
    });
    this.funcID = this.router.snapshot.params['funcID'];
    this.getDataDashboard('ProcessID==@0', this.processID);
  }

  setting() {
    this.panels = JSON.parse(
      '[{"id":"10.1636284528927885_layout","row":0,"col":0,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"20.5801149283702021_layout","row":0,"col":12,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"30.6937258303982936_layout","row":0,"col":24,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"40.5667390469747078_layout","row":0,"col":36,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"50.4199281088325755_layout","row":3,"col":0,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Cơ hội theo giai đoạn"},{"id":"60.4592017601751599_layout","row":3,"col":16,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Top nhân viên có nhiều cơ hội thành công nhất"},{"id":"70.14683256767762543_layout","row":3,"col":32,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê năng suất nhân viên"},{"id":"80.36639064171709834_layout","row":11,"col":0,"sizeX":16,"sizeY":5,"minSizeX":16,"minSizeY":5,"maxSizeX":null,"maxSizeY":null,"header":"Lý do thành công"},{"id":"90.06496875406606994_layout","row":16,"col":0,"sizeX":16,"sizeY":5,"minSizeX":16,"minSizeY":5,"maxSizeX":null,"maxSizeY":null,"header":"Lý do thất bại"},{"id":"100.21519762020962552_layout","row":11,"col":16,"sizeX":32,"sizeY":10,"minSizeX":32,"minSizeY":10,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê hiệu suất trong năm"}]'
    );
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

      let counts = this.dataDashBoard?.counts;
      for (var prop in counts) {
        if (counts.hasOwnProperty(prop)) {
          this.sumStep += counts[prop];
        }
      }
      this.content = `<div style='font-Weight:600;font-size:14px;text-align: center;'>Cơ hội<br>${this.sumStep}</div>`
      console.log(this.dataDashBoard);
      this.isLoaded = true;
      this.changeDetectorRef.detectChanges();
    }
    // this.api
    //   .exec('DP', 'InstancesBusiness', 'GetDataDashBoardAsync', [model, params])
    //   .subscribe((res) => {

    //   });
  }
  setID(){
    let id = Util.uid();
    return id;
  }
}
