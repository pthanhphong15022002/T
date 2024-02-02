import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService } from 'codx-core';
import { BehaviorSubject, Observable, Subject, finalize, map, share } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodxWsService {
  listBreadCumb = [];
  functionID:any;
  wsActive:any;
  SetLayout = new BehaviorSubject<any>(null);
  private caches = new Map<string, Map<string, any>>();
  private cachedObservables = new Map<string, Observable<any>>();
  public funcChange:Subject<any> = new BehaviorSubject<any>(null);
  loadDataList = new BehaviorSubject<any>(null);
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
  ) {}

  updateCache(keyRoot:any , key:any , data:any)
  {
    if (this.caches.has(keyRoot))
    {
      let c = this.caches.get(keyRoot);
      c?.set(key, data);
    }
  }

  loadData(
    paras:any,
    keyRoot:any,
    service:any,
    assemly:any,
    className:any,
    method:any
  ): Observable<any>
  {
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
    let observable = this.api.execSv(service,assemly,className,method,paras)
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

  loadFuncList(module:any): Observable<any>
  {
    let paras = [module];
    let keyRoot = "WSFuncList" + module;
    return this.loadData(paras,keyRoot,"SYS","SYS","FunctionListBusiness","GetFunctionListByModuleAsync")
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
    return this.loadData(paras,keyRoot,"SYS","SYS","FunctionListBusiness","GetFunctionListBySaleGroupAsync")
  }

  loadModule(moduleID:any): Observable<any>
  {
    let paras = [moduleID];
    let keyRoot = "WSModule" + moduleID;
    return this.loadData(paras,keyRoot,"SYS","SYS","FunctionListBusiness","GetAllFuncsByModuleIDAsync")
  }

  loadModuleByUserID(userID:any): Observable<any>
  {
    let paras = [userID];
    let keyRoot = "WSModuleU" + userID;
    return this.loadData(paras,keyRoot,"SYS","AD","UserRolesBusiness","GetModuleByUserIDAsync")
  }

  loadDashboardOrReport(type:any , listModule:any): Observable<any>
  {
    let paras = [type,listModule];
    let keyRoot = "WSDR" + type + listModule;
    return this.loadData(paras,keyRoot,"rptrp","Codx.RptBusiness.RP","ReportListBusiness","GetReportsByModuleAsync")
  }

  loadListFucByListModule(moduleIDs:any)
  {
    let paras = [moduleIDs];
    let keyRoot = "WSFCs" + moduleIDs;
    return this.loadData(paras,keyRoot,"SYS","SYS","FunctionListBusiness","GetListFunctionListByModuleIDAsync")
  }

  loadListFucByParentID(funcID:any)
  {
    let paras = [funcID,true];
    let keyRoot = "WSFCByParent" + funcID;
    return this.loadData(paras,keyRoot,"SYS","SYS","FunctionListBusiness","GetFunctListByParentIDAsync")
  }

  loadListFucByParentIDChild(funcID:any)
  {
    let paras = [funcID];
    let keyRoot = "WSFCByParentChild" + funcID;
    return this.loadData(paras,keyRoot,"SYS","SYS","FunctionListBusiness","GetFuncByParentAsync")
  }
}
