import { Pipe, PipeTransform } from '@angular/core';
import { AuthStore } from 'codx-core';

@Pipe({
  name: 'seniorityPipe',
})
export class SeniorityPipe implements PipeTransform {
  vn = {
    years: ' năm ',
    months: ' tháng ',
    days: ' ngày ',
  };

  en = {
    years: ' year',
    months: ' month',
    days: ' day',
  };

  ens = {
    years: ' years',
    months: ' months',
    days: ' days',
  };

  user: any;

  constructor(private authStore: AuthStore) {
    this.user = this.authStore.get();
  }

  transform(value: string): string {
    if (!value) return '';

    const dateFromDatabase = new Date(value);
    const currentDate = new Date();

    const diffTime = currentDate.getTime() - dateFromDatabase.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24)); 

    let years = Math.floor(diffDays / 365);
    let months = Math.floor((diffDays % 365) / 30);
    let days = diffDays % 30;

    let language = this.vn;
    if (this.user.language.toLowerCase() === 'en') {
      language = years === 1 ? this.en : this.ens;
    }

    let output = '';

    if (years >= 0) {
      output += `${years}${language.years}`;
    }

    if (months >= 0) {
      if (output !== '') {
        output += ` ${months}${language.months}`;
      } else {
        output = `${months}${language.months}`;
      }
    }

    if (days >= 0) {
      if (output !== '') {
        output += ` ${days}${language.days}`;
      } else {
        output = `${days}${language.days}`;
      }
    }

    return output.trim();
  }
}
