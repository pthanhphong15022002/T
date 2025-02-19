import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace',
})
export class ReplacePipe implements PipeTransform {
  transform(value: string, regexValue: string, replaceValue): string {
    return value?.replace(new RegExp(regexValue, 'g'), replaceValue);
  }
}
