import {
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { GradientService } from '@syncfusion/ej2-angular-circulargauge';
import {
  AuthStore,
  DataRequest,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';
import { AnimationModel } from '@syncfusion/ej2-angular-progressbar';
import { StatusTask } from '../../models/enum/enum';

@Component({
  selector: 'compdashboard',
  templateUrl: './compdashboard.component.html',
  styleUrls: ['./compdashboard.component.scss'],
  providers: [GradientService],
})
export class CompDashboardComponent extends UIComponent implements OnInit {
  @ViewChild('content') content: TemplateRef<any>;
  views: Array<ViewModel> = [];
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
  tasksByGroup: object;
  tasksByOrgUnit: object;
  status: any = {
    doneTasks: 0,
    overdueTasks: 0,
  };
  dataBarChart: any = {};
  vlWork = [];
  hrWork = [];
  topEmps: [];
  lastEmps: [];
  user: any;
  tasksByEmp: any;
  isDesc: boolean = true;
  data: any;
  dbData: any;
  isTopEmp: boolean = true;
  groups: any;

  animation: AnimationModel = { enable: true, duration: 2000, delay: 0 };

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
  //#region gauge

  legendSettings1: Object = {
    position: 'Top',
    visible: true,
  };

  legendSettings2: Object = {
    position: 'Right',
    visible: true,
  };

  //#endregion gauge

  piedata1: any;
  piedata2: Object[];
  legendSettings: Object = {
    position: 'Top',
    visible: true,
  };
  legendRateDoneSettings: Object = {
    position: 'Right',
    visible: true,
    textWrap: 'Wrap',
    height: '30%',
    width: '50%',
  };

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

  headerText: Object = [
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
    console.log(this.user);
    this.model = new DataRequest();
    this.model.predicate = 'CompanyID = @0';
    this.model.dataValue = this.user.employee?.companyID;
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
  }

  onInit(): void {
    this.getGeneralData();
    this.groups = [];
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
    this.detectorRef.detectChanges();
  }

  private getGeneralData() {
    this.tmService.getCompDBData(this.model).subscribe((res: any) => {
      const {
        tasksByGroup,
        taskByOrgUnitWithName,
        status,
        dataBarChart,
        orgUnitRateDoneWithName,
        vltasksByOrgUnitWithName,
        hoursByOrgUnitWithName,
        topEmps,
        lastEmps,
      } = res;
      this.tasksByGroup = tasksByGroup;
      this.tasksByOrgUnit = taskByOrgUnitWithName;
      this.status = status;
      this.dataBarChart = dataBarChart;
      vltasksByOrgUnitWithName.map((data) => {
        let newTasks = 0;
        let processingTasks = 0;
        let doneTasks = 0;
        let postponeTasks = 0;
        let cancelTasks = 0;
        data.tasks.map((task) => {
          switch (task.status) {
            case StatusTask.New:
              newTasks = newTasks + 1;
              break;
            case StatusTask.Processing:
              processingTasks = processingTasks + 1;
              break;
            case StatusTask.Done:
              doneTasks = doneTasks + 1;
              break;
            case StatusTask.Postpone:
              postponeTasks = postponeTasks + 1;
              break;
            case StatusTask.Cancelled:
              cancelTasks = cancelTasks + 1;
              break;
          }
        });
        this.vlWork.push({
          id: data.id,
          orgUnitName: data.orgUnitName,
          qtyTasks: data.qtyTasks,
          status: {
            new: (newTasks / data.qtyTasks) * 100,
            processing: (processingTasks / data.qtyTasks) * 100,
            done: (doneTasks / data.qtyTasks) * 100,
            postpone: (postponeTasks / data.qtyTasks) * 100,
            cancel: (cancelTasks / data.qtyTasks) * 100,
          },
        });
      });
      this.hrWork = hoursByOrgUnitWithName;
      this.groups = orgUnitRateDoneWithName;
      this.topEmps = topEmps;
      this.lastEmps = lastEmps;
      this.detectorRef.detectChanges();
    });
  }

  sort() {
    this.isDesc = !this.isDesc;
    this.vlWork = this.vlWork.reverse();
    this.hrWork = this.hrWork.reverse();
    this.detectorRef.detectChanges();
  }

  switchEmp() {
    this.isTopEmp = !this.isTopEmp;
    this.detectorRef.detectChanges();
  }
}
