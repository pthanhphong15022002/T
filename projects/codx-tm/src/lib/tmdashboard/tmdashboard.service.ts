import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { TM_DashBoard } from './models/TM_DashBoard';

@Injectable({
  providedIn: 'root',
})
export class TMDashboardService {
  dataset: BehaviorSubject<TM_DashBoard> = new BehaviorSubject<TM_DashBoard>(
    null
  );
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

  getReportSource(parameters) {
    return this.api.execSv(
      'rpttm',
      'Codx.RptBusiness.TM',
      'ReportBusiness',
      'GetReportSourceAsync',
      [parameters]
    );
  }

  getChartByReportID(reportID: string) {
    return this.api.execSv('BG', 'BG', 'ChartsBusiness', 'GetAsync', reportID);
  }

  createChart(reportID: string) {
    return this.api.execSv('BG', 'BG', 'ChartsBusiness', 'AddAsync', reportID);
  }
}
