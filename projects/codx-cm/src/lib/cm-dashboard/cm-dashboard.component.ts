import {
  AfterViewInit,
  Component,
  Injector,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Layout } from '@syncfusion/ej2-angular-diagrams';
import { ApiHttpService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { LayoutComponent } from '../_layout/layout.component';
import { GridModels } from '../models/tmpModel';

@Component({
  selector: 'lib-cm-dashboard',
  templateUrl: './cm-dashboard.component.html',
  styleUrls: ['./cm-dashboard.component.css'],
})
export class CmDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChild('noData') noData: TemplateRef<any>;
  @ViewChildren('templateDeals') dashBoardDeals: QueryList<any>;
  funcID = 'DPT01';
  views: Array<ViewModel> = [];
  button = {
    id: 'btnAdd',
  };
  isEditMode = false;
  panelsDeals: any;
  datasDeals: any;
  arrVllStatus: any = [];
  vllStatus = '';
  dataDashBoard: any;
  isLoaded: boolean = false;
  titLeModule = '';
  //mau cố định
  paletteColor = ['#00BFFF', '#0000FF'];
  // setting
  tooltipSettings = {
    visible: true,
    format: '${businessLineName} - TotalCount:${quantity}',
    template:
      '<div><span>${businessLineName}</span><span>Total Count: ${quantity}</span></div>',
  };

  leafItemSettings = {
    labelPath: 'businessLineName',
    labelPosition: 'Center',
    labelFormat: '${businessLineName}<br>${quantity}-(${percentage} %)',
  };
  colorReasonSuscess = '';
  colorReasonFails = '';
  checkBtnMinRadio: boolean = false;
  checkBtnMaxRadio: boolean = true;
  maxOwners = [];
  minOwners = [];

  primaryXAxis = {
    interval: 1,
  };
  primaryYAxis = {
    title: 'Tỷ lệ thành công',
  };
  chartData = [];

  constructor(inject: Injector, private layout: LayoutComponent) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
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
    this.cache.gridViewSetup('CMDeals', 'grvCMDeals').subscribe((grv) => {
      if (grv) {
        this.vllStatus = grv['Status'].referedValue;
        this.cache.valueList(this.vllStatus).subscribe((res) => {
          if (res && res.datas) this.arrVllStatus = res.datas;
        });
      }
    });
    this.cache.functionList('CM0201').subscribe((fun) => {
      this.titLeModule = fun?.customName || fun?.description;
    });
  }
  onInit(): void {
    this.panelsDeals = JSON.parse(
      '[{"id":"11.1636284528927885_layout","row":0,"col":0,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"21.5801149283702021_layout","row":0,"col":12,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"31.6937258303982936_layout","row":0,"col":24,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"41.5667390469747078_layout","row":0,"col":36,"sizeX":12,"sizeY":3,"minSizeX":12,"minSizeY":3,"maxSizeX":null,"maxSizeY":null},{"id":"51.4199281088325755_layout","row":3,"col":0,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ phân bổ cơ hội theo dòng sản phẩm"},{"id":"61.4592017601751599_layout","row":3,"col":16,"sizeX":32,"sizeY":8,"minSizeX":32,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê tỷ lệ thành công thất bại trong năm theo dòng sản phẩm"},{"id":"71.14683256767762543_layout","row":11,"col":0,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Top nhân viên có nhiều cơ hội thành công nhất"},{"id":"81.36639064171709834_layout","row":11,"col":16,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Lý do thành công"},{"id":"91.06496875406606994_layout","row":11,"col":32,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Lý do thất bại"},{"id":"101.21519762020962552_layout","row":19,"col":0,"sizeX":32,"sizeY":8,"minSizeX":32,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê hiệu suất trong năm"},{"id":"111.21519762020964252_layout","row":19,"col":32,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê năng suất nhân viên"}]'
    );
    this.datasDeals = JSON.parse(
      '[{"panelId":"11.1636284528927885_layout","data":"1"},{"panelId":"21.5801149283702021_layout","data":"2"},{"panelId":"31.6937258303982936_layout","data":"3"},{"panelId":"41.5667390469747078_layout","data":"4"},{"panelId":"51.4199281088325755_layout","data":"5"},{"panelId":"61.4592017601751599_layout","data":"6"},{"panelId":"71.14683256767762543_layout","data":"7"},{"panelId":"81.36639064171709834_layout","data":"8"},{"panelId":"91.06496875406606994_layout","data":"9"},{"panelId":"101.21519762020962552_layout","data":"10"},{"panelId":"111.21519762020964252_layout","data":"11"}]'
    );
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.chart,
        active: true,
        sameData: false,
        reportType: 'D',
        // reportView: true,
        showFilter: true,
        model: {
          panelRightRef: this.template,
        },
      },
    ];

    this.getDataDashboard();
  }

  filterChange(e: any) {
    this.isLoaded = false;
    const { predicates, dataValues } = e[0];
    const param = e[1];
    this.getDataDashboard(predicates, dataValues, param);

    this.detectorRef.detectChanges();
  }

  onActions(e) {}

  getNameStatus(status) {
    return this.arrVllStatus.filter((x) => x.value == status)[0]?.text;
  }

  getDataDashboard(predicates?: string, dataValues?: string, params?: any) {
    this.isLoaded = false;
    let model = new GridModels();
    model.funcID = this.funcID;
    model.entityName = 'CM_Deals';
    model.predicates = predicates;
    model.dataValues = dataValues;
    this.api
      .exec('CM', 'DealsBusiness', 'GetDataDashBoardAsync', [model, params])
      .subscribe((res) => {
        this.dataDashBoard = res;
        this.maxOwners = this.dataDashBoard.countsOwners ?? [];
        this.minOwners = JSON.parse(JSON.stringify(this.maxOwners));
        this.minOwners.sort((a, b) => {
          return a.quantity - b.quantity;
        });
        setTimeout(() => {
          this.isLoaded = true;
        }, 500);
      });

    this.detectorRef.detectChanges();
  }

  getTitle(status) {
    return (
      this.titLeModule +
      '-' +
      this.arrVllStatus.filter((x) => x.value == status)[0]?.text
    );
  }

  clickRadio(id) {
    switch (id) {
      case 'btnMinRadio':
        this.checkBtnMinRadio = true;
        this.checkBtnMaxRadio = false;
        break;
      case 'btnMaxRadio':
        this.checkBtnMinRadio = false;
        this.checkBtnMaxRadio = true;
        break;
    }
    this.detectorRef.detectChanges();
  }
}
