import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'group',
})
export class GroupPipe implements PipeTransform {
  transform(items: any[], groupName: string, lineType: string = '1'): any[] {
    if (!items) return [];
    var dt = [];
    if (!groupName) {
      dt = items.filter((x) => !x.refLineID && x.lineType === lineType);
    } else {
      dt = items.filter(
        (x) => x.refLineID === groupName && x.lineType === lineType
      );
    }
    if (!dt) dt = [];
    return dt;
  }
}
