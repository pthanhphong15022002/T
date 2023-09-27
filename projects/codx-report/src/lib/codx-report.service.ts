import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class CodxReportService {
  constructor(private api: ApiHttpService) {}

  bookmark(recID: string) {
    return this.api.execSv(
      'rptrp',
      'Codx.RptBusiness.RP',
      'ReportBusiness',
      'BookmarkAsync',
      [recID]
    );
  }
}
