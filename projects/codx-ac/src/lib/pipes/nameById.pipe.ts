import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameById',
  standalone: true,
})
export class NameByIdPipe implements PipeTransform {
  /** 
   * @param data An array of objects with a property value you want to extract from.
   * @param valueMember Name of a key property like RecId, StudentId.
   * @param displayMember Name of the property that you want to get its value from the data.
   * @param value Value of the key property.
   */
  transform(data: any[], valueMember: string, displayMember: string, value: string) {
    return data?.find((d) => d[valueMember] === value)?.[displayMember];
  }
}
