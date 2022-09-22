import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiHttpService, TenantStore, CacheService } from 'codx-core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxFdService {
  form = '';
  datafunction = null;
  type = '';
  listview: any;
  tableview: any;
  active = '';
  tenant: string;
  private title = new BehaviorSubject<any>(null);
  constructor(
    private api: ApiHttpService,
    private router: Router,
    private tenantStore: TenantStore,
    private cacheService: CacheService
  ) {}
  appendTitle(title) {
    this.title.next(title);
    this.tenant = this.tenantStore.get()?.tenant;
  }
  LoadCategory(url, func) {
    this.router.navigate(['/' + this.tenant + '/fed/' + url], {
      queryParams: { funcID: func },
    });
  }

  convertListToObject(
    list: Array<object>,
    fieldName: string,
    fieldValue: string
  ) {
    if (!Array.isArray(list) || list.length == 0) return {};
    return list.reduce((a, v) => ({ ...a, [v[fieldName]]: v[fieldValue] }), {});
  }
}
