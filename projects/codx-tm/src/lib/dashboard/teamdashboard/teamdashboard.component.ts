import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  Injector,
} from '@angular/core';
import { GradientService } from '@syncfusion/ej2-angular-circulargauge';
import { RangeColorModel } from '@syncfusion/ej2-angular-progressbar';
import { AuthStore, DataRequest, UIComponent } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';

@Component({
  selector: 'teamdashboard',
  templateUrl: './teamdashboard.component.html',
  styleUrls: ['./teamdashboard.component.scss'],
  providers: [GradientService],
})
export class TeamDashboardComponent extends UIComponent implements OnInit {
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
  user: any;
  isDesc: boolean = true;
  availability: number = 0;
  performance: number = 0;
  quality: number = 0;
  kpi: number = 0;
  tasksByGroup: object;
  status: any = {
    doneTasks: 0,
    overdueTasks: 0,
  };
  piedata: any;
  dataBarChart: any = {};
  rateDoneTaskOnTime: number = 0;
  qtyTasks: number = 0;
  vlWork = [];
  hrWork = [];

  rangeColors: RangeColorModel[] = [
    { start: 0, end: 50, color: 'red' },
    { start: 50, end: 100, color: 'orange' },
  ];
  isGradient: boolean = true;

  //#region gauge
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
  //#endregion gauge

  legendSettings1: Object = {
    position: 'Top',
    visible: true,
  };

  legendSettings2: Object = {
    position: 'Right',
    visible: true,
  };

  //#endregion gauge

  legendSettings: Object = {
    position: 'Top',
    visible: true,
  };
  legendRateDoneSettings: Object = {
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
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
    this.model.predicate = 'OrgUnitID = @0';
    this.model.dataValue = this.user.buid;
  }

  onInit(): void {
    this.getGeneralData();
  }

  private getGeneralData() {
    this.tmService.getTeamDBData(this.model).subscribe((res: any) => {
      if (res) {
        this.availability = res.efficiency.availability.toFixed(2);
        this.performance = res.efficiency.performance.toFixed(2);
        this.quality = res.efficiency.quality.toFixed(2);
        this.kpi = res.efficiency.kpi.toFixed(2);
        this.tasksByGroup = res.tasksByGroup;
        this.status = res.status;
        this.dataBarChart = res.dataBarChart;
        this.rateDoneTaskOnTime = res.rateDoneTaskOnTime.toFixed(2);
        this.qtyTasks = res.qtyTasks;
        this.piedata = [
          {
            x: 'Chưa thực hiện',
            y: res.status.newTasks,
          },
          {
            x: 'Đang thực hiên',
            y: res.status.processingTasks,
          },
          {
            x: 'Hoàn tất',
            y: res.status.doneTasks,
          },
          {
            x: 'Hoãn lại',
            y: res.status.postponeTasks,
          },
          {
            x: 'Bị huỷ',
            y: res.status.canceledTasks,
          },
        ];
        res.vltasksByEmp.map((task) => {
          let newTasks = 0;
          let processingTasks = 0;
          let doneTasks = 0;
          let postponeTasks = 0;
          let cancelTasks = 0;
          task.tasks.map((task) => {
            switch (task.status) {
              case '1':
                newTasks = newTasks + 1;
                break;
              case '2':
                processingTasks = processingTasks + 1;
                break;
              case '9':
                doneTasks = doneTasks + 1;
                break;
              case '5':
                postponeTasks = postponeTasks + 1;
                break;
              case '8':
                cancelTasks = cancelTasks + 1;
                break;
            }
          });
          this.vlWork.push({
            id: task.id,
            qtyTasks: task.qtyTasks,
            status: {
              new: (newTasks / task.qtyTasks) * 100,
              processing: (processingTasks / task.qtyTasks) * 100,
              done: (doneTasks / task.qtyTasks) * 100,
              postpone: (postponeTasks / task.qtyTasks) * 100,
              cancel: (cancelTasks / task.qtyTasks) * 100,
            },
          });
        });
        this.hrWork = res.hoursByEmp;
        this.detectorRef.detectChanges();
      }
    });
  }

  sort() {
    this.isDesc = !this.isDesc;
    this.vlWork = this.vlWork.reverse();
    this.hrWork = this.hrWork.reverse();
    this.detectorRef.detectChanges();
  }
}
