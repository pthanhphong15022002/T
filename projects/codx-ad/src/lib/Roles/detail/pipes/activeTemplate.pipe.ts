import { Pipe, PipeTransform } from '@angular/core';
import { CacheService } from 'codx-core';
import { map, Observable, of } from 'rxjs';

@Pipe({
  name: 'active',
})
export class ActiveTemplatePipe implements PipeTransform {
  constructor(private cache: CacheService) {}
  transform(listTemplate: string, key: string, isRef: boolean = false): any {
    if (!listTemplate || !key) return false;
    var arrTemplate = listTemplate.split(';');
    var objTemplate = arrTemplate.reduce(
      (acc, curr) => ((acc[curr] = ''), acc),
      {}
    );
    if (!isRef) {
      if (objTemplate && objTemplate[key] != undefined) return false;
      return true;
    } else {
      //return 'SYS010';
      return objTemplate && objTemplate[key] ? objTemplate[key] : '';
    }
  }
}
