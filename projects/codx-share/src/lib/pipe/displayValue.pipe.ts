import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dValue'
})
export class DisplayValue implements PipeTransform {
  transform(value: string) {
    let _dataType = typeof(value);
    if(typeof _dataType === 'object' && _dataType !== null)
    {
        return this.convertJSON(value);
    }
    return `<span>${value}</span>`;
  }


  convertJSON(value:any):string{
    
     return `<span>${value}</span>`
    
  }
}