import { ApplicationRef, ElementRef, Pipe,PipeTransform, TemplateRef } from '@angular/core';
import { CacheService, Util } from 'codx-core';
import { map, Observable, of } from 'rxjs';

@Pipe({
  name: 'mssgSYS'
})
export class MessageSystemPipe implements PipeTransform {
  constructor(
    private cache:CacheService,
    private applicationRef:ApplicationRef
  )
  {}
  transform(data:any,template:TemplateRef<any>): Observable<any> {
    return this.cache.message(data.jsMessage.mssgCode).pipe(map((mssg:any) => {
     if(mssg.defaultName){
       switch(data.jsMessage.mssgCode){
         case"WP038":// add member
            debugger
            let members = Array.from<any>(JSON.parse(data.jsMessage.value[0].fieldValue));
            let param = {
              memberIDs : members.map((x:any) => x.UserID).join(";"),
              members: members,
              user : JSON.parse(data.jsMessage.value[1].fieldValue),
            };
            let viewRef = this.dynamicTemplate(template,param.memberIDs,param.members,param.user);
            let container = document.getElementById(data.recID);
            if(container && viewRef)
              container.append(viewRef);
            break;
        }
     };
    }));
   }
 
   // dynamic template
   dynamicTemplate(template:TemplateRef<any>,...arg:any[]){
    debugger
    let viewRef = template.createEmbeddedView({$implicit: arg[0], value2:arg[1], value3:arg[2]});
    this.applicationRef.attachView(viewRef);
    viewRef.detectChanges();
    let container = document.createElement("div"); 
    viewRef.rootNodes.forEach(x => container.append(x));
    return container;
   }

}