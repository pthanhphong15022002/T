import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService } from 'codx-core';
import { BehaviorSubject, map, Observable , share , finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodxSVAnswerService {
    service = "SV";
    assemply = "SV";
    respondentMethod = "RespondentsBusiness";
    questionMethod= "QuestionsBusiness";
  public caches = new Map<string, Map<string, any>>();
  private cachedObservables = new Map<string, Observable<any>>();
  SetLayout = new BehaviorSubject<any>(null);
  constructor( 
    private api: ApiHttpService ,  
    private cache: CacheService) 
    {

    }

  getRespondents(id:any)
  {
    return this.api.execSv(this.service,this.assemply,this.respondentMethod,"GetListByIDSVAsync",id);
  }

  loadQuestion(questionID:any): Observable<any>
  {
    let paras = [questionID];
    let keyRoot = "dataQ" + questionID;
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
    let observable =this.api.execSv(this.service,this.assemply,this.questionMethod,"GetQuestionByIDAsync",paras)
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
//   loadFunctionList(funcID:any): Observable<any>
//   {
//     let paras = ["FuncID",funcID];
//     let keyRoot = "FuncID" + funcID;
//     let key = JSON.stringify(paras).toLowerCase();
//     if (this.caches.has(keyRoot)) {
//       var c = this.caches.get(keyRoot);
//       if (c && c.has(key)) {
//         return c.get(key);
//       }
//     }
//     if (this.cachedObservables.has(key)) {
//       this.cachedObservables.get(key)
//     }
//     let observable = this.cache.functionList(funcID)
//     .pipe(
//       map((res) => {
//         if (res) {
//           let c = this.caches.get(keyRoot);
//           c?.set(key, res);
//           return res;
//         }
//         return null
//       }),
//       share(),
//       finalize(() => this.cachedObservables.delete(key))
//     );
//     this.cachedObservables.set(key, observable);
//     return observable;
//   }
//   loadMessage(message:any): Observable<any>
//   {
//     let paras = ["Message",message];
//     let keyRoot = "Message" + message;
//     let key = JSON.stringify(paras).toLowerCase();
//     if (this.caches.has(keyRoot)) {
//       var c = this.caches.get(keyRoot);
//       if (c && c.has(key)) {
//         return c.get(key);
//       }
//     }
//     if (this.cachedObservables.has(key)) {
//       this.cachedObservables.get(key)
//     }
//     let observable = this.cache.message(message)
//     .pipe(
//       map((res) => {
//         if (res) {
//           let c = this.caches.get(keyRoot);
//           c?.set(key, res);
//           return res;
//         }
//         return null
//       }),
//       share(),
//       finalize(() => this.cachedObservables.delete(key))
//     );
//     this.cachedObservables.set(key, observable);
//     return observable;
//   }
//   loadValuelist(vll:any): Observable<any>
//   {
//     let paras = ["VLL",vll];
//     let keyRoot = "VLL" + vll;
//     let key = JSON.stringify(paras).toLowerCase();
//     if (this.caches.has(keyRoot)) {
//       var c = this.caches.get(keyRoot);
//       if (c && c.has(key)) {
//         return c.get(key);
//       }
//     }
//     if (this.cachedObservables.has(key)) {
//       this.cachedObservables.get(key)
//     }
//     let observable = this.cache.valueList(vll)
//     .pipe(
//       map((res) => {
//         if (res) {
//           let c = this.caches.get(keyRoot);
//           c?.set(key, res);
//           return res;
//         }
//         return null
//       }),
//       share(),
//       finalize(() => this.cachedObservables.delete(key))
//     );
//     this.cachedObservables.set(key, observable);
//     return observable;
//   }
}

