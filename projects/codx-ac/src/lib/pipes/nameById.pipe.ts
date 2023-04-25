import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameById',
  standalone: true,
})
export class NameByIdPipe implements PipeTransform {
  transform(data: any[], value: string, key: string, propName: string) {
    return data?.find((d) => d[key] === value)?.[propName];
  }
}
