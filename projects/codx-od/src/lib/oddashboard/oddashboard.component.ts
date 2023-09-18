import {
  Component,
  AfterViewInit,
  Injector,
  Input,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  PageTitleService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { OD_DispatchDashBoard } from './models/OD_DispatchDashBoard';
import { AccumulationChartComponent } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'oddashboard',
  templateUrl: './oddashboard.component.html',
  styleUrls: ['./oddashboard.component.scss'],
})
export class ODDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChildren('od_dashboard') templates1: QueryList<any>;
  @ViewChild('pie1') pie1: AccumulationChartComponent;
  @Input() panels: any;
  @Input() datas: any;
  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  override funcID = 'ODD';
  reportID: string = 'ODD001';
  arrReport: any = [];
  isEditMode = false;
  isLoaded = false;
  dataset: OD_DispatchDashBoard[] = [];

  data3 = [
    { moduleName: 'Quản lý công việc', percentage: 50 },
    { moduleName: 'Công văn', percentage: 25 },
    { moduleName: 'Trình ký', percentage: 15 },
    { moduleName: 'Khác', percentage: 10 },
  ];

  constructor(
    inject: Injector,
    private pageTitle: PageTitleService,
    private routerActive: ActivatedRoute
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit() {
    this.panels = JSON.parse(
      '[{"id":"0.6040886186158714_layout","row":0,"col":0,"sizeX":12,"sizeY":6,"minSizeX":12,"minSizeY":6,"maxSizeX":null,"maxSizeY":null},{"id":"0.9388300157966656_layout","row":0,"col":12,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header":"Tình hình thực hiện công văn đến"},{"id":"0.6750473923075015_layout","row":0,"col":24,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header":"Công văn theo phân loại"},{"id":"0.6740612302375084_layout","row":0,"col":36,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header": "Công văn gửi/nhận theo nguồn"},{"id":"0.9809454927792045_layout","row":6,"col":0,"sizeX":12,"sizeY":6,"minSizeX":12,"minSizeY":6,"maxSizeX":null,"maxSizeY":null},{"id":"0.5374926060585523_layout","row":12,"col":0,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header":"Top đơn vị bên ngoài gửi/nhận công văn"},{"id":"0.29608212645829535_layout","row":12,"col":12,"sizeX":36,"sizeY":12,"minSizeX":36,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header":"Thống kê công văn theo bộ phận"}]'
    );
    this.datas = JSON.parse(
      '[{"panelId":"0.6040886186158714_layout","data":"1"},{"panelId":"0.9388300157966656_layout","data":"2"},{"panelId":"0.6750473923075015_layout","data":"3"},{"panelId":"0.6740612302375084_layout","data":"4"},{"panelId":"0.9809454927792045_layout","data":"5"},{"panelId":"0.5374926060585523_layout","data":"6"},{"panelId":"0.29608212645829535_layout","data":"7"}]'
    );
  }

  ngAfterViewInit() {
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
    this.pageTitle.setBreadcrumbs([]);
    this.routerActive.params.subscribe((res) => {
      if (res.funcID) {
        this.reportID = res.funcID;
        this.isLoaded = false;
        let reportItem: any = this.arrReport.find(
          (x: any) => x.reportID == res.funcID
        );
        if (reportItem) {
          let pinnedParams = reportItem.parameters?.filter((x: any) => x.isPin);
          if (pinnedParams) this.view.pinedReportParams = pinnedParams;
        }
        if (this.reportID === 'ODD001') {
          this.api
            .execSv(
              'rptod',
              'Codx.RptBusiness.OD',
              'DispatchDataSetBusiness',
              'GetReportSourceAsync',
              []
            )
            .subscribe((res: OD_DispatchDashBoard[]) => {
              this.dataset = res;
              this.isLoaded = true;
            });
        }
      }
    });
    this.detectorRef.detectChanges();
  }

  filterChange(e) {
    this.isLoaded = false;
    const { predicates, dataValues } = e[0];
    const param = e[1];

    // switch (this.reportID) {
    //   case 'DMD001':
    //     this.getDashboardData(predicates, dataValues, param);
    //     break;
    //   default:
    //     break;
    // }

    this.isLoaded = true;

    this.detectorRef.detectChanges();
  }

  onActions(e) {
    alert('OK1');
    if (e.type == 'reportLoaded') {
      this.arrReport = e.data;
      if (this.arrReport.length) {
        let arrChildren: any = [];
        for (let i = 0; i < this.arrReport.length; i++) {
          arrChildren.push({
            title: this.arrReport[i].customName,
            path: 'tm/tmdashboard/' + this.arrReport[i].reportID,
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

  groupByStatus(field: string) {
    const lstField = [...new Set(this.dataset.map((item) => item[field]))];

    let result = [];

    for (let i = 0; i < lstField.length; i++) {
      let quantity = this.dataset.filter((data: OD_DispatchDashBoard) => {
        return data[field] === lstField[i];
      }).length;

      result.push({
        statusName: lstField[i],
        quantity: quantity,
      });
    }

    console.log(result);

    return result;
  }

  groupByOrgUnit(field: string = 'orgUnitName', type: string) {
    const lstField = [...new Set(this.dataset.map((item) => item[field]))];

    let result = [];

    for (let i = 0; i < lstField.length; i++) {
      let quantity = this.dataset.filter((data: OD_DispatchDashBoard) => {
        return data[field] === lstField[i] && data['dispatchType'] === type;
      }).length;

      result.push({
        orgUnitName: lstField[i],
        quantity: quantity,
      });
    }

    console.log(result);

    return result;
  }

  getDispatchsByType(type: string) {
    return this.dataset.filter((data: OD_DispatchDashBoard) => {
      return data.dispatchType === type;
    }).length;
  }

  getUrgencyDispatch(status: string = '') {
    return this.dataset.filter((data: OD_DispatchDashBoard) => {
      if (status === '3') {
        return (
          (data.urgency === '5' || data.urgency === '7') && data.status === '3'
        );
      } else {
        return (
          (data.urgency === '5' || data.urgency === '7') && data.status !== '3'
        );
      }
    }).length;
  }
}
