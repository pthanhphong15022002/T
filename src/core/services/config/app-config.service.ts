import { TenantStore, Util } from 'codx-core';
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
    return this.http.get<AppConfig>('assets/cfg/_.cf?_=' + Util.uid()).pipe(
      map((res) => {
        environment.apiUrl = res.apiUrl;
        environment.shopping = res.shopping;
        environment.urlUpload = res.urlUpload;
        environment.bankhubUrl = res.bankhubUrl;
        (environment.isUserBankHub = res.isUserBankHub),
          (environment.appName = res.appName);
        environment.reportUrl = res.reportUrl;
        environment.office365 = res.office365;
        environment.saas = res.saas;
        environment.layout = res.layout;
        environment.asideMode = res.asideMode;
        environment.themeMode = res.themeMode;
        environment.hideFavCount = res.hideFavCount;
        environment.singleExec = res.singleExec;
        environment.asideMinimize = res.asideMinimize;
        environment.SureMeet = res.sureMeet;
        environment.lvai = res.lvai;
        environment.firebase = res.firebase;
        environment.externalLogin = res.externalLogin;
        environment.captchaKey = res.captchaKey;
        environment.captchaEnable = res.captchaEnable;
        environment.loginHCS = res.loginHCS;
        environment.multiService = res.multiService;
        environment.serviceMapping = res.serviceMapping;
        this.tenantStore.initDefault();
      })
    );
  }
}
