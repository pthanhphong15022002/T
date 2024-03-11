import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'setColorTask'
})
export class SetColorTaskPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
