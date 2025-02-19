import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@microsoft/signalr';
import {
  NotificationsService,
  CallFuncService,
  AuthStore,
  TenantStore,
  AuthService,
  Util,
  ApiHttpService,
  UrlUtil,
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
    private deviceInfo: AngularDeviceInformationService,
    private notificationsService: NotificationsService
  ) {
    let dInfo = this.deviceInfo.getDeviceInfo();
    
    this.loginDevice = {
      name: dInfo.browser,
      os: dInfo.os + ' ' + dInfo.osVersion,
      id: this.getCodxId(),
      imei: null,
      trust: false,
      tenantID: '',
    };
  }
  returnUrl: string;
  iParams: string;
  loginDevice: Device;
  session: string;
  onInit() {}
  // login(objData) {
  //   if (objData.login2FA != '') {
  //     let lg2FADialog = this.callfc.openForm(
  //       Login2FAComponent,
  //       '',
  //       400,
  //       600,
  //       '',
  //       objData
  //     );
  //     lg2FADialog.closed.subscribe((lg2FAEvt) => {
  //       console.log('close popup ', lg2FAEvt);
  //       if (lg2FAEvt.event.data.error) return;
  //       this.authService.setLogin(objData.data.data);
  //       this.loginAfter(lg2FAEvt.event.data);

  //       // this.loginAfter(lg2FAEvt.event.data);
  //     });
  //   } else {
  //     this.authService.setLogin(objData.data.data);
  //     this.loginAfter(objData.data);
  //   }
  // }

  loginAfter(data: any, trust = false) {
    if (!data.error) {
      const user = data.data;
      this.loginDevice.loginType = data.data.extends.LoginType ?? this.loginDevice.loginType;
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
        true,
      ])
      .subscribe((res: any) => {
        if (!res.error) {
          const user = res.msgBodyData[0];
          this.loginDevice.tenantID = tn;
          let trust2FA = user?.extends?.Trust2FA;
          let hideTrustDevice = user?.extends?.HideTrustDevice;
          
          if (!trust2FA) {
            let objData = {
              data: user.email,
              login2FA: user?.extends?.TwoFA,
              hubConnectionID: '',
              //loginDevice: this.loginDevice,
              hideTrustDevice,
            };

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
            this.authService.setLogin(user);
            this.loginAfter({ data: user });
          }
        }
        this.notificationsService.notifyCode(res.error?.errorCode);
        return false;
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

  getCodxId(){
    var k='_mc_codx_id';
    var id = localStorage.getItem(k);
    if(!id)
    {
      id= Util.uid();
      localStorage.setItem(k, id);
    }

    return id;
  }
}