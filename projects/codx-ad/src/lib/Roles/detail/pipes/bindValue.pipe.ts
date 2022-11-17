import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bind',
})
export class BindPipe implements PipeTransform {
  transform(fucntionID: string, parent: string, dataAdv: any): boolean {
    if (!fucntionID || !parent || !dataAdv) return false;
    var data = dataAdv[parent];
    if (data && Array.isArray(data)) {
      var check = data.find((x) => x == fucntionID);
      if (check) return true;
    }
    return false;
  }
}
