import { Pipe, PipeTransform } from '@angular/core';
import { CacheService } from 'codx-core';
import { map } from 'rxjs';
@Pipe({
  name: 'function'
})

export class FunctionPipe implements PipeTransform {
  constructor(private cache: CacheService) { }
  transform(funcID: string, key: string, formName = "", gridName = ""): any {
    var str = "";
    if (funcID && key) {
      return this.cache.functionList(funcID).pipe(map(res => {
        if (res)
          return res && res[key] ? res[key] : str;
        else if (formName && gridName) {
          return this.cache.moreFunction(formName, gridName).pipe(map(res => {
            if (res) {
              var data = res.find(x => x['functionID'] == funcID);
              return data && data[key] ? data[key] : str;
            }
            else return funcID
          }))
        };
      }));
    }
  }
}
