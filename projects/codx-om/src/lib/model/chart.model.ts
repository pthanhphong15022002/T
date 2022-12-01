import { AxisModel, ChartAreaModel } from '@syncfusion/ej2-angular-charts';
import { SeriesSetting } from 'codx-core';

export class ChartData {
  title?: string;
  dataSource?: any;
  legendSetting?: Object;
  chartArea?: ChartAreaModel;
  marker?: Object;
  primaryXAxis?: AxisModel;
  primaryYAxis?: AxisModel;
  seriesSetting?: SeriesSetting[];
  service?: string;
  assembly?: string;
  className?: string;
  method?: string;
}
