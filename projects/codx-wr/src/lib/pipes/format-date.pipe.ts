import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {

  transform(value, language) {
    let languageFormat = language == 'vn' ? 'vi' : 'en-US';
    if(value){
      const currentDate = new Date(value);
      const weekdayDate = new Intl.DateTimeFormat(languageFormat, {
        weekday: 'long',
      }).format(currentDate);
      const dayDate = new Intl.DateTimeFormat(languageFormat, {
        day: 'numeric',
      }).format(currentDate);
      const monthDate = new Intl.DateTimeFormat(languageFormat, {
        month: 'long',
      }).format(currentDate);
      const yearDate = new Intl.DateTimeFormat(languageFormat, {
        year: 'numeric',
      }).format(currentDate);
      return weekdayDate + ', ' + dayDate + ' ' + monthDate + ' ' + yearDate;
    }
    return null;
  }

}
