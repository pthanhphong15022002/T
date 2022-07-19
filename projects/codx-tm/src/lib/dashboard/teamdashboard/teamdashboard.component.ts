import { map } from 'rxjs';
import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  Injector,
  inject,
} from '@angular/core';
import { GradientService } from '@syncfusion/ej2-angular-circulargauge';
import { RangeColorModel } from '@syncfusion/ej2-angular-progressbar';
import { AuthStore, DataRequest, UIComponent } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';
import { RemiderOnDay, TaskRemind } from '../../models/dashboard.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'team-dashboard',
  templateUrl: './teamdashboard.component.html',
  styleUrls: ['./teamdashboard.component.scss'],
  providers: [GradientService],
})
export class TeamDashboardComponent extends UIComponent implements OnInit {
  @ViewChild('tooltip') tooltip: TemplateRef<any>;
  formModel: string;
  funcID: string;
  model: DataRequest;
  taskRemind: TaskRemind = new TaskRemind();
  daySelected: Date;
  fromDate: Date;
  toDate: Date;
  daySelectedFrom: Date;
  daySelectedTo: Date;
  week: number;
  month: number;
  beginMonth: Date;
  endMonth: Date;
  remiderOnDay: RemiderOnDay[] = [];
  vlWork =  [];
  hrWork = [];
  user: any;
  tasksByEmp: any;

  public rangeColors: RangeColorModel[] = [
    { start: 0, end: 50, color: 'red' },
    { start: 50, end: 100, color: 'orange' },
  ];
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

  public data: object[] = [];

  dbData: any;

  constructor(
    private inject: Injector,
    private auth: AuthStore,
    private tmService: CodxTMService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.model = new DataRequest();
    this.user = this.auth.get();
    this.model.predicate = 'OrgUnitID = @0';
    this.model.dataValue = this.user.buid;
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
    this.getGeneralData();
  }

  private getGeneralData() {
    this.tmService
      .getTeamDBData(
        this.model,
        this.daySelectedFrom,
        this.daySelectedTo,
        this.fromDate,
        this.toDate,
        this.beginMonth,
        this.endMonth
      )
      .subscribe((res: any) => {
        console.log('TeamDB', res);
        this.dbData = res;
        this.piedata1 = res?.tasksByGroup;
        this.piedata2 = [
          {
            x: 'Chưa thực hiện',
            y: res?.newTasks,
          },
          {
            x: 'Đang thực hiên',
            y: res?.processingTasks,
          },
          {
            x: 'Hoàn tất',
            y: res?.doneTasks,
          },
          {
            x: 'Hoãn lại',
            y: res?.postponeTasks,
          },
          {
            x: 'Bị huỷ',
            y: res?.canceledTasks,
          },
        ];
        this.dataColumn = res?.dataBarChart.barChart;
        this.dataLine = res?.dataBarChart.lineChart;
        this.data = res?.tasksByGroup;
        res.tasksByEmp.map((data) => {
          let newTasks = 0;
          let processingTasks = 0;
          let doneTasks = 0;
          let postponeTasks = 0;
          let cancelTasks = 0;
          data.tasks.map((task) => {
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
            id: data.id,
            qtyTasks: data.qtyTasks,
            status: {
              new: newTasks / data.qtyTasks * 100,
              processing: processingTasks / data.qtyTasks * 100,
              done: doneTasks / data.qtyTasks * 100,
              postpone: postponeTasks / data.qtyTasks * 100,
              cancel: cancelTasks /data.qtyTasks * 100
            }
          })
        });
        this.detectorRef.detectChanges();
      });
  }
}
