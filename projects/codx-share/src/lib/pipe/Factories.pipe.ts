import { Pipe, PipeTransform } from '@angular/core';
import { ApiHttpService, CacheService } from 'codx-core';
import { ColorPipe } from './Color.pipe';
import { DatetimePipe } from './datetime.pipe';
import { DefaultPipe } from './Default.pipe';
import { NumberPipe } from './Number.pipe';
import { UpperPipe } from './Upper.pipe';

@Pipe({
  name: 'avtFile'
})
export class FileImage implements PipeTransform {
    systemSetting: any;
    constructor(private cache: CacheService, private api: ApiHttpService) { 
        //this.systemSetting = cache.sy
    }
  transform(value: string, refID = '') {

    this.api.callSv('SYS',"AD","SystemSettingsBusiness","GetCache").subscribe(res=>{
      if(res){
        var setting: any = res;
        var baseCurr = setting.dbaseCurr,
            costPrice = setting.DCostPrice,
            exchRate = setting.DExchRate,
            sourceCurr = setting.DSourceCurr,
            salesPrice = setting.DSalesPrice,
            percent = setting.DPercent,
            percent2 = setting.DPercent2,
            quantity = setting.DQuantity,
            factor = setting.DFactor,
            factor2 = setting.DFactor2,
            settledQty = setting.DSettledQty,
            cwQty = setting.DCatchWeight,
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
                
                 var datePipe = new DatetimePipe();
                 var a = datePipe.formatDateTime(dataFormat, "");
                 break;
             case 'B':
                 var numberPipe = new NumberPipe();
                 var a = numberPipe.formatNumber(baseCurr, dataFormat, 0, refID);
                 break
             case 'C':
                 var numberPipe = new NumberPipe();
                 var a = numberPipe.formatNumber(costPrice, dataFormat, 0, refID);
                 break
             case 'S':
                 var numberPipe = new NumberPipe();
                 var a = numberPipe.formatNumber(sourceCurr, dataFormat, 0, refID);
                 break
             case 'U':
                 var numberPipe = new NumberPipe();
                 var a = numberPipe.formatNumber(salesPrice, dataFormat, 0, refID);
                 break;
             case 'E':
                 var numberPipe = new NumberPipe();
                 var a = numberPipe.formatNumber(exchRate, dataFormat, 0, refID);
                 break;
             case 'I':
              var numberPipe = new NumberPipe();
              var a = numberPipe.formatNumber(0, dataFormat, 0, refID);
                 break;
             case 'P':
              var numberPipe = new NumberPipe();
              var a = numberPipe.formatNumber(percent, dataFormat, 0, refID);
                 break;
             case 'P2':
              var numberPipe = new NumberPipe();
              var a = numberPipe.formatNumber(percent2, dataFormat, 0, refID);
                 break;
             case 'Q':
              var numberPipe = new NumberPipe();
              var a = numberPipe.formatNumber(quantity, dataFormat, 0, refID);
                 break;
             case 'CW':
              var numberPipe = new NumberPipe();
              var a = numberPipe.formatNumber(cwQty, dataFormat, 0, refID);
                 break;
             case 'R':
              var numberPipe = new NumberPipe();
              var a = numberPipe.formatNumber(factor, dataFormat, 0, refID);
             case 'R2':
              var numberPipe = new NumberPipe();
              var a = numberPipe.formatNumber(factor2, dataFormat, 0, refID);
             case 'SQ':
              var numberPipe = new NumberPipe();
              var a = numberPipe.formatNumber(settledQty, dataFormat, 0, refID);
                 break;
             case 'u':
              var upperPipe = new UpperPipe();
              var a = upperPipe.formatUpper(dataFormat, "");
             case 'O':
              var colorPipe = new ColorPipe();
              var a = colorPipe.formatColor(dataFormat, '0');
                 break;
             default:
                 switch (value) {
                     case 'DateTime':
                      var datePipe = new DatetimePipe();
                      var a = datePipe.formatDateTime(dataFormat,"");
                         break;
                     case 'Number':
                      var datePipe = new DatetimePipe();
                      var a = datePipe.formatDateTime(0, dataFormat);
                         break;
                     default:
                      var defaultPipe = new DefaultPipe();
                      var a = defaultPipe.formatDefault();
                         break;
                 }
                 break;
         }

         /* if (sureERP.FormatFactory[key])
             return sureERP.FormatFactory[key]; */

         return a; /* new formatDefault(); */
      }

    })

    function formatFactories(dataFormat, type = 'String', refID = '') {
 
        // // var baseCurr = SureERP.SettingCache.SystemSetting.DBaseCurr,
        // //     costPrice = SureERP.SettingCache.SystemSetting.DCostPrice,
        // //     exchRate = SureERP.SettingCache.SystemSetting.DExchRate,
        // //     sourceCurr = SureERP.SettingCache.SystemSetting.DSourceCurr,
        // //     salesPrice = SureERP.SettingCache.SystemSetting.DSalesPrice,
        // //     percent = SureERP.SettingCache.SystemSetting.DPercent,
        // //     percent2 = SureERP.SettingCache.SystemSetting.DPercent2,
        // //     quantity = SureERP.SettingCache.SystemSetting.DQuantity,
        // //     factor = SureERP.SettingCache.SystemSetting.DFactor,
        // //     factor2 = SureERP.SettingCache.SystemSetting.DFactor2,
        // //     settledQty = SureERP.SettingCache.SystemSetting.DSettledQty,
        // //     cwQty = SureERP.SettingCache.SystemSetting.DCatchWeight,
        // //     dataFormat = dataFormat + '';

        var key = dataFormat;
        // switch (key) {
        //     case 'd':
        //     case 'D':
        //     case 'f':
        //     case 'F':
        //     case 'g':
        //     case 'G':
        //     case 't':
        //     case 'T':
                
        //         var datePipe = new DatetimePipe();
        //         var a = datePipe.formatDateTime(dataFormat, "");
        //         break;
        //     case 'B':
        //         key = key + "|" + baseCurr + "|" + refID;
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(baseCurr, dataFormat, 0, refID);
        //         break
        //     case 'C':
        //         key = key + "|" + costPrice + "|" + refID;
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(costPrice, dataFormat, 0, refID);
        //         break
        //     case 'S':
        //         key = key + "|" + sourceCurr + "|" + refID;
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(sourceCurr, dataFormat, 0, refID);
        //         break
        //     case 'U':
        //         key = key + "|" + salesPrice + "|" + refID;
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(salesPrice, dataFormat, 0, refID);
        //         break;
        //     case 'E':
        //         key = key + "|" + exchRate;
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(exchRate, dataFormat);
        //         break;
        //     case 'I':
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(0, dataFormat);
        //         break;
        //     case 'P':
        //         key = key + "|" + percent;
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(percent, dataFormat);
        //         break;
        //     case 'P2':
        //         key = key + "|" + percent2;
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(percent2, dataFormat);
        //         break;
        //     case 'Q':
        //         key = key + "|" + quantity + "|" + refID;
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(quantity, dataFormat);
        //         break;
        //     case 'CW':
        //         key = key + "|" + cwQty + "|" + refID;
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(cwQty, dataFormat);
        //         break;
        //     case 'R':
        //         key = key + "|" + factor;
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(factor, dataFormat);
        //     case 'R2':
        //         key = key + "|" + factor2;
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(factor2, dataFormat);
        //     case 'SQ':
        //         key = key + "|" + settledQty;
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatNumber(settledQty, dataFormat);
        //         break;
        //     case 'u':
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatUpper(dataFormat, '');
        //     case 'O':
        //         if (sureERP.FormatFactory[key]) break;
        //         sureERP.FormatFactory[key] = new formatColor(dataFormat, '0');
        //         break;
        //     default:
        //         switch (type) {
        //             case 'DateTime':
        //                 if (sureERP.FormatFactory[key]) break;
        //                 sureERP.FormatFactory[key] = new formatDateTime(dataFormat);
        //                 break;
        //             case 'Number':
        //                 if (sureERP.FormatFactory[key]) break;
        //                 sureERP.FormatFactory[key] = new formatDateTime(0, dataFormat);
        //                 break;
        //             default:
        //                 sureERP.FormatFactory[key] = new formatDefault();
        //                 break;
        //         }
        //         break;
        // }

        // if (sureERP.FormatFactory[key])
        //     return sureERP.FormatFactory[key];

        // return new formatDefault();
    }

  }
}