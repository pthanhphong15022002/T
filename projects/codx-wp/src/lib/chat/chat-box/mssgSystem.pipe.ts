import { ApplicationRef, Pipe,PipeTransform, TemplateRef } from '@angular/core';
import { CacheService, Util } from 'codx-core';
import { map, Observable, of } from 'rxjs';

@Pipe({
  name: 'mssgSYS',
  pure : true
})
export class MessageSystemPipe implements PipeTransform {
  constructor(
    private cache:CacheService
  )
  {}
  transform(jsMessage: any): Observable<any> {
   return this.cache.message(jsMessage.mssgCode).pipe(map((mssg:any) => {
    if(mssg.defaultName){
      switch(jsMessage.mssgCode){
        case"WP038":// add member
            let fileName1 = JSON.parse(jsMessage.value[0].fieldValue);
            let fileName2 = JSON.parse(jsMessage.value[1].fieldValue);
            let content = "";
            if(Array.isArray(fileName1)){
              let strName = Array.from<any>(fileName1).map(x => x.UserName);
              content = Util.stringFormat(mssg.defaultName,strName,fileName2.UserName);
            }
            return content;
        default:
            return "";
      }
    }
    else return "";
   }));
  }

}