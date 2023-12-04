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
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { environment } from 'src/environments/environment';
import { Login2FAComponent } from './login2-fa/login2-fa.component';
import { SignalRService } from 'projects/codx-common/src/lib/_layout/drawers/chat/services/signalr.service';
import { AngularDeviceInformationService } from 'angular-device-information';
import { Device } from 'projects/codx-ad/src/lib/models/userLoginExtend.model';

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
    private api: ApiHttpService,
    private deviceInfo: AngularDeviceInformationService
  ) {
    let dInfo = this.deviceInfo.getDeviceInfo();
    this.loginDevice = {
      name: dInfo.browser,
      os: dInfo.os + ' ' + dInfo.osVersion,
      ip: '',
      id: null,
      imei: null,
      trust: false,
      tenantID: '',
      times: '1',
    };
  }
  returnUrl: string;
  iParams: string;
  loginDevice: Device;
  session: string;
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

  loginAfter(data: any, trust = false) {
    if (!data.error) {
      const user = data.data;
      this.loginDevice.loginType = data.data.extends.LoginType ?? '';
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
          window.location.href = this.returnUrl;
        else if (environment.saas == 1) {
          if (!user.tenant) {
            return this.getTenants(user.email).subscribe((res: any) => {
              if (res && res.length) {
                if (res.length > 1)
                  return this.navRouter.navigate(['/tenants'], {
                    queryParams: {
                      lt: this.loginDevice.loginType,
                      trust: trust,
                    },
                  });
                else this.navigate(res[0].tenantID);
              } else {
                return (window.location.href = this.returnUrl
                  ? this.returnUrl
                  : user.tenant);
              }
            });
          }
        }
        window.location.href = this.returnUrl ? this.returnUrl : user.tenant;
      }

      //Set token server file
    } else {
      if (data.error.errorCode === 'AD027')
        return this.navRouter.navigate(['/']);
    }
    return false;
  }

  navigate(tn) {
    this.api
      .call('AD', 'UsersBusiness', 'CreateUserLoginAsync', [
        tn,
        '', //userID
        '', //pw
        JSON.stringify(this.loginDevice),
      ])
      .subscribe((res: any) => {
        if (!res.error) {
          this.loginDevice.tenantID = tn;
          let trust2FA = res?.extends?.Trust2FA;
          let hideTrustDevice = res?.extends?.HideTrustDevice;
          let objData = {
            data: res,
            login2FA: res?.extends?.TwoFA,
            hubConnectionID: '',
            loginDevice: this.loginDevice,
            hideTrustDevice,
          };
          if (!trust2FA) {
            let lg2FADialog = this.callfc.openForm(
              Login2FAComponent,
              '',
              400,
              600,
              '',
              objData
            );
            lg2FADialog.closed.subscribe((lg2FAEvt) => {
              if (!lg2FAEvt.event || lg2FAEvt.event?.data?.error) return;
              this.authService.setLogin(lg2FAEvt.event.data.data);
              this.loginAfter(lg2FAEvt.event.data);
            });
          } else {
            this.authService.setLogin(res);
            this.loginAfter({ data: res });
          }
        }
        return res;
      });
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

  getTenants(email) {
    return this.api.execSv(
      'Tenant',
      'Tenant',
      'TenantsBusiness',
      'GetListDatabaseByEmailAsync',
      email
    );
  }
}
