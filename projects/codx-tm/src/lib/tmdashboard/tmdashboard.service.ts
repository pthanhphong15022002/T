import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class TMDashboardService {
  constructor(private api: ApiHttpService) {}

  loadCharts(reportID: string) {
    return this.api.execSv(
      'BI',
      'ChartsBusiness',
      'GetChartsByDashboardIDAsync',
      reportID
    );
  }
}
