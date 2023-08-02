import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { BG_Charts } from './models/chart.model';

@Injectable({
  providedIn: 'root',
})
export class TMDashboardService {
  constructor(private api: ApiHttpService) {}

  loadCharts(reportID: string) {
    return this.api.execSv(
      'BG',
      'BG',
      'ChartsBusiness',
      'GetByReportIDAsync',
      reportID
    );
  }
}
