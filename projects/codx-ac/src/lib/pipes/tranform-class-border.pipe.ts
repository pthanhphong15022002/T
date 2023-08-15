import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tranformClassBorder'
})
export class TranformClassBorderPipe implements PipeTransform {

  transform(item: any, oValue: any[]): string {
    if (item.crediting) {
      let classCss = 'border-bottom: 1px solid var(--bs-border-color) !important;';
      let data = oValue.filter((x) => x.entryID == item.entryID);
      let index = data
        .filter((x) => x.crediting == item.crediting)
        .findIndex((x) => x.recID == item.recID);
      if (
        index == data.filter((x) => x.crediting == item.crediting).length - 1
      ) {
        return classCss;
      } else {
        return '';
      }
    }
    return '';
  }

}
