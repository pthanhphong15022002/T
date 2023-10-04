import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'groupmodoule',
})
export class GroupModulePipe implements PipeTransform {
  transform(items: any[], groupID: string): any[] {
    if (!items) return [];
    var dt = [];
    if (!groupID) {
      dt = items.filter((x) => !x.saleGroup);
      //dt.unshift({ _itemHome: true });
    } else {
      dt = items.filter((x) => x.saleGroup == groupID);
    }
    return dt;
  }
}
