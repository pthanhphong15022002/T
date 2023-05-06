import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { RangeColorModel } from '@syncfusion/ej2-angular-progressbar';
import { AuthStore, DataRequest, UIComponent } from 'codx-core';
import { CodxTMService } from '../../../codx-tm.service';
import { StatusTask } from '../../../models/enum/enum';

@Component({
  selector: 'codx-sprintdetails-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('tooltip') tooltip: TemplateRef<any>;
  @Input() projectID?: any;
  @Input() resources?: any;
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
  data: any;
  isDesc: boolean = true;
  availability: number = 0;
  performance: number = 0;
  quality: number = 0;
  kpi: number = 0;
  kpiTop =[] ;
  top = 3 ;
  tasksByGroup: object;
  status: any = {
    doneTasks: 0,
    overdueTasks: 0,
  };
  piedata: any;
  dataBarChart: any = {};
  rateDoneTaskOnTime: number = 0;
  rateDoneTask: number = 0;
  qtyTasks: number = 0;
  vltasksByGroup = [];
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
    this.callfc.openForm(this.tooltip, 'Đánh giá hiệu quả làm việc', 500, 700);
  }

  closeTooltip() {}

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
  }

  onInit(): void {
    // this.getGeneralData();
  }
  ngAfterViewInit(): void {
    this.model = new DataRequest();
    this.model.pageLoading = false;
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    var projectID = this.projectID ? this.projectID : null;
    var resources = this.resources; //replaceAll(';', ',');
    if (projectID == null) {
      this.model.predicates =
        '(Category=@0 or Category=@1)and @2.Contains(Owner) and ProjectID = null';
      this.model.dataValues = '1;2;[' + resources + ']';
    } else {
      this.model.predicates =
        '(Category=@0 or Category=@1)and @2.Contains(Owner) and ProjectID=@3';
      this.model.dataValues = '1;2;[' + resources + '];' + projectID;
    }
    if(resources == null) return ;
    this.getGeneralData();
  }

  private getGeneralData() {
    this.tmService
      .getResourceAndProjectDBData(this.model)
      .subscribe((res: any) => {
        if (res) {
          const {
            status,
            efficiency,
            qtyTasks,
            rateDoneTaskOnTime,
            rateDoneTask,
            tasksByGroup,
            vltasksByGroup,
            kpiTop,
            dataBarChart,
            vltasksByEmp,
            hoursByEmp,
          } = res;
          this.data = res;
          this.availability = efficiency.availability.toFixed(2);
          this.performance = efficiency.performance.toFixed(2);
          this.quality = efficiency.quality.toFixed(2);
          this.kpi = efficiency.kpi.toFixed(2);
          this.tasksByGroup = tasksByGroup;
          this.status = status;
          this.dataBarChart = dataBarChart;
          this.rateDoneTaskOnTime = rateDoneTaskOnTime.toFixed(2);
          this.rateDoneTask = rateDoneTask.toFixed(2);
          this.qtyTasks = qtyTasks;
          this.piedata = [
            {
              x: 'Chưa thực hiện',
              y: status.newTasks,
            },
            {
              x: 'Đang thực hiên',
              y: status.processingTasks,
            },
            {
              x: 'Hoàn tất',
              y: status.doneTasks,
            },
            {
              x: 'Hoãn lại',
              y: status.postponeTasks,
            },
            {
              x: 'Bị huỷ',
              y: status.canceledTasks,
            },
          ];
          if (vltasksByGroup != null){
            vltasksByGroup.map((task) => {
              let newTasks = 0;
              let processingTasks = 0;
              let doneTasks = 0;
              let postponeTasks = 0;
              let cancelTasks = 0;
              task.tasks.map((task) => {
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
              this.vltasksByGroup.push({
                taskGroupName: task.taskGroupName,
                qtyTasks: task.qtyTasks,
                percentage:task.percentage,
                status: {
                  new: (newTasks / task.qtyTasks) * 100,
                  processing: (processingTasks / task.qtyTasks) * 100,
                  done: (doneTasks / task.qtyTasks) * 100,
                  postpone: (postponeTasks / task.qtyTasks) * 100,
                  cancel: (cancelTasks / task.qtyTasks) * 100,
                },
              });
            });
          }
        
          vltasksByEmp.map((task) => {
            let newTasks = 0;
            let processingTasks = 0;
            let doneTasks = 0;
            let postponeTasks = 0;
            let cancelTasks = 0;
            task.tasks.map((task) => {
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
              id: task.id,
              employeeName: task.employeeName,
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
          this.hrWork = hoursByEmp;
          kpiTop.map((element) => {
             this.kpiTop.push({
              id: element.id,
              employeeName: element.employeeName,
              positionName : element.positionName,
              kpi : element.efficiency.kpi.toFixed(2)
             })
          })
          this.kpiTop =  this.kpiTop.sort(function(a ,b){return b.kpi - a.kpi})
          if(this.top > this.kpiTop.length ){
              this.top = this.kpiTop.length ;
          }
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
