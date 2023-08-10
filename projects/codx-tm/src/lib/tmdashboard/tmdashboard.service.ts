import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { BG_Charts } from './models/chart.model';

@Injectable({
  providedIn: 'root',
})
export class TMDashboardService {
  constructor(private api: ApiHttpService) {}

  getReportsByModule(moduleID: string) {
    return this.api.execSv(
      'rptrp',
      'Codx.RptBusiness.RP',
      'ReportListBusiness',
      'GetReportsByModuleAsync',
      ['D', moduleID]
    );
  }

  getChartByReportID(reportID: string) {
    return this.api.execSv('BG', 'BG', 'ChartsBusiness', 'GetAsync', reportID);
  }

  createChart(reportID: string) {
    return this.api.execSv('BG', 'BG', 'ChartsBusiness', 'AddAsync', reportID);
  }
}
