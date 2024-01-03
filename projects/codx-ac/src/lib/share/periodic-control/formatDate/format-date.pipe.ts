import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {

  transform(date: any): string {
    let newdate = null; 
    if (date) { 
      newdate = (new Date(date).getMonth() + 1).toString() +'/'+ (new Date(date).getFullYear()).toString(); 
    } 
    return newdate;
  }

}
