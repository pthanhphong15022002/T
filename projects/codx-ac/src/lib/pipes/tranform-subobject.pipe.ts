import { Pipe, PipeTransform } from '@angular/core';
import { CodxAcService } from '../codx-ac.service';

@Pipe({
  name: 'tranformSubobject'
})
export class TranformSubobjectPipe implements PipeTransform {
  constructor(public acService: CodxAcService) {
       
  }
  transform(value: string): string {
    let osub = this.acService.getCacheValue('subobject',value);
    if (osub) {
      return (osub as any).objectName;
    }
    return '';
  }

}
