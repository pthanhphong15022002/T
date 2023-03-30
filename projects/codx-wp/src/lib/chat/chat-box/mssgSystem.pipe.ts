import { ApplicationRef, Pipe,PipeTransform, TemplateRef } from '@angular/core';
import { CacheService, Util } from 'codx-core';
import { map, Observable, of } from 'rxjs';

@Pipe({
  name: 'mssgSYS'
})
export class MessageSystemPipe implements PipeTransform {
  constructor
  (
    private cache:CacheService,
    private applicationRef:ApplicationRef,
  )
  {}
  transform(jsMessage: any,...arg:any[]): Observable<any> {
   return this.cache.message(jsMessage.mssgCode).pipe(map((mssg:any) => {
    if(mssg.defaultName){
      switch(jsMessage.mssgCode){
        case"WP038":// add member
            let param1 = jsMessage.value.find(x => x.fieldName === "0");
            let param2 = jsMessage.value.find(x => x.fieldName === "1");
            let value1 = JSON.parse(param1.fieldValue)
            let value2 = JSON.parse(param2.fieldValue)
            let text1 = this.dynamicTemplate(value1,arg[0]);
            let text2 = this.dynamicTemplate(value2,arg[1]);
            let content = Util.stringFormat(mssg.defaultName,text1,text2);
            return content;
        default:
            return null;
      }
    }
    else return null;
   }));
  }

  // dynamic template
  dynamicTemplate(data:any,template:TemplateRef<any>){
    debugger
    let viewRef = template.createEmbeddedView({$implicit: data});
    if(viewRef){
      this.applicationRef.attachView(viewRef);
      viewRef.detectChanges();
      let divElement = document.createElement("div");
      viewRef.rootNodes.forEach(ele => {
        debugger
        divElement.append(ele);
      });
      return divElement.outerHTML;
    }
    return null;
  }
}