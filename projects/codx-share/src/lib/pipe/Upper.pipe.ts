import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fmUP'
})
export class UpperPipe implements PipeTransform {
  options: { dataFormat: any; defaultValue: any; formatFullStr: any; formatStr: any; type: string; };
  getValue: (value: any) => any;
  getString: (value: any) => any;
  formatUpper(dataFormat, defaultValue) {
    this.options = {
      dataFormat: dataFormat || '',
      defaultValue: defaultValue || '',
      formatFullStr: dataFormat,
      formatStr: dataFormat,
      type: 'U'
    }

    this.getValue = function (value) {
      if (!value) return this.options.defaultValue;
      return value.ToString().toUpperCase();
    }

    this.getString = function (value) {
      return this.getValue(value);
    }
  }

  transform(value: string) {
    throw new Error('Method not implemented.');
    var formatUpper = function (dataFormat, defaultValue) {
       
    }
  }
}