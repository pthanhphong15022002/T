import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'assetURL',
})
export class AssetURLPipe implements PipeTransform {
  transform(value: any, checkOnly: boolean = false) {
    if (checkOnly) {
      let isAssetURl = false;
      if (value?.includes('assets/') || value?.includes('assets\\'))
        isAssetURl = true;
      return isAssetURl;
    } else {
      if (value?.includes('assets/') || value?.includes('assets\\')) {
        value = value?.replaceAll('\\', '/');
        if (!value.startsWith('./')) {
          value = './' + value;
        }
        if (!value.startsWith('.')) {
          value = '.' + value;
        }
      }
      return value;
    }
  }
}
