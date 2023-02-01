import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dJson'
})
export class DisplayValue implements PipeTransform {
  
  transform(value: string): any[] {
    let isJson = this.isJsonString(value);
    let _data = [];
    if(isJson)
    {
      _data = JSON.parse(value);
      _data.forEach(e => {
        if ('ObjectID' in e){
          e['objectID'] = e['ObjectID'];
        }
        if ('ObjectName' in e){
          e['objectName'] = e['ObjectName'];
        }
       });  
    }
    return _data; 
  }


   isJsonString(str):boolean {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }
}