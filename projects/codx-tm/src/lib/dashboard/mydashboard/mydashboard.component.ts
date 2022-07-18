import { CodxTMService } from '../../codx-tm.service';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, DataRequest, UIComponent } from 'codx-core';
import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  Injector,
  ViewEncapsulation,
} from '@angular/core';
import { SelectweekComponent } from 'projects/codx-share/src/lib/components/selectweek/selectweek.component';
import { GradientService } from '@syncfusion/ej2-angular-circulargauge';

@Component({
  selector: 'my-dashboard',
  templateUrl: './mydashboard.component.html',
  styleUrls: ['./mydashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [GradientService],
})
export class MyDashboardComponent extends UIComponent implements OnInit {
  @ViewChild('selectweek') selectweekComponent: SelectweekComponent;
  @ViewChild('tooltip') tooltip: TemplateRef<any>;
  formModel: string;
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
  taskOfDay: any;

  //#region gauge
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

  public labelStyle1: Object = { position: 'Outside', font: { size: '13px' } };
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

  public radius: Object = { topLeft: 10, topRight: 10 };

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
  //#endregion chartcolumn

  dbData: any;

  constructor(
    private inject: Injector,
    private auth: AuthStore,
    private tmService: CodxTMService,
    private activedRouter: ActivatedRoute
  ) {
    super(inject);
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    this.model = new DataRequest();
    this.model.formName = 'TMDashBoard';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.predicate = 'Owner=@0';
    this.model.dataValue = this.auth.get().userID;
    this.model.pageLoading = false;

    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.getGeneralData();
  }

  private getGeneralData() {
    this.tmService
      .getMyDBData(
        this.model,
        this.daySelectedFrom,
        this.daySelectedTo,
        this.fromDate,
        this.toDate,
        this.beginMonth,
        this.endMonth
      )
      .subscribe((res) => {
        this.dbData = res;
        console.log('MyDB', this.dbData);
      });

    this.api
      .execSv('TM', 'TM', 'ReportBusiness', 'GetTasksOfDayAsync', [
        this.model,
        this.fromDate,
        this.toDate,
      ])
      .subscribe((res: any) => {
        this.taskOfDay = res;
        console.log(this.taskOfDay);
      });
  }

  openTooltip() {
    console.log('mouse enter');
    this.callfc.openForm(this.tooltip, 'Đánh giá hiệu quả làm việc', 500, 700);
  }

  closeTooltip() {
    console.log('mouse leave');
  }

  onChangeValueSelectedWeek(data) {
    this.fromDate = data.fromDate;
    this.toDate = data.toDate;
    this.daySelected = data.daySelected;
    this.daySelectedFrom = data.daySelectedFrom;
    this.daySelectedTo = data.daySelectedTo;
    this.week = data.week;
    this.month = data.month + 1;
    this.beginMonth = data.beginMonth;
    this.endMonth = data.endMonth;
    this.getGeneralData();
    if (this.week != data.week) {
      this.week = data.week;
      this.getGeneralData();
    }
    if (this.month != data.month + 1) {
      this.month = data.month + 1;
      this.getGeneralData();
    }
  }
}
