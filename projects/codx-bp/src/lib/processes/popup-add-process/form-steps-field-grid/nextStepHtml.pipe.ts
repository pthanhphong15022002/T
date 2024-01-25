import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Observable, from, isObservable, mergeMap, of } from 'rxjs';
@Pipe({
  name: 'nextStepHTML'
})
export class NextStepHTMLPipe implements PipeTransform {
constructor(private sanitizer: DomSanitizer, private shareService: CodxShareService) {}

  transform(value:any, val:any,id:any,datas:any):Observable<any> {
        let data = datas.filter(x=>x.recID == id)[0];
        if(data)
        {
          let vll = this.shareService.loadValueList("VL004") as any;
          if(isObservable(vll))
          {
            var obj = from(vll);
            return obj.pipe(
              mergeMap((res:any) => {
                let name = res.datas.filter(x=>x.value == data.interval)[0].text;
                return of(this.getVll(val,data,name));
              })
            );
          }
          else
          {
            let name = vll.datas.filter(x=>x.value == data.interval)[0].text;
            return of(this.getVll(val,data,name));
          }
        }
        return of("");
    }

    getVll(val:any , data:any , name:any)
    {
      return this.sanitizer
      .bypassSecurityTrustHtml(`<div class="col-3 d-flex align-items-center"><div class="w-30px"><i class="`+val.settings.icon+`" style="color:`+val.settings.color+`"></i></div>`+data.stepName+`</div><div class="col-1 d-flex align-items-center"><i class="`+data?.settings?.icon+`" style="color:`+data?.settings?.color+`"></i><span class="mx-2">`+data.activityType+`</span></div><div class="col-4"><span>`+(data?.memo || '')+`</span></div><div class="col-2"><span>`+data?.duration+`</span><span class="mx-1">`+name+`</span></div>`);
    }
}