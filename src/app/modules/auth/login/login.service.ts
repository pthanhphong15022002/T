import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@microsoft/signalr';
import {
  NotificationsService,
  CallFuncService,
  AuthStore,
  TenantStore,
  AuthService,
  UrlUtil,
  ApiHttpService,
} from 'codx-core';
import { SignalRService } from 'projects/codx-share/src/lib/layout/drawers/chat/services/signalr.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { environment } from 'src/environments/environment';
import { Login2FAComponent } from './login2-fa/login2-fa.component';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private callfc: CallFuncService,
    private authService: AuthService,
    private signalRService: SignalRService,
    private navRouter: Router,
    private shareService: CodxShareService,
    private api: ApiHttpService
  ) {}
  returnUrl: string;
  iParams: string;

  onInit() {}
  login(objData) {
    if (objData.login2FA != '') {
      let lg2FADialog = this.callfc.openForm(
        Login2FAComponent,
        '',
        400,
        600,
        '',
        objData
      );
      lg2FADialog.closed.subscribe((lg2FAEvt) => {
        console.log('close popup ', lg2FAEvt);
        if (lg2FAEvt.event.data.error) return;
        this.authService.setLogin(objData.data.data);
        this.loginAfter(lg2FAEvt.event.data);

        // this.loginAfter(lg2FAEvt.event.data);
      });
    } else {
      this.authService.setLogin(objData.data.data);
      this.loginAfter(objData.data);
    }
  }

  loginAfter(data: any) {
    if (!data.error) {
      const user = data.data;
      if (this.signalRService.logOut) {
        this.signalRService.createConnection();
      }
      this.returnUrl = UrlUtil.getUrl('returnUrl') || '';
      if (this.returnUrl) {
        this.returnUrl = decodeURIComponent(this.returnUrl);
      }

      if (
        this.returnUrl.indexOf('http://') == 0 ||
        this.returnUrl.indexOf('https://') == 0
      ) {
        this.iParams = UrlUtil.getUrl('i') || '';

        if (this.iParams.toLocaleLowerCase() == 'hcs') {
          this.shareService.redirect(this.iParams, this.returnUrl);
        } else window.location.href = this.returnUrl;
      } else {
        if (this.returnUrl.indexOf(user.tenant) > 0)
          return this.navRouter.navigate([`${this.returnUrl}`]);
        else if (environment.saas == 1) {
          if (!user.tenant) return this.navRouter.navigate(['/tenants']);
          else
            return this.navRouter.navigate([
              `${this.returnUrl ? this.returnUrl : user.tenant}`,
            ]);
        }
        window.location.href = this.returnUrl ? this.returnUrl : user.tenant;
      }
    } else {
      if (data.error.errorCode === 'AD027')
        return this.navRouter.navigate(['/']);
      // this.notificationsService.notify(data.error.errorMessage);
    }
    return false;
  }

  getUserLoginSetting(email: string) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'GetChangePassSettingAsync',
      email
    );
  }

  checkTOTP() {
    return this.api.execSv<string>(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'CheckTOTPAsync',
      []
    );
  }
}
