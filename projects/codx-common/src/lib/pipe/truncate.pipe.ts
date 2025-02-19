import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maxlenght'
})
export class TruncatePipe implements PipeTransform {
  public transform(value: string, limit = 50, completeWords = false, ellipsis = '...') {
    if (completeWords) {
      limit = value.substring(0, limit).lastIndexOf(' ');
    }
    return value.length > limit ? value.substring(0, limit) + ellipsis : value;
  }
}
