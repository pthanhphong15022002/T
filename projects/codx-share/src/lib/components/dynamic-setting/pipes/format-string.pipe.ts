import { Pipe, PipeTransform } from '@angular/core';
import { Util } from 'codx-core';
@Pipe({
  name: 'format',
})
export class FormatPipe implements PipeTransform {
  transform(str: string, ...args: any[]): string {
    if (!str || !args) return '';
    return Util.stringFormat(str, ...args);
  }
}
