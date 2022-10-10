import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import 'moment/src/locale/vi';

@Pipe({
  name: 'fmDT'
})
export class DatetimePipe implements PipeTransform {

  transform(value: any, type: string = "dmy", showtime: boolean = false,textIfNull = "dd/MM/yyyy") {
    if(!value){
      return textIfNull;
    }
    let result;
    let format = "";
    switch (type.toLowerCase()) {
      case "dmy":
        format= "DD/MM/YYYY"
        if (showtime)
          format = "DD/MM/YYYY HH:mm"
        break;
      case "y":
        format = "YYYY"
        break;
    }
    result = moment(new Date(value)).format(format);
    return result;
  }

}
