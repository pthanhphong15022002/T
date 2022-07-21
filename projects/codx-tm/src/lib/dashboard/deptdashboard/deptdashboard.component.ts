import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { GradientService } from '@syncfusion/ej2-angular-circulargauge';
import { AuthStore, DataRequest, UIComponent } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';
import { ViewChild } from '@angular/core';
import { TemplateRef } from '@angular/core';
import {
  AnimationModel,
  ILoadedEventArgs,
  ProgressTheme,
  RangeColorModel,
} from '@syncfusion/ej2-angular-progressbar';

@Component({
  selector: 'deptdashboard',
  templateUrl: './deptdashboard.component.html',
  styleUrls: ['./deptdashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [GradientService],
})
export class DeptDashboardComponent extends UIComponent implements OnInit {
  @ViewChild('tooltip') tooltip: TemplateRef<any>;
  funcID: string;
  model: DataRequest;
  daySelected: Date;
  fromDate: Date;
  toDate: Date;
  daySelectedFrom: Date;
  daySelectedTo: Date;
  week: number;
  month: number;
  beginMonth: Date;
  endMonth: Date;
  vlWork = [];
  hrWork = [];
  user: any;
  tasksByEmp: any;
  isDesc: boolean = true;
  public data: object[] = [];

  dbData: any;

  top3: any;
  groups: any;

  public animation: AnimationModel = { enable: true, duration: 2000, delay: 0 };


  public isGradient: boolean = true;

  //#region gauge
  public font1: Object = {
    size: '15px',
    color: '#00CC66',
  };
  public rangeWidth: number = 25;
  //Initializing titleStyle
  public titleStyle: Object = { size: '18px' };
  public font2: Object = {
    size: '15px',
    color: '#fcde0b',
  };
  public rangeLinearGradient1: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#5465FF', offset: '0%', opacity: 0.9 },
      { color: '#04DEB7', offset: '90%', opacity: 0.9 },
    ],
  };

  public rangeLinearGradient2: Object = {
    startValue: '0%',
    endValue: '100%',
    colorStop: [
      { color: '#FF8008', offset: '0%', opacity: 0.9 },
      { color: '#FFC837', offset: '90%', opacity: 0.9 },
    ],
  };

  public minorTicks: Object = {
    width: 0,
  };

  public majorTicks1: Object = {
    position: 'Outside',
    height: 1,
    width: 1,
    offset: 0,
    interval: 30,
  };
  public majorTicks2: Object = {
    height: 0,
  };

  public lineStyle: Object = {
    width: 0,
  };

  public labelStyle1: Object = { position: 'Outside', font: { size: '8px' } };
  public labelStyle2: Object = { position: 'Outside', font: { size: '0px' } };
  //#endregion gauge

  public legendSettings1: Object = {
    position: 'Top',
    visible: true,
  };

  public legendSettings2: Object = {
    position: 'Right',
    visible: true,
  };

  //#endregion gauge

  public piedata1: any;
  public piedata2: Object[];
  public legendSettings: Object = {
    position: 'Top',
    visible: true,
  };
  public legendRateDoneSettings: Object = {
    visible: true,
  };

  openTooltip() {
    console.log('mouse enter');
    this.callfc.openForm(this.tooltip, 'Đánh giá hiệu quả làm việc', 500, 700);
  }

  closeTooltip() {
    console.log('mouse leave');
  }

  //#region chartcolumn
  dataColumn: Object[] = [];
  dataLine: Object[] = [];
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

  public headerText: Object = [
    { text: 'Khối lượng công việc' },
    { text: 'Thời gian thực hiện' },
  ];

  constructor(
    private inject: Injector,
    private auth: AuthStore,
    private tmService: CodxTMService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
    this.user = this.auth.get();
    this.model = new DataRequest();
    this.model.predicate = 'DepartmentID = @0';
    this.model.dataValue = this.user.employee?.departmentID;
    this.model.predicates = 'OrgUnitID = @0';
    this.model.dataValues = this.user.buid;
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
  }

  onInit(): void {
    this.getGeneralData();
    this.top3 = [
      { name: 'Lê Phạm Hoài Thương', role: 'BA', kpi: 123 },
      { name: 'Nguyễn Hoàng Bửu', role: 'Dev', kpi: 120 },
      { name: 'Nguyễn Ngọc Phú Sỹ', role: 'Dev', kpi: 119 },
    ];
    this.groups = [
      { id: '', name: 'Nhóm kiểm tra chất lượng', rate: 70 },
      { id: '', name: 'Nhóm phát triển web', rate: 95 },
      { id: '', name: 'Nhóm phát triển mobile', rate: 50 },
    ];
  }

  private getGeneralData() {
    this.tmService.getDeptDBData(this.model).subscribe((res) => {
      console.log(res);
    });
  }

  sort() {
    this.isDesc = !this.isDesc;
  }
}
