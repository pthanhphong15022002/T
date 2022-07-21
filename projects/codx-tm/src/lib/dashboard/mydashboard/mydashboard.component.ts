import { CodxTMService } from '../../codx-tm.service';
import { AuthStore, DataRequest, UIComponent } from 'codx-core';
import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  Injector,
} from '@angular/core';
import { GradientService } from '@syncfusion/ej2-angular-circulargauge';

@Component({
  selector: 'mydashboard',
  templateUrl: './mydashboard.component.html',
  styleUrls: ['./mydashboard.component.scss'],
  providers: [GradientService],
})
export class MyDashboardComponent extends UIComponent implements OnInit {
  @ViewChild('tooltip') tooltip: TemplateRef<any>;
  model: DataRequest;
  funcID: string;
  user: any;
  data: any;
  taskOfDay: any;
  fromDate: Date;
  toDate: Date;
  daySelected: Date;
  daySelectedFrom: Date;
  daySelectedTo: Date;
  week: number;
  month: number;
  beginMonth: Date;
  endMonth: Date;

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
    this.model.predicate = 'Owner = @0';
    this.model.dataValue = this.user.userID;
  }

  onInit(): void {
    this.getGeneralData();
  }

  private getGeneralData() {
    this.tmService.getMyDBData(this.model).subscribe((res) => {
      this.data = res;
      console.log('MyDB', this.data);
      this.detectorRef.detectChanges();
    });
  }

  openTooltip() {
    this.callfc.openForm(this.tooltip, 'Đánh giá hiệu quả làm việc', 500, 700);
  }

  closeTooltip() {}

  onChangeValueSelectedWeek(data) {
    console.log('select', data);
    this.fromDate = this.toDate = data?.toDate;
    this.daySelected = data?.daySelected;
    this.daySelectedFrom = data?.daySelectedFrom;
    this.daySelectedTo = data?.daySelectedTo;
    this.week = data?.week;
    this.month = data?.month + 1;
    this.beginMonth = data?.beginMonth;
    this.endMonth = data?.endMonth;
    console.log(this.fromDate);
    console.log(this.toDate);
    console.log(this.daySelected);
    console.log(this.daySelectedFrom);
    console.log(this.daySelectedTo);
    console.log(this.week);
    console.log(this.month);
    console.log(this.endMonth);
    this.getGeneralData();
  }
}
