import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'type',
})
export class InputTypePipe implements PipeTransform {
  transform(setting: any): string {
    if (!setting) return 'text';
    var controlType = setting.controlType,
      dataType = setting.dataType,
      dataFormat = setting.dataFormat,
      referedType = setting.referedType;
    var type = 'text';
    if (!controlType) type = 'text';
    else {
      if (controlType.toLowerCase() == 'textbox') {
        type = 'text';
        if (dataType == 'Decimal' || dataType == 'Short' || dataType == 'Int') {
          type = 'number';
        } else if (dataFormat.toLowerCase().includes('ed')) {
          type = 'textarea';
        }
      } else if (controlType.toLowerCase() == 'maskbox') {
        type = 'datetime';
      } else if (controlType.toLowerCase() == 'combobox') {
        type = controlType || type;
        if (referedType == '2') type = 'valuelist';
      } else {
        type = controlType;
      }
    }
    return type;
  }
}
