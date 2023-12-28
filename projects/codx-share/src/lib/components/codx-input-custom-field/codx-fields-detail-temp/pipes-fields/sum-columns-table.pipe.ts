import { Pipe, PipeTransform } from '@angular/core';
import { AnyARecord } from 'dns';

@Pipe({
  name: 'sumColumnsTable',
})
export class SumColumnsTablePipe implements PipeTransform {
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
    if (dataFormat == 'I') {
      dataValue = Number.parseFloat(dataValue).toFixed(0);
      return dataValue;
    }
    dataValue =
      Number.parseFloat(dataValue).toFixed(2) + (dataFormat == 'P' ? ' %' : '');
    return dataValue;
  }
}
