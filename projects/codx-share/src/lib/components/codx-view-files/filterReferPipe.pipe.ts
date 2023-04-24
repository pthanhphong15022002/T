import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fReferType'
})
export class FillterReferType implements PipeTransform {

  transform(value: any[], ...arg:any[]): any {
    return value.filter(x => arg.includes(x.referType));
  }

}
