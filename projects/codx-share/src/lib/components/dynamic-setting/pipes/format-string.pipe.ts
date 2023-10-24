import { Pipe, PipeTransform } from '@angular/core';
import { Util } from 'codx-core';
@Pipe({
  name: 'formatDescription',
})
export class FormatPipe implements PipeTransform {
  transform(setting: any, dataValue: any): string {
    if (!setting || !setting.description) return '';
    let description = setting.description + '';
    if (dataValue && dataValue[setting.transType]) {
      let value = dataValue[setting.transType];
      for (const property in value) {
        description = description.replace(
          '{' + property + '}',
          value[property]
        );
        //console.log(`${property}: ${object[property]}`);
      }
      return description;
    } else {
      return description;
    }
  }
}
