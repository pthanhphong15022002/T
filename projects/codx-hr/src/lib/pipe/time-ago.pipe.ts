import { Pipe, PipeTransform } from '@angular/core';
import moment, { lang } from 'moment';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {
  vn = {
    seconds: 'Vừa xong',
    minutes: ' phút',
    hours: ' giờ',
    days: ' ngày ',
    weeks: ' tuần',
    months: ' tháng ',
    years: ' năm ',
    yesterday: 'Hôm qua'
  };

  en = {
    seconds: 'Just now',
    minutes: ' minutes',
    hours: ' hours',
    days: ' days',
    weeks: ' weeks',
    months: ' months ',
    years: ' years',
    yesterday: 'Yesterday',
  };
  transform(value:any,languages:string = "vn"): string 
  {
    if(!value) return "";
    let language = languages == "vn"? this.vn : this.en;
    let dateValue = new Date(value);
    var seconds = Math.floor((new Date().valueOf() - dateValue.valueOf()) / 1000);
    let yearNumber = Math.floor(seconds / 31536000);
    let monthNumber = Math.floor((seconds - (yearNumber * 31536000))/ 2592000);
    let strTimeAgo = "";
    // let srtTimeAgo = moment(dateValue).fromNow();
    if(yearNumber > 0){
      strTimeAgo = yearNumber + language.years;
    }
    if(monthNumber > 0){
      strTimeAgo += monthNumber + language.months;
    }
    return strTimeAgo;
  }

}
