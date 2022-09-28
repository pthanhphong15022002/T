import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from './app-config';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService extends AppConfig {

  constructor(private http: HttpClient) {
    super();
  }

  load() {
    return this.http.get<AppConfig>('appconfig.json').pipe(map(res => {
      this.apiUrl = res.apiUrl;
      environment.apiUrl = res.apiUrl;
      environment.shopping = res.shopping;
      environment.pdfUrl = res.pdfUrl;
      environment.librOfficeUrl = res.librOfficeUrl;
      environment.urlUpload = res.urlUpload;
      environment.urlTenant = res.urlTenant;
      environment.urlThumbnail = res.urlThumbnail;
      environment.urlFile = res.urlFile;
      environment.appName = res.appName;
    }));
  }
}
