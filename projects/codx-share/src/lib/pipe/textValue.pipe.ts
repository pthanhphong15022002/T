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
      let _strMssg = res ? res.defaultName : mssgCode;
      if(value){
        let _param = JSON.parse(value);
        let obj ={};
        _param.forEach(element => {
          if(element["RefType"]){
            this.cache.valueList(element["RefValue"]).subscribe(vll => {
              if(vll?.datas.length > 0)
              {
                let _data = vll.datas.find(x => x.value == element["FieldValue"]);
                obj[element["FieldName"]] = _data.text || element["FieldValue"];
                
              }
              else
              {
                obj[element["FieldName"]] = element["FieldValue"];
              }
              this.dt.detectChanges();
            });
          }
          else
          {
            let _value = element["FieldValue"];
            let _isDateTime = moment(_value).isValid();
            if(_isDateTime){
              obj[element["FieldName"]] = moment(_value).format("DD/MM/YYYY HH:MM");
            }
            else{
              obj[element["FieldName"]] = element["FieldValue"];
            }
            this.dt.detectChanges();
          }
        });
        _strMssg = UrlUtil.modifiedByObj(_strMssg, obj);
      }
      return _strMssg;
    })); 
  }
}