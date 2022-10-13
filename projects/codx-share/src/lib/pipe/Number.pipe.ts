import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import 'moment/src/locale/vi';

@Pipe({
  name: 'fmNB'
})
export class NumberPipe implements PipeTransform {
    
    
    getValue: (value: any) => number;
    getString: (value: any) => any;
    options: { dataFormat: any; defaultValue: any; formatFullStr: string; formatStr: string; zeroAfterPoint: any; UMID: any; round: number; type: string; };
    formatNumber(zeroAfterPoint, dataFormat, defaultValue, refID) {
        function createString(preFormatString, zeroAfterPoint) {
            var val = preFormatString;

            if (zeroAfterPoint < 0)
                zeroAfterPoint = 0;

            if (zeroAfterPoint > 6)
                zeroAfterPoint = 6;
            if (preFormatString && zeroAfterPoint)
                val = preFormatString + zeroAfterPoint;

            return val;
        };

        function createFullString(value) {
            return "{0:" + value + "}";
        };

        this.options = {
            dataFormat: dataFormat || '',
            defaultValue: defaultValue || '',
            formatFullStr: '',
            formatStr: '',
            zeroAfterPoint: zeroAfterPoint || 6,
            UMID: refID,
            round: 6,
            type: 'N'
        }
        switch (this.options.dataFormat) {
            case 'B':
            case 'C':
            case 'S':
            case 'U':
                this.options.formatStr = createString('c', zeroAfterPoint);
                this.options.formatFullStr = createFullString(this.options.formatStr);
                break;
            case 'P':
            case 'P2':
                this.options.formatStr = createString('p', zeroAfterPoint);
                this.options.formatFullStr = createFullString(this.options.formatStr);
                break;
            case 'E':
            case 'I':
            case 'Q':
            case 'CW':
            case 'R':
            case 'R2':
            case 'SQ':
                this.options.formatStr = createString('n', zeroAfterPoint);
                this.options.formatFullStr = createFullString(this.options.formatStr);
                break;
        }

        this.getValue = function (value) {
            return parseFloat(value);
        }

        this.getString = function (value) {
            if (!value)
                return "0";
            return this.options.formatFullStr /* kendo.toString(value, this.options.formatFullStr) */;
        }
      
    }
    transform(value: string, type: string = "dmy", showtime: boolean = false,) {
        throw new Error('Method not implemented.');
        var formatNumber = function (zeroAfterPoint, dataFormat, defaultValue, refID) {
            
        }
    }
}
