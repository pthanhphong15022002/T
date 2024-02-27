import { Pipe, PipeTransform } from '@angular/core';
import { Internationalization } from '@syncfusion/ej2-base';

@Pipe({
  name: 'sumColumnsTable',
})
export class SumColumnsTablePipe implements PipeTransform {
  //constructor(private cache: CacheService) {}

  transform(value: any, arrayValue: any): any {
    if (value?.totalColumns) {
      let sum = 0;
      arrayValue.forEach((x) => {
        if (x[value.fieldName] && Number.parseFloat(x[value.fieldName]))
          sum += Number.parseFloat(x[value.fieldName]);
      });
      return this.formatNumber(sum, value.dataFormat); //chua format
    }
    return '';
  }

  formatNumber(dataValue, dataFormat): any {
    let intl = new Internationalization();
    let nFormatter = intl.getNumberFormat({
      skeleton: 'n6',
    });

    if (dataFormat == 'I') {
      dataValue = Number.parseFloat(dataValue).toFixed(0);
    } else {
      dataValue = Number.parseFloat(dataValue).toFixed(2);
    }
    return nFormatter(dataValue) + (dataFormat == 'P' ? ' %' : '');
    //tham khao tu AC
    // let intl = new Internationalization();
    // let zeroAfterPoint: any;
    // let formatStr: any;
    // let nFormatter: any;
    // let format = 'B';
    // debugger;
    // return this.cache.systemSetting().pipe(
    //   map((res) => {
    //     if (res) {
    //       debugger;
    //       switch (format.toLowerCase()) {
    //         case 'b':
    //           zeroAfterPoint = res?.dBaseCurr;
    //           break;
    //         case 's':
    //           zeroAfterPoint = res?.dSourceCurr;
    //           break;
    //       }
    //       formatStr = this.createString('n', zeroAfterPoint);
    //       nFormatter = intl.getNumberFormat({
    //         format: formatStr,
    //         skeleton: formatStr,
    //       });
    //       dataValue = nFormatter(dataValue);
    //     }
    //     return dataValue;
    //   })
    // );
  }

  // createString(preFormatString, zeroAfterPoint = 6) {
  //   let val = preFormatString;
  //   if (zeroAfterPoint < 0) zeroAfterPoint = 0;
  //   if (zeroAfterPoint > 6) zeroAfterPoint = 6;
  //   if (preFormatString) val = preFormatString + zeroAfterPoint;
  //   return val;
  // }
}
