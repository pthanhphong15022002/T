import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class CodxDashboardService {
  constructor(private api: ApiHttpService) {}

  getDashboardByID(recID: string) {
    return this.api.execSv(
      'rptrp',
      'Codx.RptBusiness.RP',
      'ReportListBusiness',
      'GetAsync',
      recID
    );
  }
}
