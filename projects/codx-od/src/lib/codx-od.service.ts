import { Injectable } from '@angular/core';
import { CacheService } from 'codx-core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { finalize, map, share, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CodxOdService {
  SetLayout = new BehaviorSubject<any>(null);
  public caches = new Map<string, Map<string, any>>();
  private cachedObservables = new Map<string, Observable<any>>();
  constructor( private cache: CacheService) { }
  loadVll(name:string): Observable<any>
  {
    let paras = ["VLL",name];
    let keyRoot = "VLL" + name;
    let key = JSON.stringify(paras).toLowerCase();
    //Get from CacheData
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return of(c.get(key));
      }
    }
    if (this.cachedObservables.has(key)) {
      this.caches.set(keyRoot, new Map<string, any>());
    }
    const observable = this.cache.valueList(name)
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
          // let c = this.caches.get(keyRoot);
          // c?.set(key, res);
          // return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }
  loadMess(name:string): Observable<any>
  {
    let paras = ["Mess",name];
    let keyRoot = "Mess" + name;
    let key = JSON.stringify(paras).toLowerCase();
    //Get from CacheData
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return of(c.get(key));
      }
    }
    if (this.cachedObservables.has(key)) {
      this.caches.set(keyRoot, new Map<string, any>());
    }
    const observable = this.cache.message(name)
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
          // let c = this.caches.get(keyRoot);
          // c?.set(key, res);
          // return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }
  loadFuncList(funcID:string): Observable<any>
  {
    let paras = ["Func",funcID];
    let keyRoot = "Func" + funcID;
    let key = JSON.stringify(paras).toLowerCase();
    //Get from CacheData
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return of(c.get(key));
      }
    }
    if (this.cachedObservables.has(key)) {
      this.caches.set(keyRoot, new Map<string, any>());
    }
    const observable = this.cache.functionList(funcID)
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
          // let c = this.caches.get(keyRoot);
          // c?.set(key, res);
          // return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }
  loadGridView(formName:string,gridViewName:string): Observable<any>
  {
    let paras = [formName,gridViewName];
    let keyRoot = formName + gridViewName;
    let key = JSON.stringify(paras).toLowerCase();
    //Get from CacheData
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return of(c.get(key));
      }
    }
    if (this.cachedObservables.has(key)) {
      this.caches.set(keyRoot, new Map<string, any>());
    }
    const observable = this.cache.gridViewSetup(formName,gridViewName)
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
          // let c = this.caches.get(keyRoot);
          // c?.set(key, res);
          // return res;
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
