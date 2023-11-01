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
  name: 'mssgReplace',
})
export class MessageReplacePipe implements PipeTransform {
  constructor(
    private cache: CacheService,
    private applicationRef: ApplicationRef
  ) {}
  transform(data: any, ...arg:any[]): Observable<any> {
    return this.cache.message(data).pipe(
      map((mssg: any) => {
        if (mssg.customName) {
          for(var i = 0 ; i< arg.length ; i++)
          {
            mssg.customName = mssg.customName.replace("{"+i+"}",arg[i]);
          }
          return mssg.customName;
        }
      })
    );
  }
}
