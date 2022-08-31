import { CodxTMService } from '../../codx-tm.service';
import { AuthStore, DataRequest, UIComponent } from 'codx-core';
import { Component, ViewChild, TemplateRef, Injector } from '@angular/core';
import { ViewModel } from 'codx-core';
import { ViewType } from 'codx-core';
@Component({
  selector: 'mydashboard',
  templateUrl: './mydashboard.component.html',
  styleUrls: ['./mydashboard.component.scss'],
})
export class MyDashboardComponent extends UIComponent {
  @ViewChild('content') content: TemplateRef<any>;
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
  views: Array<ViewModel> = [];

  //#region gauge
  tooltip: Object = {
    enable: true,
  };

  labelStyle: Object = {
    position: 'Inside',
    useRangeColor: true,
    font: {
      size: '0px',
      color: 'white',
      fontFamily: 'Roboto',
      fontStyle: 'Regular',
    },
  };

  majorTicks: Object = {
    height: 0,
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

  labelStyle1: Object = { position: 'Outside', font: { size: '13px' } };
  labelStyle2: Object = { position: 'Outside', font: { size: '0px' } };
  //#endregion gauge

  legendSettings1: Object = {
    position: 'Top',
    visible: true,
  };

  legendSettings2: Object = {
    position: 'Right',
    visible: true,
    textWrap: 'Wrap',
    height: '30%',
    width: '50%',
    shapeHeight: 7,
    shapeWidth: 7,
  };

  radius: Object = { topLeft: 10, topRight: 10 };

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
    this.tmService
      .getMyDBData(this.model, this.daySelected)
      .subscribe((res) => {
        this.data = res;
        console.log(this.data)
        this.detectorRef.detectChanges();
      });
  }

  onChangeValueSelectedWeek(data) {
    this.fromDate = this.toDate = data?.toDate;
    this.daySelected = data?.daySelected;
    this.daySelectedFrom = data?.daySelectedFrom;
    this.daySelectedTo = data?.daySelectedTo;
    this.week = data?.week;
    this.month = data?.month + 1;
    this.beginMonth = data?.beginMonth;
    this.endMonth = data?.endMonth;
    this.getGeneralData();
  }
}
