import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'addProcessDefaultPrice'})
export class AddProcessDefaultPrice implements PipeTransform {
  transform(item: any, ...args: any[]): any {
    var result = "";
    if(!args[0]) return result;
    if(args[0].toLowerCase() == 'textbox')
    {
      result = "text";
      if(args[1] == 'Decimal' || args[1] == "Short" || args[1] == "Int") result = "number";
      else if(args[2] && args[2].toLowerCase().includes('ed')) result = "textarea";
    }
    else if(args[0].toLowerCase() == 'maskbox') result = 'datetime';
    else if(args[0].toLowerCase() == 'combobox') {
     if(args[3] == "2") result = "valuelist";
     else result = args[0].toLowerCase();
    }
    else result = args[0].toLowerCase();
    return result;
  }
}