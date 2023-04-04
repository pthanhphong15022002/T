import { ApplicationRef, ElementRef, Pipe,PipeTransform, TemplateRef } from '@angular/core';
import { CacheService, Util } from 'codx-core';
import { map, Observable, of } from 'rxjs';

@Pipe({
  name: 'mssgSYS',
  pure : true
})
export class MessageSystemPipe implements PipeTransform {
  constructor(
    private cache:CacheService,
    private applicationRef:ApplicationRef
  )
  {}
  transform(item:any,...arg:any[]): Observable<any> {
    return this.cache.message(item.jsMessage.mssgCode).pipe(map((mssg:any) => {
     if(mssg.defaultName){
       switch(item.jsMessage.mssgCode){
         case"WP038":// add member
            let value1 = JSON.parse(item.jsMessage.value[0].fieldValue)
            let value2 = JSON.parse(item.jsMessage.value[1].fieldValue)
            let text1 = this.dynamicTemplate(value1,arg[0]);
            let text2 = this.dynamicTemplate(value2,arg[1]);
            let content = Util.stringFormat(mssg.defaultName,text1,text2);
            let containerRef = document.getElementById(item.recID);
            containerRef.innerHTML = content;
            break;
          default:
            break;
        }
     };
    }));
   }
 
   // dynamic template
   dynamicTemplate(data:any,template:TemplateRef<any>){
      let viewRef = template.createEmbeddedView({$implicit: data});
      this.applicationRef.attachView(viewRef);
      viewRef.detectChanges();
      let container = document.createElement("div"); 
      viewRef.rootNodes.forEach(x => container.append(x));
      return container.innerHTML;
   }

}