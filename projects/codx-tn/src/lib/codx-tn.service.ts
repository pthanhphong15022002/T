import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { tmp_Modules } from './model/tmpModule.model';

@Injectable({
  providedIn: 'root',
})
export class CodxTnService {
  constructor(private api: ApiHttpService) {}

  getDefaultSetting() {
    return this.api.execSv(
      'Tenant',
      'ERM.Business.Tenant',
      'TenantsBusiness',
      'GetTenantDefaultSettingAsync',
      []
    );
  }

  BuyModules(mode, module: tmp_Modules, months: number) {
    return this.api.execSv(
      'Tenant',
      'ERM.Business.Tenant',
      'OrdersBusiness',
      'BuyModulesAsync',
      [mode, module, months]
    );
  }
}
