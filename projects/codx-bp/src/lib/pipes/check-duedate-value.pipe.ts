import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkDuedateValue',
})
export class CheckDuedateValuePipe implements PipeTransform {
  constructor() {}

  transform(actualEnDate: any, endDate: any, type: string = 'boolean') {
    let isDueDate = false;
    let text = '';
    let date = '';
    if (endDate) {
      if (actualEnDate) {
        if (new Date(endDate) < new Date(actualEnDate)){
          isDueDate = true;
          date = this.formatDate(new Date(endDate), new Date(actualEnDate));
        }
      } else {
        if (new Date(endDate) < new Date()){
          isDueDate = true;
          date = this.formatDate(new Date(endDate), new Date());
        }
      }
      //task quá hạn
      // if (actualEnDate != null && actualEnDate != '') {

      //   if (new Date(endDate) < new Date(actualEnDate)) {
      //     isDueDate = true;
      //     date = this.formatDate(new Date(endDate), new Date(actualEnDate));
      //   }
      // } else {
      //   if (new Date(endDate) < new Date() && !isDueDate) {
      //     isDueDate = true;
      //     date = this.formatDate(new Date(endDate), new Date());
      //   }
      // }
    }

    return type == 'text' ? date : isDueDate;
  }

  formatDate(endDate, actualEnDate) {
    const differenceInMilliseconds = Math.abs(endDate - actualEnDate);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const millisecondsPerHour = 1000 * 60 * 60;

    let differenceInDays = Math.floor(
      differenceInMilliseconds / millisecondsPerDay
    );
    let differenceInHours = Math.floor(
      (differenceInMilliseconds % millisecondsPerDay) / millisecondsPerHour
    );
    let rtrn = '';
    // Kiểm tra nếu nhỏ hơn 1 ngày thì lấy theo giờ
    if (differenceInMilliseconds < millisecondsPerDay) {
      rtrn = `${differenceInHours} giờ`;
    } else {
      rtrn = `${differenceInDays} ngày ${differenceInHours} giờ`;
      if (differenceInHours === 0) {
        rtrn = `${differenceInDays} ngày`;
      }
    }

    return rtrn;
  }
}
