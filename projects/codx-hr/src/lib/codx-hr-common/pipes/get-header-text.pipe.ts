import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transText',
})
export class GetHeaderTextPipe implements PipeTransform {
  transform(value: string, lstFuncID: any): string {
    console.log(value);
    let funcObj = lstFuncID.filter((x) => x.functionID == value);
    let headerText = '';
    if (funcObj && funcObj?.length > 0) {
      headerText = funcObj[0].description;
    }
    return headerText;
  }
}
