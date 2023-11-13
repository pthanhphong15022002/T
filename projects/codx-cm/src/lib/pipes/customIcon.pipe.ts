import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customIcon',
})
export class CustomIconPipe implements PipeTransform {
  transform(value, type = '', lstData = [], field = 'value') {
    if (value == null || lstData == null) return null;
    const data = lstData.find((x) => x[field] == value);
    if (data == null) return null;
    return type && type?.trim() != '' ? data[type] : data;
  }
}
