import { TenantStore } from 'codx-core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from './app-config';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService extends AppConfig {
  constructor(private http: HttpClient, private tenantStore: TenantStore) {
    super();
  }

  load() {
    return this.http.get<AppConfig>('assets/cfg/_.cf').pipe(
      map((res) => {
        environment.apiUrl = res.apiUrl;
        environment.shopping = res.shopping;
        environment.urlUpload = res.urlUpload;
        environment.appName = res.appName;
        environment.reportUrl = res.reportUrl;
        environment.office365 = res.office365;
        environment.saas = res.saas;
        environment.layoutCZ = res.layoutCZ;
        environment.themeMode = res.themeMode;
        environment.hideFavCount = res.hideFavCount;
        environment.singleExec = res.singleExec;
        environment.SureMeet = res.sureMeet;
        environment.firebase = res.firebase;
        environment.externalLogin = res.externalLogin;
        environment.captchaKey = res.captchaKey;
        environment.captchaEnable = res.captchaEnable;
        this.tenantStore.initDefault();
      })
    );
  }
}
