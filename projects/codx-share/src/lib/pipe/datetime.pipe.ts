import { formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import 'moment/src/locale/vi';
import internal from 'stream';

@Pipe({
  name: 'fmDT'
})
export class DatetimePipe implements PipeTransform {
    transform(value: any, ...args: any[]) {
        throw new Error('Method not implemented.');
    }

    dataFormat: any;
    options: { dataFormat: any, defaultValue: any, formatFullStr: string, formatStr: any, type: string, };
    value: any;
    //getString: (value: any) => any;
    kendo: any;
    getValue: (value: any) => any;
    getString: (value: any) => any;
    getDateTime: (value: any, dataFormat: any) => Date;
    
//------------------------------------

/* createString(preFormatString, zeroAfterPoint) {
    var val = preFormatString;

    if (zeroAfterPoint < 0)
        zeroAfterPoint = 0;

    if (zeroAfterPoint > 6)
        zeroAfterPoint = 6;
    if (preFormatString && zeroAfterPoint)
        val = preFormatString + zeroAfterPoint;

    return val;
};
createFullString(value) {
    return "{0:" + value + "}";
};
 */

/* this.options = {
    dataFormat: dataFormat || '',
    defaultValue: defaultValue || '',
    formatFullStr: '',
    formatStr: '',
    zeroAfterPoint: zeroAfterPoint || 6,
    UMID: refID,
    round: 6,
    type: 'N'
} */

/* switch (this.options.dataFormat) {
    case 'B':
    case 'C':
    case 'S':
    case 'U':
        options.formatStr = createString('c', zeroAfterPoint);
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
} */



/* getValue(value) {
    return parseFloat(value);
}

getString(value) {
    if (!value)
        return "0";

    return kendo.toString(value, this.options.formatFullStr);
}

sureERP.FormatNumber = formatNumber; */

/* var formatColor = function (dataFormat, defaultValue) {
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

        return ("#" + parseInt(value + "").ToString('X6'));
    }

    this.getString = function (value) {
        return getValue(value)
    }
}
sureERP.FormatColor = formatColor; */

/* var formatUpper = function (dataFormat, defaultValue) {
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
        return getValue(value);
    }
}
sureERP.FormatUpper = formatUpper; */




/* var formatDefault = function (defaultValue) {
    this.options = {
        dataFormat: '',
        defaultValue: defaultValue || '',
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
sureERP.FormatDefault = formatDefault; */

//------------------------------------

  formatDateTime(dataFormat, defaultValue) {
    this.options = {
        dataFormat: dataFormat || '',
        defaultValue: defaultValue || new Date(),
        formatFullStr: "{0:" + dataFormat + "}",
        formatStr: dataFormat || '',
        type: dataFormat === 'd' || dataFormat === 'D' ? 'D' : dataFormat === 't' || dataFormat === 'T' ? 'T' : dataFormat === 'f' || dataFormat === 'F' || dataFormat === 'g' || dataFormat === 'G' ? 'DT' : 'D'
    };
    

    this.getValue = function(value) {
        if (!this.value) return this.options.defaultValue;

        return this.getDateTime(this.value, this.options.dataFormat);
    }

    this.getString = function (value){
        if (!value)
            return this.options.defaultValue + "";

        return this.kendo.toString(new Date(value), this.options.dataFormat);
    }

    this.getDateTime = function (value, dataFormat){
        if (!this.value) return new Date();

        var cultName = this.kendo.cultures.current.name,
            cultDateTime = this.kendo.cultures.current.calendar.patterns[dataFormat],
            dateSplit = this.kendo.cultures.current.calendar['/'] || '/',
            timeSplit = this.kendo.cultures.current.calendar[':'],
            stringMatch = /[d,D,m,M,y,Y,h,H,s]+/g,
            timeType = 0, //0:AM - 12:PM
            dateTime = new Date(),
            nYear = dateTime.getFullYear(), nMonth = dateTime.getMonth(), nDay = dateTime.getDate(),
            nHour = 0, nMinute = 0, nSecond = 0;

        function setDay(value, sLength) {
            var tmp = value.substring(0, sLength),
                last = new Date(dateTime.getFullYear(), dateTime.getMonth() + 1, 0).getDate();

            value = value.substring(sLength);
            var num = parseInt(tmp);

            if (num < last)
                nDay = num;

            return value;
        }
        function setMonth(value, sLength) {
            var tmp = value.substring(0, sLength),
                last = 13;

            value = value.substring(sLength);
            var num = parseInt(tmp);

            if (num < last)
                nMonth = num - 1;

            return value;
        }

        function setYear(value, sLength) {
            var tmp = value.substring(0, sLength),
               tmpYear = dateTime.getFullYear();

            value = value.substring(sLength);
            nYear = parseInt(tmp);

            if (nYear < 9)
                nYear = parseInt((tmpYear / 10) +"") * 10 + nYear;
            else if (nYear < 99)
                nYear = parseInt((tmpYear / 100) +"") * 100 + nYear;
            else if (nYear < 999)
                nYear = parseInt((tmpYear / 1000) +"") * 1000 + nYear;

            return value;
        }


        function setHour(value, sLength) {
            if (typeof value === 'string' && value.length > 1) {
                var tmp = value.substring(0, sLength);
                nHour = parseInt(tmp);

                if (nHour + timeType < 24) {
                    value = value.substring(sLength);
                }
                else {
                    nHour = parseInt((nHour / 10)+"") + timeType;
                    value = value.substring(sLength - 1);
                }
            }
            else {
                nHour = parseInt(value) + timeType;
                value = '';
            }

            return value;
        }


        function setMinute(value, sLength) {
            if (typeof value === 'string' && value.length > 1) {
                var tmp = value.substring(0, sLength);
                nMinute = parseInt(tmp);

                if (nMinute < 60) {
                    value = value.substring(sLength);
                }
                else {
                    nMinute = parseInt((nMinute / 10)+"");
                    value = value.substring(sLength - 1);
                }
            }
            else {
                nMinute = parseInt(value);
                value = '';
            }
            return value;
        }

        function setSecond(value, sLength) {
            if (typeof value === 'string' && value.length > 1) {
                var tmp = value.substring(0, sLength);
                nSecond = parseInt(tmp);

                if (nSecond > 60)
                    nSecond = parseInt((nSecond / 10)+"");
            }
            else
                nSecond = parseInt(value);

            return value;
        }
        function getFormat(format, value) {
            switch (format) {
                case 'd':
                case 'dd':
                case 'ddd':
                case 'dddd':
                    value = setDay(value, format.length);
                    break;
                case 'MM':
                case 'MMMM':
                    value = setMonth(value, format.length);
                    break;
                case 'yy':
                case 'yyyy':
                    value = setYear(value, format.length);
                    break;
                case 'h':
                case 'hh':
                case 'H':
                case 'HH':
                    value = setHour(value, format.length);
                    break;
                case 'mm':
                    value = setMinute(value, format.length);
                    break;
                case 'ss':
                    value = setSecond(value, format.length);
                    break;
            }
            return value;
        }
        if (typeof this.value === 'string' && this.value != '') {
            var arrayFormat = cultDateTime.match(stringMatch);

            if (arrayFormat.length == 0) return null;

            if (this.value.includes('CH') || this.value.includes('PM') || this.value.includes('ch') || this.value.includes('pm'))
                timeType = 12;

            this.value = this.value.match(/\d/g);
            if (this.value == null) return null;
            this.value = this.value.join('');

            if (arrayFormat.length > 0)
            this.value = getFormat(arrayFormat[0], this.value);

            if (this.value && arrayFormat.length > 1)
            this.value = getFormat(arrayFormat[1], this.value);

            if (this.value && arrayFormat.length > 2)
            this.value = getFormat(arrayFormat[2], this.value);

            if (this.value && arrayFormat.length > 3)
            this.value = getFormat(arrayFormat[3], this.value);

            if (this.value && arrayFormat.length > 4)
            this.value = getFormat(arrayFormat[4], this.value);

            if (this.value && arrayFormat.length > 5)
            this.value = getFormat(arrayFormat[5], this.value);
        }

        return new Date(nYear, nMonth, nDay, nHour, nMinute, nSecond);
    }
    
}

/* getValue(value: any) {
    throw new Error('Function not implemented.');
}

getDateTime(value: any, dataFormat: any) {
    throw new Error('Function not implemented.');
} */



//=================================
}

/* function formatFactories(dataFormat, type = 'String', refID = '') {
    var baseCurr = SureERP.SettingCache.SystemSetting.DBaseCurr,
        costPrice = SureERP.SettingCache.SystemSetting.DCostPrice,
        exchRate = SureERP.SettingCache.SystemSetting.DExchRate,
        sourceCurr = SureERP.SettingCache.SystemSetting.DSourceCurr,
        salesPrice = SureERP.SettingCache.SystemSetting.DSalesPrice,
        percent = SureERP.SettingCache.SystemSetting.DPercent,
        percent2 = SureERP.SettingCache.SystemSetting.DPercent2,
        quantity = SureERP.SettingCache.SystemSetting.DQuantity,
        factor = SureERP.SettingCache.SystemSetting.DFactor,
        factor2 = SureERP.SettingCache.SystemSetting.DFactor2,
        settledQty = SureERP.SettingCache.SystemSetting.DSettledQty,
        cwQty = SureERP.SettingCache.SystemSetting.DCatchWeight,
        dataFormat = dataFormat + '';

    var key = dataFormat;
    switch (key) {
        case 'd':
        case 'D':
        case 'f':
        case 'F':
        case 'g':
        case 'G':
        case 't':
        case 'T':
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatDateTime(dataFormat);
            break;
        case 'B':
            key = key + "|" + baseCurr + "|" + refID;
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(baseCurr, dataFormat, 0, refID);
            break
        case 'C':
            key = key + "|" + costPrice + "|" + refID;
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(costPrice, dataFormat, 0, refID);
            break
        case 'S':
            key = key + "|" + sourceCurr + "|" + refID;
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(sourceCurr, dataFormat, 0, refID);
            break
        case 'U':
            key = key + "|" + salesPrice + "|" + refID;
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(salesPrice, dataFormat, 0, refID);
            break;
        case 'E':
            key = key + "|" + exchRate;
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(exchRate, dataFormat);
            break;
        case 'I':
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(0, dataFormat);
            break;
        case 'P':
            key = key + "|" + percent;
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(percent, dataFormat);
            break;
        case 'P2':
            key = key + "|" + percent2;
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(percent2, dataFormat);
            break;
        case 'Q':
            key = key + "|" + quantity + "|" + refID;
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(quantity, dataFormat);
            break;
        case 'CW':
            key = key + "|" + cwQty + "|" + refID;
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(cwQty, dataFormat);
            break;
        case 'R':
            key = key + "|" + factor;
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(factor, dataFormat);
        case 'R2':
            key = key + "|" + factor2;
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(factor2, dataFormat);
        case 'SQ':
            key = key + "|" + settledQty;
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatNumber(settledQty, dataFormat);
            break;
        case 'u':
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatUpper(dataFormat, '');
        case 'O':
            if (sureERP.FormatFactory[key]) break;
            sureERP.FormatFactory[key] = new formatColor(dataFormat, '0');
            break;
        default:
            switch (type) {
                case 'DateTime':
                    if (sureERP.FormatFactory[key]) break;
                    sureERP.FormatFactory[key] = new formatDateTime(dataFormat);
                    break;
                case 'Number':
                    if (sureERP.FormatFactory[key]) break;
                    sureERP.FormatFactory[key] = new formatDateTime(0, dataFormat);
                    break;
                default:
                    sureERP.FormatFactory[key] = new formatDefault();
                    break;
            }
            break;
    }

    if (sureERP.FormatFactory[key])
        return sureERP.FormatFactory[key];

    return new formatDefault();
}



function createString(arg0: string, zeroAfterPoint: any): any {
throw new Error('Function not implemented.');
}

function createFullString(formatStr: any): any {
throw new Error('Function not implemented.');
}

function getValue(value: any) {
throw new Error('Function not implemented.');
}
 */




