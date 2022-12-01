import { Pipe, PipeTransform } from '@angular/core';
import { environment } from "src/environments/environment";
import 'lodash';
declare var _;
@Pipe({
  name: 'displayname'
})
export class DisplayNameCardPipe implements PipeTransform {

  transform(value: string, data: any, count: number): any {
    // if (count == 1) {
    //   var name = JSON.parse(data);
    //   return name[0];
    //   // let str = "";
    //   // for (let i = 0; i < count; i++) {
    //   //   str += `${name[i]}, `;
    //   // }
    //   // if (str.lastIndexOf(',') === (str.length - 1)) {
    //   //   str = str.substring(0, str.length - 1);
    //   // }
    //   // return str;
    // }
    // else {
    //   var lstType = environment.jsonType;
    //   var name = _.filter(lstType, function (o) {
    //     return o.value == value;
    //   })
    //   return `Gửi đến ${count || ''} ${name[0]?.name}`;
    // }
  }

}
