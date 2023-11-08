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
  kpiTop = [];
  top = 3;
  status: any = {
    doneTasks: 0,
    overdueTasks: 0,
  };
  piedata: any;
  dataBarChart: any = {};
  rateDoneTaskOnTime: number = 0;
  rateDoneTask: number = 0;
  qtyTasks: number = 0;
  tasksByGroup: object;
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
    visible: false,
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
    { text: 'Hiệu quả làm việc' },
  ];

  //count statistical
  statistical = {
    overdueTasks: 0,
    newTasks: 0,
    processingTasks: 0,
    completed: 0,
    canceledTasks: 0,
  };
  lstVllTasks = [];
  //end

  //chart accumulationchart
  centerLabel: {};
  lstTaskByTGroups: Object[] = [];
  //end
  loadedDefault: boolean;
  loaded: boolean;
  constructor(
    private inject: Injector,
    private auth: AuthStore,
    private tmService: CodxTMService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
    this.user = this.auth.get();
    this.getDefaultData();
  }

  getDefaultData(){
    this.loadedDefault = false;
    this.cache.valueList('TM004').subscribe((res) => {
      if(res && res.datas){
        this.lstVllTasks = res.datas;
      }
      this.loadedDefault = true;
    });
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
    if (resources == null) return;
    this.setTimeOut(100);
  }

  private getGeneralData() {
    this.tmService.getDataDetailsDashboard(this.model).subscribe((res: any) => {
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
        if (vltasksByGroup != null) {
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
              percentage: task.percentage,
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
            positionName: element.positionName,
            kpi: element.efficiency.kpi.toFixed(2),
          });
        });
        this.kpiTop = this.kpiTop.sort(function (a, b) {
          return b.kpi - a.kpi;
        });
        if (this.top > this.kpiTop.length) {
          this.top = this.kpiTop.length;
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

  //#region get data list not yet calculation
  setTimeOut(deley){
    setTimeout(() => {
      if(this.loadedDefault){
        this.getDataDetailsDashboard();
      }else{
        deley += 100;
        this.setTimeOut(deley);
      }
    }, deley);
  }
  getDataDetailsDashboard() {
    this.loaded = false;
    this.tmService.getDataDetailsDashboard(this.model).subscribe((res: any) => {
      if (res) {
        const tasks = res[0];
        const taskGroups = res[1];
        const employees = res[2];

        //calculation dashboard
        this.countStatistical(tasks);
        //taskgroups
        this.countTaskByTaskGroups(tasks, taskGroups);

        this.detectorRef.detectChanges();
      } else {
        //calculation dashboard
        this.countStatistical();
        //taskgroups
        this.countTaskByTaskGroups();
      }
      setTimeout(() => {
        this.loaded = true;
      }, 500);
    });
  }
  //#endregion

  //#region calculation dashboard
  countStatistical(tasks = []) {
    const now = new Date();
    if (tasks != null && tasks.length > 0) {
      //Đã quá hạn
      var tmp = {};
      this.statistical['overdueTasks'] = tasks.filter(
        (x) =>
          (x.status == '00' || x.status == '10' || x.status == '20') &&
          x.dueDate != null &&
          now >
            new Date(
              new Date(x.dueDate).setDate(new Date(x.dueDate).getDate() + 1)
            )
      ).length;

      //Chưa thực hiện
      this.statistical['newTasks'] = tasks.filter(
        (x) => x.status == '10'
      ).length;

      //Đang thực hiện
      this.statistical['processingTasks'] = tasks.filter(
        (x) => x.status == '20'
      ).length;

      //Hoàn tất
      this.statistical['completed'] = tasks.filter(
        (x) => x.status == '90'
      ).length;

      //Hoãn lại
      this.statistical['canceledTasks'] = tasks.filter(
        (x) => x.status == '50'
      ).length;
    }
  }

  getColors(value, type){
    let data = this.lstVllTasks.find(x => x.value == value);
    return data[type];
  }
  //#endregion

  //#region dashboard task groups
  countTaskByTaskGroups(tasks = [], taskGroups = []) {
    let sum = 0;
    for (var item of taskGroups) {
      let tmp = {};
      tmp['x'] = item?.taskGroupID;
      tmp['taskGroupName'] = item?.taskGroupName;
      let countTasksByTGs = 0;
      countTasksByTGs = tasks.filter(
        (x) => x.taskGroupID == item.taskGroupID
      ).length;
      tmp['countTasks'] = countTasksByTGs;
      tmp['y'] = 0;
      sum += countTasksByTGs;
      this.lstTaskByTGroups.push(tmp);
    }
    this.lstTaskByTGroups.forEach((item) => {
      item['y'] =
        Math.round(sum) > 0
          ? Math.round((item?.['countTasks'] / sum) * 100)
          : 100 / this.lstTaskByTGroups.length;
    });
    this.centerLabel ={text: sum + '<br>' + 'Công việc'} ;
  }

  formatCrrView(e) {
    if (e && e?.point) {
      let data = this.lstTaskByTGroups.find(
        (x) => x['x'] == e?.point?.x
      );
      if (data) {
        e.point.tooltip =
          data['taskGroupName'] + ': <b>' + data['countTasks'] + '</b>';
      }
    }
  }
  //#endregion
}
