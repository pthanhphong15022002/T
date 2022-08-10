import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'group',
})
export class GroupPipe implements PipeTransform {
  transform(items: any[], groupName: string): any[] {
    if (!items || !groupName) return [];
    var dt = items.filter((x) => x.refLineID === groupName);
    if (!dt) dt = [];
    return dt;
  }
}
