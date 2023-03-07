import { AfterViewInit, Component, Injector, Input } from '@angular/core';
import { DataRequest, UIComponent } from 'codx-core';

@Component({
  selector: 'count-chart',
  templateUrl: './count-chart.component.html',
  styleUrls: ['./count-chart.component.scss'],
})
export class CountChartComponent extends UIComponent implements AfterViewInit {
  randomKey: string;
  @Input() title: string;
  @Input() width: string;
  @Input() height: string;
  @Input() type: string;
  @Input() dataSource: any;
  @Input() service: string;
  @Input() assemblyName: string;
  @Input() className: string;
  @Input() method: string;
  @Input() request: DataRequest;
  @Input() value: number = 0;
  @Input() totalValue: number = 0;
  @Input() tooltip: string = '';
  @Input() hasIcon: boolean = false;
  @Input() iconUrl: string = 'assets/themes/tm/default/img/DB_Chuathuchien.svg';

  constructor(inject: Injector) {
    super(inject);
  }

  onInit(): void {
    this.randomKey = 'chart_' + this.newGuid();
    if (this.service && this.assemblyName && this.className && this.method) {
      this.api
        .execSv(
          this.service,
          this.assemblyName,
          this.className,
          this.method,
          this.request
        )
        .subscribe((res) => {
          this.dataSource = res;
          this.dataSource = JSON.parse(JSON.stringify(this.dataSource));
          //this.dataManager = new DataManager({ data: this.dataSource, adaptor: new JsonAdaptor() });
          // if (this.chart) {
          //   this.chart.series.forEach((item) => {
          //     item.dataSource = this.dataSource;
          //   });
          //   this.chart.dataSourceChange.emit(this.dataSource);
          //   this.chart.renderSeries();
          // }
          // if (this.pies) {
          //   this.pies.series.forEach((item) => {
          //     item.dataSource = this.dataSource;
          //   });
          //   this.pies.refreshSeries();
          // }
        });
    }
  }

  ngAfterViewInit(): void {}

  newGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
