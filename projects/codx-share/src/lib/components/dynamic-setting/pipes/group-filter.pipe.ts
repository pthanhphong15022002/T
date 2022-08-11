import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'group',
})
export class GroupPipe implements PipeTransform {
  transform(items: any[], groupName: string, lineType: string = '1'): any[] {
    if (!items || !groupName) return [];
    var dt = items.filter(
      (x) => x.refLineID === groupName && x.lineType === lineType
    );
    if (!dt) dt = [];
    return dt;
  }
}
