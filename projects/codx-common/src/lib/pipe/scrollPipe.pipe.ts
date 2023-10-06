import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'srollPipe'
})
export class ScrollPipe implements PipeTransform {
  transform(value: HTMLElement) {
    if (value && value.scrollHeight) {
        value.scrollTo(0,value.scrollHeight);
    }
    return "";
  }
}