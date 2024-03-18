import {
  ApplicationRef,
  ElementRef,
  Pipe,
  PipeTransform,
  TemplateRef,
} from '@angular/core';
import { CacheService, Util } from 'codx-core';
import { map, Observable, of } from 'rxjs';

@Pipe({
  name: 'mssgSYS',
})
export class MessageSystemPipe implements PipeTransform {
  constructor(
    private cache: CacheService,
    private applicationRef: ApplicationRef
  ) {}

  transform(value: any): Observable<any> {
    if(value)
    {
      return this.cache.message(value.message)
      .pipe(map((mssg:any) => {
        if(mssg)
        {
          let strMessage = "";
          switch(mssg.mssgCode)
          {
            case "CHAT006":
            case "CHAT007":
            case "CHAT008":
            case "CHAT009":
              strMessage = Util.stringFormat(mssg.customName,...value.messageValue.sort((a,b) => a.fieldName - b.fieldName).map(x => x.fieldValue));
              break;
          }
          return strMessage;
        }
        else return of("");
      }));
    }
    else return of("");
  }


  // dynamic template
  dynamicTemplate(template: TemplateRef<any>, ...arg: any[]) {
    let viewRef = template.createEmbeddedView({
      $implicit: arg[0],
      value2: arg[1],
      value3: arg[2],
    });
    this.applicationRef.attachView(viewRef);
    viewRef.detectChanges();
    let container = document.createElement('div');
    viewRef.rootNodes.forEach((x) => container.append(x));
    return container;
  }

  sort(a,b){
    return a.fieldName > b.fieldName;
  }
}
