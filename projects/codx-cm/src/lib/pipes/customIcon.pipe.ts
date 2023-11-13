import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customIcon',
})
export class CustomIconPipe implements PipeTransform {
  transform(value, type = '', lstData = []) {
    if (value == null || lstData == null) return null;
    const data = lstData.find((x) => x.value == value);
    return type && type?.trim() != '' ? data[type] : data;
  }
}
