import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  ApiHttpService,
  DataRequest,
  SeriesSetting,
  UIComponent,
} from 'codx-core';

class Data {
  employee: any;
  value: number;
}

@Component({
  selector: 'top-chart',
  templateUrl: './top-chart.component.html',
  styleUrls: ['./top-chart.component.scss'],
})
export class TopChartComponent implements OnInit, OnChanges, AfterViewInit {
  employees: Data[] = [];
  num = 1;
  randomKey: string;
  //chart
  @Input() title: string;
  @Input() type: string;
  @Input() width: string;
  @Input() height: string;
  @Input() primaryXAxis: Object;
  @Input() primaryYAxis: Object;
  @Input() legendSettings: Object;
  //series
  @Input() seriesSetting: SeriesSetting[];
  @Input() dataSource: any;
  @Input() service: string;
  @Input() assemblyName: string;
  @Input() className: string;
  @Input() method: string;
  @Input() request: DataRequest;

  //Tooltip
  @Input() enableTooltip: boolean;
  @Input() tooltip: Object;

  constructor(private api: ApiHttpService) {}

  ngOnInit(): void {
    this.randomKey = 'chart_' + this._newGuid();
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

  ngOnChanges(changes: SimpleChanges) {}

  ngAfterViewInit(): void {}

  load(args) {
    let selectedTheme = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    args.chart.theme = (
      selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)
    ).replace(/-dark/i, 'Dark');
  }

  loaded(args) {
    if (args.chart.series && args.chart.series.length > 0) {
      args.chart.series.forEach((item) => {
        var _a, _b, _c;
        item.fill = item.series[0].fill ? item.series[0].fill : '#00bdae';
        (_a = item.seriesElement) === null || _a === void 0
          ? void 0
          : _a.setAttribute('fill', item.fill);
        if (!item.marker.isFilled) {
          (_b = item.symbolElement) === null || _b === void 0
            ? void 0
            : _b.childNodes.forEach((ele) =>
                ele.setAttribute(
                  'fill',
                  item.marker.fill ? item.marker.fill : '#fff'
                )
              );
        } else {
          (_c = item.symbolElement) === null || _c === void 0
            ? void 0
            : _c.childNodes.forEach((ele) =>
                ele.setAttribute('fill', item.fill)
              );
        }
      });
    }
  }

  seriesRender(args, component) {
    // if (args.series && args.series.series.length > 0) {
    //     if (!args.series.palettes)
    //         args.series.palettes = [];
    //     for (let i = 0; i < args.series.series.length; i++) {
    //         let type = args.series.series[i].type;
    //         let setting = this.seriesSetting.filter((s) => s.type == type)[0];
    //         if (setting) {
    //             for (let ix in setting) {
    //                 args.series.series[i][ix] = setting[ix];
    //                 //args.series[ix] = (setting as any)[ix];
    //             }
    //         }
    //     }
    // }
  }

  refresh() {
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
  }

  onAnimationComplete(args) {
    let centerTitle = document.getElementById('center_title');
    if (centerTitle) {
      centerTitle.style.fontSize = this._getFontSize(
        args.accumulation.initialClipRect.width
      );
      let rect = centerTitle.getBoundingClientRect();
      centerTitle.style.top =
        args.accumulation.origin.y +
        args.accumulation.element.offsetTop -
        rect.height / 2 +
        'px';
      centerTitle.style.left =
        args.accumulation.origin.x +
        args.accumulation.element.offsetLeft -
        rect.width / 2 +
        'px';
      centerTitle.style.visibility = 'visible';
      args.accumulation.visibleSeries &&
        args.accumulation.visibleSeries.forEach((item) => {
          let points = item.points;
          for (let point of points) {
            if (point.labelPosition === 'Outside' && point.labelVisible) {
              let label = document.getElementById(
                'donut-container_datalabel_Series_0_text_' + point.index
              );
              label === null || label === void 0
                ? void 0
                : label.setAttribute('fill', 'black');
            }
          }
        });
    }
  }

  private _newGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  private _getFontSize(width): string {
    if (width > 300) {
      return '13px';
    } else if (width > 250) {
      return '8px';
    } else {
      return '6px';
    }
  }
}
