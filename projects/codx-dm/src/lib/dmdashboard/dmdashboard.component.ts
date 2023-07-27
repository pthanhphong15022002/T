import {
  AfterViewInit,
  Injector,
  Input,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  PageTitleService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';

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

@Component({
  selector: 'app-dmdashboard',
  templateUrl: './dmdashboard.component.html',
  styleUrls: ['./dmdashboard.component.scss'],
})
export class DMDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChildren('panel') lstPanels: QueryList<any>;
  @Input() panels: any;
  @Input() datas: any;
  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  funcID: string = 'DMD';
  reportID: string = 'DMD001';
  arrReport: any = [];
  dbData;
  isLoaded = false;
  isEditMode = true;

  public chartData: Object[] = [
    { month: 'Jan', sales: 35 },
    { month: 'Feb', sales: 28 },
    { month: 'Mar', sales: 34 },
    { month: 'Apr', sales: 32 },
    { month: 'May', sales: 40 },
    { month: 'Jun', sales: 32 },
    { month: 'Jul', sales: 35 },
    { month: 'Aug', sales: 55 },
    { month: 'Sep', sales: 38 },
    { month: 'Oct', sales: 30 },
    { month: 'Nov', sales: 25 },
    { month: 'Dec', sales: 32 },
  ];

  public primaryXAxis: Object = {
    valueType: 'Category',
  };

  public lineData: any[] = [
    { x: 2013, y: 28 },
    { x: 2014, y: 25 },
    { x: 2015, y: 26 },
    { x: 2016, y: 27 },
    { x: 2017, y: 32 },
    { x: 2018, y: 35 },
  ];

  public data: object[] = [
    {
      Title: 'State wise International Airport count in South America',
      State: 'Brazil',
      Count: 25,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'Colombia',
      Count: 12,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'Argentina',
      Count: 9,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'Ecuador',
      Count: 7,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'Chile',
      Count: 6,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'Peru',
      Count: 3,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'Venezuela',
      Count: 3,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'Bolivia',
      Count: 2,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'Paraguay',
      Count: 2,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'Uruguay',
      Count: 2,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'Falkland Islands',
      Count: 1,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'French Guiana',
      Count: 1,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'Guyana',
      Count: 1,
    },
    {
      Title: 'State wise International Airport count in South America',
      State: 'Suriname',
      Count: 1,
    },
  ];

  public data1: object[] = [
    { Product: 'TV : 30 (12%)', Percentage: 12, TextMapping: 'TV, 30 <br>12%' },
    { Product: 'PC : 20 (8%)', Percentage: 8, TextMapping: 'PC, 20 <br>8%' },
    {
      Product: 'Laptop : 40 (16%)',
      Percentage: 16,
      TextMapping: 'Laptop, 40 <br>16%',
    },
    {
      Product: 'Mobile : 90 (36%)',
      Percentage: 36,
      TextMapping: 'Mobile, 90 <br>36%',
    },
    {
      Product: 'Camera : 27 (11%)',
      Percentage: 11,
      TextMapping: 'Camera, 27 <br>11%',
    },
  ];

  public leafItemSettings: object = {
    labelPath: 'State',
  };

  constructor(
    inject: Injector,
    private pageTitle: PageTitleService,
    private routerActive: ActivatedRoute
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.panels = JSON.parse(
      '[{"id":"0.9605255352952085_layout","row":0,"col":0,"sizeX":12,"sizeY":24,"minSizeX":12,"minSizeY":24,"maxSizeX":null,"maxSizeY":null},{"id":"0.47112877938374287_layout","row":0,"col":12,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null},{"id":"0.7647024471772221_layout","row":0,"col":24,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null},{"id":"0.6213687501730532_layout","row":12,"col":12,"sizeX":24,"sizeY":12,"minSizeX":24,"minSizeY":12,"maxSizeX":null,"maxSizeY":null},{"id":"0.7292886175486251_layout","row":0,"col":36,"sizeX":12,"sizeY":24,"minSizeX":12,"minSizeY":24,"maxSizeX":null,"maxSizeY":null}]'
    );
    this.datas = JSON.parse(
      '[{"panelId":"0.9605255352952085_layout","data":""},{"panelId":"0.47112877938374287_layout","data":""},{"panelId":"0.7647024471772221_layout","data":""},{"panelId":"0.6213687501730532_layout","data":""},{"panelId":"0.7292886175486251_layout","data":""}]'
    );

    // this.api
    //   .execSv('DM', 'DM', 'FileBussiness', 'GetDataDashboardAsync', [])
    //   .subscribe((res: any) => {});
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        reportType: 'D',
        reportView: true,
        showFilter: true,

        model: {
          panelRightRef: this.template,
        },
      },
    ];

    this.routerActive.queryParams.subscribe((res) => {
      if (res.reportID) {
        this.reportID = res.reportID;
        this.isLoaded = false;
        let reportItem: any = this.arrReport.find(
          (x: any) => x.reportID == res.reportID
        );
        if (reportItem) {
          let pinnedParams = reportItem.parameters?.filter((x: any) => x.isPin);
          if (pinnedParams) this.view.pinedReportParams = pinnedParams;
        }
        switch (res.reportID) {
          case 'DMD001':
            this.getDashboardData();
            break;
          default:
            break;
        }
      }
    });
    this.detectorRef.detectChanges();
  }

  getDashboardData(predicates?: string, dataValues?: string, params?: any) {
    let model = new GridModels();
    model.funcID = this.funcID;
    model.entityName = 'TM_Tasks';
    model.predicates = predicates;
    model.dataValues = dataValues;

    this.api
      .exec('TM', 'TaskBusiness', 'GetDataMyDashboardAsync', [model, params])
      .subscribe((res) => {
        this.dbData = res;

        setTimeout(() => {
          this.isLoaded = true;
        }, 500);
      });

    this.detectorRef.detectChanges();
  }

  filterChange(e: any) {
    this.isLoaded = false;
    const { predicates, dataValues } = e[0];
    const param = e[1];

    switch (this.reportID) {
      case 'DMD001':
        this.getDashboardData(predicates, dataValues, param);
        break;
      default:
        break;
    }

    this.detectorRef.detectChanges();
  }

  onActions(e: any) {
    if (e.type == 'reportLoaded') {
      this.arrReport = e.data;
      if (this.arrReport.length) {
        let arrChildren: any = [];
        for (let i = 0; i < this.arrReport.length; i++) {
          arrChildren.push({
            title: this.arrReport[i].customName,
            path: 'dm/dmdashboard/DMD?reportID=' + this.arrReport[i].reportID,
          });
        }
        this.pageTitle.setSubTitle(arrChildren[0].title);
        this.pageTitle.setChildren(arrChildren);
        this.codxService.navigate('', arrChildren[0].path);
      }
    }
    this.isLoaded = false;
  }

  newGuid(): string {
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
    return value % 1 === 0 ? value : value.toFixed(2);
  }
}
