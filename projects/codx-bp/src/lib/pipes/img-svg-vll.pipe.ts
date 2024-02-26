import { Pipe, PipeTransform } from '@angular/core';
import { CacheService } from 'codx-core';
import { Subject } from 'rxjs';

@Pipe({
  name: 'imgSvgVll',
})
export class ImgSvgVllPipe implements PipeTransform {
  constructor(private cache: CacheService) {}

  transform(value: any, vlls = []) {
    const icon = vlls?.find((x) => x.value === value)?.icon;

    return icon;
  }
}
