import { Pipe, PipeTransform } from '@angular/core';
import { CacheService, Util } from 'codx-core';
import {Internationalization} from '@syncfusion/ej2-base';
import { map } from 'rxjs';

@Pipe({
  name: 'tranformValueNumber',
  standalone: true,
})
export class TranformValueNumberPipe implements PipeTransform {
  constructor(
    private cache: CacheService
    ) {
       
  }
  transform(value: any, format: any): any {
    let html = '';
    let intl = new Internationalization();
    let zeroAfterPoint:any;
    let formatStr:any;
    let nFormatter:any;
    return this.cache.systemSetting().pipe(map(res => {
      if (res) {
        switch(format.toLowerCase()){
          case 'b':
            zeroAfterPoint = res?.dBaseCurr;
            break;
          case 's':
            zeroAfterPoint = res?.dSourceCurr;
            break;
        }
          formatStr = this.createString('n', zeroAfterPoint);
          nFormatter = intl.getNumberFormat({
            format: formatStr,
            skeleton: formatStr,
          });
          value = nFormatter(value);
      }
      //return Util.stringFormat(html, '', value || '');
      return value;
    }));
  }
  createString(preFormatString, zeroAfterPoint = 6) {
    let val = preFormatString;
    if (zeroAfterPoint < 0) zeroAfterPoint = 0;
    if (zeroAfterPoint > 6) zeroAfterPoint = 6;
    if (preFormatString) val = preFormatString + zeroAfterPoint;
    return val;
  }
}
