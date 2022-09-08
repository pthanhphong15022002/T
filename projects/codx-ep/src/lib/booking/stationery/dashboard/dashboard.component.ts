import { Component, Injector } from '@angular/core';
import {
  ILoadedEventArgs as ChartArgs,
  ChartTheme,
} from '@syncfusion/ej2-angular-charts';
import { DataRequest, UIComponent } from 'codx-core';
import { EmitType } from '@syncfusion/ej2-base';
import {
  AnimationModel,
  ILoadedEventArgs as progressArgs,
  ProgressTheme,
} from '@syncfusion/ej2-angular-progressbar';

@Component({
  selector: 'codx-stationery-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class StationeryDashboardComponent extends UIComponent {
  statDayOfWeek = [];
  statUsedHoursOfResource = [];
  statEquipments = [];
  efficiency = 0;
  statEffenciencyOfResource = [];
  funcID: string;
  model: DataRequest;

  constructor(private inject: Injector) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        const { formName, gridViewName, entityName } = res;
        this.model = new DataRequest();
        this.model.funcID = 'EPT3'
        this.model.formName = formName;
        this.model.gridViewName = gridViewName;
        this.model.entityName = entityName;
        this.model.pageLoading = false;
        this.model.predicate = 'ResourceType=@0';
        this.model.dataValue = '6';
        this.loadChart(this.model);
      }
    });
  }

  loadChart(model) {
    this.api
      .callSv('EP', 'ERM.Business.EP', 'BookingsBusiness', 'BookingStatAsync', [
        model,
        null,
        null,
      ])
      .subscribe((res) => {
        this.statDayOfWeek = res.msgBodyData[0]['arrBookingsOnDay'];
        this.statEquipments = res.msgBodyData[0]['arrUsedHoursOfEquipment'];
        this.statUsedHoursOfResource =
          res.msgBodyData[0]['arrUsedHoursOfResource'];
        this.statEffenciencyOfResource =
          res.msgBodyData[0]['arrEffiecyUsedResource'];
        if (this.statEquipments.length > 0) {
          this.statEquipments.forEach((item) => {
            item.percent = Math.floor(Math.random() * 10);
            item.text = item.percent.toString() + '%';
          });
        }
        if (this.statUsedHoursOfResource.length > 0) {
          this.statUsedHoursOfResource.forEach((item) => {
            item.percent = Math.floor(Math.random() * 15);
            item.text = item.percent.toString() + '%';
          });
        }
        if (this.statEffenciencyOfResource.length > 0) {
          this.statEffenciencyOfResource.forEach((item) => {
            item.percent = Math.floor(Math.random() * 65);
          });
        }
        if (this.efficiency == 0) {
          this.efficiency = 80;
        }
      });
  }

  //Initializing Primary X Axis
  primaryXAxis: Object = {
    //Category in primary X Axis
    valueType: 'Category',
    majorGridLines: { width: 0 },
  };
  //Initializing Primary Y Axis
  primaryYAxis: Object = {
    rangePadding: 'None',
    minimum: 0,
    maximum: 100,
    interval: 20,
    lineStyle: { width: 0 },
    majorGridLines: { width: 0 },
  };
  chartArea: Object = {
    border: {
      width: 0,
    },
  };
  width: '100%';
  marker: Object = {
    visible: true,
    height: 10,
    width: 10,
  };
  tooltip: Object = {
    enable: true,
  };
  load(args: ChartArgs): void {
    let selectedTheme: string = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    if (args.chart) {
      args.chart.theme = <ChartTheme>(
        (
          selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)
        ).replace(/-dark/i, 'Dark')
      );
    }
  }
  loadProgress: EmitType<progressArgs> = (args: progressArgs) => {
    let selectedTheme: string = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    args.progressBar.theme = <ProgressTheme>(
      (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1))
        .replace(/-dark/i, 'Dark')
        .replace(/contrast/i, 'Contrast')
    );
    if (args.progressBar.element.id === 'label-container') {
      // tslint:disable-next-line:max-line-length
      args.progressBar.annotations[0].content =
        '<div id="point1" class="plabeltxt" style="color: #e91e63;font-size:25px ">Hiệu Suất</div>';
    } else if (args.progressBar.element.id === 'download-container') {
      args.progressBar.annotations[0].content =
        '<img src="./assets/progressbar/' +
        selectedTheme.replace(/-/i, '') +
        '-Download.svg"></img>';
    } else {
      args.progressBar.annotations[0].content =
        '<img src="./assets/progressbar/' +
        selectedTheme.replace(/-/i, '') +
        '-pause.svg"></img>';
    }
  };
  public title: string =
    'Thống kê số lượng booking theo phòng (đơn vị tính: lần)';
  titleBar: string = 'Top 10 phòng ban sử dụng nhiều nhất';
  public legendSettings: Object = {
    visible: true,
    position: 'Right',
  };
  //Initializing DataLabel
  public dataLabel: Object = {
    visible: true,
    name: 'text',
    position: 'Inside',
    font: {
      fontWeight: '600',
      color: '#ffffff',
    },
  };
  public animation: AnimationModel = { enable: true, duration: 2000, delay: 0 };
  public trackThickness: number = 24;
  public progressThickness: number = 24;
  public data: Object[] = [
    { x: 'DSC', y: 25 },
    { x: 'BSC', y: 46 },
    { x: 'VPT', y: 30 },
    { x: 'HFD', y: 31 },
    { x: 'VSC', y: 25 },
    { x: 'BVC', y: 46 },
    { x: 'VPH', y: 30 },
    { x: 'HBD', y: 31 },
    { x: 'VVI', y: 30 },
    { x: 'NRD', y: 31 },
  ];
  public legendSettings1: Object = {
    visible: false,
  };
}
