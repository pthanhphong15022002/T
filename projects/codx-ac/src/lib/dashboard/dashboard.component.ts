import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  AuthStore,
  ButtonModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'lib-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent extends UIComponent {
  @ViewChild('template') template?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [{
    id: 'btnAdd',
  }];

  user: any;
  chartData = [
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
  public data: Object[] = [
    { Browser: 'Chrome', Users: 59.28, DataLabelMappingName: 'Chrome: 59.28%' },
    { Browser: 'Safari', Users: 4.73, DataLabelMappingName: 'Safari: 4.73%' },
    { Browser: 'Opera', Users: 6.12, DataLabelMappingName: 'Opera: 6.12%' },
    { Browser: 'Edge', Users: 7.48, DataLabelMappingName: '  Edge: 7.48%' },
    {
      Browser: 'Others',
      Users: 22.39,
      DataLabelMappingName: '  Others: 22.39%',
    },
  ];
  public dataLabel: Object = {
    visible: true,
    position: 'Outside',
    name: 'DataLabelMappingName',
    font: {
      fontWeight: '600',
    },
    connectorStyle: { length: '20px', type: 'Curve' },
  };
  public primaryXAxis?: Object;
  public title?: string;
  primaryYAxis: any;
  public legendSettings: Object = {
    visible: false,
  };
  constructor(inject: Injector, private authstore: AuthStore) {
    super(inject);
    this.user = this.authstore.get();
  }
  //#region Constructor

  //#region Init
  onInit(): void {
    this.primaryXAxis = {
      valueType: 'Category',
      title: 'Voucher',
    };
  }

  ngAfterViewInit(): void {
    this.codxService.setStyleToolbarLayout(this.view.elementRef.nativeElement, 'toolbar2');
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
  }
  //#region Init

  //#region Events
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(e, data);
        break;
    }
  }

  click(e, data) {}
  //#region Events

  //#region Method
  add(e): void {}

  edit(e, data): void {}

  copy(e, data): void {}

  delete(data): void {}
  //#region Method
}
