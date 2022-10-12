import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fmDF'
})
export class DefaultPipe implements PipeTransform {
  defaultValue;
  options: { dataFormat: string; defaultValue: any; formatFullStr: string; formatStr: string; type: string; };
  getValue: (value: any) => any;
  getString: (value: any) => any;
  formatDefault() {
    // throw new Error('Method not implemented.');
    this.options = {
      dataFormat: '',
      defaultValue: this.defaultValue || '',
      formatFullStr: '',
      formatStr: '',
      type: ''
  }

  this.getValue = function (value) {
      return value;
  }

  this.getString = function (value) {
      return value;
  }
  }

  transform(value: string) {
    throw new Error('Method not implemented.');
    /* var formatDefault = function (defaultValue) {
      this.options = {
        dataFormat: '',
        defaultValue: this.defaultValue || '',
        formatFullStr: '',
        formatStr: '',
        type: ''
    }
  
    this.getValue = function (value) {
        return value;
    }
  
    this.getString = function (value) {
        return value;
    }
    } */
  }
}