import { Pipe, PipeTransform } from '@angular/core';
import { CacheService, UrlUtil, Util } from 'codx-core';
import { map, Observable } from 'rxjs';

@Pipe({
  name: 'fTextValue'
})
export class TextValuePipe implements PipeTransform {
  constructor(
    private cache:CacheService
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
              if(vll){
                obj[element["FieldName"]]=vll.text;
              }
            });
          }
          else
          {
            obj[element["FieldName"]]= element["FieldValue"];
          }
        });
        _strMssg = UrlUtil.modifiedUrlByObj(_strMssg, obj,'');
      }
      return _strMssg;
    })); 
  }
}