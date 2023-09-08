import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService } from 'codx-core';
import { BehaviorSubject, Observable, Subject, finalize, map, share } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodxWsService {
  listBreadCumb = [];
  functionID:any;
  SetLayout = new BehaviorSubject<any>(null);
  private caches = new Map<string, Map<string, any>>();
  private cachedObservables = new Map<string, Observable<any>>();
  public funcChange:Subject<any> = new BehaviorSubject<any>(null);

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
  ) {}

  loadFuncList(module:any): Observable<any>
  {
    let paras = [module];
    let keyRoot = "WSFuncList" + module;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key)
    }
    let observable = this.api.execSv("SYS","SYS","FunctionListBusiness","GetFunctionListByModuleAsync",paras)
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  loadFunc(funcID:any): Observable<any>
  {
    let paras = ["FuncID",funcID];
    let keyRoot = "FuncID" + funcID;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key)
    }
    let observable = this.cache.functionList(funcID)
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  loadParentGroup(funcID:any): Observable<any>
  {
    let paras = ["WSParentGroup",funcID];
    let keyRoot = "WSParentGroup" + funcID;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key)
    }
    let observable = this.api.execSv("SYS","SYS","FunctionListBusiness","GetFunctionListBySaleGroupAsync")
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  loadModule(moduleID:any): Observable<any>
  {
    let paras = [moduleID];
    let keyRoot = "WSModule" + moduleID;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key)
    }
    let observable = this.api.execSv<any>(
      'SYS',
      'ERM.Business.SYS',
      'FunctionListBusiness',
      'GetAllFuncsByModuleIDAsync',
      paras
    )
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  loadModuleByUserID(userID:any): Observable<any>
  {
    let paras = [userID];
    let keyRoot = "WSModuleU" + userID;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key)
    }
    let observable = this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'UserRolesBusiness',
      'GetModuleByUserIDAsync',
    )
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  loadDashboardOrReport(type:any , listModule:any): Observable<any>
  {
    let paras = [type,listModule];
    let keyRoot = "WSDR" + type + listModule;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key)
    }
    let observable = this.api.execSv<any>(
      'rptrp',
      'Codx.RptBusiness.RP',
      'ReportListBusiness',
      'GetReportsByModuleAsync',
      paras
    )
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  loadListFucByListModule(moduleIDs:any)
  {
    let paras = [moduleIDs];
    let keyRoot = "WSFCs" + moduleIDs;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key)
    }
    let observable = this.api.execSv<any>(
      'SYS',
      'ERM.Business.SYS',
      'FunctionListBusiness',
      'GetListFunctionListByModuleIDAsync',
      paras
    )
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }
}
