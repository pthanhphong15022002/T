import { AxisModel, ChartAreaModel } from '@syncfusion/ej2-angular-charts';
import { SeriesSetting } from 'codx-core';

export class BI_Charts {
  recID: string;
  dashboardID: string;
  location?: string;
  category?: string;
  chartType: string;
  chartName: string;
  chartSetting?: string;
  sourceType?: string;
  sourceName?: string;
  paraMapping?: string;
  isSystem?: string;
  isTemplate?: string;
  note?: string;
  userID?: string;
}

export class ChartSettings {
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

// export class
