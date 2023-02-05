import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import { CacheService, UrlUtil, Util } from 'codx-core';
import moment from 'moment';
import { map, Observable } from 'rxjs';

@Pipe({
  name: 'fTextValue'
})
export class TextValuePipe implements PipeTransform {
  constructor(
    private cache:CacheService,
    private dt:ChangeDetectorRef
  )
  {}
  transform(value: string,mssgCode:string) : Observable<any>{
    return this.cache.message(mssgCode).pipe(map(res => {
      let _strMssg = res.defaultName ;
      if(value)
      {
        let _param = JSON.parse(value);
        let _obj:any = {};
        _param.forEach(element => {
          let _value = element["FieldValue"];
          if(element["RefType"]){
              let _datas = JSON.parse(element["Datas"]);
              let _vll = _datas.find(x => x["Value"] == _value);
              if(_vll){
                _value = _vll["Text"];
              }
          }
          else if(element["DataType"] == "DateTime")
          {
            if(element["DataFormat"]){
              _value = moment(_value).format(element["DataFormat"]);
            }
            _value = moment(_value).format("DD/MM/YYYY");
          }
          _obj[element["FieldName"]] = _value;
        });
        return  UrlUtil.modifiedByObj(_strMssg,_obj);
      }
      return value;
    })); 
  }
}