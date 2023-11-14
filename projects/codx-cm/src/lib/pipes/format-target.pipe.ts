import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTarget'
})
export class FormatTargetPipe implements PipeTransform {

  transform(num) {
    const roundedNum = parseFloat(num.toFixed(2));

    const formattedNum = roundedNum.toString().replace(/(\.\d*?)0+$/, '$1');

    return formattedNum;
  }

}
