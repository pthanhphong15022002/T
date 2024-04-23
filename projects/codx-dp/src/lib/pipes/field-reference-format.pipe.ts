import { Pipe, PipeTransform } from '@angular/core';
import { of } from 'rxjs';

@Pipe({
  name: 'fieldReferenceFormat'
})
export class FieldReferenceFormatPipe implements PipeTransform {

  transform(value: any, fields: any[], fiellNameView: string): any {
    let field = fields.find(x => x?.recID == value);
    if (!field) return of('');
    return of(field[fiellNameView]);
  }

}
