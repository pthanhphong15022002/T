// import { Pipe, PipeTransform } from "@angular/core";
// import { Observable, of } from "rxjs";
// import 'lodash';
// import { environment } from "src/environments/environment";
// declare var _;
// const exd = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// @Pipe({ name: 'sharedControl' })
// export class SharedControlPipe implements PipeTransform {
//   data = environment.jsonType;

//   transform(value: string, key: string, count: number = 0): Observable<any> {
//     if (value && key) {
//       var obj = _.filter(this.data, function (o) {
//         return of(o.value == value);
//       });
//       var name = obj[0].name;
//       return of(this.getName(name, value, count));
//     }

//     return of("");
//   }

//   getName(name?: string, type?: string, count: number = 0) {
//     if (exd.includes(type))
//       return name;
//     else {
//       if (count == 0)
//         return name;
//       else
//         return count + ' ' + name;
//     }
//   }  
// }