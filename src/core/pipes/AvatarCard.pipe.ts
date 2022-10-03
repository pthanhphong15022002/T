import { Pipe, PipeTransform } from '@angular/core';
import { CacheService } from 'codx-core';

@Pipe({
  name: 'avatarCard'
})

export class AvatarCardPipe implements PipeTransform {
  constructor(private cache: CacheService) { }
  transform(transType: string, cardType: string,name:string = 'icon'): any {
      let key = "";
      let value = "";
    if(transType == '1' || transType == '4'){
        key = "L1422";
        value = cardType;
      }
    else{
        key = "L1427";
        value = transType;
    }
    if (value && key) {
      return this.cache.valueList(key).subscribe((res) => {
        
        if (res)
          return res;
        else return value
      });
    }
  }
}

