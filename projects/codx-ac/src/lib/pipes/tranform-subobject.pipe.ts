import { Pipe, PipeTransform } from '@angular/core';
import { CodxAcService } from '../codx-ac.service';
import { CacheService, FormModel, Util } from 'codx-core';

@Pipe({
  name: 'tranformSubobject'
})
export class TranformSubobjectPipe implements PipeTransform {
  constructor(
    public acService: CodxAcService,
    private cache: CacheService,
    ) {
       
  }
  transform(value: string,formModel:FormModel): string {
    let headerText = '';
    let html = '<span class="{0}">{1}</span>';
    let osub = this.acService.getCacheValue('subobject',value);
    if (osub) {
      return (osub as any).objectName;
    }else{
      return '';
    }
  }

}
