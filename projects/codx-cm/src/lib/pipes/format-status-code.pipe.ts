import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatStatusCode',
})
export class FormatStatusCodePipe implements PipeTransform {
  transform(statusCodeID: any, listStatusCode): any {
    if (statusCodeID && listStatusCode?.length > 0) {
      let result = listStatusCode.filter((x) => x.value === statusCodeID)[0];
      if (result) {
        return result?.text;
      }
    }
    return '';
  }
}
