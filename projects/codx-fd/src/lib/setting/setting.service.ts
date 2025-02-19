import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  dataUpdate = new BehaviorSubject<any>(null);

  constructor(private api: ApiHttpService) {}

  getParameter() {
    return this.api.execSv<Array<any>>(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetByPredicate',
      ['FormName=@0 && TransType=null', 'FDParameters']
    );
  }

  getSettingByPredicate(predicate, dataValue) {
    return this.api.execSv<Array<any>>(
      'SYS',
      'ERM.Business.SYS',
      'SettingsBusiness',
      'GetByPredicate',
      [predicate, dataValue]
    );
  }

  setLabelsValue(formname, category, newValue) {
    let data = [formname, category, newValue];
    return this.api.execSv(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'UpdateModule_ParamsAsync',
      data
    );
  }
}
