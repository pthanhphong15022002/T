import { Injector, Pipe, PipeTransform } from '@angular/core';
import { AuthStore } from 'codx-core';
//import { ErmComponent } from '@shared/components/ermcomponent/erm.component';
import * as moment from 'moment';
import 'moment/src/locale/vi';
@Pipe({
  name: 'timefrom'
})
export class FormatDatetimePipe implements PipeTransform {
  user: any;

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

  constructor(
    private autStore: AuthStore,
  ) {
    this.user = this.autStore.get();
  }
  transform(value: any): string {
    let date = new Date(value);
    let locale = this.vn;


    if (this.user.language.toLowerCase() != "vn")
      locale = this.en;

    var seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {  
      return moment(date).format('DD/MM/YYYY HH:mm');
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + locale.months + " " + moment(date).format('HH:mm');
    }
    interval = seconds / (86400 * 7);
    if (interval > 1) {
      return Math.floor(interval) + locale.weeks + " " + moment(date).format('HH:mm');
    }
    interval = seconds / 86400;
    if (interval > 1) {
      if (Math.floor(interval) < 2)
        return locale.yesterday;
      return Math.floor(interval) + locale.days  + " "  + moment(date).format('HH:mm');
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + locale.hours;
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + locale.minutes;
    }
    return locale.seconds;
    //  return moment(new Date(value)).fromNow();
  }

}
