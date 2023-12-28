import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'changeMemoryCells',
})
export class ChangeMemoryCellsPipe implements PipeTransform {
  transform(value: any): any {
    return JSON.parse(JSON.stringify(value));
  }
}
