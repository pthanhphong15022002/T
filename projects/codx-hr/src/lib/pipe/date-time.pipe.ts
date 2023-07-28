import { Pipe, PipeTransform } from '@angular/core';
import { AuthStore } from 'codx-core';
import moment, { lang } from 'moment';

@Pipe({
  name: 'daysPipe',
})
export class DatePipe implements PipeTransform {
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
    minutes: ' minute',
    hours: ' hour',
    days: ' day',
    weeks: ' week',
    months: ' month ',
    years: ' year',
    yesterday: 'Yesterday',
  };
  ens = {
    seconds: 'Just now',
    minutes: ' minutes',
    hours: ' hours',
    days: ' days',
    weeks: ' weeks',
    months: ' months ',
    years: ' years',
    yesterday: 'Yesterday',
  };
  user: any;
  constructor(
    private autStore: AuthStore,
  ) {
    this.user = this.autStore.get();
  }
  transform(value: any): string {
    if (!value) return "";
    let language = this.vn;
    if (this.user.language.toLowerCase() == "en")
      language =  value == 1 ? this.en : this.ens
    return `<span class="text-primary">${value}</span> ${language.days}`;
  }

}
