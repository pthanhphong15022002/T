import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, from, map, mergeMap } from 'rxjs';
import { lvFileClientAPI } from '@shared/services/lv.component';
import { environment } from 'src/environments/environment';
@Pipe({
    name: 'secure'
})
export class SecurePipe implements PipeTransform {

    constructor(
        private http: HttpClient, 
        private sanitizer: DomSanitizer,
    ) 
        { 

        }

    transform(url:any): Observable<any> | any {
        if(window.localStorage['lv-file-api-token']) return (url + "?token=" + window.localStorage['lv-file-api-token']);
        else
        {
            lvFileClientAPI.setUrl(environment.urlUpload); //"http://192.168.18.36:8011");
            var retToken = lvFileClientAPI.formPost('api/accounts/token', {
              username: 'admin/root',
              password: 'root',
            });
            
            var obj = from(retToken);
            return obj.pipe(
                map((auth) => {
                    // document.cookie = `token=${auth?.access_token};`
                    // const headers = new HttpHeaders({
                    //     'Content-Type': 'application/json',
                    //     'Authorization': `Bearer ${auth?.access_token}`
                    //   })
                   return (url + "?token=" + auth?.access_token);
                }));
        }
       
       
    }

}
