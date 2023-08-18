import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodxWsService {
  SetLayout = new BehaviorSubject<any>(null);
  constructor() { }

  // loadFuncList(module:any): Observable<any>
  // {
  //   let paras = [formName,gridViewName];
  //   let keyRoot = formName + gridViewName;
  //   let key = JSON.stringify(paras).toLowerCase();
  //   if (this.caches.has(keyRoot)) {
  //     var c = this.caches.get(keyRoot);
  //     if (c && c.has(key)) {
  //       return c.get(key);
  //     }
  //   }
  //   else {
  //     this.caches.set(keyRoot, new Map<any, any>());
  //   }

  //   if (this.cachedObservables.has(key)) {
  //     this.cachedObservables.get(key)
  //   }
  //   let observable = this.cache.gridViewSetup(formName,gridViewName)
  //   .pipe(
  //     map((res) => {
  //       if (res) {
  //         let c = this.caches.get(keyRoot);
  //         c?.set(key, res);
  //         return res;
  //       }
  //       return null
  //     }),
  //     share(),
  //     finalize(() => this.cachedObservables.delete(key))
  //   );
  //   this.cachedObservables.set(key, observable);
  //   return observable;
  // }
}
