import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'value',
})
export class BindValuePipe implements PipeTransform {
  transform(dataValue: any, key: string, value: string, keyValue: string): any {
    if (!dataValue || !keyValue) return '';
    if (Array.isArray(dataValue)) {
      if (!key || !value) return '';
      let data = dataValue.find((x) => x[key] == value);
      if (!data) return '';
      return data[keyValue];
    } else return dataValue[keyValue];
  }
}
