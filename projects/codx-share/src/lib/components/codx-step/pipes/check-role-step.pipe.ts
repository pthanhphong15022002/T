import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkRoleStep'
})
export class CheckRoleStepPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
