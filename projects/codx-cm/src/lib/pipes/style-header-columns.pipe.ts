import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'styleHeaderColumns',
})
export class StyleHeaderColumnsPipe implements PipeTransform {
  transform(keyField, columns, type): any {
    let find = columns?.find((item) => item['dataColums'].recID === keyField);
    return find ? find['dataColums'][type] : '';
  }
}
