import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isObjectEmpty',
})
export class IsObjectEmptyPipe implements PipeTransform {
  transform(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
}