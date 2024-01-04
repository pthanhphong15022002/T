import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'substring'
})
export class SubstringPipe implements PipeTransform {

  transform(value: string, start:number, end? : number,isReverse :boolean = false) {
    if(!value){
      return "";
    }
    if(isReverse){
      return value?.split("")?.reverse()?.join("")?.substring(start,end);
    }
    else{
      return value?.substring(start,end);
    }
  }

}
