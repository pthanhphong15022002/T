import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import 'moment/src/locale/vi';

@Pipe({
  name: 'fmCL'
})
export class ColorPipe implements PipeTransform {
    getValue: (value: any) => string;
    getString: (value: any) => any;
    options: { dataFormat: any; defaultValue: any; formatFullStr: any; formatStr: any; type: string; };
    formatColor(dataFormat, defaultValue) {
        this.options = {
            dataFormat: dataFormat || '',
            defaultValue: defaultValue || '',
            formatFullStr: dataFormat,
            formatStr: dataFormat,
            type: 'C'
        }

        this.getValue = function (value) {
            if (!value)
                return '#000000';

            return ("#" + parseInt(value + "")/* .ToString('X6') */);
        }

        this.getString = function (value) {
            return this.getValue(value)
        }
      
    }
    transform(value: string) {
        throw new Error('Method not implemented.');
        var formatColor = function (dataFormat, defaultValue) {
           
        }
    }

}
