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

  getParameterByPredicate(predicate, dataValue) {
    return this.api.execSv<Array<any>>(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetByPredicate',
      ['FormName=@0 && TransType=null', 'FDParameters']
    );
  }
}
